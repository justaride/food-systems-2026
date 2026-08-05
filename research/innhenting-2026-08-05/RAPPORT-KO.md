# RAPPORT-KO — OPPDAGET-KØ innhenting (2026-08-05)

Arbeidet de 9 sporene i `OPPDAGET-KØ.jsonl`. Disiplin: proveniens på alt, ingen paywall/auth-omgåelse, ingen gjetting.

## Resultat: 5 resolved / 4 fortsatt blokkert / 17 findings

Ekstraksjonsposter: `ekstrakt/innhenting-KO.jsonl` (5 poster). Kilder i `staging/`.

### Hentet (resolved)

1. **Lovdata-forskrift FOR-2023-12-11-2037** — fetched_full (`staging/lovdata-forskrift-2023-12-11-2037.txt` + `.html`). §1 forbud (hjemmel konkurranseloven §14), §2 sletting + tvangsmulkt (2 mnd frist), §3 ikraft 1.1.2024.

2. **Brod et al. 2017, Ambio** — fetched_full via **open-access PubMed Central** (`staging/brod-2017-ambio-fish-sludge-pmc.html`). Tørket fiskeslam RAE **50-80 %** av mineralgjødsel-N (målt kar+felt: Apelsvoll 81 %, Værnes 66 %); anaerobisk digestat 0-101 % avh. av slamandel; total P 15-31 g/kg TS.

3. **Estate/NE nyheter 2015 (Coop→Union)** — fetched_full (`staging/estatenyheter-coop-union-2015.md` + `.html`). 52 300 kvm Grorud, tomt ~76 mål, leieinnt. 2013 = 48,8 MNOK, ledig lager 8 700 kvm, bokført ~170 MNOK. **Pris ikke offentliggjort** — 650-700 MNOK er journalistens yield-anslag (~7 %), ikke transaksjonspris. Flagget som `basis: modellert` + `notMeasured`.

4. **Broch & Ellingsen 2020** — primærkilde identifisert: **SINTEF-rapport 2020:00342** (fulltekst gated bak nva.sikt.no). P-tall hentet via **åpen-tilgang sekundær** (Frontiers Sust. Food Syst. 2023, `staging/frontiers-p-flow-norway-2023.html`): 2019 grow-out **10 kt POP + 2 kt DOP + 2 kt DIP ≈ 14 kt P**, modellert. Dette matcher NIBIOs 14 000 t P. **N = 66 000 t ble IKKE verifisert** i noen hentet kilde (kun i et websøk-sammendrag) — står åpent mot den gated primæren.

5. **Konkurransetilsynets Dagligvarerapport 2024-25** — PDF alt staget (`staging/nca-dagligvarerapport-2024-25.pdf`); B2 hadde ekstrahert marked/margin. La til **servitutt-delen**. **VIKTIG KORREKSJON:** de antatte tallene i køen (79 servitutter / 12 kommuner / 67 i Trondheim / NG trakk frivillig 45) **finnes ikke** i rapporten — den er kvalitativ: ingen nye negative servitutter etter forskriften, flere gamle gjenstår med varierende sletteplaner, samarbeidspartnere har stiftet servitutter til fordel for kjedene. Ikke bruk de antatte tallene.

### Fortsatt blokkert (auth/paywall — ikke omgått)

- **Nofima Rapport 23/2021** (`access: manual`) — hdl → nva.sikt.no JS/auth-portal, tom side til ikke-JS-henter.
- **NMBU PhD Hersleth 2023** (`access: manual`) — nva.sikt.no krever auth/JS.
- **Emerald REKO 2021** (`access: paywalled`).
- **E24 Coop-artikkel** (`access: paywalled`) — URL ikke lokalisert.

## Sluttsjekk
- Kun skrevet i `research/innhenting-2026-08-05/` (staging + ekstrakt + kø + denne rapporten). Ikke rørt knowledge/corpus, register, DB.
- Hvert tall har `basis` + `locator`; volumtall har `systemBoundary`.
- Paywall/auth ærlig flagget; ingen omgåelse; ingen gjettede tall (guessede servitutt-tall aktivt korrigert).
