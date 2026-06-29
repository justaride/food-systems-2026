# R12-FARM-004 - Samvirkemakt og bondemargin

**Dato:** 2026-06-24
**Status:** Batch 09 output - underlag, ikke claim
**Gate:** source-shortlist
**Beslutning:** enrich

## Kort dom

Samvirke kan beskrives strukturelt som brukereid/brukerstyrt markeds- og foredlingsapparat, men ikke som privat oligopol eller som automatisk marginlosning. TINE- og Nortura-sporene gir primarkilder for eierform, medlemstall, eierstyring, raavarepris/etterbetaling og markedstilgang. Bondens margin krever likevel kobling mellom avregning, kostnader, volum, kapital, etterbetaling og alternativ markedsadgang; apne samvirkekilder alene gir ikke netto per-kg-margin.

## Sterkeste kilde

- Norsk Landbrukssamvirke, Samvirkebonde, aksessert 2026-06-24: `https://landbruk.no/samvirkebonde/`
- Nortura SA, Arsmelding 2025, aksessert 2026-06-24: `https://www.nortura.no/flipbook/Nortura_aarsmelding_2025.pdf`
- Nortura, partnerskap og samarbeid / Nortura SA, aksessert 2026-06-24: `https://www.nortura.no/b%C3%A6rekraft-i-nortura/partnerskap-og-samarbeid-3`
- TINE arsrapporter / finansiell informasjon, aksessert 2026-06-24: `https://www.tine.no/om-tine/finansiell-informasjon`
- NIBIO/BFJ Totalkalkylen, aksessert 2026-06-24: `https://www.nibio.no/tema/landbruksokonomi/totalkalkylen`

## Svakeste punkt

Margin sett fra bonden er ikke observerbar i apne samvirke-arsrapporter alene. Samvirket kan betale raavarepris, etterbetaling eller medlemskapital, men netto margin krever brukets kostnadsstruktur og kontrakts-/avregningsdata.

## Strukturtabell

| Tema | Hva kan sies strukturelt | Kildeklasse | Hulltype | Caveat |
|---|---|---|---|---|
| Samvirkeform | Norsk Landbrukssamvirke beskriver samvirke som brukereid, brukerstyrt og med formal om brukernytte/overskuddsfordeling etter omsetning. | B organisasjonskilde | Type A | Definisjonskilde, ikke empirisk marginmaling. |
| TINE | TINE beskrives som bondens egen bedrift med formal om best mulig okonomisk resultat av melkeproduksjon og felles interesser. | B actor/organisasjon | Type B | Formal og medlemsnytte er ikke garanti for faktisk netto margin. |
| Nortura | Nortura arsmelding 2025 sier Nortura SA er et samvirkeforetak eid av ca. 15 200 kjott- og eggprodusenter med demokratisk organisering. | B actor-primary | Type A/B | Eierstyring og medlemsstruktur er belagt; produsentmargin per dyreslag krever avregning/kostnad. |
| Nortura resultat/etterbetaling | Nortura arsmelding har resultat for etterbetaling/skatt, disponering og medlemskapitalkonto. | B actor-primary | Type A/B | Etterbetaling/medlemskapital er ikke lik lopende kilopris eller netto margin. |
| Markedsadgang | Samvirkekildene legger vekt pa tilgang til marked og foredlingsledd. | B actor/organisasjon | Type B | Alternativ markedsadgang ma sammenlignes med private kjopere og konkrete vilkar. |
| BFJ/NIBIO | Totalkalkylen gir sektorokonomisk bakteppe for bondens inntekter/kostnader. | A | Type A | Sektorregnskap er ikke samvirkeeffekt og ikke per-kg-margin. |
| Samvirkemakt | Kan omtales som strukturell posisjon/eierform/markedsregulatorisk rolle, ikke intensjon. | A/B/C | Type C | Apen kilde i denne batchen maler ikke kausal effekt av samvirkemakt pa bondemargin. |

## Tomme celler

- Netto per-kg-margin for bonde etter avregning, kostnader, trekk, kvalitetsklasse, transport, investering og etterbetaling.
- Sammenlignbar margin mellom samvirke og private kjopere per produksjonstype.
- Kausal effekt av samvirkeeierskap pa bondens margin.
- Full kobling mellom markedsregulering, prisuttak, etterbetaling og enkeltbruksokonomi.
- Regionale forskjeller i medlemsnytte, transportkostnad eller leveringsvilkar.

## Ikke si

- Ikke si at samvirke er samme struktur som private oligopol.
- Ikke si at bondens eierskap automatisk gir hoyere margin.
- Ikke si at etterbetaling er det samme som lopende avregningspris eller netto margin.
- Ikke gjore formalstekst til dokumentert faktisk effekt.
- Ikke blande sektorregnskap, konsernresultat, raavarepris og enkeltbrukets margin.
- Ikke lage intensjonspastander om samvirkemakt uten kilde.

## Anbefalt gate

`source-shortlist`. Importer som struktur- og kildeanker. Eventuelle marginclaims ma tilbake til PCQ/actor-gate med avregningsdata og produksjonstype.

