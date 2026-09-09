# FS15 — sammenhengende intern hvitbokleser

Dato: 2026-09-09
Status: implementert lokalt; menneskeporter uendret

## Resultat

`/hvitbok` leser nå hele den kanoniske interne syntesen i stedet for tre frakoblede
utkast. Leserveiledningen og alle 15 kapitler projiseres direkte fra
`research/whitepaper/food-systems-2026-synthesis-v2.md`. Hvert uttrekk har
kildelinjer, kapittelhash og overskriftsankre. Oversikten viser masterfilens dato,
status og SHA-256, og gir direkte innganger til statusreglene, begrensningene og
kildekartet. Forrige/neste-navigasjon følger manusrekkefølgen.

Projeksjonen genereres bare med:

    npx tsx scripts/generate-whitepaper-chapters.ts

Driftssjekk for avvik mellom manus og projeksjon:

    npx tsx scripts/generate-whitepaper-chapters.ts --check

De tidligere URL-ene `/hvitbok/kort-til-jan-thomas`,
`/hvitbok/nordisk-sirkularitet` og `/hvitbok/fokusomraader` er bevart som aliaser
til de nærmeste kanoniske v2-kapitlene.

## Autoritetsgrense

Visningen er merket **Intern syntese – avventer beslutning** og
`externalReady: false`. Implementasjonen endrer ikke mastermanuset, claim-lock,
coverage readiness, database eller reviewstatus. [I]- og [H]-påstander beholder
stoppregelen fra manuset. Lokal kodeferdigstilling er ikke faglig, juridisk,
programmatisk eller publiseringsmessig godkjenning.

## Gjenstående menneskebeslutninger

1. Faglig og redaksjonell gjennomgang av statuskodene og kildekartet.
2. Godkjenning eller avvisning av [I]-påstander og lukking av relevante [H]-porter.
3. Eksplisitt beslutning om mottaker, delingsnivå og eventuell ekstern publisering.
