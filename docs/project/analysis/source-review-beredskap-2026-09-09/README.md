# Arbeidspakke 9. september

- `ARBEIDSMODELL.md`: funn, automatisk kontrollprosess, datamodell og regler for videre innhenting.
- `WHITEPAPER-BEREDSKAP-ARBEIDSUTKAST.md`: ny ledersyntese, leserreise, fem kritisk avgrensede kandidatkort og status mot prosjektformålet.
- `scripts/audit-beredskap-research.py`: kjørbar deterministisk forhåndskontroll. Output er en ny privat kjøring, ikke kandidat- eller produksjonshistorikk.

Kjør fra repoet med Python 3:

```sh
python3 scripts/test-audit-beredskap-research.py
python3 scripts/audit-beredskap-research.py --package /absolutt/sti/til/agent-research-2026-09-08 --output /absolutt/sti/til/ny-privat-kjoring
```

Output må ikke finnes fra før. Pakken må inneholde `resultater/A1/data.json` til og med A5. Originaler med registrert arkivsti kopieres til den nye private kjøringen under observert SHA-256; arkivkopier skal ikke legges i Git. Inngangsmetadata bevares også når en hash ikke samsvarer. Ved feil bevares eventuell delvis kjøring, og nytt forsøk bruker ny mappe.

Før ny kildevurdering: bruk `audit.json` sine observasjonsrader og `route`, sammen med originale kilder og eksakte lokatorer. `prepare_semantic_review` betyr forbered videre review, aldri godkjent. Lukk ikke datagap ut fra `priorAssessment`. Endret kilde eller påstand krever ny kontroll. Kandidater som senere føres inn i kandidatarkivet må gå gjennom prosjektets navngitte append-only writer.

Privat kjøring ligger under denne oppgavens `source-review-beredskap/`: `run-001/audit.json`, forseglete input-/arkivfiler, `hash-discrepancy-review.json`, `status.json`, `artifact.json`, `report.html` og `REPORT-QA.json`. Rapporten er generert med Data Analytics sin kanoniske rapportbygger. Strukturell kontroll består; den automatiske nettleserkontrollen stoppet med `reader_timeout` under SVG-uttrekk. Diagramdata og tekst er bevart i HTML-fallback; interaktiv visning er ikke godkjent av kontrollen.

Kontrollutfall: fire målrettede tester bestod. Ingen database, kandidatmyndighet, kanonisk manus, generert app, deployment eller publiseringsstatus er endret. Prosjektvedtak og partnerarbeid er ikke inkludert som gjennomførbare KI-oppgaver.
