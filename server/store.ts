// Content storage in KV. The current version plus the one before it (for "undo last save").
import type { Env } from './env';
import { defaultContent, type SiteContent } from '../src/lib/site';

const KEY = 'content';
const PREV = 'content:prev';

export async function readContent(env: Env, opts: { fresh?: boolean } = {}): Promise<SiteContent | null> {
  if (!env.EV_CONTENT) return null;
  // public pages may use a copy up to a minute old; the admin always reads fresh
  return (await env.EV_CONTENT.get(KEY, opts.fresh ? { type: 'json' } : { type: 'json', cacheTtl: 60 })) as SiteContent | null;
}

export async function readForAdmin(env: Env): Promise<{ content: SiteContent; canUndo: boolean }> {
  const [cur, prev] = await Promise.all([readContent(env, { fresh: true }), env.EV_CONTENT.get(PREV)]);
  return { content: cur ?? defaultContent(), canUndo: !!prev };
}

const photos = (c: SiteContent | null) => new Set((c?.projects ?? []).flatMap((p) => p.photos).filter((f) => f.startsWith('/media/')));

export async function saveContent(env: Env, next: SiteContent): Promise<void> {
  const [cur, prev] = await Promise.all([readContent(env, { fresh: true }), env.EV_CONTENT.get(PREV, { type: 'json' }) as Promise<SiteContent | null>]);
  if (cur) await env.EV_CONTENT.put(PREV, JSON.stringify(cur));
  await env.EV_CONTENT.put(KEY, JSON.stringify(next));
  // photos only the dropped older version still used can go; the current and previous versions keep theirs
  const keep = new Set([...photos(cur), ...photos(next)]);
  const gone = [...photos(prev)].filter((f) => !keep.has(f)).map((f) => f.replace(/^\/media\//, ''));
  if (gone.length && env.EV_MEDIA) await env.EV_MEDIA.delete(gone);
}

export async function undoContent(env: Env): Promise<SiteContent | null> {
  const prev = (await env.EV_CONTENT.get(PREV, { type: 'json' })) as SiteContent | null;
  if (!prev) return null;
  const cur = await readContent(env, { fresh: true });
  await env.EV_CONTENT.put(KEY, JSON.stringify({ ...prev, updatedAt: new Date().toISOString() }));
  if (cur) await env.EV_CONTENT.put(PREV, JSON.stringify(cur)); else await env.EV_CONTENT.delete(PREV);
  return prev;
}
