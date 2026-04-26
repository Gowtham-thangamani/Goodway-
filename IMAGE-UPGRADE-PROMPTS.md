# Goodway site — image upgrade prompts

Every image container on the site is now filled with a branded navy/gold
placeholder so the layout looks intentional. When the client is ready to
upgrade a slot to real photography, drop the commissioned file in at the
**same path and filename** and the HTML will pick it up unchanged. Cache-bust
is automatic via `IMG_VER` in `js/goodway-enhance.js`.

---

## ⚠ Outstanding — high priority

These slots are still rendering as the generated SVG-to-PNG fillers
because they slipped through the previous photography batches. They
look like placeholders next to the real-photo tiles around them and
should be replaced first.

| File | Size | Where it appears | Prompt |
|---|---|---|---|
| `assets/images/sections/divisions/instrumentation/card-hero.png` | **480×320** (3:2 — but used at 700×700 in the homepage gallery, so prefer **700×700** square) | (a) Top-left tile of the homepage "Supplying the Sectors that Power the Nation" 2×2 gallery grid, **AND** (b) the slot-A image in the Who-We-Are collage on `/divisions/instrumentation.html` | Eye-level photograph of an industrial meteorological / environmental monitoring station on a rooftop or substation perimeter — cup anemometer, pyranometer, thermistor mast, temperature probe and rain gauge clustered on a stainless steel pole, clean UAE blue-hour sky behind, gold rim-light on the steelwork, no logos, no text, no people. **Square 700×700 crop** with the instruments centred. `--ar 1:1` |

All prompts are written for Midjourney / DALL·E / Imagen. Append
`--ar 16:9` (or equivalent aspect) to match the slot shape; the `width` /
`height` columns below are the intended output pixel size.

---

## House style cues (paste into every prompt as a suffix)

```
Editorial corporate photography, Abu Dhabi industrial context, warm ivory
and navy-blue palette with subtle gold highlights, natural light, shallow
depth of field, no logos, no text on image, clean background, real
equipment (not render), photojournalistic realism, high detail, 4k.
```

---

## Homepage — index.html

| File | Size | Section | Prompt |
|---|---|---|---|
| `assets/images/sections/home/benefit-ops.jpg` | 1600×900 | Why Goodway wide image | Wide editorial shot of a tidy Abu Dhabi industrial warehouse aisle, long rows of labelled pallets with mixed cargo (electric motors, chemical drums, lab boxes), gold-hour light through a skylight, forklift out of focus in background, worker in navy polo inspecting a clipboard. `--ar 16:9` |
| `assets/images/sections/home/gallery-services.jpg` | 700×700 | Gallery · services tile | Tight overhead composition of an industrial logistics desk — open laptop with a shipping manifest on screen, printed bill of lading, walkie-talkie, safety glasses and a neatly-stacked stack of catalogues labelled "Goodway General Trading" (no readable logo). `--ar 1:1` |
| `assets/images/sections/home/industries-tall.jpg` | 700×1000 | Industries tall tile | Portrait collage-feel photograph: silhouette of a UAE offshore oil platform at blue hour on the top half, a power substation with clean white insulators in the middle, and a water-treatment pipe gallery at the bottom — subtle gold rim-light, cinematic. `--ar 3:5` |
| `assets/images/sections/home/our-work-01.jpg` | 700×1000 | Our work · step 1–2 (RFQ intake) | Portrait over-shoulder of an engineer at a clean desk cross-referencing a bill of quantities against an authorised-distributor list on a second monitor, sticky notes, focused expression, ivory wall behind. `--ar 3:5` |
| `assets/images/sections/home/our-work-02.jpg` | 700×700 | Our work · step 3–4 (warehouse QC) | Close-up of gloved hands checking a labelled electrical component against a paper spec sheet inside a clean warehouse, barcode visible but unreadable, depth-of-field blur behind. `--ar 1:1` |
| `assets/images/sections/home/our-work-03.jpg` | 700×700 | Our work · step 5–6 (delivery) | Clean white Goodway-branded box van (plain, no logo) reversing up to an Abu Dhabi industrial-site gate at dusk, two workers in high-vis unloading on a trolley, Arabic/English site signage blurred. `--ar 1:1` |

---

## About page — about.html

| File | Size | Prompt |
|---|---|---|
| `assets/images/sections/about/whoweare-a.jpg` | 900×900 | Environmental portrait of a UAE-national Goodway manager in a navy jacket and kandura mix, standing confidently in front of a tidy warehouse aisle, soft daylight, gold-hour mood. `--ar 1:1` |
| `assets/images/sections/about/whoweare-b.jpg` | 800×640 | Tight top-down still life: an Abu Dhabi DED trade licence document, a UAE Federal Tax Authority VAT certificate, an Abu Dhabi Chamber of Commerce membership card and a black fountain pen, on a linen-coloured desk. No readable text. `--ar 5:4` |

