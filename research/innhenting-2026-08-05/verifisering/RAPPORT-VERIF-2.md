# Rapport — Verifiseringspass skive 2

Adversariell kilde-verifisering, 12 citations fra 4 kildedokumenter. Alle tall verifisert mot lokal kildefil (pdftotext / md-lesing).

## Resultat: 12 machine_verified, 0 disputed, 0 rejected

## Per kilde

### src-007 — ENORM BioFactory A/S årsrapport 2023 (PDF, virk.dk/CVR)
Alle 5 finansielle tall bekreftet ordrett i Resultatopgørelse (s.11), Ledelsesberetning (s.10) og note Personaleomkostninger:
- Årets resultat -31.305.706 DKK ✓
- Bruttotab -6.798.935 DKK ✓
- Resultat før skat -40.126.075 DKK ✓
- Egenkapital 130.256.511 DKK ✓
- Gennemsnitligt antal beskæftigede 26 ✓

Merk: pageRef "s.10" er ledelsesberetningen; selve resultatopgørelsen ligger s.11. Ikke-blokkerende — tallene står også oppsummert på s.10.

### src-020 — Konkurransetilsynets Dagligvarerapport 2024-25 (PDF)
- ~95 % av mat fra tre store kjeder: bekreftet i **avsnitt (5)**. Oligopol-/etableringshindrings-beskrivelsen står ordrett men i **avsnitt (15)**, ikke (26) som pageRef oppgir — avsnitt (26) omhandler overtredelsesgebyrene (Coop 1,3 mrd, NG 2,3 mrd, Rema 1,3 mrd). Tallet stemmer; sekundærlokator (26) er feil. Beholdt machine_verified (conf 80) fordi selve verdien er korrekt og på oppgitt lokator (5).
- Tine 93 % av leveranser fra norske melkebønder: eksakt match, **avsnitt (80)** ✓
- Varekostnad 70–95 % av variable produksjonskostnader: eksakt match, **avsnitt (65)** ✓

### src-037 — NORSUS OR.48.23 Biorest (PDF)
- N 132 730 / P 15 610 tonn (2018): ordrett i kap. 2.1 s.5 (Figur 2-1 + tekst), inkl. delkomponenter. Basis målt ✓
- Biorest-gjødselpotensial 4 302 t N / 1 177 t P (2022): ordrett i kap. 2.2-tekst ved Figur 2-2 (s.7). Basis modellert korrekt. **Intern kildeuklarhet flagget**: kildens Vedlegg-2-tabell (Tabell 5-1) viser 1 177 t P som totalsum *inkludert matavfall* (sum av de tre nevnte råstoffene alene ≈ 663 t P; N-summen 4 302 stemmer for de tre). Sitatet gjengir kildens hovedtekst korrekt, så verdi = machine_verified, men P-tallet bør brukes med forsiktighet nedstrøms.

### src-049 — SSB Avfall frå hushalda (KOSTRA) — lokal md
- Husholdningsavfall 2 131 tusen tonn / 379 kg/innb (2025): eksakt match ✓
- Matavfall 241 tusen tonn (2025): eksakt match ✓
- **Merk**: localPath er et WebFetch-ekstrakt (md), ikke primær SSB-side. Verifisert mot ekstraktet som oppgitt; primærkildekontroll (ssb.no) ikke utført i dette passet.

## Flagg til oppfølging (ikke-blokkerende)
1. cit-020-001: rett sekundærlokator (26) → (15).
2. cit-037-002: P=1 177 t er totalsum inkl. matavfall i kildetabellen; verifiser hvilket systemgrense-tall som skal siteres.
3. src-049: to citations verifisert mot sekundært md-ekstrakt, ikke primær SSB.
