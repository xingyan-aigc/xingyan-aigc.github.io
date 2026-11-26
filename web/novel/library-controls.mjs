import {goldenFingerByWorkId} from './library-golden-fingers.mjs';
export const scored=work=>!!work.readerScore;
const audienceTags=new Set(['男频','女频','通用','受众待核']);
const isAudience=tag=>audienceTags.has(tag)||/^[男女]频-/.test(tag);
const platformTopics=new Set([
 '现代言情','古代言情','豪门总裁','现言脑洞','幻想言情','青春甜宠','职场婚恋',
 '玄幻言情','古言脑洞','古言权谋','宫斗宅斗','古风世情','民国言情','星光璀璨',
 '都市','都市日常','都市脑洞','都市高武','都市修真','都市种田','年代','乡村',
 '玄幻','传统玄幻','东方仙侠','仙侠','奇幻仙侠','历史脑洞','抗战谍战',
 '悬疑','悬疑脑洞','悬疑灵异','女频悬疑','悬疑恋爱','推理','破案','灵异','无限流',
 '科幻末世','末世','星际','游戏体育','惊悚游戏','家庭','职场','校园','种田','美食',
]);
export function topicTags(work){
 if(Array.isArray(work.storyTopics))return work.storyTopics;
 if(work.topicTags?.length)return [...new Set(work.topicTags.filter(tag=>tag&&!isAudience(tag)))];
 const categories=(work.platformTags||[]).filter(tag=>tag&&!isAudience(tag));
 return [...new Set(categories.filter((tag,index)=>index===0||platformTopics.has(tag)))];
}
export function detailTags(work){
 const summaryTags=new Set([work.storyBackground,...(work.specialSettings||[]),...topicTags(work)]);
 const details=work.contentTags?.length?work.contentTags:work.genreTags||[];
 return [...new Set(details.filter(tag=>!isAudience(tag)&&!summaryTags.has(tag)))];
}
const allTags=work=>[...(work.genreTags||[]),...(work.platformTags||[]),work.storyBackground,...(work.specialSettings||[]),...topicTags(work),...detailTags(work)];
export function fieldValue(work,key){
 const a=work.readerScore;
 const map={total:a?.total,readersScore:a?.total,
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
   &&(!state.goldenFinger||goldenFingerByWorkId.has(work.id)===(state.goldenFinger==='yes'))
   &&(!state.status||(work.serializationStatus||'状态待核')===state.status)
   &&(!state.topic||topicTags(work).includes(state.topic))
   &&(!state.detail||detailTags(work).includes(state.detail))
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
