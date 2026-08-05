# S3-C — kandidatplan-diff

**Dato:** 4. august 2026  
**Status:** kandidat generert og plan-only validert; ikke godkjent, ikke låst og ikke anvendt.

## Pin-avviket

Den låste planen fra 3. august forventer source-analysis-input-manifestet med filhash `897f3599585ed8cb1fb73749df28e944b38d283805ee981499ef440d89f06803`. Canonical-commit `006986f715f3650511d2888f26e0885933787367`, datert 3. august kl. 16:41 +02:00, endret manifestet; dagens filhash er `631ad900849a9951a3e5471b35e28f8905b8c8607f9a0491deacb59f316c455d`.

Den låste planen ble ikke overskrevet. Første forsøk mot låst batch stoppet fail-closed på dette pin-avviket.

## Kandidat

| Felt | Låst v1 | Kandidat |
|---|---|---|
| Plansti | `knowledge/corpus/source-registration/source-registration-dry-run-plan-2026-08-03.v1.json` | `knowledge/corpus/source-registration/source-registration-candidate-plan-2026-08-04.v1.json` |
| Plan-SHA-256 | `sha256:631fef2595bf8f9e897485c1f064654716a3bdb2591bbfb20227370d496a4e2f` | `sha256:6bd743a763eafe98e004ff7eaf529dfb36753e1c62ee29b723ec9eedbf277711` |
| Planfil-SHA-256 | `7a8de0151ad9d0c77bb7bb47a01c3bd08922805e933a5b379aea3dd59b84def9` | `ca43042945aaea7e3f0b1758588f16dbb97af450df5bc1cc4c54a5dbc526621c` |
| Manifest-pin | `897f3599…` | `631ad900…` |
| Mål | 10 | 10 |
| Ventende | 10 | 10 |
| Allerede registrert | 0 | 0 |
| Konflikter | 0 | 0 |
| Private recovery-rader | 10 | 10 |
| Sider / normaliserte ord | 558 / 213325 | 558 / 213325 |

Målsettet er byte-sammenfallende mellom planene. Kandidaten ble generert med dagens private primær-/replikakontroll og live read-only databaseinspeksjon. Kommandoen rapporterte `databaseMutationPerformed:false`, `networkAccessPerformed:false` og `applyEnabled:false`.

## Viktig kompatibilitetsmerknad

Kandidatplanens overordnede `inputBindings.sourceRegistrationBatch` peker korrekt på kandidatbatchen, men generatorens eksisterende kontroll-lenke inne i de planlagte library-radene peker fortsatt på den låste v1-batchstien. Dette må avklares og eventuelt løses i en ny kontrollert plan-/runtime-revisjon før noen godkjenning eller senere apply-vurdering.

## Sperrer

- Gabriel må godkjenne eller forkaste kandidaten.
- Ingen `--apply`, signering eller databaseskriving er utført.
- Kandidaten er ikke en ny låst plan og skal ikke brukes som mutasjonsautoritet.
