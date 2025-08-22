async function loadTickers(){
  const sel = document.getElementById("ticker-select");
  if(!sel) return;
  const res = await fetch("/stocks");
  const data = await res.json();
  sel.innerHTML = data.map(d=>`<option value="${d.ticker}">${d.ticker} - ${d.name} (${d.price})</option>`).join("");
}
document.addEventListener("DOMContentLoaded", loadTickers);
