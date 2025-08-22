(function(){
  let stocksData = []; // MongoDB에서 가져온 주식 데이터를 저장할 변수
  
  const root = document.getElementById("chat-widget");
  if (!root) return;
  
  // MongoDB에서 주식 데이터를 가져오는 함수
  async function loadStocksData() {
    try {
      const response = await fetch('/api/chatbot/stocks-data');
      const result = await response.json();
      
      if (result.success) {
        stocksData = result.data;
        console.log(`${result.count}개 종목 데이터 로드 완료:`, stocksData.slice(0, 3)); // 처음 3개만 로그
        
        // 챗봇 초기화
        initializeChatbot();
      } else {
        console.error('주식 데이터 로드 실패:', result.error);
      }
    } catch (error) {
      console.error('주식 데이터 로드 중 오류:', error);
    }
  }
  
  // 배당 수익률 계산 함수
  function calculateDividendYield(stock) {
    if (!stock.price || stock.price <= 0) return 0;
    const annualDividend = stock.dividends.reduce((sum, d) => sum + (d.amount || 0), 0);
    return (annualDividend / stock.price * 100).toFixed(2);
  }
  
  // 배당 수익률 순으로 정렬하는 함수
  function sortByDividendYield(stocks, limit = 10) {
    return stocks
      .map(stock => ({
        ...stock,
        annualDividend: stock.dividends.reduce((sum, d) => sum + (d.amount || 0), 0),
        dividendYield: calculateDividendYield(stock)
      }))
      .filter(stock => stock.dividendYield > 0)
      .sort((a, b) => parseFloat(b.dividendYield) - parseFloat(a.dividendYield))
      .slice(0, limit);
  }
  
  // 월별 배당 분포 계산
  function getMonthlyDividendDistribution() {
    const monthlyCount = {};
    stocksData.forEach(stock => {
      stock.dividends.forEach(dividend => {
        const month = dividend.month;
        monthlyCount[month] = (monthlyCount[month] || 0) + 1;
      });
    });
    return monthlyCount;
  }
  
  // 챗봇 초기화 함수
  function initializeChatbot() {
    if(localStorage.getItem('login') != 'true') {
      root.innerHTML = `
        <div class="chatbox" style="border:1px solid #ddd;padding:8px;border-radius:8px;width:100%;height:100%;display:flex;flex-direction:column;">
          <div id="chatlog" style="flex:1; overflow:auto; border:1px solid #eee; padding:8px; margin-bottom:8px;min-height:0; line-height:1.6; font-size:14px; word-wrap: break-word;"></div>
          <div style="display:flex;gap:8px;align-items:center;">
            <input id="chatmsg" placeholder="로그인 후 이용해주세요." style="flex:1;padding:8px;border:1px solid #ddd;border-radius:4px;" disabled/>
            <button id="chatsend" style="padding:8px 16px;background:#007bff;color:white;border:none;border-radius:4px;cursor:pointer;" disabled>Send</button>
          </div>
        </div>`;
    } else {
      root.innerHTML = `
        <div class="chatbox" style="border:1px solid #ddd;padding:8px;border-radius:8px;width:100%;height:100%;display:flex;flex-direction:column;">
          <div id="chatlog" style="flex:1; overflow:auto; border:1px solid #eee; padding:8px; margin-bottom:8px;min-height:0; line-height:1.6; font-size:14px; word-wrap: break-word;"></div>
          <div style="display:flex;gap:8px;align-items:center;">
            <input id="chatmsg" placeholder="무엇을 도와드릴까요?" style="flex:1;padding:8px;border:1px solid #ddd;border-radius:4px;"/>
            <button id="chatsend" style="padding:8px 16px;background:#007bff;color:white;border:none;border-radius:4px;cursor:pointer;">Send</button>
          </div>
        </div>`;
      
      // 챗봇 이벤트 리스너 설정
      setupChatbot();
    }
  }
  
  // 챗봇 이벤트 리스너 설정
  function setupChatbot() {
    const log = root.querySelector("#chatlog");
    const input = root.querySelector("#chatmsg");
    
    // MongoDB 데이터를 기반으로 한 챗봇 규칙
    const rule = `내가 이제부터 MongoDB 데이터베이스에 저장된 실제 주식 배당 정보를 제공할게요. 
    이것은 각 종목의 배당금, 배당월, 현재가, 인덱스 정보를 포함한 실제 데이터입니다.
    이 데이터를 기반으로, 배당금에 대한 질문이나 배당금을 추천해달라고 할 때, 
    그것에 알맞는 답변을 제공해주세요. 반드시 텍스트로만 정리해주세요.
    
    ⚠️ 매우 중요한 지시사항:
    - 현재 데이터베이스의 월별 배당 정보는 2024년 8월부터 2025년 7월까지의 최근 1년간 데이터입니다.
    - 최근 1년간 데이터로 1월부터 12월까지의 모든 월별 배당 분포를 확인 할 수 있습니다.
    - 절대로 "2024년 등 년도로 표시하지 마세요.
    - 대신 1월", 2월" 등으로 월만 표기하면 됩니다.
    - 현재 MongoDB에 저장된 각 종목의 현재가 및 월별 배당금 정보를 반영해 주세요.
    - 업데이트 된 현재가 정보를 함께 반영해서 실제 배당 수익률을 계산해 주세요.

    
    현재 데이터베이스에는 ${stocksData.length}개의 종목이 있습니다.
    각 종목은 다음 정보를 포함합니다:
    - 인덱스 (NASDAQ-100, S&P 500, Dow Jones 등)
    - 티커 (AAPL, MSFT 등)
    - 종목명
    - 현재가
    - 참조 자료는 최근 1년간 월별 배당금 정보 (2024년 8월 ~ 2025년 7월)
    
    배당 월별 분포:
    - 1월(2025년): 74개 종목, 2월(2025년): 135개 종목, 3월(2025년): 206개 종목
    - 4월(2025년): 87개 종목, 5월(2025년): 158개 종목, 6월(2025년): 192개 종목
    - 7월(2025년): 89개 종목, 8월(2024년): 152개 종목, 9월(2024년): 187개 종목
    - 10월(2024년): 86개 종목, 11월(2024년): 152개 종목, 12월(2024년): 194개 종목
    
    배당 관련 질문에 대해 정확하고 유용한 답변을 제공해주세요.`;
    
    // Enter 키 이벤트
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
    
    // Send 버튼 클릭 이벤트
    root.querySelector("#chatsend").onclick = sendMessage;
    
    // 메시지 전송 함수
    async function sendMessage() {
      const msg = input.value.trim(); 
      if(!msg) return;
      
      log.innerHTML += `<div><b>나:</b> ${msg}</div>`;
      input.value = "";
      
      try {
        // 사용자 메시지와 주식 데이터를 함께 전송
        const requestData = {
          message: rule + "\n\n사용자 질문: " + msg,
          stocksData: stocksData, // MongoDB 데이터를 함께 전송
          monthlyDistribution: getMonthlyDividendDistribution(), // 월별 분포 추가
          topDividendStocks: sortByDividendYield(stocksData, 20) // 상위 배당 수익률 종목 추가
        };
        
        const r = await fetch("/api/chat", { 
          method: "POST", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify(requestData) 
        });
        
        const j = await r.json();
        // 봇 응답을 문장 단위로 분리하여 줄바꿈 추가
        const botReply = j.reply || '(응답 없음)';
        
        // 숫자 목록과 일반 문장을 구분하여 줄바꿈 처리
        let formattedReply = botReply;
        
        // 1단계: 숫자 목록을 최우선적으로 처리 (1., 2., 3. 등)
        formattedReply = formattedReply.replace(/(\d+\.\s)/g, '<br>$1');
        
        // 2단계: 일반 문장의 마침표, 느낌표, 물음표는 줄바꿈으로 처리
        // 단, 숫자 목록 뒤의 마침표는 제외
        formattedReply = formattedReply
          .replace(/(?<!<br>\d+\.\s)\. /g, '.<br>')
          .replace(/(?<!<br>\d+\.\s)\! /g, '!<br>')
          .replace(/(?<!<br>\d+\.\s)\? /g, '?<br>');
        
        // 3단계: 마지막 마침표는 줄바꿈 제거
        formattedReply = formattedReply.replace(/\.$/, '.');
        
        log.innerHTML += `<div><b>배디:</b> ${formattedReply}</div>`;
        log.scrollTop = log.scrollHeight;
      } catch(e) {
        log.innerHTML += `<div style="color:red">에러: ${e.message}</div>`;
      }
    }
    
    // 챗봇 시작 메시지
    const monthlyDistribution = getMonthlyDividendDistribution();
    const topStocks = sortByDividendYield(stocksData, 5);
    
    const welcomeMessage = `안녕하세요! 배당 투자 챗봇 배디(BAEDI)입니다. 
    현재 ${stocksData.length}개 종목의 최근 1년간(2024년 8월~2025년 7월) 실제 배당 정보를 제공할 수 있습니다. 
    상위 배당 수익률 종목: ${topStocks.map(s => `${s.ticker}(${s.dividendYield}%)`).join(', ')}. 
    배당 관련 질문을 자유롭게 해주세요. 예시: "년간 수익률이 높은 종목으로 3종목 추천해줘, 매월 배당을 받으면 좋겠어!"`;
    
    // 문장 단위로 줄바꿈 처리 (마침표, 느낌표, 물음표 기준)
    let formattedWelcome = welcomeMessage;
    
    // 1단계: 숫자 목록을 최우선적으로 처리 (1., 2., 3. 등)
    formattedWelcome = formattedWelcome.replace(/(\d+\.\s)/g, '<br>$1');
    
    // 2단계: 일반 문장의 마침표, 느낌표, 물음표는 줄바꿈으로 처리
    // 단, 숫자 목록 뒤의 마침표는 제외
    formattedWelcome = formattedWelcome
      .replace(/(?<!<br>\d+\.\s)\. /g, '.<br>')
      .replace(/(?<!<br>\d+\.\s)\! /g, '!<br>')
      .replace(/(?<!<br>\d+\.\s)\? /g, '?<br>');
    
    // 3단계: 마지막 마침표는 줄바꿈 제거
    formattedWelcome = formattedWelcome.replace(/\.$/, '.');
    
    log.innerHTML += `<div><b>배디:</b> ${formattedWelcome}</div>`;
  }
  
  // 페이지 로드 시 주식 데이터 로드
  loadStocksData();
})();

