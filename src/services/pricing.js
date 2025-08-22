export function annualDividendPerShare(stock) {
  if (!stock?.dividends2024) return 0;
  return stock.dividends2024.reduce((a, d) => a + (d.amount || 0), 0);
}
export function annualYield(stock) {
  const annual = annualDividendPerShare(stock);
  if (!stock?.price) return 0;
  return annual / stock.price;
}
