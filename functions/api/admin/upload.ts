// Photo upload: images only (checked by their first bytes, not just the name), max 8 MB, random file name.
import type { Ctx } from '../../../server/env';
import { json } from '../../../server/env';

const MAX = 8 * 1024 * 1024;
function kind(b: Uint8Array): { ext: string; type: string } | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: 'jpg', type: 'image/jpeg' };
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { ext: 'png', type: 'image/png' };
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return { ext: 'webp', type: 'image/webp' };
  return null;
}

export const onRequestPost = async (ctx: Ctx) => {
  if (!ctx.env.EV_MEDIA) return json({ error: 'Ngarkimi i fotove nuk është aktivizuar ende.' }, 503);
  let form: FormData;
  try { form = await ctx.request.formData(); } catch { return json({ error: 'Foto nuk u ngarkua.' }, 400); }
  const file = form.get('file');
  if (!file || typeof file === 'string') return json({ error: 'Zgjidhni një foto.' }, 400);
  if (file.size > MAX) return json({ error: 'Fotoja është më e madhe se 8 MB.' }, 413);
  const buf = new Uint8Array(await file.arrayBuffer());
  const k = kind(buf);
  if (!k) return json({ error: 'Lejohen vetëm foto JPG, PNG ose WebP.' }, 415);
  const key = `projects/${crypto.randomUUID()}.${k.ext}`;
  await ctx.env.EV_MEDIA.put(key, buf, { httpMetadata: { contentType: k.type, cacheControl: 'public, max-age=31536000, immutable' } });
  return json({ ok: true, path: `/media/${key}` });
};
