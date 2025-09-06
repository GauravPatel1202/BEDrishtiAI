import { generate } from "../services/aiService.js";
import prisma from "../config/prismaClient.js";

export async function createQuery(req, res) {
  try {
    const { prompt, providers } = req.body;
    const userId = req.user.id;

    if (!prompt || !Array.isArray(providers)) {
      return res.status(400).json({ error: "Prompt and providers required" });
    }

    // Fetch last 50 queries with responses for conversation context
    const previousQueries = await prisma.query.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { responses: true },
    });

    // Build conversation history
    let conversationHistory = '';
    let lastResult = null;
    if (previousQueries.length > 0) {
      conversationHistory = 'Previous conversation and calculations:\n';
      // Reverse to get chronological order (oldest first)
      const reversedQueries = previousQueries.reverse();
      for (const q of reversedQueries) {
        conversationHistory += `User asked: "${q.prompt}"\n`;
        for (const response of q.responses) {
          if (response.provider === 'gemini') {
            conversationHistory += `Gemini responded: "${response.content}"\n`;
            // Try to extract numerical result from Gemini's response
            const numberMatch = response.content.match(/(\d+(?:\.\d+)?)/);
            if (numberMatch) {
              lastResult = numberMatch[1];
            }
          }
        }
      }
      conversationHistory += '\n';
    }

    // Add instructions for handling follow-up calculations
    let instructions = '';
    if (lastResult) {
      instructions = ` ${lastResult}. If the user asks to "add X", "subtract X", "multiply by X", or similar operations without specifying a number, assume they want to perform that operation on the last result (${lastResult})`;
    }

    // Modify prompt to include user context, conversation history, and instructions
    const modifiedPrompt = `${conversationHistory}${instructions}You are talking to ${req.user.name} (${req.user.email}). ${req.user.name} asks: ${prompt}`;

    const query = await prisma.query.create({
      data: {
        prompt,
        userId: userId
      },
    });

    const promises = providers.map(async (p) => {
      const start = Date.now();
      try {
        const content = await generate(p, modifiedPrompt);
        const latencyMs = Date.now() - start;

        return prisma.response.create({
          data: { queryId: query.id, provider: p, content, latencyMs },
        });
      } catch (error) {
        console.error(`=== Error with provider ${p}:`, error.message, "===");

        return prisma.response.create({
          data: {
            queryId: query.id,
            provider: p,
            content: `Error: ${error.message}`,
            latencyMs: Date.now() - start,
          },
        });
      }
    });

    await Promise.all(promises);

    const full = await prisma.query.findUnique({
      where: { id: query.id },
      include: { responses: true },
    });

    res.json(full);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getQueries(req, res) {
  try {
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const data = await prisma.query.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      include: { responses: true },
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
