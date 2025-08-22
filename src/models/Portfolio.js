import mongoose from "mongoose";

const PortfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stocks: [{
    ticker: {
      type: String,
      required: true
    },
    name: String,
    index: String,
    shares: {
      type: Number,
      required: true,
      min: 0
    },
    averagePrice: {
      type: Number,
      required: true,
      min: 0
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalValue: {
    type: Number,
    default: 0
  },
  totalDividend: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// 사용자별로 고유한 포트폴리오 보장
PortfolioSchema.index({ userId: 1 }, { unique: true });

export default mongoose.model("Portfolio", PortfolioSchema);
