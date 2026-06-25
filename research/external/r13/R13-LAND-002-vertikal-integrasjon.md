---
id: R13-LAND-002
tittel: Vertikal integrasjon og eierkoblinger
dato: 2026-06-25
gate: PCQ
status: mottaksført
lagre_output: research/external/r13/R13-LAND-002-vertikal-integrasjon.md
bruksregel: Kildedatert strukturkart. Ikke påstand om kartell, operativ kontroll eller tilgangsnekt uten egen dokumentasjon.
---

# R13-LAND-002 - vertikal integrasjon

## Kort dom

Dette kan brukes i `PCQ` som et datert strukturkart. Norsk dagligvaredistribusjon er dokumentert rundt paraplykjedenes egne grossist-/distribusjonssystemer, mens samvirker og sjømataktører har tydelige oppstrøms/nedstrøms koblinger i årsrapporter. Eksakte eierprosenter, franchisekontroll og private kontraktsvilkår trenger Brreg-konsernstruktur, aksjonærregister eller aktørbekreftelse før claim-lock.

## Mottakstabell

| Aktør/kobling | Struktur | Kjedeledd | Kildeklasse | Caveat |
|---|---|---|---|---|
| NorgesGruppen -> ASKO -> KIWI/MENY/SPAR/Joker | ASKO er NorgesGruppens grossist; Menon oppgir at ASKO leverer om lag 85 % av varene til NorgesGruppens dagligvarebutikker. | Retail -> grossist/logistikk | A | Butikkeierskap er blandet; ikke si at alle butikker er gruppeeid. |
| NorgesGruppen/Reitan/Banan II -> BAMA | BAMA er oppgitt med NorgesGruppen 46 %, Banan II 34 %, Rema/Rema Industrier 20 % i regulator-/kartleggingskilder. | Frukt/grønt import/grossist/pakking | A | Nyeste BAMA-årsrapport/shareholder note må hentes før claim-lock. |
| Coop samvirkelag -> Coop Norge SA | Coop Norge håndterer innkjøp, kategori, landsdekkende logistikk, kjedekonsepter og markedsføring; eid av samvirkelag. | Medlemseid retail -> grossist/logistikk | A | Medlemseid governance er ikke en enkel prosenttabell per forbrukermedlem. |
| Coop Norge Industri | Coop Norge Industri er heleid og omfatter flere produksjons-/foredlingsenheter. | Retail/grossist -> foredling/egne merker | A/B | Subsidiary-prosenter bør kontrolleres radvis i Brreg/årsrapportnoter. |
| REMA 1000 -> REMA Distribusjon | Menon beskriver REMA 1000 Distribusjon og oppgir omtrent 70 % vareflyt til REMA 1000. | Franchise/retail -> grossist/logistikk | A for struktur, C for eksakt eierandel | Eksakt parent/share trenger Brreg-konsernstruktur/aksjonærregister. |
| TINE SA -> meieri, Fjordland, Diplom-Is, Mimiro | Melkebondesamvirke med innsamling, foredling, merkevarer og datterselskaper. | Gård/melk -> foredling/brands/distribusjon | A/B | Enkelte datterselskapsprosenter må visuelt kontrolleres i note. |
| Nortura SA -> Gilde/Prior/Norilia m.fl. | Bondesamvirke med slakt, foredling og merkevarer. | Husdyr/egg -> slakt/foredling/brands | A/B | Full eierprosenttabell for datterselskaper mangler i dette uttaket. |
| Felleskjøpet Agri SA -> fôr/korn/retail/Cernova/Granngården | Bondesamvirke og innsatsleverandør; årsrapport viser sentrale eierposisjoner. | Innsats/fôr/korn -> landbruk/retail | A/B | Oppstrøms/inputintegrasjon, ikke dagligvarekontroll. |
| Mowi ASA | Integrert laksekjede med feed, farming, sales/marketing og consumer products; Mowi Feed dekket 96 % av europeisk fôrforbruk i 2024. | Fôr -> oppdrett -> foredling -> salg | A | Aksjonærkontroll er ikke majoritetskontroll. |
| Austevoll -> Lerøy | Austevoll eier 52,7 % av Lerøy ved 31.12.2024; Lerøy har integrerte redfish/whitefish-ledd. | Holding -> fangst/oppdrett/foredling/distribusjon | A | Laco->Austevoll-andel må hentes fra aksjonærtabell før prosentpåstand. |
| SalMar/Kverva | SalMars governance-side oppgir indirekte Kverva-/Witzøe-eierskap og integrerte smolt-, oppdrett-, prosessering- og salgsledd. | Holding -> sjømatproduksjon/prosessering/salg | A | Bruk datostemplet company governance-side; ikke gjør til 2024-årsrapportfunn. |

## Sterkeste kilde

