import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// LAUNCH: set SITE to the confirmed domain, e.g. 'https://evcompanyks.com'.
// That switches on absolute canonical/language links, the share image URL, the sitemap and indexing (see Base.astro).
const SITE = undefined;

export default defineConfig({
  site: SITE,
  output: 'static',
  devToolbar: { enabled: false },
  server: { host: true },
  integrations: SITE ? [sitemap({ filter: (page) => /\/(sq|en)\/$/.test(page), i18n: { defaultLocale: 'sq', locales: { sq: 'sq', en: 'en' } } })] : [],
});
