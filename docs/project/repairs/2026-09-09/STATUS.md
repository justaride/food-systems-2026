# Gjennomføring av prosjektreparasjoner, 9. september 2026

Dette er gjennomføringsstatus for alle 30 funn i prosjektrevisjonen. Registeret i `execution-register.json` beholder de opprinnelige akseptansekriteriene. En teknisk retting er ikke automatisk faglig ferdigstilling.

## Rettet i denne leveransen

- Forsiden gir tre tydelige innganger til arbeidskø, kilder og innsikt. Mobilmenyen viser hele navigasjonen, støtter Escape og returnerer fokus. Skiplink og aktiv undermeny er forbedret.
- Hvitboken viser leserveiledningen og alle 15 kapitler fra syntese v2, med kapittelnavigasjon, lesbar typografi, innholdsankre og spor til nøyaktig kildeversjon. Intern utkaststatus er synlig. Syntesens originaltekst er uendret.
- Havbruk, sirkularitet, media og politikk viser hva utvalget dekker, kildenes kontrolltid og hva tallene ikke kan brukes til. Supplerende rettinger av summer og manglende vurderinger dokumenteres i `DATA-SCOPE.md`.
- Felles sidefeil og 404 gir forklaring og en fungerende vei videre. Retry henter faktisk data på nytt.
- Vanlig søk beholdes etter Gabriels valg. Embeddings-jobben lager bare en avgrenset, skrivebeskyttet plan; ingen nøkkel, provider-kall eller indeksering er aktivert.
- Analysearbeidspakker har strengere per-item dekning, skiller formatering fra innhold og godtar eksplisitte Sol-/Terra-kvitteringer. En manglende SQL-migrasjon for workflow 1.0.24 er lagt til uten endring av autoritet eller historikk.
- Next og berørte underavhengigheter er oppdatert; fersk npm-audit viser null kjente sårbarheter. Lokal Node/llhttp-forsegling og eksterne runtime-røtter er avstemt. Backup-kvitteringen peker til ferske, hashkontrollerte Estate-bevis.

## Kontrollert lokalt

Full testkjøring etter runtime-reparasjonen: 2 657 tester, 2 656 bestått, null feil og én hoppet over. Hoppet gjelder forskjell på store/små bokstaver i filnavn på dette filsystemet. Lint, typekontroll og produksjonsbygg besto; nye fokuserte sluttendringer følges av egne relevante kontroller.

Faktiske lokale brukerreiser: forside, hele mobilmenyen, Escape/fokus, hvitbokoversikt og kapitler, havbruk, media, politikk, sirkularitet, vanlig søk og 404. Søk etter «matsvinn» ga treff og viste den syntetiske oppgaveplassholderen som blokkert. En separat server med med hensikt utilgjengelig lokal database viste feilforklaringen; etter gjenoppretting hentet «Prøv igjen» havbrukssiden med data. Ingen produksjonsfeil ble fremprovosert.

## Kildearbeid som er klargjort

`FINANCIAL-RECONCILIATION.md` dokumenterer Nofima 2023 mot to originalrapporter og Holdbart 2024 mot BRREG. Holdbarts driftsresultat har et gjenværende avvik på én krone mellom originaloppstillinger. Tidligere Austevoll-/Axfood-kandidater beholdes.

`NORDIC-FLOW.md` dokumenterer en norsk kandidat: 183 690 tonn sendt fra kommunal husholdningsinnsamling til biogass i 2024. Dette er en innstrøm, ikke dokumentert behandlet mengde, biogassproduksjon eller næringsstoffretur. Ingen av de 40 kanoniske nordiske hullene er automatisk fylt.

## Hva som fortsatt må gjennomføres

1. Kildeidentitet og regnskapsavstemming må behandles gjennom de kontrollerte kandidat- og godkjenningsløpene; dokumenterte kjøperrelasjoner og flere sammenlignbare nordiske strømmer mangler fortsatt.
2. Bibliotekets 1 770 poster krever faktisk analyse og uavhengig kontroll før det kan kalles et fullført kunnskapsløp. Den gamle Luna-piloten er fortsatt i karantene. En ny avgrenset Sol-/Terra-kvalifisering dokumenteres separat; en vellykket pilot er ikke hele køen.
3. Tidsfølsomme fagpåstander trenger datert primærkildekontroll og vedlikeholdsansvar. Synlig ferskhet er ikke i seg selv en ny kildekontroll. Tilgjengelighet og språk er forbedret på sentrale reiser, men hele produktet er ikke sertifisert mot en tilgjengelighetsstandard.
4. Mandat, finansiering, organisatorisk hjem, partner-/pilotvalg, faktiske intervjuer og delingsnivå trenger beslutning eller gjennomføring. `DECISIONS.md` samler tre konkrete beslutningspakker; det kreves ikke manuell lesing av hele korpuset.

Prosjektets `AGENTS.md` sier: «KI may not record human review, promote canonical data, publish, or change coverage readiness.» Derfor beholdes faglige kandidater og beslutninger som åpne inntil den nødvendige autoriteten finnes. Teknisk publisering av programrettingene endrer ingen faglig godkjenningsstatus.

## Leveransebevis

Lokal gren: `codex/project-completion-2026-09-09`, startet fra `fd34549cc9e064eb9245da14d7640a62405472ce`. Produksjonen før endringen var `8badda09a65c15ccb0a21c3955d6f71c54d24ef6`. PR, CI, merge, deploy og sluttkontroll av runtime dokumenteres separat når de er verifisert; disse leddene er ikke implisert av lokale tester.

Private råkilder, modellartefakter og lokale testlogger ligger utenfor Git i den tilhørende `project-completion-2026-09-09`-mappen. Kun programkode, avledet hvitbokvisning og avgrensede gjennomføringsnotater inngår i leveransen.