---

## Principals page — principals.html

| File | Size | Prompt |
|---|---|---|
| `assets/images/sections/principals/whoweare-a.jpg` | 900×900 | Flat-lay of twelve blank rectangular product-tag cards arranged in a 4×3 grid on a linen surface, each card has a small gold foil accent, soft directional light — suggestion of a "principal brand library". No readable text. `--ar 1:1` |
| `assets/images/sections/principals/whoweare-b.jpg` | 800×640 | Two pairs of hands meeting for a handshake above a desk with a printed distribution agreement, blurred UAE flag and world-globe in deep background. `--ar 5:4` |

---

## Services page — services.html

| File | Size | Prompt |
|---|---|---|
| `assets/images/sections/services/whoweare-a.jpg` | 900×900 | High-angle hero of a clean industrial distribution warehouse — labelled bays for Scientific, Mechanical, Electrical, Instrumentation, Chemicals, each with a different product family visible, gold hairline accents on signage, no readable logos. `--ar 1:1` |
| `assets/images/sections/services/whoweare-b.jpg` | 800×640 | Wide editorial composite: oil & gas platform silhouette top-left, a power substation mid-right, a water-treatment plant bottom-left and a modern construction site bottom-right — stitched together with clean gold separator lines like a magazine layout. `--ar 5:4` |

---

## Division pages — 9 × 2 = 18 images

All slot-A images are already real client photos (`card-hero.jpg`). The
slot-B (`detail.jpg`) placeholders are the ones to upgrade.

| File | Prompt |
|---|---|
| `assets/images/sections/divisions/electrical/detail.jpg` | Close-up of an industrial low-voltage switchgear panel with bright copper bus bars and labelled breakers, soft blue LED indicators, dust-free environment. `--ar 5:4` |
| `assets/images/sections/divisions/mechanical/detail.jpg` | Macro of a fresh compressor spare part — polished stainless shaft and new ball bearing in original OEM packaging, kraft-paper backdrop. `--ar 5:4` |
| `assets/images/sections/divisions/instrumentation/detail.jpg` | A roof-top environmental monitoring station with cup anemometer, pyranometer and temperature probe, crisp UAE sky, gold-hour light. `--ar 5:4` |
| `assets/images/sections/divisions/scientific-lab/detail.jpg` | Tidy analytical-lab bench with a spectrophotometer, calibrated pipettes and a row of clean reagent bottles, soft daylight, white walls, no readable labels. `--ar 5:4` |
| `assets/images/sections/divisions/heavy-equipment/detail.jpg` | Overhead shot of a parts-warehouse shelf: heavy-equipment filters, gaskets and hoses in branded OEM boxes (logo-free), tidy, gold accent lighting. `--ar 5:4` |
| `assets/images/sections/divisions/building-material/detail.jpg` | A Civil-Defence-compliant fire door being fitted into a frame by a worker in PPE, UAE site context, dust-free hallway, warm light. `--ar 5:4` |
| `assets/images/sections/divisions/chemicals-power/detail.jpg` | An AEES-style industrial rack-mount power supply on a test bench next to a row of sealed chemical drums (plain, unlabelled) — clean, soft studio light. `--ar 5:4` |
| `assets/images/sections/divisions/road-safety/detail.jpg` | Flat-lay of a full-body safety harness, helmet and pair of leather gloves on a linen background with a gold border detail. `--ar 5:4` |
| `assets/images/sections/divisions/office-equipment/detail.jpg` | Modern UAE office desk still-life: a Brother-style multifunction printer, a GBC-style binder, stack of Avery folders and a PaperOne ream — clean, bright, shallow depth of field, logos not readable. `--ar 5:4` |

---

## Team page — team.html

The team cards currently use initial-badges by design; commission real
UAE-appropriate professional headshots (navy backdrop, shoulders-up,
warm daylight) before replacing. Do **not** use AI-generated faces — the
team members are real people and misrepresentation is a compliance risk.

| File to create | Role |
|---|---|
| `assets/images/sections/team/md.jpg`  | Managing Director |
| `assets/images/sections/team/ops.jpg` | Operations Manager |
| `assets/images/sections/team/tech.jpg`| Technical Lead    |

When ready, wire them into `team.html` by replacing the
`<span class="gw-team-card__initials">…</span>` with
`<img src="assets/images/sections/team/md.jpg" alt="…" width="400" height="400">`
inside each `.gw-team-card__photo`.

---

## How to refresh after replacing an image

1. Drop the new file at the exact path in the tables above.
2. Bump `IMG_VER` in `js/goodway-enhance.js` to today's date
   (e.g. `'2026-05-01-photo-drop-1'`).
3. Commit with a descriptive message — no other code changes needed.
