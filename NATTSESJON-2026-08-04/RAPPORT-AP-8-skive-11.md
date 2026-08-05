# Rapport AP-8 skive 11: kildelesing og triage

**Status:** FULLFØRT  
**Agent:** codex  
**Tidsrom:** 2026-08-04  
**Gren / worktree:** kun lesing fra kanonisk worktree; skriving kun til egen NATTSESJON-skive og egen rapport  
**Commits laget:** ingen

## 1. Hva som ble gjort

Manifestet ble filtrert på `slice == 11`. Det ga 26 enheter med samlet forventet ordmengde 194377. Hver manifestkilde ble åpnet og lest i den kanoniske lesekatalogen før triageposten ble skrevet.

Det ble skrevet én JSONL-post per enhet til egen skivefil. Kildene ble klassifisert etter faktisk innhold: primærstudier, myndighets- og sertifiseringskilder, interne synteser, operative locator-/indeksnotater, sekundær medieomtale og uleselig transcriptfragment. Alle postene er merket `provisional: true` og `producedBy: "nattsesjon-2026-08-04"`.

Ingen kilde ble behandlet som bekreftet sannhet. Påstander er formulert som hva kilden oppgir eller som verifikasjonspunkter. Ingen identiteter ble flettet.

## 2. Kommandoer og resultat

- Manifestlesing og filtrering på slice 11: 26 enheter funnet; alle 26 oppførte kildebaner fantes i lesekatalogen.
- `pdfinfo` og `pdftotext` ble brukt på de fem PDF-kildene. Relevante deler av sammendrag, innholdsfortegnelse, metode, resultater, diskusjon og begrensninger ble lest.
- Tekstkildene ble åpnet direkte med `sed`/`rg` og lest før klassifisering.
- Python JSON-validering av skivefilen ga: `manifest 26 posts 26`, `missing []`, `extra []`, `duplicate_post_ids 0`, `bad_provisional 0`, `bad_producedBy 0`.
- Kontrollert read-only worktree hadde ingen endringer etter lesingen.
- Ingen database, `.env`, hemmelighet, register, kø eller `research/evidence-pack/` ble skrevet til.

## 3. Verifikasjon

- Antall manifestenheter: **26**.
- Antall poster skrevet: **26**.
- `readState`: **23 `read_fully`**, **2 `read_partially`**, **1 `unreadable`**.
- `verdictForOwner`: **11 `prioriter`**, **10 `standard`**, **4 `lav`**, **1 `ut_av_omfang`**.
- `machineRoleWasCorrect: false`: **15** av 26. Feilene gjelder hovedsakelig interne synteser, operative kontrollnotater, locator-/indeksposter og sekundærkilder som filheuristikken ikke skilte tydelig fra evidens.
- Alle 26 poster har obligatoriske skjemaalternativer, gyldig JSON på én linje, korrekt slice, korrekt `provisional` og korrekt `producedBy`.
- Det ble ikke registrert noen duplikatmistanke i skiven.

De tre mest verdifulle funnene i skiven:

1. `document:cmp8xyna000hdvvvmbq6hwpwb` — NHH-oppgaven oppgir 568 lokasjoner og 215 relevante dokumenter om restriktive klausuler, og viser samtidig at resultatene er avhengige av et tverrsnitt fra 2020 og flere identifikasjonsforbehold.
2. `document:cmqgiod4m00mm4nvmmhjlsda8` — Debios statistikkhefte oppgir 423044 dekar økologisk areal, 1914 landbruksvirksomheter og dekning av foredling, import, omsetning og servering i 2024.
3. `document:cmqu1y7ao00t2ktvme1lrhvyq` — R13-underlaget oppgir et skille mellom rå og fôrkorrigert norsk selvforsyning og markerer at proteinspesifikk selvforsyning og akvakulturfôr ikke er fullt dekket av den brukte målingen.

## 4. Hva som gjenstår

Ingen manifestenheter mangler post.

Mulig videre arbeid er kildehenting og kontroll av de to delvis lesbare/tilgjengelige sporene: KRAVs direkte rapporttekst og resten av Sifted-artikkelen. Locator-notatet om islandsk melmølle og FAO Brasil-uttrekket bør ikke brukes som substansiell evidens uten at den underliggende eller riktige kilden hentes.

## 5. Beslutninger Gabriel må ta

Ingen beslutning er nødvendig for å godkjenne selve AP-8-skiven. Eventuell videre bruk av eldre rapporter, interne synteser og sekundærkilder bør følge `uncertainty` og `qualityFlags` i postene.

## 6. Risiko og forbehold

- Alle triageposter er foreløpige og er ikke en sannhetsbekreftelse.
- Flere lokale filer er snapshots, locator-notater eller interne synteser. De må ikke forveksles med fersk primærkilde eller full kildeverifikasjon.
- De to delvis tilgjengelige kildene er markert med `read_partially`; transcriptfragmentet er markert `unreadable` selv om filen fysisk kunne åpnes, fordi innholdet ikke var lesbart som sammenhengende tale.
- Tall med ulikt år, ulik definisjon eller sekundær opprinnelse er lagt i `claimsWorthVerifying` og skal ikke slås sammen uten ny kontroll.
- `machineRoleWasCorrect:false` i 15 poster er et systemfunn: fil- og køheuristikk alene er utilstrekkelig for å skille primære evidenskilder fra interne arbeidsartefakter og operative spor.
