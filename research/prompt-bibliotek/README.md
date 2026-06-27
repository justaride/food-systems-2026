# Deep-research prompt-bibliotek — matverdikjede-kartlegging

Konkrete, gjenbrukbare deep-research-prompter for **det signifikante aktørlaget** i den norske matverdikjeden. Dette er dybde-sporet i hybrid-strategien:

- **Deep-research-prompter (dette biblioteket)** → hovedaktørene per celle, med struktur, eierskap, nøkkelpersoner og relasjoner. Her ligger 80% av kunnskapsverdien.
- **Register-/Codex-innhenting** (v2-runbooken) → uttømmende langhale (hver liten SME) der det er ønsket.

**Bakgrunn:** den autonome register-innhentingen «mettet» celler ved å ta de første N alfabetisk fra Brreg (20 oppdrettere som alle startet på «A», uten Mowi/SalMar/Lerøy). Deep-research løser nettopp dette: du forsker på *de viktige* aktørene, ikke et alfabetisk utvalg.

## Output-kontrakt (det kritiske)

Hver prompt produserer data som mater den **eksisterende import-pipelinen** direkte — ingen ny kode:

1. **Kandidat-CSV** (samme 16-kolonners skjema som `scripts/import-domain-actors.ts`):
   `node_id,name,node_type,domain,subdomain,country,description,key_people,scale_metric_year,org_nr,locator_url,sourceClass,verificationStatus,confidence,accessedAt,notes`
2. **Relasjons-JSON** (`[{from,to,type,note}]`) — for lenking (`supplier_to`/`buyer_of`/`member_of`/`subsidiary_of`/`certified_by`/`funded_by`).

Importeren setter `Actor.companyId` automatisk når `org_nr` matcher en eksisterende `Company`, så hovedaktører som alt er i konserntrærne (Mowi, SalMar, ASKO, Bama …) **lenkes, ikke dupliseres**.

## Prosess (per celle)

1. **Velg celle** fra dekningsboka (prioriter celler der hovedaktørene mangler).
2. **Kjør cellens prompt** (deep-research-skill, research-agent eller Codex) → kandidat-CSV + relasjons-JSON.
3. **Menneske-review** av kandidatsettet (lite og høyverdig — lett å kvalitetssikre).
4. **Importer:** `npx tsx scripts/import-domain-actors.ts --csv=<fil> --dataset=dr-<celle>-<dato> --rel=<rel.json>`.
5. **Reconcile:** `npm run audit:domain-coverage` + oppdater sesjonslogg/dashboard.
6. **Prod-wiring:** registrer `db:import:dr-<celle>-<dato>`-alias i `db:prod-sync`.

## Kvalitetsbar (gjelder alle prompter)

- **Betydning først:** navngitte hovedaktører + neste sjikt mellomstore — aldri et alfabetisk register-utvalg.
- **Streng kilde:** hver node har en hentet lokator; org.nr Brreg-validert; `machine_verified` kun ved register/egen-side, ellers `unverified`; aldri gjett — dropp heller.
- **Dedup/lenk:** flagg aktører som trolig alt finnes i konserntrærne; sett `org_nr` så importeren lenker via `companyId`.
- **Dybde over bredde:** for hovedaktørene, fang eierskap/morselskap, nøkkelpersoner, skala og relasjoner — ikke bare eksistens.

## Filer

- `_mal-deep-research-prompt.md` — delt mal alle celle-prompter fyller ut.
- `<celle>.md` — konkrete celle-prompter (én per celle, med seed-liste over kjente hovedaktører + cellespesifikke kilder).

## Forhold til runbookene

Dette biblioteket er **dybde-sporet**; v2-runbooken (`docs/superpowers/plans/2026-06-26-matverdikjede-full-kartlegging-autonom-runbook.md`) er **langhale-sporet**. Begge mater samme dekningsbok + import-pipeline. En celle regnes ikke som «kjent» før hovedaktørene er dekket via deep-research — register-metning alene teller ikke (jf. §7.1-lærdommen).
