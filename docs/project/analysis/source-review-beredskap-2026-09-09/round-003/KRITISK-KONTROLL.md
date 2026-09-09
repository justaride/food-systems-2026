# Kritisk sluttkontroll

Root, 9. september 2026. Alle 21 kandidatpåstander er lest som del av syntesen. Direkte kontroll av originale kildesteder er avgrenset til områdene nedenfor; øvrig kildeinnhold har temagentenes dokumenterte lesing. Dette er ikke uavhengige modellfamilier eller menneskelig review.

| Område | Kontrollert direkte | Konsekvens |
|---|---|---|
| Næringsstoffer | Hias PDF28; NIBIO PDF22/26; NORSØK PDF20/27 | Produksjon er ikke beholdning; overjordisk tørrstoff er ikke kornavling. Tabellens240→410 gir70,8 prosent, ikke diskusjonens130. Ingen kildeverdi er stilletiende endret. |
| Måltider | Bevarte Hylte-linjer12–24 og Trelleborg40–51 |180 gjelder et måltid for personer,100 gjelder tilberedte porsjoner. Hyltes fire timer er mål; Trelleborgs vannøvelse er ikke dokumentert samtidig med suppeøkten. |
| Klima | Beillouin213–245; Bakke1008–1029/1255–1284; Tootoonchi619–655 | Arealandel, stasjonsandel og modellens faste/tilfeldige effekter beholdes. Ingen omregning til nordisk reserve. |
| Dokumentasjon | Originale StatFin-koder/verdier; Finlex lov445 PDF15, traktat95 PDF1, riktig55 PDF2–6; SIFO-identitet | Feil S004-identitet, lovtekst og15 celler er avklart. Eget avgrensningstillegg binder OsloMet-pressemeldingen og artikkel1. |
| Kvitteringskø | Ny kode,20 tester og faktisk21-pakke | Integritetskontroll med forventede hasher og nye outputmapper. Ingen modellkall eller faglig autoritet. |

[Separat dokumentasjonskontroll](documentation/KRITISK-KONTROLL.md) verifiserte kildehashene, StatFin-indeksene og SIFO-byteidentiteten. Den førte til [proveniens- og situasjonstillegget](documentation/provenance-addendum.json). Separat kodekontroll fant at `one`/`One` kunne kollidere på Mac; runneren avviser nå dette før jobbstart, med regresjonstest og etterkontroll.

Den sammenstilte kvitteringspakken bruker `supported_with_limits` for de nye, allerede avgrensede påstandene, også påstandene som beskriver kildeavvik. Det betyr ikke at den feilaktige opprinnelige kildeidentiteten eller kildeprosenten støttes. Fullt originalobjekt, original vurderingsstatus og avgrensninger ligger i den hashbundne baselinen. Kildenes produksjons-, forsøks-, veilednings- og øvelsesstatuser er ikke gjort like.

Alle nye resultater er lokale. Tidligere releasebevis er eksplisitt historisk. Full app-suite, produksjons-Node-preflight, CI, migrasjon, deploy og autentisert UI er ikke kjørt for denne runden. Beskyttede historiske filer er uendret; dette er en Git-byte-/endringskontroll, ikke en ny databasebasert corpus-health-vurdering.
