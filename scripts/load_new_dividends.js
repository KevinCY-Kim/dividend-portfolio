import "dotenv/config";
import fs from "fs";
import { parse } from "csv-parse/sync";
import mongoose from "mongoose";
import Stock from "../src/models/Stock.js";

// MongoDB 연결
await mongoose.connect(process.env.MONGO_URI);

// 기존 데이터 삭제
console.log("🗑️ 기존 데이터 삭제 중...");
await Stock.deleteMany({});
console.log("✅ 기존 데이터 삭제 완료");

// 데이터 파일들
const dataFiles = [
  { file: "./data/nasdaq100_dividends_events.csv", index: "NASDAQ-100" },
  { file: "./data/sp500_dividends_events.csv", index: "S&P 500" },
  { file: "./data/us_etf_dividends_events.csv", index: "US ETF" }
];

// 모든 데이터를 통합하여 처리
const allStocks = {};

for (const { file, index } of dataFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ CSV 파일을 찾을 수 없습니다: ${file}`);
    continue;
  }

  console.log(`📊 ${index} 데이터 처리 중...`);
  const text = fs.readFileSync(file, "utf-8");
  const rows = parse(text, { columns: true, skip_empty_lines: true });

  for (const row of rows) {
    const ticker = row.Ticker;
    
    if (!allStocks[ticker]) {
      allStocks[ticker] = {
        ticker: ticker,
        name: row.Name,
        index: index,
        currency: row.Currency || "USD",
        price: Number(row.Priced) || 100,
        dividends2024: []
      };
    }

    // EventDate가 2024년 7월 이후인 경우만 포함 (최근 1년)
    const eventDate = new Date(row.EventDate);
    const cutoffDate = new Date('2024-07-01');
    
    if (eventDate >= cutoffDate) {
      const month = eventDate.getMonth() + 1;
      const year = eventDate.getFullYear();
      
      // 2024년 7월부터 2025년 7월까지의 데이터
      if (year === 2024 || (year === 2025 && month <= 7)) {
        allStocks[ticker].dividends2024.push({
          month: month,
          amount: Number(row.Dividend) || 0,
          eventDate: row.EventDate
        });
      }
    }
  }
}

// 데이터베이스에 저장
console.log("💾 데이터베이스에 저장 중...");
let savedCount = 0;

for (const stock of Object.values(allStocks)) {
  if (stock.dividends2024.length > 0) {
    await Stock.create(stock);
    savedCount++;
  }
}

console.log(`✅ 총 ${savedCount}개 종목 저장 완료`);

// 인덱스별 통계
const stats = {};
for (const stock of Object.values(allStocks)) {
  if (!stats[stock.index]) {
    stats[stock.index] = { count: 0, totalDividends: 0 };
  }
  stats[stock.index].count++;
  stats[stock.index].totalDividends += stock.dividends2024.reduce((sum, d) => sum + d.amount, 0);
}

console.log("\n📊 인덱스별 통계:");
for (const [index, stat] of Object.entries(stats)) {
  console.log(`${index}: ${stat.count}개 종목, 총 배당금: $${stat.totalDividends.toFixed(2)}`);
}

process.exit(0);
