import mongoose from "mongoose";

const StockSchema = new mongoose.Schema({
  index: String,
  ticker: { type: String, index: true, required: true, unique: true },
  name: String,
  currency: { type: String, default: "USD" },
  price: { type: Number, required: true },
  lastPriceUpdate: { type: Date, default: Date.now },
  dividends2024: [{
    month: Number,  // 1-12월
    amount: Number,  // 배당금
    eventDate: String  // 배당 이벤트 날짜
  }]
}, {
  timestamps: true  // createdAt, updatedAt 자동 생성
});

export default mongoose.model("Stock", StockSchema);
