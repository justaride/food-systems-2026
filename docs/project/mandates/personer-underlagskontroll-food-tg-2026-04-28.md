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

Strukturert personunderlag er representert på personsiden: alle `1332` unike personer fra `BoardMember` finnes i den sammenslåtte `/personer`-visningen, og alle `1696` styre-/lederroller er dekket på visningsnivå etter samme merge-logikk som appen bruker.

Tallene på personsiden er bekreftet mot forventning: `1573` personer, `2592` roller og `618` interlocking-personer. Dette bekrefter dekning for de strukturerte underlagene, men ikke at alle personnavn som finnes i fritekst/PDF/rånotater er løftet inn. Det siste krever et eget NER-/rådokumentpass.

## Workflow-sjekk

| Gate | Status | Resultat |
|---|---:|---|
| Forventede sidetall | PASS | 1573/1573 personer, 2592/2592 roller, 618/618 interlocking |
| Alle BoardMember-personer på siden | PASS | 1332 unike board-personer |
| Alle BoardMember-roller på siden | PASS | 0 mangler på visningsnivå |
| BoardMember-roller beholder companyId | WARN | 71 mangler på strict companyId-sjekk |
| PersonProfile roles kan parses | PASS | 0 ugyldige role entries |

## Tellegrunnlag

| Metrikk | Antall | Notat |
| --- | --- | --- |
| PersonProfile | 1354 | Manuelt eller auto-opprettet profilrad |
| BoardMember | 1696 | Rå styre-/lederroller |
| Unike BoardMember-personer | 1332 | Fallback-grunnlag for personsiden |
| Personer på /personer | 1573 | PersonProfile + BoardMember fallback |
| Roller på /personer | 2592 | Dedupet per person, selskap og rollelabel |
| Interlocking på /personer | 618 | Personer med mer enn én rolle |
| ActorContact | 17 | Kontaktpersoner i actor-modellen, separat fra /personer |
| Meeting | 8 | Møteunderlag med participants[] |

## Dekningssplit

| Kategori | Antall | Andel av /personer |
| --- | --- | --- |
| Profil + board-fallback | 1113 | 70.8% |
| Kun PersonProfile | 241 | 15.3% |
| Kun BoardMember fallback | 219 | 13.9% |
| Kun fallback og interlocking | 0 | 0.0% |

## Detaljdekning

| Detaljfelt | Dekket | Andel av /personer |
| --- | --- | --- |
| Biography | 80 | 5.1% |
| LinkedIn URL | 0 | 0.0% |
| Photo URL | 0 | 0.0% |
| Affiliations | 1250 | 79.5% |
| Tags | 1573 | 100.0% |

## Funn som må håndteres

- `588` interlocking-personer mangler biography og/eller affiliations. De er dekket som personer/roller, men ikke ferdig detaljerte profiler.
- `136` lagrede PersonProfile-roller mangler `companyId`. Dette er ikke en referansefeil, men bør ryddes der selskapet finnes i databasen.
- `71` BoardMember-roller mangler strict `companyId`-match i den sammenslåtte visningen. De er dekket på visningsnivå, men peker på dupliserte selskapsrader med samme navn.
- `0` dupliserte BoardMember person/selskap/rolle-kombinasjoner ble funnet.
- `79` mulige navnesplitt-grupper ble funnet med løs norsk/ascii-normalisering. Disse bør manuelt sjekkes før vi sier at persondeduplisering er helt ren.
- `16` ActorContact-navn finnes ikke på personsiden. Dette kan være riktig modellskille, men må avklares hvis /personer skal være total personkatalog.

## Eksempler til manuell sjekk

### Interlocking med detaljgap

- Ole Robert Reitan (ole-robert-reitan) - 16 roller; mangler biography: nei, affiliations: ja
- Helge Christian Haugen (helge-christian-haugen) - 12 roller; mangler biography: ja, affiliations: nei
- Bjørn Strand (bj-rn-strand) - 11 roller; mangler biography: ja, affiliations: nei
- Bjørn Strand (bjrn-strand) - 11 roller; mangler biography: ja, affiliations: ja
- Stig Børger Bratlie (stig-b-rger-bratlie) - 10 roller; mangler biography: ja, affiliations: nei
- Jarle Gjerde (jarle-gjerde) - 8 roller; mangler biography: ja, affiliations: nei
- Kristin Solheim Genton (kristin-solheim-genton) - 8 roller; mangler biography: ja, affiliations: nei
- Øyvind Andersen (yvind-andersen) - 8 roller; mangler biography: ja, affiliations: nei
- Arne Møgster (arne-m-gster) - 7 roller; mangler biography: ja, affiliations: nei
- Kenneth Hamnes (kenneth-hamnes) - 7 roller; mangler biography: ja, affiliations: nei
- Øistein Brevig Pjaaka (istein-brevig-pjaaka) - 7 roller; mangler biography: ja, affiliations: nei
- Alf Christoffer Jahr (alf-christoffer-jahr) - 6 roller; mangler biography: ja, affiliations: nei
- Andre Rolf Knüppel (andre-rolf-knuppel) - 6 roller; mangler biography: ja, affiliations: nei
- Bjarne Reinert (bjarne-reinert) - 6 roller; mangler biography: ja, affiliations: nei
- Frode Arntsen (frode-arntsen) - 6 roller; mangler biography: nei, affiliations: ja

### Mulige navnesplitt

