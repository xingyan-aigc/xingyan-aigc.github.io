import {show, score, link} from './page-data.js';

export function renderAdaptation({snapshot, scored}) {
 const ratings = snapshot.adaptationScores || {};
 const reviewed = scored.filter(work => ratings[work.id]);
 const candidates = reviewed.filter(work => !ratings[work.id].formatExclusion);
 const exploration = candidates.filter(work => ratings[work.id].exploration);
 const eligible = candidates.filter(work => !ratings[work.id].exploration);
 document.querySelector('#exploration-count').textContent = `探索候选（${exploration.length} 部）`;
 const explorationList = document.querySelector('#adaptation-exploration');
 for (const work of exploration) {
  const item = show('li', '');
  item.append(link(work.title, work.reportUrl + '?from=adaptation'));
  item.append(document.createTextNode(ratings[work.id].marketStatus === 'pending'
   ? ' · 市场待复核 · 审核风险较高' : ' · 市场复核后加 0 分 · 审核风险较高'));
  explorationList.append(item);
 }
 eligible.sort((a, b) => ratings[b.id].total - ratings[a.id].total ||
  b.assessment.total - a.assessment.total || a.id.localeCompare(b.id));
 document.querySelector('#adaptation-coverage').textContent =
  `已完成审核风险评估 ${reviewed.length}／${scored.length} 部，其中 ${reviewed.length - candidates.length} 部因作品形式未入榜。最多展示 20 部。`;
 const container = document.querySelector('#adaptation-ranking');
 for (const [index, work] of eligible.slice(0, 20).entries()) {
  const risk = ratings[work.id];
  const card = show('article', '', 'rank-card adaptation-card');
  const details = show('div', '');
  const title = show('h3', '');
  title.append(link(work.title, work.reportUrl + '?from=adaptation'));
  const original = work.assessment;
  const bonus = risk.marketBonus ?? 0;
  details.append(title, show('p', `原著 ${score(original.total)} ＋ 市场 ${bonus} − 审核 ${risk.deduction} ＝ 改编 ${score(risk.total)} 分`, 'adaptation-formula'));
  if (index === 0 && eligible.length > 1) {
   const runnerUp = eligible[1];
   const other = ratings[runnerUp.id];
   const gap = risk.total - other.total;
   const parts = [
    ['原著分', original.total - runnerUp.assessment.total],
    ['市场加分', bonus - (other.marketBonus ?? 0)],
    ['审核少扣', other.deduction - risk.deduction],
   ].filter(([, delta]) => Math.abs(delta) >= 0.005);
   const breakdown = parts.map(([label, delta]) => `${label} ${delta > 0 ? '+' : '−'}${score(Math.abs(delta))}`).join('、');
   const comparison = gap > 0
    ? `榜首差值 · 较第 2 名《${runnerUp.title}》高 ${score(gap)} 分${breakdown ? `（${breakdown}）` : ''}。`
    : `与第 2 名《${runnerUp.title}》改编分并列，按原著分、作品 ID 依次排序。`;
   details.append(show('p', comparison, 'adaptation-comparison'));
  }
  const parts = original.contributions;
  if (parts) {
   const market = original.marketParts;
   const readerDetail = market ? `（口碑 ${score(market.rating)}＋在读 ${score(market.readership)}）` : '';
   details.append(show('p', `原著评分构成 · 正文 ${score(parts.opening)}＋读者 ${score(parts.readers)}${readerDetail}。`, 'book-meta'));
  }
  const marketExplanation = risk.marketStatus === 'pending'
   ? '待复核，试算暂加 0 分。'
   : bonus > 0
    ? `有 ${risk.marketSamples.length} 个独立可比 IP 支撑，加 ${bonus} 分。`
    : '已复核，暂无直接可比样本，加 0 分。';
  const evidence = show('details', '', 'adaptation-evidence');
  evidence.append(show('summary', '评估依据'), show('h4', '市场匹配'), show('p', marketExplanation));
  if (risk.marketReason) evidence.append(show('p', risk.marketReason, 'criterion-reason'));
  if (risk.marketSamples?.length) {
   const list = show('ul', '');
   for (const sample of risk.marketSamples) {
    list.append(show('li', `《${sample.title}》 · ${sample.match}`));
   }
   evidence.append(list);
  }
  if (risk.radarDate) evidence.append(show('p', `雷达数据截至 ${risk.radarDate}`, 'book-meta'));
  if (risk.exceptionReason) evidence.append(show('p', '破格理由 · ' + risk.exceptionReason, 'criterion-reason'));
  if (risk.reason) {
   evidence.append(show('h4', '审核风险'));
   const basis = risk.deductionProvisional ? '按现有风险档暂扣' : '复核后扣';
   evidence.append(show('p', `${risk.risk}风险，${basis} ${risk.deduction} 分。${risk.reason}`, 'criterion-reason'));
  }
  details.append(evidence);
  details.append(link('查看原著评分和章节依据 →', work.reportUrl + '?from=adaptation#calculation', 'report-link'));
  card.append(show('div', String(index + 1).padStart(2, '0'), 'rank-number'),
   details, show('div', score(risk.total), 'score'));
  container.append(card);
 }
}
