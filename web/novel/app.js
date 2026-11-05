import {selectWorks} from './library-controls.mjs';
const show=(tag,text,className)=>{const e=document.createElement(tag);e.textContent=text;if(className)e.className=className;return e;};
const number=new Intl.NumberFormat('zh-CN');
const date=value=>new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',dateStyle:'medium',timeStyle:'short'}).format(new Date(value));
const score=value=>Number(value).toFixed(2);
const link=(label,href,className)=>{const e=show('a',label,className);e.href=href;return e;};
function tags(values){const row=show('div','','tags');for(const v of values||[])row.append(show('span',v,'tag'));return row;}
function field(label,text){const e=document.createElement('div');e.append(show('span',label,'field-label'),show('p',text));return e;}
function prose(text){const block=show('div','','prose');for(const part of text.match(/[^。！？；]+[。！？；]?|[。！？；]/g)||[text])if(part.trim())block.append(show('p',part));return block;}
const platformScore=work=>work.market?.score>0?String(Number(work.market.score)):'暂无';
try{
 const response=await fetch('./snapshot.json',{cache:'no-store'});if(!response.ok)throw Error('快照读取失败');
 const snapshot=await response.json();
 const scored=snapshot.works.filter(w=>w.assessment?.status==='scored').sort((a,b)=>b.assessment.total-a.assessment.total||b.assessment.opening-a.assessment.opening||a.id.localeCompare(b.id));
 const pending=snapshot.works.filter(w=>w.assessment?.status!=='scored');
 const works=[...scored,...pending];const batchIds=new Set(snapshot.batchIds||works.map(w=>w.id));const batch=works.filter(w=>batchIds.has(w.id));
 document.querySelector('#assessment-meta').textContent=snapshot.assessedAt?`评估更新 ${date(snapshot.assessedAt)}\n已评 ${scored.length} 部 · 评分规则 ${snapshot.ruleVersion}`:'正文已存档 · 待评估';
 document.querySelector('#collected-at').textContent=`数据采集 ${date(snapshot.collectedAt)}`;
 document.querySelector('#library-count').textContent=`${works.length} 部小说`;
 function renderTop(mode){
  const scope=mode==='all'?scored:scored.filter(w=>batchIds.has(w.id));const top=scope.slice(0,3);const container=document.querySelector('#top-three');container.replaceChildren();
  document.querySelector('#all-ranking').setAttribute('aria-pressed',String(mode==='all'));document.querySelector('#batch-ranking').setAttribute('aria-pressed',String(mode==='batch'));
  document.querySelector('#ranking-scope').textContent=`${mode==='all'?'全部已评':'本批已评'} ${scope.length} 部，按综合分由高到低排列。`;
  if(!top.length){container.append(show('p','暂无已完成评分的作品。','empty'));return;}
  top.forEach((work,index)=>{
   const a=work.assessment;const card=show('article','','rank-card');card.dataset.workId=work.id;
   const content=document.createElement('div'),heading=show('div','','book-topline'),title=document.createElement('h3');title.append(link(work.title,work.reportUrl));heading.append(title);
   content.append(heading,tags(work.genreTags),show('p',`${work.serializationStatus||'状态待核'} · ${(work.wordCount/10000).toFixed(1)} 万字 · 平台 ${platformScore(work)} 分 · ${work.market?.readers==null?'在读待核':number.format(work.market.readers)+' 人在读'}`,'book-meta'));
   const brief=show('div','','book-brief');const story=document.createElement('div');story.append(show('span','故事与评估摘要','field-label'),prose(a.summary));brief.append(story);const notes=show('div','','brief-detail');
   if(a.strengths?.length)notes.append(field('内容看点',a.strengths[0]));if(a.risks?.length)notes.append(field('主要改编难点',a.risks[0]));brief.append(notes);content.append(brief);
   const side=show('div','','score-column');side.append(show('span','综合分','score-label'),show('div',score(a.total),'score'),show('span','/ 100','score-unit'),link('查看评估报告 →',work.reportUrl,'report-link'));
   card.append(show('div',String(index+1).padStart(2,'0'),'rank-number'),content,side);container.append(card);
  });
 }
 document.querySelector('#all-ranking').addEventListener('click',()=>renderTop('all'));document.querySelector('#batch-ranking').addEventListener('click',()=>renderTop('batch'));renderTop('all');
 const state={query:'',scope:'all',audience:'',status:'',tag:'',sort:'total',direction:'desc'};
 const ranks=new Map(scored.map((w,index)=>[w.id,index+1]));
 const filters={query:'#library-search',scope:'#filter-scope',audience:'#filter-audience',status:'#filter-status',tag:'#filter-tag',sort:'#sort-field',direction:'#sort-direction'};
 const values=new Set(works.flatMap(w=>[...(w.genreTags||[]),...(w.platformTags||[])]).filter(tag=>!['男频','女频','受众待核'].includes(tag)));
 for(const tag of [...values].sort((a,b)=>a.localeCompare(b,'zh-CN'))){const option=show('option',tag);option.value=tag;document.querySelector('#filter-tag').append(option);}
 const metric=(value,digits=0)=>typeof value==='number'&&Number.isFinite(value)?(digits?value.toFixed(digits):number.format(value)):'—';
 function renderLibrary(){
  const visible=selectWorks(works,state,batchIds),body=document.querySelector('#works');body.replaceChildren();
  document.querySelector('#filter-result').textContent=`显示 ${visible.length} / ${works.length} 部`;
  document.querySelectorAll('th[data-sort-key]').forEach(th=>{const active=th.dataset.sortKey===state.sort;th.setAttribute('aria-sort',active?(state.direction==='asc'?'ascending':'descending'):'none');th.querySelector('.sort-indicator').textContent=active?(state.direction==='asc'?'↑':'↓'):'↕';});
  if(!visible.length){const row=document.createElement('tr'),cell=show('td','没有符合条件的小说，可调整筛选或点击“重置”。','table-empty');cell.colSpan=13;row.append(cell);body.append(row);return;}
  for(const work of visible){
   const row=document.createElement('tr');row.dataset.workId=work.id;const a=work.assessment?.status==='scored'?work.assessment:null;
   const book=show('td','','book-cell');book.append(link(work.title,work.reportUrl||work.detailUrl),show('small',`${work.author||'作者待核'} · ${(work.genreTags||[]).join(' · ')}`));
   const platform=document.createElement('td');platform.append(show('span',platformScore(work)),show('small',work.market?.votes==null?'人数待核':number.format(work.market.votes)+' 人评分','cell-subtext'));
   const length=document.createElement('td');length.append(show('span',`${(work.wordCount/10000).toFixed(1)} 万字`),show('small',work.serializationStatus||'状态待核','cell-subtext'));
   const read=show('td','','extra-col');read.append(show('span','第 1—'+work.chapterCount+' 章'),show('small',(work.characters/10000).toFixed(1)+' 万字符','cell-subtext'));
   const updated=show('td',work.collectedAt?date(work.collectedAt):'待核','extra-col');
   row.append(show('td',ranks.has(work.id)?String(ranks.get(work.id)).padStart(2,'0'):'—'),book,show('td',a?score(a.total):'待评分','table-score'),show('td',metric(a?.contributions?.opening,2)),show('td',metric(a?.contributions?.readers,2)),platform,show('td',metric(work.market?.readers)),length,show('td',metric(work.release?.listedCount),'extra-col'),show('td',metric(work.release?.selectedCount),'extra-col'),read,updated);
   const action=document.createElement('td');if(work.reportUrl)action.append(link('查看报告 →',work.reportUrl));else action.textContent='待评估';row.append(action);body.append(row);
  }
 }
 for(const [key,selector] of Object.entries(filters)){const control=document.querySelector(selector);control.addEventListener(key==='query'?'input':'change',()=>{state[key]=control.value;renderLibrary();});}
 document.querySelectorAll('button[data-sort]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.sort;state.direction=state.sort===key&&state.direction==='desc'?'asc':'desc';state.sort=key;document.querySelector('#sort-field').value=key;document.querySelector('#sort-direction').value=state.direction;renderLibrary();}));
 document.querySelector('#more-data').addEventListener('change',event=>document.querySelector('.library-table').classList.toggle('expanded',event.target.checked));
 document.querySelector('#reset-library').addEventListener('click',()=>{Object.assign(state,{query:'',scope:'all',audience:'',status:'',tag:'',sort:'total',direction:'desc'});for(const [key,selector]of Object.entries(filters))document.querySelector(selector).value=state[key];document.querySelector('#more-data').checked=false;document.querySelector('.library-table').classList.remove('expanded');renderLibrary();});
 renderLibrary();
 const complete=batch.filter(w=>w.coverage?.complete).length;
 const unresolved=(snapshot.failures?.length||0)+batch.filter(w=>w.status==='retry').length;
 const chars=batch.reduce((n,w)=>n+(w.characters||0),0);
 for(const [label,value]of[['本批小说',batch.length+' 部'],['已采章节',number.format(batch.reduce((n,w)=>n+w.chapterCount,0))+' 章'],['已采正文',(chars/10000).toFixed(1)+' 万字符'],['完整目录核验',complete+' / '+batch.length],['本批待评分',batch.filter(w=>w.assessment?.status!=='scored').length+' 部'],['本批未处理异常',unresolved+' 项']]){const c=document.createElement('div');c.append(show('strong',value),show('span',label));document.querySelector('#counts').append(c);}
 const facts=[['采集来源','红果漫剧 IP 库'],['筛选范围','潜力网文 IP · 5—50 万字 · 零上架'],['连载状态','连载、完结均纳入'],['正文范围','仅采当前账号可读章节，按目录逐章核对'],['评估更新',snapshot.assessedAt?date(snapshot.assessedAt):'尚未完成'],['累计已评',scored.length+' 部 · 按综合分排序'],['执行分工','程序采集；助手分析正文；程序计算总分'],['数据状态',unresolved?'有待处理记录，见下方明细':'本批未发现缺章或待处理异常']];
 for(const [label,value]of facts){const row=document.createElement('div');row.append(show('dt',label),show('dd',value));document.querySelector('#record-details').append(row);}
 if(snapshot.failures?.length){const d=document.createElement('details');d.append(show('summary',`待处理采集记录 · ${snapshot.failures.length} 部`));const ul=document.createElement('ul');for(const f of snapshot.failures)ul.append(show('li',f.title));d.append(ul);document.querySelector('#failures').append(d);}
}catch(error){document.querySelector('#load-error').textContent='数据暂时未能加载，请刷新重试。';console.error(error);}
