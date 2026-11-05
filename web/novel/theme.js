(() => {
  const key='xingyan-novel-theme';
  let selected='dark';
  try { const saved=localStorage.getItem(key); if(saved==='light'||saved==='dark')selected=saved; } catch {}
  document.documentElement.dataset.theme=selected;
  function apply(theme,save=false){
    document.documentElement.dataset.theme=theme;
    document.querySelectorAll('.theme-toggle').forEach(button=>{
      const next=theme==='dark'?'白天':'黑夜';
      button.setAttribute('aria-label','切换到'+next+'模式');button.setAttribute('title','切换到'+next+'模式');
      button.setAttribute('aria-pressed',String(theme==='light'));
      button.innerHTML=(theme==='dark'?'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z"/></svg>');
    });
    if(save)try{localStorage.setItem(key,theme);}catch{}
  }
  document.addEventListener('DOMContentLoaded',()=>{
    apply(document.documentElement.dataset.theme);
    document.querySelectorAll('.theme-toggle').forEach(button=>button.addEventListener('click',()=>apply(document.documentElement.dataset.theme==='dark'?'light':'dark',true)));
  });
  window.addEventListener('storage',event=>{if(event.key===key)apply(event.newValue==='light'?'light':'dark');});
})();
