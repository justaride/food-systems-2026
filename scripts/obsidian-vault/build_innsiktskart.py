# -*- coding: utf-8 -*-
"""Generate the Innsiktskart layer: value chain, actors, insights (evidence chain), loops, gaps, Nordics + Verdikjedekart.canvas."""
import json, os, re

REPO = "/sessions/admiring-pensive-planck/mnt/Food Systems 2026"
VAULT = os.path.join(REPO, "Food Systems Obsidian")
BASE = "10 Innsiktskart"

COLORS = {"ledd": "#15803D", "aktor": "#1D4ED8", "eier": "#3B82F6", "regulator": "#B45309",
          "innsikt": "#DB2777", "loop": "#0891B2", "gap": "#EA580C", "norden": "#7C3AED"}

def write(path, content):
    full = os.path.join(VAULT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content)

def note(path, title, tags, header_line, body_lines, related=None, extra_front=None):
    lines = ["---", "tags:"]
    lines += [f"  - {t}" for t in tags]
    if extra_front:
        lines += extra_front
    lines += ["---", "", f"# {title}", "", f"> {header_line}", ""]
    lines += body_lines
    if related:
        lines += ["", "## Koblinger", ""] + [f"- [[{r}]]" for r in related]
    lines += ["", "## Notater", "", "_Utvikles gjennom prosjektet._", ""]
    write(path, "\n".join(lines))

# ================================================================ 1. VERDIKJEDELEDD
LEDD = [
    ("Ledd 1 – Innsatsfaktorer", "Fôr, gjødsel, såvarer, energi. Startpunktet — og et av de mest importavhengige leddene (soya, mineralgjødsel).",
     ["Felleskjøpet Agri"], ["I17 Fruktavhengigheten – 96 % import", "Verdikjede"]),
    ("Ledd 2 – Primærproduksjon", "Jordbruk, husdyr og havbruk. 42 000 bondemedlemmer i Felleskjøpet, 17 000 i Nortura, 8 600 i TINE — og laksegigantene i havet.",
     ["TINE", "Nortura", "Mowi", "Lerøy Seafood", "SalMar", "Austevoll Seafood"], ["I15 Selvforsyning 44 %", "Produsentregister", "Havbruk"]),
    ("Ledd 3 – Foredling", "Industri og prosessering: meieri, kjøtt, merkevarer. Der råvare blir produkt — og der samvirkene og Orkla dominerer.",
     ["Orkla", "TINE", "Nortura"], ["Verdikjede"]),
    ("Ledd 4 – Distribusjon og grossist", "Grossist- og logistikkleddet. Nordstad-tesen peker hit: den som kontrollerer infrastrukturen, kontrollerer systemet.",
     ["ASKO", "BAMA", "Felleskjøpet Agri"], ["I22 Nordstad-tesen – infrastrukturkontroll", "Forsyningskjede"]),
    ("Ledd 5 – Dagligvare og detaljhandel", "3 849 butikker. Tre paraplykjeder kontrollerer 93,4 % — det mest konsentrerte leddet i kjeden.",
     ["NorgesGruppen", "Coop Norge", "Reitan Retail", "Bunnpris"], ["I01 Triopolet – 93,4 % av butikkene", "Kart"]),
    ("Ledd 6 – Horeca og storhusholdning", "Restaurant, kantine og offentlig innkjøp — inkl. institusjonelle looper som gratis skolemat i Finland/Sverige.",
     [], []),
    ("Ledd 7 – Forbruker og husholdning", "Sluttleddet: pris ut til forbruker (KPI), matsvinn i husholdningene, forbrukermakt.",
     [], ["I06 Pristransmisjon-paradokset"]),
    ("Ledd 8 – Ressurssløyfe og sidestrømmer", "Avfall, biprodukter og sidestrømmer tilbake i systemet: biogass, fôr, redistribusjon. Der sirkulariteten lukkes — eller lekker.",
     [], ["Sirkularitet", "Gap-oversikten – hull i sirkulariteten"]),
]
STEP2LEDD = {"primary": "Ledd 2 – Primærproduksjon", "seafood": "Ledd 2 – Primærproduksjon",
             "processing": "Ledd 3 – Foredling", "distribution": "Ledd 4 – Distribusjon og grossist",
             "retail": "Ledd 5 – Dagligvare og detaljhandel", "horeca": "Ledd 6 – Horeca og storhusholdning",
             "household": "Ledd 7 – Forbruker og husholdning", "waste": "Ledd 8 – Ressurssløyfe og sidestrømmer"}

for i, (name, desc, aktorer, related) in enumerate(LEDD):
    body = [desc, ""]
    if aktorer:
        body += ["## Aktører på dette leddet", ""] + [f"- [[{a}]]" for a in aktorer] + [""]
    body += ["_Innsikter og looper som treffer leddet dukker opp som innlenker (backlinks) og i grafen._"]
    note(f"{BASE}/Ledd/{name}.md", name, ["verdikjedeledd"],
         f"Verdikjedeledd {i+1} av 8 · Del av [[Innsiktskartet]] · Neste: {('[[' + LEDD[i+1][0] + ']]') if i < 7 else 'sløyfen lukkes tilbake til [[Ledd 1 – Innsatsfaktorer]]'}",
         body, related)

