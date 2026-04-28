---
tittel: Food TG Actor Validation Pack v0.1
status: Utført internt
eier: Gabriel
dato: 2026-04-28
neste_handling: Bruk som samtale-/epostgrunnlag for første valideringsrunde; ingen respons er registrert ennå.
relaterte_filer:
  - docs/project/mandates/claim-register-food-tg.md
  - docs/project/mandates/evidence-matrix-food-tg.md
  - docs/project/mandates/primary-check-queue-food-tg-v0.1.md
---

# Food TG Actor Validation Pack v0.1

Formål: løfte ut de claimene som ikke kan styrkes videre uten aktørrespons. Dette dokumentet er en intern valideringspakke, ikke dokumentasjon på ekstern validering.

## Bruksregel

- Alle berørte claims beholder status `Utført internt` til svar er dokumentert.
- Be aktørene bekrefte eller avkrefte definisjon, år, geografi, enhet, kilde og praktisk beslutningsrelevans.
- Skill mellom tall som er actor-tall, offentlig statistikk, svensk benchmark, norsk benchmark og hypotese.

## Runde 3 første outreach-prioritet

| Prioritet | Kontaktgruppe | Hvorfor nå | Minimum å be om |
|---|---|---|---|
| P1 | Landbruksdirektoratet / Miljødirektoratet | EUDR-Norge må formuleres presist før decision memo v0.2 bruker CL-C-011. | Endelig EØS-/forskriftsstatus, soya-scope, SPC/prepared-feed-varekoder, Traces/DDS/EORI-praksis og hva norske fôr-/soyaaktører bør gjøre i 2026. |
| P1 | Denofa, Skretting Norge og Sjømat Norge | SSB/HS, Denofa, Skretting og Fiskeridirektoratet må holdes som separate datatyper; bransjeproxy krever aktørsvar. | År, geografi, enhet, fôrsammensetning, SPC/fiskemel/fiskeolje, volum, opprinnelse, sertifisering, data som kan siteres og om sitatsjekk kreves. |
| P1 | NMBU / Foods of Norway | CL-A-001/CL-A-002/CL-A-020 trenger teknisk modenhetsgate for encelle-/gjærprotein. | Originalartikler/DOI, forsøksdesign, substitusjonsnivå, LCA/kost, regulatorisk vei og pilotminimum. |
| P1 | Mattilsynet + okara/BSG-produsent eller fagekspert | CL-B-014/CL-B-021 kan ikke løftes uten food-grade, hygiene, Novel Food og produsentdata. | Tonn/år, tørrstoff/fukt, tid/temperatur, mikrobiologi, nåværende avsetning, lovlig sluttbruk, holdbarhet og off-taker-krav. |
| P2 | SINTEF/FHF + en marin restråstoffaktør | Marint restråstoff er norsk benchmark, men fraksjon-til-sluttbruk og høyverdi må låses. | Dataordbok, råstoffvekt vs produktvekt, fraksjon/sluttbruk, K2/dødfisk-splitt, human/fôr/pet/energi og hva som kan siteres. |

## A - fôr, import og EUDR

| Aktør | Claims/EV | Hovedspørsmål | Data å be om | Status |
|---|---|---|---|---|
| Denofa | CL-A-020, CL-C-011 / EV-A-017 | Kan Denofa bekrefte årlig soyabønnevolum, opprinnelsesandeler, produktfordeling og EUDR-forberedelser? | Soyabønner inn, soyamel/olje/lecitin ut, år, opprinnelsesland, sertifisering, kundesegmenter. | needs-actor-validation |
| Skretting Norge | CL-A-020, CL-C-011 / EV-A-019 | Hvor representative er Skretting-data for norsk laksefôr, og hvilke krav gjelder for nye alternative proteiner? | SPC/fiskemel/vegetabilske råvarer, sertifisering, volumterskel, pris, kvalitetskrav, dokumentasjonskrav. | needs-actor-validation |
| BioMar / Cargill / Mowi Feed | CL-A-020, CL-C-011 / EV-A-018, EV-A-019 | Kan tilsvarende fôrsammensetning og råvarekrav bekreftes på tvers av aktører? | 2024/2025 fôrsammensetning, SPC/fiskemel, marine råvarer, opprinnelse, EUDR-/sporbarhetskrav. | needs-actor-validation |
| Foods of Norway / NMBU | CL-A-001, CL-A-002, CL-A-020 | Hva er modenheten for encelleprotein/gjærprotein som importsubstitusjon i laksefôr? | Forsøksstatus, tekniske begrensninger, kostdrivere, LCA-spørsmål, regulatoriske hindre. | needs-actor-validation |
| Mattilsynet | CL-A-005, CL-A-006, CL-A-011, CL-A-021 | Hvilke substrater er grønne/gule/røde for fôr/insekt/fôrsubstrater under gjeldende regelverk? | Substratliste, dokumentasjonskrav, hygiene, ABP/TSE-status, pilotkrav. | needs-actor-validation |
| Landbruksdirektoratet / Miljødirektoratet | CL-C-011 / EV-C-017 | Hvordan skal norske aktører forholde seg til EUDR for soya/fôrråvarer? | Norsk/EØS-status, soya-scope, import/eksport til EU, Traces/informasjonssystem, frister. | needs-actor-validation |

