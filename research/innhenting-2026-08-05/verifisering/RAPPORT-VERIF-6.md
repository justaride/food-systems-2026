# Rapport — verifiseringspass skive 6

Dato: 2026-08-05. Adversariell kilde-verifiserer. cwd-rot-relativ.

## Sammendrag
11 citations verifisert mot 4 kildedokumenter. **Alle 11 = machine_verified.** 0 disputed, 0 rejected.

Hvert tall ble funnet verbatim i kilden med korrekt basis (maalt/modellert).

## Kilder og funn

### src-018 — Miljødirektoratet/NORWASTE M-1674 (PDF)
- **018-001** (201 000 + 191 000 tonn matavfall 2018): verbatim linje 1134-1135. SSB avfallsstatistikk, maalt. ✓
- **018-002** (370 000 tonn kompostert / 320 000 tonn produkter 2018): linje 760 + 797. Teksten "anslår vi" = modellert. ✓
- **018-003** (25 000 tonn torvimport = 20 127 + 4 810): linje 259-260 og 480-481, eksakt. SSB importstatistikk, maalt. ✓
- Merk: PDF-en har ~50-160 linjers avvik mellom oppgitt "linje ~N" og faktisk plassering, men beskrevet avsnitt-lokator + verdi stemmer eksakt i alle tre.

### src-026 — Konkurransetilsynet (NCA) 2024 OECD-rapport (PDF)
- **026-001** (4,9 mrd NOK / USD 462 mill gebyr, tre største kjeder): linje 108 (konsentrasjon) + 122/515 (gebyr, prisovervaakingssamarbeid "price hunter case"). Eksakt. ✓
- **026-002** (151 fusjonsmeldinger, 97 % innen 25 dager): linje 102, bekreftet linje 626-627 (147/151 = 97,3 %). ✓

### src-033 — Pettersen & Steen, "Mot bedre vitende i norsk matsektor" kap. 1 (PDF)
- **033-001** (S-gruppen 46,4 % FI / ICA 51,5 % SE): linje 736, smerteterskel-avsnitt, eksakt. ✓
- **033-002** (matpris 32 % over naboland 2017, opp fra 22 % 2005): linje 111 + 376. Sidereferansene 111/376 samsvarer med linjenr. ✓
- **033-003** (skjermingsstøtte 47 % NO vs 5 % SE/DK, 10× EU): linje 400-403. Sammenlignings-estimat = modellert. ✓
- **033-004** (Lidl 5→10 % FI 2011-2018; +47 % SE): linje 219-222, eksakt. ✓

### src-048 — SSB avfallsstatistikk WebFetch-ekstrakt (.md)
- **048-001** (industriavfall 1 210 / våtorganisk 77 tusen tonn 2022): fila linje 28-29. ✓
- **048-002** (industriavfall +35 % 2015→2022, materialgjenv. 56 %→40 %): fila linje 31. ✓
- Merk: localPath er et sekundært WebFetch-ekstrakt av SSB, ikke SSBs primærside. Tallene er verifisert mot ekstraktets innhold slik oppgaven krever (tall vs. localPath).

## Metode
pdftotext (sidevis der relevant) + grep på hver verdi, kryssjekket mot pageRef/beskrevet lokator og basis-felt. Standard skeptisk; ingen tall lot seg ikke gjenfinne.
