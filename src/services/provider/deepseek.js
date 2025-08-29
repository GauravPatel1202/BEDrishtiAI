import axios from "axios";

export async function callDeepSeek(prompt) {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("OpenRouter API key missing ❌");
  }

  try {
    const res = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-r1:free",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data.choices[0]?.message?.content || "";
  } catch (err) {
    throw new Error(`OpenRouter error: ${err.response?.data?.error?.message || err.message}`);
  }
}
