---
tags: ""
type: hub
status: generert
kilde: scripts/obsidian-vault/sync.ts
siterbarhet: intern
---

# Innsiktskartet

> Innsiktslaget · Søsterkart til [[HUB – Kunnskapsdatabasen]] og [[Maktkartet]]

Innsiktskartet er arbeidsflaten for hva vi mener vi vet, hva som fortsatt er gap, og hva som bare er internt beslutningsgrunnlag. Verdikjeden er ryggraden; innsikter, looper, gaps og maktlaget henger på den. Visuelt kart: [[Verdikjedekart.canvas|Verdikjedekart]].

> ⚠️ **Internt arbeidskart.** Tall og claims er gjengitt fra research-syntesen (`narrativ-struktur.md` m.fl.). Ekstern bruk krever claim-lock og siterbarhets-gate — se [[Kilder]].

## Verdikjeden (ryggraden)

[[Ledd 1 – Innsatsfaktorer]] → [[Ledd 2 – Primærproduksjon]] → [[Ledd 3 – Foredling]] → [[Ledd 4 – Distribusjon og grossist]] → [[Ledd 5 – Dagligvare og detaljhandel]] → [[Ledd 6 – Horeca og storhusholdning]] → [[Ledd 7 – Forbruker og husholdning]] → [[Ledd 8 – Ressurssløyfe og sidestrømmer]]

## Bevis-kjeden (I01-I26)

**Del 1 – Det norske systemet**

- [[I01 Triopolet – 93,4 % av butikkene]]
- [[I02 4,9 mrd-boten]]
- [[I03 Attraktortilstanden]]
- [[I04 Markedsstrukturen – 14 kjeder, 5 morselskaper]]
- [[I05 Brattere enn naturlig]]
**Del 2 – Prisdynamikken**

- [[I06 Pristransmisjon-paradokset]]
- [[I07 Skjulte gebyrer]]
- [[I08 Spread-tidslinjen – fem faser]]
- [[I09 Juli-effekten]]
**Del 3 – Nordisk perspektiv**

- [[I10 Hele Norden er høykonsentrert]]
- [[I11 Norge har høyest topp-3]]
- [[I12 Danmark som moteksempel]]
- [[I13 Finland – duopol med sterkest regulering]]
- [[I14 Sverige mot duopol]]
**Del 4 – Selvforsyning og beredskap**

- [[I15 Selvforsyning 44 %]]
- [[I16 Riksrevisjonen 2023 – uforberedt på matkrise]]
- [[I17 Fruktavhengigheten – 96 % import]]
- [[I18 Dobbel sårbarhet]]
**Del 5 – Regulatorisk landskap**

- [[I19 EØS-paradokset]]
- [[I20 Finlands paragraf 4a som modell]]
- [[I21 Dagligvaretilsynet foreslått nedlagt]]
**Del 6 – Systemdynamikk**

- [[I22 Nordstad-tesen – infrastrukturkontroll]]
- [[I23 Gaasland-kritikken]]
- [[I24 Syntesen – prisgulv pluss superprofitt]]
**Del 7 – Handling**

- [[I25 Fem overgangsmekanismer]]
- [[I26 Gaps som krever menneskelig input]]

## V2-kuratering (selektiv I27+)

- [[I27 Styreoverlappet peker på smale broer]]
- [[I31 Krysseie må leses som kontrollbaner]]
- [[I34 Fem fokusområder gjør kartet handlingsrettet]]
- [[I36 Næringsgjenvinning er et prioritert gap]]
- [[I37 Maktkartet må leses gjennom fire linser]]
- [[I38 Objective-function skiller beslutning fra publisering]]

Disse notene er interne arbeidsnoder. De er valgt fordi de gjør kartet mer brukbart som cockpit, men de er ikke automatisk publiserbare claims.

## Aktører

**Konsern:** [[NorgesGruppen]] · [[ASKO]] · [[Reitan Retail]] · [[Coop Norge]] · [[Orkla]] · [[TINE]] · [[Nortura]] · [[Felleskjøpet Agri]] · [[BAMA]] · [[Mowi]] · [[Lerøy Seafood]] · [[SalMar]] · [[Austevoll Seafood]] · [[Bunnpris]]

**Eiere:** [[Joh. Johannson-familien]] · [[Reitan-familien]] · [[Møgster-familien (Laco)]] · [[Gustav Witzøe]] · [[Stein Erik Hagen (Canica)]] · [[John Fredriksen]]

**Regulatorer:** [[Konkurransetilsynet]] · [[Dagligvaretilsynet]] · [[Riksrevisjonen]]

- **25 looper** i `Looper/` — eksisterende sirkulære strømmer (R1–R9)
- **12 norske gaps** i `Gaps/` + [[Gap-oversikten – hull i sirkulariteten]]
- [[Aktørcaser – suksess og fiasko]]

## Norden

[[Norge]] · [[Sverige]] · [[Danmark]] · [[Finland]]

## Maktlaget

[[Maktkartet]] — styrenettverket og eierkantene bak aktørene: interlockere, [[Eierskapsregisteret]], konserntrær og kontrollbaner. Les sammen med [[I27 Styreoverlappet peker på smale broer]], [[I31 Krysseie må leses som kontrollbaner]] og [[I37 Maktkartet må leses gjennom fire linser]].

## Slik leses grafen

- **Grønn** = verdikjedeledd (ryggraden) · **Blå** = aktører/eiere · **Rosa** = innsikter (bevis-kjeden) · **Cyan** = looper · **Oransje** = gaps · **Lilla** = Norden
- Nodestørrelse følger antall lenker: store noder viser hvor kartet har mange koblinger, ikke alene hvor "viktig" eller publiserbar en påstand er.
- Gaps med få lenker ligger løst i utkanten — hullene i sirkulariteten er bokstavelig talt synlige.

## Dynamiske oversikter

### Innsikter

```dataview
TABLE status, siterbarhet, kilde
FROM "10 Innsiktskart/Innsikter"
WHERE type = "innsikt"
SORT file.name ASC
```

### Gaps med mission-status

```dataview
TABLE mission, status, kilde
FROM "10 Innsiktskart/Gaps"
WHERE type = "gap"
SORT mission ASC, file.name ASC
```

## Sirkularitet

- [[Loop-register]] — alle loop-noder i `Looper/`
- [[Gap-register]] — alle gap-noder i `Gaps/`
- [[Gap-oversikten – hull i sirkulariteten]]
- [[Aktørcaser – suksess og fiasko]]
## Notater

_Utvikles gjennom prosjektet._
