const el=id=>document.getElementById(id);
const format=value=>value?new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',dateStyle:'short',timeStyle:'medium'}).format(new Date(value)):'尚无记录';
let loading=false;
async function refresh(){
 if(loading)return;loading=true;el('refresh-collection').disabled=true;
 try{
  const response=await fetch('./collection-status.json',{cache:'no-store'});if(!response.ok)throw Error('状态不可用');const s=await response.json();
  const states={complete:'本批采集与内容整理完成',paused:'已暂停 · 等待指令',awaiting_analysis:'本批采集完成 · 内容整理中',scoring:'正在评分',running:'正在采集',waiting:'列表已扫描完',retrying:'自动重试中',continue:'继续采集',awaiting_score:'本批采集完成 · 等待拆解',error:'采集已暂停',idle:'尚未启动'};
  const stale=Date.now()-new Date(s.updatedAt).getTime()>120000 && s.state==='running';
  el('collection-state').textContent=`${stale?'状态更新中断，请检查后台':states[s.state]||'状态待核'} · 状态更新 ${format(s.updatedAt)}（北京时间）`;
  if(s.state!=='paused' && s.selectionPolicy?.version)el('collection-state').textContent+=` · 当前采集规则 ${s.selectionPolicy.version}（评分≥8 · 在读≥1万，无上限）`;
  if(s.selectionPolicy?.maxOnlineMonths===12)el('collection-state').textContent+=' · 仅采上架一年内';
  else if(s.selectionPolicy?.maxOnlineMonths===6)el('collection-state').textContent+=' · 仅采上架半年内';
  else if(s.selectionPolicy?.minOnlineMonths===0)el('collection-state').textContent+=' · 本批上架时间不限';
  if(Number.isInteger(s.selectionPolicy?.maxListedCount))el('collection-state').textContent+=` · 已上架漫剧 ${s.selectionPolicy.maxListedCount===0?"＝0":"≤"+s.selectionPolicy.maxListedCount} 部`;
  if(s.batch?.collectionVersions)el('collection-state').textContent+=' · 本批来源 '+Object.entries(s.batch.collectionVersions).map(([version,count])=>`${version==='unknown'?'历史版本未核实':version} ${count} 部`).join('、');
  if(s.phase)el('collection-state').textContent+=' · '+s.phase;
  if(s.phase?.startsWith('扫描')&&s.listPageSize)el('collection-state').textContent+=` · 每页${s.listPageSize}条`;
  if(s.batch?.target)el('collection-state').textContent+=` · 本批 ${s.batch.workIds?.length||0} / ${s.batch.target} 部`;
  el('collection-counts').replaceChildren();
  for(const [label,value] of [['书库已入库',(s.libraryCount??0)+' 部'],['本批采齐',(s.batchCompleteCount??0)+' 部'],['本批待整理',(s.batchPendingCount??0)+' 部'],['本批章节',(s.batchChapterCount??0)+' 章'],['本批正文',((s.batchCharacters??0)/10000).toFixed(1)+' 万字符'],['本轮扫描',s.scanned+' 部']]){
   const item=document.createElement('div'),strong=document.createElement('strong'),span=document.createElement('span');strong.textContent=value;span.textContent=label;item.append(strong,span);el('collection-counts').append(item);
  }
  const c=s.current||{};el('collection-current').textContent=c.title?`正在采集《${c.title}》 · 已存 ${c.stored} / ${c.expected} 章`:s.message+(['waiting','retrying'].includes(s.state)&&s.nextRunAt?` 下一轮 ${format(s.nextRunAt)}。`:'');
  if(s.collectionNotice?.status==='sent')el('collection-current').textContent+=` 邮件提醒已于 ${format(s.collectionNotice.sentAt)} 提交邮件服务器。`;
  else if(s.collectionNotice?.status)el('collection-current').textContent+=' 邮件提醒未发送成功，后台每分钟复查；发送结果不确定时不会重复投递。';
  const batchIds=s.batch?.target?new Set(s.batch.workIds||[]):null;
  const pendingBooks=(s.pending||[]).filter(book=>!batchIds||batchIds.has(book.id));
  el('pending-total').textContent=s.batch?.target?`· ${pendingBooks.length} / ${s.batch.target} 部`:`· ${s.pendingCount} 部`;el('pending-books').replaceChildren();
  for(const book of pendingBooks){const li=document.createElement('li');li.textContent=`${book.title} · ${book.chapters} 章已采齐`;el('pending-books').append(li);}
 }catch{el('collection-state').textContent='暂时无法读取采集进度，请稍后刷新。';}
 finally{loading=false;el('refresh-collection').disabled=false;}
}
el('refresh-collection').addEventListener('click',refresh);refresh();setInterval(()=>{if(!document.hidden)refresh();},30000);

async function refreshScoring(){try{const [r,c]=await Promise.all([fetch('./snapshot.json',{cache:'no-store'}),fetch('./collection-status.json',{cache:'no-store'})]);const s=await r.json(),status=await c.json(),done=(s.works||[]).filter(w=>w.analysisStatus==='complete'),batchIds=new Set(status.batch?.workIds||s.batchIds||[]);const batchDone=done.filter(w=>batchIds.has(w.id)).length;el('scoring-progress').textContent=`本批档案已整理 ${batchDone} / ${status.batch?.target||batchIds.size} 部 · 累计已整理 ${done.length} 部 · 仅按读者分25分排名`;}catch{el('scoring-progress').textContent='IP内容拆解信息暂时不可用';}}
refreshScoring();setInterval(refreshScoring,30000);
