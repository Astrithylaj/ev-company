# Admin panel: how it works and how to set it up

The admin panel is at `/admin/` (for example `https://evcompanyks.com/admin/`). Only the email addresses you list
can open it. They log in with a one-time code sent to their email, so there is no password to forget or leak.

From the panel they can change, without you touching code:

- **Projektet**: add, edit, hide, delete and reorder projects; upload up to 12 photos each (resized on the phone before upload).
- **Kontakti**: phone, email, address, opening hours. Changes everywhere: header buttons, contact section, footer, privacy page.
- **Rrjetet sociale**: WhatsApp, Viber, Facebook, Instagram, TikTok. Empty ones are hidden. WhatsApp also adds a green button to the phone bar.
- **Njoftimi**: a short notice above the main title (e.g. holiday hours), with an optional end date.

Every save keeps the previous version. "Kthe ruajtjen e fundit" goes back one step.
Changes appear on the site within about a minute.

## How it is built

- The site itself is still static (Astro). Cloudflare Pages Functions add a thin layer on top:
  - `functions/_middleware.ts` locks `/admin` and `/api/admin` and puts the live content into every page as it is served.
  - `functions/api/admin/*`: read/save content, undo, photo upload.
  - `functions/media/[[path]].ts`: serves uploaded photos.
- Content is stored in **Cloudflare KV** (one small JSON document). Photos are stored in **Cloudflare R2**.
- If KV is empty or unreachable, the site shows the defaults from `src/data/content.ts`, so the site never breaks.
- Security, two layers:
  1. **Cloudflare Access** asks for the email code before the request reaches the site.
  2. The site checks Cloudflare's signed login token itself (signature, audience, expiry, email on the `ADMIN_EMAILS` list).
     So even if the Access rule is misconfigured or someone opens the `*.pages.dev` address, the panel answers 403.
- Saves are checked again on the server (lengths, valid links, only our own photo paths). Uploads must really be JPG/PNG/WebP, max 8 MB.

Everything here fits in Cloudflare's free plan (Access is free up to 50 users; KV and R2 free limits are far above what this site needs).

## Setup (launch day, about 30–45 minutes)

You need: a free Cloudflare account (yours, or one made with Ermal's company email; the account owner can add the other as a member),
and access to the Namecheap account where the domain is registered (Ermal logs in himself or adds you; never share passwords over chat).

### 1. Move the domain's DNS to Cloudflare (registration stays at Namecheap)

Cloudflare Access protects the custom domain only if Cloudflare manages its DNS.

1. Cloudflare dashboard → **Add a domain** → `evcompanyks.com` → Free plan.
2. Cloudflare scans the existing records. **Check that the MX records (and any TXT records for SPF/DKIM) are there,
   exactly as at Namecheap**, otherwise email stops working. Take a screenshot of the Namecheap DNS page first.
3. Namecheap → Domain List → Manage → Nameservers → **Custom DNS** → enter the two Cloudflare nameservers.
4. Wait until Cloudflare says the domain is active (minutes to a few hours). Send a test email to info@evcompanyks.com.

### 2. Create storage

1. **Storage & Databases → KV → Create**: name `ev-content`. Copy its ID into `wrangler.toml` (replace `REPLACE_WITH_KV_NAMESPACE_ID`).
2. **R2 → Create bucket**: name `ev-company-media` (R2 needs a card on file even on the free plan; nothing is charged at this size).

### 3. Create the Pages project

1. In `astro.config.mjs` set `SITE` to `'https://evcompanyks.com'`.
2. On the PC, in `v2-claude`: `npm install`, then `npx wrangler login`, then `npm run cf:deploy`.
   The first deploy asks to create a project: name it `ev-company`, production branch `main`.
3. **Workers & Pages → ev-company → Settings → Bindings**: check that `EV_CONTENT` (KV) and `EV_MEDIA` (R2) are there
   (they come from `wrangler.toml`; add them by hand if not).
4. **Custom domains → Set up a domain**: `evcompanyks.com` and `www.evcompanyks.com`.

### 4. Lock the admin with Cloudflare Access

1. **Zero Trust** (left menu) → pick a team name, e.g. `evcompany` → Free plan.
   Your team domain is then `evcompany.cloudflareaccess.com`.
2. **Settings → Authentication → Login methods**: "One-time PIN" is on by default. Leave it.
3. **Access → Applications → Add an application → Self-hosted**:
   - Name: `EV admin`. Session duration: 24 hours (or 1 week, if Ermal finds logging in annoying).
   - Destinations: `evcompanyks.com/admin`, `evcompanyks.com/admin/*`, `evcompanyks.com/api/admin/*`,
     and the same three for `www.evcompanyks.com`.
   - Policy: name `Admins`, action **Allow**, include **Emails**: Ermal's email and yours.
   - Save. Open the application again and copy the **Application Audience (AUD) tag**.
4. **Pages project → Settings → Variables and secrets** (Production), add:
   - `ACCESS_TEAM_DOMAIN` = `evcompany.cloudflareaccess.com` (no `https://`)
   - `ACCESS_AUD` = the AUD tag
   - `ADMIN_EMAILS` = the same emails, comma separated
5. Redeploy (`npm run cf:deploy`) so the variables apply.

### 5. Test

- Open `https://evcompanyks.com/admin/` in a private window: you get the Cloudflare login, enter the email, type the code, the panel opens.
- Try an email that is not on the list: no code is accepted.
- Open `https://ev-company.pages.dev/admin/`: it must answer 403.
- In the panel: add a test project with one photo, save, check `/sq/` (wait a minute), then delete it and save.

### 6. Also on launch day (see README launch checklist)

- Form: Web3Forms key for info@evcompanyks.com, pasted as `accessKey` in `src/data/form.ts`.
- Remove the "Parapamje për shqyrtim" badge.
- Legal pages: fill in the company NUI in `src/data/legal.ts` and confirm the details with Ermal.

## Adding or removing an admin

Change both: the policy emails in Zero Trust → Access → Applications → EV admin, and `ADMIN_EMAILS` in the Pages variables
(then redeploy). To kick someone out immediately: Zero Trust → My Team → Users → revoke.

## Working on it locally

`npm run cf:dev` builds the site and runs it with the Functions, KV and R2 simulated on your PC at http://localhost:8788.
`/admin/` opens without login there (the `DEV_ADMIN_BYPASS` switch only works on localhost). Local data lives in `.wrangler/`;
delete that folder to start fresh.

`npm run dev` (Astro only) still works for design work, but the admin panel needs `cf:dev`.

## Backups

- Before big changes, the panel's undo covers one step back.
- For a full copy: `npx wrangler kv key get content --binding EV_CONTENT --remote > content-backup.json`.
- Photos stay in R2. A photo is deleted from R2 only when no saved version (current or previous) uses it any more.
