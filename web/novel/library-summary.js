export function attachSummary(work,preview){
 const text=work.bodySummary;
 if(!text)return preview;
 const wrapper=document.createElement('div');const trigger=document.createElement('button');trigger.type='button';trigger.textContent='查看正文简介';wrapper.append(preview,trigger);
 trigger.classList.add('summary-open-button');trigger.setAttribute('aria-label',`展开《${work.title}》正文简介`);trigger.setAttribute('aria-expanded','false');
 const panel=document.createElement('dialog');panel.className='summary-popover';panel.id=`summary-${work.id}`;trigger.setAttribute('aria-controls',panel.id);
 const heading=document.createElement('strong');heading.textContent=work.title+' · 正文简介';heading.id=`summary-heading-${work.id}`;panel.setAttribute('aria-labelledby',heading.id);
 const close=document.createElement('button');close.type='button';close.textContent='关闭';
 const content=document.createElement('div');content.className='summary-full';
 const paragraphs=Array.isArray(text)?text:String(text).split(/\n+/);
 for(const part of paragraphs.filter(Boolean)){
  const paragraph=document.createElement('p');
  paragraph.textContent=part;
  content.append(paragraph);
 }
 panel.append(heading,close,content);document.body.append(panel);
 let opened=false;
 const unlock=()=>{opened=false;document.documentElement.classList.remove('summary-modal-open');trigger.setAttribute('aria-expanded','false');};
 const hide=()=>{if(opened)panel.close();};
 const open=()=>{if(opened)return;document.querySelectorAll('.summary-popover[open]').forEach(p=>p.dispatchEvent(new Event('summary-close')));panel.showModal();opened=true;content.scrollTop=0;document.documentElement.classList.add('summary-modal-open');trigger.setAttribute('aria-expanded','true');close.focus({preventScroll:true});};
 panel.addEventListener('close',unlock);
 trigger.addEventListener('click',()=>opened?hide():open());
 trigger.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
 close.addEventListener('click',()=>{hide();trigger.focus();});panel.addEventListener('summary-close',hide);panel.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
 const abort=new AbortController();panel.addEventListener('summary-dispose',()=>{hide();abort.abort();panel.remove();});
 panel.addEventListener('click',e=>{if(e.target===panel){const r=panel.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)hide();}});
 return wrapper;
}
