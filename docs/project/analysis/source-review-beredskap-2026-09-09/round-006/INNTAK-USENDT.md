# Internt datainntak — ikke sendt

**R6-INTAKE-001 er et ubesvart arbeidsskjema.** Ingen mottaker er kontaktet, og skjemaet er ingen bestilling, invitasjon til test eller registrering av menneskelig godkjenning. Alle 70 verdifelt i [JSON-malen](intake-template.json) er `null`.

Formålet er å avklare om Furuset etter ombygging kan være mottaker i det frosne Q1-caset. Bruk skjemaet først i intern gjennomgang. Eventuell senere kontakt, fysisk prøve eller innhenting fra dataeier krever et eget autorisert oppdrag.

## Felles dokumenthode for et senere svar

Oppgi dataeierrolle, mottatt dato, hvilken dato/tilstand opplysningene gjelder, dokument-ID og revisjon, SHA256 for originalfilen, eksakt side/tabell/felt, rettigheter og tillatt bruk. Filen lagres som en ny privat kildeversjon. Uklart eller ubesvart er ukjent, ikke null mengde. Skill spesifikasjonsgrense, nominell dimensjon, historisk observasjon og faktisk målt verdi.

## Presis rekkefølge

| Del | Dataeierrolle | Underlag og enheter | Når delen kan brukes |
|---|---|---|---|
| G01 Produksjonsfunksjon | Furuset produksjon/prosjekt | Gjeldende linje-/produkt-/resept-ID, dato for flyttet arbeid, dokumentert melbehov på stedet | Avklar Q1-casets relevans etter Mat i Farta-ombyggingen |
| G02 Norsk bulkspesifikasjon | Cerealia Norge kvalitet/lab | 160105; revisjon/gyldighet; protein g/100 g med basis; fukt %; falltall s; glutenfunksjon med metode/enhet; aske %; partikkelprofil µm/masse%; allergener; bulkholdbarhet dager og lagring °C/RH% | Grenser og metoder må komme fra riktig gjeldende spesifikasjon |
| G03 Svensk bulkspesifikasjon | Cerealia Sverige kvalitet/lab | Samme felt for 160585; avklar særskilt om katalogens holdbarhet gjelder bulk | Sammenlign på samme avtalte målegrunnlag |
| G04 Mottakerens Q1 | Furuset fag/kvalitet | Eksakt resept og Q1-versjon; forhåndsbestemte grenser; eventuell senere prøveprotokoll, brødvolum ml/g og avvisning % | Ingen KI-fastsettelse av mottakeraksept |
| G05 Faktisk mottaksanlegg | Furuset teknisk | Som-bygget tegning, silo-/tilkoblings-ID og sted; produktbruk; m³; kg/m³ med metode; maksimal last og faktisk ledig plass i tonn; kalibrering/hygiene | Må vise dagens løsning etter dokumentert plan om siloflytting |
| G06 Bulkgrensesnitt | Furuset og transportør | Koblingstype/mm; maks bar(g); Nm³/h med referansevilkår og luftkvalitet; slange/rute m; filter og sikkerhetsfunksjoner; målt tonn/time; vasketank, tidligere last, tilkomst og tidsvindu | Begge kjeders biler vurderes mot samme faktiske mottak |
| G07 Behov/lager | Furuset plan/lager | Q1 kg/batch; antall og starttid; fysisk anvendbart lager tonn/fukt%; karantene, reservasjon og buffer | Avstem per del-frist i 0–24, 24–48 og 48–72 timer |
| G08 Parti/allokering | Hver mølle lager/plan/lab | Korn og mel holdes atskilt; parti-COA; tonn og fuktbasis; eier-/uttaksrett; andre bindinger; frigivelsestid | Ingen katalogkapasitet eller nasjonal beholdning som allokering |
| G09 Scenario/utfall | Drift ved møller og mottaker | kW/kWh, startlast, vann m³/time og reserve, drivstoff liter, hendelsestider og unike mottatte/aksepterte tonn per parti | Dokumenter scenarioets drift; eventuell gjennomføring er ikke autorisert her |

JSON-malen har ett felt per opplysning med enhet/format, tom verdi og tom evidensreferanse. Delene G02 og G03 er atskilt slik at sekkdata eller en annen bulk-SKU ikke kan gli inn i sammenligningen. Ved senere bruk skal hver besvart rad knyttes til sitt eget dokumentgrunnlag.

## Beslutningspunkt etter dataeiers dokumentasjon

Dersom Furuset ikke bruker Q1 eller ikke har kompatibelt bulkmottak, skal sammenligningen stoppes. Et eventuelt nytt case med sekk, ferdig bakst eller Økern krever en eksplisitt ny avgrensning; ingen slik endring er gjort. Dersom mottaket dokumenteres, gjenstår fortsatt kvalitet, partifrigivelse, faktisk behov, lager, drift og tidslinje før en leveranse kan beregnes. Forskjellen mellom de gjensidig utelukkende NO-/SE-alternativene er ikke nordisk tilleggseffekt.
