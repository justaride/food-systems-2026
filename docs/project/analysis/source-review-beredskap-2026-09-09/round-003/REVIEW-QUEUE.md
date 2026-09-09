# Lokal, reproduserbar kø for KI-review-kvitteringer

`scripts/run-beredskap-review-queue.py` gjenbruker `verify-beredskap-review.py` uten endringer. Køen gjør ingen modellkall. Den kontrollerer eksisterende kvitteringer, originalpåstander, kildebytes, baseline og policy på nytt hver gang. Den avgjør ikke faglig sannhet og registrerer ingen menneskelig myndighet, kanonisk promotering, readiness eller publisering.

## Manifest og kjøring

Manifestet er en lokal JSON-fil med `verifierSha256`, `policySha256` og `jobs`. Hver jobb har unik `jobId`, absolutt `packetPath` og forventet `packetSha256`. Bindingene etableres for den konkret vurderte versjonen; en endret kilde krever ny review, ikke bare oppdaterte hasher.

```json
{
  "verifierSha256": "<SHA-256 av eksisterende verifierbytes>",
  "policySha256": "<SHA-256 av verifier.canonical(verifier.POLICY)>",
  "jobs": [
    {
      "jobId": "review-one",
      "packetPath": "/absolutt/privat/sti/review-packet.json",
      "packetSha256": "<SHA-256 av eksakte pakkebytes>"
    }
  ]
}
```

```sh
python3 scripts/run-beredskap-review-queue.py \
  --manifest /absolutt/privat/sti/queue.json \
  --output-dir /absolutt/privat/sti/ny-kjoring \
  --max-jobs 20
python3 scripts/test-run-beredskap-review-queue.py
```

Output-mappen må være helt ny, med eksisterende forelder og uten symbolske lenker eller `..` i stien. På macOS må `/var`/`/tmp`-aliaser først løses til faktisk absolutt sti. Manifest og pakker er begrenset til 32 MiB; kildearkiver hashes i blokker. Standardgrensen er 20 jobber og absolutt maks 100. Resultater skrives med eksklusiv opprettelse og settes lesbare uten skrivebit; dette er en lokal ikke-overskrivingsregel, ikke ekstern signatur eller WORM-lagring.

Hver jobb får en ny `job-<id>.json`; `summary.json` binder resultatfilenes hasher, manifest, køscript, verifier og policy. Status er `passed`, `failed`, `input_changed`, `invalid_input` eller `missing_input`. En delvis mislykket kø kontrollerer fortsatt resterende gyldige jobber og gir exitkode 1. Utrygg/eksisterende output-sti gir exitkode 2. Ingen gammel output brukes som cache eller evidens. Kilde- og pakkebytes kontrolleres også før/etter den enkelte kontrollen; en etterfølgende endring krever ny kjøring.

## Faktisk kjøring 9. september 2026

Den private historiske `round-002/consolidated-v2/review-packet.json` ble kontrollert gjennom køen: 127 observasjoner, 127 review og 83 bundne kilder. Siste kvittering finnes privat under `round-003/review-queue-run-003/` og gjelder scriptet etter case-kollisjonsrettelsen; kildene og den historiske pakken er uendret. Dette er ny integritetskontroll av tidligere review, ikke ny semantisk lesing av alle kildene. Første kjøring avdekket at ett kildearkiv oversteg JSON-grensen; den feilede kvitteringen er bevart. Scriptet ble rettet til blokkvis kildehashing og kjørt til nye mapper. Tidligere `run-002` er også bevart.

20 adversarielle tester dekker endret pakke, endret/manglende kilde, endring under kontroll, ugyldig JSON, doble JSON-nøkler/IDer (også case-kollisjoner på APFS), trygg output uten overskriving, policy/verifier-binding, jobbgrense, FIFO-input og delvis feil med nonzero exit. Separat agentkontroll fant case-kollisjon; den er rettet og regresjonstestet. Det historiske verifierscriptet er uendret. Klimafunnene i denne runden har egne kilde-/tekstbindinger og er ikke automatisk nye historiske review-kvitteringer.
