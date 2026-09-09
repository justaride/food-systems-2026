# Metode og datatilgjengelighet for samtidige avlingsavvik

9. september 2026. Intern kandidatanalyse. To hovedinnganger og deres direkte vedlegg er kontrollert; ingen modeller, myndighet, readiness eller kanoniske data er endret. [findings.json](findings.json) har eksakte kildeversjoner, private filbaner, hasher, leseomfang, metadata og stoppregler.

## Nye kildefunn

Beillouins direkte Figshare-samling har én DOCX med figurvedlegg, uten analysepanel eller kodefiler i denne inventarlisten. Figur S1s landliste inkluderer Danmark, Finland og Sverige, men ikke Norge. Figurenes EMF-bilder falt ut i lokal rendering; bildeteksten ble visuelt kontrollert, mens full regiongruppering og diagramceller holdes uavklart. Hovedartikkelen viser til nasjonal statistikk og ERA5. [Samling v2](https://doi.org/10.6084/m9.figshare.c.5077861.v2).

Tootoonchi dekker 21 svenske län, 1965–2020, høsthvete, vårhvete, vårbygg og havre. Supplementet inneholder modellformler S1–S3; artikkelen sier full Matlab-kjøring er tilgjengelig på forespørsel. Ingen kontakt er gjort. Nåværende SCB-data er ikke dokumentert identiske med forfatternes 2023-uttrekk. [Artikkel](https://doi.org/10.5194/bg-23-2583-2026), [supplement](https://bg.copernicus.org/articles/23/2583/2026/bg-23-2583-2026-supplement.pdf).

Den direkte SCB-kilden er faktisk hentet: 48 celler for Sverige/Riket, høst/vårhvete og høst/vårbygg, kg/ha og totaltonn, 2015–2020. Responsens merknad fastsetter 14 prosent vanninnhold for korn. Oppdateringsdato er 22. april 2026. Dette er utvalgsbasert høstestatistikk og sier ikke noe om matkvalitet, eksportbart overskudd eller beredskapsleveranse. [Originaltabell](https://www.statistikdatabasen.scb.se/pxweb/sv/ssd/START__JO__JO0601/SkordarL2/).

## Foreslått deskriptiv sammenligning

Bruk gjennomsnittet av 2015–2017 som tydelig navngitt baseline og vis 2018, 2019 og 2020 hver for seg: faktisk nivå, differanse og indeks med baseline=100. Dette er et analyseforslag, ikke studienes metode eller et estimat på fravær av tørke. Tre baselineår gir et enkelt sammenligningspunkt; seks år gir ikke et robust korrelasjons- eller sannsynlighetsestimat.

Skill produksjon fra avling per areal. Hold vinter/vår/total atskilt; totalbygg er ikke vårbygg, og kornhvete er ikke automatisk mathvete. Ikke ta enkelt gjennomsnitt av vinter- og våravlinger. Gjør eventuell aggregasjon bare med fullstendig og kompatibel vare-/arealdefinisjon. Bruk nasjonale totaler i firelandssammenligningen; studienes regionale grupper er andre populasjoner.

SCB 14 prosent er verifisert her; Eurostat og de andre landenes fuktbasis må bindes til egne metadata. Ingen ukjent basis normaliseres. En fast omregningsfaktor kanselleres i indeks innen samme serie; skifte i basis over tid gjør det ikke. Fuktomregning endrer ikke matkvalitet eller tilgjengelig leveranse.

## Hva som gjenstår

- Koble forelders Eurostat-uttrekk og nasjonale kontroller på identisk vare, fukt, enhet, år og statusflagg.
- Behold gap for forfatternes eksakte analysepanel og full kode. Offentlig likningsform er ikke reproduksjon.
- Avklar eventuell bruk av regional gruppering før referanser til «Northern Europe» gis nordisk betydning.
- Hvis modellreplikasjon blir aktuelt: avklar at hovedartikkelen omtaler permutasjon/MSE for variabelviktighet, mens Beillouins S4/S6-tekster omtaler Gini. Det er en beskrivelsesforskjell; faktisk implementasjon er ikke fastslått.

Private originaler, dataspørring, 48-cellers respons og rendererens kontrollbilder er bevart utenfor repoet. Ingen full modellreplikasjon, tverrnasjonal effektberegning eller kontakt er utført.
