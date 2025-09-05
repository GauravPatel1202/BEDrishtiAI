import axios from "axios";

// simple in-memory store: sessionId -> conversation history
// TODO: replace with Redis once platform code is ready
const memory = {};

/**
 * Ask Gemini with conversation memory.
 * @param {string} apiKey - Google Gemini API key
 * @param {string} sessionId - Session ID for conversation
 * @param {string} prompt - User input
 * @returns {Promise<string>} - Gemini reply
 */
export async function askGemini(sessionId, prompt) {
   const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key missing ❌");
  }
  if (!memory[sessionId]) {
    memory[sessionId] = [];
  }
  const history = memory[sessionId];
  const contents = [];

  for (const h of history) {
    if (h.startsWith("User: ")) {
      contents.push({
        role: "user",
        parts: [{ text: h.replace("User: ", "") }],
      });
    } else if (h.startsWith("AI: ")) {
      contents.push({
        role: "model",
        parts: [{ text: h.replace("AI: ", "") }],
      });
    }
  }

  contents.push({
    role: "user",
    parts: [{ text: prompt }],
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const res = await axios.post(
      url,
      { contents },
      { headers: { "Content-Type": "application/json" } }
    );

    const reply =
      res.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response text found.";

    // store both user input and model reply in memory
    history.push("User: " + prompt);
    history.push("AI: " + reply);

    return reply;
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    throw new Error("Gemini API request failed");
  }
}
