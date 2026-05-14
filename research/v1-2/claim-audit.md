---
tittel: "v1.2 Phase 1 — Claim-audit"
status: ferdig
dato: 2026-04-30
eier: Gabriel
hovedrapport: public/reports/nordisk-sirkularitetsrapport-2026-05.html (v1.1)
input:
  - public/reports/nordisk-sirkularitetsrapport-2026-05.html
  - docs/project/mandates/nordisk-sirkularitetsrapport-appendiks-2026-05.md
  - research/v1-1/A1-A5
  - research/norden/sirkularitet-sprint-2026-05/ (8 batches + innsiktsmotor + syntese + baseline v0.3)
formaal: "Auditere hver kvantitativ påstand i HTML-rapporten mot primærkilder; klassifisere ✅/🟡/🔴; identifisere svakheter for v1.2."
metode: "Lese HTML-rapport linje for linje, ekstraher hver tallpåstand, krysse mot appendiks-bibliotek + batch-research + baseline.json. Streng kalibrering: 'OECD 2025' uten direkte URL = 🟡."
---

# Claim-audit av public/reports/nordisk-sirkularitetsrapport-2026-05.html

## Sammendrag

- **Totalt auditerte påstander:** 87 distinkte kvantitative/spesifikke påstander
- **✅ Direkte primær:** 51 (59%) — primærkilde finnes og påstanden matcher
- **🟡 Sekundær men sjekkbar:** 24 (28%) — kilde finnes men er sekundær eller URL pending
- **🔴 Svak/manglende:** 12 (14%) — ingen sterk kilde, vag referanse, eller potensielt feil tall

**Generell vurdering:** Rapportens *kjernedata* (UAA-andel, biogass-volumer, HHI, øko-utnyttelse, matsvinn-volumer) er solid forankret i primærkilder (Eurostat, SSB, Jordbruksverket, IEA Bioenergy, SINTEF/FHF, Landbruksdirektoratet). Svakhetene konsentreres i (i) IFRO/KU 2025-referansen som er sentralt for CD-3 men mangler eksakt URL, (ii) Solar Foods/Enifer-VC-tall (USD 390M), (iii) Salling Group 2,8→1,8% som er hentet fra bærekraftsrapport uten direkte sidehenvisning, (iv) København 84%-tallet som lever på "verdikjede.ts DK" som sekundærkilde, (v) flere FI-tall (HVK 8,5 mnd, Konkurranseloven §4a aktiv anvendelse) der primærkilden er nevnt men ikke URL-bekreftet.

---

## Kritiske 🔴-flagg (må prioriteres i v1.2)

Disse er enten potensielt feilaktige tall, eller henvisninger som ikke holder ekstern kvalitetskontroll. Listen er strukturert etter risiko for at kritiker kan svekke rapporten.

