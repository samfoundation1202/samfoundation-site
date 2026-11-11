<?php
// Sam Foundation site auto-deploy (runs from cron on the cPanel host every 10 minutes).
// Pulls the GitHub repo samfoundation1202/samfoundation-site, and when main has a new commit it copies
// ONLY whitelisted files (index.html and /sf/ css, js, images, video, fonts) into public_html, with a backup first.
// Each deploy sends a Telegram card through the bot's ops desk with "OK" / "Undo". "Undo" restores the backup.
// Status for the daily routine: https://samfoundation.tech/sf/site-status.json
// Nothing here can write .php, .htaccess or anything outside index.html and sf/.

error_reporting(E_ALL);
date_default_timezone_set('UTC');

$HOME = getenv('HOME') ?: dirname(__DIR__);
$CFG = [
  'repo'    => 'samfoundation1202/samfoundation-site',
  'branch'  => 'main',
  'root'    => getenv('SITE_ROOT') ?: $HOME . '/public_html',
  'state'   => getenv('SITE_STATE') ?: __DIR__,
  'ops_url' => getenv('OPS_URL') ?: 'https://samfoundation-dm-bot.onrender.com',
  'site'    => 'https://samfoundation.tech/',
  'archive' => getenv('SITE_ARCHIVE') ?: null, // tests: a local .tar.gz instead of GitHub
];
$ALLOWED = '#^(index\.html|sf/[a-z0-9][a-z0-9._/-]*\.(css|js|svg|png|jpe?g|webp|avif|gif|mp4|webm|woff2?|txt))$#';
$MAX_FILE = 15 * 1024 * 1024;

function logline($m) { global $CFG; @file_put_contents($CFG['state'] . '/deploy.log', gmdate('c') . ' ' . $m . "\n", FILE_APPEND | LOCK_EX); }
function fail($m) { logline('ERROR ' . $m); fwrite(STDERR, $m . "\n"); exit(1); }

function http($url, $opts = []) {
  $ch = curl_init($url);
  curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true, CURLOPT_TIMEOUT => 60,
    CURLOPT_USERAGENT => 'samfoundation-site-deploy']);
  if (!empty($opts['headers'])) curl_setopt($ch, CURLOPT_HTTPHEADER, $opts['headers']);
  if (isset($opts['post'])) { curl_setopt($ch, CURLOPT_POST, true); curl_setopt($ch, CURLOPT_POSTFIELDS, $opts['post']); }
  $body = curl_exec($ch);
  $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  return [$code, $body];
}

function ops($method, $path, $data = null) {
  global $CFG;
  $keyFile = $CFG['state'] . '/ops_key';
  if (!is_readable($keyFile)) return [0, null];
  $h = ['Authorization: Bearer ' . trim(file_get_contents($keyFile)), 'Content-Type: application/json'];
  [$code, $body] = http($CFG['ops_url'] . $path, $method === 'POST' ? ['headers' => $h, 'post' => json_encode($data)] : ['headers' => $h]);
  return [$code, json_decode((string) $body, true)];
}

// --- tar.gz reader (no phar needed) ---
function untar($gz) {
  $tar = @gzdecode($gz);
  if ($tar === false) fail('archive is not gzip');
  $files = []; $commit = null; $longName = null; $pax = [];
  $off = 0; $len = strlen($tar);
  while ($off + 512 <= $len) {
    $h = substr($tar, $off, 512);
    if (trim($h, "\0") === '') break;
    $name = rtrim(substr($h, 0, 100), "\0");
    $size = octdec(trim(substr($h, 124, 12), "\0 "));
    $type = $h[156];
    $prefix = rtrim(substr($h, 345, 155), "\0");
    $data = substr($tar, $off + 512, $size);
    $off += 512 + (int) (ceil($size / 512) * 512);
    if ($type === 'g' || $type === 'x') {
      if (preg_match('/\d+ comment=([0-9a-f]{40})/', $data, $m)) $commit = $m[1];
      if ($type === 'x' && preg_match('/\d+ path=([^\n]+)/', $data, $m)) $pax['path'] = $m[1];
      continue;
    }
    if ($type === 'L') { $longName = rtrim($data, "\0"); continue; }
    $full = $pax['path'] ?? $longName ?? (($prefix !== '' ? $prefix . '/' : '') . $name);
    $pax = []; $longName = null;
    if ($type !== '0' && $type !== "\0") continue; // only regular files
    $rel = preg_replace('#^[^/]+/#', '', $full);   // strip "repo-main/"
    $files[$rel] = $data;
  }
  return [$commit, $files];
}

