# Statusrapport til Jan Thomas (HTML) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce `RAPPORT-JAN-THOMAS-2026-05-21.html` — a single self-contained HTML status report for Jan Thomas: light platform intro, project status, key findings, focus areas, with absolute links into the deployed app.

**Architecture:** One static HTML file in the repo root, inline `<style>`, no external dependencies. Built section by section. Content is synthesized from existing material — no new factual claims. The file is gitignored (`RAPPORT-*.html`), so there are no per-task commits of the deliverable; the spec and this plan are the tracked artifacts.

**Tech Stack:** Plain HTML5 + inline CSS. Verified by opening in a browser.

**Spec:** `docs/superpowers/specs/2026-05-21-rapport-jan-thomas-design.md`

**Base URL for all links:** `https://food-systems.naturalstateproject.com`

---

## File Structure

- Create `RAPPORT-JAN-THOMAS-2026-05-21.html` — the entire deliverable. Built up across Tasks 1–5; Task 6 verifies it.

No other files are created or modified. The file is not committed (gitignored).

---

## Task 1: HTML skeleton and inline stylesheet

**Files:**
- Create: `RAPPORT-JAN-THOMAS-2026-05-21.html`

- [ ] **Step 1: Create the file with this exact content**

```html
<!doctype html>
<html lang="nb">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Food Systems 2026 — Statusrapport for Jan Thomas (21. mai 2026)</title>
<style>
  :root{
    --emerald-50:#ecfdf5; --emerald-100:#d1fae5; --emerald-200:#a7f3d0;
    --emerald-600:#059669; --emerald-700:#047857; --emerald-800:#065f46;
    --stone-50:#fafaf9; --stone-100:#f5f5f4; --stone-200:#e7e5e4;
    --stone-400:#a8a29e; --stone-500:#78716c; --stone-600:#57534e;
    --stone-700:#44403c; --stone-800:#292524; --stone-900:#1c1917;
    --amber-100:#fef3c7; --amber-700:#b45309;
  }
  *{box-sizing:border-box}
  html,body{margin:0;padding:0}
  body{
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
    color:var(--stone-800); background:var(--stone-100); line-height:1.55;
    -webkit-font-smoothing:antialiased;
  }
  .wrap{max-width:760px; margin:0 auto; padding:32px 20px 64px}
  header.doc{
    background:linear-gradient(135deg,var(--emerald-50),#fff);
    border:1px solid var(--emerald-200); border-radius:14px; padding:24px;
  }
  header.doc h1{margin:0 0 4px; font-size:22px; color:var(--stone-900)}
  header.doc .meta{font-size:13px; color:var(--stone-500); margin-top:8px}
  header.doc .purpose{font-size:14px; color:var(--stone-600); margin-top:10px}
  section{
    background:#fff; border:1px solid var(--stone-200); border-radius:14px;
    padding:22px; margin-top:18px;
  }
  section > h2{
    margin:0 0 12px; font-size:16px; color:var(--emerald-800);
    border-bottom:1px solid var(--stone-200); padding-bottom:8px;
  }
  p{margin:8px 0}
  a{color:var(--emerald-700); text-decoration:none}
  a:hover{text-decoration:underline}
  ul{margin:8px 0; padding-left:20px}
  li{margin:4px 0}
  .finding{
    border:1px solid var(--stone-200); border-radius:10px;
    padding:14px; margin:10px 0; background:var(--stone-50);
  }
  .finding h3{margin:0 0 6px; font-size:14px; color:var(--stone-900)}
  .finding .src{font-size:12px; color:var(--stone-500); margin-top:6px}
  .stat{font-size:13px; color:var(--emerald-700); font-weight:600}
  table{border-collapse:collapse; width:100%; font-size:13px; margin-top:8px}
  th,td{border:1px solid var(--stone-200); padding:6px 9px; text-align:left}
  th{background:var(--stone-100); color:var(--stone-700)}
  footer.doc{
    margin-top:22px; font-size:13px; color:var(--stone-500); text-align:center;
  }
  @media print{
    body{background:#fff}
    section,header.doc{break-inside:avoid; border-color:var(--stone-300)}
  }
</style>
</head>
<body>
<div class="wrap">
<!-- SECTIONS INSERTED BY TASKS 2-5 -->
</div>
</body>
</html>
```

- [ ] **Step 2: Open in a browser to confirm the shell renders**

Run: `open RAPPORT-JAN-THOMAS-2026-05-21.html`
Expected: a blank centered page, no errors. (No commit — file is gitignored.)

---

## Task 2: Header and platform-intro sections

**Files:**
- Modify: `RAPPORT-JAN-THOMAS-2026-05-21.html` — replace the `<!-- SECTIONS INSERTED BY TASKS 2-5 -->` comment with the header and the first two sections; keep the comment at the end for later tasks.

- [ ] **Step 1: Insert the header block** (replaces the comment; re-add the comment after it)

