
import OpenAI from 'openai';
import axios from 'axios';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export async function generate(provider, prompt) {
  const cleanProvider = provider.trim().toLowerCase(); // ✅ removes spaces & normalizes

  switch (cleanProvider) {
    case "openai": {
      const res = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      });
      return res.choices[0].message.content || "";
    }

    case "gemini": {
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: prompt }] }] }
      );
      return res.data.candidates[0].content.parts[0].text;
    }

    case "deepseek": {
      const res = await axios.post(
        "https://api.deepseek.com/v1/chat/completions",
        { model: "deepseek-chat", messages: [{ role: "user", content: prompt }] },
        { headers: { Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`, "Content-Type": "application/json" } }
      );
      return res.data.choices[0].message.content;
    }

    case "mistral": {
      if (!process.env.MISTRAL_API_KEY) {
        return "Mistral API key is missing ❌";
      }
    
      const res = await axios.post(
        "https://api.mistral.ai/v1/chat/completions",
        {
          model: "mistral-large-latest", // ✅ correct model
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
    
      return res.data.choices[0].message.content;
    }

    default:
      return `Provider ${cleanProvider} not configured`;
  }
}