- arne-mogster: Arne Moegster [arne-moegster, 2 roller]; Arne Møgster [arne-mgster, 3 roller]; Arne Møgster [arne-m-gster, 7 roller]
- bjorn-strand: Bjoern Strand [bjoern-strand, 1 roller]; Bjørn Strand [bj-rn-strand, 11 roller]; Bjørn Strand [bjrn-strand, 11 roller]
- carlfredrik-langardbjor: Carl-Fredrik Langård-Bjor [carl-fredrik-langard-bjor, 4 roller]; Carl-Fredrik Langård-Bjor [carlfredrik-langardbjor, 2 roller]; Carl-Fredrik Langaard-Bjor [carlfredrik-langaardbjor, 3 roller]
- ingjald-sorhoy: Ingjald Sorhoey [ingjald-sorhoey, 1 roller]; Ingjald Sørhøy [ingjald-s-rh-y, 2 roller]; Ingjald Sørhøy [ingjald-srhy, 2 roller]
- stein-rommerud: Stein Rommerud [stein-rommerud, 1 roller]; Stein Rømmerud [stein-r-mmerud, 3 roller]; Stein Rømmerud [stein-rmmerud, 2 roller]
- stig-borger-bratlie: Stig Boerger Bratlie [stig-boerger-bratlie, 1 roller]; Stig Børger Bratlie [stig-b-rger-bratlie, 10 roller]; Stig Børger Bratlie [stig-brger-bratlie, 6 roller]
- tor-ronhovde: Tor Roenhovde [tor-roenhovde, 2 roller]; Tor Rønhovde [tor-r-nhovde, 4 roller]; Tor Rønhovde [tor-rnhovde, 2 roller]
- trond-fredrik-mellingsaeter: Trond Fredrik Mellingsaeter [trond-fredrik-mellingsaeter, 2 roller]; Trond Fredrik Mellingsæter [trond-fredrik-mellings-ter, 4 roller]; Trond Fredrik Mellingsæter [trond-fredrik-mellingster, 2 roller]
- aleksander-jorgenrud: Aleksander Jorgenrud [aleksander-jorgenrud, 1 roller]; Aleksander Jørgenrud [aleksander-j-rgenrud, 1 roller]
- anbjorn-oglend: Anbjørn Øglend [anbj-rn-glend, 3 roller]; Anbjørn Øglend [anbjrn-glend, 2 roller]
- annamaria-linnea-carnemark: Anna-Maria Linnea Carnemark [anna-maria-linnea-carnemark, 2 roller]; Anna-Maria Linnea Carnemark [annamaria-linnea-carnemark, 2 roller]
- anne-berit-loset: Anne Berit Løset [anne-berit-lset, 1 roller]; Anne Berit Løset [anne-berit-l-set, 1 roller]
- anne-jodahl-skuterud: Anne Jødahl Skuterud [anne-j-dahl-skuterud, 1 roller]; Anne Jødahl Skuterud [anne-jdahl-skuterud, 2 roller]
- arttupekka-vikstrom: Arttu-Pekka Vikstrom [arttupekka-vikstrom, 2 roller]; Arttu-Pekka Vikström [arttu-pekka-vikstrom, 4 roller]
- bjarte-royrvik: Bjarte Royrvik [bjarte-royrvik, 1 roller]; Bjarte Røyrvik [bjarte-r-yrvik, 2 roller]

### CompanyId-avvik for board-roller

- TINE SA: 7 roller; pageCompanyId=cmmpayrg5000s190dd4kfuuf0; boardCompanyId=cmmpayrfu000o190dsc4qrecj
- Lerøy Seafood Group ASA: 7 roller; pageCompanyId=cmmpayrgn001b190dybx7h4bl; boardCompanyId=cmmxw487f0052p80d9oskgl7d
- Coop Norge SA: 7 roller; pageCompanyId=cmmxw483t000fp80djern4zju; boardCompanyId=cmmpayrew0005190d8floygxb
- Yara International ASA: 7 roller; pageCompanyId=cmmxw487m005fp80duuood3yc; boardCompanyId=cmmpayrgr001e190d9ab6n2y3
- NorgesGruppen ASA: 6 roller; pageCompanyId=cmmpayrg7000v190dld9vwx8g; boardCompanyId=cmmpayrdp0000190d1vvypoy8
- Reitan Retail AS: 5 roller; pageCompanyId=cmmxw484o0011p80d8ra3tkn6; boardCompanyId=cmmpayrf5000a190dt7bu8tdg
- TINE SA: 4 roller; pageCompanyId=cmmpayrfu000o190dsc4qrecj; boardCompanyId=cmmpayrg5000s190dd4kfuuf0
- Coop Norge SA: 4 roller; pageCompanyId=cmmpayrew0005190d8floygxb; boardCompanyId=cmmxw483t000fp80djern4zju
- NorgesGruppen ASA: 4 roller; pageCompanyId=cmmpayrdp0000190d1vvypoy8; boardCompanyId=cmmpayrg7000v190dld9vwx8g
- SalMar ASA: 4 roller; pageCompanyId=cmmxw4875004rp80dkc2ll1ti; boardCompanyId=cmmpayrgj0017190d32fix1hx
- Yara International ASA: 4 roller; pageCompanyId=cmmpayrgr001e190d9ab6n2y3; boardCompanyId=cmmxw487m005fp80duuood3yc
- SalMar ASA: 3 roller; pageCompanyId=cmmpayrgj0017190d32fix1hx; boardCompanyId=cmmxw4875004rp80dkc2ll1ti

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
