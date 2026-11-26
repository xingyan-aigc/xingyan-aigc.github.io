import {show,number,date,score,link,tags,field,prose,platformScore} from './page-data.js?v=20261107-platform-score-2';
export function renderRecords({snapshot,scored,batch}){
 document.querySelector("#collected-at").textContent=snapshot.collectedAt?`数据采集 ${date(snapshot.collectedAt)}`:'尚未采集 · 等待指令';
 const library=snapshot.works||[];
 const complete=library.filter(w=>w.coverage?.complete).length;
 const unresolved=(snapshot.failures?.length||0)+batch.filter(w=>w.status==='retry').length;
 const chars=library.reduce((n,w)=>n+(w.characters||0),0);
 for(const [label,value]of[['书库已入库',library.length+' 部'],['已采章节',number.format(library.reduce((n,w)=>n+w.chapterCount,0))+' 章'],['已采正文',(chars/10000).toFixed(1)+' 万字符'],['完整目录核验',complete+' / '+library.length],['库内待整理',library.filter(w=>w.analysisStatus!=='complete').length+' 部'],['未处理异常',unresolved+' 项']]){const c=document.createElement('div');c.append(show('strong',value),show('span',label));document.querySelector('#counts').append(c);}
 const facts=[['采集来源','红果漫剧IP库 · 潜力IP · 番茄网文'],['筛选条件','上架一年内 · 已完结或未完结且大于30万字 · 已上架漫剧为0部 · 全文字数>10万无上限'],['平台门槛','评分≥8 · 在读≥1万无上限 · 评分人数不限'],['题材与受众','全部不限'],['采集顺序','先评分档降序，每档内在读档从50万以上向下'],['内容范围','当前账号可读目录全部章节，不固定20章，不推断未采后文'],['档案输出','基础信息、原始简介、正文简介；关键描述标注章节，卡片含具体标签和一句话简介'],['排名依据','仅原读者分25分：平台口碑12＋在读规模13；全库排序'],['正文评分','已取消七维和综合评分，不对小说内容打分'],['收纳进度',worksLabel(snapshot.works||[])],['当前批次','采集数量与待整理进度见采集进度页'],['最近完成批次',snapshot.lastCompletedBatch?`${snapshot.lastCompletedBatch.count}部已全部整理入库 · ${date(snapshot.lastCompletedBatch.completedAt)}`:'尚无完成记录'],['当前任务',snapshot.currentTask||((snapshot.works||[]).length>=70?'书库累计70部已到上限，采集与整理已停止，等待指令':'持续整理至书库累计70部后停止')]];
 for(const [label,value]of facts){const row=document.createElement('div');row.append(show('dt',label),show('dd',value));document.querySelector('#record-details').append(row);}
 if(snapshot.failures?.length){const d=document.createElement('details');d.append(show('summary',`待处理采集记录 · ${snapshot.failures.length} 部`));const ul=document.createElement('ul');for(const f of snapshot.failures)ul.append(show('li',f.title));d.append(ul);document.querySelector('#failures').append(d);}

}

function worksLabel(works){return `${works.length}部已收纳，${works.filter(w=>w.analysisStatus==='complete').length}部正文简介已整理`;}
