# R12-RES-003 - Kritiske importnoder Norge

**Dato:** 2026-06-25  
**Status:** Batch 07 output - underlag, ikke claim  
**Gate:** PCQ  
**Beslutning:** enrich

## Kort dom
Importavhengigheten for de seks nodene er godt dokumentert kvalitativt, men presise, ferske volumtall fra norsk primaerkilde varierer sterkt i kvalitet. SSB statbank 08801 (Utenrikshandel med varer, etter varenummer HS og land, 1988-2024) er bekreftet som primaerunivers og kan i prinsippet gi realisert importvolum per HS-nummer per land for alle nodene - men jeg har i denne sesjonen ikke kjoert konkrete PxWeb-uttak per HS-kode, saa de spesifikke tonn-tallene under stammer fra aktoer-/SSB-artikkel-kilder og maa klasses deretter. Kaffe, soya og fiskefor-sammensetning har solide, citerbare tall; fosfat-importvolum og forprotein-totalvolum (ekskl. soya) er svakest dekket og delvis tomme celler.

## Sterkeste kilde
- **SSB statbank 08801** - Utenrikshandel med varer, etter varenummer (HS) og land 1988-2024. Primaer registerunivers for alle realiserte importvolum per HS-nummer/land. Lokator: https://www.ssb.no/statbank/table/08801/ (bekreftet eksisterer; ikke kjoert konkret HS-uttak denne sesjonen)
- **SSB Utenrikshandel med varer (statistikkside)** - bekreftet at HS/SITC dekker kaffe/kakao (SITC 07), oljefro (SITC 22), gjodsel (SITC 56). Lokator: https://www.ssb.no/utenriksokonomi/utenrikshandel/statistikk/utenrikshandel-med-varer
- **Denofa - Soya** (aktoer, primaer for egen import): ca. 450 000 tonn soyabonner/aar, ~80 % Brasil, ~20 % Canada/USA. Lokator: https://www.denofa.no/soya/
- **Animalia - Import av ravarer til kraftfor** (bransjeorgan): soyaandel i kraftfor totalt ~5,8 %; ~30 % av importert soya til husdyrfor, resten til fiskefor. Lokator: https://www.animalia.no/no/samfunn/hva-spiser-husdyra/import-av-ravarer-til-kraftfor/
- **SSB - "Uten kaffe stopper Norge"** (SSB-artikkel): ~40 000 tonn kaffe/aar. Lokator: https://www.ssb.no/utenriksokonomi/artikler-og-publikasjoner/uten-kaffe-stopper-norge

## Funn-tabell
| Felt | Indikator/aktor/land | Ar/periode | Lokator | Kildeklasse | Status | Caveat |
|---|---|---:|---|---|---|---|
| Fosfat | Norge har ingen mineralfosfat-ressurser; jordbruk avhengig av import av fosfatmineral/mineralgjodsel | 2017 | https://www.miljodirektoratet.no/globalassets/publikasjoner/m846/m846.pdf | B | hypotese/kvalitativ | Kvalitativ avhengighet bekreftet (Miljodir.), men ingen norsk import-tonn hentet; fosfor-gjenvinningspotensial 28 100 tonn/aar nevnt, IKKE importvolum |
| Fosfat | Importvolum fosfat/fosforgjodsel til Norge (tonn/aar, HS 2510/3103/3105) | - | (SSB 08801, ikke uttatt) | C | tom celle | Ikke kjoert PxWeb-uttak; HS-koder for raafosfat/fosfatgjodsel finnes i 08801, men volum ikke verifisert denne sesjonen |
| Forprotein | Soyaandel i kraftfor totalt Norge ~5,8 %; ~30 % av importert soya til husdyrfor | udatert (naatid) | https://www.animalia.no/no/samfunn/hva-spiser-husdyra/import-av-ravarer-til-kraftfor/ | B | realisert (andel) | Bransjeorgan; andeler, ikke tonn; aar ikke spesifisert i kilden |
| Forprotein | Totalt importvolum proteinravarer (raps, erter, mais m.m. ekskl. soya) til norsk kraftfor (tonn) | - | (ikke funnet primaer) | C | tom celle | Krever Landbruksdirektoratet/Felleskjopet-data eller SSB HS-uttak; ikke hentet |
| Fiskeolje | Laksefor 2020: 10,3 % fiskeolje; 92 % av forets ingredienser importert, Norge leverte kun fiskemel+fiskeolje | 2020 | https://www.fhf.no/prosjekter/prosjektbasen/901604/ (FHF Ressursregnskap 2020) | B | realisert (andel) | Andel av forsammensetning, ikke importtonn for fiskeolje isolert; FHF/sekundaert referert via soksetreff, rapport-PDF ikke direkte fetchet |
| Fiskeolje | Importvolum fiskeolje til Norge (tonn/aar, HS 1504) | - | (SSB 08801, ikke uttatt) | C | tom celle | Ikke verifisert; finnes i HS 1504 i 08801 |
| Soya | Denofa importerer ca. 450 000 tonn soyabonner/aar; ~80 % Brasil, ~20 % Canada/USA | udatert (naatid) | https://www.denofa.no/soya/ | B | realisert volum (aktor) | Aktoer-tall (Denofa, dominerende importor); IKKE total nasjonal soyaimport - andre importorer kan finnes; aar ikke spesifisert |
| Soya | Soyaproteinkonsentrat 20,9 % av norsk laksefor 2020 (viktigste enkeltravare) | 2020 | https://www.fhf.no/prosjekter/prosjektbasen/901604/ | B | realisert (andel) | Andel, ikke tonn; via soksetreff/Ruralis-referat, ikke direkte rapport-fetch |
| Kaffe | Norge importerer ~40 000 tonn kaffe/aar (~40 500 tonn snitt siste 10 aar) | 2010 / ~2008-2018 | https://www.ssb.no/utenriksokonomi/artikler-og-publikasjoner/uten-kaffe-stopper-norge | B | realisert volum | SSB-artikkel (B, ikke statbank-uttak). 2010-tall; "siste 10 aar"-snitt fra annen SSB-artikkel ikke direkte fetchet. Brasil ~50 % av uroestet, Sverige ~53 % av brent |
| Kaffe | Praesist aarlig importvolum kaffe (HS 0901) per land, ferskt aar | - | (SSB 08801, ikke uttatt) | C | tom celle | Statbank-uttak gir dette; ikke kjoert denne sesjonen |
| Kakao | Kakaoforbruk Norge ~34,3 mill. kg (2019-2021); importverdi ~2,5 mrd. kr (2021) | 2019-2021 | https://www.ssb.no/utenriksokonomi/utenrikshandel/statistikk/utenrikshandel-med-varer | C | realisert (delvis) | Tall fra soksesammendrag av SSB-tabeller (SITC 07), IKKE direkte verifisert i denne sesjonen; forbruk != import; opphavsland ikke hentet |
| Kakao | Praesist importvolum kakao (HS 1801/1806) per land | - | (SSB 08801, ikke uttatt) | C | tom celle | Statbank-uttak gir dette; ikke kjoert |