```html
<header class="doc">
  <h1>Food Systems 2026 — Statusrapport</h1>
  <p class="meta">Til: Jan Thomas &nbsp;·&nbsp; Fra: Gabriel &nbsp;·&nbsp; 21. mai 2026</p>
  <p class="purpose">Hvor prosjektet står — plattformen, hva som er bygget, og de
  viktigste faglige funnene. Lenkene går til den levende plattformen.</p>
</header>
<!-- SECTIONS INSERTED BY TASKS 2-5 -->
```

- [ ] **Step 2: Insert section "Kort om plattformen"** (before the comment)

Content requirements:
- 2–3 sentences: the platform `food-systems.naturalstateproject.com` is a
  knowledge base mapping Norwegian and Nordic food systems — corporate
  structures, ownership, supply chains and policy.
- A prominent link to the front page: `https://food-systems.naturalstateproject.com`.
- A `<ul>` of 4 key entry pages, each `target="_blank" rel="noopener"`, one line each:
  - Hvitbok — `/hvitbok` — «leveransedokumentet, delt i kapitler»
  - Kunnskapsgraf — `/graf` — «relasjoner mellom selskaper, personer og roller»
  - Nordisk sammenligning — `/sammenligning` — «land mot land, med kildetransparens»
  - Innsikt — `/innsikt` — «forskning, kartlegging og analyse»

- [ ] **Step 3: Insert section "Prosjektstatus"** (before the comment)

A `<ul>` with these exact status points (synthesized from git history and
`docs/project/status/`):
- Plattformen dekker selskaper, eierskap, forsyningskjede, havbruk,
  produsentregister, nordisk sammenligning, kunnskapsgraf og innsikt.
- Produsentregisteret er skilt ut som egen tabell — 55 000+ jordbruksforetak
  ved siden av 185 sporede selskaper.
- `/sammenligning` har fått transparens-UI: status-prikker per land,
  kilde-popovers og per-land-nedbryting.
- Ny `/hvitbok`-rute: et kapittel-delt leveransedokument med innebygde
  nøkkeltall, sitater og levende grafer.
- Food TG Insight Pack v0.1 — en 2202-ords syntese over Track Briefs,
  dossiers og nordisk dekningsgap — er ferdigstilt.
- Kritisk juridisk funn: det norske EUDR-forskriftsutkastet ekskluderer
  eksplisitt soya fra norsk virkeområde.

- [ ] **Step 4: Open in a browser**

Run: `open RAPPORT-JAN-THOMAS-2026-05-21.html`
Expected: header + two sections render; the 4 entry-page links and the front-page link work.

---

## Task 3: Findings section

**Files:**
- Modify: `RAPPORT-JAN-THOMAS-2026-05-21.html` — insert section "Faglige funn" before the comment.

- [ ] **Step 1: Insert section "Faglige funn"**

A `<section>` with `<h2>Faglige funn</h2>` and five `<div class="finding">`
blocks. Each block: `<h3>` title, one short paragraph, a `.stat` line where a
key figure exists, a `.src` source line, and a link (`target="_blank"
rel="noopener"`) to the relevant app page. Use this exact content:

| # | Tittel | Tekst (kort) | Nøkkeltall | Kilde | Lenke |
|---|---|---|---|---|---|
| 1 | Norsk øko er en tilbuds-flaskehals, ikke et etterspørselsproblem | Norsk melkeråvare avkortet leveranser av økologisk melk store deler av 2025; etterspørselen var ikke problemet. Firfota kjøtt har derimot overskudd — to ulike markeder som trenger ulike virkemidler. | Anvendelsesgrad: melk 80 %, egg 88 %, fjørfekjøtt 100 %; firfota kjøtt 41 % | Landbruksdirektoratet 2026 | `/sammenligning` |
| 2 | Finland har ikke faset ut importert fôr — Valio gjorde det | Det var meierikooperativet Valio som faset ut soya 2018–2019 og erstattet den med europeisk rapsmel. Avskogingsfri konvertering, markedsdrevet — ikke statlig selvforsyningspolitikk. | FI plante-protein-selvforsyning: 15 % | Luke 2021 | `/forsyningskjede` |
| 3 | Norge har eksplisitt unntatt soya fra EUDR | Det norske forskriftsutkastet innlemmer ingen varetyper for soya. Danmark kan til sammenligning fysisk spore bare 6 % av sin soyaimport. EU krever 100 % sporing fra 30.12.2026 — en EU-norsk asymmetri. | DK fysisk sporbar soya: 6 % | IFRO/KU 2025; Landbruksdirektoratet forskriftsutkast 2025 | `/mandat` |
| 4 | Norsk offentlig innkjøps øko-andel finnes ikke som statistikk | Det er ingen aggregert statistikk for økologisk andel i norsk offentlig matinnkjøp — verifisert mot DFØ og Debio. Nordens minst-målte offentlige matinnkjøp. | — | Verifisert mot DFØ og Debio | `/sammenligning` |
| 5 | Sverige er ikke lenger nordisk øko-leder i markedet | Svensk øko-melk er ned 39 % siden 2021, øko-egg på laveste nivå siden 2010, og offentlig sektor falt fra 37 % til 34,2 % (2022→2023). | Øko-melk −39 % siden 2021 | Bransje-/markedsdata 2026 | `/sammenligning` |

