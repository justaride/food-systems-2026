# Datagrunnlag og KI-review

Intern arbeidsprosess, 9. september 2026. Denne runden vurderer A1–A5; den er ikke full gjennomgang av bibliotekets 1 770 poster.

## Hva som kan automatiseres

Innhenting → bevaring av originalrespons → tekstuttrekk → avgrenset KI-lesing → kritisk kontroll → maskinell kvitteringskontroll → intern syntese. Feil og gap er gyldige sluttutfall. Rutinearbeidet krever ikke at et menneske godkjenner hver kilde før intern analyse kan fortsette.

`scripts/audit-beredskap-research.py` gjør forhåndskontroll. `scripts/verify-beredskap-review.py` verifiserer den fullførte gjennomgangens kvitteringer: identiteter, full observasjonsversjon, kildens råbytes, lest tekstversjon, faktisk angitt leseomfang, run, policy og intern målprofil. Lenkede originalvedlegg har egne fil-/teksthasher og leseomfang, samtidig som den opprinnelige kildeposten beholdes. Det avviser manglende review, endret innhold, motstridende referansestatus og autoritetseskalering. Det avgjør ikke om KI-ens faglige vurdering er sann.

Denne runden har faktisk KI-lesing og separat agentkontroll, i tillegg til scriptkontroll. Agenter i samme kjøring er ikke dokumentasjon på forskjellige eller uavhengige modeller. Eksakt modellversjon er ikke attestert. Dette er en gjennomført intern arbeidsflyt med kjørbare kontroller; det er ikke en installert, kontinuerlig produksjonstjeneste eller fagfellevurdering.

Endrede påstander, enheter, perioder, kildebytes eller policy krever ny vurdering. En bevart originalpåstand får en vurdering og eventuelt rettelsesforslag; originalen overskrives ikke. Kvitteringshash er en integritetskontroll, ikke en signatur fra en ekstern autoritet. Historiske produksjonskrav til menneskelig review og attestasjon er uendret. Eventuell innføring i kandidatarkivet må bruke den eksisterende append-only-writeren.

## Data som må holdes adskilt

| Felt | Betydning | Eksempel på feil som forhindres |
|---|---|---|
| Kildepost og kildeinnhold | Registrert dokument versus bevart respons | Et HTTP 403 eller bilde telles ikke som lest rapport |
| Råbytes og tekstuttrekk | Originalformat versus faktisk lest versjon | Nettverktøyuttrekk merkes som verktøysvar, ikke original HTML |
| Måltall og kapasitetstype | Faktisk, kontraktert, installert, teoretisk, normal eller disponibel | Mål for 2029 blir ikke faktisk beholdning i 2026 |
| Enhet og funksjon | Liter, tørrstoff, næringsstoff, produkt eller måltid | Liter mask omregnes ikke til importerstattende fôr uten måling |
| Observasjonsperiode | Tiden tallet gjelder | Hentedato blir ikke måleår |
| Populasjon og instrument | Hvem/hva som er målt og hvordan | SIFO, FIES og matutdeling blir ikke én nordisk rangering |
| Institusjonell status | Forslag, erklæring, avtale, gjennomføring eller demonstrasjon | En samarbeidsramme blir ikke rett til levering |
| Evidensstatus | Støttet innen avgrensning, motsagt eller utilstrekkelig | Høy sikkerhet erstatter ikke dokumentasjon |
| Myndighet | Intern analyse, menneskelig vedtak, publisering | KI-kontroll utgir seg ikke for prosjektvedtak |

Neste analytiske lag er node → flyt → avhengighet → forstyrrelse → tiltak → utfall. Hvert felt må ha observasjons-ID, kildeversjon, definisjon og periode. Ukjent representeres som ukjent med grunn, aldri null. To like kilder eller flere observasjoner fra samme rapport er ikke uavhengig bekreftelse.

## Når mer data er verdt arbeidet

Ta inn en ny kilde bare hvis den kan endre en navngitt påstand, løse en motsigelse, fylle en nødvendig kjedekobling eller teste en foreslått mekanisme. `gap-intake.json` bevarer de 41 tidligere gapene med rute og stoppregel; nye spørsmål er ført separat. Ruting er ikke lukking av datagap.

Prioriter videre desk research på gjenvunne næringsstoffer, institusjonsmåltiders kontinuitet og samtidige klimabetingede produksjonsbortfall. Disse tre temaene er nye, eksplisitt underdekkede forskningsoppdrag. De skal ikke fremstilles som ferdig undersøkt i A1–A5. Operatørspesifikke felt om rasjon, kvalitet, ledig kapasitet og faktisk kriselevering krever derimot dataeier eller måling; flere generelle rapporter fyller ikke disse feltene.

For hvert nytt spørsmål: navngi beslutningen som kan endres, variabelen, direkte primærkilde og alternativ kanal. Avslutt åpent søk med enten dokumentert funn eller et konkret tilgangs-, metode-, dataeier- eller målegap. Ikke gjenåpne gamle søk uten ny kilde, versjon eller variabel.

## Reproduserbare kontroller

```sh
python3 scripts/test-audit-beredskap-research.py
python3 scripts/test-verify-beredskap-review.py
python3 scripts/verify-beredskap-review.py --input /absolutt/sti/review-packet.json --output /ny/sti/verification.json
```

Output må være en ny fil. Kvitteringspakken peker på private kildefiler; den kan bare valideres der disse faktisk er tilgjengelige. Ingen database, generert kanonisk projeksjon eller publiseringsstatus endres av disse kommandoene.
