import Stock from "../models/Stock.js";

export async function listStocks(req, res) {
  try {
    const { index } = req.query;
    
    let query = {};
    if (index) {
      query.index = index;
    }
    
    // 고유한 종목만 조회 (ticker 기준)
    const stocks = await Stock.find(query, {
      ticker: 1,
      name: 1,
      index: 1,
      price: 1,
      dividends2024: 1,
      _id: 0
    }).sort({ ticker: 1 }).lean();
    
    res.json(stocks);
  } catch (error) {
    console.error('종목 조회 오류:', error);
    res.status(500).json({ error: '종목 조회에 실패했습니다.' });
  }
}

// 인덱스별 통계 조회
export async function getIndexStats(req, res) {
  try {
    const stats = await Stock.aggregate([
      {
        $group: {
          _id: '$index',
          count: { $sum: 1 },
          totalDividends: {
            $sum: {
              $reduce: {
                input: '$dividends2024',
                initialValue: 0,
                in: { $add: ['$$value', '$$this.amount'] }
              }
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    res.json(stats);
  } catch (error) {
    console.error('인덱스 통계 조회 오류:', error);
    res.status(500).json({ error: '인덱스 통계 조회에 실패했습니다.' });
  }
}