Menon/NFD-kartleggingen av tilgang til dagligvaregrossisttjenester er sterkest for dagligvareintegrasjon fordi den navngir de integrerte fullsortimentsgrossistene og gir omtrentlige vareflytandeler. For eierandelsprosenter er årsrapportene til Lerøy/Austevoll sterke på datert shareholder-informasjon.

## Svakeste punkt

Det svakeste punktet er private, franchise- og butikknære kontrollformer: REMA Distribusjon parent/share, Nortura-datterselskaper, enkelte Coop/TINE-subenheter og kontraktsvilkår mellom kjede, kjøpmann og leverandør.

## Kildeklasse og hull

| Felt | Klasse | Hulltype |
|---|---|---|
| Grossiststruktur i dagligvare | A | Type A: kontroller mot Menon/NFD og KT. |
| Årsrapporterte integrerte konsernledd | A/B | Type A for børs-/årsrapporttabeller; Type B der datterselskapsnote ikke er visuelt ekstrahert. |
| Franchisevilkår, leverandøravtaler og tilgangsvilkår | B/C | Type B actor-gate; Type C hvis ingen åpen kilde dekker kontrollspørsmålet. |

## Tomme celler

- REMA Distribusjon eksakt eierandel/parent.
- Full datterselskaps-/eierprosenttabell for Nortura.
- Nyeste BAMA shareholder table.
- Butikk-eierskap per kjede og kommune.
- Kontraktsmessige kontrollvilkår for franchisetakere og kjøpmannseide butikker.
- Direkte bevis for vertikal eksklusjon eller tilgangsnekt.

## Ikke si

- Ikke si kartell, samordning eller operativ kontroll fra eierstruktur alene.
- Ikke si at NorgesGruppen, Coop eller REMA eier alle butikkene.
- Ikke si at BAMA kontrolleres av NorgesGruppen uten 46 %-minoritet og governance-caveat.
- Ikke si at grossisttilgang er nektet; Menon fant ikke bevist tilgangsnekt.
- Ikke bruk Brreg-status eller roller som bevis for eierprosent.

## Anbefalt gate

`PCQ` for smale eier-/koblingsrader. Hold radene som intern/source-shortlist til eksakte prosentfelt er visuelt kontrollert og Brreg-/aksjonærregisterlokatorer er festet per kobling.

## Primærkilder

| Kilde | URL | accessedAt | Klasse |
|---|---|---|---|
| Konkurransetilsynet, Dagligvarerapport 2024/25 | https://konkurransetilsynet.no/wp-content/uploads/2025/04/Konkurransetilsynets-Dagligvarerapport-2024-25.pdf | 2026-06-25 | A |
| Menon/NFD, grossisttilgang dagligvare | https://www.regjeringen.no/contentassets/8487e2f5db78484cb3af5250416badd3/menon-rapport-kartlegging-av-tilgang-til-dagligvaregrossisttjenester.pdf | 2026-06-25 | A |
| Brreg Enhetsregisteret API | https://data.brreg.no/enhetsregisteret/api/enheter/{orgnr} | 2026-06-25 | A |
| NorgesGruppen Annual/Sustainability Report 2024 | https://www.norgesgruppen.no/globalassets/finansiell-informasjon/rapporter/2024/ng_annual-sustainability-report-2024-ii.pdf | 2026-06-25 | B |
| Coop Norge Års- og bærekraftsrapport 2024 | https://downloads.ctfassets.net/b26eki8n3vte/2QvCIRYayaH5K6dAMK48De/e7fd1ae2f9048598ea42513337dd1a5a/Coop_Norge_SA_a%C3%8C_rsrapport_2024_HR_1.pdf | 2026-06-25 | B |
| TINE Årsrapport 2024 | https://www.tine.no/b%C3%A6rekraft/_/attachment/inline/9cea416b-a20a-4626-96ed-65bce2a82685%3A31abe1fe90c6862b897357ca6350a74a6e6b38b1/TINE%20%C3%85rsrapport%202024.pdf | 2026-06-25 | B |
| Nortura Annual Report 2024 | https://www.nortura.no/attachments/Annual-report/Nortura_annual_report_2024.pdf | 2026-06-25 | B |
| Felleskjøpet Årsrapport 2024 | https://fka.felleskjopet.no/globalassets/medlem/arsrapporter/aarsrapport_felleskjoepet_2024.pdf | 2026-06-25 | B |
| Mowi Integrated Annual Report 2024 | https://mowi.com/wp-content/uploads/2025/03/Mowi-Integrated-Annual-Report-2024.pdf | 2026-06-25 | A |
| Lerøy Annual Report 2024 | https://www.leroyseafood.com/globalassets/02--documents/english/annual-reports/lsg-annual-report-2024.pdf | 2026-06-25 | A |
| Austevoll Seafood Annual Report 2024 | https://www.auss.no/media/1627/auss-annual-report-2024-250430.pdf | 2026-06-25 | A |
| SalMar corporate governance | https://www.salmar.no/en/investor/corporate-governance/about-corporate-governance/ | 2026-06-25 | A |
