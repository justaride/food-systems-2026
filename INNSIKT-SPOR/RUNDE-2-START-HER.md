# Innsiktssporet runde 2 — START HER

**Hvorfor denne runden finnes:** runde 1 leverte en god ramme på et tynt grunnlag. `ANALYSE-materialstrommer.md` §9 sier det selv — 218 av 231 feltkilder ulest, og de 13 leste er prosjektets egne deep-research-notater, klassifisert `internal_synthesis` i triagen.

Det er ikke juks; agenten oppga det presist. Men det betyr at **det eksterne korpuset fortsatt er ulest for analyseformål**, og at analysen av prosjektets største substanshull hviler på prosjektets egne notater.

Runde 2 bygger videre på rammen fra runde 1. Den kaster ingenting.

---

## 1. Funnet som endrer designet

Jeg målte hvor mye ekte ekstern kjerneevidens som faktisk finnes — kilder som er `primary_evidence` **og** `core` for minst ett DATAGAP-felt, med panelkvitteringen som fasit der den finnes:

| | |
|---|---|
| **Unike kjernekilder** | **118** |
| Herav PDF | 63, til sammen 6 231 sider |
| Ord totalt | 2 725 803 |
| Fra 2024 eller nyere | 69 av 118 |

**118 dokumenter bærer hele evidensgrunnlaget** for alle elleve hull. De overlapper kraftig — hver kilde treffer i snitt 3,9 felt.

Det betyr at «30 kilder per felt × 11 felt» ville lest de samme dokumentene 2,8 ganger. Riktig design er motsatt: **les de 118 én gang, grundig, og skriv alle elleve analysene fra den lesningen.**

### Tre felt kan ikke nå gulvet

| Felt | Kjernekilder | Merknad |
|---|---:|---|
| `alternativt_protein` | **14** | Under gulv |
| `okologi_jordhelse` | **24** | Under gulv |
| `kvalitativt_lag` | **27** | Under gulv |
| Øvrige åtte | 31–64 | Over gulv |

Det er ikke et problem å løse — det er **et funn**. Tre av de fire feltene DATAGAP kalte tynnest, er nå bekreftet tynne på evidensnivå og ikke bare i telling. Skriv det som resultat, ikke som mangel.

---

## 2. Grunnregelen for runde 2

Én regel, og den er hard:

> **En `internal_synthesis`-kilde kan ramme inn og peke videre. Den kan aldri bære et tall.**

Hvert tall i tabellen «§3 Tallene» må ha en ekstern primærkilde med lokator. Finnes den ikke, står raden med tallet i parentes og kilden merket `kun intern syntese — ikke verifisert mot primærkilde`.

Det er hele forskjellen mellom runde 1 og runde 2. Alt annet fra `INNSIKT-SPOR/START-HER.md` gjelder uendret: provisorisk status, kilde og lokator på hver påstand, begge sider når kildene er uenige, Type C-hull som funn.

---

## 3. Fase 1 — les de 118

Manifestet er ferdig regnet ut: `INNSIKT-SPOR/KJERNEKORPUS-MANIFEST.jsonl`. Åtte skiver, balansert på ordmengde til 340 545–340 892 ord, ca. 14 kilder hver. Hver post har `identityKey`, `path`, `words`, `pages`, `title`, `year`, `fields` og `geo`.

> **Agentprompt (bytt ut `<NN>` med 0–7):**
>
> Les `/Users/gabrielfreeman/Documents/Food Systems 2026/INNSIKT-SPOR/RUNDE-2-START-HER.md` og `START-HER.md` §1 og §4.
>
> Du er kjernelesser for **skive `<NN>` av 8**. Hent dine kilder fra `INNSIKT-SPOR/KJERNEKORPUS-MANIFEST.jsonl` der `slice == <NN>`. Ca. 14 kilder, ca. 340 000 ord.
>
> **Les hver kilde faktisk.** Ikke fra triage-sammendrag — de er målt til 52 % samsvar mellom uavhengige lesere. For PDF: `pdftotext <fil> -`, eller sidevis for de store.
>
> Skriv én **ekstraksjonspost** per kilde til `INNSIKT-SPOR/ekstrakt/kjerne-skive-<NN>.jsonl`, én JSON per linje:
>
> ```json
> {
>   "identityKey": "...", "path": "...", "readState": "read_fully|read_partially",
>   "title": "<faktisk tittel i dokumentet>", "publisher": "...", "year": 2024,
>   "methodSection": true, "sourceList": true, "dataYears": [2019, 2023],
>   "findings": [
>     {"claim": "<hva kilden sier, tett parafrase>",
>      "value": "43 %", "unit": "andel", "year": 2023,
>      "locator": "s. 12" ,
>      "basis": "maalt|modellert|aktoropplysning|ikke_oppgitt",
>      "systemBoundary": "<hva er med og ikke med, hvis oppgitt>",
>      "fields": ["materialstrommer"],
>      "geo": ["NO"]}
>   ],
>   "contradicts": [{"otherIdentityKey": "...", "what": "..."}],
>   "notMeasured": ["<hva kilden eksplisitt sier den ikke måler>"],
>   "limitations": "<kildens egne forbehold>",
>   "provisional": true, "producedBy": "innsikt-runde-2"
> }
> ```
>
> `basis` er det viktigste feltet. DATAGAP sier materialstrømmene er «mye modellert/avledet» — et modellert tall som senere siteres som måling er en fremtidig skandale. Er grunnlaget uklart, skriv `ikke_oppgitt`, ikke gjett.
>
> `systemBoundary` er nesten like viktig for volumtall. «4 000 tonn fiskeslam» betyr ingenting uten å vite om det er tillatelse, kapasitet eller faktisk gjennomstrømning.
>
> Rekker du ikke alle: skriv poster for det du rakk, og list de uleste med identitetsnøkkel. Delvis og ærlig slår komplett og gjettet.
>
> Rapport til `INNSIKT-SPOR/RAPPORT-R2-SKIVE-<NN>.md`.

