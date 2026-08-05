# -*- coding: utf-8 -*-
"""Generate the Food Systems 2026 Obsidian knowledge map vault."""
import json, os, re

VAULT = "/sessions/admiring-pensive-planck/mnt/Food Systems 2026/Food Systems Obsidian"

# ---------------------------------------------------------------- structure
# (folder, cluster title, hex color, role, sections)
# section = (name, route, description, [repo pointers], [related wikilinks])
CLUSTERS = [
    ("1 Oversikt og navigasjon", "Oversikt og navigasjon", "#0F766E", "Inngang", [
        ("Oversikt", "/", "Fase, fremdrift, neste steg — startsiden for hele plattformen.",
         ["`PROJECT-OVERVIEW.md` — prosjektkontekst, tidslinje og de to søknadene"],
         ["Tidslinje", "Brukerveiledning"]),
        ("Brukerveiledning", "/veiledning", "Slik bruker du plattformen — start her.",
         [], ["Oversikt", "Søk"]),
        ("Søk", "/sok", "Søk på tvers av alt innhold: selskaper, dokumenter, personer, innsikt.",
         [], ["Graf"]),
    ]),
    ("2 Intern", "Intern", "#64748B", "Prosjektstyring", [
        ("Team", "/team", "Medlemmer og roller i Food Systems Transition Group (WP3, Nordic Circular Hotspot).",
         ["`PROJECT-OVERVIEW.md` — Gabriel Freeman & Cathrine Barth, Natural State"], ["Mandat"]),
        ("Casestatus", "/casestatus", "Modenhet per caseanker — hvor langt hvert case er kommet.",
         [], ["Sirkularitet", "Aktører"]),
        ("Møter", "/moter", "Møtesammendrag og referater.",
         ["`docs/meetings/` — møtenotater", "`docs/transcripts/` og `research/landbrukarena_transcripts/` — transkripter"], ["Kommunikasjon"]),
        ("Kommunikasjon", "/kommunikasjon", "E-post og korrespondanse knyttet til prosjektet.",
         ["Eksempler i repo-roten: NCH-søknad og drøftingsdokumenter (PDF)"], ["Møter"]),
        ("Mandat", "/mandat", "Food TG scope, claims og validering — hva prosjektet har lov til å hevde.",
         ["`research/rammeverk/leveranseplan-wp3-food-systems.md` — leveransestrategi WP3",
          "Kontrakt 201-2503-P25013: `research/external/nch-contract/contract-201-2503-P25013.md`",
          "`.claude/source-attribution-policy.md` — kildepolicy (claim-lock, gate)"], ["Team", "Kilder", "Hvitbok"]),
        ("Metodikk", "/metodikk", "Ten Step, KPI-er og deep research-prompter.",
         ["`DEEP-RESEARCH-PLAN.md`", "`research/RESEARCH-MISSIONS.md` og `research/RESEARCH-EXECUTION-PLAN.md`",
          "`research/rammeverk/deep-research-promptpack-nordic-circular-food-landscape-2026-04-20.md`"], ["Forskningsrunder", "Innsikt"]),
        ("Tidslinje", "/tidslinje", "Faser og søknader: Nordic Innovation 2024 (avslått) → NCH 2025 Transition Groups (innvilget, aug 2025–jul 2026).",
         ["`PROJECT-OVERVIEW.md` — full tidslinje og milepæler M13–M18"], ["Oversikt", "Mandat"]),
    ]),
    ("3 Selskap og eierskap", "Selskap og eierskap", "#1D4ED8", "Makt og struktur", [
        ("Selskaper", "/selskap", "Selskapsdata og regnskap for aktørene i norsk/nordisk matsektor.",
         ["[[Prisma-database]] — kjernen: selskaper, regnskap, relasjoner",
          "`data/import-reconciliation.json` — avstemming av importer"], ["Eierskap", "Økonomi", "Eiendommer"]),
        ("Eierskap", "/eierskap", "Konserndossier og datakvalitet. 13 kartlagte konsern: NorgesGruppen, Austevoll, Lerøy, Reitan Retail, Coop, ASKO, SalMar, Nortura, Orkla, Felleskjøpet, BAMA, TINE, Mowi.",
         ["`data/konsern-coverage.json` — dekningskvalitet per konsern",
          "`public/data/coverage/profiles.json` — dekningsprofiler",
          "`scripts/import-company-ownership.ts` — seed-of-truth for eierskapsrader"], ["Selskaper", "Styremedlemmer"]),
        ("Styremedlemmer", "/styremedlemmer", "Krysstyrer og nettverk — hvem sitter i flere styrer.",
         ["[[Prisma-database]] — styreverv"], ["Personer", "Eierskap"]),
        ("Personer", "/personer", "Nøkkelpersoner og roller på tvers av selskaper.",
         ["[[Prisma-database]] — personer og roller"], ["Styremedlemmer", "Aktører"]),
        ("Eiendommer", "/eiendommer", "Selskapseiendommer og lokaler.",
         ["[[Prisma-database]] — eiendomsdata"], ["Selskaper", "Kart"]),
    ]),
    ("4 Matsystem", "Matsystem", "#15803D", "Verdikjede", [
        ("Verdikjede", "/verdikjede", "Nordisk verdikjedeanalyse — jord til bord.",
         ["`research/VERDIKJEDE-KARTLEGGING-PLAN.md`",
          "`public/data/food-systems/material-flows.json` og `nutrient-flows.json`"], ["Forsyningskjede", "Sirkularitet", "Produsentregister"]),
        ("Forsyningskjede", "/forsyningskjede", "Leverandørrelasjoner, primærleveranser og selvhandel.",
         ["[[Prisma-database]] — BusinessRelationship-rader",
          "`public/data/food-systems/logistics_hubs.geojson`, `ports.geojson`, `processing_plants.geojson`",
          "`public/data/food-systems/handelsakse-norge-brasil.json`, `trade_volumes_2024.json`, `feed-composition-timeseries.json`"], ["Verdikjede", "Selskaper"]),
        ("Havbruk", "/havbruk", "Lokaliteter og søknader fra Fiskeridirektoratet — 1 782 havbrukslokaliteter.",
         ["`public/data/food-systems/aquaculture_sites.geojson`"], ["Forsyningskjede", "Kart"]),
        ("Sirkularitet", "/sirkularitet", "R-stige, 10 spørsmål, looper og caser — det sirkulære rammeverket.",
         ["`public/data/food-systems/r9-matrix.json` og `r9-kpi-catalog.json`",
          "`public/data/food-systems/circularity-loops.json`, `circular-nodes.geojson`"], ["Verdikjede", "Hvitbok", "Casestatus"]),
        ("Økonomi", "/okonomi", "Finansielle trender og sammenligning på tvers av aktørene.",
         ["`public/data/food-systems/financial_insights_2024.json`",
          "`public/data/food-systems/chart-metrics.json` (regenereres med `npm run compute-metrics`)"], ["Selskaper", "Sammenligning"]),
    ]),
    ("5 Produsenter og støtte", "Produsenter og støtte", "#B45309", "Primærledd", [
        ("Produsentregister", "/produsenter", "Jordbruksforetak fra register (rådata).",
         ["`public/data/food-systems/farms.geojson`", "`public/data/food-systems/ssb_landbruk_2024.json`"], ["Subsidier", "Verdikjede"]),
        ("Subsidier", "/subsidier", "Tilskudd per kommune, ordning og mottaker.",
         ["`public/data/food-systems/municipalities.json` — kommunegrunnlag"], ["Produsentregister", "Politikk"]),
    ]),
    ("6 Nordisk", "Nordisk", "#7C3AED", "Komparativt", [
        ("Sammenligning", "/sammenligning", "Nordisk sammenligning på tvers av land.",
         ["`public/data/food-systems/dk/`, `se/`, `fi/`, `is/`, `no/` — landsdatasett",
          "`public/data/food-systems/nordic-mineralgjodsel.json`", "`research/norden/` — nordiske kilder"], ["Politikk", "Økonomi"]),
        ("Politikk", "/politikk", "Nordisk matpolitikk-sammenligning.",
         ["`public/data/food-systems/policy-landscape.json` og `policy-timeseries.json`"], ["Sammenligning", "Subsidier"]),
        ("Kart", "/kart", "Butikker og kommunegrenser — 3 849 butikker, 357 kommuner.",
         ["`public/data/food-systems/stores.json` (OSM/Overpass)",
          "`public/data/food-systems/norway-municipalities.geojson` (Geonorge)"], ["Havbruk", "Eiendommer"]),
        ("Media", "/media", "Medieomtale og narrativer rundt matsystemet.",
         ["`research/bibliotek/media/` — mediearkiv"], ["Innsikt", "Aktører"]),
    ]),
    ("7 Kunnskap", "Kunnskap", "#DB2777", "Analyse og innsikt", [
        ("Innsikt", "/innsikt", "Forskning, kartlegging og analyse — syntesen av kunnskapsbasen.",
         ["[[Forskningsarkiv]] — ~1 229 markdown-dokumenter og ~234 CSV-er",
          "`research/rammeverk/grand-unified-theory.md` og `narrativ-struktur.md`"], ["Forskningsrunder", "Graf", "Hvitbok"]),
        ("Forskningsrunder", "/forskningsrunder", "Food Research Process, bl.a. runden 20. april 2026.",
         ["`research/bibliotek/forskningsrunde-2026-04-20/` og `-r2/`",
          "`research/RESEARCH-MISSIONS.md`"], ["Metodikk", "Innsikt"]),
        ("Akademia", "/masteroppgaver", "Master- og PhD-avhandlinger med relevans for feltet.",
         ["`research/bibliotek/akademia/` og `akademia-dyp-research.md`",
          "`research/bibliotek/MASTER-PHD-BACKLOG-2026.md`"], ["Innsikt", "Bibliotek"]),
        ("Graf", "/graf", "Kunnskapsgraf og koblinger — relasjonene i databasen visualisert.",
         ["[[Prisma-database]] — graf bygges fra relasjonene"], ["Søk", "Innsikt"]),
        ("Aktører", "/aktorer", "Prioritering, asks og relasjoner — stakeholder-kartet.",
         [], ["Personer", "Media", "Casestatus"]),
    ]),
    ("8 Bibliotek", "Bibliotek", "#334155", "Kilder og leveranse", [
        ("Rapporter", "/rapporter", "Offentlige rapporter og bransjeanalyser.",
         ["`research/bibliotek/konsulentrapporter/`, `konkurransetilsynet/`, `dagligvaretilsynet/`",
          "`research/PDF-KATALOG.md` — katalog over PDF-kilder"], ["Kilder", "Bibliotek"]),
        ("Hvitbok", "/hvitbok", "Leveransedokumentet i kapitler — den strategiske roadmapen (M16–M17).",
         ["`content/hvitbok/01-kort-til-jan-thomas.md`", "`content/hvitbok/02-nordisk-sirkularitet.md`",
          "`content/hvitbok/03-fokusomraader.md`"], ["Mandat", "Sirkularitet", "Innsikt"]),
        ("Bibliotek", "/bibliotek", "Fulltekst forskningsdokumenter — 41 tematiske kategorier.",
         ["`research/bibliotek/` — akademia, beredskap, bransje, forbruker, horeca, juridisk, media m.fl.",
          "`research/bibliotek/KILDEREGISTER.md`"], ["Rapporter", "Akademia", "Kilder"]),
        ("Kilder", "/kilder", "Dokumenter og referanser — siterbarhet og kildehelse.",
         ["`research/CITABLE-KNOWLEDGE-BASE-STATUS.md` — operativ status for siterbar kunnskapsbase",
          "`research/URL-HEALTH.md` / `.csv` — kildehelse", "`.claude/source-attribution-policy.md`"], ["Mandat", "Rapporter"]),
    ]),
]