# ================================================================ 2. AKTØRER
kc = json.load(open(os.path.join(REPO, "data/konsern-coverage.json")))
KONSERN = {
    "norgesgruppen": ("NorgesGruppen", ["Ledd 5 – Dagligvare og detaljhandel", "Ledd 4 – Distribusjon og grossist"],
                      "Norges største dagligvareaktør — 48,4 % markedsandel. Kontrollerer også grossistleddet gjennom [[ASKO]] og har 46 % i [[BAMA]]: vertikal integrasjon fra grossist til butikkhylle.",
                      "Joh. Johannson-familien"),
    "asko": ("ASKO", ["Ledd 4 – Distribusjon og grossist"],
             "NorgesGruppens grossist- og logistikkarm. Kjernen i Nordstad-tesen: infrastrukturkontrollen som maktmekanisme.", None),
    "reitan-retail": ("Reitan Retail", ["Ledd 5 – Dagligvare og detaljhandel"],
                      "REMA 1000 m.m. — 18,0 % markedsandel. 100 % familieeid.", "Reitan-familien"),
    "coop": ("Coop Norge", ["Ledd 5 – Dagligvare og detaljhandel", "Ledd 4 – Distribusjon og grossist"],
             "Forbrukersamvirke — 27,1 % markedsandel, eid av samvirkelagene (1,9 mill. medlemmer). Egen grossistvirksomhet.", None),
    "orkla": ("Orkla", ["Ledd 3 – Foredling"],
              "Merkevaregiganten i foredlingsleddet. Største enkelteier: Stein Erik Hagen (Canica), 25,1 %.", "Stein Erik Hagen (Canica)"),
    "tine": ("TINE", ["Ledd 3 – Foredling", "Ledd 2 – Primærproduksjon"],
             "Meierisamvirket — eid av 8 600 melkebønder. Sirkulær aktør: myse til protein (R6).", None),
    "nortura": ("Nortura", ["Ledd 3 – Foredling", "Ledd 2 – Primærproduksjon"],
                "Kjøttsamvirket — eid av 17 000 bønder. Biprodukter til fôr (R7).", None),
    "felleskjopet": ("Felleskjøpet Agri", ["Ledd 1 – Innsatsfaktorer", "Ledd 4 – Distribusjon og grossist"],
                     "Landbrukssamvirket for innsatsfaktorer — eid av 42 000 bondemedlemmer. Fôr, gjødsel, maskiner.", None),
    "bama": ("BAMA", ["Ledd 4 – Distribusjon og grossist", "Ledd 3 – Foredling"],
             "Frukt- og grøntgrossisten. NorgesGruppen eier 46 % — nok et eksempel på kjedenes kontroll over leddene bak butikken.", None),
    "mowi": ("Mowi", ["Ledd 2 – Primærproduksjon", "Ledd 3 – Foredling"],
             "Verdens største lakseoppdretter. Største eier: John Fredriksen (14,4 %).", "John Fredriksen"),
    "leroy": ("Lerøy Seafood", ["Ledd 2 – Primærproduksjon", "Ledd 3 – Foredling"],
              "Sjømatkonsern — kontrollert av Austevoll Seafood (52,7 %), dvs. Møgster-familien.", "Møgster-familien (Laco)"),
    "salmar": ("SalMar", ["Ledd 2 – Primærproduksjon", "Ledd 3 – Foredling"],
               "Lakseoppdretter — kontrollert av Gustav Witzøe (41,3 %).", "Gustav Witzøe"),
    "austevoll": ("Austevoll Seafood", ["Ledd 2 – Primærproduksjon"],
                  "Holdingselskap i sjømat — kontrollert av Laco AS / Møgster-familien (52,7 %). Eier igjen 52,7 % av Lerøy.", "Møgster-familien (Laco)"),
}
entries = {e["slug"]: e for e in kc["entries"]}
for slug, (name, ledd, desc, owner) in KONSERN.items():
    e = entries.get(slug, {})
    co = e.get("controllingOwner") or {}
    m = e.get("metrics", {})
    body = [desc, "", "## Fakta fra databasen", "",
            f"- Juridisk navn: **{e.get('rootName','?')}** (org.nr {e.get('rootOrgNr','?')})",
            f"- Kontrollerende eier: **{co.get('name','?')}** ({co.get('pct','?')} %)",
            f"- Konserntre i databasen: **{m.get('treeSize','?')} selskaper** · kvalitetsscore **{e.get('qualityScore','?')}/10** ({e.get('measuredYear','')})",
            "- Kilde: `data/konsern-coverage.json` / [[Prisma-database]]", "",
            "## Plassering i verdikjeden", ""]
    body += [f"- [[{l}]]" for l in ledd]
    rel = ([f"{owner}"] if owner else []) + ["Eierskap"]
    note(f"{BASE}/Aktører/{name}.md", name, ["aktor/konsern"],
         "Aktør · Del av [[Innsiktskartet]]", body, rel)

