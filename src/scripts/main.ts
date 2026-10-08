// Page behaviour: hero 3D, scroll-linked effects, breaker panel, form, menu.
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export function boot() {
  (window as Window & { __evBooted?: boolean }).__evBooted = true;
  header();
  menu();
  const hero = heroSetup();
  board();
  const process = processSetup();
  coverage();
  flashlight();
  mobileBar();
  contactSwitch();
  form();

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      hero();
      process();
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
}

/* ---------- Header ---------- */
function header() {
  const el = document.querySelector<HTMLElement>('[data-header]');
  if (!el) return;
  const update = () => el.classList.toggle('is-solid', window.scrollY > window.innerHeight * 0.6);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

function menu() {
  const btn = document.querySelector<HTMLButtonElement>('[data-menu]');
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  if (!btn || !nav) return;
  const label = btn.querySelector<HTMLElement>('.menu-btn__text')!;
  const set = (open: boolean) => {
    btn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    label.textContent = open ? label.dataset.close! : label.dataset.open!;
  };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('a')) set(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { set(false); btn.focus(); } });
}

/* ---------- Hero ---------- */
function heroSetup() {
  const section = document.querySelector<HTMLElement>('[data-hero]');
  const canvas = document.querySelector<HTMLCanvasElement>('[data-hero-canvas]');
  const content = document.querySelector<HTMLElement>('[data-hero-content]');
  if (!section || !canvas) return () => {};
  let handle: { setProgress(p: number): void } | null = null;

  const intro = introSetup();
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    section.classList.add('is-running');
    intro.play();
  };
  const fallback = window.setTimeout(start, 2600); // text lights up even if 3D is slow or unavailable
  // weak or data-saving devices get a still image of the lit street instead of the 3D scene
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const weak = (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) || (navigator.hardwareConcurrency || 8) <= 2 || !!nav.connection?.saveData;
  if (weak) { section.classList.add('no-webgl'); start(); return update; }
  import('./hero3d').then(({ initHero }) => {
    handle = initHero(canvas, reduced, () => { window.clearTimeout(fallback); start(); });
    if (!handle) { section.classList.add('no-webgl'); start(); return; }
    section.classList.add('has-webgl');
    update();
  }).catch(() => { section.classList.add('no-webgl'); start(); });

  function update() {
    const r = section!.getBoundingClientRect();
    const total = Math.max(1, r.height - window.innerHeight);
    const p = clamp(-r.top / total);
    handle?.setProgress(p);
    if (content && !reduced) {
      content.style.setProperty('--hp', p.toFixed(3));
    }
  }
  return update;
}

