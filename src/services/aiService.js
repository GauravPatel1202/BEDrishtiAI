import { callOpenAI } from "./provider/openai.js";
import { callGemini } from "./provider/gemini.js";
import { callDeepSeek } from "./provider/deepseek.js";
import { callKimi,  } from "./provider/mistral.js";

const providers = {
  openai: callOpenAI,
  gemini: callGemini,
  deepseek: callDeepSeek,
  kimi: callKimi,
};

export async function generate(provider, prompt) {
  const cleanProvider = provider.trim().toLowerCase();
  const fn = providers[cleanProvider];

  if (!fn) {
    throw new Error(`Provider ${cleanProvider} not configured`);
  }

  return fn(prompt);
}
