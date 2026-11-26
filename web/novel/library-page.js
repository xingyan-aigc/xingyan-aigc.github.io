import {attachSummary} from './library-summary.js?v=independent-synopsis';
import {selectWorks,topicTags,detailTags} from './library-controls.mjs?v=story-taxonomy';
import {show,number,date,score,link,tags,field,prose,platformScore} from './page-data.js?v=20261107-platform-score-2';
import {goldenFingerByWorkId} from './library-golden-fingers.mjs';

export function renderLibraryPage({works,scored,batchIds,snapshot}){
 const completedIds=snapshot?.lastCompletedBatch?.workIds;
 const latestBatchIds=Array.isArray(completedIds)?new Set(completedIds):batchIds;
 document.querySelector("#library-count").textContent=`${works.length} 部小说`;
 const state={query:'',scope:'all',audience:'',goldenFinger:'',status:'',topic:'',detail:'',sort:'total',direction:'desc'};
 const ranks=new Map(scored.map((w,index)=>[w.id,index+1]));
 const filters={query:'#library-search',scope:'#filter-scope',audience:'#filter-audience',goldenFinger:'#filter-golden-finger',status:'#filter-status',topic:'#filter-topic',detail:'#filter-tag',sort:'#sort-field',direction:'#sort-direction'};
 for(const [selector,getTags] of [[filters.topic,topicTags],[filters.detail,detailTags]]){
  const control=document.querySelector(selector);
  const values=[...new Set(works.flatMap(getTags))].sort((a,b)=>a.localeCompare(b,'zh-CN'));
  for(const tag of values){
   const option=show('option',tag);option.value=tag;control.append(option);
  }
 }
 const metric=(value,digits=0)=>typeof value==='number'&&Number.isFinite(value)?(digits?value.toFixed(digits):number.format(value)):'—';
 function renderLibrary(){
  document.querySelectorAll('.summary-popover').forEach(p=>p.dispatchEvent(new Event('summary-dispose')));
  const visible=selectWorks(works,state,latestBatchIds),body=document.querySelector('#works');body.replaceChildren();
  document.querySelector('#filter-result').textContent=`显示 ${visible.length} / ${works.length} 部`;
  document.querySelectorAll('th[data-sort-key]').forEach(th=>{const active=th.dataset.sortKey===state.sort;th.setAttribute('aria-sort',active?(state.direction==='asc'?'ascending':'descending'):'none');th.querySelector('.sort-indicator').textContent=active?(state.direction==='asc'?'↑':'↓'):'↕';});
  if(!visible.length){const row=document.createElement('tr'),cell=show('td','没有符合条件的小说，可调整筛选或点击“重置”。','table-empty');cell.colSpan=14;row.append(cell);body.append(row);return;}
  for(const work of visible){
   const row=document.createElement('tr');row.dataset.workId=work.id;const a=work.readerScore||null;
   const book=show('td','','book-cell');book.append(link(work.title,work.reportUrl ? work.reportUrl + '?from=library' : work.detailUrl),attachSummary(work,show('small',work.cardInfo?.shortSummary||'梗概待整理')));
   const audience=(work.platformTags||[]).find(tag=>['男频','女频','通用'].includes(tag))||'受众待核';
   const topicCell=show('td','','library-topics');
   const settings=work.specialSettings ?? (work.worldSetting || []).filter(tag=>tag!=='现实向'&&tag!=='设定待核');
   const badges=tags([work.storyBackground || work.eraBackground || '时代待核', ...settings]);
   badges.classList.add('library-world-badges');
   const audienceLabels = [audience];
   const goldenFinger = goldenFingerByWorkId.get(work.id);
   const audienceRow = tags(audienceLabels);
   audienceRow.classList.add('library-audience-badges');
   if (goldenFinger) {
    const full=goldenFinger.replace(/^金手指[：:]\s*/, '');
    const name=full.split(/[，；。（(：:]/)[0].trim();
    const compact=name.length>12 ? name.slice(0,12)+'…' : name;
    const detail=document.createElement('details');detail.className='golden-finger-detail';
    const toggle=show('summary',`金手指：${compact}`,'tag');
    toggle.title='点击查看完整机制与限制';
    detail.append(toggle,show('p',full,'golden-finger-description'));
    audienceRow.append(detail);
   }
   badges.prepend(audienceRow);
   topicCell.append(badges,tags(topicTags(work)));
   const tagCell=show('td','','library-tags');tagCell.append(tags(detailTags(work)));
   const platform=document.createElement('td');platform.append(show('span',platformScore(work)),show('small',work.market?.votes==null?'人数待核':number.format(work.market.votes)+' 人评分','cell-subtext'));
   const length=document.createElement('td');length.append(show('span',`${(work.wordCount/10000).toFixed(1)} 万字`),show('small',work.serializationStatus||'状态待核','cell-subtext'));
   const read=show('td','','extra-col');read.append(show('span','第 1—'+work.chapterCount+' 章'),show('small',(work.characters/10000).toFixed(1)+' 万字符','cell-subtext'));
   const updated=show('td',work.collectedAt?date(work.collectedAt):'待核','extra-col');
   row.append(show('td',ranks.has(work.id)?String(ranks.get(work.id)).padStart(2,'0'):'—'),book,topicCell,tagCell,show('td',a?score(a.total):'数据待核','table-score'),platform,show('td',metric(work.market?.readers)),length,show('td',work.onlineAt||'待核','online-date'),show('td',work.release?.selectedCount==null?'待核':metric(work.release.selectedCount),'ip-selected-count'),show('td',work.release?.listedCount==null?'待核':metric(work.release.listedCount),'ip-listed-count'),read,updated);
   const action=document.createElement('td');if(work.reportUrl)action.append(link(work.analysisStatus==='complete'?'详细档案 →':'查看基础资料 →',work.reportUrl + '?from=library'));else action.textContent='待拆解';row.append(action);body.append(row);
  }
 }
 for(const [key,selector] of Object.entries(filters)){const control=document.querySelector(selector);control.addEventListener(key==='query'?'input':'change',()=>{state[key]=control.value;renderLibrary();});}
 document.querySelectorAll('button[data-sort]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.sort;state.direction=state.sort===key&&state.direction==='desc'?'asc':'desc';state.sort=key;document.querySelector('#sort-field').value=key;document.querySelector('#sort-direction').value=state.direction;renderLibrary();}));
 document.querySelector('#more-data').addEventListener('change',event=>document.querySelector('.library-table').classList.toggle('expanded',event.target.checked));
 document.querySelector('#reset-library').addEventListener('click',()=>{Object.assign(state,{query:'',scope:'all',audience:'',goldenFinger:'',status:'',topic:'',detail:'',sort:'total',direction:'desc'});for(const [key,selector]of Object.entries(filters))document.querySelector(selector).value=state[key];document.querySelector('#more-data').checked=false;document.querySelector('.library-table').classList.remove('expanded');renderLibrary();});
 renderLibrary();

}
