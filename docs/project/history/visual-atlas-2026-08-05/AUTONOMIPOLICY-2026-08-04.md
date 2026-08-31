# Autonomipolicy for Food Systems 2026

> Historical snapshot preserved from `codex/visual-system-atlas-v1`. Dated claims and repository/database status are not current. This file is not an active policy, release instruction, or authorization.

**Vedtatt:** 4. august 2026 av Gabriel Freeman (prosjekteier)
**Gjelder:** alle KI-agenter som arbeider i dette repoet
**Status:** stående. Agenter leser dette i stedet for å spørre.

---

## 1. Hvorfor dette dokumentet finnes

Prosjektet er bygget fail-closed: ved tvil stopper systemet og venter på eier. Det er riktig for **irreversible** og **omdømmekritiske** operasjoner. Men det har spredt seg til beslutninger som ikke er noen av delene, og resultatet er at eieren har blitt flaskehals for arbeid han ikke er bedre kvalifisert til å gjøre enn agenten.

Dokumentet skiller de tre tingene som har blitt blandet sammen:

| Type | Hva porten egentlig skyldes | Løsning |
|---|---|---|
| **A. Manglende verktøy** | Ingen har bygget mekanismen | Bygg den. Ingen eierbeslutning involvert. |
| **B. Hemmelighet hos eier** | Legitimasjon finnes bare hos ham | Gjør den lesbar der det er trygt |
| **C. Ansvar** | Noen må stå til rette | Beholdes hos eier |

Bare **C** er en ekte port. A og B ser like ut fra innsiden av en agentsesjon, og det er derfor de har fått samme behandling.

---

## 2. Bærende prinsipp: asymmetri, ikke terskel

Den avgjørende testen er ikke *hvor sikker* en beslutning er, men **hvilken vei den feiler.**

> En beslutning som ved feil gjør korpuset **strengere**, kan tas av KI.
> En beslutning som ved feil gjør korpuset **løsere**, kan ikke.

Konkret for rolleklassifisering: å nedgradere noe fra `primary_evidence` betyr at det ikke lenger kan siteres som kilde. Tar KI feil, har prosjektet mistet én mulig kilde — en kostnad som kan rettes når som helst. Å oppgradere noe *til* `primary_evidence` betyr at prosjektets egne notater kan bli sitert som ekstern evidens. Tar KI feil der, er skaden på troverdigheten reell og vanskelig å reversere.

Målingen 4. august bekreftet at asymmetrien er anvendelig i praksis: av 287 foreslåtte rollekorreksjoner gikk **287 i den trygge retningen og 0 i den farlige.**

Det gir også en ubehagelig observasjon som er verdt å ha skrevet ned: **å la korreksjonene ligge ubekreftet er selv det utrygge valget.** 287 filer står i dag merket som primærevidens uten å være det. Status quo er ikke nøytral.

---

## 3. Beslutningstabell

### 3.1 KI avgjør selvstendig

Kvittering merkes `decidedBy: "ai"` med agentidentifikator og begrunnelse.

- Rolleklassifisering **ut av** `primary_evidence` ved `high` konfidens
- All kode, alle tester, all diagnostikk, all validering
- All lesing — filer, database, private captures i kontrollert arbeidsflyt
- Triage, prioritering, DATAGAP-kobling, locatorsøk
- Reversible operasjoner i egne worktrees og grener
- Alle read-only databasekontroller, inkludert `--plan-only`

### 3.2 KI-panel avgjør

Tre uavhengige agenter, hver med sin egen lesing. Enstemmighet kreves. Uenighet eskalerer til eier. Kvittering merkes `decidedBy: "ai_panel"` med alle tre stemmene bevart.

- Rolleklassifisering ved `medium` eller `low` konfidens
- Rolleklassifisering **inn i** `primary_evidence`
- Omfangsvurderinger — hører en kilde til i matsystemomfanget?
- Identitetssammenslåing der begge sider er lest og dokumentert

### 3.3 Eier avgjør

Kvittering merkes `decidedBy: "owner"`.

