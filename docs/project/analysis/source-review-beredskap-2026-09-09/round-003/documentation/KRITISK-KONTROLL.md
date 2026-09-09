# Separat kritisk kontroll av dokumentasjonsrunden

Kontrollert 9. september 2026 av avgrenset kontrollagent etter at forfatteragenten hadde levert. Intern KI-kontroll i samme agentfamilie; dette er ikke dokumentasjon på uavhengige modeller eller menneskelig review. Ingen originaler eller tidligere registre er endret av kontrollen.

Kontrollert versjon:

- `findings.json`: SHA-256 `196eda01926e6d719b96e35dffe5d5f61a7f928369a68cb0736fc11576cd6df6`.
- `statfin-cell-check.json`: SHA-256 `ff85b1b5122028872c6c9fa325ddfa101336628593017034b3936754be4a5600`.
- Privat `review-packet.json`: SHA-256 `dc776b6baeeb81ed1d7f3f012af3ee2b479ec7e8621e2ffdea7eac03b588c170`.

## Resultat

Ingen avvik funnet i de 15 nye StatFin-verdiene, dokumentidentitetene eller de kontrollerte kildehashene. Hovedkonklusjonene D-O001–D-O005 kan beholdes med nedenstående avgrensninger. Dette lukker avgrenset tilgang/kildeidentitet og cellekontroll; det lukker ikke institusjonelle eller operative leveransegap.

## Konkrete presiseringer

1. **D-O004: Avtalens situasjonsgrense må følge videre bruk.** Norsk artikkel 1 i D-S004, PDF 3 / trykt 567, avgrenser formålet til alvorlig indre uro, krig og alvorlig internasjonal spenning som innebærer krigsfare, med henvisning til EØS artikkel 123(c). Artikkel3–4 er riktig gjengitt, men de kan ikke uten særskilt grunnlag brukes som automatisk matleveranseløsning ved alle klima- eller forsyningsavbrudd. Nåværende protokoller, eventuell oppsigelse og faktisk allokering er fortsatt uavklart. Artikkel9 i PDF 6 har videreførings- og oppsigelsesvilkår; historisk ordlyd dokumenterer ikke dagens status.
2. **D-O005: Skill binær identitet fra kanalproveniens.** NTB-filen er faktisk byteidentisk med bevart A3-S001, og PDF 3 har riktig tittel, forfattere, dato og ISBN. Den kontrollerte pakken har URL til NTB-vedlegget, men ingen bevart OsloMet-publiseringsside som viser lenken dit. Presiser «identisk original hentet fra NTB-vedlegg», eller bind den publiseringssiden før «direkte utgiverkanal» brukes som særskilt dokumentert proveniensledd. Dette svekker ikke dokumentets identitet eller innhold.
3. **StatFin: Behold nøyaktig terskel.** `koti_vaik_pros` betyr husholdninger med vansker **eller store vansker** med å få endene til å møtes. Det inkluderer ikke kategorien «some difficulties». `SS`, `31` og `32` betyr henholdsvis alle husholdninger, par med barn og enslige forsørgerhusholdninger. Tallene er ikke direkte matmangel, individandeler eller konfidensintervaller. Metodebruddet2022 er korrekt bevart. Ingen ny inferens om statistisk signifikant endring er utført.
4. **Metadatafilen må identifiseres presist ved reproduksjon.** Den oppgitte metadatahashen tilhører `statfin-metadata-short.raw`, som inneholder gyldig tabellmetadata. `statfin-metadata.raw` inneholder derimot bare «Bad Request». Feilresponsen er bevart og skal ikke telles som lest metadata. Responsehash og requesthash stemmer med filene sine; ingen resultatfeil funnet.

## Utførte kontroller og faktisk leseomfang

- Alle fem kilders råfil og tekstfil ble hashet på nytt; 10 av 10 samsvarer med `findings.json`.
- StatFin: hele `statfin-response.json`, gyldig metadatafil, request og alle 15 celler lest. Flat indeks er beregnet på nytt fra `id`, `size` og kategorienes indekser. Samtlige15 verdier samsvarer også med A3-O012 i den bevarte round-002-pakken.
- Finlex lov 445/2006: PDF 15 / trykt 1323, §§1–3, tekst og gjengitt side visuelt kontrollert. Lovdato8.juni2006 er ikke forvekslet med avtaledato14.april2005.
- Finlex95/2006: PDF 1 / trykt 957, tittel og §§1–2 lest og visuelt kontrollert. Dokumentet gjelder nordisk folkeregistrering. Den gale historiske lenken dokumenterer ikke at en matprotokoll ikke finnes.
- Finlex55/2006: PDF 2–6 / trykt 566–570 lest; PDF 4 / trykt 568 visuelt kontrollert, særlig norsk artikkel 3–4. Det er skilt mellom finsk ikraftsettingsforskrift og selve den tospråklige avtalen.
- SIFO: PDF 3 lest og visuelt kontrollert. Hele råfilen sammenlignet byte for byte med privat round-002 `evidence-review/A3-S001.raw`: identisk. Ingen ny gjennomgang av rapportens øvrige funn utført.
- Privat pakkehash samt request-, response- og metadatahash ble kontrollert. Autoritet forblir intern analyse. Ingen database, publisering, partnerkontakt eller menneskelig review registrert.

Presiseringene ovenfor er kontrollfunn knyttet til de eksakte hashene. En senere endring av påstand eller kildebinding krever en ny versjonsbundet kontroll.

## Tillegg mottatt etter kontrollen

Forfatteragenten fulgte opp punkt1–2 i separat `provenance-addendum.json` datert 2026-09-09T07:18:19Z. Artikkel1-avgrensningen er lagt til for D-O004. For D-O005 har forfatteragenten åpnet OsloMet-pressemeldingen på NTB og fulgt vedleggslenken. Original HTML er bevart med SHA-256 `b3897218cec83a9c5a30f3a028b4ae2a331304f9b5298a2363be6b7af2100ddf`.

Kontrollagenten har lest tillegget og kontrollert HTML-filens hash. Selve navigasjonen/publiseringslenken er separat kontrollert av forfatteragenten; kontrollagentens egen innholdskontroll gjelder originalfilens identitet og PDF 3, som beskrevet ovenfor. Punkt1–2 er dermed fulgt opp med datert presisering/proveniens, uten omskriving av den opprinnelige pakken. Punkt3–4 er fortsatt relevante reproduksjons- og bruksavgrensninger, ikke påviste tallfeil.
