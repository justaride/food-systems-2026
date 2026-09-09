# FS-13: avgrenset embedding-pilot

Aktivering er bevisst utsatt. Vanlig søk ble valgt 2026-09-09 og er fortsatt produktets aktive søkemåte. Denne jobben er bare et trygt planverktøy for en eventuell senere pilot. Embeddings er teknisk retrievalstatus og gir ingen kilde-, påstands- eller publiseringsgodkjenning.

`scripts/generate-embeddings.ts` er dry-run som standard og krever `--id`, `--ids` eller `--limit` (maks 20). Planen inneholder dokument-ID, eksakt SHA-256 av `title + "\\n\\n" + content`, inputlengde, eligibility og avslagsgrunn. Dokumenttekst eller API-nøkkel skrives ikke i planen.

```sh
npx tsx scripts/generate-embeddings.ts --limit 5
npx tsx scripts/generate-embeddings.ts --ids doc-id-1,doc-id-2
```

Skriving og providerkall er deaktivert i denne revisjonen: `--apply` avvises
før databaseforbindelse, og ingen provider-nøkkel leses eller brukes. Bare
dry-run-planen er tilgjengelig.

Planen henter SourceDoc-identiteten separat og aksepterer bare en eksplisitt
ekstern proveniens. Hver kandidat må dessuten ha minst én
SourceCitation som er knyttet til samme SourceDoc, er `citable_external`,
fullt verifisert og har en offentlig HTTP(S)-lokator med kontrolldato.
Manglende, intern, ukjent eller sammensatt proveniens, en citation for en
annen SourceDoc, intern/privat lokator og input over 8000 tegn avvises.
Innhold trunkeres aldri.

Vektorvalidatoren forbereder kravet om 1536 endelige tall. En senere
skriveimplementasjon må kontrollere både innhold og kildeberettigelse på nytt
og binde lagringen til eksakt uendret input. Denne planjobben utfører ingen lagring.

Ingen nettverkskjøring, API-kostnad, databaseskriving, indeksendring eller
aktivering ble utført. Før eventuell pilot må eier velge dokument-ID-er,
kontrollere at ekstern tekstbehandling er tillatt, definere et lite faglig
spørsmålsett og få en separat, gjennomgått skrive-/providerimplementasjon.
