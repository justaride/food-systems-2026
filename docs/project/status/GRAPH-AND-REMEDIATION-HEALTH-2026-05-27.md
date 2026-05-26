# Graph and remediation health 2026-05-27

**Status:** Operativ helsesjekk etter Wageningen/Food TG kontrollpass
**Scope:** Kunnskapsgraf, remediation backlog og gjenværende ryddeteknisk arbeid
**Konklusjon:** Ingen kjent teknisk blokkering for videre internt arbeid, men flere kuraterte backlogs ma behandles som arbeid og ikke som lukket kvalitet.

## Verifisert status

Kjort i lokal repo 2026-05-27:

- `npm run graph:audit`
- `npm run build-remediation-backlog`
- `npm run db:audit`
- `npm run db:audit:strict-sources`
- `npm run audit:citable-reports`
- `npm run lint`
- `npm test`
- `npm run build`
- `npm audit --audit-level=moderate`

Graf-audit er teknisk gronn:

| Kontroll | Status |
|---|---:|
| Nodes | 2137 |
| Edges | 2671 |
| Duplicate node IDs | 0 |
| Missing endpoint edges | 0 |
| Missing href nodes | 0 |
| Edges with confidence | 2671 / 2671 |
| Confidence coverage | 100 % |

Remediation-backloggen har ingen HIGH-funn:

| Severity | Antall |
|---|---:|
| HIGH | 0 |
| MEDIUM | 0 |
| LOW | 471 |
| INFO | 0 |

## Lukket i dette passet

Nordiske sprint-/regulatoriske kildedokumenter med taggene `norden`, `regulatory` og `sirkularitet-sprint-2026-05` klassifiseres na som `intentional_catalog` i graf-isolat-triage. Dette fjernet falske positive fra den handlingsbare isolatkøen uten a skjule reelle aktor-, person- eller insight-gap.

Den siste MEDIUM PDF-quality-raden er lukket som en eksplisitt arkivbeslutning: den 1 KB store RASTECH-PDF-en er en tom browser-print, mens den faktiske artikkelteksten finnes i `research/evidence-pack/sirkular-konkurser/billund-aquaculture/media-rastech.md` med 606 ord. Backlog-regelen lukker bare slike rader nar lokal erstatningstekst og ordtelling er dokumentert i `research/PDF-OCR-REVIEW.csv`.

Entydige PersonProfile-/BoardMember-navnesplitt ble deduplisert i lokal DB etter guardet dry-run: 31 PersonProfile-tapere er slettet over to batcher, 31 merge-vinnere er samordnet, 30 single-profile nokler er normalisert, 59 BoardMember-rader er re-noklet, og 32 dupliserte BoardMember-trippelrader er fjernet etter re-nokling. Scriptet holder fortsatt Monica Odegard-gruppen igjen fordi de to profilene ikke deler selskap evidens.

## Gjenstaende arbeid

| Omrade | Status | Neste handling |
|---|---|---|
| Personduplikater | 1 navnegruppe, 0 maskinelle merge-kandidater og 1 manuell review | Behold Monica Odegard uten automatikk til selskap-/rollegrunnlag er avklart |
| Isolerte grafnoder | 183 handlingsbare isolater | Prioriter `missing_evidence_link` for insights, deretter `missing_actor_relationship`, deretter `missing_person_role` |
| Remediation backlog | 471 funn totalt, 0 HIGH, 0 MEDIUM | LOW-grupper ryddes bare der de brukes i app, rapport eller Food TG-claim |
| Orphan files | 308 LOW-funn | Ikke slett eller arkiver i bulk; vurder filene mot DB/app-bruk forst |
| URL-helse | 87 LOW-funn | Ikke tolk `blocked` som dod kilde uten nettleser/mirror/lokal kildepakke |

## Stop-regler

- Ikke merk Wageningen/Moerman-metoden som ekstern validering, pilotbevis eller KPI-effekt.
- Ikke auto-merge personnavn der rollen eller kilden skiller seg.
- Ikke flytt katalog-/kildedokumenter ut av `intentional_catalog` bare fordi de mangler grafkant.
- Ikke rydd orphan files med sletting for de er sjekket mot appflater, rapporter, DB-rader og Food TG-claimbruk.
- Ikke bruk `blocked` URL som bevis pa dod kilde uten separat nettleser-, mirror- eller lokalpakkeverifikasjon.

## Neste ryddeslice

1. Koble hoyverdi-insights til evidens der de brukes i Food TG, hvitbok eller offentlige appflater.
2. Gjor Monica Odegard-review manuelt bare hvis ny selskap-/rolledokumentasjon hentes inn; ikke auto-merge gruppen.
3. Rebygg remediation backlog og rerun `npm run graph:audit` etter hver batch.
