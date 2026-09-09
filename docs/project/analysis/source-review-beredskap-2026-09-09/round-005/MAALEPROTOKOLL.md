# C1-måleprotokoll — 9. september 2026

**Status: designet, ikke gjennomført.** Gjelder kun R5-C1-FURUSET-Q1-T72 i [case.json](case.json). Aktørnavn er analytiske casevalg. Ingen bestilling, reservasjon, avtale eller kontakt er gjort. Protokollen gir presise datafelter for et eventuelt senere, særskilt autorisert arbeid.

## Avgrensning og sammenligning

Én mottaker: Bakehuset Møllhausen Furuset. Én kvalitet: Q1, sterkt siktet bakerihvetemel med Regal Hvetemel standard bulk 160105 som foreløpig referanse. Én sluttfrist: 72 timer etter t0. Samme ordrebok, scenario og akseptregler skal brukes i begge alternativer. Begge må ha den samme mottakeraksepterte Q1-versjonen før en paret prøve kan tolkes. En svensk katalogvare er bare en kandidat til kvalifisering.

Alternativ A bruker Bjølsen; B bruker Malmö. Disse to armene er gjensidig utelukkende. `B − A` beskriver forskjellen mellom leveringsalternativer. Det er **ikke** nordisk tilleggseffekt. For tilleggseffekt trengs en tredje arm C med norsk og nordisk forsyning sammen, sammenholdt med A. Ressurser og kundeomdisponering må avstemmes for C før `C − A` kan beregnes. Felles konsern, produktutvikling, prioritering, IT og mulige transportressurser er avhengigheter som må undersøkes; ingen uavhengighet antas.

## Registreringsenhet og tidsoppløsning

Bruk én rad per parti, allokeringshendelse, transportetappe og mottakskvittering, koblet med stabile ID-er. Mengde registreres i tonn netto og vanninnhold i prosent med analysemetode. Bruk ISO8601-tid med tidssone. Registrer hvert tidspunkt for uttaksbeslutning, frigivelse, råvare klar, maling start/slutt, lasting, avgang, grenseankomst/-frigivelse, ankomst, lossing og kvalitetsaksept.

Mottakerens uttaksplan deles i 0–24,24–48 og 48–72 timer, med tidligere del-frister når bakeplanen krever det. Tidsintervallene er måleoppløsning, ikke observert døgnforbruk. Registrer faktisk nett-, vann- og vegtilstand samt reserver i samme intervaller. En enkelt sluttmengde uten tidslinje kan ikke dokumentere kontinuitet.

## Målepunkter og minste datagrunnlag

| Gap | Dataeierrolle | Felt og enhet | Dokument og kontroll |
|---|---|---|---|
| R5-G01 Behov | Bakeriets produksjons-/innkjøpsansvarlige | Ordre-ID, reseptversjon, Q1 kg per batch, batcher og starttid; tonn netto | Frys ordrebok og alternativ råvareplan ved t0. Ingen omregning fra antall ansatte eller katalogsortiment. |
| R5-G02 Mottakerlager | Bakeriets lageransvarlige | Parti, Q1-status, tonn, målt fukt, reservasjoner, beholdningstid | Vei eller kalibrer silo; avstem beholdningssystem mot fysisk telling. Skill kassasjon/karantene og andre varers siloer. |
| R5-G03 Møllelager og rett | Hver mølles lager-/allokeringsansvarlige; relevant statlig forvalter | Korn-/melparti, tonn, lokasjon, dato, eierskap, uttaksrett, allokeringstid | Et lager- eller kontraktstotal er utilstrekkelig. Krev konkret frigivelsesgrunnlag og kompatible partier; ukjent rett teller ikke som tilgjengelig. |
| R5-G04 Konkurrerende behov | Møllenes planlegging og relevant nasjonal markeds-/beredskapsforvalter | Bindende ordre, innenlandske prioriteringer, sikkerhetsbeholdning, annet forbruk og eksportavtaler; tonn per frist | Bruk én avstemt allokeringsbok uten overlapp. Nasjonalt årsoverskudd er bakgrunn; ikke en allokering til Furuset. |
| R5-G05 Kvalitet | Møllelaboratoriene og bakeriets fagansvarlige | Produkt-/partiversjon; protein, fukt, falltall, glutenfunksjon, aske, granulometri, allergener, analysegrenser | Avklar analyseenheter/fuktbasis og skriftlige toleranser før sammenligning. Samme referanseresept, vannjustering, elting, fermentering og baketemperatur logges. Mål brødvolum, deigadferd og avvisning. Ingen KI-signert human gate. |
| R5-G06 Foredling | Hver mølles driftsansvarlige | Korn tonn/time, godkjent mel tonn/time, rå-/melbeholdning før/etter, driftstimer, tap, oppstart, rengjøring og produktbytte | Mål under scenarioets tilstand. Skill nominell hastighet, faktisk årsproduksjon og disponibel kapasitet. Koeffisienter skal måles for riktig parti, linje og fuktbasis. |
| R5-G07 Energi/vann | Drift ved begge møller og Furuset | Kritisk effekt kW, energi kWh, reserveeffekt/startstrøm, liter drivstoff; vann m³/time, reservevolum og kvalitet | Lasttest og forbrukslogg må dekke hele relevante prosessen, inkludert styring, maling, eventuell kornfukting, lasting/lossing og hygiene. Reserveaggregatnavn er ikke driftstest. Ingen udokumentert produkt/time under nett-/vannbortfall. |
| R5-G08 Transport | Transportør, mølle og mottak; grenseaktør ved behov | Bil-/tank-ID, payload tonn, volumtetthet, drivstoff, sjåfør, vask/hygiene, rute, tider, dokumentstatus | Bekreft tungbilrute og bære-/vektvilkår, matvareegnet tank og mottakskobling. Logg faktisk grensebehandling og stopp. Ordinær døgnåpning gir ingen kriseledetid. |
| R5-G09 Mottak og bruk | Furuset | Ledig kompatibel silo tonn, lossekapasitet, energi/vann, akseptert tonn per tid; tonn brukt i godkjent bakst | Veieseddel + kvalitetsfrigivelse + mottakskvittering. Separat logg for baking, øvrige ingredienser, svinn og utgående mat. Bulk er valgt design, mottakskapasitet er ikke verifisert. |
| R5-G10 Paret effekt | Senere autorisert forsøksansvarlig | Arm-ID, identiske behov/scenario, delte ressurs-ID-er, avvik, kostnad, levering per frist | Forhåndsbestemt sammenligning, minst en kontrollert paret gjennomføring før effektpåstand. Gjentakelser og robusthet må begrunnes etter variasjon; én vellykket tur gir ikke generell pålitelighet. |

