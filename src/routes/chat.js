import { Router } from "express";
import OpenAI from "openai";
const router = Router();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", async (req,res)=>{
  try{
    const { message } = req.body;
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role:"system", content:"You are a friendly support bot for a dividend portfolio app."},
        { role:"user", content: message || "" }
      ]
    });
    res.json({ reply: completion.choices[0]?.message?.content || "" });
  }catch(e){
    res.status(500).json({ error: e.message });
  }
});

export default router;
