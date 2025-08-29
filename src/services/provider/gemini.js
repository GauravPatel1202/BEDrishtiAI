import axios from "axios";

export async function callGemini(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key missing ❌");
  }

  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] }
    );
    return res.data.candidates[0]?.content?.parts[0]?.text || "";
  } catch (err) {
    throw new Error(`Gemini error: ${err.message}`);
  }
}
