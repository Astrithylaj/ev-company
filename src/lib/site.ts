// Site content (contact, social links, notice, projects) and the HTML for those parts of the page.
// Edit the data files in src/data/ to change them.

import { content, contact as baseContact, type Lang } from '../data/content';
import { projects as baseProjects, type Project as BaseProject } from '../data/projects';

export type Project = BaseProject & { visible: boolean };

export type SiteContent = {
  contact: { phone: string; email: string; street: string; city: string; hours: { sq: string; en: string } };
  social: { facebook: string; instagram: string; tiktok: string; whatsapp: string; viber: string };
  banner: { on: boolean; until: string; sq: string; en: string };
  projects: Project[];
};

export function defaultContent(): SiteContent {
  return {
    contact: {
      phone: baseContact.phoneDisplay,
      email: baseContact.email,
      street: baseContact.street,
      city: baseContact.city,
      hours: { sq: content.sq.contact.hours, en: content.en.contact.hours },
    },
    // the company number is on WhatsApp (confirmed). Add Facebook / Instagram / TikTok / Viber here when known.
    social: { facebook: '', instagram: '', tiktok: '', whatsapp: baseContact.phoneDisplay, viber: '' },
    banner: { on: false, until: '', sq: '', en: '' },
    projects: baseProjects.map((p) => ({ ...p, visible: true })),
  };
}

const digitsPlus = (v: string) => v.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');

// ---------- helpers ----------

