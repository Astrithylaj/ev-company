// Content storage in KV. The current version plus the one before it (for "undo last save").
import type { Env } from './env';
import { defaultContent, validateContent, type SiteContent } from '../src/lib/site';

const KEY = 'content';
const PREV = 'content:prev';

export async function readContent(env: Env, opts: { fresh?: boolean } = {}): Promise<SiteContent | null> {
  if (!env.EV_CONTENT) return null;
  // public pages may use a copy up to a minute old; the admin always reads fresh
  return safeRead(env, KEY, opts.fresh ? undefined : 60);
}

// Stored data is checked on the way out too: if it is ever damaged, the site falls back to the defaults
// instead of crashing, and the admin can still open and save over it.
async function safeRead(env: Env, key: string, cacheTtl?: number): Promise<SiteContent | null> {
  let raw: unknown;
  try { raw = await env.EV_CONTENT.get(key, cacheTtl ? { type: 'json', cacheTtl } : { type: 'json' }); } catch { return null; }
  if (raw == null) return null;
  const v = validateContent(raw);
  if (!v.ok) return null;
  return { ...v.value, updatedAt: typeof (raw as SiteContent).updatedAt === 'string' ? (raw as SiteContent).updatedAt : '' };
}

export async function readForAdmin(env: Env): Promise<{ content: SiteContent; canUndo: boolean }> {
  const [cur, prev] = await Promise.all([readContent(env, { fresh: true }), env.EV_CONTENT.get(PREV)]);
  return { content: cur ?? defaultContent(), canUndo: !!prev };
}

const photos = (c: SiteContent | null) => new Set((c?.projects ?? []).flatMap((p) => p.photos).filter((f) => f.startsWith('/media/')));

export async function saveContent(env: Env, next: SiteContent): Promise<void> {
  const [cur, prev] = await Promise.all([readContent(env, { fresh: true }), safeRead(env, PREV)]);
  if (cur) await env.EV_CONTENT.put(PREV, JSON.stringify(cur));
  await env.EV_CONTENT.put(KEY, JSON.stringify(next));
  // photos only the dropped older version still used can go; the current and previous versions keep theirs
  const keep = new Set([...photos(cur), ...photos(next)]);
  const gone = [...photos(prev)].filter((f) => !keep.has(f)).map((f) => f.replace(/^\/media\//, ''));
  if (gone.length && env.EV_MEDIA) await env.EV_MEDIA.delete(gone);
}

export async function undoContent(env: Env): Promise<SiteContent | null> {
  const prev = await safeRead(env, PREV);
  if (!prev) return null;
  const cur = await readContent(env, { fresh: true });
  await env.EV_CONTENT.put(KEY, JSON.stringify({ ...prev, updatedAt: new Date().toISOString() }));
  if (cur) await env.EV_CONTENT.put(PREV, JSON.stringify(cur)); else await env.EV_CONTENT.delete(PREV);
  return prev;
}
