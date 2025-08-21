import Portfolio from "../models/Portfolio.js";
import Stock from "../models/Stock.js";

// 포트폴리오에 종목 추가
export async function addStockToPortfolio(req, res) {
  try {
    const { ticker, shares, averagePrice } = req.body;
    const userId = req.session.userId || "guest"; // 임시로 guest 사용

    if (!ticker || !shares || !averagePrice) {
      return res.status(400).json({ 
        error: "티커, 주식 수, 평균 가격이 필요합니다." 
      });
    }

    // 종목 정보 가져오기
    const stock = await Stock.findOne({ ticker: ticker });
    if (!stock) {
      return res.status(404).json({ error: "종목을 찾을 수 없습니다." });
    }

    // 포트폴리오 찾기 또는 생성
    let portfolio = await Portfolio.findOne({ userId: userId });
    
    if (!portfolio) {
      portfolio = new Portfolio({
        userId: userId,
        stocks: [],
        totalValue: 0,
        totalDividend: 0
      });
    }

    // 이미 포트폴리오에 있는 종목인지 확인
    const existingStockIndex = portfolio.stocks.findIndex(
      s => s.ticker === ticker
    );

    if (existingStockIndex !== -1) {
      // 기존 종목이면 주식 수와 평균 가격 업데이트
      const existingStock = portfolio.stocks[existingStockIndex];
      const totalShares = existingStock.shares + shares;
      const totalValue = (existingStock.shares * existingStock.averagePrice) + (shares * averagePrice);
      const newAveragePrice = totalValue / totalShares;
      
      portfolio.stocks[existingStockIndex] = {
        ...stock.toObject(),
        shares: totalShares,
        averagePrice: newAveragePrice,
        addedAt: new Date()
      };
    } else {
      // 새 종목 추가
      portfolio.stocks.push({
        ticker: stock.ticker,
        name: stock.name,
        index: stock.index,
        shares: shares,
        averagePrice: averagePrice,
        addedAt: new Date()
      });
    }

    // 포트폴리오 총 가치와 배당금 계산
    portfolio.totalValue = portfolio.stocks.reduce((sum, s) => {
      return sum + (s.shares * s.averagePrice);
    }, 0);

    portfolio.totalDividend = portfolio.stocks.reduce((sum, s) => {
      const stockDividend = stock.dividends2024.reduce((divSum, d) => divSum + d.amount, 0);
      return sum + (s.shares * stockDividend);
    }, 0);

    await portfolio.save();

    res.json({
      success: true,
      message: `${ticker}가 포트폴리오에 추가되었습니다.`,
      portfolio: portfolio
    });

  } catch (error) {
    console.error('포트폴리오 추가 오류:', error);
    res.status(500).json({ error: '포트폴리오 추가에 실패했습니다.' });
  }
}

// 포트폴리오 조회
export async function getPortfolio(req, res) {
  try {
    const userId = req.session.userId || "guest";
    
    const portfolio = await Portfolio.findOne({ userId: userId });
    
    if (!portfolio) {
      return res.json({
        stocks: [],
        totalValue: 0,
        totalDividend: 0
      });
    }

    // 각 종목의 현재 가격과 배당 정보 추가
    const enrichedStocks = await Promise.all(
      portfolio.stocks.map(async (stock) => {
        const currentStock = await Stock.findOne({ ticker: stock.ticker });
        if (currentStock) {
          const currentPrice = currentStock.price;
          const currentValue = stock.shares * currentPrice;
          const dividendYield = currentStock.dividends2024.reduce((sum, d) => sum + d.amount, 0) / currentPrice * 100;
          
          return {
            ...stock.toObject(),
            currentPrice: currentPrice,
            currentValue: currentValue,
            dividendYield: dividendYield.toFixed(2),
            gainLoss: currentValue - (stock.shares * stock.averagePrice),
            gainLossPercent: ((currentValue / (stock.shares * stock.averagePrice) - 1) * 100).toFixed(2)
          };
        }
        return stock;
      })
    );

    const totalCurrentValue = enrichedStocks.reduce((sum, s) => sum + (s.currentValue || 0), 0);
    const totalGainLoss = enrichedStocks.reduce((sum, s) => sum + (s.gainLoss || 0), 0);

    res.json({
      stocks: enrichedStocks,
      totalValue: totalCurrentValue,
      totalDividend: portfolio.totalDividend,
      totalGainLoss: totalGainLoss
    });

  } catch (error) {
    console.error('포트폴리오 조회 오류:', error);
    res.status(500).json({ error: '포트폴리오 조회에 실패했습니다.' });
  }
}

// 포트폴리오에서 종목 제거
export async function removeStockFromPortfolio(req, res) {
  try {
    const { ticker } = req.params;
    const userId = req.session.userId || "guest";

    const portfolio = await Portfolio.findOne({ userId: userId });
    if (!portfolio) {
      return res.status(404).json({ error: "포트폴리오를 찾을 수 없습니다." });
    }

    // 종목 제거
    portfolio.stocks = portfolio.stocks.filter(s => s.ticker !== ticker);
    
    // 포트폴리오 총 가치와 배당금 재계산
    portfolio.totalValue = portfolio.stocks.reduce((sum, s) => {
      return sum + (s.shares * s.averagePrice);
    }, 0);

    portfolio.totalDividend = portfolio.stocks.reduce((sum, s) => {
      const stockDividend = stock.dividends2024.reduce((divSum, d) => divSum + d.amount, 0);
      return sum + (s.shares * stockDividend);
    }, 0);

    await portfolio.save();

    res.json({
      success: true,
      message: `${ticker}가 포트폴리오에서 제거되었습니다.`,
      portfolio: portfolio
    });

  } catch (error) {
    console.error('포트폴리오 제거 오류:', error);
    res.status(500).json({ error: '포트폴리오 제거에 실패했습니다.' });
  }
}
