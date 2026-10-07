import type { Ctx } from '../../../server/env';
import { json } from '../../../server/env';
import { undoContent, readForAdmin } from '../../../server/store';

export const onRequestPost = async (ctx: Ctx) => {
  const prev = await undoContent(ctx.env);
  if (!prev) return json({ error: 'Nuk ka ndryshim për ta kthyer.' }, 409);
  return json({ ok: true, ...(await readForAdmin(ctx.env)) });
};
