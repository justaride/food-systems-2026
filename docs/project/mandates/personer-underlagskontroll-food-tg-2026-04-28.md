---
tittel: "Personer underlagskontroll - Food TG"
status: Utført internt
eier: Gabriel
sist_oppdatert: 2026-04-28
neste_handling: Kjør raadokument/NER-pass for personnavn som ikke ligger i strukturerte PersonProfile-, BoardMember- eller ActorContact-data.
relaterte_filer:
  - scripts/audit-person-underlag.ts
  - research/_status/personer-underlagskontroll-2026-04-28.json
  - src/lib/queries/persons.ts
  - src/app/personer/PersonerContent.tsx
---

# Personer underlagskontroll - Food TG

## Konklusjon

Strukturert personunderlag er representert på personsiden: alle `1286` unike personer fra `BoardMember` finnes i den sammenslåtte `/personer`-visningen, og alle `1654` styre-/lederroller er dekket på visningsnivå etter samme merge-logikk som appen bruker.

Tallene på personsiden er bekreftet mot forventning: `1486` personer, `2472` roller og `592` interlocking-personer. Dette bekrefter dekning for de strukturerte underlagene, men ikke at alle personnavn som finnes i fritekst/PDF/rånotater er løftet inn. Det siste krever et eget NER-/rådokumentpass.

## Workflow-sjekk

| Gate | Status | Resultat |
|---|---:|---|
| Forventede sidetall | PASS | 1486/1486 personer, 2472/2472 roller, 592/592 interlocking |
| Alle BoardMember-personer på siden | PASS | 1286 unike board-personer |
| Alle BoardMember-roller på siden | PASS | 0 mangler på visningsnivå |
| BoardMember-roller beholder companyId | WARN | 71 mangler på strict companyId-sjekk |
| PersonProfile roles kan parses | PASS | 0 ugyldige role entries |

## Tellegrunnlag

| Metrikk | Antall | Notat |
| --- | --- | --- |
| PersonProfile | 1307 | Manuelt eller auto-opprettet profilrad |
| BoardMember | 1654 | Rå styre-/lederroller |
| Unike BoardMember-personer | 1286 | Fallback-grunnlag for personsiden |
| Personer på /personer | 1486 | PersonProfile + BoardMember fallback |
| Roller på /personer | 2472 | Dedupet per person, selskap og rollelabel |
| Interlocking på /personer | 592 | Personer med mer enn én rolle |
| ActorContact | 17 | Kontaktpersoner i actor-modellen, separat fra /personer |
| Meeting | 8 | Møteunderlag med participants[] |

## Dekningssplit

| Kategori | Antall | Andel av /personer |
| --- | --- | --- |
| Profil + board-fallback | 1107 | 74.5% |
| Kun PersonProfile | 200 | 13.5% |
| Kun BoardMember fallback | 179 | 12.0% |
| Kun fallback og interlocking | 1 | 0.1% |

## Detaljdekning

| Detaljfelt | Dekket | Andel av /personer |
| --- | --- | --- |
| Biography | 80 | 5.4% |
| LinkedIn URL | 0 | 0.0% |
| Photo URL | 0 | 0.0% |
| Affiliations | 1249 | 84.1% |
| Tags | 1486 | 100.0% |

## Funn som må håndteres

- `555` interlocking-personer mangler biography og/eller affiliations. De er dekket som personer/roller, men ikke ferdig detaljerte profiler.
- `130` lagrede PersonProfile-roller mangler `companyId`. Dette er ikke en referansefeil, men bør ryddes der selskapet finnes i databasen.
- `71` BoardMember-roller mangler strict `companyId`-match i den sammenslåtte visningen. De er dekket på visningsnivå, men peker på dupliserte selskapsrader med samme navn.
- `0` dupliserte BoardMember person/selskap/rolle-kombinasjoner ble funnet.
- `0` mulige navnesplitt-grupper ble funnet med løs norsk/ascii-normalisering. Disse bør manuelt sjekkes før vi sier at persondeduplisering er helt ren.
- `16` ActorContact-navn finnes ikke på personsiden. Dette kan være riktig modellskille, men må avklares hvis /personer skal være total personkatalog.

## Eksempler til manuell sjekk

### Interlocking med detaljgap

