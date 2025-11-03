export const SELECT_CONTRIBUTIONS = `
  SELECT c.id, c.gift_id, g.name AS gift_name,
         c.padrinho_name, c.amount, c.txid, c.status, c.created_at
  FROM public.contributions c
  LEFT JOIN public.gifts g ON g.id = c.gift_id
  ORDER BY c.created_at DESC, c.id DESC
`;

export const SELECT_GIFTS = `
  SELECT id, name, goal_amount, received_amount, is_active
  FROM public.gifts
  ORDER BY id DESC
`;