
import { PrismaClient } from '@prisma/client';
import { generate } from '../services/aiService.js';

const prisma = new PrismaClient();

export async function createQuery(req, res) {
  try {
    const { prompt, providers } = req.body;
    const userId = req.user?.id; // Get user ID from authenticated user

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const query = await prisma.query.create({ 
      data: { 
        prompt,
        userId
      } 
    });

    const promises = providers.map(async (p) => {
      const start = Date.now();
      try {
    
        const content = await generate(p, prompt);
        const latencyMs = Date.now() - start;
    
        
        return prisma.response.create({
          data: { queryId: query.id, provider: p, content, latencyMs },
        });
      } catch (error) {
        console.error(`=== Error with provider ${p}:`, error.message, '===');
        // Still create a response record with error message
        return prisma.response.create({
          data: { 
            queryId: query.id, 
            provider: p, 
            content: `Error: ${error.message}`, 
            latencyMs: Date.now() - start 
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
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getQueries(req, res) {
  try {
    const userId = req.user?.id; // Get user ID from authenticated user

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const data = await prisma.query.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { responses: true },
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
