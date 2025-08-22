import { Router } from "express";
import OpenAI from "openai/index.mjs";
const router = Router();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", async (req,res)=>{
  try{
    const { message, stocksData, monthlyDistribution, topDividendStocks } = req.body;
    
    // MongoDB 데이터가 있는 경우 더 구체적인 시스템 프롬프트 생성
    let systemPrompt = "You are a friendly support bot for a dividend portfolio app.";
    
    if (stocksData && stocksData.length > 0) {
      // 상위 배당 수익률 종목 정보 생성
      let topStocksInfo = "";
      if (topDividendStocks && topDividendStocks.length > 0) {
        topStocksInfo = `\n\n상위 배당 수익률 종목 (상위 10개):
${topDividendStocks.slice(0, 10).map((stock, index) => 
  `${index + 1}. ${stock.ticker} (${stock.name}): 현재가 $${stock.price}, 연간배당 $${stock.annualDividend}, 배당수익률 ${stock.dividendYield}%`
).join('\n')}`;
      }
      
      // 월별 배당 분포 정보 생성
      let monthlyInfo = "";
      if (monthlyDistribution) {
        const monthNames = {
          1: '1월', 2: '2월', 3: '3월', 4: '4월', 5: '5월', 6: '6월',
          7: '7월', 8: '8월', 9: '9월', 10: '10월', 11: '11월', 12: '12월'
        };
        monthlyInfo = `\n\n월별 배당 분포 (2024년 8월 ~ 2025년 7월):
${Object.entries(monthlyDistribution)
  .sort(([a], [b]) => parseInt(a) - parseInt(b))
  .map(([month, count]) => `${monthNames[month]}: ${count}개 종목`)
  .join(', ')}`;
      }
      
      systemPrompt = `You are a knowledgeable dividend investment advisor bot with access to real-time stock dividend data from MongoDB.

You have access to ${stocksData.length} stocks with the following information:
- Index (NASDAQ-100, S&P 500, Dow Jones, etc.)
- Ticker symbol
- Company name
- Current stock price (updated)
- Recent 12 months of monthly dividend amounts (August 2024 to July 2025)
- Annual dividend amount (calculated from monthly data)
- Dividend yield (calculated as annual dividend / current price * 100)

⚠️ CRITICAL INSTRUCTION:
- The monthly dividend data in the database covers the period from August 2024 to July 2025 (recent 12 months).
- Therefore, months 1, 2, 3, 4, 5, 6, 7 refer to 2025.
- Months 8, 9, 10, 11, 12 refer to 2024.
- NEVER display as "January 2024", "February 2024", etc.
- Instead, display as "January 2025", "February 2025" or simply "January", "February", etc.
- ALWAYS use the current price from the database to calculate accurate dividend yields.
- When recommending stocks, prioritize those with higher dividend yields and good monthly distribution.

${topStocksInfo}
${monthlyInfo}

Your role is to:
1. Answer questions about specific stocks' dividend information using REAL data from the database
2. Recommend stocks based on dividend yield, dividend amounts, or other criteria using ACTUAL current prices and dividend data
3. Provide insights about dividend investing strategies based on the real data
4. Help users understand dividend data and make informed decisions
5. When asked for recommendations, always provide specific stock tickers with their current prices, dividend yields, and monthly dividend distribution

Example response format for stock recommendations:
"추천 종목: 
1. TXN (Texas Instruments): 현재가 $200.71, 배당수익률 2.71%, 배당월: 1월, 4월, 7월, 10월
2. [다른 종목 정보]..."

Always provide accurate information based on the data provided. If asked about a stock not in the database, clearly state that you don't have information about that specific stock.

Format your responses in Korean when the user asks in Korean, otherwise use English.`;
    }
    
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message || "" }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });
    
    res.json({ reply: completion.choices[0]?.message?.content || "" });
  }catch(e){
    console.error("❌ 챗봇 API 오류:", e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
