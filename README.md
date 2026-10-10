# EV COMPANY website (main version)

Bilingual (Albanian / English) presentation site for EV COMPANY sh.p.k. Built with Astro + three.js.
This is the version in use. The Codex prototype in the parent folder is no longer used (see ../START-HERE.md).

## Run it

```sh
cd "v2-claude"
npm install
npm run dev
```

Open the address it prints (usually http://localhost:4321/sq/ and /en/).
`npm run build` makes the static site in `dist/`; `npm run preview` serves that build.

## The idea

The page is a street at night. Black is the default and the logo's orange→yellow appears only as light.

- **Intro** (first visit per browser session, `introSetup()` in `src/scripts/main.ts`): the page opens dark with the
  EV logo in the middle; its bolt flashes, the street lights switch on, and the logo flies into the header.
  Any scroll, tap or key skips it. Never shown with reduced motion. Add `?intro` to the URL to force it while testing.
- **Hero** (`src/scripts/hero3d.ts`): 3D street at night. Weak or data-saving phones get `public/hero-still.jpg` instead.
  The scene lowers its own resolution if a device renders it slowly. The street lights switch on one after another,
  a cherry-picker crew finishes the last one (amber beacon flashing), and scrolling drives the camera down the road.
  Mouse moves the camera slightly. Rendering pauses when the hero is off screen.
  Dev helper: add `?heroT=1.5` to the URL to freeze the animation at 1.5 s.
- **Services** (`src/components/Panel.astro` + `src/scripts/city3d.ts`): opens with "Të gjitha" on: the whole town lit and a
  tappable list of all 7 services. A minimal distribution board (main switch "Të gjitha" + 7 breakers) next to a 3D mini town
  at night. Each service is a breaker; switching one on lights up its part of the town (street lights, buildings,
  solar field, smart home, cabinet + underground network, cherry picker raises its boom, materials yard) and shows
  the description. Works with keyboard (arrow keys). Panel and town tilt with the mouse. The town loads only when
  you scroll near it and renders only while visible. Town modelling adapted from the Codex prototype.
  "Request a quote for this service" preselects it in the form.
- **Installation plan + flashlight**: Process, Company and Coverage sit on a faint electrical installation plan
  (`public/plan.svg`: lamps, switches, sockets, breakers, earth). A warm glow follows the mouse and reveals it;
  on phones it follows the middle of the screen as you scroll. Static with reduced motion.
- **Projects** (data in `src/data/projects.ts`, photos in `public/projects/`): hidden on the live site until the first project is added.
  `npm run dev` shows placeholder cards so the layout can be reviewed. Markup comes from `renderProjects()` in `src/lib/site.ts`.
- **How we work**: current runs along a cable through Supply → Installation → Testing → Maintenance as you scroll.
- **Company**: short text, the client's own statement, and who they work with.
- **Coverage** (`src/components/KosovoMap.astro`): dot map of Kosovo (Natural Earth outline), Prishtina glowing.
  Regenerate the data with `npm run map`.
- **Contact** ("Le ta ndezim."): the section "switches on" to the logo gradient. Big click-to-call number, email, address, hours,
  and a quote form (name, phone required, town, private/business/institution, service, message). Until a form service
  is connected it opens the visitor's email app (and says what to do if none opens). With a Web3Forms key in
  `src/data/form.ts` it sends directly: phone number checked, spam trap, 15 s timeout, clear error with the live phone number.
- **Phones**: a call / quote bar sticks to the bottom of the screen once you scroll past the hero
  (plus a green WhatsApp button; the number is set in `src/lib/site.ts`).
- **Notice**: optional short message above the hero title (e.g. holiday hours), switched on in `defaultContent()` in `src/lib/site.ts`.
- **Legal pages**: `/sq/privatesia/`, `/sq/kushtet/`, `/en/privacy/`, `/en/terms/` (text in `src/data/legal.ts`,
  page in `src/pages/[lang]/[doc].astro`). Linked from the footer and under the form.
  No cookie banner is needed: the site sets no tracking or advertising cookies (see the privacy page).
- **404** (`src/pages/404.astro`): "Kjo faqe nuk ka rrymë." with a breaker that switches on and takes you home.
  `public/apple-touch-icon.png` is the icon when someone saves the site to an iPhone home screen.

`prefers-reduced-motion` is respected: everything is shown lit and still.

## Files

- `src/data/content.ts`: all copy in both languages + contact details. Only facts from the client's answers.
- `src/pages/[lang]/index.astro`: the page. `src/styles/global.css`: all styling. `src/scripts/main.ts`: interactions.
- `public/ev-company-logo.svg`, `ev-company-mark.svg`: logo vectorised from the client's screenshot.
  Replace with the original vector when Ermal sends it.

## Adding projects, photos or other changes

There is no admin panel: the site is fully static. To add projects, put the photos (and a few words per project:
where, when, what was done, for whom) in a folder, attach it in the Claude chat, and ask for them to be added.

By hand: resize photos to about 1600 px wide (JPG or WebP), put them in `public/projects/`, copy the commented example
in `src/data/projects.ts` and fill it in. The section and its menu link appear automatically.
Contact details: `src/data/content.ts`. Social links and the notice: `defaultContent()` in `src/lib/site.ts`.
Push to GitHub (`ev-company` repo) and Cloudflare rebuilds the live site in about a minute.

## Launch checklist

- [ ] Client approves design and both languages; Albanian copy read by a native speaker.
- [ ] Original logo files (SVG/AI/PDF) replace the vectorised ones in `public/`.
- [ ] Real projects and photos (see above), social links, Viber only if confirmed.
- [ ] Legal pages: company NUI filled in `src/data/legal.ts`; Ermal confirms the details (24-month retention, form service).
- [ ] Domain confirmed: set `SITE` in `astro.config.mjs`. This alone switches on canonical and language links,
      the absolute share-image URL, the sitemap, and removes the noindex tag.
- [ ] Form: create a free Web3Forms key for info@evcompanyks.com (web3forms.com) and paste it as `accessKey` in
      `src/data/form.ts`. The button text and note switch to "send directly" by themselves. Send one test request.
- [ ] Hosting: Cloudflare Pages (free). Domain stays registered at Namecheap, DNS moves to Cloudflare (needed to serve the main address without www);
      copy the existing email (MX/TXT) records exactly.
- [ ] After launch: Google Search Console (submit `sitemap-index.xml`), Google Business Profile, Cloudflare Web Analytics.

## Share image and fallback

`public/og.jpg` (1200×630) is what WhatsApp/Facebook show when the link is shared. `public/hero-still.jpg` is the
still used on weak phones. Both are renders of the hero street; re-render them if the hero changes.

## Versions

- `../v2-claude-snapshot-2026-10-06/` is the version before the clean-up of 7 October (plainer headings, static statement, shorter hero scroll, softer glows). See its SNAPSHOT.md to go back.
