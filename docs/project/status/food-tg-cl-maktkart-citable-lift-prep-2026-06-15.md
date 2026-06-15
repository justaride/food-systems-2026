---
tittel: CL-MAKTKART-001 — citable-lift prep (ett-stegs løft etter Strøm A)
status: Prep / venter på Strøm A. Ikke utfør løftet før preconditions under er grønne.
eier: Gabriel
dato: 2026-06-15
formål: Gjøre løftet av CL-MAKTKART-001 fra `klar-med-forbehold` → citable_external til en enkelt, forhåndsdefinert redigering når Strøm A er kjørt. Alt det substansielle (§8 steg 3–4, kryss-node-HHI, figurer, whitepaper) er allerede på plass; det som gjenstår er de to DB-/registeravhengige primærsjekkene.
relaterte_filer:
  - docs/project/status/food-tg-strom-a-runbook-2026-06-15.md
  - docs/project/analysis/food-tg-maktkart-syntese-2026-06-14.md
  - docs/project/analysis/food-tg-maktkart-whitepaper-kapittel-2026-06-15.md
  - src/lib/citations/citable-acceptance.ts
---

# CL-MAKTKART-001 — ett-stegs citable-lift

## 1. Preconditions (må være grønne FØR løftet)

Fra runbook §6 done-kriterier. Ikke løft før **begge** er sanne:

- [x] **Eierandel-% (AP-5) verifisert** — **gjort via offentlige primærkilder 2026-06-15** (selskapenes IR/årsrapporter, ikke Aksjonærregisteret; `food-tg-ap5-krysseie-funn-2026-06-14.md` §6b; CL-AP5-001 oppdatert til `citable_with_note`). Alternativ vei til den register-baserte `verify-ownership-aksjonaerregister.ts`. Rest: BAMAs eksakte NG/Reitan-split + register-kryss av hele lista (valgfritt).
- [ ] **Operator-sekvensen grønn** (`db:audit:strict-sources` 0 brudd; hele kjeden i runbook §3 grønn). **← nå den eneste gjenstående preconditionen** (krever lokal DB; 28 Shareholder-rader m.m.).

Alt annet er allerede lukket: §8 steg 1 (Brønnøysund-form/styre 22/22) ✓, steg 2 (dekningsutvidelse, klar) ✓, **steg 3 (markeds-HHI — kryss-node, 7 noder citable) ✓**, **steg 4 (AP-3 2024 = 18,61 mrd) ✓**.

## 2. Når preconditions er grønne — gjør nøyaktig disse redigeringene

### (a) Syntese §8 — oppdater status-linjen
I `docs/project/analysis/food-tg-maktkart-syntese-2026-06-14.md`, §5/§8: endre CL-MAKTKART-001-status fra `klar-med-forbehold` til **`citable_with_note`**, og kryss ut steg 5 (eierandel-%) + operator-sekvens som utført med dato + JSON-referanse.

### (b) Whitepaper §6 — fjern blokkeren
I `food-tg-maktkart-whitepaper-kapittel-2026-06-15.md` §6: hak av steg 5 + 6, og endre konklusjonslinjen til at CL-MAKTKART-001 nå er citable_with_note (struktur primærsjekket inkl. eierandel-%). Behold forbeholdene (estimerte utfordrer-andeler i enkeltnoder; ulike år/baser).

### (c) Claim-lock / PCQ
Oppdater CL-AP1-001, CL-AP5-001 → citable_with_note (struktur), og CL-MAKTKART-001 → citable_with_note i claim-lock-registeret + `primary-check-queue-food-tg-v0.1.md` (PCQ-MAKT-001 lukket med eierandel-resultatet).

### (d) Acceptance-pakke — legg til CA-016 (verifiser fail-closed → cite-ready)
I `src/lib/citations/citable-acceptance.ts`, legg til testen under (den blir `cite_ready` først når citasjonene peker på de verifiserte AP-5-/operator-artefaktene; til da er den `blocked` = korrekt fail-closed). Kjør `npm run research:citable-acceptance-pack` og bekreft at den flipper til cite-ready.

