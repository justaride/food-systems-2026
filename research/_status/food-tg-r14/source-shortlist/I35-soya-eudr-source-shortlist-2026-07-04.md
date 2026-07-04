---
tittel: I35 soya/EUDR source-shortlist
dato: 2026-07-04
status: R14 internt arbeidsunderlag
bruksregel: Ingen ekstern claim, ingen safe_for_ai_context, ingen whitepaper-/deck-stemme. Svakeste punkt styrer gate.
---

# I35 soya/EUDR source-shortlist

## Kort dom

I35 skal fortsatt være parkert. Repoet har nok kildegrunnlag til å lage en trygg import-/EUDR source-shortlist for fôr/soya-sporet, men ikke nok til å generere en ny I35-innsiktsnode eller møtefigur automatisk. Neste menneskelige beslutning må velge presis formulering, varestrøm og aktørscope før claim-lock.

## Kontrollgrunnlag

| Kilde | Rolle i I35 | Status | Caveat |
|---|---|---|---|
| `content/hvitbok/02-nordisk-sirkularitet.md` | Syntese for soya-sporbarhet, EUDR, Norge/EU-asymmetri og Norge-Brasil-aksen. | Brukbar som intern syntese. | Må ikke bli primærkilde alene. |
| `research/v1-2/phase2-primaersjekker.md` | Primærsjekk av IFRO/KU 6 %-tall, EUDR Annex I og norsk gjennomføringsstatus. | Sterkt repo-anker. | Dato- og regelverksstatus må refreshes før ekstern bruk. |
| `research/v1-2/phase8-T3-ekstern-vs-intern-diff.md` | Viser hvorfor CD-3 ble strammet fra "soya-laundering" til EU-norsk asymmetri/kundekrav-arbitrasje. | Godt stoppspråk. | Ikke bruk som ekstern kilde. |
| EU-kommisjonen, `https://environment.ec.europa.eu/topics/forests/deforestation/regulation-deforestation-free-products_en` | Offisiell EUDR-tidslinje. | Live-sjekket 2026-07-04: store/mellomstore aktører 2026-12-30, små/mikro 2027-06-30. | Frister varierer med aktørstørrelse; dette er EU-regel, ikke norsk gjennomføring. |
| EUR-Lex, `https://eur-lex.europa.eu/eli/reg/2025/2650/oj/eng` | Juridisk endringsanker for 2025-forenklinger/fristendringer. | Offisiell lovkilde. | Må brukes sammen med konsolidert Regulation (EU) 2023/1115. |
| Landbruksdirektoratet, `https://www.landbruksdirektoratet.no/nb/skogbruk/eus-avskogingsforordning-eudr` | Norsk gjennomføringsstatus og EØS-avgrensning. | Live-sjekket 2026-07-04: norsk gjennomføring holder jordbruksvarer som soya/storfe utenfor. | Må refreshes før ekstern publisering. |
| Regjeringen, `https://www.regjeringen.no/no/aktuelt/eu-regler-for-redusert-avskoging-sendes-na-pa-horing/id3116303/` | Hørings-/forskriftsanker for delvis norsk gjennomføring. | Offisiell myndighetskilde. | Høring er prosesskilde, ikke endelig forskriftsvedtak alene. |
| `public/data/food-systems/handelsakse-norge-brasil.json` og `src/lib/row-source-locators.ts` | SSB 08801/HS-anker for norsk soyabønneimport og Brasil-andel. | Sterk vareimportkilde. | HS-kode viser vareimport, ikke sluttbruk, fôrandel eller leverandørsporbarhet. |
| `research/_status/food-tg-r13/pcq/R13-GAP-001-importnode-extraction-sheet-2026-06-25.md` | PCQ for kritiske importnoder. | Brukbar metodeflate for SSB 08801. | Fôrprotein-total og sluttbruk er Type C. |
| `research/_status/food-tg-r13/r13-intake-index-2026-06-25.md` / R13-PROT-006 | Fôr-/SPC-anker og mangel på nyere full ressursregnskap. | Nyttig gap-anker. | Ikke fremskriv 2020-fôrregnskap uten ny primærkilde. |

## Source-shortlist

| Delclaim | Minimum kildepakke | Mangler før claim-lock | Stopplinje |
|---|---|---|---|
| Danmark har fysisk sporbarhetsgap for sertifisert soya. | IFRO/KU 2025 via `research/v1-2/phase2-primaersjekker.md`. | Avklar at tallet gjelder sertifisert dansk soya, ikke total nordisk/norsk soya. | Ikke overfør 6 %-tallet til Norge eller Norden. |
| EUDR skjerper krav til råvarer som soya på EU-markedet. | EU-kommisjonen + EUR-Lex. | Operatørtype, varekode og markedsplassering må spesifiseres. | Ikke si "EUDR dekker alt fôr" eller "all laks". |
| Norge har delvis EØS-gjennomføring med soya/storfe holdt utenfor. | Landbruksdirektoratet + Regjeringen. | Siste norsk forskrifts-/stortingsstatus må refreshes ved publisering. | Ikke si at Norge er permanent utenfor EUDR-systemet. |
| Norsk soyaimport har Brasil-akse. | SSB 08801/handelsakse-data. | Sluttbruk, leverandørkjede og fôrsegment må kobles med aktør-/bransjekilde. | Ikke si at SSB 08801 beviser fiskefôr eller avskogingsrisiko. |
| Fôr/import kan være sårbarhetsakse. | Kombinasjon av SSB, Nofima/FHF/R13-PROT-006 og aktørdata. | Velg scope: soyabønner, SPC, fiskefôr, husdyrfôr eller hele fôrprotein-totalen. | Ikke gjør "fôr/import" til én samlet dokumentert akse. |

## Beslutning

- I35 er source-shortlistet, men fortsatt parkert.
- Ingen `Food Systems Obsidian/10 Innsiktskart/Innsikter/I35 ...` skal genereres i denne runden.
- En senere I35 må velge én presis claim: EU-regel, norsk EØS-avgrensning, norsk vareimport/Brasil-akse eller aktørspesifikk fôrkjede.
- Hver ekstern formulering krever citable/claim-lock med år, varekode, land, aktørtype og tydelig systemgrense.

## Ikke si

- Ikke si at EUDR automatisk gjør norsk fôr/import til dokumentert sårbarhetsakse.
- Ikke si at laks som ferdigprodukt er EUDR-pliktig bare fordi fôret kan inneholde soya.
- Ikke bruk "soya-laundering" som hovedclaim; repoets tryggere formulering er EU-norsk asymmetri og eventuelt kundekrav-/sporbarhetspress.
- Ikke overfør dansk 6 %-sporbarhet til norsk eller nordisk total.
- Ikke bruk SSB 08801 som bevis for sluttbruk i fiskefôr, husdyrfôr eller leverandørsporbarhet.
- Ikke les foreløpige 2025-importtall som trend uten revisjonscaveat.
