---
tittel: "Food Systems 2026 — beslutningsnotat for P0-portene"
status: Beslutningsforespørsel — ingen vedtak er fattet i dette dokumentet
eier_for_beslutning: JT / Cathrine / Einar / Gabriel + representant for foreslått organisatorisk hjem
forberedt_av: Gabriel
dato: 2026-08-24
gate: internal
gjelder: IG-001, IG-002, IG-003, IG-005
kanonisk_status: ../status/food-systems-completion-register-2026-07-15.md
gapregister: ../../../research/_status/information-gap-register-2026-08-11.jsonl
operativ_plan: gap-closure-operating-plan-2026-08-11.md
decision_log: decision-log-food-tg.md
---

# Food Systems 2026 — beslutningsnotat for P0-portene

## 1. Hva dette notatet er

Dette er forarbeidet til fase-0-beslutningsmøtet i
[gap closure operating plan](gap-closure-operating-plan-2026-08-11.md) §4. Det
er **ikke** et vedtak, og det flytter ingen status. Vedtak skjer bare som
daterte rader i [decision-log-food-tg.md](decision-log-food-tg.md), og status
flyttes bare i completion-registeret etter reglene der.

Notatet finnes fordi fire porter er de eneste som nå blokkerer fase 1. Alt de
venter på er beslutninger — ikke utredning, ikke utvikling, ikke mer data.

## 2. Utgangspunktet: alt teknisk er grønt

Per 2026-08-24 er den tekniske og metodiske siden ferdig for dette formålet:

| Flate | Tilstand |
|---|---|
| Produksjon | Deployet og frisk; `dbOk`, sidegater og kunnskapsgater grønne |
| Migrasjonsport `IG-004` | **Lukket** — 35 migrasjoner reconcilet, minst-privilegert migrasjonsidentitet, eksakt-SHA readback |
| Testflate | 2 465 tester grønne, lint grønn, corpus-health-bundelen fersk etter deploy |
| KI-kalibrering `IG-006` | **Målt og publisert**: kritisk feilrate (fabrikasjon + feilkobling) **0,14 %** [0,02–0,79 %] over 717 adjudikerte assertions; kvalitetsrate 4,04 % |

Kalibreringen er relevant for beslutningen på én bestemt måte: den fjerner
«vi vet ikke om KI-grunnlaget holder» som grunn til å utsette. Vi vet nå hvor
godt det holder, med publisert usikkerhet og erklærte grenser. Den sier
derimot **ingenting** om eierskap, rettigheter eller publiseringsrett — det er
nettopp det disse fire portene handler om.

## 3. Den ene beslutningen som låser opp de tre andre

`IG-002`, `IG-003` og `IG-005` har alle `IG-001` som avhengighet. Rekkefølgen
er derfor ikke en preferanse, den er strukturell:

```text
IG-001  organisatorisk hjem, eier, driftsnivå
   ├──> IG-002  closeout og videreføringsmandat
   ├──> IG-003  recovery-governance (RPO/RTO, eier, kadens)
   └──> IG-005  personvern-, rettighets- og publiseringspolicy
```

Uten `IG-001` finnes det ingen som kan vedta de tre andre. Møtet bør derfor
begynne der og ikke gå videre før den raden er fylt.

---

## 4. IG-001 — Organisatorisk hjem, ansvarlig eier og driftsnivå

**Status:** `blocked_external`. Continuation-planen beskriver tre driftsnivåer,
men hjem, eier og valgt nivå er ikke vedtatt.

**Hva som må velges — ett av tre:**

| Nivå | Hva det betyr | Konsekvens |
|---|---|---|
| **A. Bevaring** | Plattformen fryses som lesbar dokumentasjon. Ingen nye data, ingen vedlikeholdssykluser. | Billigst. Fase 1 åpnes ikke. Kunnskapen forvitrer etter hvert som kilder blir utdaterte. |
| **B. Vedlikeholdt forskningsplattform** | Intern beslutningsstøtte holdes i drift og oppdateres kontrollert. | Middels kostnad. Åpner fase 1. Ingen ekstern tjeneste. |
| **C. Observatorium / pilotstøtte** | B, pluss ekstern brukerflate og partnerforpliktelser. | Dyrest. Krever i tillegg fase 3-portene; **ikke tilgjengelig nå**. |

**Må navngis i samme vedtak:** ansvarlig eier (med myndighet og avsatt tid),
dataoperatør, kunnskapsforvalter, og juridisk/personvern-reviewer dersom B
eller C velges.

**Exitkriterier:** hjem navngitt · eier har myndighet og avsatt tid ·
driftsnivå, startdato, reviewdato og stopplinje loggført.

**Anbefaling til møtet:** velg **B**, med eksplisitt reviewdato. B er det
eneste nivået som både bevarer verdien av arbeidet og holder kostnaden
avgrenset. A kan alltid velges senere; C kan ikke velges før fase 3-portene
er lukket uansett.

---

## 5. IG-002 — Formell closeout, leveranseaksept og videreføringsmandat

**Status:** `blocked_external`. M16–M18 finnes som kontrollerte interne
leveranser, men er ikke akseptert, avvist eller parkert som vedtak.

**Hva som må avgjøres:** for hver av M16 (roadmap), M17 (status) og M18
(continuation plan) — **akseptert**, **avvist med begrunnelse**, eller
**parkert med begrunnelse**. I tillegg: eksplisitt scope og geografisk
ambisjon, og enten videreføringsmandat eller bevaringsmodus.

