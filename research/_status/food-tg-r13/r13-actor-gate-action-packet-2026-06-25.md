# Food TG R13 actor-gate action packet

**Dato:** 2026-06-25
**Scope:** Seks actor-gate-rader fra `r13-actor-gate-backlog-2026-06-25.md`.
**Regel:** Dette er en ask-pakke for menneske/aktør/registerarbeid. Ikke desk-estimer, ikke åpne claims.

## Kort dom

Actor-gate-risikoen er ikke løst med desk research, men den er gjort operasjonell: hver rad har et konkret minimumsspørsmål, nødvendig datatype, godkjent evidensform og stoppsignal. Hvis disse dataene ikke kan innhentes, skal raden bli stående som actor-gate eller C-funn.

## Ask-matrise

| ID | Minimumsspørsmål | Dataeier / mulig kilde | Godkjent evidensform | Stoppsignal |
|---|---|---|---|---|
| R13-GAP-006 | Hvilke R12/R13-hull krever faktisk aktørdata, og hvem eier datafeltet? | intern R12/R13 indeks + relevante aktører per underkø | per hull: dataeier, felt, periode, tilgangsstatus | hvis datafeltet er internt/sensitivt, ikke desk-estimer |
| R13-AKTOR-001 | Hvilke markedshager er aktive i 2025/2026, med primærlocator per produsent? | Markedshager Norge, Småskala Grønt Norge, produsentens egen side/register | produsentnavn, sted, aktiv-status, datert locator, kildeklasse | kart/API uten produsentverifisering er ikke aktiv-status |
| R13-AKTOR-002 | Hvilke andelslandbruk tar faktisk andeler i 2025/2026? | Økologisk Norge/andelslandbruk.no, gårdenes egne sesongsider | gård, sesongstatus, andelstilbud, kontakt/locator, dato | Økoguiden/SNL-treff er ikke aktivtelling |
| R13-AKTOR-004 | Hvilke gårder/praktikere har verifisert regenerativ/agroøkologisk praksis og eventuelle målinger? | Regenerativt Norge, Regenerativ bonde, NLR/NIBIO-prosjekter, gårdene | gård, praksisfelt, aktiv-status, måle-/prosjektgrunnlag, locator | selvbeskrivelse eller prosjektdeltakelse er ikke effektbevis |
| R13-AKTOR-005 | Hvilke sorter/noder er aktivt bevart/brukt, og hvilke rettigheter/tilgangsregler gjelder? | KVANN, NIBIO Norsk genressurssenter, NordGen, Solhatt, Frøsamlerne | node, sort/accession, norsk kobling, aktiv bevaringsstatus, tilgangsregel | Seed Vault, katalog eller medlemskap er ikke komplett forsynings-/bevaringsatlas |
| R13-AKTOR-007 | Hvilke skogshage-/permakultur-sites er aktive og verifiserbare? | Norsk Permakulturforening, KVANN, site-eier, kurs-/prosjektsider | site, sted, type, eier/kontakt, aktiv-status, verifiseringsdato | kartinnmelding/kurs er ikke site-inventory |

## Dataminimum per kategori

| Kategori | Minimum før raden kan flyttes ut av actor-gate |
|---|---|
| aktiv-status | datert aktør-/site-/gårdsstatus fra primærside, register eller direkte bekreftelse |
| volum | målt areal, produksjon, omsetning, deltakere, accession/frøvolum eller annen definert enhet fra dataeier |
| eierskap/founders | orgnummer, rolle, eierandel eller founderfelt fra register/årsrapport/aktorbekreftelse |
| medlemskap/nettverk | kilde, dato, dekning, dedupe-regel og norsk kobling |
| kontrakter/avtaler | eksplisitt avtale-/vilkårsfelt eller bekreftet fravær; ellers ikke bruk |

## Klar for menneskelig oppfølging

| ID | Første konkrete handling |
|---|---|
| R13-GAP-006 | Del opp underkøen i aktørdataeier per hull før eventuell DASK/AASK. |
| R13-AKTOR-001 | Be om eksport/liste fra Markedshager Norge eller valider toppliste mot produsentenes egne sider. |
| R13-AKTOR-002 | Be Økologisk Norge/andelslandbruk.no om aktiv 2025/2026-liste eller kontroller gård for gård. |
| R13-AKTOR-004 | Be Regenerativt Norge/NLR om aktiv praktikerkø og hvilke praksis-/målefelt som faktisk finnes. |
| R13-AKTOR-005 | Avklar med KVANN/NIBIO/NordGen hvilke node-/sortfelt som er åpne, lukkede eller ikke målt. |
| R13-AKTOR-007 | Be Norsk Permakulturforening/KVANN om site-liste med aktiv-status og eier/kontakt der publiserbart. |

## Ikke si

- Ikke si at actor-gate er lukket.
- Ikke erstat manglende aktørdata med estimat.
- Ikke publiser kart, nettverksgraf eller totalantall fra kandidat-/kartflater.
- Ikke gjør intern triage eller medlemskap til primærkilde for produksjon, effekt eller volum.