FUNDAMENT = [
    ("Prisma-database", "#0891B2",
     "Kjernedatabasen (Postgres via Prisma): selskaper, eierskap, styreverv, relasjoner, eiendommer.",
     ["**13 kartlagte konsern**: NorgesGruppen, Austevoll, Lerøy, Reitan Retail, Coop, ASKO, SalMar, Nortura, Orkla, Felleskjøpet, BAMA, TINE, Mowi",
      "Kvalitet spores i `data/konsern-coverage.json` og `public/data/coverage/profiles.json`",
      "Skjema: `prisma/` · Importer: `npm run db:import` · Audit: `npm run db:audit`",
      "Merk: bygget er DB-fritt — DB-avledede artefakter committes og refreshes via `npm run compute-metrics:full`"],
     ["Selskaper", "Eierskap", "Styremedlemmer", "Personer", "Eiendommer", "Forsyningskjede", "Graf"]),
    ("Strukturerte datasett", "#0891B2",
     "23+ strukturerte datasett i `public/data/food-systems/` som mater kart og analyser.",
     ["SSB (landbruk, handel, selvforsyning) · årsrapporter/Konkurransetilsynet (finans)",
      "Fiskeridir: 1 782 havbrukslokaliteter · OSM/Overpass: 3 849 butikker · Geonorge: 357 kommuner",
      "Eurostat (økologisk, nordisk kjerneserie) · material-/næringsstrømmer · R9-sirkularitetsmatrise · politikk-tidslinje",
      "Oversikt: `public/data/food-systems/DATA-SOURCES.md`"],
     ["Havbruk", "Kart", "Sirkularitet", "Politikk", "Sammenligning", "Produsentregister", "Økonomi"]),
    ("Forskningsarkiv", "#0891B2",
     "`research/` — ~1 229 markdown-dokumenter og ~234 CSV-er (2 459 filer totalt): analyser, PDF-gjennomganger, kildehåndtering og validering.",
     ["`research/bibliotek/` — 41 tematiske kategorier med fulltekstdokumenter",
      "`research/rammeverk/` — leveranseplan, grand unified theory, narrativ, metaforer",
      "Kildestyring: claim-lock, siterbarhets-gate, URL-helse, evidence-packs",
      "Status: `research/CITABLE-KNOWLEDGE-BASE-STATUS.md` · Katalog: `research/PDF-KATALOG.md`"],
     ["Innsikt", "Bibliotek", "Kilder", "Forskningsrunder", "Akademia", "Media"]),
]

