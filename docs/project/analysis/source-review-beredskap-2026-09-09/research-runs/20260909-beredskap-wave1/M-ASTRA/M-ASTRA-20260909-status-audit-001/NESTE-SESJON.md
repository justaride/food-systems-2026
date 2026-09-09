# Neste sesjon etter originalmaster

Originalt inntak `c396993b0e0ef148c533731e615579986b08452eb0142e54aece753a66af0383` og denne masteren skal bevares. Se `return-requests.json` for seks presise returoppdrag: B04-C04, B08-C01–04, B13-C02, B14 inputfilsti, B20 inputfilsti/gaplokator og B19s feil FS-03-gapkobling. Frys nye retur-ID-er og et nytt inntak med eksplisitt peker til forrige; ikke erstatt den gamle historikken.

Kontroller i en separat rettelsesreview alle endrede kandidat-/evidens-/kilde-/policy-/målprofilhasher og alle berørte avhengigheter, inkludert B09 etter B08 og B20 etter endrede forgjengere. Identiske bindinger kan videreføres med referanse til dette masterutfallet. Rettingskontroll av 39 nye kandidathasher må ikke fremstilles som 127 nye selvstendige passasjelesninger; full dekning kan bare beskrives som ny kontroll pluss eksplisitt identisk gjenbruk.

Faglige porter som står åpne:

1. Furuset og mølle-/transporteiere: gjeldende bulkspesifikasjoner, Q1-aksept, as-built mottak, nettobehov, tilgjengelig beholdning, batchfrigivelse/allokering og tidslogg under felles sjokk.
2. Statistikkinstitutter: daterte overførings-/revisjons-/klassifikasjonsbroer, åtte P/A-varsler og relevante fukt-/arealdefinisjoner.
3. Aass/mottaker/laboratorium: periodedefinisjon, målemetode, sammensetning, tørrstoff, rasjon, tap og faktisk substitusjon.
4. Hias/feltmottaker/rapportforfattere: NORSØK erratum, datert batch og lager, anvendt/tilgjengelig P og massebalanse mot eksisterende slam/mineralbaseline.
5. Hylte/kjøkken/metodeeier: eksakt hendelsesdato og primærlogg, spist egnet mat, spesialkost og fler-måltids kontinuitet; MEAL-T001 er ikke gjennomført.
6. SIFO/FAO/Fafo/FSD: gruppe-N/CI, svarandeler, kompatible instrumenter og lovlig tilgjengelige replikasjonsdata. Ikke konverter treårsgjennomsnitt til enkeltår.
7. Island/traktatforvaltere: vedtak, beholdning, lisenskategori, faktisk drift, protokoll/aktivering/allokering og demonstrert levering.
8. Menneskelige porter: valg av videre oppdrag/mandat/finansiering, Holdbart-presisjon, hver eventuell kanonisk oppgradering og publisering.

Alle henvendelser forblir usendte. Denne researchkontrollen gir ikke CI-, deploy-, runtime-, UI-, DB- eller readiness-bevis. Modellkravet er fortsatt `model_attestation_unverified`; ikke kall backend-attestasjon verifisert fra modellnavn i rapport eller konsensus.

Reproduserbare lokale kontroller (Python 3, Poppler for nye PDF-bilder):

- `python3 verify_inputs.py`: eksakte frosne input-, leveranse-, kilde-, kandidat-, evidens-, policy- og målprofilkontroller; de to historiske mappe/filstifeilene rapporteres eksplisitt.
- `python3 verify_calculations.py`: egne diagnostiske beregninger og rådatasnitt.
- `python3 verify_extended.py`: alternative lokatorfiler, private manifestfiler, alle 337 bytebindinger og alle 92 gapkilder/eiere.
- `python3 validate_master.py`: uttømmende utfall/dekning og leveransemanifest. Script gjør ikke faglige utfall om til menneskelig autoritet.

Script bruker de dokumenterte absolutte private filstiene. Manglende fil på en annen maskin gir manglende bevis, ikke en automatisk ny kildeinnhenting eller endring av historikken.
