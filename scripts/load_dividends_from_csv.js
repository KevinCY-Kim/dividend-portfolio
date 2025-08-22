import "dotenv/config";
import fs from "fs";
import { parse } from "csv-parse/sync";
import mongoose from "mongoose";
import Stock from "../src/models/Stock.js";

const file = "./data/dividends_2024.csv";
if (!fs.existsSync(file)) {
  console.error("❌ CSV not found:", file);
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);

const text = fs.readFileSync(file, "utf-8");
const rows = parse(text, { columns:true, skip_empty_lines:true });

// 그룹핑
const byTicker = {};
for (const r of rows){
  // Expected columns: Index,Ticker,Name,Currency,EventDate,Dividend,Price
  const month = new Date(r.EventDate).getMonth()+1;
  if (!byTicker[r.Ticker]) byTicker[r.Ticker] = {
    ticker: r.Ticker,
    name: r.Name,
    currency: r.Currency || "USD",
    price: Number(r.Price) || 0,
    dividends2024: []
  };
  byTicker[r.Ticker].dividends2024.push({ month, amount: Number(r.Dividend)||0 });
}

for (const t of Object.values(byTicker)){
  await Stock.updateOne({ ticker: t.ticker }, t, { upsert: true });
}
console.log("✅ Seed done");
process.exit(0);
