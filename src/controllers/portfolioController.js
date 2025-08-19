import Stock from "../models/Stock.js";
import { greedyCover } from "../services/optimizer.js";

export async function getPortfolio(req,res){
  const { max = 6 } = req.query;
  const stocks = await Stock.find({}, { __v:0 }).lean();
  const result = greedyCover(stocks, Number(max));
  res.json({
    selected: result.selectedTickers,
    monthly_dividends_per_share: result.monthlyCash,
    coverage_months: result.coverage
  });
}
