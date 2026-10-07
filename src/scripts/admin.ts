// Admin panel behaviour. All text is Albanian: the panel is for the company owner.
import type { SiteContent, Project } from '../lib/site';

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector(sel) as T;
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll(sel)) as T[];
const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const digitsPlus = (v: string) => v.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');

let state: SiteContent;
let saved = '';
let canUndo = false;
let editingId: string | null = null;
let busy = 0; // uploads in progress

// ---------- server ----------
async function api(path: string, init: RequestInit = {}) {
  const res = await fetch(path, { ...init, headers: { 'x-ev-admin': '1', ...(init.body && !(init.body instanceof FormData) ? { 'content-type': 'application/json' } : {}), ...(init.headers || {}) }, credentials: 'same-origin' });
  let data: any = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error(data?.error || (res.status === 403 ? 'Sesioni ka skaduar. Rifreskoni faqen dhe hyni përsëri.' : 'Diçka shkoi keq. Provoni përsëri.'));
  return data;
}

// ---------- status ----------
const dirty = () => JSON.stringify(state) !== saved;
function refreshBar(msg?: string, tone: 'ok' | 'err' | '' = '') {
  const status = $('[data-status]');
  const save = $<HTMLButtonElement>('[data-save]');
  const undo = $<HTMLButtonElement>('[data-undo]');
  const d = dirty();
  save.disabled = !d || busy > 0;
  undo.hidden = d || !canUndo;
  status.dataset.tone = tone || (d ? 'warn' : '');
  status.textContent = msg ?? (busy ? 'Duke ngarkuar fotot…' : d ? 'Keni ndryshime të paruajtura.' : 'Të gjitha ndryshimet janë ruajtur.');
}
const changed = () => refreshBar();

// ---------- tabs ----------
function setupTabs() {
  const tabs = $$<HTMLButtonElement>('[role=tab]');
  const show = (t: HTMLButtonElement, focus = false) => {
    tabs.forEach((x) => {
      const on = x === t;
      x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1;
      $(`#${x.getAttribute('aria-controls')}`).hidden = !on;
    });
    if (focus) t.focus();
    try { sessionStorage.setItem('ev-admin-tab', t.dataset.tab!); } catch {}
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => show(t));
    t.addEventListener('keydown', (e) => {
      const n = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length : -1;
      if (n >= 0) { e.preventDefault(); show(tabs[n], true); }
    });
  });
  let last: string | null = null;
  try { last = sessionStorage.getItem('ev-admin-tab'); } catch {}
  show(tabs.find((t) => t.dataset.tab === last) ?? tabs[0]);
}

// ---------- simple forms (contact, social, banner) ----------
function bindForm(sel: string, get: () => Record<string, any>) {
  const form = $<HTMLFormElement>(sel);
  const fields = $$<HTMLInputElement>('input', form);
  const read = (path: string) => path.split('.').reduce((o, k) => o?.[k], get());
  const write = (path: string, v: any) => {
    const keys = path.split('.'); const last = keys.pop()!;
    keys.reduce((o, k) => o[k], get())[last] = v;
  };
  const fill = () => fields.forEach((f) => { const v = read(f.name); if (f.type === 'checkbox') f.checked = !!v; else f.value = v ?? ''; });
  fields.forEach((f) => f.addEventListener(f.type === 'checkbox' ? 'change' : 'input', () => { write(f.name, f.type === 'checkbox' ? f.checked : f.value); changed(); bannerPreview(); }));
  return fill;
}
function bannerPreview() {
  const p = $('[data-banner-preview]');
  const b = state.banner;
  p.textContent = b.sq || 'Teksti i njoftimit shfaqet këtu.';
  p.dataset.off = String(!b.on);
}

