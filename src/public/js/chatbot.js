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
        console.log(`${result.count}개 종목 데이터 로드 완료`);
        
        // 챗봇 초기화
        initializeChatbot();
      } else {
        console.error('주식 데이터 로드 실패:', result.error);
      }
    } catch (error) {
      console.error('주식 데이터 로드 중 오류:', error);
    }
  }
  
  // 챗봇 초기화 함수
  function initializeChatbot() {
    if(localStorage.getItem('login') != 'true') {
      root.innerHTML = `
        <div class="chatbox" style="border:1px solid #ddd;padding:8px;border-radius:8px;max-width:480px">
          <div id="chatlog" style="height:200px; overflow:auto; border:1px solid #eee; padding:8px; margin-bottom:8px"></div>
          <input id="chatmsg" placeholder="로그인 후 이용해주세요." style="width:75%" disabled/>
          <button id="chatsend" disabled>Send</button>
        </div>`;
    } else {
      root.innerHTML = `
        <div class="chatbox" style="border:1px solid #ddd;padding:8px;border-radius:8px;max-width:480px">
          <div id="chatlog" style="height:200px; overflow:auto; border:1px solid #eee; padding:8px; margin-bottom:8px"></div>
          <input id="chatmsg" placeholder="무엇을 도와드릴까요?" style="width:75%"/>
          <button id="chatsend">Send</button>
        </div>`;
      
      var rag = document.getElementById('reg')
      var login = document.getElementById('login')
      if (rag) rag.innerHTML = ` `
      if (login) login.innerHTML = `<a id="login" onclick="logout()">LogOut</a>`
      
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
          stocksData: stocksData // MongoDB 데이터를 함께 전송
        };
        
        const r = await fetch("/api/chat", { 
          method: "POST", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify(requestData) 
        });
        
        const j = await r.json();
        log.innerHTML += `<div><b>봇:</b> ${j.reply || '(응답 없음)'}</div>`;
        log.scrollTop = log.scrollHeight;
      } catch(e) {
        log.innerHTML += `<div style="color:red">에러: ${e.message}</div>`;
      }
    }
    
         // 챗봇 시작 메시지
     log.innerHTML += `<div><b>봇:</b> 안녕하세요! 배당 투자 챗봇입니다. 
     현재 ${stocksData.length}개 종목의 최근 1년간(2024년 8월~2025년 7월) 실제 배당 정보를 제공할 수 있습니다.
     
     배당 관련 질문을 자유롭게 해주세요. 예시:
     - "3종목 분산 투자해서 높은 배당 수익률 종목 중 월별 배당을 받을 수 있는 종목을 추천해줘"
     </div>`;
  }
  
  // 페이지 로드 시 주식 데이터 로드
  loadStocksData();
})();

function logout() {
  localStorage.removeItem("login");
  location.reload(); // 페이지 새로고침으로 로그아웃 상태 반영
}