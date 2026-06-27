# Mal: deep-research-prompt for én matverdikjede-celle

Kopier denne, fyll inn `{{...}}`-feltene per celle (se eksempel-cellefilene), og kjør den i deep-research-skillet / en research-agent / Codex.

---

```
Du er fakta-disiplinert kartlegger for en norsk matverdikjede-kunnskapsbase med streng kildedisiplin. Forskningstidspunkt: {{dato}}. DU SKAL IKKE GJETTE — mangler kilde, dropp noden.

## Mål
Kartlegg de SIGNIFIKANTE aktørene i cellen **{{domene}} / {{subdomene}}** (geografi: Norge; Norden kun der det kobler til norske aktører). Betydning først:
1. Først de navngitte hovedaktørene: {{seed-liste over kjente store aktører}}.
2. Deretter neste sjikt mellomstore/regionale aktører til du har dekket feltets reelle tyngdepunkt (mål: {{antall, f.eks. 15-30}} aktører eller til feltet er uttømt for signifikante aktører).
IKKE ta et alfabetisk register-utvalg. Hvis du bare finner register-rader uten å vite hvem som betyr noe, STOPP og rapporter det.

## Per aktør — research dybde (ikke bare eksistens)
- Juridisk navn + org.nr (valider mot Brreg Enhetsregisteret: https://data.brreg.no/enhetsregisteret/api/enheter/<orgnr> — aktiv, navn matcher).
- Rolle/beskrivelse (én presis setning).
- Eierskap/morselskap (hvis del av konsern — viktig for lenking).
- Nøkkelpersoner (leder/grunnlegger der kjent).
- Skala-metrikk med år (omsetning, volum, anlegg, medlemmer — der kildebelagt).
- Relasjoner: leverer til / kjøper fra / medlem av / datter av / sertifisert av / finansiert av — navngi motparten.
- Kilder: minst én hentet lokator-URL (egen side / register / offisiell omtale).

## Kilder for denne cellen
{{cellespesifikke registre/lister: Brreg NACE-koder, fagregistre, bransjeoversikter, offisielle medlemslister}}

## Verifiseringsvakter (balansert posture)
- Lokator påkrevd → ingen lokator = dropp noden.
- `verificationStatus=machine_verified` KUN når lokator er aktørens egen side eller et anerkjent register (Brreg, Debio, Økoguiden, offisiell paraply-subside) og bekrefter eksistens. Ellers `unverified`.
- Org.nr Brreg-validert; mismatch → fjern org.nr og sett `unverified`.
- Aldri sett `disputed`/`human_verified` autonomt.
- Dedup/lenk: hvis aktøren trolig alt finnes i konserntrærne (store kjente selskap), MÅ du oppgi `org_nr` så importeren lenker via `companyId` i stedet for å duplisere. Flagg slike i `notes`.

## Output 1 — kandidat-CSV (eksakt 16-kolonners header)
node_id,name,node_type,domain,subdomain,country,description,key_people,scale_metric_year,org_nr,locator_url,sourceClass,verificationStatus,confidence,accessedAt,notes

Regler:
- `node_id`: unik kebab-slug, ingen kollisjon med eksisterende `Actor.slug`.
- `node_type`: organisasjon|person|nettverk|gaard|institusjon|prosjekt|ordning|selskap (`selskap` for kommersielle AS/ASA/SA).
- `domain`={{domene}}, `subdomain`={{subdomene}}, `country`=NO (eller SE/DK/FI/IS for Norden-kontekst).
- `sourceClass`: primary|registry_snapshot|secondary. `confidence`: hoey|middels|lav. `accessedAt`: {{dato}}.
- Siter felt med komma.

## Output 2 — relasjons-JSON
[{ "from": "<node_id>", "to": "<node_id eller eksisterende slug>", "type": "supplier_to|buyer_of|member_of|subsidiary_of|certified_by|funded_by|same_location", "note": "<kort>" }]

## Rapporter til slutt
- Antall aktører per type, hvor mange `machine_verified` vs `unverified`, hvor mange flagget for lenking/menneske.
- Hovedaktører dekket vs. kjente som mangler (hull).
- Hva du droppet (kildeløst / utenfor scope) og hvorfor.
- De to filene (CSV + JSON) klare for import.
```

---

## Bruk

1. Fyll `{{...}}` fra cellefilen.
2. Kjør prompten; lagre output som `research/_status/dr-{{celle}}-node-kandidater-{{dato}}.csv` + `...-relasjoner-{{dato}}.json`.
3. Følg README-prosessen (review → import → reconcile).
