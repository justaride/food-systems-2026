# Innsiktssporet — START HER

**Formål:** komme gjennom materialet og forstå det nordiske matsystemet, lag for lag. Ikke bygge infrastruktur, ikke lage kildelister — **analysere**.

**Kjører parallelt med sesjon 4 og venter ikke på noe.** Ingen port blokkerer dette arbeidet.

Alle sesjoner startes her:

```bash
cd '/Users/gabrielfreeman/Documents/Food Systems 2026/.worktrees/nordic-knowledge-canonical-v1'
```

---

## 0. Hvorfor dette sporet finnes

Prosjektet har brukt fire sesjoner på sporbarhetsmaskineriet — å kunne *bevise* hvor en påstand kommer fra. Det arbeidet er nesten ferdig og venter på én signatur.

Men kunnskapen er ikke blokkert av den signaturen. 511 kilder er lest og kartlagt mot elleve målte kunnskapshull. Dekningsledgeren har 6 948 celler. Appen har tretti verdikjedevisninger og 1 634 registrerte aktører.

Det som mangler står i DATAGAP-analysen, og det er den skarpeste setningen i hele prosjektet:

> Av 73 dekningsceller er kun **2** merket høy konfidens. Resten er lav — selv der hullet er null.
> *«Lav konfidens med fullt gulv betyr: vi har navnene, ikke virkeligheten.»*

Vi vet hvem aktørene er. Vi vet ikke hva de gjør, i volum og verdi.

**Dette sporet lukker det gapet — ikke ved å skaffe nye kilder, men ved å faktisk lese de vi har.**

---

## 1. Grunnregelen

Alt som produseres her er **provisorisk internt analysemateriale**. Det gir fart uten å bryte noe:

1. Ingenting skrives til `knowledge/corpus/`, registeret, køene eller databasen
2. Hvert dokument bærer `Status: provisorisk — internt analysemateriale, ikke publiserbart`
3. Hver påstand har kilde og sidetall. Ingen påstand uten det
4. Du skriver hva en kilde **sier**, ikke at det er sant. «SOU 2024:8 oppgir X på side 42», ikke «X er tilfellet»
5. Der kildene motsier hverandre: gjengi begge, ikke velg
6. Der ingen kilde måler noe: si det. Et Type C-hull som bekreftes tomt er et **funn**

Punkt 6 er verdt å dvele ved. DATAGAP-analysen sier at et hull ingen måler «er et funn i seg selv, og ofte et policy-argument». Å oppdage at ingen i Norden måler realiserte lokale materialstrømmer er mer verdifullt enn å finne én kilde som gjør det halvveis.

---

## 2. Fan-out: elleve lag

Ett agentteam per DATAGAP-felt. Triage-postene er allerede tagget med disse feltene, så koblingen er gjort.

| Felt | Kilder | `core` | Verdikjedelag | Type |
|---|---:|---:|---|---|
| `materialstrommer` | 231 | 158 | Materialstrømmer, N-P-K, sidestrømmer | A/C |
| `nordisk_dybde` | 223 | 138 | Nordisk sammenlignbarhet | A |
| `kausalitet` | 217 | 146 | Tverrgående metode | — |
| `lokale_verdikjeder` | 210 | 126 | REKO, CSA, lokalmat | A/B |
| `aktordybde` | 197 | 110 | Domeneaktører | B |
| `makt_eierskap` | 149 | 85 | Eierskap utover konserntrærne | B |
| `beredskap_import` | 130 | 93 | Importavhengighet, beredskapsnoder | A/C |
| `alternativt_protein` | 96 | 52 | Nye proteinkilder | A/B |
| `okologi_jordhelse` | 95 | 51 | Jordhelse, biodiversitet | C |
| `offentlig_innkjop` | 85 | 55 | Offentlig innkjøp, forbruksledd | A/B |
| `kvalitativt_lag` | 75 | 38 | Menneskelig lag | B |

Feltene overlapper — 511 kilder bærer rundt 1 700 felt-tagger, altså ca. 3,3 felt per kilde. Det er meningen: en årsrapport treffer flere lag.

**Rekkefølge:** start med `materialstrommer`. DATAGAP-analysen kaller det prosjektets største substanshull, og det har mest materiale å jobbe med. Deretter de fire tynneste: `kvalitativt_lag`, `offentlig_innkjop`, `okologi_jordhelse`, `alternativt_protein`.

---

## 3. Agentprompt (bytt ut `<FELT>`)