note(f"{BASE}/Aktører/Bunnpris.md", "Bunnpris", ["aktor/konsern"],
     "Aktør · Del av [[Innsiktskartet]]",
     ["Fjerdeaktøren i dagligvare — 6,6 % markedsandel. Ikke del av de 13 dypkartlagte konsernene, men nødvendig for helhetsbildet av markedet (100 % − 93,4 %).",
      "", "## Plassering i verdikjeden", "", "- [[Ledd 5 – Dagligvare og detaljhandel]]"],
     ["I01 Triopolet – 93,4 % av butikkene"])

EIERE = [
    ("Joh. Johannson-familien", "Eier 74,4 % av NorgesGruppen — kontrollerer dermed indirekte både ASKO (grossist) og nesten halve dagligvaremarkedet.", ["NorgesGruppen", "ASKO", "BAMA"]),
    ("Reitan-familien", "Odd Reitan og familie eier 100 % av Reitan Retail (REMA 1000).", ["Reitan Retail"]),
    ("Møgster-familien (Laco)", "Kontrollerer Austevoll Seafood (52,7 %) som igjen kontrollerer Lerøy (52,7 %) — kaskadekontroll i sjømat.", ["Austevoll Seafood", "Lerøy Seafood"]),
    ("Gustav Witzøe", "Kontrollerer SalMar med 41,3 %.", ["SalMar"]),
    ("Stein Erik Hagen (Canica)", "Største enkelteier i Orkla med 25,1 %.", ["Orkla"]),
    ("John Fredriksen", "Største eier i Mowi med 14,4 %.", ["Mowi"]),
]
for name, desc, rel in EIERE:
    note(f"{BASE}/Aktører/{name}.md", name, ["aktor/eier"],
         "Eier / maktsentrum · Del av [[Innsiktskartet]]", [desc], rel)

REGULATORER = [
    ("Konkurransetilsynet", "Konkurransemyndigheten. Ila dagligvarekjedene 4,9 mrd kroner i bot for ulovlig prissamarbeid (august 2024).", ["I02 4,9 mrd-boten", "I03 Attraktortilstanden"]),
    ("Dagligvaretilsynet", "Tilsyn for dagligvarebransjen — foreslått nedlagt, et regulatorisk tilbakeslag i norsk kontekst.", ["I21 Dagligvaretilsynet foreslått nedlagt"]),
    ("Riksrevisjonen", "Slo i 2023 fast at Norge er uforberedt på matkrise.", ["I16 Riksrevisjonen 2023 – uforberedt på matkrise"]),
]
for name, desc, rel in REGULATORER:
    note(f"{BASE}/Aktører/{name}.md", name, ["aktor/regulator"],
         "Regulator · Del av [[Innsiktskartet]]", [desc], rel)

