# B08 findings — B08-20260909T102902Z-7e1f9a59

**Status:** `waiting_source`  
**human_verified:** false  
**Authority:** internal candidate only; no canonical/readiness/publish changes.

## Questions

### 1. Norges daterte oversendelsesversjon og beregningsregel for de fire NO-varslene?
**Svar / stopp:** Ikke funnet i offentlige navngitte kanaler denne kjøringen. Eurostat metadata-indeksen mangler `apro_cp_esqrscn2_no.htm` (direkte URL HTTP 404). SSB «Om statistikken» (R4-NO-S003) bekrefter rapportering til Eurostat og at nasjonal produksjon er *leveranser for salg* (eget bruk ikke med), 15 % vann — men dette er ikke en datert oversendelsesversjon eller eksakt beregningsregel for Eurostat *reported* YLD-cellene. De fire NO-residualene i round-005 `yieldDiagnostics` står uendret. Rapportert avling og P/A holdes som ulike størrelser.

### 2. Sveriges uavrundede komponentarealer/vekter for 2015?
**Delvis besvart:** JO 16 SM 1601 (B08-S01) publiserer Hela riket 2015:
- Höstvete: areal **394 450 ha**, totalskörd **2 984 800 t**, hektarskörd **7 570 kg/ha**, Anm. 14,0 % vann.
- Vårvete: areal **63 100 ha**, totalskörd **315 600 t**, hektarskörd **5 000 kg/ha**, Anm. 14,0 %.
- Sum areal **457 550 ha** = Eurostat C1100 area 457,55 ×1000.
- P/A fra SM-totalene = **7,213200743088187 t/ha** (matcher tidligere Eurostat-avledet P/A).
- Arealvekter: höstvete 394450/457550; vårvete 63100/457550.
Eurostat *reported* YLD **7,22** endres ikke. SkordarL2 mangler aredimensjon; arealer skal ikke baklengsregnes fra avrundet yield×production alene. Eventuell mikrodata-presisjon utover SM-tabell er ikke påvist.

### 3. Danmarks 2015-byggareal og manglende rapportert hveteavling; dyrket/høstet/varegrenser?
**Stopp med delvis kontekst:** Nasjonal HST77 har 2015 hveteareal/-avling/-produksjon; Eurostat-advarselen `missing_or_flagged` for DK C1100 2015 reported yield består. **Ingen utfylling** av den manglende Eurostat-cellen med beregnet verdi. Byggarealresidualen nasjonalt 631,3 mot Eurostat 631,0 tusen ha (round-005) beholdes. DST-dokumentasjon skiller Ansøgt/Dyrket areal og angir 15 % standardvann for korn; spelt/durum-kodebro (DKFI-G002) er fortsatt åpen. 2018-kvalitets-PDF brukes ikke tilbakevirkende som 2015-løsning.

## Begrensninger / motsigelser
- FI-avlingsvarsler 2016/2020 ligger i R4-G002 men faglig i B07-grense; ikke omskrevet her.
- METH-G03: definisjoner er stilt ved siden av hverandre, ikke harmonisert; ingen korreksjonsfaktor.
- R4-NO-G004 (refperiod 31.07 / Stock) uavklart.

## Neste steg
1. Usendt dokumentkrav: datert NO Eurostat-overføring/ESQRS-ekvivalent (`B08-B08-20260909T102902Z-7e1f9a59-G01`).
2. Usendt dokumentkrav: Eurostat-regel for SE reported YLD 7,22 (`…-G02`).
3. Usendt dokumentkrav: DK manglende YLD-celle + arealversjon 2015 (`…-G03`).
Ingen e-post sendt. Ingen brede søk gjentas uten nytt navngitt dokument.
