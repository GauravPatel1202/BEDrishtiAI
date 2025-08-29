import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
  baseURL: "https://openrouter.ai/api/v1", 
});

export async function callOpenAI(prompt) {
  try {
    const res = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini", 
      messages: [{ role: "user", content: prompt }],
    });

    return res.choices[0]?.message?.content || "";
  } catch (err) {
    throw new Error(
      `OpenRouter error: ${err.response?.data?.error?.message || err.message}`
    );
  }
}