## B - prosess-sidestrømmer

| Aktør | Claims/EV | Hovedspørsmål | Data å be om | Status |
|---|---|---|---|---|
| Axfoundation / Over & Oat | CL-B-014, CL-B-021 / EV-B-018 | Hva er dokumentert læring fra Over & Oat, og hva er fortsatt uavklart? | Okara-volum, tørrstoff/fukt, holdbarhet, hygiene, nåværende avsetning, produktforsøk, partnere. | needs-actor-validation |
| Oatly / The Green Dairy / Fazer / Valio | CL-B-014, CL-B-021 / EV-B-018 | Hvilke okara-strømmer finnes per anlegg, og er de egnet for mat/ingrediens? | Tonn/år, batchfrekvens, tørrstoff, temperatur, mikrobiologi, logistikk, pris, avsetning. | needs-actor-validation |
| RISE / Brewed & Renewed | CL-B-014, CL-B-021, CL-B-009 / EV-B-019 | Hva er minimumskravene for bryggerimask som matingrediens? | Fukt, stabilisering, prosess, pilotresultater, matgrade-krav, aktørroller, produktmål. | needs-actor-validation |
| Carlsberg / norske bryggerier | CL-B-014, CL-B-021 / EV-B-019 | Hvilke bryggerimaskvolumer finnes lokalt, og kan de holdes rene nok for mat/ingrediens? | Liter øl, kg BSG/liter, tonn/år, fukt, dagens avsetning, logistikk, stabilisering. | needs-actor-validation |
| SINTEF / FHF | CL-B-009, CL-B-021 / EV-B-020 | Hvilke marine restråstoff-fraksjoner er mest relevante for høyverdi og hvilke er fortsatt uutnyttet? | Fraksjon per art/sektor, humant konsum/fôr/energi, kvalitet, logistikk, økonomi, dataeier. | needs-actor-validation |
| HBC / Biomega / Pelagia / Scanbio / sjømataktører | CL-B-009, CL-B-021 / EV-B-020 | Hvilke fraksjoner kan faktisk oppgraderes, og hva stopper dem? | Volum, kvalitet, dokumentasjonskrav, kundekrav, CAPEX/OPEX, regulering, marked. | needs-actor-validation |

## C - adoption, innkjøp og markedsmekanismer

| Aktør | Claims/EV | Hovedspørsmål | Data å be om | Status |
|---|---|---|---|---|
| Matvett | CL-B-001, CL-B-002, CL-B-022, CL-C-012 | Hvor oppstår beslutningsrelevante kvalitetstap før redistribusjon eller høyverdig bruk? | Segmentdata, ferskvarekategorier, målepunkt, rutiner, rapporteringskrav. | needs-actor-validation |
| Too Good To Go | CL-B-022, CL-C-014 | Hvilke tidsvinduer, data og rutiner flytter varer opp i kaskaden? | Produktdata, tidsvinduer, pris-/donasjonsrutiner, målemetoder, caseerfaring. | needs-actor-validation |
| Offentlige innkjøpere / kommunale kjøkken | CL-C-002, CL-C-015 | Hvilke sirkulære krav kan brukes i matinnkjøp uten å knekke drift eller leverandørtilgang? | Kontraktskrav, rapporteringsmulighet, matavfall, leverandørkrav, kjøkkenkapasitet. | needs-actor-validation |
| Dagligvare / HORECA / grossist | CL-C-001, CL-C-012, CL-C-014 | Hvilke rutiner, kontrakter eller datagap hindrer redistribusjon og høyverdiutnyttelse? | Sortering, kvalitetsgrenser, temperatur, ansvar, insentiver, kontraktshindre. | needs-actor-validation |
| Dagligvaretilsynet / Konkurransetilsynet | CL-C-005, CL-C-006 | Hvordan påvirker handelsskikk, rapporteringsvern og markedsmakt sirkulære leverandører? | Relevante saker, veiledning, håndhevingspraksis, overføring 2026-04-30, leverandørvern. | needs-actor-validation |

## Minimumsformat for svar

| Felt | Krav |
|---|---|
| Tall | Definisjon, år, geografi, enhet, kilde og om tallet kan siteres. |
| Status | Bekreftet av aktør, avkreftet, delvis bekreftet eller kan ikke deles. |
| Bruk | Ekstern sitatbruk, intern bruk, kun bakgrunn eller ikke bruk. |
| Kontakt | Navn/rolle, dato og om sitatsjekk kreves. |
