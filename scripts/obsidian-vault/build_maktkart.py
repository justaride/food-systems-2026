# -*- coding: utf-8 -*-
"""Generate the Maktkart layer: board interlocks (AP-1), ownership edges, key subsidiaries + Maktkart.canvas."""
import json, os, re

REPO = "/sessions/admiring-pensive-planck/mnt/Food Systems 2026"
VAULT = os.path.join(REPO, "Food Systems Obsidian")
BASE = "11 Maktkart"

def write(path, content):
    full = os.path.join(VAULT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content)

def note(path, title, tags, header_line, body_lines, related=None, extra_front=None):
    lines = ["---", "tags:"] + [f"  - {t}" for t in tags]
    if extra_front: lines += extra_front
    lines += ["---", "", f"# {title}", "", f"> {header_line}", ""] + body_lines
    if related:
        lines += ["", "## Koblinger", ""] + [f"- [[{r}]]" for r in related]
    lines += ["", "## Notater", "", "_Utvikles gjennom prosjektet._", ""]
    write(path, "\n".join(lines))

CAVEAT = ("⚠️ _Bruksregel (fra AP-1): «makt» betyr strukturell posisjon i styregrafen, ikke intensjon, "
          "samordning eller ulovlighet. Personnavn er offentlige rolledata, men aktørspesifikke "
          "formuleringer går gjennom claim-lock/PCQ før ekstern bruk._")

# ---------------------------------------------------------------- data
ap1 = json.load(open(os.path.join(REPO, "research/analyse/ap1-styreoverlapp-active-only.json")))
tot = ap1["totals"]

# orgnr -> name from import-company-data.ts
ts = open(os.path.join(REPO, "scripts/import-company-data.ts"), encoding="utf-8").read()
org2name = {}
for m in re.finditer(r"name:\s*'([^']+)',\s*\n\s*orgNr:\s*'([^']+)'", ts):
    org2name[m.group(2)] = m.group(1)

own_ts = open(os.path.join(REPO, "scripts/import-company-ownership.ts"), encoding="utf-8").read()
own_block = own_ts.split("ownershipRecords: OwnershipRecord[] = [")[1].split("\nconst relationshipRecords")[0]
edges_own = []
for m in re.finditer(r"\{\s*parentOrgNr:\s*'([^']+)',\s*childOrgNr:\s*'([^']+)'(?:,\s*ownershipPct:\s*([\d.]+))?,\s*ownershipType:\s*'([^']+)'(.*?)\}\s*,?\n", own_block, re.S):
    parent, child, pct, otype, rest = m.groups()
    src = re.search(r"source:\s*'([^']+)'", rest)
    tgt = re.search(r"target:\s*'([^']+)'", rest)
    dv = re.search(r"dealValue:\s*'([^']+)'", rest)
    note_m = re.search(r"note:\s*'([^']+)'", rest)
    edges_own.append({"parent": parent, "child": child, "pct": pct, "type": otype,
                      "source": src.group(1) if src else None, "target": tgt.group(1) if tgt else None,
                      "dealValue": dv.group(1) if dv else None, "note": note_m.group(1) if note_m else None})

# canonical name -> existing vault note (Aktører in Innsiktskart)
EXISTING = {
    "NorgesGruppen ASA": "NorgesGruppen", "ASKO Norge AS": "ASKO", "BAMA Gruppen AS": "BAMA",
    "Coop Norge SA": "Coop Norge", "Reitan Retail AS": "Reitan Retail", "Orkla ASA": "Orkla",
    "TINE SA": "TINE", "Nortura SA": "Nortura", "Felleskjøpet Agri SA": "Felleskjøpet Agri",
    "Mowi ASA": "Mowi", "Lerøy Seafood Group ASA": "Lerøy Seafood", "SalMar ASA": "SalMar",
    "Austevoll Seafood ASA": "Austevoll Seafood",
}
def canon(company_name):
    """Map a raw company name to a vault note name (existing or new)."""
    if company_name in EXISTING: return EXISTING[company_name]
    return company_name  # new note carries full legal name

def resolve_org(orgnr):
    name = org2name.get(orgnr)
    return canon(name) if name else None

# ---------------------------------------------------------------- persons
persons = ap1["topInterlockers"]
bridge_names = {b["name"] for b in ap1["topBridges"]}
all_person_companies = set()
for p in persons:
    all_person_companies.update(p["companyNames"])

