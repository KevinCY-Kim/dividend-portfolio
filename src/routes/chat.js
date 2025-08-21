import { Router } from "express";
import OpenAI from "openai";
const router = Router();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", async (req,res)=>{
  try{
    const { message, stocksData } = req.body;
    
    // MongoDB 데이터가 있는 경우 더 구체적인 시스템 프롬프트 생성
    let systemPrompt = "You are a friendly support bot for a dividend portfolio app.";
    
    if (stocksData && stocksData.length > 0) {
      systemPrompt = `You are a knowledgeable dividend investment advisor bot with access to real-time stock dividend data.

You have access to ${stocksData.length} stocks with the following information:
- Index (NASDAQ-100, S&P 500, Dow Jones, etc.)
- Ticker symbol
- Company name
- Current stock price
- Recent 12 months of monthly dividend amounts (August 2024 to July 2025)

⚠️ CRITICAL INSTRUCTION:
- The monthly dividend data in the database covers the period from August 2024 to July 2025 (recent 12 months).
- Therefore, months 1, 2, 3, 4, 5, 6, 7 refer to 2025.
- Months 8, 9, 10, 11, 12 refer to 2024.
- NEVER display as "January 2024", "February 2024", etc.
- Instead, display as "January 2025", "February 2025" or simply "January", "February", etc.

Monthly dividend distribution:
- January (2025): 74 stocks, February (2025): 135 stocks, March (2025): 206 stocks
- April (2025): 87 stocks, May (2025): 158 stocks, June (2025): 192 stocks
- July (2025): 89 stocks, August (2024): 152 stocks, September (2024): 187 stocks
- October (2024): 86 stocks, November (2024): 152 stocks, December (2024): 194 stocks

Your role is to:
1. Answer questions about specific stocks' dividend information
2. Recommend stocks based on dividend yield, dividend amounts, or other criteria
3. Provide insights about dividend investing strategies
4. Help users understand dividend data and make informed decisions

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
      max_tokens: 1000
    });
    
    res.json({ reply: completion.choices[0]?.message?.content || "" });
  }catch(e){
    console.error("❌ 챗봇 API 오류:", e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