- **Den første databasemutasjonen** og Ed25519-signaturen
- Rettighetsavklaringer — kan en kilde lagres, siteres, publiseres?
- Sápmi-sporet, som krever rettighetshaver-ledet rute
- Ekstern publisering og dekningspåstander utad
- Endring av denne policyen

---

## 4. Hva som aldri delegeres

Uavhengig av konfidens, panel eller hastverk:

1. **Å omgå en fail-closed-sperre.** Karantenen, `owner_review_required`, `decisionReceiptRequired` — disse endres ved å endre policyen, aldri ved å gå rundt dem i en enkeltsak.
2. **Å hevde at noe er bevist når det er antatt.** Underclaiming er husstandarden. En agent som er usikker skriver `low` og forklarer.
3. **Å slette eller endre bevismateriale.** `research/evidence-pack` er hashbundet.
4. **Å skrive hemmeligheter i sporede artefakter.** Ingen `DATABASE_URL`-verdi, ingen private absolutte stier, ingen nøkkelbytes — i kode, output, kvittering eller rapport.
5. **Å forankre den gamle 1 555-genesisen eksternt.**

---

## 5. Kvitteringskravet

Hver beslutning som endrer korpustilstand bærer:

```json
{
  "decidedBy": "ai | ai_panel | owner",
  "decidedByDetail": "<agentidentifikator, panelstemmer, eller eier>",
  "decidedAt": "<ISO-8601>",
  "confidence": "high | medium | low",
  "reasoning": "<begrunnelse basert på innhold, ikke filnavn>",
  "queueRowSha256": "<hash av køraden da beslutningen ble tatt>",
  "policyVersion": "2026-08-04"
}
```

`queueRowSha256` er det som gjør kvitteringen etterprøvbar: endres køraden senere, ugyldiggjøres kvitteringen automatisk og beslutningen må tas på nytt.

`decidedBy` er ikke byråkrati. Det er svaret på spørsmålet en fremtidig gransker vil stille — *hvem bestemte dette?* — og at svaret finnes er selve forskjellen mellom en sporbar og en usporbar kunnskapsbase. En maskinbestemt klassifisering er ikke et problem. En klassifisering der ingen vet hvem som tok den, er det.

---

## 6. Kalibreringskravet

Autonomi på grunnlag av en umålt konfidensskala er en uprøvd påstand — nøyaktig den typen dette prosjektet er bygget for å nekte.

**Derfor:** før `high`-konfidens-terskelen brukes til å skrive kvitteringer i bulk, skal den måles. Metode: et tilfeldig utvalg klassifiseres på nytt av en agent uten tilgang til den første posten, og samsvaret rapporteres.

Terskelen justeres etter resultatet, ikke etter magefølelse. Målingen gjentas når klassifiseringsmetoden endres vesentlig.

Målt samsvar oppgis når materialet siteres. Det er forskjellen mellom en forsvarlig og en håpefull påstand.

---

## 7. Eierens rolle etter denne policyen

Ikke å gjøre arbeidet. Å være **signatar** for det som er irreversibelt, og **ankeinstans** for det panelet ikke blir enige om.

Praktisk betyr det at forberedelsen — backup, restore-kvittering, rehearsal, hele autorisasjonspakken — gjøres og verifiseres av KI, og at eieren kjører én kommando og signerer. Fem minutter, ikke en kveld.

Merk at seremonien rundt den første mutasjonen er tung fordi det er den *første* skrivingen til en jomfruelig revisjonstabell. Når `ControlledMutationAudit` har én kvittering og det eksterne ankeret står, er mønsteret etablert.

---

## 8. Revisjon

Denne policyen endres kun av eier, og endringen dateres. Agenter som mener en grense er feil plassert, skriver det i rapporten sin — de flytter den ikke.

| Versjon | Dato | Endring |
|---|---|---|
| 2026-08-04 | 4. aug 2026 | Første versjon. Asymmetriprinsippet, tre beslutningsnivåer, `decidedBy`-krav, kalibreringskrav. |
