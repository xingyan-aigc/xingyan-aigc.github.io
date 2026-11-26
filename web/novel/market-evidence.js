const area = document.getElementById('market-evidence');
if (area) {
 const id = location.pathname.split('/').pop().replace(/\.html$/, '');
 const add = (tag, text, parent = area) => {
  const element = document.createElement(tag);
  element.textContent = text;
  parent.append(element);
  return element;
 };
 try {
  const response = await fetch('../market-evidence/' + id + '.json', {cache: 'no-store'});
  if (response.status === 404) {
   add('p', '本书尚未完成雷达对照。');
  } else {
   if (!response.ok) throw new Error('读取失败');
   const data = await response.json();
   const window = data.recentWindow;
   if (window) add('p', window.start + ' 至 ' + window.end + ' · 有榜单记录 ' + window.observedDays + ' 天');
   if (data.needsReview) add('p', '相似点沿用此前人工对照，榜单表现按上述日期重新统计。');
   for (const [key, label] of [['ai', 'AI 短剧榜'], ['comic', 'AI 漫剧榜']]) {
    add('h3', label);
    const matches = data.comparables.filter(item => item.recentRanks?.[key]);
    if (!matches.length) {
     add('p', '已有对照样本在该榜暂无明确的近 7 天信号。');
     continue;
    }
    const list = add('ul', '');
    for (const item of matches) {
     const rank = item.recentRanks[key];
     add('li', item.title + ' · 最佳第 ' + rank.best + ' 名 · 上榜 ' + rank.days + ' 天。相似点：' + item.match + '。差异：' + item.difference, list);
    }
   }
  }
 } catch {
  add('p', '雷达数据暂时读取失败。');
 }
}
