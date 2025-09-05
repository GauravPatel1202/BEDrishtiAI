import { callOpenAI } from "./provider/openai.js";
import { callDeepSeek } from "./provider/deepseek.js";
import { callKimi } from "./provider/mistral.js";
import { askGemini } from "./provider/geminiUpdate.js";

const providers = {
  openai: callOpenAI,
  gemini: askGemini,
  deepseek: callDeepSeek,
  kimi: callKimi,
};

export async function generate(provider, prompt) {
  const cleanProvider = provider.trim().toLowerCase();
  const fn = providers[cleanProvider];
  if (!fn) {
    throw new Error(`Provider ${cleanProvider} not configured`);
  }

  return fn("session123", prompt);
}