# ================================================================ 3. INNSIKTER (bevis-kjede)
# (id-title, del, claim, links)
INNSIKTER = [
    ("I01 Triopolet – 93,4 % av butikkene", 1,
     "Tre paraplykjeder står bak 93,4 % av Norges dagligvarebutikker. Dette er en butikkantallserie, ikke omsetningsandeler. Kontrollert omsetnings-HHI er 3 327 og CR3 er 96,6 % for 2024; seriene skal ikke blandes.",
     ["NorgesGruppen", "Coop Norge", "Reitan Retail", "Bunnpris", "Ledd 5 – Dagligvare og detaljhandel"]),
    ("I02 4,9 mrd-boten", 1,
     "I august 2024 ble kjedene bøtelagt 4,9 milliarder kroner for ulovlig prissamarbeid. Likevel: bøtene alene endrer ikke systemet.",
     ["Konkurransetilsynet", "I01 Triopolet – 93,4 % av butikkene"]),
    ("I03 Attraktortilstanden", 1,
     "Konsentrasjonen er ikke et avvik — den er en attraktortilstand. Systemet trekkes mot konsentrasjon uansett enkelttiltak; derfor virker ikke bøter alene. Dette er nøkkelrammen for hele analysen (systemperspektiv, ikke «grådighet»).",
     ["I02 4,9 mrd-boten", "Systemteori-perspektivene"]),
    ("I04 Markedsstrukturen – 14 kjeder, 5 morselskaper", 1,
     "Bak 14 synlige kjedemerker står bare 5 morselskaper, fordelt på 3 849 butikker. Merkemangfoldet skjuler eierkonsentrasjonen.",
     ["Ledd 5 – Dagligvare og detaljhandel", "Eierskap"]),
    ("I05 Brattere enn naturlig", 1,
     "Butikkfordelingen følger befolkning (Zipf), men konsentrasjonen er «brattere enn naturlig» — Lorenz-kurven viser ulikhet utover det geografi forklarer. (Figur 3–4 i whitepaper.)",
     ["I04 Markedsstrukturen – 14 kjeder, 5 morselskaper"]),
    ("I06 Pristransmisjon-paradokset", 2,
     "Produsentprisene (PPI) steg +42,7 % mens konsumprisene (KPI) steg +32,5 %. Gapet er den visuelle «rødalarmen» (Figur 1): noen absorberer differansen — eller tar den ut andre steder.",
     ["Ledd 7 – Forbruker og husholdning", "Ledd 5 – Dagligvare og detaljhandel", "I05 Brattere enn naturlig"]),
    ("I07 Skjulte gebyrer", 2,
     "Tolkningen av gapet: marginene tas ikke som synlig prisheving mot forbruker, men som skjulte gebyrer bakover i kjeden (hylleplass, joint marketing, rabattkrav).",
     ["I06 Pristransmisjon-paradokset", "Ledd 4 – Distribusjon og grossist"]),
    ("I08 Spread-tidslinjen – fem faser", 2,
     "Prisgapet over tid viser fem faser: likevekt → press → krise → ekspansjon → konvergens (Figur 5). Marginene er dynamiske og følger kriser.",
     ["I07 Skjulte gebyrer"]),
    ("I09 Juli-effekten", 2,
     "Sesongbasert marginekspansjon i juli — femdoblet over ti år. Kjedene hever marginene når oppmerksomheten er lavest (fellesferien).",
     ["I08 Spread-tidslinjen – fem faser", "Ledd 5 – Dagligvare og detaljhandel"]),
    ("I10 Hele Norden er høykonsentrert", 3,
     "Alle fire nordiske dagligvaremarkeder har HHI over 2 500 — høykonsentrert etter internasjonale mål (Figur 6). Norge er ikke unikt, men mest ekstremt.",
     ["Norge", "Sverige", "Danmark", "Finland", "I09 Juli-effekten"]),
    ("I11 Norge har høyest topp-3", 3,
     "Norge har høyeste topp-3-andel i Norden: 93,4 % — og ingen internasjonale konkurrenter av betydning (Figur 7).",
     ["Norge", "I10 Hele Norden er høykonsentrert", "I01 Triopolet – 93,4 % av butikkene"]),
    ("I12 Danmark som moteksempel", 3,
     "Danmark viser at retningen ikke er gitt: synkende konsentrasjon og fem reelle aktører.",
     ["Danmark", "I11 Norge har høyest topp-3"]),
    ("I13 Finland – duopol med sterkest regulering", 3,
     "Finland er konsentrasjonsekstremet (effektivt duopol S-gruppen/Kesko) — men har Nordens sterkeste regulering: lovfestet automatisk dominansvurdering ved 30 % (§ 4a).",
     ["Finland", "I12 Danmark som moteksempel"]),
    ("I14 Sverige mot duopol", 3,
     "Sverige er i bevegelse mot duopol: Coop faller, ICA og Axfood konsoliderer.",
     ["Sverige", "I13 Finland – duopol med sterkest regulering"]),
    ("I15 Selvforsyning 44 %", 4,
     "Norges selvforsyningsgrad er 44 % — i rødt mot Danmarks ~300 % (Figur 8). Fundamentet for beredskapsargumentet.",
     ["Norge", "Danmark", "Ledd 2 – Primærproduksjon", "I14 Sverige mot duopol"]),
    ("I16 Riksrevisjonen 2023 – uforberedt på matkrise", 4,
     "Riksrevisjonen konkluderte i 2023: «Norge er uforberedt på matkrise.» Autoritativ bekreftelse av sårbarheten.",
     ["Riksrevisjonen", "I15 Selvforsyning 44 %"]),
    ("I17 Fruktavhengigheten – 96 % import", 4,
     "96 % av frukt er importert — konkret illustrasjon av importavhengigheten.",
     ["Ledd 1 – Innsatsfaktorer", "I16 Riksrevisjonen 2023 – uforberedt på matkrise"]),
    ("I18 Dobbel sårbarhet", 4,
     "Norge er dobbelt sårbart: importavhengig (44 % selvforsyning) OG triopoldistribuert (93,4 %). Beredskap og konkurranse er samme problem sett fra to vinkler.",
     ["I17 Fruktavhengigheten – 96 % import", "I01 Triopolet – 93,4 % av butikkene", "Ledd 4 – Distribusjon og grossist"]),
    ("I19 EØS-paradokset", 5,
     "Mattrygghet er EØS-harmonisert, men jordbruk er unntatt — norsk matpolitikk lever i et regulatorisk mellomrom (Figur 9).",
     ["I18 Dobbel sårbarhet", "Politikk"]),
    ("I20 Finlands paragraf 4a som modell", 5,
     "Finlands § 4a — automatisk dominansvurdering ved 30 % markedsandel — er den konkrete regulatoriske modellen Norge mangler.",
     ["Finland", "I19 EØS-paradokset"]),
    ("I21 Dagligvaretilsynet foreslått nedlagt", 5,
     "Mens Finland skjerper, foreslås Dagligvaretilsynet nedlagt i Norge — et regulatorisk tilbakeslag.",
     ["Dagligvaretilsynet", "I20 Finlands paragraf 4a som modell"]),
    ("I22 Nordstad-tesen – infrastrukturkontroll", 6,
     "Nordstad-tesen: makten ligger ikke i butikkene, men i kontrollen over infrastrukturen bak dem — grossist, logistikk, distribusjon (ASKO). Den som eier flyten, eier systemet.",
     ["ASKO", "NorgesGruppen", "Ledd 4 – Distribusjon og grossist", "I21 Dagligvaretilsynet foreslått nedlagt"]),
    ("I23 Gaasland-kritikken", 6,
     "Gaasland-kritikken: statlig proteksjonisme (importvern, samvirkeregime) er medvirkende årsak — et høyt prisgulv settes av staten selv.",
     ["I22 Nordstad-tesen – infrastrukturkontroll", "Politikk"]),
    ("I24 Syntesen – prisgulv pluss superprofitt", 6,
     "Begge har rett: staten setter et høyt prisgulv (proteksjonisme) og triopolet legger en superprofittpremie oppå. Systemkritikken må treffe begge lag samtidig.",
     ["I23 Gaasland-kritikken", "I03 Attraktortilstanden"]),
    ("I25 Fem overgangsmekanismer", 7,
     "Fem overgangsmekanismer for NCH (fra T3-analysen) — de konkrete intervensjonspunktene som følger av systemanalysen. Kobles til Ten Step steg 6 (Innsikt + Baseline).",
     ["I24 Syntesen – prisgulv pluss superprofitt", "Metodikk", "Hvitbok"]),
    ("I26 Gaps som krever menneskelig input", 7,
     "Kritiske hull som ikke kan researches frem: TG Charter (North Star), aktørkartlegging med «asks», stakeholder-stemmer, pilotideer, nordisk partnerstatus.",
     ["I25 Fem overgangsmekanismer", "Aktører", "Mandat"]),
]
DELNAVN = {1: "Del 1 – Det norske systemet", 2: "Del 2 – Prisdynamikken", 3: "Del 3 – Nordisk perspektiv",
           4: "Del 4 – Selvforsyning og beredskap", 5: "Del 5 – Regulatorisk landskap",
           6: "Del 6 – Systemdynamikk", 7: "Del 7 – Handling"}
