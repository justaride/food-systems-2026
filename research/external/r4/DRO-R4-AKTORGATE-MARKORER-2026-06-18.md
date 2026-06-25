---
tittel: DRO-R4 — Type-B-markører for aktørgate (for vedtak)
status: Markører — INGEN aktørkontakt foretatt
eier: Gabriel
dato: 2026-06-18
scope: >
  Identifiserer de type-B-spørsmålene (aktørgate) som dybdekampanjen avdekket men bevisst IKKE rørte.
  Hver markør er et VEDTAKSGRUNNLAG: spørsmål, hvorfor desk/primær ikke kan svare, hvilken aktør/instans
  som kan, og foreslått avsjekk-ID. Kampanjen var desk/primær — ingen av disse er kontaktet. Eskalering
  til faktisk kontakt er ditt vedtak, ikke en handling utført her.
konvensjon: >
  AASK = aktør-avsjekk (krever svar fra en ekstern aktør). DASK = dokument-avsjekk (kan løses av intern
  dokumentgjennomgang). ID-serie -R4- for å holde runde 4 adskilt fra 0906-serien.
relaterte_filer:
  - research/external/r4/DRO-R4-INDEX-2026-06-18.md
  - src/lib/data/casestatus.ts
---

# Type-B-markører for aktørgate

Disse er de aspektene auditen og kampanjen klassifiserte som **type B** — ikke epistemisk umulige (C) og ikke tettbare med mer desk-søk (A), men avhengige av svar fra en navngitt aktør. Kampanjens verdi var å vise hvor mye som kunne løftes *uten* dem; her samles de for vedtak.

| ID | Spørsmål | Hvorfor type B (desk kan ikke svare) | Aktør/instans som kan | Kilde-peker | Vedtak |
|---|---|---|---|---|---|
| **AASK-R4-001** | Valios aggregerte fôrkurv per råvare (tonn rapsmel/soyaerstatning/supplerende protein i melkekufôret) | Offentlig finsk statistikk gir totaler (D4-01), ikke Valios interne miks. Kun aktøren har den. | Valio (evt. via A-Rehu) | DRO-R4-01; casestatus «Valio/Finland» | ☐ Eskalér / ☐ La ligge |
| **AASK-R4-002** | ASKO Serverings faktiske foodservice-/storhusholdningsandel (~70 %?) | Tallet finnes kun på aktørens egen nettside; tilsyn bekrefter dominans kvalitativt, ikke andelen (D4-13). | Konkurransetilsynet (markedsundersøkelse) eller Virke (bransjestatistikk); ev. ASKO | DRO-R4-13; verdikjede.ts l.141 | ☐ Eskalér / ☐ La ligge |
| **AASK-R4-003** | Fôrselskapenes egne svar på Vest-Afrika-sourcing og 2023–24-innkjøp av FMFO | NGO-estimater (Blue Empire) er ytre anslag; faktiske innkjøp er aktørenes egne tall. SSB isolerer Mauritania-opprinnelse (D4-16b), ikke art/sourcing-policy. | Skretting, Mowi, BioMar, Cargill | DRO-R4-16/16b; casestatus «Fôr/import» blockers | ☐ Eskalér / ☐ La ligge |
| **AASK-R4-004** | Uavhengig bekreftelse av Skrettings ~40 % norske fôrmarkedsandel | Aktørrapportert i materialet; ingen tilsynskilde tallfester (analogt ASKO ~70 %, FORST-R4-17). | Konkurransetilsynet / bransjeanalyse (Menon) / aktøren | FORST-R4-17 | ☐ Eskalér / ☐ La ligge |
| **AASK-R4-005** | CEA-aktørenes dokumenterte markedstilgang utover offentlig register (særlig NG/REMA-relasjon) | D4-15 dokumenterte 7 aktører via register/offentlig kilde; den faktiske forhandlings-/avvisningserfaringen mot NG/REMA er ikke offentlig. | CEA-aktørene (Avisomo/Himmelgrønt, Grønt fra Nord m.fl.); NG/REMA innkjøp | DRO-R4-15 (sterkeste tomme celle) | ☐ Eskalér / ☐ La ligge |
| **DASK-R4-001** | SSB-08801 HS 0305 bacalhau-/klippfisk-eksportserie (full re-pull) | Desk-løsbar, ikke aktørgate: SSB-serien finnes (jf. D4-16b-metode), bare ikke høstet ennå for HS 0305. | — (intern desk-oppgave) | FORST-R4-18; r2 SSB-08801 | ☐ Kjør desk / ☐ La ligge |
| **AASK-R6-001** | Bondens faktiske margin per kg produkt etter kjøperprisavtale (kjøttindustri/meieri) | BFJ/Totalkalkylen gir aggregert vederlag og kostnads-pris-skvis (DRO-R6-N11), men marginen per kg etter den konkrete kjøperavtalen er aktørens egne tall — ikke i offentlig statistikk. | Nortura/TINE/Kjøtt- og fjørfebransjen; ev. Norges Bondelag/Småbrukarlaget | DRO-R6-N11 (svakeste celle = B) | ☐ Eskalér / ☐ La ligge |

## Merknad

- **AASK-R4-001..005** og **AASK-R6-001** krever ekstern aktørkontakt og ligger derfor utenfor denne kampanjens mandat (desk/primær). De markeres for ditt vedtak; ingen er kontaktet.
- **DASK-R4-001** er strengt tatt type A (desk-løsbar) og kan kjøres uten aktør — tatt med her fordi den ble identifisert som neste steg i to-motstrøms-syntesen (FORST-R4-18) og naturlig følger D4-16b-metoden.
- Wageningen-guardrail og «forståelse ≠ fakta» gjelder uendret: ingen av disse markørene åpner en claim før svaret faktisk foreligger og er verifisert.
