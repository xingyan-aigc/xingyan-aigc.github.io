const el=id=>document.getElementById(id);
const format=value=>value?new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',dateStyle:'short',timeStyle:'medium'}).format(new Date(value)):'尚无记录';
const friendlyReason=reason=>/Target page, context or browser has been closed/i.test(reason)?'采集浏览器连接中断，相关章节需续采。':/timeout|timed out/i.test(reason)?'页面加载超时，尚未成功读取。':reason;
let loading=false;
async function refresh(){
 if(loading)return;loading=true;el('refresh-collection').disabled=true;
 try{
  const response=await fetch('./collection-status.json',{cache:'no-store'});if(!response.ok)throw Error('状态不可用');const s=await response.json();
  const states={snapshot:'线上数据快照',running:'正在采集',waiting:'列表已扫描完',retrying:'自动重试中',continue:'继续采集',awaiting_score:'本批采集完成 · 等待评分',error:'采集已暂停',idle:'尚未启动'};
  const stale=Date.now()-new Date(s.updatedAt).getTime()>120000 && s.state==='running';
  el('collection-state').textContent=`${stale?'状态更新中断，请检查后台':states[s.state]||'状态待核'} · 状态更新 ${format(s.updatedAt)}（北京时间）`;
  if(s.batch?.target)el('collection-state').textContent+=` · 本批 ${s.batch.workIds?.length||0} / ${s.batch.target} 部`;
  el('collection-counts').replaceChildren();
  for(const [label,value] of [['已采完整',s.completeCount+' 部'],['待评分',s.pendingCount+' 部'],['未采齐',s.incompleteCount+' 部'],['已采章节',s.chapterCount+' 章'],['已采正文',(s.characters/10000).toFixed(1)+' 万字符'],['本轮扫描',s.scanned+' 部']]){
   const item=document.createElement('div'),strong=document.createElement('strong'),span=document.createElement('span');strong.textContent=value;span.textContent=label;item.append(strong,span);el('collection-counts').append(item);
  }
  const c=s.current||{};el('collection-current').textContent=c.title?`正在采集《${c.title}》 · 已存 ${c.stored} / ${c.expected} 章`:s.message+(['waiting','retrying'].includes(s.state)&&s.nextRunAt?` 下一轮 ${format(s.nextRunAt)}。`:'');
  const alerts=el('collection-alerts');alerts.replaceChildren();
  const errors=(s.errors||[]).filter(e=>e.type!=='可读目录'),recent=(s.recentErrors||[]).filter(e=>e.type!=='可读目录');
  const unavailable=s.unavailable||(s.errors||[]).filter(e=>e.type==='可读目录');
  if(unavailable.length){
   const details=document.createElement('details');details.className='availability-note';
   const summary=document.createElement('summary');summary.textContent=`未取得可读目录 · ${unavailable.length} 部（已跳过，不计入本批30部）`;details.append(summary);
   const note=document.createElement('p');note.textContent='这些作品的详情接口返回成功，但章节目录为空；原因尚待核查，不代表整个采集程序发生故障。其他作品继续采集。';details.append(note);
   const list=document.createElement('ul');for(const item of unavailable){const li=document.createElement('li');li.textContent=`《${item.title}》 · ${item.occurredAt?format(item.occurredAt):'时间待核'} · 未返回可读目录`;list.append(li);}details.append(list);alerts.append(details);
  }
  if(errors.length||['error','retrying'].includes(s.state)||stale){
   const box=document.createElement('div');box.className='collection-alert';
   const heading=document.createElement('strong');heading.textContent=stale?'后台状态长时间未更新':s.state==='retrying'?'采集异常 · 正在自动重试':s.state==='error'?'采集异常 · 需要检查':`采集异常 · ${errors.length} 项待处理`;box.append(heading);
   const text=document.createElement('p');text.textContent=(errors[0]?.reason?friendlyReason(errors[0].reason):s.message)||'后台可能已中断，请在会话中要求排查。';box.append(text);
   if(s.nextRunAt&&s.state==='retrying'){const retry=document.createElement('p');retry.textContent=`下次重试 ${format(s.nextRunAt)}（北京时间）`;box.append(retry);}
   alerts.append(box);
  }
  const records=errors.length?errors:recent;
  if(records.length){
   const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent=errors.length?`查看具体异常 · ${errors.length} 项`:`最近异常记录 · ${recent.length} 项（不代表当前仍异常）`;details.append(summary);
   const list=document.createElement('ul');for(const item of records){const li=document.createElement('li');li.textContent=`${item.occurredAt?format(item.occurredAt):'时间待核'} · ${item.type}${item.title?' · 《'+item.title+'》':''}${item.chapter?' · 第'+item.chapter+'章':''}：${item.reason}`;list.append(li);}details.append(list);alerts.append(details);
  }
  const batchIds=s.batch?.target?new Set(s.batch.workIds||[]):null;
  const pendingBooks=(s.pending||[]).filter(book=>!batchIds||batchIds.has(book.id));
  el('pending-total').textContent=s.batch?.target?`· ${pendingBooks.length} / ${s.batch.target} 部`:`· ${s.pendingCount} 部`;el('pending-books').replaceChildren();
  for(const book of pendingBooks){const li=document.createElement('li');li.textContent=`${book.title} · ${book.chapters} 章已采齐`;el('pending-books').append(li);}
 }catch{el('collection-state').textContent='暂时无法读取采集进度，请稍后刷新。';const box=document.createElement('div');box.className='collection-alert';box.textContent='进度读取异常：无法获取后台状态，页面现有数量可能不是最新。可以在会话中要求排查。';el('collection-alerts').replaceChildren(box);}
 finally{loading=false;el('refresh-collection').disabled=false;}
}
el('refresh-collection').addEventListener('click',refresh);refresh();setInterval(()=>{if(!document.hidden)refresh();},30000);