REPOLAG = [
    ("Applikasjon og kode", "Next.js-appen som presenterer kunnskapsbasen — navigasjonen i appen speiler klyngene i dette kartet.",
     ["`src/lib/data/nav.ts` — autoritativ seksjonsstruktur (8 klynger, 35 seksjoner)",
      "`messages/no.json` — seksjonsnavn og beskrivelser",
      "Kommandoer: `npm run dev` · `test` · `lint` · `build` · Deploy: Coolify på Hetzner (aldri Vercel)"]),
    ("Dokumentasjon og styring", "Styringsdokumenter, driftsrutiner og retningslinjer for arbeidet.",
     ["`CLAUDE.md` — arbeidsdisiplin, verifikasjonskrav, guardrails",
      "`PROJECT-OVERVIEW.md` — kontekst, tidslinje, kontrakt",
      "`docs/project/reference/DEPLOYMENT-AND-DATA-OPERATIONS.md` — runbook for deploy/prod-data",
      "`docs/strategy/`, `docs/meetings/`, `docs/miro-kart-kunnskapsgrunnlag-blueprint.md` (grunnlaget for dette kartet)"]),
    ("Leveranser og rapporter", "Genererte leveranser og statusrapporter ut av prosjektet.",
     ["`content/hvitbok/` — hvitbok-kapitlene (hovedleveransen)",
      "Rapporter i repo-roten: `RAPPORT-*.html`, `baerekraft-norsk-matsektor-2026.html`, `datagap-rapport-*.html`",
      "`teaser-jan-thomas-2026-04-30.md`, `food-systems-transfer-review-package-2026-05-26/`"]),
]

