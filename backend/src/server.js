import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import contributionsRouter from './routes/contributions.js';
import giftsRouter from './routes/gifts.js';
import statsRoutes from './routes/stats.js';

dotenv.config();

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/contributions', contributionsRouter);
app.use('/api/gifts', giftsRouter);
app.use('/api/stats', statsRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
