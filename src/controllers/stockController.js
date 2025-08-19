import Stock from "../models/Stock.js";

export async function listStocks(req,res){
  const list = await Stock.find({}, {ticker:1,name:1,price:1,_id:0}).sort({ticker:1}).lean();
  res.json(list);
}
