export const SELECT_CONTRIBUTIONS = `
  SELECT c.id, c.gift_id, g.name AS gift_name,
         c.padrinho_name, c.amount, c.txid, c.status, c.created_at
  FROM public.contributions c
  LEFT JOIN public.gifts g ON g.id = c.gift_id
  ORDER BY c.created_at DESC, c.id DESC
`;

export const SELECT_GIFTS = `
  SELECT id, name, goal_amount, received_amount, is_active, img, descricao, concluido
  FROM public.gifts
  ORDER BY id DESC
`;

export const SELECT_TOP_CONTRIBUTORS = `
  SELECT
    COALESCE(c.padrinho_name, '(Sem nome)') AS padrinho_name,
    SUM(c.amount)::numeric AS total_amount,
    COUNT(*)::int AS contributions_count
  FROM public.contributions c
  WHERE LOWER(c.status) IN ('paid', 'pago')
  GROUP BY c.padrinho_name
  ORDER BY total_amount DESC
  LIMIT $1
`;

export const SELECT_TOP_CONTRIBUTORS_BY_GIFT = `
  SELECT
    COALESCE(c.padrinho_name, '(Sem nome)') AS padrinho_name,
    SUM(c.amount)::numeric AS total_amount,
    COUNT(*)::int AS contributions_count
  FROM public.contributions c
  WHERE LOWER(c.status) IN ('paid', 'pago') AND c.gift_id = $1
  GROUP BY c.padrinho_name
  ORDER BY total_amount DESC
  LIMIT $2
`;
