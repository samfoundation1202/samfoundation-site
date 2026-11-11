# Host deploy script (copy of what runs on the cPanel host)

`deploy.php` runs from cron every 10 minutes at /home/adminsf/site-deploy/deploy.php. It deploys only index.html and sf/ files from main, with a backup and a Telegram OK/Undo card.
This copy is for reading and review only; the host does not load it from here. To change the host, upload it by hand and keep a backup (deploy.before-*.php).

The card title and text come from `.site/last-change.json`. Since 2026-11-11 the script remembers which version it already showed. If that file was not updated for a deploy, the card names the changed files instead of reusing an old description.