BADGES = [
    "**8** tematiske klynger · **35** seksjoner",
    "**13** konsern med full eierskaps-/styredekning",
    "**3 849** butikker · **1 782** havbrukslokaliteter · **357** kommuner",
    "Dagligvarekonsentrasjon: kontrollert omsetnings-HHI **3 327** og CR3 **96,6 %** (Konkurransetilsynet, 2024). Butikkandeler og omsetningsandeler skal ikke blandes.",
    "**~1 229** forskningsdokumenter · **23** strukturerte datasett",
]

def slug(name):
    return name

def write(path, content):
    full = os.path.join(VAULT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content)

def tagify(s):
    return (s.lower().replace(" og ", "-").replace(" ", "-")
             .replace("æ","ae").replace("ø","o").replace("å","a"))

# ---------------------------------------------------------------- section notes
for folder, cname, color, role, sections in CLUSTERS:
    for name, route, desc, repo, related in sections:
        lines = ["---",
                 f"tags:\n  - seksjon\n  - klynge/{tagify(cname)}",
                 f"rute: \"{route}\"",
                 "---", "",
                 f"# {name}", "",
                 f"> Klynge: [[Klynge – {cname}]] · Rute i appen: `{route}`", "",
                 desc, ""]
        if repo:
            lines += ["## Datagrunnlag i repoet", ""]
            lines += [f"- {r}" for r in repo]
            lines += [""]
        if related:
            lines += ["## Relaterte seksjoner", ""]
            lines += [f"- [[{r}]]" for r in related]
            lines += [""]
        lines += ["## Notater", "", "_Utvikles gjennom prosjektet._", ""]
        write(f"{folder}/{name}.md", "\n".join(lines))