# companies needing new notes: from interlocker lists + named ownership edges, minus existing
comp_degree = {c["company"]: (c["interlockDegree"], c["sector"]) for c in ap1["topCompaniesByInterlockDegree"]}
new_companies = sorted(c for c in all_person_companies if c not in EXISTING)

for cname in new_companies:
    deg, sec = comp_degree.get(cname, (None, None))
    body = ["Selskap i styregrafen (AP-1). Del av maktnettverket rundt konsernene.", ""]
    facts = []
    if deg is not None:
        facts.append(f"- Interlock-grad i styregrafen: **{deg}** · sektor: `{sec}`")
    facts.append("- Kilde: `research/analyse/ap1-styreoverlapp-active-only.json` / [[Prisma-database]]")
    body += ["## Fakta", ""] + facts
    note(f"{BASE}/Selskaper/{cname}.md", cname, ["aktor/selskap"],
         "Selskap i styregrafen · Del av [[Maktkartet]]", body)

for p in persons:
    name = p["name"]
    comps = [canon(c) for c in p["companyNames"]]
    body = [f"{'**Tverrsektoriell bro**' if name in bridge_names else 'Interlocker'} i styregrafen: "
            f"**{p['seats']} styreverv** i {p['companies']} selskaper, på tvers av sektorene {', '.join('`'+s+'`' for s in p['sectors'])}.",
            "", "## Styreverv", ""]
    body += [f"- [[{c}]]" for c in comps]
    body += ["", f"Roller: {', '.join(p['roles'])}", "", CAVEAT, "",
             "Kilde: `research/analyse/ap1-styreoverlapp-active-only.json` (AP-1, 2026-06-14)"]
    note(f"{BASE}/Personer/{name}.md", name, ["person", "interlocker"] + (["sektorbro"] if name in bridge_names else []),
         f"Styrenettverk · {p['seats']} verv · Del av [[Maktkartet]]", body,
         extra_front=[f"verv: {p['seats']}", f"sektorer: {len(p['sectors'])}"])

# ---------------------------------------------------------------- eierskapsregisteret
lines = ["Alle eierskapskanter fra seed-of-truth (`scripts/import-company-ownership.ts`) — grunnlaget for konserntrærne i databasen.",
         "", "## Kanter", ""]
for e in edges_own:
    pn = resolve_org(e["parent"]) or org2name.get(e["parent"]) or e["parent"]
    cn = resolve_org(e["child"]) or org2name.get(e["child"]) or (e["target"] or e["child"])
    pl = f"[[{pn}]]" if resolve_org(e["parent"]) else f"`{pn}`"
    cl = f"[[{cn}]]" if resolve_org(e["child"]) else f"**{cn}**"
    pct = f" — {e['pct']} %" if e["pct"] else ""
    deal = f" · deal: {e['dealValue']}" if e["dealValue"] else ""
    extra = f" _({e['note']})_" if e["note"] else ""
    lines.append(f"- {pl} → {cl}{pct} ({e['type']}){deal} · kilde: {e['source']}{extra}")
lines += ["", "M&A-bevegelsene 2022–2025 (SalMar/NTS 15,1 mrd, Mowi/Nova Sea 16,0 mrd EV, Orkla/Rhone, Axfood/City Gross) viser at konsentrasjonen fortsatt er i bevegelse — attraktortilstanden i praksis."]
note(f"{BASE}/Eierskapsregisteret.md", "Eierskapsregisteret", ["eierskap"],
     "Seed-of-truth for eierkanter · Del av [[Maktkartet]]", lines,
     ["Eierskap", "I03 Attraktortilstanden", "Prisma-database"])

