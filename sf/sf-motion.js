/* Sam Foundation motion v1: scroll reveal, count-up, pause off-screen loops. No dependencies. */
(function(){
  var d=document, root=d.documentElement;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!('IntersectionObserver' in window)||reduce){
    d.querySelectorAll('[data-count]').forEach(function(el){el.textContent=el.getAttribute('data-count')});
    return;
  }
  root.classList.add('sf-js');
  function count(el){
    var end=+el.getAttribute('data-count'), t0=null, dur=1200;
    function step(t){ if(!t0)t0=t; var p=Math.min(1,(t-t0)/dur); el.textContent=Math.round(end*(1-Math.pow(1-p,3))); if(p<1)requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting)return;
      e.target.classList.add('is-in');
      if(e.target.hasAttribute('data-count'))count(e.target);
      io.unobserve(e.target);
    });
  },{rootMargin:'0px 0px -8% 0px'});
  d.querySelectorAll('.sf-reveal,[data-count]').forEach(function(el){io.observe(el)});
  var loop=new IntersectionObserver(function(es){
    es.forEach(function(e){e.target.classList.toggle('is-off',!e.isIntersecting)});
  });
  d.querySelectorAll('[data-loop]').forEach(function(el){loop.observe(el)});
})();
