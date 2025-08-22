import cron from 'node-cron';
import axios from 'axios';
import Stock from '../models/Stock.js';

class PriceUpdateService {
  constructor() {
    this.isRunning = false;
    this.lastUpdate = null;
    this.requestCount = 0;
    this.lastRequestTime = 0;
    
    // 봇탐지 회피를 위한 User-Agent 목록
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];
    
    // Rate Limiting 설정
    this.rateLimit = {
      maxRequests: 50,  // 최대 요청 수
      timeWindow: 60000, // 1분 (밀리초)
      minDelay: 1000,   // 최소 딜레이 (1초)
      maxDelay: 3000    // 최대 딜레이 (3초)
    };
  }

  // 랜덤 User-Agent 선택
  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  // Rate Limiting 체크 및 딜레이
  async checkRateLimit() {
    const now = Date.now();
    
    // 시간 윈도우 체크
    if (now - this.lastRequestTime > this.rateLimit.timeWindow) {
      this.requestCount = 0;
      this.lastRequestTime = now;
    }
    
    // 요청 수 제한 체크
    if (this.requestCount >= this.rateLimit.maxRequests) {
      const waitTime = this.rateLimit.timeWindow - (now - this.lastRequestTime);
      console.log(`⏳ Rate limit 도달. ${waitTime}ms 대기...`);
      await this.delay(waitTime);
      this.requestCount = 0;
      this.lastRequestTime = Date.now();
    }
    
    // 랜덤 딜레이 적용
    const randomDelay = Math.random() * (this.rateLimit.maxDelay - this.rateLimit.minDelay) + this.rateLimit.minDelay;
    await this.delay(randomDelay);
    
    this.requestCount++;
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
      const batchSize = 5; // 배치 크기 줄임 (Rate Limiting 고려)
      let updatedCount = 0;
      let errorCount = 0;

      for (let i = 0; i < stocks.length; i += batchSize) {
        const batch = stocks.slice(i, i + batchSize);
        
        // Rate Limiting 체크
        await this.checkRateLimit();
        
        // 배치별로 순차 처리 (병렬 처리 대신)
        for (const stock of batch) {
          try {
            const result = await this.updateStockPrice(stock.ticker);
            if (result.success) {
              updatedCount++;
            } else {
              errorCount++;
            }
          } catch (error) {
            errorCount++;
            console.error(`❌ ${stock.ticker} 업데이트 실패:`, error.message);
          }
        }

        // 배치 간 딜레이
        if (i + batchSize < stocks.length) {
          const batchDelay = Math.random() * 2000 + 1000; // 1-3초 랜덤 딜레이
          console.log(`⏳ 배치 완료. ${Math.round(batchDelay)}ms 대기...`);
          await this.delay(batchDelay);
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

  // Yahoo Finance API에서 주식 가격 가져오기 (봇탐지 회피 강화)
  async getStockPrice(ticker) {
    try {
      // Yahoo Finance API 엔드포인트
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`;
      
      // 봇탐지 회피를 위한 고급 헤더 설정
      const headers = {
        'User-Agent': this.getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      };

      const response = await axios.get(url, {
        timeout: 15000, // 타임아웃 증가
        headers: headers,
        // 프록시 설정 (필요시)
        // proxy: {
        //   host: 'proxy.example.com',
        //   port: 8080
        // }
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
      } else if (error.response && error.response.status === 429) {
        console.warn(`⚠️ ${ticker}: Rate limit 초과. 더 긴 딜레이 적용`);
        await this.delay(5000); // 5초 대기
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
      serviceStatus: 'running',
      requestCount: this.requestCount,
      rateLimit: this.rateLimit
    };
  }

  // 딜레이 함수
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new PriceUpdateService();

