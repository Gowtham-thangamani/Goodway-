# `/assets/images/sections/` — per-section image folders

One folder per website section. Drop the finished, optimised asset(s) into
the matching subfolder using the naming convention in `/README-ASSETS.md`.

## Layout

```
sections/
├── home/                  Homepage (index.html)
│   ├── 01-hero/           Main hero banner
│   ├── 02-partners-strip/ Partner brand carousel
│   ├── 03-why-goodway/    "Why Goodway" benefit section
│   ├── 04-product-divisions/ 9-card division grid
│   ├── 05-capability-gallery/ 4+1 image gallery
│   ├── 06-testimonials/   Client testimonial slider
│   ├── 07-how-we-deliver/ 6-step process + images
│   ├── 08-principals/     Principal brand feature tiles
│   ├── 09-faq/            FAQ accordion (icons)
│   └── 10-cta/            Closing CTA ribbon
├── about/                 about.html
│   ├── 01-hero/           Editorial hero
│   ├── 02-who-we-are/     Benefit-section imagery
│   ├── 03-mission/        Mission & Promise block
│   └── 04-cta/            CTA ribbon
├── services/              services.html (What We Do)
│   ├── 01-hero/
│   ├── 02-divisions-grid/ 9 division card thumbs
│   └── 03-cta/
├── industries/            industries.html
│   ├── 01-hero/
│   ├── 02-sectors-grid/   8 sector cards
│   └── 03-cta/
├── principals/            principals.html
│   ├── 01-hero/
│   ├── 02-brands-grid/    12-card principal grid
│   ├── 03-gallery/        Principal gallery tiles
│   └── 04-cta/
├── contact/               contact.html
│   ├── 01-hero/
│   ├── 02-office-details/ Credentials & contact cards
│   └── 03-map/            Map embed (future real map tile)
├── request-a-quote/       request-a-quote.html
│   ├── 01-hero/
│   └── 02-form/           Form-panel decorations
├── privacy/               privacy.html
│   └── 01-hero/
├── terms/                 terms.html
│   └── 01-hero/
├── errors/                Error pages
│   ├── 401/               401.html
│   └── 404/               404.html
└── divisions/             divisions/*.html — 9 division pages
    ├── scientific-lab/
    ├── mechanical/
    ├── electrical/
    ├── instrumentation/
    ├── building-material/
    ├── chemicals-power/
    ├── heavy-equipment/
    ├── road-safety/
    └── office-equipment/
        ├── 01-hero/                Division hero (big number + aside card)
        ├── 02-facts/               Facts strip (rarely image-based)
        ├── 03-coverage/            Product coverage cards
        ├── 04-principals-row/      Principals band imagery
        ├── 05-applications/        3 application use-case cards
        ├── 06-ledger/              Spec ledger (rarely image-based)
        └── 07-cross-sell/          Related-division cards
```

## Naming

Every file follows the convention set in `/README-ASSETS.md` § 2 and picks up
the alt string from `/assets/images/alt-text.yml`.

Examples:

- `sections/home/01-hero/hero-home-catalogue-shelf-{480,800,1200,1600,2000}.{avif,webp,jpg}`
- `sections/divisions/building-material/01-hero/hero-building-material-fire-doors.webp`
- `sections/about/02-who-we-are/about-warehouse-abudhabi.webp`

## Cross-cutting folders (live alongside, not inside, `sections/`)

These hold assets used by multiple sections:

- `brands/` — 23 brand marks (SVG)
- `icons/` — 21 category icons + 15 UI icons (SVG)
- `backgrounds/` — 5 textures (WebP)
- `catalogue/` — PDF + page previews
- `social/` — 10 OG cards (JPG)
- `favicon/` — ICO/PNG/SVG family
- `logo/` — master logo variants

## Adding a new image

1. Drop the optimised asset into the correct section subfolder.
2. Add an entry to `/assets/images/alt-text.yml` keyed by the relative path.
3. Add a licensing row to `/assets/images/CREDITS.yml`.
4. Reference in HTML via `<img data-src="sections/home/01-hero/foo.jpg">` —
   the `gwUpgradePicture` helper in `/js/goodway-enhance.js` auto-resolves
   the path prefix and emits a full `<picture>` with AVIF + WebP + JPG.
5. CI (`.github/workflows/image-budget.yml`) enforces size budgets on PR.