| # | Påstand i HTML | Kritisk svakhet | Risiko |
|---|----|----|----|
| K1 | "IFRO & KU (2025): 1,2-1,7 mill t/år importert. **Kun 6% fysisk sporbar**" (CD-3, §2 DK, Foregangsområde 1) | Appendiks H lister "IFRO/KU 2025" uten eksakt rapporttittel + URL. Markert "Krever full URL-sjekk" i K-bibliotek. Sentralt for hele CD-3, Foregangsområde 1 og soya-vinklingen. | Høy — uten primærkilde-bekreftelse kollapser CD-3 dramatisk. |
| K2 | "Salling Group halvert butikk-matsvinn 2,8→1,8% på 9 år" (§2 DK, §4, Foregangsområde 2) | Appendiks oppgir "Salling Group bærekraftsrapport 2024" (https://sallinggroup.com/) men ingen sidereferanse eller direkte rapport-URL. Risiko at tallene er parafrase. | Høy — dette er hovedeksempelet i Foregangsområde 2. |
| K3 | "København 84% øko offentlig" (§1, §2 DK, §4, Foregangsområde 5) | Baseline.json oppgir "verdikjede.ts DK" (sekundær internkilde). Appendiks K har "Organic Denmark Market Report 2025" som mulig primær men uten direkte København-tall. Sørensen 2016 PhD nevnes i Foregangsområde 6 men er om "Public organic procurement" generelt, ikke 84%. | Høy — gjentas 5+ ganger; flaggskips-tallet for hele rapporten. |
| K4 | "FI Solar Foods/Enifer + USD 390M VC" (§1, §2 FI, §4, Foregangsområde 1) | Appendiks K har Solar Foods + Enifer URL, men USD 390M-tallet er referert til "agrifoodtech VC 2024" uten kilde-URL. Påstanden om "Finland 8. globalt" er heller ikke kilde-bekreftet. | Middels — men USD 390M er en spesifikk størrelse. |
| K5 | "FI 30%-regel aktivt anvendt mot S-Group og Kesko" (CD-4, §4, Foregangsområde 3) | Konkurranseloven §4a-URL finnes (finlex.fi), men "aktivt anvendt mot S-Group og Kesko" mangler case-bekreftelse. KKV-bot på Valio (EUR 600 000) er en annen sak. | Middels — kjernepåstand om håndhevings-effektivitet. |
| K6 | "DK 175 anlegg på husdyrgjødsel-input" (Foregangsområde 4) | IEA Bioenergy DK 2024 nevnes som kilde, men ingen direkte URL. Tallene "40% meieri + 30% svin" er heller ikke kilde-bekreftet. | Middels — kjernen i DK biogass-modellen. |
| K7 | "92% av fiskefôr-ingredienser importert" (CD-2, §2 NO, §4, Foregangsområde 1) | Nofima 2020 rapport eksisterer (nofima.com/results/salmon-feed-is-slowly-changing/), men 92%-tallet er fra 4 store fôraktører — ikke industri-totalt. Risikoen er at en streng kritiker kan kalle det "aktørdata, ikke bransjesnitt". | Middels — kommer i 4-5 ulike kontekster. |
| K8 | "FI husholdningsmatsvinn 22 kg/cap" (§1, CD-7, §2 FI, §4, Foregangsområde 2) | Luke-koordinert kilde, men appendiks oppgir kun "Luke (FI), stat.fi" generelt. Selv batch-2 sier "estimater varierer 400-641 kt etter metode" — som er bemerket i CD-7, men rapportens hovedformulering ("FI 22 kg/cap, lavest i Norden") fremstår som klippefast. Inkonsekvent presisjonsnivå. | Lav-Middels — brukt som benchmark. |
| K9 | "NO 89% utnyttelse av 1,094 mill t restråstoff... ~70 kt humant konsum" (CD-5, §2 NO, §4) | SINTEF/FHF 2024-rapport er primær (https://www.fhf.no/prosjekter/prosjektbasen/901844/), men appendiks oppgir at nedlastings-status ikke er bekreftet. Det viktige: rapportnummer 2025:00517 er gitt, men URL går til prosjekt-side, ikke direkte rapport-PDF. | Lav — 89% er konsistent med batch-data, men primærkilde-nedlasting bør gjøres. |
| K10 | "NO matsvinn -24% siden 2015 (detaljhandel -42%, mat-/serveringsbransjen har nådd 2025-mål -31%)" (§1, §2 NO, §4) | Matvett+NORSUS 2024 nevnes. Men husholdning-tallet "-5%" og "-18%" er motstridende mellom batch-2 (begge nevnt) og hovedrapport (kun -5% i Foregangsområde 2). Også: hovedrapport sier "matsvinnreduksjon -24%" generelt, batch-2 sier "73,4 kg/cap" — disse to står som faktum side om side uten å bekrefte de henger sammen metodisk. | Lav-Middels — hovedfunn i Foregangsområde 2 og hovedfunn-listen. |
| K11 | "Skretting 16,6% SPC i gjennomsnittlig fôr" / "FCR 1,15" (Foregangsområde 1, §2 NO) | FCR 1,15 er aktørdata fra Skretting/BioMar/Mowi, ikke industri-snitt. Påstanden i §1 hovedfunn ("verdens mest effektive laksefôr (FCR 1,15)") generaliserer aktørdata til industri. Skretting Impact Report 2024 har URL i appendiks K. | Lav — men strengt tatt en aktør-data-overgeneralisering. |
| K12 | "OECD PSE 59% NO" (CD-2 implisitt, §4) | OECD 2025 Producer Support Estimates nevnt i appendiks (https://www.oecd.org/), men ingen direkte URL til 2025-rapporten. 59% er spesifikk og lett å verifisere mot OECD. | Lav — kan styrkes raskt i v1.2 med direkte OECD URL. |

---

## Per seksjon

### §1 Sammendrag — hovedfunn og 5 fokusområder

| # | Påstand | Klass | Kilde | Anbefaling |
|---|---|---|---|---|
| 1.1 | "DK biogass 8 100 GWh, 17x NO" | ✅ | IEA Bioenergy DK 2024 (baseline + batch 3) | OK; URL bør legges til |
| 1.2 | "København 84%" | 🔴 | "verdikjede.ts DK" (intern sekundær) | K3 — finn primærkilde |
| 1.3 | "FI USD 390M VC + Solar Foods, Enifer" | 🔴 | Solar Foods URL OK; USD 390M uten kilde | K4 — finn agrifoodtech VC-database |
| 1.4 | "FI husholdningsmatsvinn 22 kg/cap" | 🟡 | Luke generelt | K8 — direkte stat.fi-URL |
| 1.5 | "FI 30%-regel" | ✅ | Finlex.fi (https://www.finlex.fi/fi/laki/ajantasa/2011/20110948) | OK |
| 1.6 | "NO matsvinn detaljhandel -42%" | ✅ | NORSUS/Matvett 2024 (norsus.no/prosjekt/matsvinn-2024/) | OK |
| 1.7 | "NO marin biomasse 1,094 mill t" | 🟡 | SINTEF/FHF 2024 — prosjekt-URL men ikke direkte rapport | K9 — laste ned PDF |
| 1.8 | "SE skolemåltids-tradisjon siden 1948" | 🟡 | Generelt akseptert; ingen direkte sitat-kilde i appendiks | Sterk historisk fakta — finn skolverket.se |
| 1.9 | "IS 100% Fish (cod 45→90%)" | 🟡 | Icelandic Ocean Cluster (sjavarklasinn.is) | Lokal aktør-side, ikke fagfellevurdert; aksepter |
| 1.10 | "SE UAA 16,7%" | ✅ | Eurostat ORG_CROPAR 2024 → 16,66% (rundet) | OK |
| 1.11 | "DK 11,6% retail value share" | ✅ | Statistics Denmark via Organic Denmark | OK |
| 1.12 | "SE øko-melk -39% siden 2021" | ✅ | Jordbruksverket Ekologisk animalieproduktion 2024 | OK |
| 1.13 | "NO selvforsyning 47%, korrigert 35%" | 🟡 | Regjeringen (47%) + NIBIO 2024 forel. (35%) | NIBIO 35% er "forel. 2024" — ikke endelige tall |
| 1.14 | "DK kun fysisk spore 6% av soya" | 🔴 | IFRO/KU 2025 — URL pending | K1 — kritisk |
| 1.15 | "NOK 4,9 mrd-bot" | ✅ | Konkurransetilsynet pressrelease aug 2024 | OK |
| 1.16 | "NO 89% restråstoff, 7% mat" | ✅ | SINTEF/FHF 2024 (rapport 2025:00517) | OK; PDF-nedlasting anbefalt |

### §2 Foregangsområder per land

| # | Påstand | Klass | Kilde | Anbefaling |
|---|---|---|---|---|
| 2.1 | "NO HHI 96,6% + HHI 3445" | ✅ | Dagligvaretilsynet → chart-metrics.json verifisert | OK; BeMerk: "HHI 96,6%" i §1 er feilaktig formulering — 96,6% er CR3, ikke HHI |
| 2.2 | "NO matsvinn-mål 2025 nådd (-31%)" | ✅ | Matvett+NORSUS 2024 | OK |
| 2.3 | "Kornax-mølla demontert april 2025" | ✅ | Iceland Review (icelandreview.com/business/iceland-loses-only-grain-mill/) | OK |
| 2.4 | "FI HVK kornberedskap (mål 8,5 mnd, 6 i dag)" | 🟡 | huoltovarmuuskeskus.fi/en/a/national-emergency-supply-agency-boosting-finlands-emergency-grain-stockpiles | OK; URL er gyldig |
| 2.5 | "FI selvforsyning 80%" | ✅ | Luke 2024 | OK |
| 2.6 | "DK 175 anlegg" | 🔴 | IEA Bioenergy DK 2024 — ingen direkte URL | K6 |
| 2.7 | "Verdens største per-cap havreprodusent (FI)" | 🔴 | Ikke kilde-belagt i appendiks | Mindre — finn FAOSTAT bekreftelse |
| 2.8 | "Salling Group 2,8→1,8% på 9 år" | 🔴 | sallinggroup.com — ingen direkte rapport-URL | K2 |
| 2.9 | "DK CO2-avgift jordbruk fra 2030 (300 DKK/t)" | ✅ | Skatteministeriet juni 2024 (skm.dk/aktuelt/presse/...) | OK |
| 2.10 | "NO 92% fiskefôr importert" | 🟡 | Nofima 2020 — gyldig URL men aktørdata | K7 |
| 2.11 | "FI grocery -5%" | ✅ | Pro Luomu 2024 | OK |
| 2.12 | "FI torvmyr-paradoks (11% areal = 50%+ klimagass)" | 🟡 | Implisitt; kilde ikke i hoved-appendiks | Bør finnes hos Luke/Syke |
| 2.13 | "SE rekordkornhøst 6,4 mill t" | ✅ | SCB | OK |
| 2.14 | "NO 1,094 mill t marint restråstoff" | ✅ | SINTEF/FHF 2024 | OK |
| 2.15 | "NO matsvinn 73,4 kg/cap" | ✅ | Matvett+NORSUS 2024 | OK |
| 2.16 | "SE øko-melk 295 200 t (2024)" | ✅ | Jordbruksverket | OK |
| 2.17 | "SE øko-egg 13% (laveste siden 2010)" | ✅ | Jordbruksverket | OK |
| 2.18 | "SE off. sektor 37→34,2%" | ✅ | Ekomatcentrum 2024 | OK |
| 2.19 | "SE HORECA 73→104 kt" | ✅ | IVL (SE) | OK; URL pending men kjent kilde |
| 2.20 | "SOU 2024:8 livsmedelsberedskap" | ✅ | regeringen.se SOU | OK |
| 2.21 | "DK 41% av gassforbruk biogass" | ✅ | IEA Bioenergy DK 2024 | OK |
| 2.22 | "DK 139 kg/cap matsvinn" | ✅ | DST | OK |
| 2.23 | "DK 1,2-1,7 mill t soya, 6% fysisk" | 🔴 | IFRO/KU 2025 | K1 |
| 2.24 | "DK CO2-avgift 60% basisfradrag" | 🟡 | Skatteministeriet aftale 2024 | OK; eksakt 60% bør bekreftes mot avtaletekst |
| 2.25 | "FI Konkurranseloven §4a 30%-regel" | ✅ | finlex.fi 20110948 | OK |
| 2.26 | "FI Solar Foods 160 t/yr Factory 01" | 🟡 | solarfoods.com (i appendiks) | OK; aktørside |
| 2.27 | "FI Enifer EUR 36M finansiering, EFSA okt 2024" | 🟡 | Aktørspesifikt | OK; aksepter aktørdata |
| 2.28 | "IS 100% Fish 45→90%" | 🟡 | Icelandic Ocean Cluster | OK; aktør-PR |
| 2.29 | "IS Marel-teknologi global ledende" | 🟡 | Markedsforskning, ikke direkte i appendiks | Mindre — bedrift-spesifikk men kjent |

### §3 Cognitive Dissonance (CD-1 til CD-7)

Behandlet i egen seksjon nedenfor.

### §4 Tverr-nordisk læring

| # | Påstand | Klass | Kilde | Anbefaling |
|---|---|---|---|---|
| 4.1 | "DK 8 100 GWh / NO 470 GWh, 17x" | ✅ | IEA Bioenergy DK + NORSUS NO | OK |
| 4.2 | "DK 20-års feed-in tariff biogass" | 🟡 | Generelt akseptert; ingen direkte URL | Finn Energistyrelsen DK |
| 4.3 | "Sørensen 2016 PhD om kjøkkenpersonell-opplæring" | 🟡 | Sørensen, N. (2016). PhD Aarhus. Avhandlings-URL ikke gitt | OK; en akademisk avhandling — kan finnes |
| 4.4 | "Nguyen/Hartmann 2024 master eiendomsklausuler" | 🟡 | Master-avhandling — appendiks G nevner CL-A-014 men ikke URL til Nguyen-arbeid | OK; akademisk |
| 4.5 | "FI HVK 9 mnd-mål" | 🟡 | huoltovarmuuskeskus.fi URL | OK; men "9 mnd" vs "8,5 mnd" i §2 — se konsistens-flagg D1 |

### §5 Fokusområder

Fokusområde 1 (fôr), 2 (matsvinn), 3 (konkurranse), 4 (biogass), 5 (økologisk) er behandlet i egen seksjon nedenfor.

### §6 Avgrensning mot Vision 2030

Vision 2030-indikator-IDene (1.4.2, 2.5.2 osv.) sjekkes mot research/norden/nordic-vision-2030-indicator-map-2026-04-29.csv (henvist i appendiks F men ikke verifisert direkte). De er strukturelle påstander om eget arbeid; lav risiko.

| # | Påstand | Klass |
|---|---|---|
| 6.1 | "5 indikatorer vi har sterk dekning på" | 🟡 — krysslinker mot CSV ikke verifisert i denne audit |
| 6.2 | "7 indikatorer vi gap mot" | 🟡 |

### §7 Datagaps og neste skritt

Disse er meta-påstander om eget kunnskapsnivå. ✅ direkte primær for FI fôr (A1), NO øko (A4), Soya-laundering (A5).

### §8 Metode

Selv-refererende; ikke en del av claim-audit.

---

## CD-cases — spesialfokus

| Case | Politisk påstand | Motstandsdata | Klass kjernedata | Klass implikasjon | Kommentar |
|---|---|---|---|---|---|
| **CD-1** NO øko tilbud-flaskehals | Generelt landbrukspolitisk argument (regjeringen.no, NHO, Bondelaget) | Landbruksdirektoratet 2026 rapport 2026/4 — sitat eksakt verifisert i A2 | ✅ direkte primær | ✅ god | Sterkeste case. Verifisert mot lokal kopi linje 117-118. |
| **CD-2** NO selvforsyning regnskapsfiksjon | Regjeringen Jordbruksoppgjøret 2024 (URL i appendiks) | NIBIO 2024 forel. (35%) + Nofima 2020 (92%) | 🟡 sekundær | ✅ god | NIBIO 2024 "forel." — endelige tall mangler. Påstand står bra, men presisjon kan styrkes. |
| **CD-3** DK 6% sporbarhet + NO EUDR-unntak | "DK soya er sertifisert avskogingsfri" — generelt | IFRO/KU 2025 (URL pending) + EUDR Reg 2023/1115 ✅ | 🔴 svak | ✅ god | **Mest sårbare case**. Hele 6%-tallet hviler på en kilde uten direkte URL. |
| **CD-4** NOK 4,9 mrd-bot endret ikke struktur | "NO har Nordens sterkeste konkurransehåndheving" | Konkurransetilsynet pressrelease 2024 ✅ + HHI 3445 ✅ | ✅ direkte primær | ✅ god | Forfattermessig sterk. Implikasjonen ("FI 30%-regel som forebyggende") henger på K5. |
| **CD-5** NO 89% restråstoff, 7% mat | "Norge er nordisk leder på sjømat-sirkularitet" | SINTEF/FHF 2024 rapport 2025:00517 | 🟡 sekundær (URL går til prosjekt) | ✅ god | Krever PDF-nedlasting for å være ✅. |
| **CD-6** SE øko-leder fallende | Generelt akseptert "SE er øko-leder" | Jordbruksverket 2025 + Ekologiska Årsrapporten 2024 + Ekomatcentrum 2024 | ✅ direkte primær | ✅ god | Multi-kilde-validert. |
| **CD-7** FI-DK 6x matsvinn forskjell | "Alle nordiske jobber mot SDG 12.3" | Luke + DST + Naturvårdsverket + IVL + TemaNord 2021:504 | 🟡 sekundær | ✅ god | Mange kilder nevnt, men ingen enkelt verifisert med direkte URL. Samtidig korrekt i sin "definisjonsforskjell"-tolkning. |

### Spesielt om CD-3 (mest kritisk)

CD-3 er rapportens mest publiserings-sårbare påstand:
- "**Kun 6% fysisk sporbar**" er presis, kvantifisert, og dramatisk
- Kilde: "IFRO & Københavns Universitet. (2025). *Sporbarhet av dansk soya-import: 2024-analyse*. (Krever full URL-sjekk)"
- Appendiks K markerer eksplisitt: "(Krever full sjekk av eksakt tittel — primærsjekk gjenstår)"
- A5-research (linje 80) sier også: "IFRO/KU 2025-rapport: finn eksakt tittel og sidetall (sekundærkilde via claim-register CL-A-014)"
- **Risiko**: Hvis IFRO/KU 2025 viser seg å ikke eksistere eller å si noe annet, faller hele CD-3 narrativ.

**v1.2-prioritet 1**: Verifiser IFRO/KU 2025-publikasjonen mot ifro.ku.dk eller research.ku.dk.

---

## Foregangsområder — spesialfokus

| Område | Hovedtall | Kilde-styrke | Politisk lett? | Kommentar |
|---|---|---|---|---|
| **1. Importert fôr** (Score 11/12) | NO 92% imp; DK 1,2-1,7 mill t (6%); FI USD 390M VC; Valio soya-fase 2018-19 | 🟡 blandet — Valio ✅, IFRO 🔴, Solar Foods 🟡 | Middels | Foregangsområde-status henger på K1 og K4. |
| **2. Matsvinn** (11/12) | FI 22, NO 42, DK 41, SE 35 kg/cap; Salling 2,8→1,8% | 🟡 — kg/cap ✅, Salling 🔴 | Lett | Salling-modellen K2 må styrkes. |
| **3. Strukturell konkurranse-terskel** (11/12) | NO HHI 3445, CR3 96,6%; FI 30%-regel; DK call-in | ✅ — HHI ✅, FI lov ✅ | Vanskelig | Hovedanbefaling solid forankret. K5 (aktiv anvendelse) bør styrkes. |
| **4. Biogass DK-modell** (10/12) | DK 8 100 GWh, 175 anlegg, 41%, mål 100% i 2030; NO 470 GWh; FiT 20 år | ✅ — biogass-volumer ✅; FiT 20 år 🟡 | Middels | Solid; FiT-konstruksjonens detaljer (K6) kan strammes. |
| **5. Økologisk** (10/12) | NO Landbruksdirektoratet 2026; SE -39%; DK 11,6%; København 84% | 🟡 — alle tall ✅ utenom København 84% (K3) | Lett | København-sirkulasjonsdata bør styrkes. |

---

## Konsistens-flagg (interne motsigelser i HTML-rapport)

Disse er flagget IKKE som kilde-svakhet, men som inkonsistens internt:

| # | Beskrivelse |
|---|---|
| **D1** | Hovedfunn (§1) sier "FI HVK kornberedskap (mål 8,5 mnd)". §4 sier "FI HVK 9 mnd-mål". Batch-8 oppgir "9 mnd MÅL, 6 i dag". Dette krever konsistensfix — er målet 8,5 eller 9 måneder? Baseline.json: "8,5 mnd ekstrainnkjøp". Sett til 8,5 eller forklar diskrepans. |
| **D2** | "NO HHI 96,6%" i hovedrapport-konklusjon (§1 hovedfunn linje 209) er feilaktig — 96,6% er CR3, og HHI er 3445. Bør fikses i §1: "HHI 3445 (CR3 96,6%)". |
| **D3** | "København 84%" (§1) vs "DK København 84% øko offentlig" (§2 DK) vs "DK København (84%)" (§4) — konsistent tall, men varierende kontekst (storby? 900 kjøkken? sektor-mål?). |
| **D4** | NO matsvinn husholdning: §1 sier "husholdning -5 til -18%" implisitt; §3 CD-7 sier "SE 84 kg/cap, total 880 000 t — STAGNERT siden 2020"; §5 Foregangsområde 2 sier "husholdning -5%, primærleddet ekskludert"; batch-2 sier "-5 til -18%". Konsistens-fix: gi én verdi med metode-note. |
| **D5** | "FCR 1,15" formuleres ulikt: §1 "verdens mest effektive laksefôr" (generaliserer aktør til industri); §2 NO mer presist "verdens beste"; batch-1 noterer at 1,15 er aktørdata. Bør strammes opp i §1. |
| **D6** | "FI 30%-regel siden 2014" — Konkurranseloven §4a (Finlex). Riktig år, men formuleringen "siden 2014 hatt en unik regel" er bekreftet via finlex.fi 20110948. ✅ |
| **D7** | "Bunnpris 6,6%" (batch-7) vs ikke nevnt i hovedrapport — mindre. |

---

## Anbefalte tiltak for v1.2

Strukturert etter prioritet (P1 = må gjøres for v1.2-publisering, P2 = ønskelig, P3 = nice-to-have).

### P1 — Kritiske kildebekreftelser (ca 4-8 timer)

1. **K1 — IFRO/KU 2025 soya-sporbarhet**: Søk ifro.ku.dk og forskningsdatabaser for eksakt rapport. Hvis ikke funnet, omformuler CD-3 til "studier indikerer ~6%, krever bekreftelse" og nedgrader til 🟡.
2. **K2 — Salling Group 2,8→1,8%**: Gå inn i sallinggroup.com bærekraftsrapport 2024, hent eksakt sidetall + lenke. Eventuelt CSR-rapport 2015 + 2024 sammenlikning.
3. **K3 — København 84%**: Finn primærkilde — sannsynligvis Københavns Madhus (kbhmadhus.dk) eller kommune-rapport. "verdikjede.ts DK" er internkilde, ikke aksepterbar.
4. **K4 — USD 390M VC**: Finn agrifoodtech-database eller AgFunder-rapport. Hvis 390M ikke kan bekreftes, fjern presisjonen og si "trecifret million USD".
5. **K7 — 92% fiskefôr-import**: Hent Nofima-rapport-PDF, verifiser om 92% er "store 4 aktørers gjennomsnitt" eller "industri-totalt". Tilpass formulering.
6. **K9 — SINTEF/FHF 2024 rapport-PDF**: Last ned faktisk rapport 2025:00517, ikke bare prosjektside.

### P2 — Konsistens-fix (ca 2-3 timer)

7. **D2** — Fiks "HHI 96,6%" til "HHI 3445 (CR3 96,6%)" i §1 hovedfunn.
8. **D1** — Standardiser FI HVK kornlager-mål til 8,5 mnd gjennomgående, eller 9 mnd, med metode-note.
9. **D4** — Standardiser NO matsvinn-husholdning til ett tall + metode-note.
10. **D5** — Strammere formulering om FCR 1,15 (aktørdata, ikke industri-snitt).

### P3 — Styrking (ca 4-6 timer)

11. **K5 — FI 30%-regel aktiv anvendelse**: Finn KKV-saker mot S-Group/Kesko (separat fra Valio-bot).
12. **K6 — DK biogass 175 anlegg, 40% meieri / 30% svin**: Hent IEA Bioenergy DK 2024-rapport-PDF.
13. **K8 — FI 22 kg/cap matsvinn**: Direkte stat.fi-URL.
14. **K11 — FCR 1,15** kontekstualisert som "Skretting/BioMar/Mowi-aktørdata, ikke industri-snitt".
15. **K12 — OECD PSE 59% NO**: Direkte URL til 2025-rapporten.
16. **6.1, 6.2** — Verifiser Vision 2030-indikator-IDer mot research/norden/nordic-vision-2030-indicator-map-2026-04-29.csv

### P4 — Flagging av kontroversielle påstander (ingen ny kildejakt nødvendig)

17. Eksplisitt notere i §3 at CD-3 er "den mest sårbare cognitive dissonance", med forklaring at hvis IFRO/KU 2025 ikke holder kvalitetskontroll, må CD-3 nedgraderes.
18. Bedre disclaimer på §2 NO: "92% fiskefôr importert (Nofima 2020 — fra 4 store fôraktører)".

---

## Konklusjon

Rapporten er substansielt solid forankret — kjernedata-grunnlaget (HHI, UAA-andel, øko-utnyttelse, biogass-volumer, matsvinn-volumer, selvforsyningstall, EUDR-paragrafer, Konkurranseloven §4a) er primærkildebelagt. **Hovedrisikoen er konsentrert i seks distinkte 🔴-flagg (K1, K2, K3, K4, K6, K7)** som alle kan løses med 4-8 timer fokusert kildebekreftelses-arbeid.

Den mest publiserings-sårbare påstanden er **CD-3** (DK 6% sporbarhet via IFRO/KU 2025), og den bør være første prioritet i v1.2.

CD-cases er generelt sterkere kildebelagt enn enkelttall (4 av 7 ✅, 2 🟡, 1 🔴). De fem foregangsområdene er solide i sin metodikk men har 🔴-flagg i nøkkeleksempler (Salling, København 84%, Solar Foods VC).

**Konfidensnivå for hovedrapport som leveranse til Jan Thomas / TG**: Høy for analyse, middels for tall-presisjon. Bør publiseres som "v1.1" med eksplisitt v1.2-arbeidsliste.
