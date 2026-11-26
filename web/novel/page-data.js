export const show=(tag,text,className)=>{const e=document.createElement(tag);e.textContent=text;if(className)e.className=className;return e;};
export const number=new Intl.NumberFormat('zh-CN');
export const date=value=>new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',dateStyle:'medium',timeStyle:'short'}).format(new Date(value));
export const score=value=>Number(value).toFixed(2);
export const link=(label,href,className)=>{const e=show('a',label,className);e.href=href;return e;};
export function tags(values){const row=show('div','','tags');for(const v of values||[])row.append(show('span',v,'tag'));return row;}
export function field(label,text){const e=document.createElement('div');e.append(show('span',label,'field-label'),show('p',text));return e;}
export function prose(text){const block=show('div','','prose');for(const part of text.match(/[^。！？；]+[。！？；]?|[。！？；]/g)||[text])if(part.trim())block.append(show('p',part));return block;}
export const platformScore=work=>work.market?.score>0?Number(work.market.score).toFixed(2).replace(/0+$/, '').replace(/\.$/, ''):'暂无';

export async function loadPageData(){
 const response=await fetch('./snapshot.json',{cache:'no-store'});if(!response.ok)throw Error('快照读取失败');
 const snapshot=await response.json();
 const selected=snapshot.works;
 const scored=[...selected].sort((a,b)=>(b.readerScore?.total??-1)-(a.readerScore?.total??-1)||a.id.localeCompare(b.id));
 const works=scored;const batchIds=new Set(snapshot.batchIds||works.map(w=>w.id));const batch=works.filter(w=>batchIds.has(w.id));

 return {snapshot,scored,works,batchIds,batch};
}
export function renderAssessmentMeta(snapshot,scored){const el=document.querySelector('#assessment-meta');if(el)el.textContent=`已收纳 ${scored.length} 部 · 正文简介已整理 ${scored.filter(w=>w.analysisStatus==='complete').length} 部\n读者分25分 · 无正文评分`;}
