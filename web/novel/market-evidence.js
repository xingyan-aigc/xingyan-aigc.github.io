const area=document.getElementById('market-evidence');
if(area){
 const id=location.pathname.split('/').pop().replace('.html','');
 const add=(tag,text,parent=area,cls='')=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;parent.append(e);return e;};
 const labels={hot:'综合热播榜',real:'真人榜',ai:'AI剧榜',comic:'漫剧榜'};
 const ranks=value=>Object.entries(value||{}).map(([k,v])=>`${labels[k]||k}第${v}`).join('、')||'未见于当日所采四榜';
 try{
  const response=await fetch(`../market-evidence/${id}.json`,{cache:'no-store'});
  if(response.status===404){add('h2','短剧市场佐证');add('p','本书尚未完成市场对照，暂无佐证结论。');}
  else{
   if(!response.ok)throw Error('读取失败');const d=await response.json();
   add('p','MARKET / 短剧市场佐证',area,'section-kicker');add('h2',d.needsReview?'数据版本已变化，市场结论待复核':d.verdict);
   const time=new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',dateStyle:'medium',timeStyle:'short'}).format(new Date(d.radar.fetched_at));
   add('p',`雷达采集 ${time}（北京时间） · 结论核对 ${d.reviewedAt} · 独立展示，不计入综合分`,area,'section-intro');
   if(d.needsReview)add('p','下列判断是上次核对的结论；榜单或小说版本已变，更新的数字不能自动代表判断仍成立。',area,'criterion-reason');
   add('p',d.summary,area,'criterion-reason');
   const grid=add('div','',area,'finding-grid');
   for(const [title,items]of [['支持证据',d.strengths],['限制与反向证据',d.limits]]){const panel=add('div','',grid,'finding-panel');add('h3',title,panel);const ul=add('ul','',panel);for(const item of items)add('li',item,ul);}
   const own=add('details','',area,'rubric');add('summary','本书哪些卖点有原文章节依据？',own);const ul=add('ul','',own);for(const item of d.novelEvidence)add('li',`${item.feature} · ${item.chapters}：${item.evidence}`,ul);
   add('h3',`逐部对照 · ${d.comparables.length}部作品（续季不重复计独立验证）`,area);
   for(const c of d.comparables){const panel=add('article','',area,'finding-panel market-comparable');const heading=add('h3','',panel);const a=add('a',c.title,heading);a.href=c.radarUrl;
    add('p',`${c.level} · 当前：${ranks(c.latest.ranks)} · 观察期最佳：${ranks(c.bestRanks)} · 观察期上榜 ${c.observedRankedDays} 天`,panel,'section-intro');
    add('p',`相似处：${c.match}`,panel);add('p',`关键差异：${c.difference}`,panel);
    add('p',`最近在榜 ${c.lastRankedDate||'待核'} · 最新收藏 ${c.lastPoint.fav==null?'暂无':new Intl.NumberFormat('zh-CN').format(c.lastPoint.fav)}`,panel,'section-intro');
    const detail=add('details','',panel);add('summary','查看雷达原始简介',detail);add('p',c.synopsis,detail);
   }
   add('p',`${d.coverage.method} 观察范围 ${d.coverage.days} 天；当前四榜去重 ${d.coverage.currentUniqueRanked} 部。${d.businessAssumption}`,area,'section-intro');
  }
 }catch{add('h2','短剧市场佐证');add('p','市场对照暂时读取失败，请刷新重试。');}
}
