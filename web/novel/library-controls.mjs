export const scored=work=>work.assessment?.status==='scored';
const allTags=work=>[...(work.genreTags||[]),...(work.platformTags||[])];
export function fieldValue(work,key){
 const a=scored(work)?work.assessment:null;
 const map={total:a?.total,opening:a?.contributions?.opening,readersScore:a?.contributions?.readers,
  platform:work.market?.score>0?work.market.score:null,votes:work.market?.votes,readers:work.market?.readers,
  words:work.wordCount,chapters:work.chapterCount,listed:work.release?.listedCount,selected:work.release?.selectedCount,
  collected:work.collectedAt?Date.parse(work.collectedAt):null};
 const value=map[key];return typeof value==='number'&&Number.isFinite(value)?value:null;
}
export function selectWorks(works,state,batchIds=new Set()){
 const query=(state.query||'').trim().toLocaleLowerCase('zh-CN');
 return works.filter(work=>{
  const tags=allTags(work);
  return (!query||[work.title,work.author,...tags].filter(Boolean).join(' ').toLocaleLowerCase('zh-CN').includes(query))
   &&(state.scope!=='batch'||batchIds.has(work.id))
   &&(!state.audience||tags.includes(state.audience))
   &&(!state.status||(work.serializationStatus||'状态待核')===state.status)
   &&(!state.tag||tags.includes(state.tag));
 }).sort((a,b)=>{
  const av=fieldValue(a,state.sort||'total'),bv=fieldValue(b,state.sort||'total');
  if(av===null&&bv!==null)return 1;if(bv===null&&av!==null)return -1;
  const primary=av===null?0:(av-bv)*(state.direction==='asc'?1:-1);
  if(primary)return primary;
  const at=fieldValue(a,'total'),bt=fieldValue(b,'total');
  return (bt??-Infinity)-(at??-Infinity)||a.id.localeCompare(b.id);
 });
}