function readState() { global $CFG; $s = @json_decode(@file_get_contents($CFG['state'] . '/state.json'), true); return is_array($s) ? $s + ['history' => [], 'reverted' => []] : ['deployed' => null, 'history' => [], 'reverted' => []]; }
function writeState($s) {
  global $CFG;
  file_put_contents($CFG['state'] . '/state.json', json_encode($s, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX);
  $last = end($s['history']) ?: null;
  $public = ['deployed' => $s['deployed'], 'deployed_at' => $last['at'] ?? null, 'live_sha' => $s['live'] ?? $s['deployed'],
    'reverted' => array_values($s['reverted']), 'recent' => array_map(function ($h) { return ['sha' => $h['sha'], 'at' => $h['at'], 'files' => $h['files'], 'undone' => !empty($h['undone'])]; }, array_slice($s['history'], -10))];
  safeWrite($CFG['root'] . '/sf/site-status.json', json_encode($public, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}
function safeWrite($path, $data) {
  if (!is_dir(dirname($path))) mkdir(dirname($path), 0755, true);
  $tmp = $path . '.deploy-tmp';
  if (file_put_contents($tmp, $data, LOCK_EX) === false) fail("cannot write $path");
  chmod($tmp, 0644);
  if (!rename($tmp, $path)) fail("cannot move $path");
}

// --- lock ---
$lock = fopen($CFG['state'] . '/deploy.lock', 'c');
if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) exit(0);
$state = readState();

// --- 1. Undo: Sam pressed "Undo" on the Telegram card of the latest deploy ---
$last = end($state['history']);
if ($last && empty($last['undone']) && !empty($last['ops_key'])) {
  [$code, $r] = ops('GET', '/api/ops/ask/' . rawurlencode($last['ops_key']));
  if ($code === 200 && isset($r['answer']) && strcasecmp(trim($r['answer']), 'Undo') === 0) {
    foreach ($last['files'] as $rel) {
      $bak = $last['backup'] . '/' . $rel;
      $dst = $CFG['root'] . '/' . $rel;
      if (is_file($bak)) safeWrite($dst, file_get_contents($bak));
      elseif (is_file($dst) && in_array($rel, $last['new_files'] ?? [], true)) unlink($dst);
    }
    $k = array_key_last($state['history']);
    $state['history'][$k]['undone'] = gmdate('c');
    $state['reverted'][] = $last['sha'];
    $state['live'] = $last['prev'] ?? null;
    writeState($state);
    ops('POST', '/api/ops/close', ['key' => $last['ops_key'], 'note' => 'Undone: the previous version is live again.']);
    logline('UNDO ' . $last['sha']);
  }
}

// --- 2. New commit on main? ---
if ($CFG['archive']) { $gz = file_get_contents($CFG['archive']); }
else {
  [$code, $gz] = http('https://codeload.github.com/' . $CFG['repo'] . '/tar.gz/refs/heads/' . $CFG['branch']);
  if ($code !== 200 || !$gz) { logline("archive http $code"); exit(0); }
}
[$sha, $files] = untar($gz);
if (!$sha) fail('no commit id in archive');
if ($sha === $state['deployed']) exit(0);
if (in_array($sha, $state['reverted'], true)) exit(0);

// --- 3. What changed (whitelisted files only) ---
$changed = []; $new = []; $skipped = [];
foreach ($files as $rel => $data) {
  if (!preg_match($ALLOWED, $rel) || strpos($rel, '..') !== false) { if ($rel[0] !== '.' && !preg_match('#(\.md$|^tests/)#', $rel)) $skipped[] = $rel; continue; }
  if (strlen($data) > $MAX_FILE) { $skipped[] = $rel . ' (too big)'; continue; }
  $dst = $CFG['root'] . '/' . $rel;
  if (is_file($dst) && hash_file('sha256', $dst) === hash('sha256', $data)) continue;
  if (!is_file($dst)) $new[] = $rel;
  $changed[] = $rel;
}

// Sanity: the home page must still look like a full page
if (isset($files['index.html'])) {
  $home = $files['index.html'];
  if (strlen($home) < 20000 || stripos($home, '</html>') === false || stripos($home, '<title>') === false) fail("index.html in $sha failed the sanity check; not deployed");
}

$prev = $state['live'] ?? $state['deployed'];
// last-change.json is the card text; remember which version was already shown, so a stale one is never reused
$infoRaw = $files['.site/last-change.json'] ?? '';
$infoHash = $infoRaw === '' ? '' : hash('sha256', $infoRaw);
if (!$changed) { $state['deployed'] = $sha; $state['live'] = $sha; $state['last_info_hash'] = $infoHash; writeState($state); logline("no file change at $sha"); exit(0); }

// --- 4. Backup, then write ---
$backup = $CFG['state'] . '/backups/' . gmdate('Ymd-His') . '-' . substr($sha, 0, 7);
foreach ($changed as $rel) {
  $dst = $CFG['root'] . '/' . $rel;
  if (is_file($dst)) { if (!is_dir(dirname($backup . '/' . $rel))) mkdir(dirname($backup . '/' . $rel), 0700, true); copy($dst, $backup . '/' . $rel); }
}
foreach ($changed as $rel) safeWrite($CFG['root'] . '/' . $rel, $files[$rel]);

// --- 5. Tell Sam on Telegram, with Undo ---
$info = @json_decode($infoRaw, true) ?: [];
$stale = !$info || $infoHash === ($state['last_info_hash'] ?? null);
if ($stale) {
  // The description belongs to an earlier change: name the files instead of showing the wrong text
  $info = ['title' => 'files changed: ' . implode(', ', $changed),
           'summary' => 'No description was written for this change (.site/last-change.json was not updated), so the old one is not shown. Whoever changes the site must write it for every change.'];
  logline("stale last-change.json at $sha");
}
$title = 'Site update live: ' . mb_substr($info['title'] ?? 'samfoundation.tech changed', 0, 150);
$body = trim(($info['summary'] ?? '') . "\n\nFiles: " . implode(', ', $changed) . "\nSee it: " . $CFG['site'] .
  "\nPress Undo to bring back the previous version (it is restored within 10 minutes).");
$opsKey = 'site-' . substr($sha, 0, 12);
[$oc] = ops('POST', '/api/ops/ask', ['key' => $opsKey, 'kind' => 'info', 'source' => 'site-routine', 'title' => $title, 'body' => $body, 'options' => ['OK', 'Undo']]);

$state['history'][] = ['sha' => $sha, 'prev' => $prev, 'at' => gmdate('c'), 'files' => $changed, 'new_files' => $new, 'backup' => $backup, 'ops_key' => $oc === 200 ? $opsKey : null, 'skipped' => $skipped];
$state['history'] = array_slice($state['history'], -40);
$state['deployed'] = $sha; $state['live'] = $sha; $state['last_info_hash'] = $infoHash;
writeState($state);
logline("DEPLOYED $sha files=" . implode(',', $changed) . ($skipped ? ' skipped=' . implode(',', $skipped) : '') . " ops=$oc");

// keep the last 30 backups
$dirs = glob($CFG['state'] . '/backups/*', GLOB_ONLYDIR) ?: [];
sort($dirs);
foreach (array_slice($dirs, 0, max(0, count($dirs) - 30)) as $d) {
  $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($d, FilesystemIterator::SKIP_DOTS), RecursiveIteratorIterator::CHILD_FIRST);
  foreach ($it as $f) { $f->isDir() ? rmdir($f) : unlink($f); }
  rmdir($d);
}
