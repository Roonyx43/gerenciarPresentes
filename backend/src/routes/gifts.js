import express from 'express';
import { q } from '../db.js';
import { SELECT_GIFTS } from '../utils/sql.js';

const router = express.Router();

/**
 * GET /gifts
 */
router.get('/', async (_req, res) => {
  try {
    const { rows } = await q(SELECT_GIFTS);
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Erro ao listar gifts' });
  }
});

/**
 * POST /gifts
 * body: { name, goal_amount }
 * received_amount sempre inicia 0
 */
router.post('/', async (req, res) => {
  const { name, goal_amount } = req.body || {};
  if (!name || !goal_amount) {
    return res.status(400).json({ error: 'name e goal_amount são obrigatórios' });
  }

  try {
    await q(
      'INSERT INTO public.gifts(name, goal_amount, received_amount, is_active) VALUES ($1, $2, 0, true)',
      [name, Number(goal_amount)]
    );
    const { rows } = await q(SELECT_GIFTS);
    res.status(201).json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao criar gift' });
  }
});

/**
 * PATCH /gifts/:id
 * Pode atualizar is_active (ou meta, se quiser)
 */
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { is_active, goal_amount } = req.body || {};

  const sets = [];
  const vals = [];
  let idx = 1;

  if (typeof is_active === 'boolean') {
    sets.push(`is_active = $${idx++}`);
    vals.push(is_active);
  }
  if (goal_amount != null) {
    sets.push(`goal_amount = $${idx++}`);
    vals.push(Number(goal_amount));
  }
  if (sets.length === 0) {
    return res.status(400).json({ error: 'Nada para atualizar' });
  }
  vals.push(id);

  try {
    await q(`UPDATE public.gifts SET ${sets.join(', ')} WHERE id = $${idx}`, vals);
    const { rows } = await q(SELECT_GIFTS);
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar gift' });
  }
});

/**
 * DELETE /gifts/:id
 * Obs: se existirem contributions vinculadas, FK pode bloquear. Decida regra de negócio.
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await q('DELETE FROM public.gifts WHERE id = $1', [id]);
    const { rows } = await q(SELECT_GIFTS);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao excluir gift (verifique FK em contributions)' });
  }
});

export default router;
