---
tittel: "Master merge - prompts 12-15"
status: "Utført internt"
eier: "Master session"
dato: 2026-04-28
handoffs:
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-a-feed-source-cards.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-b-sidestream-source-cards.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-c-adoption-source-cards.md
  - docs/project/mandates/analysefabrikk-handoffs/2026-04-28-worker-bred-triage-forskningsrunde-r2-perplexity.md
canonical_docs_oppdatert:
  - docs/project/mandates/source-shortlist-food-tg.md
  - docs/project/mandates/evidence-matrix-food-tg.md
  - docs/project/mandates/claim-register-food-tg.md
  - docs/project/mandates/track-brief-b-sidestreams-nutrients.md
  - docs/project/mandates/track-brief-c-adoption.md
---

# Master merge - prompts 12-15

## 1. Kvalitetssjekk

- Alle fire worker-handoffs fulgte scope og redigerte ikke canonical docs direkte.
- Ingen funn er markert `Validert eksternt`.
- Alle Perplexity- og forskningsrunde-r2-funn er behandlet som L4/uvalidert research.
- Tall uten primærkilde, DOI, sidetall eller aktørrespons er holdt som `needs-primary-check` eller `needs-actor-validation`.
- Canonical merge er begrenset til funn som enten allerede hadde EV/CL-struktur eller kunne kobles lavrisiko til eksisterende claim-register.

## 2. Integrert nå

| Funn | Source-ID | EV-ID | CL-ID | Masterstatus |
|---|---|---|---|---|
| Matsvinnutvalget som norsk beslutningskilde for matsvinn, virkemidler, rapportering og datakrav. | SRC-B-014 | EV-B-014 | CL-B-001, CL-B-002, CL-B-008, CL-B-022, CL-C-012, CL-C-015 | source-card; bruk med tallforbehold |
| Hybrid governance for matsvinn: forebygging, redistribusjon og restbehandling må skilles. | SRC-C-008, SRC-B-014 | EV-C-008, EV-B-014 | CL-C-012 | Utført internt |
| B2 butikk/HORECA som sterkere første B-pilot/fallback-pilot. | SRC-B-004, SRC-B-005, SRC-B-014, SRC-C-010 | EV-B-004, EV-B-005, EV-B-014, EV-C-010 | CL-B-008, CL-B-022, CL-C-012, CL-C-014 | Utført internt; needs-actor-validation |
| C som tverrgående adoption-/governance-lag for A og B. | SRC-C-001, SRC-C-004, SRC-C-005, SRC-C-006, SRC-C-008, SRC-C-010 | EV-C-001, EV-C-004, EV-C-005, EV-C-006, EV-C-008, EV-C-010 | CL-C-001, CL-C-005, CL-C-006, CL-C-010, CL-C-012, CL-C-014 | Utført internt |

## 3. Godkjent som eksisterende struktur, ikke ny canonical merge

| Funn | Source-ID | EV-ID | CL-ID | Masterstatus |
|---|---|---|---|---|
| Encelleprotein/gjaerprotein kan brukes som teknisk scopingpilot, ikke volumlofte. | SRC-A-001, SRC-A-002, SRC-C-007 | EV-A-001, EV-A-002, EV-C-007 | CL-A-001, CL-A-002, CL-A-020 | source-card; needs-primary-check for tall/DOI/LCA |
| Sirkulaere forruter krever casevis HACCP/safe-by-design og substratspesifikk risikovurdering. | SRC-A-003, SRC-A-004, SRC-B-006 | EV-A-003, EV-A-004, EV-B-006 | CL-A-005, CL-A-006, CL-A-021, CL-B-009 | source-card |
| HI-risikorapporten brukes som oppdrettskontekst og overclaiming-brems, ikke som fôreffektbevis. | SRC-A-005 | EV-A-005 | ingen ny CL opprettet nå | source-card |
| EUDR brukes som EU-markeds- og sporbarhetsdriver for soya/fôr, med norsk EØS-forbehold. | SRC-C-007 | EV-C-007 | CL-C-011, CL-A-020 | needs-primary-check for norsk rettsstatus |
| RecoLab/Helsingborg og svartvann/næringsløkke holdes som benchmark/sekundærpilot. | SRC-B-013, SRC-B-008, SRC-B-010 | EV-B-013, EV-B-008, EV-B-010 | CL-B-016, CL-B-023 | needs-actor-validation |

## 4. Ikke integrert nå

| Funn | Hvorfor | Status |
|---|---|---|
| Ny A-claim om bred oppdrettsrisiko. | God kontekst, men claim-registeret har allerede mange A-claims og trenger rydding av legacy-IDer før nye baseline-claims. | backlog |
| Ny A/C-claim om norsk EUDR-soya-unntak. | Juridisk tidsfølsomt og må oppdateres etter høring/proposisjon og EU-status. | needs-primary-check |
| Soya-, fiskemel-, Denofa- og villfisktall. | Høy risiko for blanding av soyabønner, soyamel, soyaproteinkonsentrat, kraftfôr og laksefôr. | needs-primary-check |
| Okara/plantebaserte sidestrømvolum. | Fortsatt basert på uvalidert L4 og aktørantakelser. | needs-actor-validation |
| Fulltekstkrav for Stoknes 2016 og Falch/Jensen 2026. | Lokale kort er metadata-only for sentrale tall/claims. | needs-primary-check |
| Bred triage P1-kandidater. | 74 rader er lettscoret, ikke source-card. | triagert |

## 5. Masterkø etter merge

| Prioritet | Batch | Formål | Output |
|---|---|---|---|
| P1 | A-juridisk fôrsubstrat | TSE/ABP, tidligere matvarer, insekt-substrater, Mattilsynet/EU-primærkilder. | source cards og legal-gate for CL-A-011/CL-A-021 |
| P1 | A-importdata | Soya, fiskemel, Denofa, soyaproteinkonsentrat, laksefôrvolum og EUDR-Norge. | korrigert tallregister og EV/CL-nyansering |
| P1 | B-matsvinn tall og virkemidler | Matsvinnutvalget, Matvett/NORSUS, SSB/Eurostat og bransjeavtalen. | citation-ready tall med sidetall og definisjoner |
| P1 | B-prosess-sidestrømmer | Okara, plantebaserte sidestrømmer, sjømatrestråstoff, demand-side og logistikk. | actor-validation pack for B1 |
| P1 | B-næringsstoffløkker | RecoLab, NSVA, norske avløpsanlegg, N/P/K, biorest og gjødselregelverk. | source cards og benchmark-/pilotgate for CL-B-023 |
| P1 | C-norsk governance | Dagligvaretilsynet/Konkurransetilsynet, UTP/god handelsskikk, PPWR/EØS, offentlige innkjøp. | C adoption-gate med norske primærkilder |

## 6. Røde flagg

- Ikke bruk `Validert eksternt` før faktisk aktørrespons er dokumentert.
- Ikke bruk L4-forskningsrunde/Perplexity som ekstern evidens.
- Ikke summer Matsvinnutvalgets tiltakspotensial som sikker effekt.
- Ikke formulér EUDR som direkte norsk soya-plikt uten oppdatert juridisk sjekk.
- Ikke la `CL-*` legacy-IDer i evidence matrix tolkes som formelle claims før claim-registeret er ryddet.
