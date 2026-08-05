# RAPPORT AP-8 — skive 10

## 1. Status

**FULLFØRT — med eksplisitte delvis-lest-markeringer.**

- Agent/modell: Codex / GPT-5
- Arbeidsøkt: 2026-08-04 nattøkt
- Scope: slice 10 i triage-manifestet
- Manifestenheter: 27
- Skrevne triage-poster: 27
- Alle poster har `provisional: true`, `producedBy: "nattsesjon-2026-08-04"` og `slice: 10`.

## 2. Arbeidsgrunnlag og lesing

Briefen, stoppreglene, regelen om at fart skal være trygg, Vedlegg A med DATAGAP-taksonomien og AP-8-skjemaet ble lest før kildearbeidet.

Alle 27 manifestkilder ble åpnet i lesekatalogen før posten ble skrevet. Korte markdown-/tekstfiler og interne arbeidsdokumenter ble lest i sin helhet. Store PDF-er og lange tekstfangster ble lest målrettet gjennom tittel/metadata, innholdsfortegnelse, sammendrag, metode og relevante resultats-/gapdeler; referanser, appendikser eller resterende deler ble ikke alltid gjennomgått. Dette er markert i hver post.

## 3. AP-8-resultat

### ReadState

- `read_fully`: 20
- `read_partially`: 7
- `unreadable`: 0

Den delvis leste gruppen er hovedsakelig store akademiske/offisielle dokumenter og mediefangster. Mycorena-fangsten stopper midt i en setning; dette er eksplisitt markert. Kildepekerne for NMBU og Virke er lest som filer, men postene sier tydelig at de ikke inneholder den eksterne fullteksten.

### Provisorisk rolle

- `primary_evidence`: 13
- `internal_synthesis`: 12
- `operational_control`: 2

14 poster har `machineRoleWasCorrect: false`. Dette gjelder interne møte-/status-/research-synteser og de to rene kildepekerne, som ikke er behandlet som primær evidens.

### Owner-verdict

- `prioriter`: 15
- `standard`: 5
- `lav`: 7
- `ut_av_omfang`: 0

### Duplikatmistanke

Det er én mistenkt dokumentrelasjon, representert gjensidig i de to relevante postene:

- `document:cmqfqru0000pq2hvm2ulqp0d4`
- `document:cmqfqru3300q82hvmbb7u2p5o`

De har overlappende Côte d’Ivoire–EU–nordisk kakao/EUDR-scope og kildehenvisninger, men er beholdt som separate identiteter. Ingen identiteter er flettet.

## 4. Tre mest verdifulle triagefunn

1. **Nordisk HHI er en verifiseringskandidat, ikke en ferdig fasit.**  
   `document:cmql059b600r376vm8142bae2` samler interne beregninger for Norge, Sverige, Danmark, Finland og Island og viser et mulig finsk nivå over norsk nivå i den valgte avgrensningen. Rapporten dokumenterer samtidig at selskapsunivers, år, omsetningsgrunnlag og harmonisering må reproduseres før tallet kan brukes som bekreftet sammenligning.

2. **Dagligvaretilsynets undersøkelse gir aktørdybde om samarbeidsklima og opplevd makt.**  
   `document:cmp8xypng00muvvvm6qc5tx6v` beskriver metode, 328 respondenter fra 174 virksomheter og forskjeller mellom leverandør- og kjedesvar. Funn om rabatter, delisting, imitasjon, kontraktskontroll og frykt for kommersielle konsekvenser er respondentutsagn/-oppfatninger og må brukes med riktig svarbase, ikke som universelle bransjefakta.

3. **Kaffegrut har en kvantifisert hypotese, men ikke en målt nasjonal materialstrøm.**  
   `document:cmql058z500qj76vmru98i6uz` estimerer norsk kaffegrut til omtrent 13 000–15 500 tonn tørr masse per år og peker samtidig på manglende nasjonal innsamlingsstatistikk. Dette er et godt måleplan-/DATAGAP-spor, men avledningen fra import og fuktighetsantakelser må ikke presenteres som observert mengde.

## 5. Kvalitets- og stoppregler

- Kildenes utsagn er referert som kildeutsagn; ingen post hevder at et forhold er sant bare fordi kilden sier det.
- Usikkerhet, kildeklasse, metodebegrensninger, estimater og manglende produkt-/volumkoblinger er synliggjort.
- Interne synteser, kildepekerne og eksterne primær-/sekundærkilder er holdt adskilt.
- Det er ikke skrevet til corpus, register, kø eller andre forskningsartefakter.
- Det er ikke gjort identitetsfletting.
- Ingen database, `.env`-fil eller hemmelighetsmateriale ble lest.
- Ingen endring, flytting eller omdøping ble gjort under `research/evidence-pack/`.
- Ingen commits eller publiseringer er gjort.

## 6. Leveranse og kontroll

Leveransene er:

- `NATTSESJON-2026-08-04/triage/triage-skive-10.jsonl`
- `NATTSESJON-2026-08-04/RAPPORT-AP-8-skive-10.md`

JSONL-filen er kontrollert med parser: 27 gyldige JSON-linjer, alle obligatoriske felter til stede, riktig slice/provenance og ingen ugyldige readState- eller verdict-verdier.