Every link href is the base URL plus the path, e.g.
`https://food-systems.naturalstateproject.com/forsyningskjede`.

- [ ] **Step 2: Open in a browser**

Run: `open RAPPORT-JAN-THOMAS-2026-05-21.html`
Expected: five finding cards render; each link opens the right app page.

---

## Task 4: Focus-areas and footer sections

**Files:**
- Modify: `RAPPORT-JAN-THOMAS-2026-05-21.html` — insert section "Fokusområder og videre" and the footer, then remove the trailing comment.

- [ ] **Step 1: Insert section "Fokusområder og videre"**

A `<section>` with `<h2>Fokusområder og videre</h2>`, an intro sentence
(«Fem foreslåtte satsinger for transition group, rangert etter score i
TG-vurderingen.»), then a `<table>` with header row `# | Område | Score |
Første handling` and these exact rows:

| # | Område | Score | Første handling |
|---|---|---|---|
| 1 | Importert fôr og alternative proteiner | 11/12 | Felles EFSA-linje + nordisk soya-sporbarhetsdatabase |
| 2 | Matsvinn — fra måling til kvalitet | 11/12 | Harmonisert nordisk metode før 50 %-målet |
| 3 | Strukturell konkurranseterskel | 11/12 | Finlands 30 %-regel som nordisk standard |
| 4 | Biogass — dansk 20-års FiT | 10/12 | Kopier DK-modellen + NO-DK oppdrettsavfall-pilot |
| 5 | Økologisk — vri narrativet | 10/12 | NO omstillingsstøtte til melk/egg + København-modellen |

After the table, a short "Neste steg" paragraph: the report can be read in
full and chapter by chapter in the platform's white paper — link
«Hvitbok» to `/hvitbok` (`target="_blank" rel="noopener"`) — and the focus
areas can be tracked against the transition-group mandate — link «Mandat»
to `/mandat`.

- [ ] **Step 2: Insert the footer and remove the trailing comment**

Replace the `<!-- SECTIONS INSERTED BY TASKS 2-5 -->` comment with:

```html
<footer class="doc">
  Food Systems 2026 · NCH Transition Group ·
  <a href="https://food-systems.naturalstateproject.com">food-systems.naturalstateproject.com</a><br>
  Kontakt: gabriel@naturalstate.no
</footer>
```

- [ ] **Step 3: Open in a browser**

Run: `open RAPPORT-JAN-THOMAS-2026-05-21.html`
Expected: all six sections plus footer render in order; the focus-area table and footer link display correctly.

---

## Task 5: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Confirm every link is a well-formed absolute URL to a real route**

Run:
```bash
grep -oE 'https://food-systems\.naturalstateproject\.com[a-z/-]*' RAPPORT-JAN-THOMAS-2026-05-21.html | sort -u
```
Expected: only the base URL and these paths — `/hvitbok`, `/graf`,
`/sammenligning`, `/innsikt`, `/forsyningskjede`, `/mandat`. Confirm each
path has a matching directory under `src/app/` (e.g. `ls src/app/hvitbok`).

- [ ] **Step 2: Browser review**

Run: `open RAPPORT-JAN-THOMAS-2026-05-21.html`
Confirm:
- All six sections render in order: header, Kort om plattformen,
  Prosjektstatus, Faglige funn, Fokusområder og videre, footer.
- The five finding cards and the focus-area table are readable.
- The layout is clean at narrow width (resize the window).

- [ ] **Step 3: Print check**

In the browser, open print preview (Cmd-P). Confirm the document is readable
on a white background and sections are not awkwardly clipped.

---

## Self-Review Notes

- **Spec coverage:** file location and gitignore (Task 1) ✓; six-section
  structure — header, platform intro, status, findings, focus areas, footer
  (Tasks 2–4) ✓; content sourced from teaser + status docs, no new claims
  (Tasks 2–4) ✓; absolute links with `target="_blank" rel="noopener"`, paths
  matching real routes (Tasks 2–4, verified Task 5) ✓; emerald/stone palette,
  findings as cards, key figures highlighted, print-friendly (Task 1 CSS) ✓;
  browser + link + print verification (Task 5) ✓.
- **No commits:** the deliverable is gitignored by design; tasks build the
  file in place and verify in the browser.
- **Consistency:** the section order, the CSS class names (`finding`, `stat`,
  `src`, `doc`, `wrap`) and the base URL are used identically across tasks.