export const esc = (v: string) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
export const telHref = (phone: string) => `tel:${digitsPlus(phone)}`;
export const mapsHref = (street: string, city: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${street} ${city}`)}`;
export const photoSrc = (f: string) => (f.startsWith('/') ? f : `/projects/${f}`);
const pick = (p: Project, lang: Lang) => {
  const t = p[lang], s = p.sq;
  return { title: t.title || s.title, place: t.place || s.place, client: t.client || s.client, text: t.text || s.text };
};
export const visibleProjects = (c: SiteContent) => c.projects.filter((p) => p.visible && (p.sq.title || p.en.title));
export function bannerActive(c: SiteContent, today = new Date().toISOString().slice(0, 10)) {
  return c.banner.on && !!c.banner.sq && (!c.banner.until || today <= c.banner.until);
}

// ---------- HTML pieces (same markup the static build uses) ----------

export function renderProjects(lang: Lang, list: Project[], ids = { section: 'projektet' }): string {
  if (!list.length) return '';
  const t = content[lang];
  const svc = (sid: string) => t.services.list.find((s) => s.id === sid)?.short ?? sid;
  const cards = list.map((p) => {
    const x = pick(p, lang);
    const n = p.photos.length;
    const imgs = n
      ? p.photos.map((f, i) => `<img src="${esc(photoSrc(f))}" alt="${esc(`${x.title}, ${x.place} (${i + 1}/${n})`)}" loading="lazy" decoding="async" width="1600" height="1200" />`).join('')
      : `<div class="project__ph" aria-hidden="true"><span>[PLACEHOLDER: foto]</span></div>`;
    const meta = [x.place, p.year].filter(Boolean).map(esc).join(', ');
    return `<li class="project">
  <div class="project__photos"${n > 1 ? ` tabindex="0" aria-label="${esc(`${x.title}: ${n} ${t.projects.photos}`)}"` : ''}>${imgs}</div>
  ${n > 1 ? `<span class="project__count" aria-hidden="true">${n} ${esc(t.projects.photos)}</span>` : ''}
  <div class="project__body">
    <h3 class="project__title">${esc(x.title)}</h3>
    <p class="project__meta">${meta}${x.client ? `<span>${esc(x.client)}</span>` : ''}</p>
    ${x.text ? `<p class="project__text">${esc(x.text)}</p>` : ''}
    ${p.services.length ? `<ul class="project__tags">${p.services.map((s) => `<li>${esc(svc(s))}</li>`).join('')}</ul>` : ''}
  </div>
</li>`;
  }).join('\n');
  return `<section class="projects" id="${ids.section}">
  <div class="wrap">
    <div class="section-head">
      <h2 class="h2">${esc(t.projects.title)}</h2>
      <p class="section-head__lead">${esc(t.projects.lead)}</p>
    </div>
    <ul class="projects__grid${list.length >= 3 ? ' projects__grid--feature' : ''}">
${cards}
    </ul>
  </div>
</section>`;
}

const ICONS: Record<string, string> = {
  facebook: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v6h4v-6h3l1-4h-4V8z"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.2"/>',
  tiktok: '<path d="M15 3c.4 2.4 1.9 4 4.5 4.3v3.2a8 8 0 0 1-4.4-1.4v6.2A5.7 5.7 0 1 1 9.4 9.6v3.3a2.5 2.5 0 1 0 2.4 2.5V3H15z"/>',
  whatsapp: '<path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3zm4.6 12.6c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1a11 11 0 0 1-5.7-5c-.4-.7-.6-1.5-.4-2.2.2-.6.8-1.2 1.2-1.2h.6c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.5.7c-.1.2-.2.3 0 .6a7 7 0 0 0 3.2 2.8c.3.1.4.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l1.8.9c.3.1.4.2.4.3 0 .3 0 .8-.2 1.2z"/>',
  viber: '<path d="M12 2.5c-4.5 0-8 1.4-8 7.6 0 3.3 1 5.3 3 6.4v3.7c0 .5.6.7.9.4l2.8-2.9c.4 0 .9.1 1.3.1 4.5 0 8-1.4 8-7.7S16.5 2.5 12 2.5zm3.7 10.9c-.4.6-1.4 1-2 .9-1.6-.3-4.5-2.6-5.1-4.6-.2-.6.2-1.6.8-1.9.3-.2.6-.1.8.2l.8 1.1c.2.3.2.6-.1.9l-.4.4c.4 1 1.3 1.9 2.4 2.4l.4-.4c.3-.3.6-.3.9-.1l1.1.8c.3.2.6.4.4.9z"/>',
};

export function socialLinks(c: SiteContent): { key: string; label: string; href: string }[] {
  const s = c.social;
  const out: { key: string; label: string; href: string }[] = [];
  const wa = s.whatsapp.replace(/\D/g, ''), vb = s.viber.replace(/\D/g, '');
  if (wa) out.push({ key: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/${wa}` });
  if (vb) out.push({ key: 'viber', label: 'Viber', href: `viber://chat?number=${encodeURIComponent('+' + vb)}` });
  if (s.facebook) out.push({ key: 'facebook', label: 'Facebook', href: s.facebook });
  if (s.instagram) out.push({ key: 'instagram', label: 'Instagram', href: s.instagram });
  if (s.tiktok) out.push({ key: 'tiktok', label: 'TikTok', href: s.tiktok });
  return out;
}

export function renderSocial(c: SiteContent): string {
  const links = socialLinks(c);
  if (!links.length) return '';
  return `<ul class="social">${links.map((l) => `<li><a href="${esc(l.href)}" target="_blank" rel="noopener" aria-label="${esc(l.label)}"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">${ICONS[l.key]}</svg><span>${esc(l.label)}</span></a></li>`).join('')}</ul>`;
}

export function renderMobileChat(c: SiteContent): string {
  const wa = socialLinks(c).find((l) => l.key === 'whatsapp');
  if (!wa) return '';
  return `<a class="mobilebar__chat" href="${esc(wa.href)}" target="_blank" rel="noopener" aria-label="WhatsApp"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">${ICONS.whatsapp}</svg></a>`;
}

export function renderBanner(lang: Lang, c: SiteContent): string {
  if (!bannerActive(c)) return '';
  const text = (lang === 'en' && c.banner.en) || c.banner.sq;
  return `<div class="notice" role="status"><p>${esc(text)}</p></div>`;
}