# ---------------------------------------------------------------- maktkart-hub
sp = ap1["sectorPairBridges"]
lines = ["Maktlaget i innsiktskartet: hvem som faktisk sitter i posisjonene — eierfamilier, konserntrær og styrenettverket. "
         "Bygget på AP-1-analysen (styreoverlapp) og eierskaps-seed-filen. "
         "Visuelt kart: [[Maktkart.canvas|Maktkart]] · Søsterkart: [[Innsiktskartet]] · [[HUB – Kunnskapsdatabasen]].",
         "", CAVEAT, "",
         "## Hovedfunn (AP-1, 2026-06-14)", "",
         "**Styreoverlappet peker ikke på et diffust «alle kjenner alle»-nettverk, men på et smalt bro-mønster rundt retail, logistikk og foredling.** "
         "Systemkoblingen ligger i dagligvare/distribusjon/foredling-grensesnittet — som styrker [[I22 Nordstad-tesen – infrastrukturkontroll]].",
         "",
         f"- {tot['seats']} styreverv · {tot['distinctPersons']} personer · {tot['distinctCompanies']} selskaper med styredata",
         f"- **{tot['interlockers']} interlockere** (verv i ≥2 selskaper) · **{tot['crossSectorBridges']} tverrsektorielle broer**",
         "- Topp sektorpar: " + " · ".join(f"{s['pair']} ({s['count']})" for s in sp),
         f"- ⚠️ Datakvalitet: styredata dekker {tot['distinctCompanies']} av {tot['companyUniverse']} selskaper "
         f"({round(tot['boardCompanyCoverage']*100,1)} %) — sterk pekepinn, ikke komplett nettverkskonklusjon.",
         "",
         "## Toppnodene", "",
         "- **BAMA (interlock-grad 17)** og **ASKO (14)** er de mest sammenkoblede selskapene — grossist/logistikk-leddet, akkurat der Nordstad-tesen sier makten sitter.",
         "- **Runar Hollevik** (10 verv, 4 sektorer, NorgesGruppen-sfæren) og **Ole Robert Reitan** (9 verv) er de største personnodene.",
         "",
         "## Personer (topp 20 interlockere)", ""]
lines += [f"- [[{p['name']}]] — {p['seats']} verv, {len(p['sectors'])} sektorer" + (" · **sektorbro**" if p["name"] in bridge_names else "") for p in persons]
lines += ["", "## Registre", "",
          "- [[Eierskapsregisteret]] — alle eierkanter med kilder og M&A-avtaler",
          f"- {len(new_companies)} selskapsnoter i `Selskaper/` (styregraf-selskaper utenfor konsernrøttene)",
          "", "## Kilder", "",
          "- `research/analyse/ap1-styreoverlapp-active-only.json` + `docs/project/analysis/food-tg-ap1-styreoverlapp-funn-2026-06-14.md`",
          "- `scripts/import-company-ownership.ts` (seed-of-truth) · `data/konsern-coverage.json`"]
note(f"{BASE}/Maktkartet.md", "Maktkartet", ["hub"],
     "Maktlaget · Søsterkart til [[Innsiktskartet]] og [[HUB – Kunnskapsdatabasen]]", lines)

# ---------------------------------------------------------------- canvas
def nid(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower().replace("æ","ae").replace("ø","o").replace("å","a")).strip("-")

nodes, edges = [], []
def add(id_, file, x, y, w, h, color):
    nodes.append({"id": id_, "type": "file", "file": file, "x": x, "y": y, "width": w, "height": h, "color": color})

def path_for(name):
    """Find vault path for a note name."""
    cands = [f"10 Innsiktskart/Aktører/{name}.md", f"{BASE}/Selskaper/{name}.md", f"{BASE}/Personer/{name}.md"]
    for c in cands:
        if os.path.exists(os.path.join(VAULT, c)): return c
    return None

add("hubcard", f"{BASE}/Maktkartet.md", 900, 0, 640, 100, "#DB2777")

FAMILIER = ["Joh. Johannson-familien", "Reitan-familien", "Møgster-familien (Laco)",
            "Gustav Witzøe", "Stein Erik Hagen (Canica)", "John Fredriksen"]
for i, f in enumerate(FAMILIER):
    add("fam-" + nid(f), f"10 Innsiktskart/Aktører/{f}.md", i * 420, 170, 380, 70, "#3B82F6")

KONSERN_ROW = ["NorgesGruppen", "Coop Norge", "Reitan Retail", "Orkla",
               "Austevoll Seafood", "Lerøy Seafood", "SalMar", "Mowi"]
for i, k in enumerate(KONSERN_ROW):
    add("kon-" + nid(k), f"10 Innsiktskart/Aktører/{k}.md", i * 320, 340, 290, 70, "#1D4ED8")

DATTER_ROW = ["ASKO", "BAMA", "Kiwi Norge AS", "MENY AS", "Unil AS",
              "NorgesGruppen Data AS", "REMA 1000 Norge AS", "REMA Distribusjon Norge AS"]
for i, d in enumerate(DATTER_ROW):
    p = path_for(d)
    if p: add("dat-" + nid(d), p, i * 320, 540, 290, 60, "#60A5FA")

PERSON_ROW = [p["name"] for p in persons[:8]]
for i, pn in enumerate(PERSON_ROW):
    add("per-" + nid(pn), f"{BASE}/Personer/{pn}.md", i * 320, 760, 290, 60, "#CA8A04")

