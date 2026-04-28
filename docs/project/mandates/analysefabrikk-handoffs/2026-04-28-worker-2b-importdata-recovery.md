---
tittel: Worker 2B recovery - A-importdata
status: Utført internt
eier: Master recovery
dato: 2026-04-28
neste_handling: Mini-verifikasjon og deretter master-merge kun av funn med tydelig kilde.
---

# Worker 2B recovery - A-importdata

Recovery etter manglende 2B-handoff. Dette er ikke ekstern validering. Kilder fra Perplexity/forskningsrunde brukes bare som kildejakt; funn under er vurdert mot primær-/institusjonskilder der det var mulig.

## Kort konklusjon

1. Det finnes citation-ready tall for norsk oppdrettsfôrvolum 2020-2024 fra Fiskeridirektoratets `Nøkkeltall fra norsk havbruksnæring 2024`, tabell 43, kilde Sjømat Norge.
2. Det finnes actor-primary tall for Denofa: ca. 450 000 tonn soyabønner årlig til Fredrikstad, med Brasil som hovedkilde og Canada/USA som tillegg.
3. Skretting Norge gir citation-ready aktørdata for SPC-andel i eget fiskefôr og sertifiseringsstatus, men dette må ikke presenteres som hele norsk næring.
4. EUMOFA 2025 gir solid EU/global fiskemel-kontekst og viser at fiskemel i økende grad går til akvakultur; dette er bedre enn L4-fiskemelnotatet for beslutningsgrunnlag.
5. EUDR er en sterk compliance-driver for soya, men norsk/EØS-praktisering og produktscope må holdes som `needs-primary-check` for norske aktører.

## Source cards

| Recovery SRC | Foreslått canonical SRC | Kilde | Type | Bruk | Status |
|---|---|---|---|---|---|
| W2B-SRC-001 | SRC-A-013 | Denofa, `https://www.denofa.no/soya/` og `https://www.denofa.no/soya/produkter/` | aktør-primær | Denofa importerer ca. 450 000 tonn soyabønner årlig; soyabønner foredles til mel, olje og lecitin; hovedvolum brukes til fôr. | integrer nå med actor-forbehold |
| W2B-SRC-002 | SRC-A-014 | Fiskeridirektoratet, `Nøkkeltall fra norsk havbruksnæring 2024`, tabell 43, `https://www.fiskeridir.no/statistikk-tall-og-analyse/data-og-statistikk-om-akvakultur/statistiske-publikasjon-innen-akvakultur` | offentlig statistikk / institusjonsrapport | Omsetning av fôr i oppdrettsnæringen 2020-2024, tall i tonn, kilde Sjømat Norge. | integrer nå |
| W2B-SRC-003 | SRC-A-015 | Skretting Norway Impact Report 2024, `Use of vegetable raw materials 2024`, `https://www.skretting.com/no/baerekraft/baerekraftsrapport/impact-report-2024-skretting-norway/use-of-vegetable-raw-materials-2024/` | aktør-primær | SPC-andel, vegetabilske/marine råvarer, sertifiseringsstatus og opprinnelse for Skretting Norges fôrråvarer. | integrer nå med actor-forbehold |
| W2B-SRC-004 | SRC-A-016 | EUMOFA, `Fishmeal and fish oil - 2025 Edition`, `https://eumofa.eu/fishmeal-and-fish-oil-2025-edition` | EU/sekundær-offentlig | Global/EU fiskemelproduksjon, EU-import, Danmark som EU-produsent, akvakulturandel i fiskemelbruk. | integrer nå |
| W2B-SRC-005 | SRC-C-018 | EU Commission EUDR page + Landbruksdirektoratet EUDR-sider | regulatorisk primær/forvaltningskilde | EUDR dekker soya og setter aktsomhets-/sporbarhetskrav; EU-frister oppdatert til 30.12.2026/30.06.2027. | integrer nå for EU; Norge needs-primary-check |

## Tallregister