for i, (title, del_, claim, links) in enumerate(INNSIKTER):
    prev_ = f"[[{INNSIKTER[i-1][0]}]]" if i > 0 else "—"
    next_ = f"[[{INNSIKTER[i+1][0]}]]" if i < len(INNSIKTER) - 1 else "—"
    body = [claim, "",
            f"**Bevis-kjeden:** forrige: {prev_} · neste: {next_}", "",
            "## Handler om", ""]
    body += [f"- [[{l}]]" for l in links]
    body += ["", "## Kilde", "",
             "- `research/rammeverk/narrativ-struktur.md` (T1–T5-syntesen)",
             "- ⚠️ _Internt arbeidskart: for ekstern bruk må claimet gjennom siterbarhets-gaten (se [[Kilder]])._"]
    note(f"{BASE}/Innsikter/{title}.md", title, ["innsikt", f"del/{del_}"],
         f"Innsikt {i+1}/26 · {DELNAVN[del_]} · Del av [[Innsiktskartet]]", body,
         extra_front=[f"del: {del_}"])

note(f"{BASE}/Innsikter/Systemteori-perspektivene.md", "Systemteori-perspektivene", ["innsikt", "mekanisme"],
     "Teoretisk ramme · Del av [[Innsiktskartet]]",
     ["Den teoretiske rammen bak attraktor-språket: systemdynamikk, attraktortilstander, feedback-looper og intervensjonspunkter.",
      "", "## Kilde", "", "- `research/rammeverk/systemteori-perspektiver.md`",
      "- `research/rammeverk/grand-unified-theory.md` — den store synteserammen",
      "- `research/rammeverk/sirkulaer-matsystem-rammeverk.md`"],
     ["I03 Attraktortilstanden", "I24 Syntesen – prisgulv pluss superprofitt"])

# ================================================================ 4. NORDEN
NORDEN = {
    "Norge": "Høykonsentrert dagligvare: butikkantall-topp-3 93,4 %, kontrollert omsetnings-HHI 3 327 og CR3 96,6 % for 2024. Nordisk HHI-rangering krever harmonisert markedsavgrensning.",
    "Sverige": "På vei mot duopol: ICA og Axfood konsoliderer, Coop faller. Estimert HHI ~3 300 (hedged).",
    "Danmark": "Moteksemplet: synkende konsentrasjon, fem reelle aktører, selvforsyning ~300 %. Også sirkulær frontløper (biogass: 8 100 GWh/år).",
    "Finland": "Konsentrasjonsekstremet (S-gruppen/Kesko-duopol) men sterkest regulering: § 4a automatisk dominansvurdering ved 30 %. Gratis skolemat som institusjonell loop.",
}
for land, desc in NORDEN.items():
    note(f"{BASE}/Norden/{land}.md", land, ["norden"],
         "Nordisk komparativ node · Del av [[Innsiktskartet]]",
         [desc, "", "_Innsikter og looper for landet vises som innlenker og i grafen._"],
         ["Sammenligning", "I10 Hele Norden er høykonsentrert"])

