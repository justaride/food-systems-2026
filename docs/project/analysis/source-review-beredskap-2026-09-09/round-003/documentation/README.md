# Dokumentasjonsgap: datert tillegg 9. september 2026

Alle tre tidligere innholdsgap har nå en konkret disposisjon. To har en relevant originalkopi; den tredje viser feil dokumentidentitet og får en separat riktig kilde. De 15 tilbakeholdte StatFin-cellene er kontrollert mot en bevart originalrespons. Dette tillegget endrer ingen historiske kvitteringer eller kanoniske poster.

| Tidligere gap | Utført kontroll | Konsekvens |
|---|---|---|
| A3-S002, SIFO-handle | OsloMets pressemelding lenker til rapporten. PDF, ISBN og forfattere er kontrollert; hele filen har samme SHA-256 som A3-S001. | Dokumentet er tilgjengelig via utgiver; handle-nettskallet består. Én rapport, ikke to uavhengige bekreftelser. |
| A5-S002, lov 445/2006 | Originalt Finlex-hefte 71/2006, PDF 15 / trykt 1323, §§1–3 er lest og visuelt kontrollert. | Tilgangsgapet for den historiske lovteksten er løst. |
| A5-S004, traktat 95/2006 | Originalt traktathefte35/2006, PDF 1 / trykt 957 gjelder folkeregistrering. | Feil lenke er dokumentert. Norge–Finland-avtalen legges til separat fra traktathefte19/2006, nr55. |
| A3-O012, StatFin15 | Bevarte metadata, POST-forespørsel og JSON-stat2-svar; alle dimensjonskoder, indeksposisjoner, enheter og 15 verdier kontrollert. | 15/15 samsvarer med kandidatene. Metodebrudd i2022 og avgrensning til generell økonomisk tilgang beholdes. |

Se [funn og kildehasher](findings.json) og [cellekontroll](statfin-cell-check.json). Originalene og reviewpakken er private; filstiene er dokumentert i funnregisteret.

## Finlex-rettelsen endrer kildegrunnlaget

Den tidligere S004-lenken kan ikke brukes som bevis for matavtalen eller som en gyldig søkekontroll etter matprotokoller. [Original95/2006](https://www.finlex.fi/files/extra/treaty-series-pdf/fin/2006/20060035.pdf), side 957, gjelder folkeregistrering. Dette er en kildeidentitetsfeil som ikke ble oppdaget ved forrige nettskallkontroll.

[Original55/2006](https://www.finlex.fi/files/extra/treaty-series-pdf/fin/2006/20060019.pdf), side 568, inneholder norsk og finsk tekst. Artikkel3 åpner for særskilte leveranseprotokoller, mens artikkel 4 gir et betinget unntak for midlertidige produktrestriksjoner. Hovedteksten er ingen matspesifikk protokoll med volum, mottakerrett eller ledetid. D-O004 støtter derfor testoppdrag C5: disponeringsvilkår må modelleres som en avhengighet også når den fysiske transporten er mulig. Gjeldende rett og nåværende protokollportefølje er ikke attestert her.

## StatFin kan nå reproduseres

[Statistics Finlands API-veiledning](https://statfin.stat.fi/api1.html) og tabellmetadata gir den forkortede adressen `eot/132a.px`. Utvalget bruker `elinvaihe_5_20200201 = SS,31,32`, `timeperiod_y = 2021…2025` og `contentscode = koti_vaik_pros`. Originalsvaret oppgir siste oppdatering6.mars2026 og metodebrudd 2022. Tallene beskriver husholdninger med vansker/store vansker med å få endene til å møtes; de er ikke en matmangelindikator som kan rangeres sammen med FIES/SIFO.

## Avgrensning

SIFO ble lest for identitet, sammendrag og samsvar med tidligere original. Faglige vurderinger fra runde002 gjelder fortsatt sitt tidligere angitte leseomfang. Et tilgangsgap som løses gir ikke automatisk ny faglig bekreftelse av alle påstander. Tidligere83/86 og 117/6/4 er uendrede historiske rundetall; denne runden har egne fem vurderinger og kildedisposisjoner.