**Exitkriterier:** hver milepæl har en beslutning · scope og geografisk
ambisjon er eksplisitt · videreføringsmandat eller bevaringsmodus er vedtatt.

**Merk:** «ingen beslutning» er ikke en nøytral tilstand her. Uten dette
vedtaket kan prosjektet arbeide internt, men ikke fremstille kontrakts-
leveransene som formelt godkjent overfor noen part.

---

## 6. IG-003 — Recovery-governance og fersk releasekvittering

**Status:** `monitoring` — den eneste av de fire som ikke er `blocked_external`.
Det tekniske beviset finnes allerede: GabiBFree Estate har separate backup-,
restore- og offsite-bevis for Food Systems-asset-nøkkelen, og releasekjøringen
2026-08-11 verifiserte kryptert artefakt med restore.

**Det som mangler er rene tall og navn, ikke arbeid:**

| Felt | Må vedtas |
|---|---|
| RPO (akseptabelt datatap) | f.eks. 24 t |
| RTO (akseptabel nedetid) | f.eks. 8 t |
| Retensjon | hvor lenge backup beholdes |
| Navngitt eier | hvem svarer når restore trengs |
| Neste testdato | når neste restore drill kjøres |

**Exitkriterier:** uovervåket off-node kadens bevist på publisert hovedgren ·
fersk pre-migration-backup kontrollert · restore drill uten datatap bundet til
samme artefakthash · eier, RPO, RTO, retensjon og neste testdato dokumentert.

**Anbefaling:** dette er 15 minutter på møtet. Bekreft samtidig at neste
uovervåkede 03:30-kjøring faktisk har gått.

---

## 7. IG-005 — Personvern-, rettighets-, rettings- og publiseringspolicy

**Status:** `blocked_external`. Dette er den porten med reell juridisk
eksponering, og den bør ikke behandles som en formalitet.

**Hvorfor:** databasen inneholder **1 740 personprofiler**, styredata og
maktkart, samiske kunnskapskilder og omfattende tredjepartsmateriale. Det
finnes ingen vedtatt policy for behandlingsgrunnlag, retting, sitatrett,
kildevilkår eller publiseringsnivå. GDPR-pliktene gjelder uavhengig av hvor
god kildeføringen er.

**Hva møtet kan vedta selv:** publiseringsnivå per dataklasse — internt,
partnerdelt, offentlig — og hvem som eier rettings-/slettingskanalen.

**Hva som krever kvalifisert review og altså bestilles, ikke vedtas:**
behandlingsgrunnlag per datakategori, sitatrett og kildevilkår, samt
intervju- og samtykkemaler.

**Exitkriterier:** behandlingsgrunnlag og ansvar dokumentert ·
rettings-/slettingskanal finnes · publiseringsnivå per dataklasse vedtatt ·
intervju- og kildebruksmaler juridisk reviewet.

**Sperrer inntil lukket:** ingen nye intervjuer, ingen kontakt med samiske
kunnskapsbærere, og ingen bred ekstern publisering av person-, effekt- eller
partnerpåstander.

---

## 8. Vedtaksrader klare for decision-loggen

Kopier inn i [decision-log-food-tg.md](decision-log-food-tg.md) og fyll ut.
Manglende beslutning **skal** loggføres som eksplisitt parkering eller
bevaringsmodus — ikke stå tom.

| Dato | Beslutning | Eier | Begrunnelse | Lukker | Møtereferanse |
|---|---|---|---|---|---|
| ÅÅÅÅ-MM-DD | Organisatorisk hjem = «…». Driftsnivå = A/B/C. Eier = «…». Start = …, review = …, stopplinje = … | | | IG-001 | |
| ÅÅÅÅ-MM-DD | M16 akseptert/avvist/parkert; M17 …; M18 …. Scope og geografisk ambisjon = «…». Videreføring/bevaring = … | | | IG-002 | |
| ÅÅÅÅ-MM-DD | RPO = …, RTO = …, retensjon = …, recovery-eier = «…», neste restore-test = … | | | IG-003 | |
| ÅÅÅÅ-MM-DD | Publiseringsnivå per dataklasse = …. Rettings-/slettingseier = «…». Juridisk review bestilt av «…» innen … | | | IG-005 | |

## 9. Hva vedtakene låser opp

Når `IG-001`, `IG-003` og `IG-005` er lukket, `IG-002` har eksplisitt
videreførings- eller bevaringsvedtak, og reviewere er navngitt, er
fase 1-porten i operating plan §9 oppfylt. Da kan disse startes:

- appraisal- og kalibreringsarbeidet videre på målt grunnlag (`IG-006`);
- intervjupilot, men først etter at rettighetsporten i `IG-005` er lukket (`IG-007`);
- uavhengig evalueringssøk for prosjektutfall (`IG-008`);
- arkivering av publiseringskritiske kilder (`IG-015`).

## 10. Hva som skjer hvis møtet ikke konkluderer

Ingenting går i stykker teknisk — plattformen står, testene er grønne, dataene
er trygge. Men fase 1 forblir stengt, og fire ting fortsetter å koste:
kildene eldes, intervjuobjekter kan ikke kontaktes, arkivgjelden vokser, og
ingen navngitt person eier risikoen. Bevaringsmodus er et legitimt utfall —
men det bør velges, ikke oppstå.

## 11. Kontroll

```bash
npm run phase:validate
git diff --check
```

Dette notatet oppretter ikke et parallelt sannhetsregister. Ved konflikt
gjelder completion-registeret.