- Ole Robert Reitan (ole-robert-reitan) - 16 roller; mangler biography: nei, affiliations: ja
- Helge Christian Haugen (helge-christian-haugen) - 12 roller; mangler biography: ja, affiliations: nei
- Bjørn Strand (bjorn-strand) - 11 roller; mangler biography: ja, affiliations: nei
- Stig Børger Bratlie (stig-borger-bratlie) - 10 roller; mangler biography: ja, affiliations: nei
- Jarle Gjerde (jarle-gjerde) - 8 roller; mangler biography: ja, affiliations: nei
- Kristin Solheim Genton (kristin-solheim-genton) - 8 roller; mangler biography: ja, affiliations: nei
- Kenneth Hamnes (kenneth-hamnes) - 7 roller; mangler biography: ja, affiliations: nei
- Øistein Brevig Pjaaka (oistein-brevig-pjaka) - 7 roller; mangler biography: ja, affiliations: nei
- Alf Christoffer Jahr (alf-christoffer-jahr) - 6 roller; mangler biography: ja, affiliations: nei
- Andre Rolf Knüppel (andre-rolf-knuppel) - 6 roller; mangler biography: ja, affiliations: nei
- Bjarne Reinert (bjarne-reinert) - 6 roller; mangler biography: ja, affiliations: nei
- Frode Arntsen (frode-arntsen) - 6 roller; mangler biography: nei, affiliations: ja
- Ivan Vindheim (ivan-vindheim) - 6 roller; mangler biography: nei, affiliations: ja
- Karen Mosebø Haukeland (karen-mosebo-haukeland) - 6 roller; mangler biography: ja, affiliations: nei
- Kristin Genton (kristin-genton) - 6 roller; mangler biography: nei, affiliations: ja

### Mulige navnesplitt

- Ingen

### CompanyId-avvik for board-roller

- TINE SA: 8 roller; pageCompanyId=cmmpayrg5000s190dd4kfuuf0; boardCompanyId=cmmpayrfu000o190dsc4qrecj
- Lerøy Seafood Group ASA: 7 roller; pageCompanyId=cmmpayrgn001b190dybx7h4bl; boardCompanyId=cmmxw487f0052p80d9oskgl7d
- Coop Norge SA: 6 roller; pageCompanyId=cmmpayrew0005190d8floygxb; boardCompanyId=cmmxw483t000fp80djern4zju
- Yara International ASA: 6 roller; pageCompanyId=cmmxw487m005fp80duuood3yc; boardCompanyId=cmmpayrgr001e190d9ab6n2y3
- NorgesGruppen ASA: 6 roller; pageCompanyId=cmmpayrdp0000190d1vvypoy8; boardCompanyId=cmmpayrg7000v190dld9vwx8g
- Coop Norge SA: 5 roller; pageCompanyId=cmmxw483t000fp80djern4zju; boardCompanyId=cmmpayrew0005190d8floygxb
- Reitan Retail AS: 5 roller; pageCompanyId=cmmxw484o0011p80d8ra3tkn6; boardCompanyId=cmmpayrf5000a190dt7bu8tdg
- Yara International ASA: 5 roller; pageCompanyId=cmmpayrgr001e190d9ab6n2y3; boardCompanyId=cmmxw487m005fp80duuood3yc
- SalMar ASA: 4 roller; pageCompanyId=cmmpayrgj0017190d32fix1hx; boardCompanyId=cmmxw4875004rp80dkc2ll1ti
- NorgesGruppen ASA: 4 roller; pageCompanyId=cmmpayrg7000v190dld9vwx8g; boardCompanyId=cmmpayrdp0000190d1vvypoy8
- ASKO Norge AS: 4 roller; pageCompanyId=cmmpayrh5001n190dqum2t3kw; boardCompanyId=cmmxw48800066p80defymnjc2
- TINE SA: 3 roller; pageCompanyId=cmmpayrfu000o190dsc4qrecj; boardCompanyId=cmmpayrg5000s190dd4kfuuf0

### ActorContact ikke på /personer

- Alexandra Leeper (Iceland Ocean Cluster) - CEO
- Anja Loekken Stokke (NCE Heidner Biocluster) - Leder digitalisering
- Bent Hoie - utvalgsleder
- Gurill Narum Mediaa (NCE Heidner Biocluster) - Leder
- Hanne Fjerdingby Olsen - Professor, baerekraftige matsystemer
- Karin Beukel (Agrain) - Co-Founder
- Kristian S. Ottesen (Royal Greenland) - Director Process Optimization & Resource Utilization
- Linn Indrestrand (Danish Ocean Cluster) - Head of Fishery & Maritime Services
- Martin Saetra - Intern (NMBU Biooekonomi)
- Matsystemutvalget Sekretariat - sekretariat
- Mattias Lindahl (Linkoeping University) - Professor
- Michaela Lindstrom (Hailia Nordic) - CEO & Co-founder
- Monika Poulsen (Arctic Cluster Team) - Cluster Manager
- Nils Kristen Sandtroen - statsraad
- Selina Juul (Stop Spild Af Mad) - Grunnlegger og leder

## Neste orkestrerte steg

1. Kjør et råkorpus-pass som aktivitet: hent personnavn-kandidater fra `research/`, `docs/meetings/`, `docs/project/mandates/` og PDF/OCR-tekst.
2. Fan-out per kildegruppe: selskaps-/årsrapporter, møter/transkripter, forskningsnotater og actor/outreach-dokumenter.
3. Fan-in til en kandidatkø med `name`, `source_path`, `context`, `confidence`, `suggested_personKey` og `action`.
4. Promoter bare bekreftede kandidater til `PersonProfile` eller `ActorContact`; hold resten som triage, ikke fakta.
