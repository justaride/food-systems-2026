# Rapport — Adversariell kildeverifisering, skive 1

Dato: 2026-08-05. Verifiserer: skive-1-agent. 12 citations over 4 kildedokumenter.

## Sammendrag
- machine_verified: 11
- disputed: 1
- rejected: 0

## Kilder og dommer

### src-015 — Matvett/NORSUS OR.28.24 (PDF, 6 citations) — ALLE VERIFISERT
Tallene ligger ordrett i sammendraget (s.i) og kap.4/innledning:
- 35 kg/innbygger 2023, -18 % (2016-2023), -12 % (2020-2023): sammendrag + avsn.310.
- 222 300 tonn (2016) / 193 200 tonn (2023), 42,6 / 35 kg: avsn.308-309.
- 451 600 tonn totalt / ~40 % husholdning: innledning avsn.248-249.
- -6 % (2015-2020): innledning avsn.259.
Alle basis=maalt (plukkanalyser) korrekt.

### src-024 — Konkurransetilsynet Margin Study Part 1 (PDF, 3 citations) — 2 verifisert, 1 disputed
- **024-001 (11,5 % / 8,9 % prisvekst)**: VERIFISERT ordrett s.4-5, fotnote 2-3.
- **024-003 (35 % / 28 %, 21 %/11 % omsetningsvektet, RNOA)**: VERIFISERT ordrett s.36, inkl. tilbakefall til 2017-niva i 2022 og eksplisitt "not analysed causal relationships".
- **024-002 (retail <5 % / <3 % eks-pandemi; grossist ~1 %)**: **DISPUTED — feil lokator.**
  Verdiene er korrekte: grossist "around 1 per cent throughout the period" staar i seksjon 5.3.1.1 (trykt s.39), og retail "below 5 per cent throughout ... below 3 per cent [eks 2020-2021]" staar i seksjon 5.4.1.2 (trykt s.42). MEN citation-lokatoren "s. 47-48 (5.4.1.2)" peker paa referanselista/bibliografien (trykt s.47-48 er kildeliste, verifisert). Seksjonsnumrene stemmer, men sidetallet for 5.4.1.2 er ~5 sider feil og lander i litteraturlista. Basis (driftsmargin per ledd, reviderte regnskap 2017-2022) er korrekt. Anbefaling: rett lokator til "s. 39 (5.3.1.1) + s. 42 (5.4.1.2)".

### src-032 — Nofima upcycled food (MD-ekstrakt, 1 citation) — VERIFISERT
"76 words and concepts" med "sustainability" som dominerende bekreftet i abstract/funn. Merk: kilden er WebFetch-ekstrakt av abstract (landing-side ga HTTP 403 til curl), ikke fullteksten.

### src-047 — SSB avfallshaandtering (MD-ekstrakt, 2 citations) — VERIFISERT mot ekstrakt
- 746 tusen tonn biologisk (biogass 528, kompostering 218), 7 113 tusen tonn totalt: seksjon 2.
- 194 / 72 tusen tonn matavfall husholdning/naering: seksjon 2.
Begge staar ordrett i localPath-fila. Forbehold: localPath er et WebFetch-ekstrakt (ssb-avfall-matsvinn-2026.md), ikke SSBs primaertabell — verifisert mot ekstraktet slik oppgaven krever, men tallene er ikke uavhengig kontrollert mot ssb.no. Confidence satt til 85 av den grunn.

## Metodenotat
PDF-sidetall = pdftotext-sidetall = trykt sidetall for begge PDF-ene (verifisert via bunntekst). Kryssjekket citation-lokatorene mot faktisk seksjons-/sideplassering.
