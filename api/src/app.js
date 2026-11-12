// Monta middlewares, rotas e erros HTTP; inicialização do servidor fica em server.js.
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { allowedOrigins } from './config.js';
import { asyncRoute } from './middleware/asyncRoute.js';
import { health } from './controllers/healthController.js';
import { authRoutes } from './routes/authRoutes.js';
import { simulationRoutes } from './routes/simulationRoutes.js';
import { adminRoutes } from './routes/adminRoutes.js';
import { HttpError } from './utils/httpError.js';
import { z } from 'zod';

export const app = express();

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '32kb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 40 }));

app.get('/api/health', asyncRoute(health));
app.use('/api/auth', authRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api', (_req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));

// Respostas de validação são seguras e específicas; exceções internas ficam no log do servidor.
app.use((error, _req, res, _next) => {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      error: 'Verifique os campos enviados.',
      details: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: error.message });
  }

  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Registro duplicado.' });
  }

  console.error(error);
  return res.status(500).json({ error: 'Erro interno da API.' });
});