/* ---------- Intro: the logo's bolt switches the street on, then the logo moves into the header ---------- */
function introSetup() {
  const html = document.documentElement;
  const el = document.querySelector<HTMLElement>('[data-intro]');
  const mark = document.querySelector<HTMLElement>('[data-intro-mark]');
  const base = mark?.querySelector<HTMLElement>('.intro-logo__base');
  const bolt = mark?.querySelector<HTMLElement>('.intro-logo__bolt');
  const target = document.querySelector<HTMLElement>('.site-header__brand img');
  const active = html.classList.contains('intro') && el && mark && base && bolt && target;
  if (!active) { el?.remove(); return { play() {} }; }
  try { sessionStorage.setItem('ev-intro', '1'); } catch {}

  const timers: number[] = [];
  const anims: Animation[] = [];
  let done = false;

  const finish = (e?: Event | 'landed') => {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    if (e !== 'landed') anims.forEach((a) => a.cancel()); // skipped: no need to fly anywhere
    html.classList.remove('intro');
    html.classList.add('intro-done');
    if (e === 'landed') el.remove(); // the header logo takes over in the same spot
    else { el.classList.add('is-gone'); timers.push(window.setTimeout(() => el.remove(), 400)); }
    skipEvents.forEach((ev) => window.removeEventListener(ev, finish));
  };
  // anyone who wants to get going skips straight to the page
  const skipEvents = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
  skipEvents.forEach((ev) => window.addEventListener(ev, finish, { passive: true }));
  // any other way of scrolling away (scrollbar, links) also ends it
  const onScroll = () => { if (window.scrollY > 40) { finish(); window.removeEventListener('scroll', onScroll); } };
  window.addEventListener('scroll', onScroll, { passive: true });

  return {
    play() {
      if (done) return;
      // 1. the bolt strikes (the street lights start right after, from the 3D timeline)
      timers.push(window.setTimeout(() => {
        anims.push(bolt.animate(
          [{ opacity: 0 }, { opacity: 1, offset: 0.08 }, { opacity: 0.15, offset: 0.16 }, { opacity: 0.9, offset: 0.3 }, { opacity: 0.35, offset: 0.4 }, { opacity: 1 }],
          { duration: 700, fill: 'forwards' },
        ));
        anims.push(base.animate(
          [{ filter: 'brightness(0.45)' }, { filter: 'brightness(1.1)', offset: 0.3 }, { filter: 'brightness(0.7)', offset: 0.4 }, { filter: 'brightness(1)' }],
          { duration: 700, fill: 'forwards' },
        ));
      }, 350));
      // 2. the logo flies into the header; its "COMPANY sh.p.k." line folds away
      timers.push(window.setTimeout(() => {
        const from = mark.getBoundingClientRect();
        const to = target.getBoundingClientRect();
        const k = to.width / from.width;
        const easing = 'cubic-bezier(0.7, 0, 0.2, 1)';
        anims.push(mark.animate(
          [{ transform: 'translate(0, 0) scale(1)' }, { transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${k})` }],
          { duration: 950, easing, fill: 'forwards' },
        ));
        anims.push(base.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 23.7% 0)' }], { duration: 500, easing, fill: 'forwards' }));
        timers.push(window.setTimeout(() => finish('landed'), 950));
      }, 2500));
    },
  };
}

/* ---------- Breaker panel ---------- */
function board() {
  const root = document.querySelector<HTMLElement>('[data-board]');
  if (!root) return;
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-breaker]'));
  const readout = root.querySelector<HTMLElement>('.readout')!;
  const idOf = (t: HTMLButtonElement) => t.id.replace('tab-', '');
  let current = idOf(tabs.find((t) => t.getAttribute('aria-selected') === 'true') ?? tabs[0]);

  // the mini city loads only when the services section gets close
  let city: { select(id: string): void } | null = null;
  const cityHost = root.querySelector<HTMLElement>('[data-city]');
  if (cityHost) {
    // wait until the town is nearly on screen and the browser is idle, so it never competes with the hero
    const idle = (fn: () => void) => ('requestIdleCallback' in window ? (window as any).requestIdleCallback(fn, { timeout: 1200 }) : setTimeout(fn, 200));
    const near = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      near.disconnect();
      idle(() => import('./city3d').then(({ initCity }) => {
        city = initCity(cityHost, reduced, current);
        if (!city) cityHost.classList.add('is-fallback');
      }).catch(() => cityHost.classList.add('is-fallback')));
    }, { rootMargin: '120px 0px' });
    near.observe(cityHost);
  }

  const select = (tab: HTMLButtonElement, focus = false) => {
    current = idOf(tab);
    // on phones, make sure the town is on screen so the tap shows its result
    if (cityHost && window.matchMedia('(max-width: 1000px)').matches) {
      const r = cityHost.getBoundingClientRect();
      if (r.top < 64 || r.bottom > window.innerHeight) {
        window.scrollTo({ top: window.scrollY + r.top - 80, behavior: reduced ? 'auto' : 'smooth' });
      }
    }
    root.classList.toggle('is-all', current === 'all');
    city?.select(current);
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls')!);
      if (panel) panel.hidden = !on;
    });
    if (focus) tab.focus();
    if (!reduced) {
      readout.classList.remove('is-flicker');
      void readout.offsetWidth;
      readout.classList.add('is-flicker');
    }
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      let n = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') n = 0;
      if (e.key === 'End') n = tabs.length - 1;
      if (n >= 0) { e.preventDefault(); select(tabs[n], true); }
    });
  });

  root.querySelectorAll<HTMLButtonElement>('[data-pick]').forEach((b) => {
    b.addEventListener('click', () => {
      const tab = document.getElementById(`tab-${b.dataset.pick}`) as HTMLButtonElement | null;
      if (tab) select(tab, true);
    });
  });

  // "Request a quote for this service" preselects the service in the form
  root.querySelectorAll<HTMLAnchorElement>('[data-ask]').forEach((a) => {
    a.addEventListener('click', () => {
      const sel = document.querySelector<HTMLSelectElement>('[data-service-select]');
      if (sel) sel.value = a.dataset.ask === 'all' ? '' : a.dataset.ask!;
    });
  });

  // subtle 3D tilt of the panel following the pointer
  const panel = root.querySelector<HTMLElement>('[data-tilt]');
  if (panel && !reduced && window.matchMedia('(hover: hover)').matches) {
    let raf = 0;
    root.addEventListener('pointermove', (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = panel.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) / r.width;
        const y = (e.clientY - (r.top + r.height / 2)) / r.height;
        panel.style.setProperty('--ry', `${clamp(x, -1, 1) * 7}deg`);
        panel.style.setProperty('--rx', `${clamp(-y, -1, 1) * 5}deg`);
      });
    });
    root.addEventListener('pointerleave', () => {
      panel.style.setProperty('--ry', '0deg');
      panel.style.setProperty('--rx', '0deg');
    });
  }
}

/* ---------- Process: current flowing along the cable ---------- */
function processSetup() {
  const section = document.querySelector<HTMLElement>('[data-process]');
  if (!section) return () => {};
  const circuit = section.querySelector<HTMLElement>('.circuit')!;
  const live = section.querySelector<SVGPathElement>('[data-live]')!;
  const spark = section.querySelector<HTMLElement>('[data-spark]')!;
  const steps = Array.from(section.querySelectorAll<HTMLElement>('[data-step]'));
  const svg = live.ownerSVGElement!;

  // fraction of the path length at which each node (x = 125, 375, 625, 875) sits
  const len = live.getTotalLength();
  const nodeX = [125, 375, 625, 875];
  const marks = nodeX.map((nx) => {
    let lo = 0, hi = len;
    for (let k = 0; k < 24; k++) { const mid = (lo + hi) / 2; if (live.getPointAtLength(mid).x < nx) lo = mid; else hi = mid; }
    return lo / len;
  });

  return () => {
    const r = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = reduced ? 1 : clamp((vh * 0.75 - r.top) / (r.height * 0.75));
    circuit.style.setProperty('--p', p.toFixed(4));
    live.style.strokeDashoffset = String(1 - p);
    const pt = live.getPointAtLength(p * len);
    const box = svg.getBoundingClientRect();
    const cbox = circuit.getBoundingClientRect();
    spark.style.transform = `translate(${box.left - cbox.left + (pt.x / 1000) * box.width}px, ${box.top - cbox.top + (pt.y / 100) * box.height}px)`;
    spark.style.opacity = p > 0.002 && p < 0.998 ? '1' : '0';
    const vertical = getComputedStyle(svg).display === 'none';
    steps.forEach((s, i) => s.classList.toggle('is-live', vertical ? p >= i / steps.length + 0.02 : p >= marks[i]));
  };
}

/* ---------- Flashlight over the installation plan ---------- */
function flashlight() {
  const sections = Array.from(document.querySelectorAll<HTMLElement>('.plan'));
  if (!sections.length || reduced) return;
  const hover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  // per section: current and target glow position in px
  const st = sections.map((el) => {
    const glow = document.createElement('div');
    glow.className = 'plan__glow'; glow.setAttribute('aria-hidden', 'true');
    el.prepend(glow); el.classList.add('has-glow');
    return { el, glow, on: false, x: el.clientWidth * 0.3, y: 300, tx: el.clientWidth * 0.3, ty: 300 };
  });
  // only sections on screen are animated
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) { const s = st.find((x) => x.el === e.target); if (s) s.on = e.isIntersecting; }
    kick();
  });
  st.forEach((s) => io.observe(s.el));
  let raf = 0;
  const loop = () => {
    raf = 0;
    let moving = false;
    for (const s of st) {
      if (!s.on) continue;
      s.x += (s.tx - s.x) * 0.12;
      s.y += (s.ty - s.y) * 0.12;
      if (Math.abs(s.tx - s.x) + Math.abs(s.ty - s.y) > 0.5) moving = true;
      s.glow.style.setProperty('--mx', `${s.x.toFixed(1)}px`);
      s.glow.style.setProperty('--my', `${s.y.toFixed(1)}px`);
    }
    if (moving) raf = requestAnimationFrame(loop);
  };
  function kick() { if (!raf) raf = requestAnimationFrame(loop); }

  if (hover) {
    let px = -1, py = -1;
    const aim = () => {
      if (px < 0) return;
      for (const s of st) {
        const r = s.el.getBoundingClientRect();
        if (py >= r.top && py <= r.bottom) { s.tx = px - r.left; s.ty = py - r.top; }
      }
      kick();
    };
    window.addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; aim(); }, { passive: true });
    window.addEventListener('scroll', aim, { passive: true });
  } else {
    // touch screens: the light follows the middle of the screen as you scroll, drifting side to side
    const aim = () => {
      const mid = window.innerHeight * 0.45;
      for (const s of st) {
        const r = s.el.getBoundingClientRect();
        s.ty = mid - r.top;
        s.tx = r.width * (0.5 + 0.3 * Math.sin((window.scrollY + r.top) / 260));
      }
      kick();
    };
    window.addEventListener('scroll', aim, { passive: true });
    aim();
  }
  kick();
}

/* ---------- Coverage map ---------- */
function coverage() {
  const map = document.querySelector<HTMLElement>('[data-kmap]');
  if (!map) return;
  if (reduced) { map.classList.add('is-on'); return; }
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { map.classList.add('is-on'); io.disconnect(); }
  }, { rootMargin: '0px 0px -30% 0px' });
  io.observe(map);
}

/* ---------- Contact: the lights switch on ---------- */
function contactSwitch() {
  const el = document.querySelector<HTMLElement>('[data-contact]');
  if (!el || reduced) return;
  el.classList.add('is-armed');
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { el.classList.add('is-lit'); io.disconnect(); }
  }, { rootMargin: '0px 0px -35% 0px' });
  io.observe(el);
}

/* ---------- Quote form ----------
   With an access key (src/data/form.ts) requests go straight to Web3Forms.
   Without one, the visitor's email app opens with the request filled in. */
function form() {
  const f = document.querySelector<HTMLFormElement>('[data-form]');
  if (!f) return;
  const d = f.dataset;
  const status = f.querySelector<HTMLElement>('[data-form-status]')!;
  const btn = f.querySelector<HTMLButtonElement>('button[type=submit]')!;
  const name = f.querySelector<HTMLInputElement>('[name=name]')!;
  const phone = f.querySelector<HTMLInputElement>('[name=phone]')!;
  // contact details as shown on the page, used in messages
  const fill = (msg = '') => msg
    .replace('{phone}', document.querySelector('[data-c-phone]')?.textContent?.trim() || '')
    .replace('{email}', d.email || '');
  const say = (msg: string, state: 'ok' | 'error' | 'info') => { status.textContent = fill(msg); status.dataset.state = state; };
  const labelOf = (el: Element) => ((el as HTMLInputElement).type === 'radio'
    ? el.closest('fieldset')?.querySelector('legend')
    : el.closest('label')?.querySelector('span'))?.textContent?.trim() ?? '';
  const digits = (v: string) => v.replace(/\D/g, '').length;

  function check(): boolean {
    for (const el of [name, phone]) el.setCustomValidity('');
    if (!name.value.trim()) name.setCustomValidity(d.required!);
    if (!phone.value.trim()) phone.setCustomValidity(d.required!);
    else if (!/^[+\d\s().\/-]+$/.test(phone.value.trim()) || digits(phone.value) < 6 || digits(phone.value) > 15) phone.setCustomValidity(d.phoneInvalid!);
    return f.checkValidity();
  }
  // clear the error as soon as the visitor fixes the field
  for (const el of [name, phone]) el.addEventListener('input', () => { if (!el.validity.valid) check(); });

  let busy = false;
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!check()) {
      // bring the first wrong field to the middle of the screen (clear of the fixed header) before the browser's hint shows
      const bad = f.querySelector<HTMLElement>(':invalid');
      if (bad) { window.scrollTo({ top: bad.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.35, behavior: 'instant' as ScrollBehavior }); bad.focus({ preventScroll: true }); }
      f.reportValidity();
      return;
    }
    const sel = f.querySelector<HTMLSelectElement>('[data-service-select]')!;
    const service = sel.value ? sel.options[sel.selectedIndex].text : '';
    const fields: [string, string][] = [];
    for (const n of ['name', 'phone', 'location', 'who']) {
      const el = f.querySelector<HTMLInputElement>(`[name=${n}]${n === 'who' ? ':checked' : ''}`);
      if (el && el.value.trim()) fields.push([labelOf(el), el.value.trim()]);
    }
    if (service) fields.push([labelOf(sel), service]);
    const msgEl = f.querySelector<HTMLTextAreaElement>('[name=message]')!;
    const message = msgEl.value.trim();
    const subject = `${d.subject}${service ? ` – ${service}` : ''}`;

    // spam trap: bots tick the hidden box; pretend it worked and send nothing
    if (f.querySelector<HTMLInputElement>('[name=botcheck]')?.checked) { say(d.sent!, 'ok'); f.reset(); return; }

    if (d.endpoint && d.key) {
      busy = true; btn.disabled = true; say(d.sending!, 'info');
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), Number(d.timeout) || 15000);
      try {
        const res = await fetch(d.endpoint, {
          method: 'POST', signal: ctrl.signal,
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: d.key, subject, from_name: 'EV COMPANY – faqja',
            ...Object.fromEntries(fields), ...(message ? { [labelOf(msgEl)]: message } : {}),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success !== true) throw new Error(String(res.status));
        say(d.sent!, 'ok'); f.reset();
      } catch {
        say(d.failed!, 'error');
      } finally { clearTimeout(timer); busy = false; btn.disabled = false; }
      return;
    }

    const body = fields.map(([k, v]) => `${k}: ${v}`).join('\n') + (message ? `\n\n${message}` : '');
    const a = document.createElement('a');
    a.href = `mailto:${d.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    a.hidden = true;
    document.body.append(a); a.click(); a.remove();
    say(d.mailOpened!, 'info');
  });
}

/* ---------- Phones: call / quote bar at the bottom ---------- */
function mobileBar() {
  const bar = document.querySelector<HTMLElement>('[data-mobilebar]');
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const contactEl = document.querySelector<HTMLElement>('[data-contact]');
  if (!bar || !hero) return;
  let contactVisible = false;
  if (contactEl) new IntersectionObserver(([e]) => { contactVisible = e.isIntersecting; update(); }, { rootMargin: '0px 0px -20% 0px' }).observe(contactEl);
  function update() {
    const past = window.scrollY > hero!.offsetHeight * 0.55;
    bar!.classList.toggle('is-on', past && !contactVisible);
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
}
