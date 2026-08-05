# Innhentingssesjon 2026-08-05 — START HER

**Hva dette er:** en ren **innhentingssesjon**. Vi henter eksterne primærkilder, datapunkter, rapporter, artikler og datasett — og fanger proveniens ved inntak. Vi bygger belegget som lar oss øke detaljnivået senere på et grunnlag som holder.

**Hva dette IKKE er:** ingen syntese, ingen nye konklusjoner, ingen feltanalyser. Det kommer i en senere runde. I natt samler vi bare, og fanger kilde + lokator + basis på alt.

**Hvorfor:** natt-runden (Innsiktssporet R2) strøk 93 tall fordi de manglet ekstern primærkilde. Svaret er å hente de kildene — men *med* proveniens fanget ved inntak, ellers bygger vi samme gjeld på nytt.

---

## 1. Grunnreglene (samme disiplin som R2)

1. **Kun innhenting.** Ikke skriv analyser eller konklusjoner. Hvert datapunkt er en observasjon fra én kilde.
2. **Proveniens på alt.** Hvert tall/påstand får `source`, `locator` (side/tabell/URL-seksjon), `basis` (maalt/modellert/aktoropplysning/ikke_oppgitt) og `systemBoundary` når det er volumtall.
3. **Primærkilde skilles fra syntese.** Merk `sourceKind`: `primary_evidence` (rapport/datasett/artikkel/statistikk med egne data) vs `secondary`/`media` (omtale, aktøropplysning). Media kan bære `aktoropplysning`, aldri `maalt`.
4. **Ingen skriving til `knowledge/corpus/`, register, køer eller database.** Alt lander i `research/innhenting-2026-08-05/`.
5. **Delvis og ærlig slår komplett og gjettet.** Får du ikke tak i en kilde (paywall, død lenke), logg den — ikke gjett innholdet.

---

## 2. To baner

**Backlog-banen (B0–B7):** hent de 118 kjente-men-uinnhentede radene fra `INNHENTING-MANIFEST.jsonl`. Hver agent tar sin `slice`.

**Oppdagelses-banen (D-felt):** rettet akademisk søk etter *nye* åpen-tilgang-primærkilder som kan gjenopprette strøkne tall i de tyngste hullene. Alt som ikke lar seg hente (paywall, lovende spor) logges til `OPPDAGET-KØ.jsonl` for senere — aldri gjetting.

---

## 3. Utdata per kilde

For hver kilde du faktisk henter, skriv:

**(a)** Selve kilden til `staging/` (PDF, eller `.md` med ekstrahert tekst for HTML/datasett). Behold original-URL i toppen.

**(b)** Én **ekstraksjonspost** til `ekstrakt/innhenting-<SLICE>.jsonl`, én JSON-linje:

```json
{
  "source": "<institusjon/forfatter, år>", "title": "<faktisk tittel>",
  "url": "...", "stagedPath": "staging/...", "sourceKind": "primary_evidence|secondary|media|dataset",
  "year": 2024, "country": ["NO"], "theme": "<fra manifest eller utledet>",
  "retrieval": "fetched_full|fetched_partial|metadata_only|paywalled|dead_link",
  "findings": [
    {"claim": "<hva kilden sier, tett parafrase>", "value": "43 %", "unit": "andel",
     "year": 2023, "locator": "s. 12 / tabell 3",
     "basis": "maalt|modellert|aktoropplysning|ikke_oppgitt",
     "systemBoundary": "<med/ikke med, ved volumtall>",
     "fillsGap": ["materialstrommer"], "geo": ["NO"]}
  ],
  "dataset": {"isDataset": false, "format": "", "coverageYears": [], "unitOfObservation": ""},
  "notMeasured": ["..."], "limitations": "<kildens forbehold>",
  "provisional": true, "producedBy": "innhenting-2026-08-05"
}
```

`fillsGap` kobler kilden til feltene fra R2: `materialstrommer, beredskap_import, lokale_verdikjeder, makt_eierskap, aktordybde, nordisk_dybde, kausalitet, offentlig_innkjop, okologi_jordhelse, alternativt_protein, kvalitativt_lag`.

**(c)** Oppdater backlog-CSV: sett raden din fra `url_only` → `downloaded` (eller `paywalled`/`dead_link`) i kildefila (`_csv`-feltet i manifestet sier hvilken).

**(d)** Rapport til `RAPPORT-<SLICE>.md`: hentet/paywall/død, antall findings, felt dekket.

---

## 4. Backlog-agentprompt (bytt ut `<SLICE>`, f.eks. `B2_market_power`)

> Du er innhenter for skive `<SLICE>`. cwd: `/Users/gabrielfreeman/Documents/Food Systems 2026`.
> Les `research/innhenting-2026-08-05/START-HER.md` (hele).
> Hent dine rader: `python3 -c "import json;[print(json.dumps(d,ensure_ascii=False)) for d in map(json.loads,open('research/innhenting-2026-08-05/INNHENTING-MANIFEST.jsonl')) if d['slice']=='<SLICE>']"`
> For hver rad: hent URL-en (WebFetch for HTML; last ned PDF og kjør `pdftotext`; for datasett, hent fila + noter struktur). Skriv kilde til `staging/`, ekstraksjonspost til `ekstrakt/innhenting-<SLICE>.jsonl`, og oppdater CSV-status. Paywall/død lenke → logg med `retrieval`-flagg, ikke gjett.
> Rapport til `RAPPORT-<SLICE>.md`. Returner JSON: `{"slice":"<SLICE>","fetched":N,"paywalled":N,"dead":N,"findings":N}`.

## 5. Oppdagelses-agentprompt (bytt ut `<FELT>`: `materialstrommer` eller `alternativt_protein`)

> Du er oppdager for hullet `<FELT>`. cwd: samme. Les START-HER.md.
> Bakgrunn: dette feltet fikk tall strøket i R2 fordi de manglet ekstern primærkilde. Finn *nye* åpen-tilgang-primærkilder (offisiell statistikk: SSB, NIBIO, Landbruksdirektoratet, Jordbruksverket, Luke, Eurostat; fagfellevurdert forskning; bransjedata) som kan gjenopprette dem.
> For hver kilde du faktisk får hentet: staging + ekstraksjonspost (`ekstrakt/innhenting-D-<FELT>.jsonl`) med full proveniens. Alt du finner men ikke får hentet (paywall, lovende spor) → én linje i `OPPDAGET-KØ.jsonl` med `{title,url,why,fillsGap,access:"paywalled|manual|unknown"}`.
> Ikke gjett innhold du ikke har lest. Returner JSON: `{"felt":"<FELT>","fetched":N,"queued":N,"findings":N}`.

---

## 6. Sluttsjekk

- [ ] Ingen skriving til `knowledge/corpus/`, register, køer, DB
- [ ] Hvert tall har `basis` + `locator`; volumtall har `systemBoundary`
- [ ] `sourceKind`/`retrieval` satt på hver post; paywall/død ærlig flagget
- [ ] Backlog-CSV-status oppdatert for hentede rader
- [ ] OPPDAGET-KØ fylt for det som ikke lot seg hente
- [ ] Alt provisorisk, i `research/innhenting-2026-08-05/`