# ================================================================ 5. LOOPER + GAPS (datagenerert)
cl = json.load(open(os.path.join(REPO, "public/data/food-systems/circularity-loops.json")))
LAND = {"NO": "Norge", "SE": "Sverige", "DK": "Danmark", "FI": "Finland"}
for l in cl["existing_loops"]:
    name = f"Loop – {l['name']}"
    ledd_links = sorted({STEP2LEDD[s] for s in l["value_chain_step"] if s in STEP2LEDD})
    rel = ledd_links + ([LAND[l["country"]]] if l["country"] in LAND else ["Sammenligning"])
    body = [f"**Strøm:** {l['flow']}", "",
            f"- R-nivå: **{l['rLevel']}** · TRL {l['trl']} · Modenhet: **{l['maturity']}**",
            f"- Volum: {l.get('volume','—')}",
            f"- Aktører: {', '.join(l.get('actors', []))}",
            f"- Politikkstøtte: {l.get('policy_support','—')}",
            f"- Tema: `{l['theme']}` · Kilder: {', '.join(l.get('sources', []))}",
            "", "_Datagenerert fra `public/data/food-systems/circularity-loops.json`._"]
    note(f"{BASE}/Looper/{name}.md", name, ["loop", f"r/{l['rLevel'].lower()}", f"tema/{l['theme']}"],
         f"Sirkulær loop ({l['country']}) · Del av [[Innsiktskartet]]", body, rel,
         extra_front=[f"rLevel: {l['rLevel']}", f"maturity: {l['maturity']}", f"country: {l['country']}"])

no_gaps = [g for g in cl["gaps"] if g.get("country") == "NO"]
other_gaps = [g for g in cl["gaps"] if g.get("country") != "NO"]
for g in no_gaps:
    name = f"Gap – {g['name']}"
    body = [f"Uutnyttet sirkulært potensial (hull i systemet).", "",
            f"- Potensial: **{g.get('potential_volume','—')}**",
            f"- Barriere: {g.get('barrier','—')}",
            f"- Policy-spak: {g.get('policy_lever','—')}",
            f"- Sammenlignbar løsning: {g.get('comparable_solution','—')}",
            f"- Tema: `{g.get('theme','')}` · R-nivå: {g.get('rLevel','—')}",
            "", "_Datagenerert fra `circularity-loops.json` (gaps). Løse noder i grafen = hull i sirkulariteten._"]
    note(f"{BASE}/Gaps/{name}.md", name, ["gap", f"tema/{g.get('theme','ukjent')}"],
         "Sirkularitets-gap (NO) · Del av [[Innsiktskartet]]", body,
         ["Ledd 8 – Ressurssløyfe og sidestrømmer", "Norge"])

lines = ["Oversikt over alle sirkularitets-gaps utenfor Norge (de norske har egne noter i `Gaps/`).", ""]
for g in other_gaps:
    lines.append(f"- **{g['name']}** ({g.get('country','?')}) — {g.get('potential_volume','')} · barriere: {g.get('barrier','—')}")
lines += ["", "_Datagenerert fra `circularity-loops.json`._"]
note(f"{BASE}/Gaps/Gap-oversikten – hull i sirkulariteten.md", "Gap-oversikten – hull i sirkulariteten",
     ["gap"], "Samlenote · Del av [[Innsiktskartet]]", lines,
     ["Ledd 8 – Ressurssløyfe og sidestrømmer", "Sirkularitet"])

ac = cl["actor_cases"]
lines = ["Suksess- og fiaskocaser fra sirkulær matøkonomi — mønstrene bak hva som skalerer.", "", "## Suksess", ""]
for c in ac.get("success", []):
    lines.append(f"- **{c['name']}** ({c.get('country','?')}, {c.get('rLevel','')}) — {c.get('concept','')} _Lærdom: {c.get('lesson','')}_")
lines += ["", "## Fiasko", ""]
for c in ac.get("failure", []):
    lines.append(f"- **{c['name']}** ({c.get('country','?')}) — {c.get('concept','')} _Lærdom: {c.get('lesson','')}_")
pat = ac.get("pattern")
if pat:
    lines += ["", "## Mønster", "", str(pat) if isinstance(pat, str) else json.dumps(pat, ensure_ascii=False, indent=0)]
lines += ["", "_Datagenerert fra `circularity-loops.json` (actor_cases)._"]
note(f"{BASE}/Looper/Aktørcaser – suksess og fiasko.md", "Aktørcaser – suksess og fiasko",
     ["loop"], "Casesamling · Del av [[Innsiktskartet]]", lines,
     ["Sirkularitet", "I25 Fem overgangsmekanismer"])

# ================================================================ 6. INNSIKTSKART-HUB
lines = ["Innsiktslaget i kunnskapskartet: ikke *hvor* tingene ligger, men *hva vi vet*. "
         "Verdikjeden er ryggraden; aktører, innsikter, looper og gaps henger på den. "
         "Visuelt kart: [[Verdikjedekart.canvas|Verdikjedekart]] · Arkivkartet: [[HUB – Kunnskapsdatabasen]].", "",
         "> ⚠️ **Internt arbeidskart.** Tall og claims er gjengitt fra research-syntesen "
         "(`narrativ-struktur.md` m.fl.). Ekstern bruk krever claim-lock og siterbarhets-gate — se [[Kilder]].", "",
         "## Verdikjeden (ryggraden)", "",
         " → ".join(f"[[{l[0]}]]" for l in LEDD), "",
         "## Bevis-kjeden (26 innsikter i 7 deler)", ""]