// ---------- projects list ----------
const blankProject = (): Project => ({
  id: `p-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
  visible: true, year: '', services: [], photos: [],
  sq: { title: '', place: '', client: '', text: '' }, en: { title: '', place: '', client: '', text: '' },
});
const thumb = (p: Project) => p.photos[0] ? (p.photos[0].startsWith('/') ? p.photos[0] : `/projects/${p.photos[0]}`) : '';

function renderList() {
  const list = $('[data-plist]');
  $('[data-empty]').hidden = state.projects.length > 0;
  list.innerHTML = state.projects.map((p, i) => `
    <li class="pitem${p.visible ? '' : ' pitem--hidden'}" data-id="${esc(p.id)}">
      <div class="pitem__thumb">${thumb(p) ? `<img src="${esc(thumb(p))}" alt="" loading="lazy" />` : '<span>Pa foto</span>'}</div>
      <div class="pitem__info">
        <strong>${esc(p.sq.title || 'Pa titull')}</strong>
        <span>${esc([p.sq.place, p.year].filter(Boolean).join(', ') || '—')} · ${p.photos.length} foto</span>
        <em class="tag ${p.visible ? 'tag--on' : ''}">${p.visible ? 'Shfaqet' : 'E fshehur'}</em>
      </div>
      <div class="pitem__actions">
        <button type="button" class="icon" data-up ${i === 0 ? 'disabled' : ''} aria-label="Lëviz lart">▲</button>
        <button type="button" class="icon" data-down ${i === state.projects.length - 1 ? 'disabled' : ''} aria-label="Lëviz poshtë">▼</button>
        <button type="button" class="btn btn--ghost" data-edit>Ndrysho</button>
      </div>
    </li>`).join('');
}
function setupList() {
  $('[data-plist]').addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('button'); if (!btn) return;
    const id = btn.closest<HTMLElement>('[data-id]')!.dataset.id!;
    const i = state.projects.findIndex((p) => p.id === id);
    if (btn.hasAttribute('data-edit')) return openEditor(id);
    const j = btn.hasAttribute('data-up') ? i - 1 : btn.hasAttribute('data-down') ? i + 1 : -1;
    if (j < 0 || j >= state.projects.length) return;
    [state.projects[i], state.projects[j]] = [state.projects[j], state.projects[i]];
    renderList(); changed();
    $<HTMLButtonElement>(`[data-id="${CSS.escape(id)}"] ${j < i ? '[data-up]' : '[data-down]'}`)?.focus();
  });
  $('[data-add]').addEventListener('click', () => {
    const p = blankProject();
    state.projects.unshift(p);
    changed();
    openEditor(p.id, true);
  });
}

// ---------- project editor ----------
const cur = () => state.projects.find((p) => p.id === editingId)!;
function openEditor(id: string, isNew = false) {
  editingId = id;
  const p = cur();
  $('[data-list-view]').hidden = true;
  const ed = $<HTMLFormElement>('[data-editor]');
  ed.hidden = false;
  $('[data-editor-title]').textContent = isNew ? 'Projekt i ri' : 'Ndrysho projektin';
  for (const lang of ['sq', 'en'] as const) for (const k of ['title', 'place', 'client', 'text'] as const) {
    $<HTMLInputElement>(`#e-${lang}-${k}`).value = p[lang][k];
  }
  $<HTMLInputElement>('#e-year').value = p.year ?? '';
  $<HTMLInputElement>('#e-visible').checked = p.visible;
  $$<HTMLInputElement>('input[name=services]', ed).forEach((c) => (c.checked = p.services.includes(c.value)));
  ($('.group--en', ed) as HTMLDetailsElement).open = !!(p.en.title || p.en.text);
  $('[data-delete-confirm]').hidden = true; $('[data-delete]').hidden = false;
  $('[data-upload-status]').textContent = '';
  renderPhotos();
  window.scrollTo({ top: 0 });
  $<HTMLInputElement>('#e-sq-title').focus();
}
function closeEditor() {
  const p = cur();
  if (p && !p.sq.title.trim()) {
    $('[data-upload-status]').textContent = '';
    const t = $<HTMLInputElement>('#e-sq-title');
    t.setCustomValidity('Shkruani titullin në shqip.'); t.reportValidity(); t.setCustomValidity('');
    return;
  }
  editingId = null;
  $('[data-editor]').hidden = true;
  $('[data-list-view]').hidden = false;
  renderList();
}
function renderPhotos() {
  const p = cur();
  $('[data-photos]').innerHTML = p.photos.map((f, i) => `
    <li class="ph" data-i="${i}">
      <img src="${esc(f.startsWith('/') ? f : `/projects/${f}`)}" alt="Foto ${i + 1}" />
      ${i === 0 ? '<em class="ph__cover">Kopertina</em>' : ''}
      <div class="ph__actions">
        <button type="button" class="icon" data-left ${i === 0 ? 'disabled' : ''} aria-label="Foto majtas">◀</button>
        <button type="button" class="icon" data-right ${i === p.photos.length - 1 ? 'disabled' : ''} aria-label="Foto djathtas">▶</button>
        <button type="button" class="icon icon--danger" data-remove aria-label="Hiq foton">✕</button>
      </div>
    </li>`).join('');
  $<HTMLLabelElement>('.upload').hidden = p.photos.length >= 12;
}
async function shrink(file: File): Promise<Blob> {
  let bmp: ImageBitmap;
  try { bmp = await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions); }
  catch { throw new Error(/heic|heif/i.test(file.type || file.name) ? 'Fotot HEIC të iPhone nuk lexohen. Dërgojini si JPG (Cilësimet → Kamera → Formatet → Më i përputhshmi).' : `“${file.name}” nuk është foto e lexueshme.`); }
  const max = 2000;
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close();
  return await new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('Fotoja nuk u përpunua.'))), 'image/jpeg', 0.85));
}
function setupEditor() {
  const ed = $<HTMLFormElement>('[data-editor]');
  ed.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement; const p = cur(); if (!p) return;
    const m = t.name.match(/^(sq|en)\.(title|place|client|text)$/);
    if (m) p[m[1] as 'sq' | 'en'][m[2] as 'title'] = t.value;
    else if (t.name === 'year') p.year = t.value;
    else if (t.name === 'visible') p.visible = t.checked;
    else if (t.name === 'services') p.services = $$<HTMLInputElement>('input[name=services]:checked', ed).map((c) => c.value);
    changed();
  });
  $('[data-back]').addEventListener('click', closeEditor);
  $('[data-done]').addEventListener('click', closeEditor);
  $('[data-delete]').addEventListener('click', () => { $('[data-delete]').hidden = true; $('[data-delete-confirm]').hidden = false; $<HTMLButtonElement>('[data-delete-no]').focus(); });
  $('[data-delete-no]').addEventListener('click', () => { $('[data-delete]').hidden = false; $('[data-delete-confirm]').hidden = true; });
  $('[data-delete-yes]').addEventListener('click', () => {
    state.projects = state.projects.filter((p) => p.id !== editingId);
    editingId = null;
    ed.hidden = true; $('[data-list-view]').hidden = false;
    renderList(); changed();
  });
  $('[data-photos]').addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('button'); if (!btn) return;
    const p = cur(); const i = Number(btn.closest<HTMLElement>('[data-i]')!.dataset.i);
    if (btn.hasAttribute('data-remove')) p.photos.splice(i, 1);
    else { const j = btn.hasAttribute('data-left') ? i - 1 : i + 1; [p.photos[i], p.photos[j]] = [p.photos[j], p.photos[i]]; }
    renderPhotos(); changed();
  });
  const input = $<HTMLInputElement>('[data-file]');
  input.addEventListener('change', async () => {
    const p = cur(); const files = Array.from(input.files || []); input.value = '';
    const room = 12 - p.photos.length;
    const todo = files.slice(0, room);
    const status = $('[data-upload-status]');
    const errors: string[] = [];
    if (files.length > room) errors.push(`U morën vetëm ${room} foto: kufiri është 12 për projekt.`);
    busy++; refreshBar();
    for (let n = 0; n < todo.length; n++) {
      status.textContent = `Duke ngarkuar ${n + 1} nga ${todo.length}…`;
      try {
        const blob = await shrink(todo[n]);
        const fd = new FormData(); fd.append('file', blob, 'foto.jpg');
        const r = await api('/api/admin/upload', { method: 'POST', body: fd });
        if (editingId === p.id || state.projects.includes(p)) p.photos.push(r.path);
        if (editingId === p.id) renderPhotos();
      } catch (err) { errors.push((err as Error).message); }
    }
    busy--;
    status.textContent = errors.length ? errors.join(' ') : `${todo.length} foto u shtuan. Mos harroni: Ruaj ndryshimet.`;
    status.dataset.tone = errors.length ? 'err' : 'ok';
    changed();
  });
}

