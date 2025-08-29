import axios from "axios";

export async function callKimi(prompt) {
  if (!process.env.KIMI_API_KEY) {
    throw new Error("Kimi API key missing ❌");
  }

  const res = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "moonshotai/kimi-k2:free", // 👈 use the actual Kimi model on OpenRouter
      messages: [{ role: "user", content: prompt }],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.KIMI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data.choices[0]?.message?.content || "";
}
