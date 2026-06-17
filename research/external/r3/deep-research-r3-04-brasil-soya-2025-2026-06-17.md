# Avklaring av Brasil-andel i norsk soyabønneimport

## Kort dom

**Status: needs-primary-check, med klar revisjonsusikkerhet.** Jeg ville **ikke** omtalt et eventuelt fall i Brasils andel av norsk import av soyabønner under HS 12019090 i 2025 som en etablert strukturell endring nå. Per 17. juni 2026 er 2025-årgangen i SSBs utenrikshandelsstatistikk **ikke endelig**: årstallene revideres først i **mai år t+1** og blir **endelige i mai år t+2**. SSB skriver også eksplisitt at forskjellen mellom foreløpige og reviderte tall normalt er liten **på aggregert nivå**, men at revisjoner **på detaljert nivå og for enkeltmåneder kan ha større betydning relativt sett**. Samtidig fant jeg **ingen primærkilder fra Denofa eller Felleskjøpet Agri** som dokumenterer et nytt 2024–2025-skifte bort fra Brasil; tvert imot omtaler de fortsatt Brasil som sentral opprinnelse, med Canada/Polen/Romania/USA som tilleggskilder. citeturn43view0turn47search4turn34view0turn35view0turn36view0

Det sterkeste primærkildebildet akkurat nå er derfor: **Brasil-dominansen i norske aktørers soyakjede ser fortsatt ut til å bestå**, mens SSBs detaljerte landfordeling for 2025 fortsatt må behandles som **ikke-endelig detaljstatistikk**. Det gjør hypotesen «reell, plutselig sourcing-forskyvning i 2025» svakere enn hypotesen «kombinasjon av revisjonsusikkerhet og detaljcellestøy» — men uten direkte uttrekk av de eksakte SSB-radene for 2024 og 2025 kan dette ikke løftes høyere enn **needs-primary-check**. citeturn43view0turn34view0turn38view1turn35view1turn37view1

## Det SSB faktisk sier om 2025-tallene

SSBs nedlastingsside for 08801 viser at 2025 ligger som egen ZIP-fil merket **«Foreløpige tall»**, mens 2024 ligger som egen ZIP-fil under **«Endelige tall»**. Samme side sier at oppdatering skjer etter publisering av foreløpige årstall i februar, og deretter ved publisering av **reviderte og endelige årstall i mai hvert år**. SSBs statistikkside for «Utenrikshandel med varer - årlig» presiserer tidsløpet: først revideres året i **mai t+1**, og deretter publiseres **endelige tall i mai t+2**. For 2025 betyr det at tallene nå er **første reviderte**, men fortsatt **ikke endelige**. citeturn67view0turn43view0

SSB oppgir også at første revisjon av **samlet import i 2025** var **0,2 prosent** i tabell 12024. Det er nyttig som bakteppe, men SSB advarer samtidig mot å overføre dette direkte til detaljerte vare- og landceller: på **detaljert nivå** kan revisjonene være mer betydningsfulle relativt sett. Med andre ord: en stor endring i én bestemt HS-landcelle kan ikke avvises, men heller **ikke bekreftes** ved å vise til aggregatet alene. citeturn47search4turn43view0

### Datamodus for SSB-status og revisjon

| verdi | enhet | år | geografi | metode | kildeeier | URL | locator | datakvalitet |
|---|---:|---:|---|---|---|---|---|---|
| `Tab_08801_2025.zip` er lagt ut under **Foreløpige tall** | filstatus | 2025 | Norge | Nedlastingsside for 08801 | SSB | SSB nedlastingsside citeturn67view0 | L91–L97 | deckklart internt |
| `Tab_08801_2024.zip` er lagt ut under **Endelige tall** | filstatus | 2024 | Norge | Nedlastingsside for 08801 | SSB | SSB nedlastingsside citeturn67view0 | L95–L97 | deckklart internt |
| Første revisjon publiseres i **mai t+1** | regel | løpende | Norge | Om statistikken | SSB | SSB statistikkomtale citeturn43view0 | L1180–L1182 | deckklart internt |
| Endelige tall publiseres i **mai t+2** | regel | løpende | Norge | Om statistikken | SSB | SSB statistikkomtale citeturn43view0 | L1180–L1182 | deckklart internt |
| Første revisjon av samlet import i 2025: **0,2** | prosent | 2025 | Norge | Tabell 12024, aggregat | SSB | SSB tabellomtale / tabellutdrag citeturn47search4 | avsnitt «Første revisjon av årstall ... 2025» | deckklart internt |
| På detaljert nivå kan revisjoner være større relativt sett | kvalitetsmerknad | løpende | Norge | Om statistikken | SSB | SSB statistikkomtale citeturn43view0 | L1180–L1182 | deckklart internt |
| Eksakt kg-rad for `varenr=12019090`, `impeks=1`, `vnr_m2=1`, `obland=BR` | kg | 2025 | Norge/Brasil | Må trekkes direkte fra ZIP/API | SSB | 2025-fil referert i SSB-artikkel citeturn67view0 | L94–L116 | needs-data |
| Eksakt kg-rad for `varenr=12019090`, `impeks=1`, `vnr_m2=1`, `obland=World` | kg | 2025 | Norge/Verden | Må trekkes direkte fra ZIP/API | SSB | 2025-fil referert i SSB-artikkel citeturn67view0 | L94–L116 | needs-data |

