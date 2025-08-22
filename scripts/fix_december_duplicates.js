import "dotenv/config";
import mongoose from "mongoose";
import Stock from "../src/models/Stock.js";

// MongoDB 연결
await mongoose.connect(process.env.MONGO_URI);

console.log("🔍 12월 배당 중복 검사 및 수정 중...");

// 12월 배당이 있는 모든 종목 조회
const stocks = await Stock.find({'dividends2024.month': 12});
console.log(`📊 12월 배당이 있는 종목 ${stocks.length}개 검사 중...`);

let fixedCount = 0;
let totalRemoved = 0;

for (const stock of stocks) {
  if (stock.dividends2024 && stock.dividends2024.length > 0) {
    // 12월 배당만 필터링
    const decemberDividends = stock.dividends2024.filter(d => d.month === 12);
    
    if (decemberDividends.length > 1) {
      console.log(`🔧 ${stock.ticker}: 12월 배당 ${decemberDividends.length}개 중복 발견`);
      
      // 12월 배당 중복 제거 (첫 번째 것만 유지)
      const firstDecember = decemberDividends[0];
      const otherDividends = stock.dividends2024.filter(d => !(d.month === 12 && d._id.toString() !== firstDecember._id.toString()));
      
      // 중복 제거된 배열로 업데이트
      await Stock.updateOne(
        { _id: stock._id },
        { $set: { dividends2024: otherDividends } }
      );
      
      console.log(`   ✅ 첫 번째 배당 유지: $${firstDecember.amount}, ${decemberDividends.length - 1}개 제거`);
      fixedCount++;
      totalRemoved += decemberDividends.length - 1;
    }
  }
}

console.log(`\n✅ 12월 배당 중복 제거 완료:`);
console.log(`   - 수정된 종목: ${fixedCount}개`);
console.log(`   - 제거된 중복 배당: ${totalRemoved}개`);

// 수정 후 결과 확인
console.log(`\n📋 수정된 종목들의 최종 상태:`);
const updatedStocks = await Stock.find({'dividends2024.month': 12});
for (const stock of updatedStocks) {
  const decemberCount = stock.dividends2024.filter(d => d.month === 12).length;
  if (decemberCount > 0) {
    const decemberDividends = stock.dividends2024.filter(d => d.month === 12);
    console.log(`   ${stock.ticker}: 12월 배당 ${decemberCount}개 - $${decemberDividends.map(d => d.amount).join(', ')}`);
  }
}

// 전체 배당 데이터 품질 검사
console.log(`\n🔍 전체 배당 데이터 품질 검사:`);
const allStocks = await Stock.find({});
let totalDividends = 0;
let duplicateMonths = 0;

for (const stock of allStocks) {
  if (stock.dividends2024 && stock.dividends2024.length > 0) {
    totalDividends += stock.dividends2024.length;
    
    // 월별 중복 검사
    const monthCounts = {};
    stock.dividends2024.forEach(d => {
      monthCounts[d.month] = (monthCounts[d.month] || 0) + 1;
    });
    
    Object.values(monthCounts).forEach(count => {
      if (count > 1) duplicateMonths += count - 1;
    });
  }
}

console.log(`   - 총 종목 수: ${allStocks.length}`);
console.log(`   - 총 배당 데이터 수: ${totalDividends}`);
console.log(`   - 월별 중복 배당 수: ${duplicateMonths}`);

if (duplicateMonths > 0) {
  console.log(`   ⚠️  여전히 ${duplicateMonths}개의 월별 중복이 있습니다.`);
} else {
  console.log(`   ✅ 모든 월별 중복이 제거되었습니다.`);
}

process.exit(0);
