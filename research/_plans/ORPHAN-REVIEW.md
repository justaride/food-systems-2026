# Foreldreløse PDF-er — forslag til innlegging i seed

> AUTO-GENERERT av `scripts/build-orphan-review.ts` — ikke rediger manuelt.
> Generert: 2026-04-09T13:36:08.382Z

**Totalt 0 foreldreløse PDF-er** som ikke er koblet til noen entry i seed-filene.

Hver seksjon under foreslår hvor PDF-en bør registreres. Gå gjennom, bekreft eller avvis, og legg til i aktuelle `src/lib/data/*.ts`.

## Neste steg

1. Gjennomgå hver seksjon, bekreft at klassifiseringen er riktig.
2. Legg inn valgte entries i `src/lib/data/reports.ts` eller `theses.ts` (manuell redigering — metadata må hentes eller skrives).
3. Legg til manuell mapping i `research/seed-pdf-map.overrides.json` så audit plukker dem opp.
4. Re-kjør `node --experimental-strip-types scripts/build-seed-pdf-map.ts` og `scripts/audit-platform-linkage.ts`.
5. For `pubmed-wave2`: lag et eget wave-2 manifest (`pubmed-wave2-manifest-YYYY-MM-DD.jsonl`) hvis ikke allerede eksisterende.