| Tall | Definisjon | År | Geografi | Enhet | Kilde | Status |
|---|---|---:|---|---|---|---|
| 450 000 | Soyabønner importert årlig til Denofas anlegg i Fredrikstad | udatert/årlig, nettside lest 2026-04-28 | Norge/Fredrikstad | tonn soyabønner/år | W2B-SRC-001 | citation-ready som actor-tall; ikke offisiell handelsstatistikk |
| ca. 80 % Brasil / ca. 20 % Canada+USA | Opprinnelse for Denofas soyabønner på norsk nettside | udatert/årlig | Norge/import | prosent av Denofa-soyabønner | W2B-SRC-001 | citation-ready som actor-tall; engelske side oppgir bredere 60-80/20-40 |
| 2 185 945 | Omsetning av fôr i oppdrettsnæringen | 2024 | Norge | tonn fôr | W2B-SRC-002, tabell 43, s. 29 | citation-ready |
| 2 210 779 | Omsetning av fôr i oppdrettsnæringen | 2023 | Norge | tonn fôr | W2B-SRC-002, tabell 43, s. 29 | citation-ready |
| 2 179 812 | Omsetning av fôr i oppdrettsnæringen | 2022 | Norge | tonn fôr | W2B-SRC-002, tabell 43, s. 29 | citation-ready |
| 2 193 053 | Omsetning av fôr i oppdrettsnæringen | 2021 | Norge | tonn fôr | W2B-SRC-002, tabell 43, s. 29 | citation-ready |
| 1 989 103 | Omsetning av fôr i oppdrettsnæringen | 2020 | Norge | tonn fôr | W2B-SRC-002, tabell 43, s. 29 | citation-ready |
| 1 665 000 | Solgt mengde oppdrettsfisk | 2024 | Norge | tonn fisk | Fiskeridirektoratet nyhet/statistikk 2024 | citation-ready for produksjonskontekst |
| 1 553 000 | Solgt mengde laks | 2024 | Norge | tonn laks | Fiskeridirektoratet nyhet/statistikk 2024 | citation-ready for produksjonskontekst |
| 16,6 % | Soy protein concentrate i Skretting Norges gjennomsnittlige fôrsammensetning | 2024 | Skretting Norge | prosent av 1 kg fiskefôr | W2B-SRC-003 | citation-ready som Skretting-tall; ikke bransjetall |
| 71,3 % | Vegetabilske råvarer i Skretting Norges gjennomsnittlige fôr | 2024 | Skretting Norge | prosent av 1 kg fiskefôr | W2B-SRC-003 | actor-tall |
| 24,6 % | Marine råvarer i Skretting Norges gjennomsnittlige fôr | 2024 | Skretting Norge | prosent av 1 kg fiskefôr | W2B-SRC-003 | actor-tall |
| 53,5 % ProTerra / 46,5 % Europe Soya | Skretting Norges sertifiseringsstatus for SPC | 2024 | Skretting Norge | prosent av SPC | W2B-SRC-003 | actor-tall |
| 5,1 mill. | Gjennomsnittlig global fiskemelproduksjon siste 10 år | ca. 2015-2024 | Globalt | tonn fiskemel/år | W2B-SRC-004, summary s. 2 | citation-ready |
| 370 000-520 000 | EU fiskemelproduksjon | siste 10 år | EU | tonn fiskemel/år | W2B-SRC-004, summary s. 2 | citation-ready |
| 35-50 % | Danmarks andel av EU fiskemelproduksjon | årlig variasjon | EU/Danmark | prosent av EU-produksjon | W2B-SRC-004, summary s. 2 | citation-ready |
| 92 % | Andel global fiskemelbruk som gikk til akvakultur | 2023 | Globalt | prosent | W2B-SRC-004, kap. 3.1, s. 11 | citation-ready |
| 16 % | Andel av akvakulturens fiskemelbruk som gikk til laks/ørret | 2023 | Globalt | prosent | W2B-SRC-004, kap. 3.1, s. 11 | citation-ready |

## Skille mellom råvarekategorier

| Kategori | Status i recovery | Kommentar |
|---|---|---|
| Soyabønner | Delvis citation-ready | Denofa gir klare actor-tall. SSB/HS-serie per år må hentes før total norsk handelsserie brukes eksternt. |
| Soyamel/oljekake | needs-primary-check | Denofa beskriver foredling til mel, men recovery låser ikke offisiell årlig mengde soyamel. |
| Soyaproteinkonsentrat (SPC) | Delvis citation-ready | Skretting gir egen SPC-andel og sertifisering; hele norsk bransje krever flere fôraktører eller bransjedata. |
| Kraftfôr | needs-primary-check | Animalia/Felleskjøpet/SSB må brukes før kraftfôrfordeling eller husdyrandel tallfestes. |
| Laksefôr/oppdrettsfôr | citation-ready for total oppdrettsfôr | Fiskeridirektoratet/Sjømat Norge gir total omsetning av fôr i oppdrettsnæringen, ikke bare laks. |
| Fiskemel | citation-ready for global/EU kontekst | EUMOFA gir solid kontekst; norsk import/bruk per land/aktør må hentes fra handelsstatistikk eller fôraktører. |

## Claim-effekt

| Claim | Effekt | Vurdering |
|---|---|---|
| CL-A-001 | styrker kontekst, ikke forsøksclaim | Stor oppdrettsfôrbase og SPC-bruk gjør soyasubstitusjon beslutningsrelevant, men teknisk forsøksclaim står fortsatt på NMBU/Foods of Norway. |
| CL-A-002 | styrker kontekst | Denofa/Skretting/Fiskeridirektoratet viser hvorfor gjær-/encelleprotein må vurderes mot faktisk fôrvolum og råvarekrav. |
| CL-A-020 | styrker | Recovery gir bedre volum- og råvarekontekst for importsubstitusjon i laksefôr/oppdrettsfôr. |
| CL-C-011 | styrker og oppdaterer | EUDR gjør soyaimport til compliance-/sporbarhetsspørsmål; EU-frister er oppdatert, men norsk/EØS-scope må primærsjekkes. |

## Røde flagg

1. Ikke bruk L4-estimatet `550-600 000 tonn norsk soyaimport` eksternt før SSB/HS-serie er hentet.
2. Ikke fordel norsk soya mellom Skretting/Cargill/Felleskjøpet uten aktørdata; det er en modell/hypotese.
3. Ikke bruk Skretting-sammensetning som proxy for hele norsk laksefôrmarked uten BioMar, Cargill og Mowi.
4. Ikke si at EUDR gjelder Norge med samme praktiske krav som EU uten oppdatert norsk forskrift/EØS-sjekk.
5. Fiskemeldata fra EUMOFA gir global/EU kontekst, men ikke full nordisk importserie eller norsk aktørfordeling.
