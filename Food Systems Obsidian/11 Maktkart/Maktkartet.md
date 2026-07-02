---
tags: ""
type: hub
status: generert
kilde: scripts/obsidian-vault/sync.ts
siterbarhet: intern
---

# Maktkartet

> Maktlaget · Søsterkart til [[Innsiktskartet]] og [[HUB – Kunnskapsdatabasen]]

Maktkartet er arbeidsflaten for strukturell posisjon: selskaper, eierskap, konserntrær, styreoverlapp og hvilke deler av verdikjeden de berører. Bruk det til å finne mønstre og spørsmål, ikke til å konkludere om intensjon. Visuelt kart: [[Maktkart.canvas|Maktkart]].

⚠️ _Bruksregel (fra AP-1): «makt» betyr strukturell posisjon i styregrafen, ikke intensjon, samordning eller ulovlighet. Personnavn er offentlige rolledata, men aktørspesifikke formuleringer går gjennom claim-lock/PCQ før ekstern bruk._

## Leseregel

Start med fire spørsmål:

- Hvilket konsern eller selskap er dette?
- Hvilke eierskapsbaner peker inn eller ut?
- Hvilke styre-/personkoblinger er bare rolledata, og hvilke er analyseverdige broer?
- Er formuleringen intern beslutningsverdi eller ekstern claim-kandidat?

Se også [[I27 Styreoverlappet peker på smale broer]], [[I31 Krysseie må leses som kontrollbaner]] og [[I37 Maktkartet må leses gjennom fire linser]].

## Hovedfunn (AP-1, 2026-06-14)

**Styreoverlappet peker ikke på et diffust nettverk, men på et smalt bro-mønster rundt retail, logistikk og foredling.** Systemkoblingen ligger i dagligvare/distribusjon/foredling-grensesnittet — som styrker [[I22 Nordstad-tesen – infrastrukturkontroll]] som intern analysetese.

- 555 styreverv · 487 personer · 98 selskaper med styredata
- **32 interlockere** (verv i ≥2 selskaper) · **11 tverrsektorielle broer**
- Topp sektorpar: logistics ↔ retail (7) · processing ↔ retail (6) · logistics ↔ processing (2) · foodservice ↔ logistics (1) · foodservice ↔ processing (1) · foodservice ↔ retail (1)
- ⚠️ Datakvalitet: styredata dekker 98 av 275 selskaper (35.6 %) — sterk pekepinn, ikke komplett nettverkskonklusjon.

## Toppnodene

- **BAMA** og **ASKO** er sentrale selskapsknutepunkter i AP-1-grafen.
- **Runar Hollevik** og **Ole Robert Reitan** er store personnoder i rolledataene.
- Disse punktene er navigasjonsfunn for intern analyse; eksterne formuleringer må gjennom claim-lock.

## Personer (topp 20 interlockere)

- [[Runar Hollevik]] — 10 verv, 4 sektorer · **sektorbro**
- [[Ole Robert Reitan]] — 9 verv, 2 sektorer · **sektorbro**
- [[Kristin Genton]] — 6 verv, 1 sektorer
- [[Magnus Reitan]] — 5 verv, 2 sektorer · **sektorbro**
- [[Truls Fjeldstad]] — 5 verv, 1 sektorer
- [[Tore Bekken]] — 4 verv, 2 sektorer · **sektorbro**
- [[Kristine Stranne]] — 4 verv, 3 sektorer · **sektorbro**
- [[Oyvind Andersen]] — 3 verv, 2 sektorer · **sektorbro**
- [[Mette Lier]] — 3 verv, 1 sektorer
- [[Odd Reitan]] — 3 verv, 1 sektorer
- [[Finn Rune Kristiansen]] — 3 verv, 1 sektorer
- [[Andre Rolf Knüppel]] — 2 verv, 1 sektorer
- [[Carl-Fredrik Bergan]] — 2 verv, 1 sektorer
- [[Sara Elisabet Manne]] — 2 verv, 1 sektorer
- [[Signe Sæter]] — 2 verv, 1 sektorer
- [[Anne-Grete Haugen]] — 2 verv, 1 sektorer
- [[Trond Bentestuen]] — 2 verv, 2 sektorer · **sektorbro**
- [[Tor Roenhovde]] — 2 verv, 1 sektorer
- [[Grete Ovanger]] — 2 verv, 1 sektorer
- [[Dina Thune]] — 2 verv, 2 sektorer · **sektorbro**

- [[Eierskapsregisteret]] — alle eierkanter med kilder og M&A-avtaler
- 30 selskapsnoter i `Selskaper/` (styregraf-selskaper utenfor konsernrøttene)

## Kilder

- [[Kilde – AP-1 styreoverlapp]] — `docs/project/analysis/food-tg-ap1-styreoverlapp-funn-2026-06-14.md`
- [[Kilde – AP-5 krysseie]] — `docs/project/analysis/food-tg-ap5-krysseie-funn-2026-06-14.md`
- [[Kilde – maktkart-syntese]] — `docs/project/analysis/food-tg-maktkart-syntese-2026-06-14.md`
- `research/analyse/ap1-styreoverlapp-active-only.json`
- `scripts/import-company-ownership.ts` (seed-of-truth) · `data/konsern-coverage.json`

- [[Eierskapsregisteret]] — alle eierkanter med kilder og M&A-avtaler
- [[Selskapsregister]] — alle DB-eksporterte selskapsnoder
- [[Personregister]] — interlockere med minst to styreverv

## Dynamiske oversikter

### DB-genererte selskaper

```dataview
TABLE orgnr, status, kilde
FROM "11 Maktkart/Selskaper"
WHERE type = "aktor"
SORT file.name ASC
```

### Interlockere

```dataview
TABLE verv, status, kilde
FROM "11 Maktkart/Personer"
WHERE type = "person"
SORT verv DESC, file.name ASC
```

## Registre

- [[Eierskapsregisteret]] — alle eierkanter med kilder og M&A-avtaler
- [[Selskapsregister]] — alle DB-eksporterte selskapsnoder
- [[Selskapsmappe-register]] — alle noter under `Selskaper/`, inkludert eldre AP-1-noder
- [[Personregister]] — interlockere med minst to styreverv
## Notater

_Utvikles gjennom prosjektet._
