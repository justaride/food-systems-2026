---
tittel: R12-VIZ-003 - Kausalkart L1-L5
status: Batch 12 visualiseringsunderlag - forståelse, ikke claim
id: R12-VIZ-003
priority: P1
theme: visualization
geo: Internal
gate: forstaelse
accessedAt: 2026-06-24
sourceClass: A/B/C blandet
---

# R12-VIZ-003 - Kausalkart L1-L5

## Kort dom

Kausalkartet kan bygges som en hypotese- og evidenstabell, ikke som målt kausalmodell. Tidligere R12-batcher gir A-ankre for enkelte noder som importstatistikk, fôrdata, beredskapskilder, offentlige kontrakter, juridiske ansvar og noen avfalls-/restråstoffstrømmer. Pilene mellom L1-L5 må derimot merkes med evidensstyrke, fordi de ofte går fra dokumentert struktur til antatt effekt.

Det modne outputet er derfor et `forstaelse`-underlag: pilene kan tegnes hvis hver pil har `evidence_strength`, `source_class`, `gap_type`, `gate` og en eksplisitt `ikke_si`.

## Sterkeste kilde

- `research/forstaelse/R12-GOV-001-governance-impotens-sloyfen.md`
- `docs/project/mandates/R12-VIZ-001-datakrav-for-ledd-profil-visualisering.md`
- `research/external/r12/R12-VALUE-001-ledd-profil-import-norge.md`
- `research/external/r12/R12-FEED-002-forimportavhengighet-per-produksjon.md`
- `research/external/r12/R12-RES-001-forkorrigert-selvforsyning-norden.md`
- `research/external/r12/R12-RES-002-beredskapslager-korn-for-gjodsel.md`
- `research/external/r12/R12-DIST-002-offentlige-matkontrakter-regionalt.md`
- `research/external/r12/R12-GOV-002-ansvarsmatrise-matberedskap.md`

## Svakeste punkt

De fleste pilene viser plausible mekanismer, ikke målt kausalitet. R12-outputene dokumenterer ofte noder og hull, men mangler effektmålinger som kobler virkemiddel til strukturendring, importnode til faktisk robusthet, offentlige kontrakter til lokal produsenttilgang eller sidestrøm til høyverdiutnyttelse.

## L1-L5 nodeforslag

| Lag | Nodefamilie | Eksempel fra R12 | Kildeklasse | Caveat |
|---|---|---|---|---|
| L1 | Struktur og avhengighet | Importkoder, kraftfôr, dagligvare/grossist, beredskapslager | A med C-felt | Sluttbruk, aktørledd og faktisk beholdning er ofte ikke åpne. |
| L2 | Mekanisme | Sluttbruksgap, lagergap, grossistgate, metodegap, actor-gate | A/B/C | Mekanisme må ikke bli intensjonspåstand. |
| L3 | Styringsrespons | Utredning, tilsyn, ROS, kontrakt, source-shortlist, PCQ | A/B | Tiltak/ansvar er ikke effekt. |
| L4 | Målt eller ikke målt effekt | Strukturendring, robusthet, lokal kanal, høyverdiutnyttelse | C dominerer | Effektserier mangler ofte. |
| L5 | Claim-/visualiseringsgate | PCQ, claim-lock, actor-gate, forstaelse, internal, parkert | A internt | Gate er kontrollstatus, ikke sannhetsgrad. |

## Kausalpil-tabell