---

## 4. Fase 2 — skriv de elleve på nytt

Når minst seks skiver er inne, revider hver feltanalyse fra runde 1.

> **Agentprompt (bytt ut `<FELT>`):**
>
> Les `INNSIKT-SPOR/RUNDE-2-START-HER.md`, den eksisterende `INNSIKT-SPOR/ANALYSE-<FELT>.md` og alle `INNSIKT-SPOR/ekstrakt/*.jsonl`.
>
> Hent alle `findings` der `<FELT>` står i `fields`. Skriv analysen på nytt med samme mal som runde 1, men nå fra ekstraktene.
>
> **Bindende:**
> - Hvert tall i §3 må ha ekstern primærkilde med lokator og `basis`
> - `internal_synthesis` kan ramme inn, aldri bære et tall
> - §4 «Der kildene er uenige» fylles fra `contradicts` — den var nesten tom i runde 1 og skal ikke være det nå
> - §7 «Det ingen måler» fylles fra `notMeasured`
> - §9 oppgir eksakt hvor mange kjernekilder feltet har og hvor mange som ble lest
>
> Behold det som fortsatt holder fra runde 1. Der runde 1 hevdet noe ekstraktene ikke støtter: **stryk det, og si i §10 at det ble strøket.** Det er den viktigste enkeltsetningen i rapporten din.
>
> For `alternativt_protein`, `okologi_jordhelse` og `kvalitativt_lag`: gulvet på 30 kan ikke nås. Skriv analysen på det som finnes, og løft tynnheten som funn i §1.

---

## 5. Fase 3 — syntese på nytt

Revider `SYNTESE.md` fra de elleve nye analysene. Legg til én seksjon som ikke fantes:

> **Hva runde 2 endret.** Hvilke påstander fra runde 1 falt da de møtte primærkildene? Det tallet er målet på hvor mye intern syntese hadde forurenset bildet — og det er verdt å vite før noe av dette brukes utad.

---

## 6. Ærlig kostnad

2,73 millioner ord er grovt 3,6 millioner tokens bare i kildetekst. Med lesing, ekstraksjon og skriving er realistisk forbruk **5–7 millioner tokens** — rundt åtte ganger nattsesjonen, som brukte 672 000.

Runde 1 brukte 176 000. Det er derfor den ikke kunne ha lest korpuset, og hvorfor tallet i seg selv var varselet.

Fase 1 er den tunge. Fase 2 og 3 er billige, fordi de leser strukturerte ekstrakter i stedet for kilder.

---

## 7. Rydd opp i to plasseringer

Runde 1 skrev til `.worktrees/nordic-knowledge-canonical-v1/INNSIKT-SPOR/`, mens startdokumentet lå i prosjektroten `INNSIKT-SPOR/`. Nå finnes begge, og den kanoniske worktreen har 16 usporede filer.

Velg **prosjektroten** som eneste sted for innsiktsmateriale — det holder den kanoniske grenen ren. Flytt runde 1-filene dit før fase 1 starter, og la manifestet og ekstraktene ligge der.

---

## 8. Sluttsjekk

- [ ] Ingen skriving til `knowledge/corpus/`, registeret, køene eller databasen
- [ ] Hvert tall i §3 har ekstern primærkilde med lokator og `basis`
- [ ] Ingen `internal_synthesis`-kilde bærer et tall
- [ ] §9 oppgir eksakte lesetall per felt
- [ ] Strykninger fra runde 1 er eksplisitt oppgitt
- [ ] Alt merket provisorisk og internt
- [ ] Den kanoniske worktreen er ren
