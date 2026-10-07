// 1) Admin guard: /admin and /api/admin need a valid Cloudflare Access login from an allowed email.
// 2) Live content: public pages get the latest contact details, socials, banner and projects from KV,
//    written into the static HTML at the edge (no flash, readable by Google). No content saved yet = the static page as built.
import type { Ctx } from '../server/env';
import { json } from '../server/env';
import { adminUser } from '../server/auth';
import { readContent } from '../server/store';
import {
  esc, telHref, mapsHref, visibleProjects, renderProjects, renderSocial, renderBanner, renderMobileChat,
} from '../src/lib/site';

const isAdminPath = (p: string) => p === '/admin' || p.startsWith('/admin/') || p.startsWith('/api/admin/');

async function guard(ctx: Ctx) {
  const url = new URL(ctx.request.url);
  if (!isAdminPath(url.pathname)) return ctx.next();
  const user = await adminUser(ctx.request, ctx.env);
  if (!user) {
    if (url.pathname.startsWith('/api/')) return json({ error: 'Nuk keni qasje.' }, 403);
    return new Response('<!doctype html><meta charset="utf-8"><title>Nuk keni qasje</title><body style="font:16px system-ui;background:#000;color:#eee;padding:40px"><h1>Nuk keni qasje</h1><p>Kjo faqe është vetëm për administratorët e EV COMPANY.</p>', { status: 403, headers: { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex' } });
  }
  if (url.pathname.startsWith('/api/admin/') && ctx.request.method !== 'GET') {
    // block cross-site requests: our panel always sends this header and comes from the same origin
    const origin = ctx.request.headers.get('origin');
    if (ctx.request.headers.get('x-ev-admin') !== '1' || (origin && new URL(origin).host !== url.host)) return json({ error: 'Kërkesë e pavlefshme.' }, 400);
  }
  ctx.data.user = user;
  const res = await ctx.next();
  const out = new Response(res.body, res);
  out.headers.set('x-robots-tag', 'noindex, nofollow');
  out.headers.set('cache-control', 'no-store');
  return out;
}

async function inject(ctx: Ctx) {
  const res = await ctx.next();
  const url = new URL(ctx.request.url);
  if (ctx.request.method !== 'GET' || isAdminPath(url.pathname) || !(res.headers.get('content-type') || '').includes('text/html')) return res;
  let c;
  try { c = await readContent(ctx.env); } catch { c = null; }
  if (!c) return res;

  const lang = url.pathname.startsWith('/en') ? 'en' : 'sq';
  const projects = visibleProjects(c);
  const phone = c.contact.phone, tel = telHref(phone), email = c.contact.email;
  const address = `${c.contact.street}, ${c.contact.city}`;
  const text = (v: string) => ({ element(el: Element) { el.setInnerContent(v); } });
  const html = (v: string) => ({ element(el: Element) { el.setInnerContent(v, { html: true }); } });

  const out = new HTMLRewriter()
    .on('a[href^="tel:"]', { element(el) { el.setAttribute('href', tel); } })
    .on('a[href^="mailto:"]', { element(el) { el.setAttribute('href', `mailto:${email}`); } })
    .on('[data-c-phone]', text(phone))
    .on('[data-c-email]', text(email))
    .on('[data-c-address]', text(address))
    .on('[data-c-hours]', text(c.contact.hours[lang] || c.contact.hours.sq))
    .on('[data-c-maps]', { element(el) { el.setAttribute('href', mapsHref(c.contact.street, c.contact.city)); } })
    .on('form[data-form]', { element(el) { el.setAttribute('data-email', esc(email)); } })
    .on('[data-slot="projects"]', html(renderProjects(lang, projects)))
    .on('[data-nav-projects]', { element(el) { if (projects.length) el.removeAttribute('hidden'); else el.setAttribute('hidden', ''); } })
    .on('[data-slot="social"]', html(renderSocial(c)))
    .on('[data-slot="mobile-chat"]', html(renderMobileChat(c)))
    .on('[data-slot="banner"]', html(renderBanner(lang, c)))
    .transform(res);
  const headers = new Headers(out.headers);
  headers.set('cache-control', 'public, max-age=0, must-revalidate');
  return new Response(out.body, { status: out.status, headers });
}

export const onRequest = [guard, inject];