cur = 0
for title, del_, claim, links in INNSIKTER:
    if del_ != cur:
        cur = del_
        lines += [f"**{DELNAVN[del_]}**", ""]
    lines.append(f"- [[{title}]]")
lines += ["", "## Aktører", "",
          "**Konsern:** " + " · ".join(f"[[{v[0]}]]" for v in KONSERN.values()) + " · [[Bunnpris]]", "",
          "**Eiere:** " + " · ".join(f"[[{e[0]}]]" for e in EIERE), "",
          "**Regulatorer:** " + " · ".join(f"[[{r[0]}]]" for r in REGULATORER), "",
          "## Sirkularitet", "",
          f"- **{len(cl['existing_loops'])} looper** i `Looper/` — eksisterende sirkulære strømmer (R1–R9)",
          f"- **{len(no_gaps)} norske gaps** i `Gaps/` + [[Gap-oversikten – hull i sirkulariteten]]",
          "- [[Aktørcaser – suksess og fiasko]]", "",
          "## Norden", "",
          " · ".join(f"[[{l}]]" for l in NORDEN), "",
          "## Slik leses grafen", "",
          "- **Grønn** = verdikjedeledd (ryggraden) · **Blå** = aktører/eiere · **Rosa** = innsikter (bevis-kjeden) · **Cyan** = looper · **Oransje** = gaps · **Lilla** = Norden",
          "- Nodestørrelse følger antall lenker: NorgesGruppen og triopol-innsikten dominerer — grafen *viser* maktkonsentrasjonen.",
          "- Gaps med få lenker ligger løst i utkanten — hullene i sirkulariteten er bokstavelig talt synlige.", ""]
note(f"{BASE}/Innsiktskartet.md", "Innsiktskartet", ["hub"],
     "Innsiktslaget · Søsterkart til [[HUB – Kunnskapsdatabasen]]", lines)

# ================================================================ 7. VERDIKJEDEKART.CANVAS
def nid(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower().replace("æ", "ae").replace("ø", "o").replace("å", "a")).strip("-")

nodes, edges = [], []
COL_W, COL_GAP = 300, 40
LX = {l[0]: i * (COL_W + COL_GAP) for i, (lname, *_ ) in enumerate(LEDD) for l in [LEDD[i]]}
LEDD_Y, LEDD_H = 620, 90

# title
nodes.append({"id": "titlecard", "type": "file", "file": f"{BASE}/Innsiktskartet.md",
              "x": 3 * (COL_W + COL_GAP), "y": 0, "width": 2 * COL_W + COL_GAP, "height": 90, "color": "#DB2777"})

# innsikts-band (top): pick key insights, attach to ledd
CANVAS_INNSIKT = [
    ("I17 Fruktavhengigheten – 96 % import", "Ledd 1 – Innsatsfaktorer"),
    ("I15 Selvforsyning 44 %", "Ledd 2 – Primærproduksjon"),
    ("I16 Riksrevisjonen 2023 – uforberedt på matkrise", "Ledd 2 – Primærproduksjon"),
    ("I24 Syntesen – prisgulv pluss superprofitt", "Ledd 3 – Foredling"),
    ("I22 Nordstad-tesen – infrastrukturkontroll", "Ledd 4 – Distribusjon og grossist"),
    ("I18 Dobbel sårbarhet", "Ledd 4 – Distribusjon og grossist"),
    ("I01 Triopolet – 93,4 % av butikkene", "Ledd 5 – Dagligvare og detaljhandel"),
    ("I03 Attraktortilstanden", "Ledd 5 – Dagligvare og detaljhandel"),
    ("I09 Juli-effekten", "Ledd 5 – Dagligvare og detaljhandel"),
    ("I06 Pristransmisjon-paradokset", "Ledd 7 – Forbruker og husholdning"),
    ("I25 Fem overgangsmekanismer", "Ledd 8 – Ressurssløyfe og sidestrømmer"),
]
by_ledd = {}
for t, l in CANVAS_INNSIKT:
    by_ledd.setdefault(l, []).append(t)
for lname, titles in by_ledd.items():
    x = LX[lname]
    for j, t in enumerate(titles):
        iid = "i-" + nid(t)
        nodes.append({"id": iid, "type": "file", "file": f"{BASE}/Innsikter/{t}.md",
                      "x": x, "y": 150 + j * 110, "width": COL_W, "height": 90, "color": "#DB2777"})
        edges.append({"id": f"e-{iid}", "fromNode": iid, "fromSide": "bottom",
                      "toNode": "ledd-" + nid(lname), "toSide": "top", "color": "#DB2777"})

# ledd-rad (ryggraden)
prev = None
for lname, desc, _, _ in LEDD:
    lid = "ledd-" + nid(lname)
    nodes.append({"id": lid, "type": "file", "file": f"{BASE}/Ledd/{lname}.md",
                  "x": LX[lname], "y": LEDD_Y, "width": COL_W, "height": LEDD_H, "color": "#15803D"})
    if prev:
        edges.append({"id": f"e-chain-{lid}", "fromNode": prev, "fromSide": "right",
                      "toNode": lid, "toSide": "left", "color": "#15803D"})
    prev = lid

