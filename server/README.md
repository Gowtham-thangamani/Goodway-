# Goodway Admin — Phase 1

Lightweight Node/Express admin panel for managing **principals**, **sectors** and **leads**
on the Goodway static site. No Docker, no build step, no ORM — just Express + SQLite + EJS.

## What it does

1. **Principals** — full CRUD for the 12 brands shown on `/principals.html` (name, country, category, description, chips, division link, sort order, publish toggle).
2. **Sectors** — full CRUD for the 8 industries shown on `/industries.html` (title, tier, lede, products, key principals, icon SVG, publish toggle).
3. **Leads** — receives `POST /api/leads` submissions from the static site's quote form, with filter, search, status workflow (new → in_progress → quoted → won/lost/archived) and CSV export.
4. **Publish** — regenerates `principals.html` + `industries.html` from the database, rewriting **only** the content between the `<!-- GW-PRINCIPALS-START -->` / `<!-- GW-INDUSTRIES-START -->` markers. Hero, footer, scripts and metadata are preserved exactly.
5. **Audit log** — every login, create/update/delete and publish is logged in the `audit_log` table.

## Prerequisites

- Node.js 20 or 22 (tested on 24)
- No external database — SQLite lives in `server/data/goodway.db`

## First-time setup

```bash
cd server
npm install
cp .env.example .env
# generate a password hash
npm run set-password -- "choose a strong password"
# copy the printed ADMIN_PASSWORD_HASH=... line into .env
# also replace SESSION_SECRET with a long random string
npm run seed          # imports existing HTML content into the DB
npm start             # starts on http://localhost:4010
```

Open http://localhost:4010/admin, sign in with `admin` + your password.

## Day-to-day

- **Edit content** — change a principal or sector in admin, click **Save**.
- **Publish** — click **Publish → Publish now**. The regenerator rewrites the live HTML between the markers. Commit and deploy the updated files.
- **Export leads** — Leads page → Export CSV.
- **See what changed** — Dashboard → Activity.

### Wire the live quote form to the admin

By default the site form uses `mailto:` fallback. To post leads into the admin DB instead:

1. Deploy the admin behind a subdomain (e.g. `admin.goodway.ae`).
2. Change the `<form>` action on `request-a-quote.html` and `contact.html` from `mailto:…` to `https://admin.goodway.ae/api/leads` with `enctype="application/x-www-form-urlencoded"`.
3. The endpoint returns `{ ok: true, id }` — hook your success toast to that.

The `POST /api/leads` endpoint validates required fields (name, email, spec), stores IP + user-agent, and is open by design (no CSRF) so the static site can submit without a pre-flight token.

## Directory layout

```
server/
├── server.js           # Express app entry
├── db.js               # SQLite connection + schema
├── middleware/auth.js  # requireLogin, CSRF helpers
├── routes/             # auth, principals, sectors, quotes, publish
├── views/              # EJS templates
├── public/admin.css    # handwritten admin UI styles
├── scripts/
│   ├── seed.js         # parse existing HTML → DB (one-shot)
│   ├── build-pages.js  # DB → regenerate HTML between markers
│   └── set-password.js # generate bcrypt hash
└── data/goodway.db     # SQLite file (gitignored)
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Run the admin server on `PORT` (default 4010). |
| `npm run dev` | Run with `--watch` — restarts on file changes. |
| `npm run seed` | Parse `../principals.html` and `../industries.html` → populate the DB. Destructive: clears existing rows first. |
| `npm run build-site` | Regenerate `../principals.html` + `../industries.html` from the DB between the markers. Same effect as the Publish button. |
| `npm run set-password -- "..."` | Print an `ADMIN_PASSWORD_HASH=` line to paste into `.env`. |

## Security notes for Phase 1

- Session cookie is `httpOnly`, `sameSite=lax`, 8h lifetime. Set `cookie.secure = true` in `server.js` behind HTTPS.
- CSRF tokens on every form (including logout); `POST /api/leads` is deliberately unprotected (public endpoint).
- `ADMIN_PASSWORD_HASH` stored bcrypt (cost 12). One admin user; multi-user + RBAC is Phase 2.
- Rate limiting not included — put Nginx or Cloudflare in front for prod.
- SQLite WAL + `foreign_keys = ON`. Daily backup = `cp data/goodway.db backups/goodway-YYYYMMDD.db`.

## Deploy

Single-process Node on anything (Render, Railway, fly.io, a VPS). Reverse-proxy HTTPS via Nginx:

```
location /admin/    { proxy_pass http://localhost:4010; }
location /api/leads { proxy_pass http://localhost:4010; }
```

The static site can continue to be hosted separately (Netlify, S3, the same Nginx) — the admin only writes to `principals.html` / `industries.html` on publish, which your static host picks up on next deploy.

## Troubleshooting

- **"Markers not found"** on Publish — re-check that `<!-- GW-PRINCIPALS-START -->` / `<!-- GW-PRINCIPALS-END -->` (and `GW-INDUSTRIES-*`) still wrap the content in the two HTML files.
- **Login loops back to /admin/login** — session cookie got blocked. Make sure the domain matches and `secure` is not `true` on plain HTTP.
- **"Database is locked"** — WAL mode is on; only one writer at a time. Fine for single-admin use.

## Phase 2 candidates (not shipped)

- Multi-user accounts + roles (editor / admin) with an actual users table.
- Image uploads via `multer` + auto AVIF/WebP conversion.
- Draft → preview URL → publish workflow (instead of direct HTML rewrite).
- Switch SQLite → Postgres + Prisma for horizontal scaling.
- Webhook on publish so the static host auto-deploys.