# ---------------------------------------------------------------- cluster MOCs
for folder, cname, color, role, sections in CLUSTERS:
    lines = ["---",
             f"tags:\n  - klynge",
             f"farge: \"{color}\"",
             f"rolle: \"{role}\"",
             "---", "",
             f"# Klynge – {cname}", "",
             f"> Del av [[HUB – Kunnskapsdatabasen]] · Rolle: **{role}** · Farge: `{color}`", "",
             "## Seksjoner", ""]
    for name, route, desc, repo, related in sections:
        lines.append(f"- [[{name}]] `{route}` — {desc.split('—')[0].split('.')[0].strip()}")
    lines += ["", "## Notater", "", "_Utvikles gjennom prosjektet._", ""]
    write(f"{folder}/Klynge – {cname}.md", "\n".join(lines))

# ---------------------------------------------------------------- fundament notes
for name, color, desc, points, feeds in FUNDAMENT:
    lines = ["---",
             "tags:\n  - datafundament",
             f"farge: \"{color}\"",
             "---", "",
             f"# {name}", "",
             f"> Datafundament-lag · Del av [[HUB – Kunnskapsdatabasen]]", "",
             desc, "",
             "## Innhold", ""]
    lines += [f"- {p}" for p in points]
    lines += ["", "## Mater disse seksjonene", ""]
    lines += [f"- [[{f}]]" for f in feeds]
    lines += ["", "## Notater", "", "_Utvikles gjennom prosjektet._", ""]
    write(f"9 Datafundament/{name}.md", "\n".join(lines))

for name, desc, points in REPOLAG:
    lines = ["---",
             "tags:\n  - repo-lag",
             "---", "",
             f"# {name}", "",
             f"> Repo-lag · Del av [[HUB – Kunnskapsdatabasen]]", "",
             desc, "",
             "## Innhold", ""]
    lines += [f"- {p}" for p in points]
    lines += ["", "## Notater", "", "_Utvikles gjennom prosjektet._", ""]
    write(f"9 Datafundament/{name}.md", "\n".join(lines))

# ---------------------------------------------------------------- hub note
lines = ["---",
         "tags:\n  - hub",
         "---", "",
         "# HUB – Kunnskapsdatabasen", "",
         "Totaloversikt over kunnskapsbasen i **Food Systems 2026** — Nordic Circular Food Systems (WP3, Nordic Circular Hotspot, kontrakt 201-2503-P25013). "
         "Kartet speiler navigasjonen i appen, slik at kart og plattform alltid stemmer overens. "
         "Visuelt kart: [[Kunnskapskart.canvas|Kunnskapskart]].", "",
         "## Nøkkeltall", ""]
lines += [f"- {b}" for b in BADGES]
lines += ["", "## Klynger", ""]
for folder, cname, color, role, sections in CLUSTERS:
    secs = " · ".join(f"[[{s[0]}]]" for s in sections)
    lines.append(f"### [[Klynge – {cname}]] — {role}")
    lines.append("")
    lines.append(secs)
    lines.append("")
lines += ["## Datafundament — lagene som mater kunnskapen", ""]
for name, color, desc, points, feeds in FUNDAMENT:
    lines.append(f"- [[{name}]] — {desc.split('.')[0]}.")
lines += ["", "## Repo-lag", ""]
for name, desc, points in REPOLAG:
    lines.append(f"- [[{name}]] — {desc}")
lines += ["", "## Slik brukes kartet", "",
          "- **Graf-visning**: åpne Obsidian-grafen — klyngene er fargekodet per mappe.",
          "- **Canvas**: [[Kunnskapskart.canvas|Kunnskapskart]] gir blueprint-layouten (hub → 8 klynger → datafundament).",
          "- **Utvikling**: hver seksjonsnote har en «Notater»-seksjon — bygg ut med funn, lenker og delkart etter hvert som prosjektet skrider frem.",
          "- Kilde-blueprint: `docs/miro-kart-kunnskapsgrunnlag-blueprint.md`.", ""]
write("0 Kart/HUB – Kunnskapsdatabasen.md", "\n".join(lines))

# ---------------------------------------------------------------- canvas
nodes, edges = [], []
def nid(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower().replace("æ","ae").replace("ø","o").replace("å","a")).strip("-")

CARD_W, CARD_H, GAP = 280, 60, 14
FRAME_W = 320
COLS = 4
COL_GAP, ROW_GAP = 60, 80
maxrows = [max(len(s) for _, _, _, _, s in CLUSTERS[:4]), max(len(s) for _, _, _, _, s in CLUSTERS[4:])]
frame_h = [56 + n * (CARD_H + GAP) + 10 for n in maxrows]