```
Du arbeider i Food Systems 2026. Les først:
- /Users/gabrielfreeman/Documents/Food Systems 2026/INNSIKT-SPOR/START-HER.md i sin helhet
- DATAGAP-ANALYSE-2026-07-06.md, spesielt seksjonen om ditt felt
- NATTSESJON-2026-08-04/PRIORITERING-2026-08-04.md §2 og §3

Du analyserer DATAGAP-feltet <FELT>.

Hent dine kilder slik:
  python3 -c "
  import json,glob,os
  best={}
  for f in sorted(glob.glob('NATTSESJON-2026-08-04/triage/*.jsonl'), key=os.path.getmtime):
      if 'superseded' in f: continue
      for l in open(f):
          if l.strip():
              d=json.loads(l); best[d['identityKey']]=d
  for d in best.values():
      if '<FELT>' in (d.get('datagapFields') or []):
          print(json.dumps({k:d.get(k) for k in
            ('identityKey','resolvedPath','title','datagapRelevance',
             'publicationYear','geographicScope','qualityFlags',
             'claimsWorthVerifying','summary')}, ensure_ascii=False))
  "

LES KILDENE. Ikke skriv analysen fra triage-sammendragene — de er provisoriske
og målt til 52 % samsvar mellom uavhengige lesere. Prioriter `core`-kilder,
nyeste først, og topp 50 fra prioriteringsagendaen.

Har du ikke kapasitet til alle: les så mange du rekker, og oppgi eksplisitt
hvilke du ikke leste. Delvis og ærlig slår komplett og gjettet.

Skriv til INNSIKT-SPOR/ANALYSE-<FELT>.md etter malen i §4.

FORBUDT: å skrive til knowledge/corpus/, registeret, køene eller databasen.
Å hevde noe som sant uten kilde og sidetall. Å velge side når kildene er uenige.
```

---

## 4. Malen — dette er hva som gjør det til analyse

```markdown
# <Felt>: hva materialet faktisk sier

**Status:** provisorisk — internt analysemateriale, ikke publiserbart
**Kilder lest:** <n> av <m> (`core`: <n>). Uleste er listet i §9.
**Analysert:** <dato> av <agent>

## 1. Kortversjonen
<Maks 15 linjer. Hva vet vi, hvor sikkert, og hva er den viktigste mangelen?>

## 2. Hva materialet dokumenterer
<Den faktiske analysen. Tall, mekanismer, aktører, strømmer.
Hver påstand: kilde + sidetall. Skriv sammenhengende, ikke som liste.>

## 3. Tallene
| Størrelse | Verdi | År | Kilde | Målt eller modellert? |
|---|---|---|---|---|
<Der flere kilder oppgir samme størrelse: alle radene, ikke bare den nyeste.>

## 4. Der kildene er uenige
<Motstridende tall eller tolkninger, med begge sider gjengitt.
Dette er ofte det mest interessante i et felt.>

## 5. Målt kontra modellert
<DATAGAP-analysen sier materialstrømmer er «mye modellert/avledet».
Skill dem. En modellert verdi som siteres som måling er en fremtidig skandale.>

## 6. Ferskhet og geografi
<Hvor gamle er tallene? Hvilke land er dekket, hvilke ikke?
Norge er systematisk bedre dekket enn øvrige Norden — kvantifiser skjevheten
i ditt felt.>

## 7. Det ingen måler
<Type C-hull. Hva finnes det ingen kjent kilde for?
Vær presis — dette blir policy-argumenter.>

## 8. Hva som ville hevet konfidensen
<Dekningsledgeren har 71 celler på lav konfidens. For ditt felt:
hva konkret ville flyttet den til middels? Navngi kilde, register,
aktør eller måling. Skill Type A (desk research), B (aktørkontakt)
og C (ingen kjent kilde).>

## 9. Hva jeg ikke leste
<Identitetsnøkler og hvorfor. Ærlig liste.>

## 10. Usikkerhet
<Det du ikke fikk avklart.>
```

Seksjon 8 er den viktigste. Den kobler analysen direkte til de 71 lavkonfidens-cellene og gjør neste steg konkret i stedet for generelt.

---

## 5. Syntesen

Når minst fem felt er ferdige, kjør en synteseagent som leser dem alle:

> **Lim inn:**
>
> Les alle `INNSIKT-SPOR/ANALYSE-*.md` og `DATAGAP-ANALYSE-2026-07-06.md` §2 og §4.
>
> Skriv `INNSIKT-SPOR/SYNTESE.md` som svarer på:
> - Hva vet vi nå om det nordiske matsystemet som vi ikke visste 3. august?
> - Hvilke mønstre går på tvers av lagene? DATAGAP §4 kaller dem «tverrgående mønstre» — holder de fortsatt?
> - Hvor er de reelle Type C-hullene, altså det ingen måler? De er prosjektets sterkeste funn
> - Hvilke tall motsier hverandre på tvers av felt?
> - Hva er den ærlige totalvurderingen av hva denne kunnskapsbasen kan og ikke kan si i dag?
>
> Vær kritisk. En syntese som konkluderer at alt går bra har ikke gjort jobben.

---

## 6. Koblingen tilbake

Innsiktssporet gjør den gatede linjen bedre, ikke overflødig.

Seksjon 3 og 8 i hver analyse produserer **en liste over påstander som betyr noe**. Det er nøyaktig de påstandene som er verdt den dyre sporbarhetsbehandlingen når registreringsporten åpner.

Uten dette sporet ville punkt 12 vært en alfabetisk marsj gjennom 1 467 enheter. Med det blir det en målrettet gating av de påstandene som faktisk bærer konklusjoner.

---

## 7. Forventet resultat

| Etter | Du har |
|---|---|
| Første felt (`materialstrommer`) | En reell analyse av prosjektets største substanshull |
| Fem felt | Nok til en syntese som holder |
| Alle elleve | En dokumentert tilstand for hele verdikjeden, med hullene navngitt |

Første analyse bør foreligge samme dag den startes. Det er forskjellen mellom dette sporet og den gatede linjen — her er det ingenting som venter på en signatur.