## Aktørkilder om opprinnelse og leverandørmiks

Den mest konkrete primærkilden på faktisk opprinnelsesmiks fant jeg hos **Denofa**. I selskapets due diligence-rapport for 2024 står det at prosesseringen i 2024 var **68 prosent fra Brasil**, **12 prosent fra Romania**, **10 prosent fra Polen** og **10 prosent fra Canada**. Rapporten sier også at Denofa importerer ikke-GMO soyabønner fra Brasil, og at de avhengig av råvaretilgang også kan importere fra Canada, Polen og Romania. citeturn34view0

Hos **Felleskjøpet Agri** er landmiks omtalt konsistent på tvers av 2024- og 2025-materialet. I redegjørelsen for 2024 står det at soyamelet kommer fra Denofa, og at leverandøren bruker soyabønner fra **Brasil, USA, Canada og Polen**. I årsrapporten for 2025 gjentas det samme landsettet ordrett: **Brasil, USA, Canada og Polen**. Jeg fant **ingen** primærkilder fra Felleskjøpet eller Denofa i 2024–2025 som peker på en ny opprinnelsesmiks med **Paraguay** eller **Argentina** som sentrale erstatningsland. citeturn35view1turn37view1turn35view0turn37view0

Det er også viktig at Denofas åpne bærekraftsside fortsatt beskriver Brasil som hovedkilde: Denofa skriver at de importerer rundt **450 000 tonn soyabønner** årlig til Fredrikstad, at **hovedleverandøren er AMAGGI i Brasil**, og at de også kjøper soyabønner fra **USA og Canada**. På Denofas norske soyaside omtales den generelle årsfordelingen som omtrent **80 prosent Brasil** og **20 prosent Canada og USA**, altså fortsatt et klart Brasil-tyngdepunkt. Disse to nettsidene er ikke regnskapsnoter, men de er selskapets egne, samtidige kilder og peker i samme retning: **ingen dokumentert Brasil-exit**. citeturn38view1turn41view0

### Datamodus for aktøromtaler

| verdi | enhet | år | geografi | metode | kildeeier | URL | locator | datakvalitet |
|---|---:|---:|---|---|---|---|---|---|
| 68 fra Brasil; 12 fra Romania; 10 fra Polen; 10 fra Canada | prosent av prosessering | 2024 | Denofa / Norge | Due diligence-rapport | Denofa | Denofa 2024 due diligence citeturn34view0 | L94–L124 | deckklart internt |
| Soyabønner importeres fra Brasil; kan også importeres fra Canada, Polen og Romania | leverandørland | 2024 | Denofa / Norge | Due diligence-rapport | Denofa | Denofa 2024 due diligence citeturn34view0 | L81–L99 | deckklart internt |
| Soyamelet i Felleskjøpet kommer fra soyabønner fra Brasil, USA, Canada og Polen | leverandørland | 2024 | Felleskjøpet Agri / Norge | Åpenhets-/bærekraftsrapport | Felleskjøpet Agri | FKA redegjørelse 2024 citeturn35view1 | L879–L896 | deckklart internt |
| Soyamelet i Felleskjøpet kommer fra soyabønner fra Brasil, USA, Canada og Polen | leverandørland | 2025 | Felleskjøpet Agri / Norge | Årsrapport | Felleskjøpet Agri | FKA årsrapport 2025 citeturn37view1 | L6249–L6258 | deckklart internt |
| Hovedleverandør er AMAGGI fra Brasil; også innkjøp fra USA og Canada | leverandørmiks | samtidige nettsider | Denofa / Norge | Selskapets egne nettsider | Denofa | Denofa bærekraft citeturn38view1 | L59–L74 | deckklart internt |
| Ca. 450 000 tonn årlig; ca. 80 fra Brasil, ca. 20 fra Canada og USA | tonn / prosent | samtidige nettsider | Denofa / Norge | Selskapets egne nettsider | Denofa | Denofa soyaside citeturn41view0 | L93–L100 | needs-primary-check |
| Primærkilde som dokumenterer Paraguay som ny viktig norsk soyaopprinnelse | — | 2024–2025 | Norge | Søk i aktørkilder | Denofa/FKA | — | ikke funnet | ikke funnet |
| Primærkilde som dokumenterer Argentina som ny viktig norsk soyaopprinnelse | — | 2024–2025 | Norge | Søk i aktørkilder | Denofa/FKA | — | ikke funnet | ikke funnet |

## EUDR og avskoging

