
import { PrismaClient } from '@prisma/client';
import { generate } from '../services/aiService.js';

const prisma = new PrismaClient();

export async function createQuery(req, res) {

  
  try {
    const { prompt, providers } = req.body;

    const query = await prisma.query.create({ data: { prompt } });

    const promises = providers.map(async (p) => {
      const start = Date.now();
      try {
        console.log(`=== Calling provider: ${p} ===`);
        const content = await generate(p, prompt);
        const latencyMs = Date.now() - start;
        console.log(`=== Provider ${p} completed in ${latencyMs}ms ===`);
        
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

export async function getQueries(_req, res) {
  try {
    const data = await prisma.query.findMany({
      orderBy: { createdAt: 'desc' },
      include: { responses: true },
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}