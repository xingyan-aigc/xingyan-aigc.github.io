(() => {
 const header=document.querySelector('.site-header');if(!header)return;
 const update=()=>document.documentElement.style.setProperty('--header-offset',`${header.offsetHeight+18}px`);
 update();new ResizeObserver(update).observe(header);
})();
