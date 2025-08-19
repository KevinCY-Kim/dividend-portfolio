import mongoose from "mongoose";

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
