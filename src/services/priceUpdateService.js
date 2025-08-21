import cron from 'node-cron';
import axios from 'axios';
import Stock from '../models/Stock.js';

class PriceUpdateService {
  constructor() {
    this.isRunning = false;
    this.lastUpdate = null;
  }

  // 서비스 시작
  start() {
    console.log('🚀 주식 가격 업데이트 서비스 시작');
    
    // 매일 미국 동부시간 오후 5시 (장 종료 1시간 후)에 실행
    // UTC 기준으로는 오전 9시 (EDT 기준 오후 5시)
    cron.schedule('0 9 * * 1-5', () => {
      this.updateAllStockPrices();
    }, {
      timezone: 'America/New_York'
    });

    // 개발용: 1분마다 실행 (테스트용)
    if (process.env.NODE_ENV === 'development') {
      cron.schedule('*/1 * * * *', () => {
        console.log('🔄 개발 모드: 1분마다 가격 업데이트 체크');
        this.updateAllStockPrices();
      });
    }
  }

  // 모든 주식 가격 업데이트
  async updateAllStockPrices() {
    if (this.isRunning) {
      console.log('⏳ 이미 가격 업데이트가 진행 중입니다.');
      return;
    }

    this.isRunning = true;
    console.log('📈 주식 가격 업데이트 시작:', new Date().toISOString());

    try {
      // 데이터베이스에서 모든 종목 가져오기
      const stocks = await Stock.find({}, { ticker: 1, _id: 1 });
      console.log(`📊 총 ${stocks.length}개 종목 가격 업데이트 시작`);

      // 배치 처리로 가격 업데이트 (API 호출 제한 고려)
      const batchSize = 10;
      let updatedCount = 0;
      let errorCount = 0;

      for (let i = 0; i < stocks.length; i += batchSize) {
        const batch = stocks.slice(i, i + batchSize);
        
        // 배치별로 병렬 처리
        const promises = batch.map(stock => this.updateStockPrice(stock.ticker));
        const results = await Promise.allSettled(promises);
        
        results.forEach(result => {
          if (result.status === 'fulfilled') {
            updatedCount++;
          } else {
            errorCount++;
            console.error('❌ 가격 업데이트 실패:', result.reason);
          }
        });

        // API 호출 제한을 위한 딜레이
        if (i + batchSize < stocks.length) {
          await this.delay(1000); // 1초 대기
        }
      }

      this.lastUpdate = new Date();
      console.log(`✅ 가격 업데이트 완료: ${updatedCount}개 성공, ${errorCount}개 실패`);
      console.log(`🕐 마지막 업데이트: ${this.lastUpdate.toISOString()}`);

    } catch (error) {
      console.error('❌ 가격 업데이트 중 오류 발생:', error);
    } finally {
      this.isRunning = false;
    }
  }

  // 개별 주식 가격 업데이트
  async updateStockPrice(ticker) {
    try {
      // Yahoo Finance API를 사용하여 실시간 가격 가져오기
      const price = await this.getStockPrice(ticker);
      
      if (price && price > 0) {
        await Stock.updateOne(
          { ticker: ticker },
          { 
            $set: { 
              price: price,
              lastPriceUpdate: new Date()
            }
          }
        );
        
        console.log(`✅ ${ticker}: $${price}`);
        return { ticker, price, success: true };
      } else {
        console.warn(`⚠️ ${ticker}: 가격 정보를 가져올 수 없음`);
        return { ticker, price: null, success: false };
      }
    } catch (error) {
      console.error(`❌ ${ticker} 가격 업데이트 실패:`, error.message);
      return { ticker, price: null, success: false, error: error.message };
    }
  }

  // Yahoo Finance API에서 주식 가격 가져오기
  async getStockPrice(ticker) {
    try {
      // Yahoo Finance API 엔드포인트
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`;
      
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (response.data && response.data.chart && response.data.chart.result) {
        const result = response.data.chart.result[0];
        const meta = result.meta;
        
        if (meta && meta.regularMarketPrice) {
          return meta.regularMarketPrice;
        }
      }
      
      return null;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.warn(`⚠️ ${ticker}: 종목을 찾을 수 없음`);
      } else {
        console.error(`❌ ${ticker} API 호출 실패:`, error.message);
      }
      return null;
    }
  }

  // 수동 가격 업데이트 (API 엔드포인트용)
  async manualUpdate(ticker) {
    console.log(`🔧 수동 가격 업데이트: ${ticker}`);
    return await this.updateStockPrice(ticker);
  }

  // 서비스 상태 확인
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastUpdate: this.lastUpdate,
      serviceStatus: 'running'
    };
  }

  // 딜레이 함수
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new PriceUpdateService();

