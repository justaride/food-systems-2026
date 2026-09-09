# Bruk av felles resultatmal

`data-mal.json` inneholder tomme eksempelrader og er ikke innsamlede data. Kopier til `data.json`, sett `templateOnly` til `false`, erstatt radene med faktiske oppføringer og fjern ubrukte rader. Tomme samlinger skal være `[]`. Bruk UTF-8 og gyldig JSON; ingen kommentarer eller konstruerte verdier.

Gi spørsmålene ID etter sporet, for eksempel A1-Q1. Hvert spørsmål skal kunne følges til observasjon eller gap. Koble hver påstand til kildens egen lokator via `sourceRefs`; en URL uten side/tabell er ikke nok for en sentral tallpåstand. Alle kilde-ID-er og beregningsinndata skal finnes i leveransen.

`kind`: rapportert_observasjon, estimat, mal, kontrakt, nominell_kapasitet, operativ_dokumentasjon, anbefaling, scenario eller kvalitativ. Bruk `calculations` for egne avledninger. Type og systemgrense skal fremgå selv om en kilde kaller alt «kapasitet».

Lesestatus og påstandsvurdering følger fellesinstruksen. `changeFromBaseline`: nytt, bekrefter, oppdaterer, korrigerer eller uavklart. `missingFieldReasons` skiller ikke oppgitt, ikke funnet, utilgjengelig og ikke relevant. Legg sporspesifikke felter i `topicFields`. Ikke sett 0, dagens dato eller en bransjefaktor inn der kilden mangler opplysninger.

Søkelogg: én ID per faktisk søk, f.eks. A1-L001; registrer dato, spørsmål-ID, eksakt søk/API og filter, åpnet URL, resultat/tilgang og videre handling. Et foreslått søk i prompten er ikke en utført aktivitet.
