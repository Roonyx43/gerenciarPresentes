import express from 'express';
import { q } from '../db.js';
import {
  SELECT_TOP_CONTRIBUTORS,
  SELECT_TOP_CONTRIBUTORS_BY_GIFT
} from '../utils/sql.js';

const router = express.Router();

/**
 * GET /stats/contributors/top
 * Query params:
 *   gift_id? (opcional)
 *   limit? (default 10)
 */
router.get('/contributors/top', async (req, res) => {
  try {
    const { gift_id, limit } = req.query;
    const lim = Number(limit) > 0 ? Number(limit) : 10;

    const { rows } = gift_id
      ? await q(SELECT_TOP_CONTRIBUTORS_BY_GIFT, [Number(gift_id), lim])
      : await q(SELECT_TOP_CONTRIBUTORS, [lim]);

    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar top contributors:', err.message);
    res.status(500).json({ error: 'Erro ao buscar top contributors' });
  }
});

export default router;
