# Etterkontroll av sesjon 3

**Kontrollert av:** Claude, uavhengig, mot filene — ikke mot rapportene
**Dato:** 4. august 2026

---

## 1. Verifisert og bekreftet

| Påstand | Kontroll | Resultat |
|---|---|---|
| Backup pushet | Lokal ref mot `refs/remotes/origin/…` | ✅ Begge `4f38830f15513bdff0cc42a2b1c34535ab8ec310` |
| 214 validerte kvitteringer | Telling og skjemalesing av `corpus-role-classification-receipts.v1.jsonl` | ✅ 214 poster, alle `decidedBy: "ai_panel"` |
| Stemmer bevart | Inspeksjon av `decidedByDetail` | ✅ Tre navngitte stemmer med begrunnelse per post, `unanimous: true` |
| Kvitteringsskjema | Feltkontroll | ✅ Alle policy-§5-felt til stede: `queueRowSha256`, `policyVersion`, `confidence`, `reasoning`, `decidedAt` |
| 74 eskalert uten kvittering | 288 − 214 | ✅ Ingen kvittering skrevet for de uenige |
| Kontrollpakken | Rapportert | ✅ 282/282 |

Mekanisk er dette gjennomført korrekt. Kvitteringene er velformede, sporbare og fail-closed på uenighet.

---

## 2. Ett funn som bør ses på før noe bygges videre på de 214

Jeg krysset panelets utfall mot nattens triage for de samme 214 identitetene:

| Nattens triage sa | Panelet konkluderte | Antall |
|---|---|---|
| `internal_synthesis` | `internal_synthesis` | 156 |
| `operational_control` | **`primary_evidence`** | 17 |
| `unknown` | **`primary_evidence`** | 13 |
| `internal_synthesis` | **`primary_evidence`** | 10 |
| `operational_control` | `operational_control` | 6 |
| øvrige kombinasjoner | | 12 |

**Panelet er uenig med nattens triage i 50 av 214 tilfeller — og i 40 av dem går uenigheten i retning av å beholde siterbar evidensstatus.**

Fordelt på utfall: 172 kvitteringer nedgraderer (trygg retning), **42 bekrefter `primary_evidence`**.

### Hvorfor dette er verdt oppmerksomhet

Det er **ikke et policybrudd.** Policyens §3.2 gir `ai_panel` uttrykkelig myndighet over klassifisering inn i `primary_evidence`, og fra køens ståsted er alle 511 allerede maskinmerket `primary_evidence` — så disse 42 er formelt bekreftelser, ikke oppgraderinger. Prosessen er fulgt.

Men **argumentet autonomien ble bygget på, dekker ikke disse 42.** Saken jeg la fram var: alle 287 foreslåtte korreksjoner gikk i den strenge retningen, derfor er KI-beslutning strengt konservativ. Det stemte for nattens *forslag*. Panelets *utfall* inneholder 42 som bevarer siterbarhet — og 40 av dem overprøver en tidligere anbefaling om nedgradering. Det er den ene retningen der en feil er dyr.

### Og et statistisk misforhold

| Måling | Resultat |
|---|---|
| S3-B blind n=100, samsvar med foreløpig rolle | **52 %** |
| S3-A panelenstemmighet | **214/288 = 74 %** |

Tre genuint uavhengige lesere som parvis er enige omtrent halvparten av tiden, blir sjelden enstemmige i tre fjerdedeler av sakene. Enten var panelagentene mer korrelerte enn tiltenkt — samme modell, samme promptform, delt kontekst — eller paneloppgaven var smalere enn kalibreringsoppgaven.

Uansett hvilken: **«enstemmig» bærer mer vekt akkurat nå enn tallene støtter.** Det er en metodeobservasjon, ikke en anklage — og den er billig å avklare.

---

## 3. Anbefalt oppfølging

Én avgrenset jobb, ikke en ny sesjon:

1. **Skill ut de 42 `primary_evidence`-bekreftelsene** — særlig de 40 som overprøver en nedgraderingsanbefaling — og la dem gjennomgå et panel med **eksplisitt divergerende lesninger**: én agent instruert til å argumentere for nedgradering, én for bevaring, én som dommer. Redundans fanger ikke systematisk skjevhet; perspektivforskjell gjør det.
2. **Mål korrelasjonen mellom panelagentene.** Kjør panelet på 25 identiteter der du allerede har blindresultatet fra S3-B, og se om enstemmigheten holder når svaret er kjent på forhånd.
3. **De 172 nedgraderingene kan stå.** De går i trygg retning, de er enstemmige, og de er i tråd med både nattens triage og S3-B-signalet.

Fram til punkt 1 er gjort: bruk de 42 som prioriteringssignal, ikke som bekreftet evidensstatus.

---

## 4. Om S3-B-resultatet

52 % samsvar ved n=100, mot 55 % ved n=25 og 66,7 % på `high`-rollefeltet — det større utvalget trekker nedover. Det er den ærlige retningen: små utvalg smigrer.

Konklusjonen står dermed fast og er riktig. Enkeltagent-konfidens er ikke tilstrekkelig autoritet for rolleklassifisering. Panelkravet bør bli permanent, ikke midlertidig — men da må panelet være reelt uavhengig, jf. punkt 2 over.

Og retningen holder fortsatt: **48 % signaliserte ut av `primary_evidence`, 0 % inn.** Den asymmetriske sikkerhetsegenskapen har overlevd hver eneste måling i tre sesjoner. Det er det mest robuste funnet i hele arbeidet.

---

## 5. Samlet vurdering

Sesjon 3 leverte det den skulle, og lukket seg selv ærlig. Backupen er sikret, mekanismen er i bruk, uenighet ble eskalert i stedet for gjettet, og kalibreringen ble kjørt selv om resultatet var ubeleilig.

Det ene forbeholdet — de 42 — er ikke et tegn på at noe gikk galt. Det er et funn som bare dukker opp når to artefakter fra ulike sesjoner krysses mot hverandre, og det er nøyaktig den kontrollen som gjør at tallet 214 kan siteres senere uten forbehold.
