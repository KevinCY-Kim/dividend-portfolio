import mongoose from "mongoose";

<<<<<<< HEAD
const DividendSchema = new mongoose.Schema({
  month: { type: Number, min:1, max:12, required: true },
  amount: { type: Number, required: true } // per-share dividend
}, { _id: false });

const StockSchema = new mongoose.Schema({
  ticker: { type: String, index: true, required: true },
  name: String,
  currency: { type: String, default: "USD" },
  price: { type: Number, required: true },
  dividends2024: [DividendSchema],
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Stock", StockSchema);
=======
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
>>>>>>> update for dividend
