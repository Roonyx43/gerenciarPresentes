import express from 'express';
import { q } from '../db.js';
import { SELECT_CONTRIBUTIONS } from '../utils/sql.js';

const router = express.Router();

/**
 * GET /contributions
 * Lista todas as contributions
 */
router.get('/', async (req, res) => {
  try {
    const { rows } = await q(SELECT_CONTRIBUTIONS);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao listar contributions' });
  }
});

/**
 * PATCH /contributions/:id/toggle-paid
 * Alterna pending <-> paid
 * Regras de ajuste em gifts.received_amount:
 * - pending -> paid: somar amount no gift correspondente (se houver gift_id)
 * - paid -> pending: subtrair amount
 * - se status = canceled, ignora (ou trate como preferir)
 */
router.patch('/:id/toggle-paid', async (req, res) => {
  const { id } = req.params;

  try {
    await q('BEGIN');

    // busca contribution atual
    const { rows } = await q(
      'SELECT id, gift_id, amount, status FROM public.contributions WHERE id = $1 FOR UPDATE',
      [id]
    );
    if (rows.length === 0) {
      await q('ROLLBACK');
      return res.status(404).json({ error: 'Contribution não encontrada' });
    }

    const c = rows[0];
    if (c.status === 'canceled') {
      await q('ROLLBACK');
      return res.status(400).json({ error: 'Não alterna status de canceled' });
    }

    const nextStatus = c.status === 'paid' ? 'pending' : 'paid';

    // atualiza status
    await q('UPDATE public.contributions SET status = $1 WHERE id = $2', [nextStatus, id]);

    // ajusta received_amount se tiver gift
    if (c.gift_id) {
      const delta = nextStatus === 'paid' ? Number(c.amount) : -Number(c.amount);
      if (delta !== 0) {
        await q(
          'UPDATE public.gifts SET received_amount = GREATEST(0, received_amount + $1) WHERE id = $2',
          [delta, c.gift_id]
        );
      }
    }

    await q('COMMIT');

    // retorna atualizado
    const { rows: after } = await q(SELECT_CONTRIBUTIONS);
    res.json(after);
  } catch (e) {
    await q('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'Erro ao alternar status' });
  }
});

/**
 * DELETE /contributions/:id
 * Exclui contribution. Se estava paid, subtrai amount do gift.
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await q('BEGIN');

    const { rows } = await q(
      'SELECT id, gift_id, amount, status FROM public.contributions WHERE id = $1 FOR UPDATE',
      [id]
    );
    if (rows.length === 0) {
      await q('ROLLBACK');
      return res.status(404).json({ error: 'Contribution não encontrada' });
    }
    const c = rows[0];

    if (c.status === 'paid' && c.gift_id) {
      await q(
        'UPDATE public.gifts SET received_amount = GREATEST(0, received_amount - $1) WHERE id = $2',
        [Number(c.amount), c.gift_id]
      );
    }

    await q('DELETE FROM public.contributions WHERE id = $1', [id]);

    await q('COMMIT');

    const { rows: after } = await q(SELECT_CONTRIBUTIONS);
    res.json(after);
  } catch (e) {
    await q('ROLLBACK');
    res.status(500).json({ error: 'Erro ao excluir contribution' });
  }
});

export default router;