## Tomme celler
- **Fosfat importvolum (tonn):** ingen norsk primaer-serie hentet. Kvalitativ avhengighet (Norge har ingen egen mineralfosfat, EU snart avhengig av Marokko) er dokumentert, men tonn-tall krever SSB 08801 HS-uttak (HS 2510 raafosfat, 3103/3105 fosfatgjodsel). Ikke offentlig brutt ut per node uten egen kjoring.
- **Forprotein-total ekskl. soya:** ingen samlet offentlig tonn-serie for importerte proteinravarer (raps, erter, mais, mv.) til norsk kraftfor funnet; krever Landbruksdirektoratet/Felleskjopet eller HS-uttak.
- **Fiskeolje isolert importtonn:** kun forsammensetnings-andel funnet (FHF 2020). Importtonn for HS 1504 ikke verifisert.
- **Aktortilgang:** total nasjonal soyaimport (utover Denofa) og praesis fordeling kraftfor vs. fiskefor krever aktordata (Denofa, Felleskjopet, forprodusenter) eller SSB-uttak.
- **Ferske aar:** flere tall er 2010 (kaffe) / 2020 (fiskefor) / 2019-2021 (kakao). Oppdaterte 2023-2024-serier krever direkte statbank-uttak (08801 dekker t.o.m. 2024).

## Ikke si
- IKKE gjor sekundaer speilkilde til primaer: Comtrade/Comtrade-mirror og soksesammendrag av SSB er IKKE primaerkilde - bare et faktisk PxWeb-uttak fra SSB 08801 (eller direkte fetchet SSB-tabell) teller som primaer (A) for et tonn-tall.
- IKKE oppgi Denofas 450 000 tonn som "Norges totale soyaimport" - det er aktorens egen import (dominerende, men ikke definert som totalen i kilden).
- IKKE behandle kakao-tallene (34,3 mill. kg / 2,5 mrd. kr) som verifisert - de stammer fra soksesammendrag, ikke et fetchet SSB-uttak, og forbruk er ikke det samme som import.
- IKKE blande andel (%) av for-sammensetning med importvolum (tonn) - fiskeolje 10,3 % og soya 5,8 % er andeler, ikke mengder.
- IKKE oppgi fosfor-gjenvinningspotensial (28 100 tonn) som importvolum - det er resirkuleringspotensial, motsatt storrelse.

## Anbefalt gate
PCQ. Importer som underlag med alle tonn-tall flagget B/C; for ekstern bruk maa hver node oppgraderes til A via konkret SSB 08801 PxWeb-uttak per HS-kode (fosfat 2510/3103/3105, fiskeolje 1504, soya 1201/2304, kaffe 0901, kakao 1801/1806) med Comtrade kun som sekundaer kryssjekk.
