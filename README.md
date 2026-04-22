# Goodway — goodway.ae

Static marketing site for **Good Way General Trading** (Abu Dhabi, UAE).
A national establishment with international expertise in the oil, gas,
petrochemical, power and water sectors. Authorised UAE distributor for
12 international principals.

- **Live domain:** https://goodway.ae
- **Stack:** Static HTML + CSS + vanilla JS (Webflow-exported base + custom
  enhancement layer) + Express + SQLite admin panel.
- **Primary pages:** 22 total (homepage, about, services, principals,
  industries, contact, quote, 9 division pages, team, journal, privacy,
  terms, 404 / 401).

---

## Quick start

```bash
# From site/
npm install         # installs sharp + dev tooling
npm run dev         # live-reload dev server at http://localhost:3030
npm run check       # run static checks (HTML / CSS / JS sanity)
```

### Admin panel

```bash
cd server
npm install
cp .env.example .env
npm run set-password -- "choose a password"   # paste hash into .env
npm run seed        # import existing HTML content into SQLite
npm start           # http://localhost:4010/admin
```

See `server/README.md` for full admin documentation.

---

## Directory layout

```
site/
├── index.html, about.html, services.html, principals.html,
│   industries.html, contact.html, request-a-quote.html,
│   team.html, journal.html, privacy.html, terms.html, 401/404.html
├── divisions/           # 9 division pages
├── journal/             # article pages
├── css/
│   ├── goodway-brand.css           # brand palette
│   ├── goodway-enhance.css         # custom enhancement layer (main)
│   ├── green-crescent-consultant.webflow.css  # Webflow template base
│   ├── webflow.css
│   └── normalize.css
├── js/
│   ├── goodway-enhance.js          # custom enhancement layer (main)
│   └── webflow.js
├── images/              # logos, favicon family (24 variants)
├── assets/
│   └── images/
│       ├── principals/  # 12 brand-mark placeholders (swap for official)
│       └── sections/    # structured folders for commissioned photography
├── scripts/             # local tooling (dev-server, check, build-favicons,
│                          build-principal-logos, build-search-index)
├── server/              # admin panel (Express + SQLite + EJS)
├── .github/workflows/   # CI + Lighthouse budget
├── sitemap.xml
├── robots.txt
├── search-index.json
└── site.webmanifest
```

---

## What's deployed

1. **22 HTML pages**, all with canonical tags, OpenGraph + Twitter cards,
   JSON-LD (Organization, LocalBusiness, Breadcrumb, Service, FAQPage,
   Article), favicon chain, skip-link, Google Consent Mode v2 stub.
2. **Design system** — custom CSS layer on top of a Webflow export.
   Fraunces display + Plus Jakarta Sans body, ivory / navy / gold palette,
   flip cards, reveal-on-scroll, count-up, parallax.
3. **12 principal logo placeholders** at `assets/images/principals/*.svg`
   — replace with official brand logos when supplied.
4. **Site search** — press `/` or `Ctrl/⌘-K` anywhere to open.
5. **Framer components** — FAQ on homepage, sticky reading-progress on the
   journal article, loaded via dynamic `import()` with graceful fallback.
6. **Admin panel** — single-user, Express 5 + SQLite, CRUD for principals
   + sectors, lead inbox with CSV export, publish flow that regenerates
   HTML between `<!-- GW-PRINCIPALS-START -->` / `GW-INDUSTRIES-START`
   markers.
7. **Security** — CSP + HSTS headers, 5/min rate-limit on `/api/leads`,
   honeypot fields on every public form, bcrypt-hashed admin password,
   pluggable email notifier (Resend / Postmark / webhook).

---

## CI

Two workflows in `.github/workflows/`:

- **ci.yml** — on every push/PR: JS syntax check, CSS brace balance, HTML
  sanity (canonical + og:image + defer + no placeholder hrefs), EJS
  template parse, admin seed + build round-trip.
- **lighthouse.yml** — on every PR: Lighthouse budget (perf ≥ 85, a11y
  ≥ 90, SEO ≥ 95, CLS ≤ 0.1) across 8 representative pages.

Run CI checks locally with `npm run check`.

---

## Deployment

Static hosting (Netlify, S3, Nginx, Vercel). The site root *is* the
deploy artefact — no build step. Drop `site/` on a static host, point DNS
at it. See `_redirects` + `.htaccess` for server config snippets.

Admin panel deploys as a single Node process behind Nginx (config sketch
in `server/README.md`).

---

## Licence & client information

© Good Way General Trading. All content and brand marks belong to
Goodway General Trading or the respective principals. Code is
proprietary unless stated otherwise.

**Never commit:** client PDFs, API keys, SQLite DB, `.env`. The
`.gitignore` blocks these paths — keep it up to date when adding new
secrets.
