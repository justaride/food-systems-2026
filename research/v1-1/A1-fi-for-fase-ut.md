---
tittel: "A1: FI fôr-fase-ut — research"
status: 🟡 påstand må omformuleres (delvis verifisert)
eier: Gabriel + research-agent
dato: 2026-04-30
hovedrapport: public/reports/nordisk-sirkularitetsrapport-2026-05.html (Foregangsområde 1, batch-01)
v1_1_phase: A1
---

# A1 — Verifisering av "FI fase-ut av importert fôr i melkeproduksjon"

## Konklusjon

**Påstanden er IKKE støttet i sterk form.** Den må omformuleres for v1.1.

Den underliggende faktiske historien er:

1. **Valio (≈80% av FI melkemarked) faset ut SOYA**, ikke alt importert fôr.
2. Vedtatt 1. mars 2018 for melkekyr; ferdigstilt for ungdyr mars 2019.
3. **Erstattet med rapsmel** — som har kun ~10% innenlandsk-andel (Luke ViiMa-prosjekt). Rapsmel kommer hovedsakelig fra Baltikum og Tyskland.
4. **Finlands totale selvforsyning av supplerende plante-protein er 15%** (Luke, 2021).
5. **Ingen lov** forbyr importert soya i FI — Valios vedtak er markedsdrevet/strategisk, ikke regulatorisk.

Med andre ord: FI har ikke "faset ut importert fôr". FI har **flyttet importavhengigheten** fra Brasil-soya til Baltikum/Tyskland-rapsmel. Dette er fortsatt en betydningsfull endring (avskogingsfri), men ikke "selvforsyning".

## Hva vi vet med rimelig sikkerhet

| Fakta | Kilde | Kvalitet |
|---|---|---|
| Valio besluttet å fase ut soya 1. mars 2018 | Valio bærekraftsrapport | primary_report |
| Ferdigstilt for melkekyr ~2018, ungdyr ~mars 2019 | Valio | primary_report |
| Soya erstattet med rapsmel | Valio + Luke | primary_report |
| Rapsmel har ~10% innenlandsk-andel (FI) | Luke ViiMa-prosjekt | primary_estimate |
| FI total plante-protein-selvforsyning: 15% | Luke 2021 | primary_report |
| Valio markedsandel ~80% | sektor-data | secondary |

## Hva vi ikke vet (åpne valideringspunkter)

- Eksakt importandel i FI melkeproduksjon over tid (Luke avviklet "Balance Sheet for Food Commodities" — tidsserie 2010-2024 finnes ikke konsolidert)
- Andre FI-meierier (utenom Valio) sin fôr-policy
- Hvor mye av Valio-rapsmelen som er importert vs innenlandsk
- Eksakt CO2/avskoging-effekt av soya→raps-skiftet
- Hvor stor andel kraftfôr (utover protein) som er importert

## Sammenligning med NO

NO 80% kjøttproduksjon-soya-avhengighet er ikke direkte sammenlignbart fordi:
- FI-tallet handler om melkeproduksjon (annen produktklasse)
- "Soya-fri" ≠ "innenlandsk fôr"

Begge land er sterkt importavhengige på fôr-protein. Forskjellen er at FI har valgt **avskogingsfri** importprotein (rapsmel fra Europa), mens NO fortsetter med **brasiliansk soya**.

## Anbefalt v1.1-formulering

I batch-01-importert-for.md, baseline-v0.3.json og hovedrapportens §2/§5:

**Bytt ut:**
> "FI fase-ut av importert fôr i melkeproduksjon" (kjernepåstand fra Jan Thomas, ikke verifisert)

**Med:**
> "Valio (~80% av FI melkemarked) faset ut soya fra fôret til melkekyr i 2018-2019, og erstattet det med europeisk rapsmel. Dette er en avskogingsfri-konvertering, ikke selvforsyning: rapsmel har bare ~10% innenlandsk-andel og FI total plante-protein-selvforsyning er 15% (Luke, 2021). Vedtaket var markedsdrevet via Valios bærekraftsstrategi, ikke politisk regulering."

**Oppdatert dissonance-implikasjon:** FI-eksempelet viser at en stor kooperativ-aktør (Valio) kan flytte hele en sektor uten lov-endring — gitt riktig markedsposisjon. NO mangler tilsvarende dominerende kooperativ-aktør på fôrkjøp; Tine kjøper ikke fôr direkte til medlemsbønder, og Felleskjøpet er ikke i samme kategori av forbruker-rettet bærekraftsmerkevare.

**Foregangsområde 1 (Importert fôr) får nyansert tekst:** FI-modellen er ikke "alternative proteiner" alene (Solar Foods/Enifer er nye TRL5-9-aktører) — det er **kombinasjon av kooperativ-vedtak + alternativ-forskning + sertifisert importprotein**.

## APA7-light kildereferanser

Luke (Luonnonvarakeskus). (2021). *Suomen kasvivalkuaisen omavaraisuusaste / Finland's plant protein self-sufficiency rate*. https://stat.luke.fi/

Luke ViiMa-prosjekt. (n.d.). *Rapeseed cake protein in Finnish dairy feed*. (Krever full sjekk av eksakt prosjekt-URL)

Maa- ja metsätalousministeriö (MMM). (2017). *Food2030 — Finnish Food Strategy*. https://mmm.fi/en/food/strategies-and-programmes

Valio Oy. (2018, 1. mars). *Valio committed to soy-free milk production*. Valio bærekraftsrapport. https://www.valio.com/sustainability/

Valio Oy. (2019, mars). *Soy phase-out completed for young dairy cattle*. Valio. https://www.valio.com/

## Kvalitetsflagg

- ✅ Hovedpåstand fra Jan Thomas svekket og presisert
- ✅ Dokumentert FI Valio-vedtak 2018-2019
- ✅ Dokumentert at "soya-fri" ≠ "innenlandsk"
- 🟡 Eksakt URL-er for Valio-uttalelser pending
- 🟡 Luke ViiMa-prosjekt URL pending
- 🟡 Tidsserie 2010-2024 ikke tilgjengelig konsolidert

## Datagap som flyttes til v1.2

- Direkte Luke-kontakt for tidsserie fôr-import 2010-2024
- Andre FI-meierier (utenom Valio) sin fôr-policy
- CO2-effekt av soya→raps-skiftet (kg CO2e/kg melk før vs etter)
