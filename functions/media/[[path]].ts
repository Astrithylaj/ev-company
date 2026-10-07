// Serves project photos from R2: /media/projects/<id>.<ext>
import type { Ctx } from '../../server/env';

export const onRequestGet = async (ctx: Ctx) => {
  const key = new URL(ctx.request.url).pathname.replace(/^\/media\//, '');
  if (!/^projects\/[a-z0-9-]{8,64}\.(jpg|jpeg|png|webp)$/i.test(key)) return new Response('Not found', { status: 404 });
  const obj = await ctx.env.EV_MEDIA.get(key);
  if (!obj) return new Response('Not found', { status: 404 });
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  headers.set('x-content-type-options', 'nosniff');
  return new Response(obj.body, { headers });
};