hub_w, hub_h = 640, 110
total_w = COLS * FRAME_W + (COLS - 1) * COL_GAP
hub_x = (total_w - hub_w) // 2
nodes.append({"id": "hub", "type": "file", "file": "0 Kart/HUB – Kunnskapsdatabasen.md",
              "x": hub_x, "y": 0, "width": hub_w, "height": hub_h, "color": "#0F766E"})

row_y = [hub_h + 120, hub_h + 120 + frame_h[0] + ROW_GAP]
for i, (folder, cname, color, role, sections) in enumerate(CLUSTERS):
    r, c = divmod(i, COLS)
    fx, fy = c * (FRAME_W + COL_GAP), row_y[r]
    fh = frame_h[r]
    gid = "grp-" + nid(cname)
    nodes.append({"id": gid, "type": "group", "label": f"{cname} — {role}",
                  "x": fx, "y": fy, "width": FRAME_W, "height": fh})
    for j, (name, route, desc, repo, related) in enumerate(sections):
        nodes.append({"id": "sec-" + nid(name), "type": "file",
                      "file": f"{folder}/{name}.md",
                      "x": fx + 20, "y": fy + 50 + j * (CARD_H + GAP),
                      "width": CARD_W, "height": CARD_H, "color": color})
    edges.append({"id": f"e-hub-{gid}", "fromNode": "hub", "fromSide": "bottom",
                  "toNode": gid, "toSide": "top", "color": color})

band_y = row_y[1] + frame_h[1] + 100
band_card_w = (total_w - 2 * 40) // 3
for k, (name, color, desc, points, feeds) in enumerate(FUNDAMENT):
    fid = "fund-" + nid(name)
    nodes.append({"id": fid, "type": "file", "file": f"9 Datafundament/{name}.md",
                  "x": k * (band_card_w + 40), "y": band_y,
                  "width": band_card_w, "height": 100, "color": "#0891B2"})
FEED_MAP = {
    "Prisma-database": ["Selskap og eierskap", "Matsystem", "Kunnskap"],
    "Strukturerte datasett": ["Matsystem", "Nordisk", "Produsenter og støtte"],
    "Forskningsarkiv": ["Kunnskap", "Bibliotek", "Nordisk"],
}
for name, targets in FEED_MAP.items():
    for t in targets:
        edges.append({"id": f"e-{nid(name)}-{nid(t)}", "fromNode": "fund-" + nid(name),
                      "fromSide": "top", "toNode": "grp-" + nid(t), "toSide": "bottom",
                      "color": "#0891B2"})

canvas = {"nodes": nodes, "edges": edges}
write("0 Kart/Kunnskapskart.canvas", json.dumps(canvas, ensure_ascii=False, indent=1))

# ---------------------------------------------------------------- graph color groups
graph_path = os.path.join(VAULT, ".obsidian", "graph.json")
try:
    with open(graph_path, encoding="utf-8") as f:
        graph = json.load(f)
except Exception:
    graph = {}
def hex_to_int(h):
    return int(h.lstrip("#"), 16)
groups = []
for folder, cname, color, role, sections in CLUSTERS:
    groups.append({"query": f'path:"{folder}"', "color": {"a": 1, "rgb": hex_to_int(color)}})
groups.append({"query": 'path:"9 Datafundament"', "color": {"a": 1, "rgb": hex_to_int("#0891B2")}})
groups.append({"query": 'path:"0 Kart"', "color": {"a": 1, "rgb": hex_to_int("#0F766E")}})
graph["colorGroups"] = groups
with open(graph_path, "w", encoding="utf-8") as f:
    json.dump(graph, f, ensure_ascii=False, indent=1)

# ---------------------------------------------------------------- welcome
write("Welcome.md", "\n".join([
    "# Food Systems 2026 — Kunnskapskart", "",
    "Start her: [[HUB – Kunnskapsdatabasen]]", "",
    "Visuelt kart: [[Kunnskapskart.canvas|Kunnskapskart]]", "",
    "Grafen (Ctrl/Cmd+G) er fargekodet per klynge.", ""]))

n_md = sum(1 for r, d, fs in os.walk(VAULT) if ".obsidian" not in r for f in fs if f.endswith(".md"))
print(f"OK — {n_md} markdown-notater, {len(nodes)} canvas-noder, {len(edges)} canvas-kanter")
