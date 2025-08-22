import express from "express";
import Stock from "../models/Stock.js";

const router = express.Router();

// 챗봇용 주식 데이터 조회 API
router.get("/stocks-data", async (req, res) => {
  try {
    // MongoDB에서 모든 주식 데이터 조회
    const stocks = await Stock.find({}).select('index ticker name price dividends2024');
    
         // 챗봇이 이해할 수 있는 형태로 데이터 변환 (최근 1년간 배당 정보)
     const formattedStocks = stocks.map(stock => {
       const dividends = stock.dividends2024.map(d => ({
         month: d.month,
         amount: d.amount,
         eventDate: d.eventDate
       }));
       
       return {
         index: stock.index,
         ticker: stock.ticker,
         name: stock.name,
         price: stock.price,
         dividends: dividends
       };
     });
    
    res.json({
      success: true,
      data: formattedStocks,
      count: formattedStocks.length
    });
    
  } catch (error) {
    console.error("❌ 챗봇 데이터 조회 실패:", error);
    res.status(500).json({
      success: false,
      error: "데이터 조회 중 오류가 발생했습니다."
    });
  }
});

// 특정 종목의 상세 정보 조회
router.get("/stock/:ticker", async (req, res) => {
  try {
    const { ticker } = req.params;
    const stock = await Stock.findOne({ ticker: ticker.toUpperCase() });
    
    if (!stock) {
      return res.status(404).json({
        success: false,
        error: "해당 종목을 찾을 수 없습니다."
      });
    }
    
    // 연간 배당금 계산
    const annualDividend = stock.dividends2024.reduce((sum, d) => sum + (d.amount || 0), 0);
    const dividendYield = stock.price > 0 ? (annualDividend / stock.price * 100).toFixed(2) : 0;
    
    const stockInfo = {
      ticker: stock.ticker,
      name: stock.name,
      index: stock.index,
      price: stock.price,
      annualDividend: annualDividend,
      dividendYield: dividendYield,
      dividends: stock.dividends2024.map(d => ({
        month: d.month,
        amount: d.amount,
        eventDate: d.eventDate
      }))
    };
    
    res.json({
      success: true,
      data: stockInfo
    });
    
  } catch (error) {
    console.error("❌ 종목 정보 조회 실패:", error);
    res.status(500).json({
      success: false,
      error: "종목 정보 조회 중 오류가 발생했습니다."
    });
  }
});

// 인덱스별 종목 목록 조회
router.get("/index/:indexName", async (req, res) => {
  try {
    const { indexName } = req.params;
    const stocks = await Stock.find({ index: indexName }).select('ticker name price dividends2024');
    
    const formattedStocks = stocks.map(stock => {
      const annualDividend = stock.dividends2024.reduce((sum, d) => sum + (d.amount || 0), 0);
      const dividendYield = stock.price > 0 ? (annualDividend / stock.price * 100).toFixed(2) : 0;
      
      return {
        ticker: stock.ticker,
        name: stock.name,
        price: stock.price,
        annualDividend: annualDividend,
        dividendYield: dividendYield
      };
    });
    
    res.json({
      success: true,
      data: formattedStocks,
      count: formattedStocks.length
    });
    
  } catch (error) {
    console.error("❌ 인덱스별 종목 조회 실패:", error);
    res.status(500).json({
      success: false,
      error: "인덱스별 종목 조회 중 오류가 발생했습니다."
    });
  }
});

// 배당 수익률 기준 정렬된 종목 목록
router.get("/top-dividend-yield", async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const stocks = await Stock.find({}).select('ticker name price dividends2024');
    
    const stocksWithYield = stocks.map(stock => {
      const annualDividend = stock.dividends2024.reduce((sum, d) => sum + (d.amount || 0), 0);
      const dividendYield = stock.price > 0 ? (annualDividend / stock.price * 100) : 0;
      
      return {
        ticker: stock.ticker,
        name: stock.name,
        price: stock.price,
        annualDividend: annualDividend,
        dividendYield: dividendYield
      };
    }).filter(stock => stock.dividendYield > 0)
      .sort((a, b) => b.dividendYield - a.dividendYield)
      .slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: stocksWithYield,
      count: stocksWithYield.length
    });
    
  } catch (error) {
    console.error("❌ 배당 수익률 순 조회 실패:", error);
    res.status(500).json({
      success: false,
      error: "배당 수익률 순 조회 중 오류가 발생했습니다."
    });
  }
});

export default router;
