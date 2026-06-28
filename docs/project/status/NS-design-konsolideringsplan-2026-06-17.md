---
tittel: Natural State — design-/brand-konsolidering: plan (nå vs. senere)
status: Plan (utkast v0.1)
eier: Gabriel
dato: 2026-06-17
formål: Samle NS-design fra fragmenterte kilder til én kilde til sannhet, og avklare hva vi tar nå (for flaggskip-rapporten) vs. senere (full konsolidering).
merknad: Denne plan-fila bør selv migrere til det dedikerte NS design-repoet når det opprettes.
relaterte_filer:
  - docs/project/status/ukesrapport-10dager-PREP-BRIEF-2026-06-17.md
---

# NS design-/brand-konsolidering

## 1. Mål

Én **kilde til sannhet** for Natural State-design — farger, typografi, logo, komponent- og konseptskisse-maler — som er gjenbrukbar på tvers av alle prosjekter (Food Systems, Drammen BaneNor, fremtidige). I dag er den fragmentert, så designarbeid gjøres på nytt hver gang. Flaggskip-rapporten til Cathrine/JT er første konkrete bruk *og* anledningen til å sette standarden.

## 2. Kilder i dag (fragmentert)

| Kilde | Hva den trolig har | Tilgang nå |
|---|---|---|
| **Natural State Deployments And MainBoards** (iCloud-repo) | Brand-/mainboard-elementer, sannsynligvis logo, palett, oppsett | Ikke koblet til økta — krever mapping |
| **Drammen BaneNor - Master** | Konseptskisse-formater, malstil | Ikke koblet til økta — krever mapping |
| **Food Systems-plattformen** (food-systems.naturalstateproject.com) + naturalstate.no | Levende visuelt språk: rolig redaksjonell palett (varm grå/stone + grønn aksent), ren typografi | Tilgjengelig nå (kan baselines fra) |

## 3. Anbefalt hjem

**Et dedikert NS design-/brand-repo** (lite, fokusert):

```
ns-design/
  tokens/        farger, typeskala, spacing, radius (JSON/CSS-variabler)
  brand/         logo (SVG), favicon, merkevarebruk
  type/          fonter + fallback-stack
  components/    gjenbrukbare mønstre (kort, metrics-bånd, hero, forbehold-boks)
  templates/     rapport-, konseptskisse-, deck-maler
  README.md      bruksregler + hvordan importere i et prosjekt
```

Inntil det er opprettet: en **lettvekts `brand/`-mappe / én design-tokens-fil** i Food Systems-repoet for å avlaste rapporten — migreres inn i ns-design senere.

## 4. Nå vs. senere

### NÅ (kun det flaggskip-rapporten trenger)
- **Logo** (SVG) + **fargepalett** (primær + 1–2 aksenter) + **fonter** (med web-trygg fallback).
- 1–2 **signatur-elementer** å ta opp i rapporten (f.eks. konseptskisse-formatet fra Drammen).
- Pakk dette som en minimal tokens-fil + inline i rapport-HTML-en, og **dokumentér valgene** der (palett/typeskala) — det blir baseline-malen.

### SENERE (full konsolidering)
1. Inventere begge repoene (Deployments/MainBoards + Drammen) — hva finnes, hva er kanonisk, hva er utdatert.
2. Trekke ut et harmonisert **token-sett** + **komponentbibliotek** + **maler**.
3. Opprette `ns-design`-repoet, migrere alt dit, skrive bruksregler.
4. Refaktorere Food Systems-plattformen og fremtidige prosjekter til å importere derfra.

## 5. Token-inventar å trekke ut (sjekkliste)

- [ ] Logo (primær, mono, favicon) som SVG
- [ ] Fargepalett: primær, aksent(er), nøytrale, status (suksess/varsel)
- [ ] Typografi: heading- og brødtekstfont + fallback-stack + typeskala
- [ ] Spacing-/radius-/skygge-tokens
- [ ] Komponentmønstre: hero, kort, metrics-bånd, sitat/forbehold-boks, tabellstil
- [ ] Konseptskisse-/rapport-/deck-maler (fra Drammen + MainBoards)
- [ ] Bruksregler (do/don't, klarhet, tilgjengelighet/kontrast)

## 6. Avhengigheter / hva som trengs

- **For «nå»:** logo-fil fra Gabriel + ev. baseline fra plattform/naturalstate.no.
- **For «senere»:** koble «Natural State Deployments And MainBoards»- og «Drammen BaneNor - Master»-mappene til en økt, så jeg kan inventere og ekstrahere. (Jeg ber om tilgang til den første nå.)

## 7. Anbefalt rekkefølge

1. **Nå:** baseline palett/type fra plattformen + få logoen → nok til en sterk, NS-følt rapport.
2. **Parallelt:** koble til iCloud-repoet → jeg inventerer (start på «senere»-sporet).
3. **Etter rapporten:** opprett `ns-design`, migrer, dokumentér — standarden for fremover.

---

## 8. Funn fra NS-repoet (inventert 17.06)

**Repo:** «Natural State Deployments And MainBoards» (iCloud) — et deploy-repo med en `Natural State Design Project 05.02/`-mappe som bærer den faktiske design-kilden.

**To design-definisjoner i samme repo (selve fragmenteringen, illustrert):**
- ✅ **Kanonisk:** `…/Natural State Design Project 05.02/elements/` — ekte, brukbart design-system: `tokens.css`, `elements.css`, `icons/`, `react/`, `motion.ts`, `CATALOG.md`, `SNIPPETS.md`. **Dette er NS-looken vi bruker.**
- ⚠️ **Utdatert/generisk:** `…/design-system/natural-state/MASTER.md` — auto-generert «Creative Agency»-mal (Lora/Raleway, ren svart/hvit). *Ikke bruk* — eksempel på akkurat det vi skal rydde.

**De faktiske tokenene (staget i `brand/ns-tokens.css` i Food Systems-repoet):**
- Fonter: **Instrument Serif** (display), **Instrument Sans** (brødtekst).
- Palett: bg `#060606` / paper `#f7f6f2` / ink `#0b0b0b` — **mørk-først, med light-variant** (`data-ns-theme="light"`).
- Fire aksenter (fra sphere-symbolet): grønn `#78c840`, blå `#40a8f0`, amber `#f8b038`, rød `#d80808`, deep `#183030`.
- Radius 12/18/28, myke skygger, max-bredde 1120px, definerte easing-kurver.

**Brand-assets (signatur):**
- Fire **sphere-SVG-er**: `…/public/assets/sphere-{internal,lab,place,market}.svg` (matcher de fire aksentfargene).
- Wordmark: `…/public/assets/logo-wordmark.webp`.
- Logoer (PNG/PSD): `NS_LOGO_HVIT/SORT_SYMBOLER`, `naturallogoneue`.

**Ta NÅ (for rapporten):** `brand/ns-tokens.css` (✅ gjort) + de fire sphere-SVG-ene + wordmark.
**SENERE:** migrer hele `elements/`-systemet (komponenter, ikoner, motion) til dedikert `ns-design`-repo og fjern den utdaterte MASTER.md-malen.

> Designvalg for rapporten: NS er mørk-først, men for en utskrivbar rapport til Cathrine/JT er light-varianten (`#f7f6f2`-paper) trolig tryggest, med en mørk hero som NS-signatur. Bygge-økta bestemmer.

---

*Lavterskel-prinsipp: ikke la den fulle konsolideringen blokkere rapporten. Ta minimumstokensene nå, gjør den ordentlige samlingen som et eget spor.*
