# Graph and remediation health 2026-05-27

**Status:** Operativ helsesjekk etter Wageningen/Food TG kontrollpass
**Scope:** Kunnskapsgraf, remediation backlog og gjenværende ryddeteknisk arbeid
**Konklusjon:** Ingen kjent teknisk blokkering for videre internt arbeid, men flere kuraterte backlogs ma behandles som arbeid og ikke som lukket kvalitet.

## Verifisert status

Kjort i lokal repo 2026-05-27:

- `npm run graph:audit`
- `npm run build-remediation-backlog`

Graf-audit er teknisk gronn:

| Kontroll | Status |
|---|---:|
| Duplicate node IDs | 0 |
| Missing endpoint edges | 0 |
| Missing href nodes | 0 |
| Edges with confidence | 2728 / 2728 |
| Confidence coverage | 100 % |

Remediation-backloggen har ingen HIGH-funn:

| Severity | Antall |
|---|---:|
| HIGH | 0 |
| MEDIUM | 1 |
| LOW | 471 |
| INFO | 0 |

## Lukket i dette passet

Nordiske sprint-/regulatoriske kildedokumenter med taggene `norden`, `regulatory` og `sirkularitet-sprint-2026-05` klassifiseres na som `intentional_catalog` i graf-isolat-triage. Dette fjernet falske positive fra den handlingsbare isolatkøen uten a skjule reelle aktor-, person- eller insight-gap.

## Gjenstaende arbeid

| Omrade | Status | Neste handling |
|---|---|---|
| Personduplikater | 32 navnegrupper, hvor 31 er maskinelle merge-kandidater og 1 krever manuell review | Batch-merge bare der `personKey`/rollegrunnlag er entydig; hold review-gruppen uten automatikk |
| Isolerte grafnoder | 183 handlingsbare isolater | Prioriter `missing_evidence_link` for insights, deretter `missing_actor_relationship`, deretter `missing_person_role` |
| Remediation backlog | 472 funn totalt, 0 HIGH | Handter den ene MEDIUM scannede PDF-en forst; LOW-grupper ryddes bare der de brukes i app, rapport eller Food TG-claim |
| Orphan files | 308 LOW-funn | Ikke slett eller arkiver i bulk; vurder filene mot DB/app-bruk forst |
| URL-helse | 87 LOW-funn | Ikke tolk `blocked` som dod kilde uten nettleser/mirror/lokal kildepakke |

## Stop-regler

- Ikke merk Wageningen/Moerman-metoden som ekstern validering, pilotbevis eller KPI-effekt.
- Ikke auto-merge personnavn der rollen eller kilden skiller seg.
- Ikke flytt katalog-/kildedokumenter ut av `intentional_catalog` bare fordi de mangler grafkant.
- Ikke rydd orphan files med sletting for de er sjekket mot appflater, rapporter, DB-rader og Food TG-claimbruk.
- Ikke bruk `blocked` URL som bevis pa dod kilde uten separat nettleser-, mirror- eller lokalpakkeverifikasjon.

## Neste ryddeslice

1. Lukk eller dokumenter den ene MEDIUM PDF-quality-raden.
2. Kjor personduplikat-merge for entydige grupper og behold manuell review separat.
3. Koble hoyverdi-insights til evidens der de brukes i Food TG, hvitbok eller offentlige appflater.
4. Rebygg remediation backlog og rerun `npm run graph:audit` etter hver batch.