onc = {n["id"] for n in nodes}
def edge(f, t, color, label=None, fs="bottom", ts="top"):
    if f in onc and t in onc:
        e = {"id": f"e-{f}-{t}", "fromNode": f, "fromSide": fs, "toNode": t, "toSide": ts, "color": color}
        if label: e["label"] = label
        edges.append(e)

FAM_EDGES = [("Joh. Johannson-familien", "NorgesGruppen", "74,4 %"), ("Reitan-familien", "Reitan Retail", "100 %"),
             ("Møgster-familien (Laco)", "Austevoll Seafood", "52,7 %"), ("Gustav Witzøe", "SalMar", "41,3 %"),
             ("Stein Erik Hagen (Canica)", "Orkla", "25,1 %"), ("John Fredriksen", "Mowi", "14,4 %")]
for f, k, pct in FAM_EDGES:
    edge("fam-" + nid(f), "kon-" + nid(k), "#3B82F6", pct)
edge("kon-" + nid("Austevoll Seafood"), "kon-" + nid("Lerøy Seafood"), "#1D4ED8", "52,7 %", fs="right", ts="left")

KONSERN_DATTER = [("NorgesGruppen", "ASKO", "100 %"), ("NorgesGruppen", "BAMA", "46 %"),
                  ("NorgesGruppen", "Kiwi Norge AS", None), ("NorgesGruppen", "MENY AS", None),
                  ("NorgesGruppen", "Unil AS", None), ("NorgesGruppen", "NorgesGruppen Data AS", None),
                  ("Reitan Retail", "REMA 1000 Norge AS", None), ("Reitan Retail", "REMA Distribusjon Norge AS", None)]
for k, d, pct in KONSERN_DATTER:
    edge("kon-" + nid(k), "dat-" + nid(d), "#1D4ED8", pct)

# person -> selskap (kun kanter til noder på kartet)
for p in persons[:8]:
    pid = "per-" + nid(p["name"])
    for c in p["companyNames"]:
        cn = canon(c)
        for prefix in ("dat-", "kon-"):
            if prefix + nid(cn) in onc:
                edge(pid, prefix + nid(cn), "#CA8A04", fs="top", ts="bottom")
                break

write("0 Kart/Maktkart.canvas", json.dumps({"nodes": nodes, "edges": edges}, ensure_ascii=False, indent=1))

# ---------------------------------------------------------------- graph colors + hub-koblinger
gp = os.path.join(VAULT, ".obsidian", "graph.json")
graph = json.load(open(gp, encoding="utf-8"))
def rgb(h): return {"a": 1, "rgb": int(h.lstrip("#"), 16)}
newg = [{"query": "tag:#person", "color": rgb("#CA8A04")},
        {"query": "path:\"11 Maktkart/Selskaper\"", "color": rgb("#60A5FA")}]
graph["colorGroups"] = newg + [g for g in graph.get("colorGroups", []) if g["query"] not in {x["query"] for x in newg}]
json.dump(graph, open(gp, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

for hubfile, anchor, insert in [
    ("0 Kart/HUB – Kunnskapsdatabasen.md", "## Slik brukes kartet",
     "## Maktkartet — hvem som sitter i posisjonene\n\n[[Maktkartet]] viser eierfamilier → konserntrær → styrenettverket (AP-1: 32 interlockere, 11 sektorbroer). Visuelt: [[Maktkart.canvas|Maktkart]].\n\n"),
    ("10 Innsiktskart/Innsiktskartet.md", "## Slik leses grafen",
     "## Maktlaget\n\n[[Maktkartet]] — styrenettverket og eierkantene bak aktørene: interlockere (gul i grafen), [[Eierskapsregisteret]] og M&A-bevegelsene. Empirisk støtte til [[I22 Nordstad-tesen – infrastrukturkontroll]].\n\n"),
]:
    fp = os.path.join(VAULT, hubfile)
    txt = open(fp, encoding="utf-8").read()
    if "Maktkartet" not in txt:
        txt = txt.replace(anchor, insert + anchor)
        open(fp, "w", encoding="utf-8").write(txt)

n_new = sum(1 for r, d, fs in os.walk(os.path.join(VAULT, BASE)) for f in fs if f.endswith(".md"))
print(f"OK — {n_new} noter i {BASE} ({len(new_companies)} nye selskaper, {len(persons)} personer), "
      f"{len(nodes)} canvas-noder, {len(edges)} canvas-kanter, {len(edges_own)} eierkanter parset")