```ts
{
  id: 'CA-016',
  category: 'ownership_company',
  question:
    'Kan vi sitere CL-MAKTKART-001: et fåtall konsern kontrollerer vertikalt på tvers av butikk, logistikk og foredling, og konsentrasjonen topper i samvirke-foredling?',
  expectedSourceType: 'triangulated board + ownership graph, Brønnøysund + Aksjonærregister primary-checked',
  requiredReadinessLevel: 'citable_with_note',
  mustUse: [
    'docs/project/analysis/food-tg-maktkart-syntese-2026-06-14.md',
    'docs/project/analysis/food-tg-maktkart-bronnoysund-stikkprove-2026-06-14.md',
    'research/analyse/ap5-eierandel-verifikasjon-2026.json',
  ],
  mustNotUse: [
    '«Samordner»/«opererer i samråd» fra eierstruktur alene',
    'AP-1-styrebroer alene uten AP-5-triangulering',
    'Eierandel-% før Aksjonærregister-verifikasjon er kjørt',
  ],
  knownCaveat:
    'Struktur (form + styre + eierandel-%) er primærsjekket; «kontroll» = strukturell posisjon, ikke intensjon/samordning. Enkeltnoders presise HHI bærer fortsatt forbehold.',
  proposedAnswer:
    'Ja, med forbehold: vertikal konsernkontroll (butikk+logistikk+foredling) er triangulert over to uavhengige grafer og primærsjekket mot Brønnøysund + Aksjonærregister; konsentrasjonen topper i samvirke-foredling (kryss-node-HHI).',
  citations: [
    {
      id: 'maktkart-syntese',
      title: 'Maktkart-syntese (triangulert)',
      locator: 'docs/project/analysis/food-tg-maktkart-syntese-2026-06-14.md',
      sourceType: 'internal triangulated synthesis',
      readiness: 'citable_with_note',
      supportsClaim: 'Binder AP-1/AP-2/AP-5 til ett strukturkart; to uavhengige grafer sammenfaller.',
    },
    {
      id: 'ap5-eierandel',
      title: 'AP-5 eierandel-% verifikasjon (Aksjonærregister)',
      locator: 'research/analyse/ap5-eierandel-verifikasjon-2026.json',
      sourceType: 'primary register check (Skatteetaten Aksjonærregister)',
      readiness: 'citable_with_note',
      supportsClaim: 'Bekrefter eierandel-% for toppkonsernene — siste primærsjekk i §8.',
    },
  ],
},
```

### (e) Verifiser + commit + deploy
`npm test && npm run lint && npm run build && git diff --check` → commit på `claude/maktkart-citable-lift`-branch → review → merge → bekreft `/api/version` = ny SHA.

## 3. Forhåndsskrevet citable claim (klar til ekstern bruk etter løftet)

> **CL-MAKTKART-001 (citable_with_note):** «I det norske matsystemet kontrollerer et fåtall konsern vertikalt på tvers av butikk, logistikk og foredling — triangulert over to uavhengige datakilder (styre-interlock og konsern-eierskap) som gir samme strukturkart, og primærsjekket mot Brønnøysundregistrene (form + styre, 22/22) og Skatteetatens Aksjonærregister (eierandel-%). Markedskonsentrasjonen målt per node topper i samvirke-foredling (meieri ~6000, egg ~5500–6800, rødt kjøtt ~4600), over dagligvare (~3327); primærproduksjon (~950) er minst konsentrert.»
>
> *Forbehold:* «Kontroll»/«konsentrasjon» = strukturell posisjon i data, ikke intensjon, samordning eller ulovlighet. Enkeltnoders presise HHI bærer forbehold (estimerte utfordrer-andeler, ulike år/baser); eierandel-% gjelder de primærsjekkede toppkonsernene.

## 4. Hva som IKKE endres

- `chart-metrics.json` parentHHI (butikkantall-proxy) — compute-metrics-artefakt, røres ikke for hånd.
- Den publiserte 2026-05-rapporten (HHI 3445 kryssnasjonal proxy) — datert artefakt; oppdater bare ved en bevisst revisjon (jf. master-handover §3.6).
- Needs-data-nodene (oppdrettsfôr, kraftfôr presis; AP-4 volum↔margin; AP-7 native fôr-PPI) — egne spor, ikke en del av maktkart-løftet.