Det finnes **god dokumentasjon** på at norske aktører arbeider ut fra **sporbarhet og avskogingsfrihet**, men jeg fant **ikke** primærkildedokumentasjon på at de derfor har flyttet kjøpene **bort fra Brasil** i 2024–2025. Denofa skriver i 2024-rapporten at selskapets hovedmål for 2025 er å få EUDR inn i norsk regelverk, fordi EUDR løfter europeiske sporbarhetskrav nærmere det nivået Denofa allerede bruker for import av avskogingsfri og bærekraftssertifisert soya. Denofa beskriver altså EUDR som et **etterlevelses- og konkurransespørsmål**, ikke som en sourcing-exit fra Brasil. citeturn34view0turn61view0

Denofas sporbarhetsside er enda tydeligere: selskapet sier at deres brasilianske soyabønner er sporbare, avskogingsfrie og bærekraftssertifiserte, at opphavet er knyttet til Mato Grosso, og at EUDR for Denofas kunder sannsynligvis **ikke** vil føre til store praktiske endringer utover nye rapporteringskrav. Felleskjøpet Agri sier samtidig i årsrapport 2025 at de bruker sertifisert avskogingsfri soya, at soyamelet fortsatt kommer fra **Brasil, USA, Canada og Polen**, og at innføringen av EUDR ble utsatt til **2026**. Den dokumenterte linjen er dermed: **strammere dokumentasjon på en fortsatt Brasil-ledet kjede**, ikke dokumentert utfasing av Brasil. citeturn38view0turn36view0turn37view1

## Avklaring av funnet

**Fakta fra primærkilder:**
Denofa dokumenterer en 2024-miks med Brasil som største opprinnelse, og Felleskjøpet Agri omtaler samme opprinnelsesland i både 2024 og 2025. SSB dokumenterer at 2025-tallene ikke er endelige før **mai 2027**, og at detaljrevisjoner kan være betydelige relativt sett selv om aggregatet knapt flytter seg. citeturn34view0turn35view1turn37view1turn43view0turn47search4

**Inferens:**
Dersom SSB-raden for 2025 virkelig skulle vise at Brasils andel har falt markant for HS 12019090, så er det **per nå mer sannsynlig** at dette enten skyldes **ikke-endelige detaljrevisjoner** eller en **midlertidig/klassifikatorisk forskyvning inni den kjente ikke-brasilianske leverandørgruppen** enn at norske hovedaktører faktisk har gjort et stort dokumentert strategisk skifte bort fra Brasil. Grunnen er at aktørkildene ikke viser noe tilsvarende leverandørskifte. Dette er fortsatt en **inferens**, ikke et ferdig bevist faktum. citeturn43view0turn34view0turn35view0turn36view0

**Sekundær støtte:**
Ruralis skriver i en 2026-rapport at verdikjeder og tilgjengelighet for fôrråvarer har endret seg siden 2020, men dette er en bredere fôrvurdering og ikke dokumentasjon på et norsk skifte bort fra brasilianske soyabønner i HS 12019090. Jeg ville derfor ikke bruke Ruralis til å «bevise» dette funnet; den er kun kontekst. citeturn39view0

**Ikke funnet:**
Jeg fant ikke i primærkildene en 2024–2025-uttalelse fra Denofa eller Felleskjøpet som sier at de har flyttet soyakjøpene fra Brasil til **Paraguay** eller **Argentina** av EUDR-/avskogingsgrunner. Jeg fant heller ikke en primærkilde i denne kjøringen som ga meg de eksakte SSB-radene for **Brasil**, **Verden** og øvrige land under `HS 12019090`, `Mengde 1`, `Import`, `2024/2025` direkte ut i nettformat. Derfor står disse fortsatt som **needs-data**. citeturn34view0turn35view1turn37view1

## Ikke si

- Ikke si at **«Brasils andel falt til 42 prosent i 2025»** som etablert faktum. 2025 er **ikke endelig årgang** i SSB ennå. citeturn43view0
- Ikke si at **EUDR har fått norske aktører til å flytte kjøpene bort fra Brasil**. Det fant jeg **ikke** dokumentert i primærkildene; dokumentasjonen handler om sporbarhet, sertifisering og etterlevelse i en fortsatt Brasil-ledet kjede. citeturn34view0turn38view0turn37view1
- Ikke si at **Paraguay eller Argentina** er de nye store opprinnelseslandene for norsk soyabønneimport uten direkte SSB-uttrekk eller selskapskilder som bekrefter det.
- Ikke bruk aggregert revisjon på **0,2 prosent** for samlet import som bevis for at detaljceller **ikke** kan flytte seg; SSB sier det motsatte om detaljnivå. citeturn47search4turn43view0

**Operativ formulering internt:**
`needs-primary-check` — Foreløpig peker primærkildene mer mot **revisjonsusikkerhet / uavklart detaljendring** enn mot en dokumentert, reell sourcing-vending bort fra Brasil i 2025.