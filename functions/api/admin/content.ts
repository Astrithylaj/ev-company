import type { Ctx } from '../../../server/env';
import { json } from '../../../server/env';
import { readForAdmin, saveContent } from '../../../server/store';
import { validateContent } from '../../../src/lib/site';

export const onRequestGet = async (ctx: Ctx) => json({ ...(await readForAdmin(ctx.env)), user: ctx.data.user?.email });

export const onRequestPut = async (ctx: Ctx) => {
  const len = Number(ctx.request.headers.get('content-length') || 0);
  if (len > 512_000) return json({ error: 'Të dhënat janë shumë të mëdha.' }, 413);
  let body: unknown;
  try { body = await ctx.request.json(); } catch { return json({ error: 'Të dhënat nuk u lexuan.' }, 400); }
  const v = validateContent(body);
  if (!v.ok) return json({ error: v.error }, 422);
  await saveContent(ctx.env, v.value);
  return json({ ok: true, content: v.value, canUndo: true });
};