// ---------- validation + save ----------
function problem(): string | null {
  const c = state.contact;
  if (digitsPlus(c.phone).replace('+', '').length < 6) return 'Kontakti: numri i telefonit nuk është i saktë.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) return 'Kontakti: emaili nuk është i saktë.';
  for (const k of ['facebook', 'instagram', 'tiktok'] as const) {
    const v = state.social[k].trim();
    if (v && !/^https:\/\//i.test(v)) return `Rrjetet sociale: lidhja e ${k} duhet të fillojë me https://`;
  }
  if (state.banner.on && !state.banner.sq.trim()) return 'Njoftimi: shkruani tekstin shqip ose fikeni njoftimin.';
  const bad = state.projects.find((p) => !p.sq.title.trim());
  if (bad) return 'Projektet: një projekt nuk ka titull në shqip.';
  return null;
}
async function save() {
  if (editingId && !cur().sq.title.trim()) { closeEditor(); return; }
  const err = problem();
  if (err) { refreshBar(err, 'err'); return; }
  const btn = $<HTMLButtonElement>('[data-save]'); btn.disabled = true;
  refreshBar('Duke ruajtur…');
  try {
    const r = await api('/api/admin/content', { method: 'PUT', body: JSON.stringify(state) });
    state = r.content; saved = JSON.stringify(state); canUndo = r.canUndo;
    fillAll();
    refreshBar('U ruajt. Ndryshimet shfaqen në faqe brenda 1 minute.', 'ok');
  } catch (e) { refreshBar((e as Error).message, 'err'); }
}
async function undo() {
  refreshBar('Duke kthyer…');
  try {
    const r = await api('/api/admin/undo', { method: 'POST', body: '{}' });
    state = r.content; saved = JSON.stringify(state); canUndo = r.canUndo;
    fillAll();
    refreshBar('U kthye versioni i mëparshëm.', 'ok');
  } catch (e) { refreshBar((e as Error).message, 'err'); }
}

let fillers: (() => void)[] = [];
function fillAll() {
  fillers.forEach((f) => f());
  bannerPreview();
  if (editingId && cur()) openEditor(editingId); else { editingId = null; $('[data-editor]').hidden = true; $('[data-list-view]').hidden = false; renderList(); }
}

export async function startAdmin() {
  setupTabs();
  try {
    const r = await api('/api/admin/content');
    state = r.content; saved = JSON.stringify(state); canUndo = r.canUndo;
    $('[data-user]').textContent = r.user || '';
  } catch (e) {
    $('[data-loading]').textContent = (e as Error).message;
    return;
  }
  $('[data-loading]').hidden = true;
  fillers = [
    bindForm('[data-form-contact]', () => state.contact),
    bindForm('[data-form-social]', () => state.social),
    bindForm('[data-form-banner]', () => state.banner),
  ];
  setupList(); setupEditor();
  fillAll();
  $('[data-save]').addEventListener('click', save);
  $('[data-undo]').addEventListener('click', undo);
  window.addEventListener('beforeunload', (e) => { if (dirty()) { e.preventDefault(); e.returnValue = ''; } });
  refreshBar();
}
