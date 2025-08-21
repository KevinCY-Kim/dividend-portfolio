import "dotenv/config";
import mongoose from "mongoose";
import Stock from "../src/models/Stock.js";

// MongoDB 연결
await mongoose.connect(process.env.MONGO_URI);

console.log("🔍 중복 배당 데이터 검사 및 수정 중...");

// 모든 종목 조회
const stocks = await Stock.find({});
console.log(`📊 총 ${stocks.length}개 종목 검사 중...`);

let fixedCount = 0;

for (const stock of stocks) {
  if (stock.dividends2024 && stock.dividends2024.length > 0) {
    const originalLength = stock.dividends2024.length;
    
    // 중복 제거: month와 amount가 같은 항목 제거
    const uniqueDividends = [];
    const seen = new Set();
    
    for (const dividend of stock.dividends2024) {
      const key = `${dividend.month}-${dividend.amount}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueDividends.push(dividend);
      }
    }
    
    // 중복이 제거된 경우에만 업데이트
    if (uniqueDividends.length < originalLength) {
      console.log(`🔧 ${stock.ticker}: ${originalLength}개 → ${uniqueDividends.length}개 (중복 제거)`);
      
      await Stock.updateOne(
        { _id: stock._id },
        { $set: { dividends2024: uniqueDividends } }
      );
      
      fixedCount++;
    }
  }
}

console.log(`✅ 중복 제거 완료: ${fixedCount}개 종목 수정됨`);

// AAPL 데이터 확인
const aapl = await Stock.findOne({ ticker: 'AAPL' });
if (aapl) {
  console.log(`\n📱 AAPL 최종 상태:`);
  console.log(`   배당 개수: ${aapl.dividends2024.length}`);
  aapl.dividends2024.forEach(d => {
    console.log(`   ${d.month}월: $${d.amount}`);
  });
}

process.exit(0);
