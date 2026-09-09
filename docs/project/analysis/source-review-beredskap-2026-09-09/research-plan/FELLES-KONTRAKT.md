# Felles arbeidskontrakt for researchoppdrag

Dette er et internt, kildebundet forskningsprogram. Planen gir ikke ordre om å starte alle sesjoner. Ved utdeling får én agent én pakke og én unik kjøring. KI-resultater er kandidater, også etter Astra-validering.

## Før start

1. Les prosjektets `AGENTS.md`, denne kontrakten, pakkeprompten og alle oppførte inngangsfiler. Les ferskeste navngitte handover først. Les `input-manifest.json`; forskningsgrunnlaget er commit `4026a90d62edf129d4323f7f0971ace716b03983`. Planens egen commit kommer i tillegg og registreres separat.
2. Koordinator tildeler `programRunId`, `packageId`, `runId`, plan-commit og isolert worktree. Inspiser Git-rot, HEAD, status og `git worktree list`. Bevar eksisterende endringer; aldri reset, clean, stash eller masse-stage. Parallelle sesjoner skriver ikke i samme worktree eller leveransemappe. Eksempler på ID-er er eksempler, ikke reserverte kjøringer.
3. Frys manifest med SHA-256 for instruksjon, policy, målprofil, eksisterende kildeuttrekk og avhengighetsleveranser før analysen. Hvis målprofilen mangler, skriv en eksplisitt kandidatprofil med ukjente felt og hash den; ikke finn på krav. Verifiser kildeversjoner du faktisk bruker. Manglende private filer på en annen maskin gir `waiting_source`, ikke en påstand om at filen er lest.
4. Oppgi modell fra tilgjengelig verktøy-/sesjonsmetadata. Skill `requestedModel`, `reportedModel` og `attestedModel`. Egen identitetspåstand alene attesterer ingen modell; utilgjengelig verdi er `null` med begrunnelse.
5. Avhengigheter trenger en hashbundet terminal leveranse, også når leveransen er et dokumentert stopp. Et stopp opphever ikke den faglige begrensningen: en manglende harmoniseringsbro gir fortsatt ingen harmonisert beregning.

## Avgrensning og søkeregel

Arbeid bare med pakkens spørsmål. Gjenbruk tidligere søkelogg, kilder og stoppunkter før nye søk. Les originalkilden før den brukes som evidens. Søketreff, sammendrag, referanselister og modellminne er spor til kilder. Hvert nytt søk skal ha et konkret åpent spørsmål og et navngitt kilde-/dokumentmål.

Følg pakkens særskilte stoppregel. Når de oppgitte kanalene er undersøkt uten relevant ny dokumentasjon, lever et presist gap og hvem som kan eie svaret. Ikke fortsett med omformuleringer av samme brede søk. Ved kontekstgrense: lever en uforanderlig delkjøring og handover; neste sesjon får ny `runId`. Ingen tid eller tokenmengde er forhåndsgodkjent som ubegrenset arbeid.

Ikke kontakt noen eller send e-post. Dataeierbehov blir usendte forespørsler med presise felt. Nye utgifter, lisenser eller annen tilgang må være særskilt autorisert. Ikke omgå tilgangskontroll. Ikke last opp interne råkilder til nye tjenester.

## Lagring og leveranse

Repository-relative utmappe for hver kjøring:

`docs/project/analysis/source-review-beredskap-2026-09-09/research-runs/<programRunId>/<packageId>/<runId>/`

Råfiler, fulle kildeuttrekk og private kontrollkvitteringer ligger utenfor Git i en unik mappe under koordinatorens lokale artefaktrot. På denne maskinen kan roten være `/Users/gabrielfreeman/.codex/visualizations/2026/09/09/01a0855c-d619-77d1-8f50-54d1006d6b0e/research-runs/`. Registrer faktisk sti og portabilitetsbehov. Master må kunne lese samme bytes via allerede autorisert tilgang; en ekstern sti alene beviser ikke tilgang.

Lever disse filene, også ved dokumentert stopp:

| Fil | Krav |
|---|---|
| `findings.md` | Svar per spørsmål, hva som er kjent/ukjent, begrensninger, motsigelser og presist neste steg. |
| `sources.json` | Kildeposter med identitet, versjon, datoer, faktisk lest omfang, rettigheter og rå-/teksthash. Tom liste er tillatt ved ingen nye kilder. |
| `observations.json` | Atomære påstander, målprofil, kildelokatorer, evidenshash, usikkerhet og beregninger. Tom liste er bedre enn oppdiktede funn. |
| `gaps.json` | Én vurdering per eid gap-ID; bevar ID og historikk, angi overlapp og nye delgap med prefiks `<packageId>-<runId>-G`. Ingen automatisk lukking. |
| `search-log.json` | Nye spørsmål, dato, kanal, søk/dokument, resultat, lesestatus og stoppbegrunnelse. |
| `handoff.json` | Pakke/kjøring, modellmetadata, terminalstatus, input- og filmanifest, avhengigheter, avgrensning og handover. |
| `verification.json` | Utførte kontroller med resultat/evidens, feil, kontroller som ikke er utført. Ikke skriv bestått for planlagte kontroller. |

Bruk strukturene i `templates/` som start. De er merket `templateOnly: true`; faktiske leveranser skal ha `templateOnly: false` og utfylte obligatoriske identitetsfelt. Tomme kilde-/observasjonslister tillates, men ikke tom begrunnelse for stopp.

Ved beregning: lever også kode, inputtabell og kjørekommando. Oppgi enhet, nevner, periode, populasjon, geografi, varekvalitet, fuktbasis og metode. Ukjent er `null`, aldri nulltallet. Skill rapportert størrelse fra beregnet og estimert størrelse. Ingen vektet totalscore som skjuler et manglende ledd.

`handoff.json` lister hash for alle andre leveransefiler og input, men ikke sin egen hash. Koordinator hasher handoff og inkluderer den i masterinntaket. Filhash er SHA-256 av eksakte bytes. JSON-posthash er SHA-256 av UTF-8, sorterte nøkler, `ensure_ascii=False`, separatorer `(',', ':')`, uten avsluttende linjeskift. Kandidathash utelater bare sitt eget `candidateSha256`-felt. Evidenshash beregnes over det eksplisitte `evidencePayload`-objektet. Råhash og teksthash er forskjellige bindinger.

## Status og autoritet

En levert sesjon får én terminalstatus: `complete_within_scope`, `waiting_source`, `waiting_owner`, `waiting_method` eller `awaiting_authority`. `needs_revision` brukes etter returkontroll og krever ny kjøring. `complete_within_scope` betyr at oppdraget er besvart innen avgrensningen, ikke at alle gap er lukket. En eierforespørsel eller manglende tilgang er et gyldig resultat.

Alle kandidater har `human_verified: false`. KI kan foreslå `candidate_resolution_proposed` for et gap med eksakt evidens, men kan ikke endre historisk eller kanonisk gap-/readiness-status. Ingen menneskelig vurdering, kanonisk promotering, publisering, kildebibliotekimport, migrering eller produksjonsendring inngår. Hvis kandidatdata senere skal inn i subsystemet, brukes bare prosjektets autoriserte append-only writer i en egen godkjent arbeidsflyt.

Koordinator eier register og frosset masterinntak. Arbeidere endrer ikke `research-plan/`, tidligere runder eller andre pakker. Genererte planfiler endres gjennom `generate.py`, ikke for hånd. Lokal kontroll er ikke CI, deploy, autentisert UI eller ekstern menneskelig autoritet.
