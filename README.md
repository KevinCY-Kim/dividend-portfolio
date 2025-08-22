# Dividend Portfolio

배당주 데이터를 기반으로 월별 현금흐름 포트폴리오를 설계하는 웹 애플리케이션.
Node.js + Express + MongoDB + EJS 기반으로 프론트/백엔드 구성.

---

## 주요 기능

### 핵심 기능
- **배당주 데이터 관리** (MongoDB 기반)
- **월별 배당 포트폴리오 추천** 
- **종목 선택 및 배당 시각화 차트** (Chart.js)
- **실시간 주식 가격 업데이트** (자동/수동)

### 사용자 관리
- **로그인/회원가입** (세션 기반 인증)
- **닉네임 기반 사용자 식별**
- **권한 기반 게시판 관리**

### 커뮤니티
- **게시판** (글 작성/확인/수정/삭제)
- **작성자별 게시글 관리**
- **로그인 사용자만 글 작성 가능**

### AI 서비스
- **OpenAI API 연동 고객 상담 챗봇**
- **가이드 설명 자동 줄바꿈**

### 관리자 기능
- **주식 가격 관리** (자동/수동 업데이트)
- **계정 관리** (계정 추가/삭제)
- **게시판 관리** (게시글 삭제)

---

## 프로젝트 구조

```bash
dividend-portfolio/
├─ .env.example
├─ .gitignore
├─ package.json
├─ README.md
├─ server.log
├─ src/
│ ├─ app.js                    # 서버 엔트리 + 관리자 API
│ ├─ config/
│ │ └─ db.js                   # MongoDB 연결
│ ├─ models/
│ │ ├─ Stock.js                # 배당/가격 데이터
│ │ ├─ User.js                 # 유저(로그인/회원가입)
│ │ └─ Post.js                 # 게시판 글 (작성자 정보 포함)
│ ├─ services/
│ │ ├─ optimizer.js            # 월별 균등 커버리지 Greedy 최적화
│ │ └─ pricing.js              # 시가/배당수익률 계산 유틸
│ ├─ routes/
│ │ ├─ index.js                # 홈/메뉴
│ │ ├─ auth.js                 # 로그인/회원가입
│ │ ├─ board.js                # 게시판
│ │ ├─ stocks.js               # 종목 선택/조회 API
│ │ ├─ portfolio.js            # 포트폴리오 추천 API
│ │ ├─ charts.js               # 차트 iframe 라우트
│ │ └─ chat.js                 # OpenAI 챗봇 API
│ ├─ controllers/
│ │ ├─ authController.js
│ │ ├─ boardController.js      # 로그인 체크 + 작성자 권한 관리
│ │ ├─ portfolioController.js
│ │ └─ stockController.js
│ ├─ views/                    # EJS 뷰
│ │ ├─ inc/
│ │ │ ├─ top.ejs              # 공통 헤더 (동적 로그인 상태)
│ │ │ ├─ bottom.ejs           # 공통 푸터 (FAQ, 약관 링크)
│ │ │ └─ 404.ejs
│ │ ├─ home.ejs               # 홈페이지 (통합 네비게이션)
│ │ ├─ select.ejs             # 배당주 선택 페이지 (UI 개선)
│ │ ├─ login.ejs
│ │ ├─ register.ejs
│ │ ├─ board.ejs              # 게시판 (로그인 체크)
│ │ ├─ board_detail.ejs       # 게시글 상세
│ │ ├─ board_edit.ejs         # 게시글 수정
│ │ ├─ board_delete.ejs       # 게시글 삭제
│ │ ├─ chatbot.ejs            # 챗봇 페이지
│ │ ├─ chart_frame.ejs        # 차트 전용 iframe
│ │ └─ price-admin.ejs        # 관리자 모드 (3개 탭)
│ └─ public/                   # 정적리소스
│   ├─ css/
│   │ └─ main.css
│   ├─ js/
│   │ ├─ main.js
│   │ └─ chatbot.js           # 고객응대 위젯 (가독성 개선)
│   └─ img/                   # 이미지 저장
└─ scripts/
  └─ load_dividends_from_csv.js # CSV → MongoDB 업로드
```

---

## 최신 업데이트 내용

### UI/UX 개선 (Select 메뉴)
- **포트폴리오 추가 기능 제거**: 종목 선택 시 월별 배당 차트만 표시
- **테이블 디자인 통일**: 모든 섹션을 일관된 테이블 구조로 변경
- **인덱스 선택 버튼화**: "NASDAQ-100", "S&P 500", "US ETF" 버튼으로 변경
- **테이블 간격 최적화**: 컬럼별 너비 조정 (배당월 2배 확대)
- **텍스트 강조**: 두 번째 컬럼과 제목들을 굵은 글씨로 표시
- **가독성 향상**: 섹션 간 줄바꿈 추가, 이모지 제거

### 보안 및 권한 관리 (Board 메뉴)
- **로그인 필수**: 로그인한 사용자만 글 작성/수정/삭제 가능
- **작성자 표시**: 이메일 대신 닉네임으로 작성자 표시
- **권한 체크**: 본인이 작성한 글만 수정/삭제 가능
- **버튼 스타일**: 수정/삭제 버튼을 등록 버튼과 동일한 오렌지 색상으로 통일

