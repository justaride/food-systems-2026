# B11 - Omsetningsandeler: 10-15 års tidsserie

Status: delvis dataartefakt, 2020-2024 maskinlesbar serie opprettet
Gap-ID: B11
Lane: hurtig-plukk
Dato: 2026-04-29

## Hva kan brukes nå

Konkurransetilsynets Dagligvarerapport 2024-25, Figur 2, gir en offentlig 2020-2024-serie for norsk dagligvare. 2020-2021 er historiske NielsenIQ-verdier i figuren, mens 2022-2024 er Konkurransetilsynets beregning fra kjedenes innrapporterte omsetning.

| År | NorgesGruppen | Coop | Rema 1000 | Bunnpris | CR3 | HHI |
|---:|---:|---:|---:|---:|---:|---:|
| 2020 | 44,1 % | 29,3 % | 23,2 % | 3,4 % | 96,6 % | 3 353 |
| 2021 | 44,0 % | 29,7 % | 22,9 % | 3,4 % | 96,6 % | 3 354 |
| 2022 | 43,3 % | 29,6 % | 23,6 % | 3,5 % | 96,5 % | 3 320 |
| 2023 | 43,7 % | 29,1 % | 23,9 % | 3,4 % | 96,7 % | 3 339 |
| 2024 | 43,5 % | 29,2 % | 23,9 % | 3,3 % | 96,6 % | 3 327 |

Regjeringens Prop. 149 S (2024-2025) gjengir hovedtallene fra Konkurransetilsynets Dagligvarerapport 2024.

Lokalt finnes også en syntesepost som sier at CR3 har ligget mellom 95,5 og 96,6 prosent fra 2017 til 2024, med NorgesGruppen i båndet 42,3-44,1 prosent, Coop 29,0-29,5 prosent og Rema 23,1-23,9 prosent. Dette er foreløpig syntese, ikke en maskinlesbar år-for-år-serie.

## Dataartefakter 2026-04-29

- `research/data/nordic/market-share/no-grocery-market-share-2020-2024.csv` - 5 årsrader med omsetningsandeler, CR3, beregnet HHI og kilde-/metodenote.
- `research/data/nordic/market-share/no-grocery-market-share-backlog-2026-04-29.csv` - backlog for 2017-2019/eldre år og eventuell regional maskintabell.

## Kilder

- Konkurransetilsynet, nyhet om Dagligvarerapport 2024: https://konkurransetilsynet.no/rema-aukar-mest-i-marknadsdelar-norgesgruppen-opplever-nedgang/
- Konkurransetilsynet, Dagligvarerapport 2024 PDF: https://konkurransetilsynet.no/wp-content/uploads/2025/04/Konkurransetilsynets-Dagligvarerapport-2024-25-1.pdf
- Regjeringen, Prop. 149 S (2024-2025), kapittel om matvarekjeden: https://www.regjeringen.no/no/dokumenter/prop.-149-s-20242025/id3103203/?ch=4
- Lokal syntese: `src/lib/data/insights.ts`, `ins-77`.
- Lokal rapportoppsummering: `research/bibliotek/konkurransetilsynet/dagligvarerapport-2024.md`.

## Må fortsatt tettes

- Ekstrahere år-for-år-tall for 2017-2019 fra Dagligvarefasiten/NielsenIQ-arkiv, eldre Konkurransetilsynet-rapporter eller andre sammenlignbare kilder.
- Avklare om 2015-2016 kan hentes sammenlignbart. Hvis ikke bør B11 defineres som en 8-årsserie, ikke 10-15 år.
- Skille mellom `omsetningsandel`, `butikkandel`, `segmentandel` og `regional omsetningsandel`. Disse blandes lett, men gir ulike HHI-resultater.
- Vurdere regional 2022-2024-tabell fra Konkurransetilsynets figur 3 dersom analysen trenger geografisk konsentrasjon.

## Akseptansegate

Delvis aksept oppnådd for 2020-2024. Full B11-lukking krever fortsatt en sammenlignbar år-for-år-tabell tilbake til minst 2017, eller en eksplisitt beslutning om at gapet avgrenses til 2020-2024 fordi eldre data ikke kan hentes med samme metode.