# aktør-rader under sine ledd
placed = {}
for slug, (name, ledd, desc, owner) in list(KONSERN.items()) + [("bunnpris", ("Bunnpris", ["Ledd 5 – Dagligvare og detaljhandel"], "", None))]:
    main = ledd[0]
    j = placed.get(main, 0)
    placed[main] = j + 1
    aid = "a-" + nid(name)
    nodes.append({"id": aid, "type": "file", "file": f"{BASE}/Aktører/{name}.md",
                  "x": LX[main], "y": LEDD_Y + LEDD_H + 60 + j * 80, "width": COL_W, "height": 60, "color": "#1D4ED8"})
    edges.append({"id": f"e-{aid}", "fromNode": aid, "fromSide": "top",
                  "toNode": "ledd-" + nid(main), "toSide": "bottom", "color": "#1D4ED8"})
    for sec in ledd[1:]:
        edges.append({"id": f"e-{aid}-{nid(sec)}", "fromNode": aid, "fromSide": "top",
                      "toNode": "ledd-" + nid(sec), "toSide": "bottom", "color": "#93C5FD"})

# loop-band nederst + buer tilbake
FLAGSHIP = ["no-pant", "no-fiskeavfall", "no-tine-myse", "no-matsentralen", "dk-biogas",
            "nordic-gasum", "no-magiske-fabrikken", "fi-se-reko"]
loops_by_id = {l["id"]: l for l in cl["existing_loops"]}
loop_y = LEDD_Y + LEDD_H + 60 + 4 * 80 + 80
for k, lid_ in enumerate(FLAGSHIP):
    l = loops_by_id[lid_]
    name = f"Loop – {l['name']}"
    cid = "loop-" + nid(lid_)
    nodes.append({"id": cid, "type": "file", "file": f"{BASE}/Looper/{name}.md",
                  "x": k * (COL_W + COL_GAP) * 0.98, "y": loop_y, "width": COL_W, "height": 70, "color": "#0891B2"})
    targets = sorted({STEP2LEDD[s] for s in l["value_chain_step"] if s in STEP2LEDD})
    for t in targets[:2]:
        edges.append({"id": f"e-{cid}-{nid(t)}", "fromNode": cid, "fromSide": "top",
                      "toNode": "ledd-" + nid(t), "toSide": "bottom", "color": "#0891B2",
                      "label": l["rLevel"]})
# den store sløyfen: ledd 8 -> ledd 1
edges.append({"id": "e-storslyfe", "fromNode": "ledd-" + nid(LEDD[7][0]), "fromSide": "bottom",
              "toNode": "ledd-" + nid(LEDD[0][0]), "toSide": "bottom", "color": "#0891B2",
              "label": "Ressurssløyfen — der sirkulariteten lukkes"})

write("0 Kart/Verdikjedekart.canvas", json.dumps({"nodes": nodes, "edges": edges}, ensure_ascii=False, indent=1))

# ================================================================ 8. graph colorGroups (tag-based, prepended)
gp = os.path.join(VAULT, ".obsidian", "graph.json")
graph = json.load(open(gp, encoding="utf-8"))
def rgb(h): return {"a": 1, "rgb": int(h.lstrip("#"), 16)}
taggroups = [
    {"query": "tag:#verdikjedeledd", "color": rgb(COLORS["ledd"])},
    {"query": "tag:#innsikt", "color": rgb(COLORS["innsikt"])},
    {"query": "tag:#loop", "color": rgb(COLORS["loop"])},
    {"query": "tag:#gap", "color": rgb(COLORS["gap"])},
    {"query": "tag:#norden", "color": rgb(COLORS["norden"])},
    {"query": "path:\"10 Innsiktskart/Aktører\"", "color": rgb(COLORS["aktor"])},
]
old = [g for g in graph.get("colorGroups", []) if g not in taggroups]
graph["colorGroups"] = taggroups + old
json.dump(graph, open(gp, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# ================================================================ 9. koble inn i hoved-HUB
hub_path = os.path.join(VAULT, "0 Kart", "HUB – Kunnskapsdatabasen.md")
hub = open(hub_path, encoding="utf-8").read()
if "Innsiktskartet" not in hub:
    insert = ("## Innsiktskartet — hva vi vet\n\n"
              "Søsterkartet [[Innsiktskartet]] viser *innsikten*, ikke arkivet: verdikjeden som ryggrad, "
              "aktørene plassert på leddene sine, bevis-kjeden med 26 innsikter, sirkulære looper og gaps. "
              "Visuelt: [[Verdikjedekart.canvas|Verdikjedekart]].\n\n")
    hub = hub.replace("## Slik brukes kartet", insert + "## Slik brukes kartet")
    open(hub_path, "w", encoding="utf-8").write(hub)

n_new = sum(1 for r, d, fs in os.walk(os.path.join(VAULT, BASE)) for f in fs if f.endswith(".md"))
print(f"OK — {n_new} noter i {BASE}, {len(nodes)} canvas-noder, {len(edges)} canvas-kanter, {len(no_gaps)} NO-gaps")