### 네비게이션 개선
- **메뉴 굵은 글씨**: 모든 메뉴 항목을 굵은 글씨로 표시
- **동적 로그인 상태**: 로그인 상태에 따라 Login/LogOut 자동 변경
- **일관된 간격**: 모든 페이지에서 동일한 메뉴 간격 유지

### 챗봇 가독성 향상
- **자동 줄바꿈**: 문장 끝마다 자동 줄바꿈으로 가독성 개선
- **스타일 통일**: LogOut 메뉴 굵은 글씨 적용

### 관리자 모드 신규 추가
- **3개 메인 탭**: 주식 가격 관리, 계정 관리, 게시판 관리
- **왼쪽 정렬**: 탭 메뉴를 왼쪽으로 정렬하여 가독성 향상
- **부드러운 스크롤**: 탭 클릭 시 해당 섹션으로 자동 스크롤
- **그라데이션 디자인**: 각 탭별 고유한 색상 테마 적용
- **API 엔드포인트**: 계정/게시판 관리용 REST API 추가

### 반응형 디자인
- **Bootstrap 5**: 최신 UI 프레임워크 적용
- **모바일 최적화**: 모든 디바이스에서 최적화된 레이아웃
- **그림자 효과**: 카드 디자인에 현대적인 그림자 효과 적용

---

## 설치 및 실행

### 1. 클론 & 설치
```bash
git clone https://github.com/KevinCY-Kim/dividend-portfolio.git
cd dividend-portfolio
npm install
```

### 2. 환경 변수 설정

`.env` 파일 생성:
```bash
MONGO_URI=mongodb://localhost:27017/dividend_portfolio
SESSION_SECRET=changeme123
PORT=3000
OPENAI_API_KEY=sk-xxxxxxx
```

### 3. MongoDB 실행

로컬 MongoDB 서버 실행:
```bash
mongosh
use dividend_portfolio
db.stocks.findOne()
```

### 4. 서버 실행

```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start

# 백그라운드 실행
nohup node src/app.js > server.log 2>&1 &
```

성공 시:
```
MongoDB connected
Server running on http://localhost:3000
```

---

## 접속 URL

### 일반 사용자
- **홈페이지**: `http://localhost:3000`
- **배당주 선택**: `http://localhost:3000/select`
- **게시판**: `http://localhost:3000/board`
- **챗봇**: `http://localhost:3000/chatbot`

### 관리자 전용
- **관리자 모드**: `http://localhost:64008/price-admin`
  - 주식 가격 관리
  - 계정 관리
  - 게시판 관리

---

## 데이터 적재

크롤링/수집된 CSV를 MongoDB에 업로드:
```bash
node scripts/load_dividends_from_csv.js data/nasdaq100_dividends_events.csv
node scripts/load_dividends_from_csv.js data/sp500_dividends_events.csv
node scripts/load_dividends_from_csv.js data/us_etf_dividends_events.csv
```

---

## 개발 스택

### 백엔드
- **Node.js**: 서버 런타임
- **Express**: 웹 프레임워크
- **MongoDB**: NoSQL 데이터베이스
- **Mongoose**: MongoDB ODM

### 프론트엔드
- **EJS**: 서버사이드 템플릿 엔진
- **Bootstrap 5**: UI 프레임워크
- **Chart.js**: 차트 라이브러리
- **Vanilla JavaScript**: 클라이언트 사이드 로직

### 인증 & 보안
- **express-session**: 세션 관리
- **connect-mongo**: 세션 저장소
- **bcryptjs**: 비밀번호 해싱
- **validator**: 입력 검증

### 기타
- **Morgan**: HTTP 요청 로깅
- **CORS**: 크로스 오리진 리소스 공유
- **OpenAI API**: 챗봇 서비스

---

## API 엔드포인트

### 인증
- `POST /auth/login` - 로그인
- `POST /auth/register` - 회원가입
- `GET /api/check-auth` - 인증 상태 확인

### 관리자 (새로 추가)
- `GET /admin/accounts` - 계정 목록 조회
- `POST /admin/accounts` - 계정 생성
- `DELETE /admin/accounts/:email` - 계정 삭제
- `GET /admin/posts` - 게시글 목록 조회
- `DELETE /admin/posts/:id` - 게시글 삭제

### 기존 API
- `GET /api/stocks` - 주식 데이터 조회
- `POST /api/portfolio` - 포트폴리오 생성
- `POST /api/chat` - 챗봇 대화

---

## 앞으로 확장 아이디어

### 단기 목표
- [ ] 종가 데이터 자동 업데이트 (Yahoo Finance API)
- [ ] 포트폴리오 자동 리밸런싱
- [ ] 월별 배당 최적화 알고리즘 개선

### 중장기 목표
- [ ] React/Vue 프론트엔드로 확장
- [ ] JWT 기반 인증 및 소셜 로그인
- [ ] 실시간 알림 시스템
- [ ] 모바일 앱 개발

### 보안 강화
- [ ] Rate limiting 적용
- [ ] API 키 관리 시스템
- [ ] 로그 감사 시스템

---

## 기여 방법

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

---

## 팀원

- **BaeDangJuniors Finance Team**
- **Contact**: 
   Kim CY : stonez788@gmail.com | Yang SR : nftsgsrz3@gmail.com | Choi JW : pajama7522@gmail.com

---

## 감사의 말

- OpenAI API 제공
- MongoDB 커뮤니티
- Bootstrap 개발팀
- Chart.js 개발팀