| Pil-ID | Fra | Til | Mekanisme | Evidensstyrke | Sterkeste kilde | Kildeklasse | Hulltype | Gate | Caveat |
|---|---|---|---|---|---|---|---|---|---|
| P01 | Importstatistikk per varekode | Sluttbruk/beredskap | Varestrømmer kan indikere avhengighet | Moderat for varestrøm, svak for sluttbruk | R12-VALUE-001 / SSB 08801 | A med C | Type C sluttbruk/lager | PCQ | HS-kode beviser ikke mat/fôr/fiskefôr-sluttbruk. |
| P02 | Kraftfôrstatistikk | Importavhengighet per produksjon | Kraftfôr gir delbilde av fôrkurv | Moderat | R12-FEED-002 | A med B/C | Type A/B/C | PCQ | Kraftfôr er ikke totalrasjon. |
| P03 | Fôrkorrigert selvforsyning NO | Nordisk sammenligning | Metode kan inspirere komparativ figur | Svak nordisk | R12-RES-001 | A for NO, C for Norden | Type C | PCQ | Ingen harmonisert nordisk metodebro. |
| P04 | Beredskapslager mål/avtale | Faktisk robusthet | Lager kan styrke forsyning hvis beholdning/rotasjon finnes | Svak til moderat | R12-RES-002 | A med C | Type C | PCQ | Mål, rammeavtale, kapasitet og faktisk beholdning må skilles. |
| P05 | Offentlige matkontrakter | Alternativ kanal for produsenter | Kontrakter kan åpne regional distribusjon | Svak | R12-DIST-002 | A med uttrekkshull | Type A/C | PCQ | Doffin-sample viser ikke lokal produsentandel. |
| P06 | Governance-tiltak | Strukturendring i dagligvare/beredskap | Utredning/tilsyn kan endre rammer | Svak | R12-GOV-001 | A med C-effekthull | Type C | forstaelse | Tiltak er ikke målt effekt. |
| P07 | Kommunal/statlig beredskapsplikt | Lokal matberedskap | ROS/plan kan inkludere matforsyning | Svak | R12-GOV-002 | A med B/C | Type C effekt | PCQ | Hjemmel beviser ikke faktisk robusthet. |
| P08 | Marint restråstoff | R-stige/høyverdiutnyttelse | Oppstått/utnyttet volum kan fordeles etter anvendelse | Moderat for volum, svak for R-nivå | R12-WASTE-001 | A med metodecaveat | Type A | PCQ | Utnyttet er ikke høyverdi. |
| P09 | Oppdrettsslam | Næringsretur/fôr/gjødsel | Slam kan bli ressurs ved innsamling/behandling | Svak | R12-WASTE-002 | A med C | Type C | PCQ | Modellert utslipp er ikke faktisk innsamlet volum. |
| P10 | Digestat SPCR 120 Sverige | Nordisk N/P/K-returfigur | Svensk A-anker kan vise én metode | Moderat for SE, svak for Norden | R12-WASTE-003 | A for SE, C for øvrig Norden | Type C | PCQ | Ikke nordisk rangering. |
| P11 | Kaffeimport/SCG-faktor | Urbane sidestrømmer | Import kan gi estimatspenn for kaffegrut | Svak | R12-WASTE-004 | A/B/C | Type C avfallsfraksjon | source-shortlist | Import er ikke konsum, grut er ikke egen avfallsfraksjon. |
| P12 | Aktørkart/kandidatlister | Praktisk omstillingsevne | Flere nettverk kan indikere praksisfelt | Svak | R12-ACTOR-001/003/004/005 | A/B med Type B | Type B/C | actor-gate | Kandidater er ikke verifiserte aktive produsenter. |

## Tomme celler

- Ingen pil har i denne batchen en kontrollert kontrafaktisk effektmåling.
- Ingen felles tidsserie kobler virkemiddel til endret grossisttilgang, importavhengighet, lagerrobusthet eller lokal produksjon.
- Ingen harmonisert nordisk metodebro finnes for flere indikatorer som ønskes i samme kausalkart.
- Aktørfeltet mangler radvis verifisert aktiv status og produksjons-/kapasitetsdata.
- Flere piler mangler enhet, periode eller effektmål og må tegnes som hypotesepiler.

## Ikke si

- Ikke si at kausalkartet beviser kausalitet.
- Ikke si at en dokumentert struktur automatisk forklarer aktørintensjon.
- Ikke si at tiltak, lovhjemmel eller utredning er det samme som målt effekt.
- Ikke la piltykkelse eller farge antyde sikkerhet uten `evidence_strength`.
- Ikke skjul C-hullene i piler som ser visuelt viktige ut.
- Ikke gjør forstaelse-output til claim-lock uten PCQ og presis tekst.

## Anbefalt gate

`forstaelse`. Kausalkartet kan brukes internt som strukturert hypotesekart med evidensstyrke per pil. Ingen pil bør bli ekstern figur uten PCQ/claim-lock eller eksplisitt merking som hypotese.
