### Dividend Portfolio MVP

배당주 데이터를 기반으로 월별 균등한 현금흐름 포트폴리오를 설계하는 웹 애플리케이션.
Node.js + Express + MongoDB + EJS 기반으로 프론트/백엔드 구성.

---

## 주요 기능

- 배당주 데이터 관리 (MongoDB 기반)
- 월별 배당 포트폴리오 추천
- 종목 선택 및 배당 시각화 차트
- 로그인/회원가입 (세션 기반 인증)
- 게시판 (글 작성/확인/수정/삭제)
- OpenAI API 연동 고객 상담 챗봇
- EJS 템플릿 + inc(top, bottom) 구조
- 정적 리소스(css/js/img) 관리

---

## 프로젝트 구조
```bash
dividend-portfolio/
├─ .env.example
├─ .gitignore
├─ package.json
├─ README.md
├─ src/
│ ├─ app.js # 서버 엔트리
│ ├─ config/
│ │ └─ db.js # MongoDB 연결
│ ├─ models/
│ │ ├─ Stock.js # 배당/가격 데이터
│ │ ├─ User.js # 유저(로그인/회원가입)
│ │ └─ Post.js # 게시판 글
│ ├─ services/
│ │ ├─ optimizer.js # 월별 균등 커버리지 Greedy 최적화
│ │ └─ pricing.js # 시가/배당수익률 계산 유틸
│ ├─ routes/
│ │ ├─ index.js # 홈/메뉴
│ │ ├─ auth.js # 로그인/회원가입
│ │ ├─ board.js # 게시판
│ │ ├─ stocks.js # 종목 선택/조회 API
│ │ ├─ portfolio.js # 포트폴리오 추천 API
│ │ ├─ charts.js # 차트 iframe 라우트
│ │ └─ chat.js # OpenAI 챗봇 API
│ ├─ controllers/
│ │ ├─ authController.js
│ │ ├─ boardController.js
│ │ ├─ portfolioController.js
│ │ └─ stockController.js
│ ├─ views/ # EJS 뷰
│ │ ├─ inc/
│ │ │ ├─ top.ejs
│ │ │ ├─ bottom.ejs
│ │ │ └─ 404.ejs
│ │ ├─ home.ejs # 홈페이지 (메뉴)
│ │ ├─ select.ejs # 배당주 선택 페이지
│ │ ├─ login.ejs
│ │ ├─ register.ejs
│ │ ├─ board.ejs # 게시판
│ │ └─ chart_frame.ejs # 차트 전용 iframe
│ └─ public/ # 정적리소스
│ ├─ css/
│ │ └─ main.css
│ ├─ js/
│ │ ├─ main.js
│ │ └─ chatbot.js # 고객응대 위젯
│ └─ img/ # 이미지 저장
└─ scripts/
└─ load_dividends_from_csv.js # CSV → MongoDB 업로드
```

---

### 설치 및 실행

## 1. 클론 & 설치
```bash
git clone https://github.com/yourusername/dividend-portfolio.git
cd dividend-portfolio
npm install
```

---

## 2. 환경 변수 설정

.env 파일 생성:

```bash
MONGO_URI=mongodb://localhost:27017/dividend_portfolio
SESSION_SECRET=changeme123
PORT=3000
OPENAI_API_KEY=sk-xxxxxxx
```

---

## 3. MongoDB 실행

로컬 MongoDB 서버 실행:
```bash
(alpacokimcy) (.venv) alpaco@alpaco-KVM:~/kimcy/dividend-portfolio$ mongosh
Current Mongosh Log ID: 68a517ed07bfbfc23e89b03c
Connecting to:          mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.6
test> use dividend_portfolio
db.stocks.findOne()
dividend_portfolio> db.stocks.findOne()
{
  _id: ObjectId('68a2e8715d3b7c69d0c248e1'),
  index: 'NASDAQ-100',
  ticker: 'ADI',
  name: 'Analog Devices',
  currency: 'USD',
  eventDate: '2024-09-03',
  dividend: 0.92,
  price: 100
}
```

---

## 4. 서버 실행

```bash
npm run dev
성공 시
MongoDB connected
<<<<<<< HEAD
Server running on http://localhost:3000
=======
>>>>>>> update for dividend
```

---

### 🗄데이터 적재 (예: 2024 배당 데이터)
크롤링/수집된 CSV를 MongoDB에 업로드:
node scripts/load_dividends_from_csv.js data/dividends.csv

---

### 개발 스택

백엔드: Node.js, Express
DB: MongoDB (Mongoose ODM)
프론트엔드: EJS 템플릿, Vanilla JS
스타일: CSS (public/css)
세션 관리: express-session + connect-mongo
로그/보안: morgan, cors
챗봇: OpenAI API

---

### 📌 앞으로 확장 아이디어
📊 종가 데이터 자동 업데이트 (Yahoo Finance / Kiwoom API)
🔄 포트폴리오 자동 리밸런싱
📅 월별 배당 최적화 알고리즘 개선 (Greedy → Dynamic Programming)
📱 React/Vue 프론트엔드로 확장
🔐 JWT 기반 인증 및 소셜 로그인
