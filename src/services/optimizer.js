import { annualDividendPerShare, annualYield } from "./pricing.js";

export function buildMonthlyVector(stock){
  const v = Array(12).fill(0);
  for (const d of stock.dividends2024 || []) {
    if (d?.month >= 1 && d?.month <= 12) v[d.month-1] += Number(d.amount || 0);
  }
  return v;
}
const add = (a,b)=>a.map((x,i)=>x+(b[i]||0));
const zeros = v => v.filter(x=>x===0).length;

// Greedy: 빈 달 커버 우선 + 수익률 보정
export function greedyCover(stocks, maxCount=6){
  const enriched = (stocks||[]).map(s=>{
    const v = buildMonthlyVector(s);
    const annual = annualDividendPerShare(s);
    const y = annualYield(s);
    return { ...s, __vMonthly: v, __annual: annual, __yield: y };
  });

  let chosen = [];
  let acc = Array(12).fill(0);

  while (chosen.length < maxCount){
    let best=null, bestScore=-Infinity;
    for (const s of enriched){
      if (chosen.includes(s.ticker)) continue;
      const merged = add(acc, s.__vMonthly);
      const gain = zeros(acc) - zeros(merged);   // 새로 채운 달 수
      const score = gain*10 + (s.__yield||0)*5;
      if (score > bestScore){ bestScore=score; best=s; }
    }
    if (!best) break;
    chosen.push(best.ticker);
    acc = add(acc, best.__vMonthly);
    if (zeros(acc)===0) break;
  }
  return { selectedTickers: chosen, monthlyCash: acc, coverage: 12-zeros(acc) };
}