## Masse- og tidsregnskap

Beregn netto nytt behov per frist fra dokumentert Q1-forbruk pluss ønsket sluttbuffer minus **anvendbar** mottakerbeholdning. Bufferen må være en uttrykkelig forutsetning. Trekk ikke en leveranse både fra behovet og fra alternativets tilbud. Manglende forbruk, beholdning eller buffer gir ukjent behov; det blir ikke null.

For hver mølle: start med kvalitetsgodkjent fysisk lager, trekk fra ikke-overlappende bindinger til andre behov og utilgjengelig sikkerhetsbeholdning. Allokert korn kan ikke overstige resten eller uttaksretten. Import/tilgang etter t0 teller bare hvis konkret parti, frigivelse og ankomst til riktig prosess er dokumentert før det trengs. Utmaling skjer bare på den mengden som faktisk kan passere møllen i de dokumenterte driftstimene. Ferdig mel på startlageret holdes atskilt fra korn som skal males; samme parti kan ikke telles i begge.

Et grovt teknisk **tak** kan skrives `min(frigitt ferdigmel + utbytte × min(allokert korn, malbar kornmengde), melhåndtering, transport, mottak)`. Alle størrelser må gjelde samme tidsvindu og netto allokering. Dette taket er ikke en leveranseberegning: en partibasert tidslinje må vise at hvert oppstrømsledd er ferdig før neste begynner, at delte ressurser ikke overbookes, og at hver frist holdes. Ukjent innsatsledd gjør taket ukjent. En godkjent nullmåling er noe annet enn manglende data.

Det primære observerte utfallet beregnes ved å summere unike, netto aksepterte Q1-mottak innen fristen. Avviste, sene og dobbeltregistrerte partier holdes utenfor, med årsak bevart. Usikker vekt eller kvalitet skal gi avgrenset usikkerhet eller tilbakeholdt resultat, ikke falsk presisjon. Dokumentert behovsdekning krever også at leveringen kom før planlagt bruk.

Korn/mel veies på oppgitt fuktbasis. Tørrstoff beregnes separat som `nettomasse × (1 − vannandel)`. Den historiske katalogens 78 prosent er bare en produktreferanse; vann til kondisjonering og produktets vanninnhold kan påvirke masseforholdet. Kli, svinn og vann må avstemmes før en fysisk massebalanse tolkes. Ingen automatisk brød-, kalori- eller fôrsubstitusjonsfaktor brukes.

## Beslutningsregel og stoppunkt

Uten mottakerens Q1-spesifikasjon, behovsplan og bulkmottak er videre kapasitetssummering ikke beslutningsklar. Deretter kreves allokert, kvalitetsgodkjent vare og en tids-/ressursplan for begge kjeder. Bare godkjente mottakskvitteringer kan gjøre en designet leveranse til en observert leveranse. Baking og ernæringsfunksjon forblir egne utfall.

Hvis vann/energi stanser mottaket eller bakingen, registreres dette selv om alternativ mølle kan produsere. Hvis Malmö ikke dekker samme Q1, blir sammenligningen avvist inntil ny, eksplisitt kvalitetsavgrensning er avtalt. Hvis norsk kapasitet dekker samme behov, må eventuell nordisk gevinst dokumenteres i tid, robusthet eller annen forhåndsdefinert funksjon. Ingen gevinst antas ut fra landegrense alene.

Neste steg er intern vurdering av de konkrete datafeltene og kildekanalene i [data-gaps.json](data-gaps.json). Kontakt og praktisk prøve krever et senere oppdrag. Denne runden avslutter ved måleopplegget fordi nødvendige operasjonelle observasjoner mangler.
