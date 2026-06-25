---
tittel: Food TG — Goal-spesifikasjon: N11 Bondemargin / kostnads-pris-skvis (klar-til-kjør)
status: Klar-til-kjør spor-A-spesifikasjon (ikke utført)
eier: Gabriel
dato: 2026-06-18
spor: A (kunnskapsgrunnlag — primærkilde + claim-lock + gate)
forutsetning: Forutsetter vedtatt objektivfunksjon (anbefalt Sett II: resiliens + sirkularitet + bondeøkonomi). Kjøres når vedtaket er fattet.
scope: >
  Smal, fokusert runde som åpner systemmodellens blindsone N11: kostnads-pris-skvisen på det norske
  primærleddet — den manglende halvdelen av konsentrasjonshistorien (vi har den som presser, ikke den
  som presses). Forfremmer research-agendaen fra spor C-scenariet «Det doble sjokket» til spor A.
bruksregel: >
  Spor A: primærkilde-først, claim-lock-format, adversariell verifikasjon + gate som definition-of-done.
  Ingen aktørkontakt (desk/primær). Wageningen-guardrail gjelder.
relaterte_filer:
  - docs/project/analysis/food-tg-systemmodell-integrert-2026-06-18.md
  - docs/project/sandbox/2026-06-18-scenario-forsyningssjokk.md
  - docs/project/analysis/food-tg-objektivfunksjon-arbeidsmodell-beslutning-2026-06-18.md
---

# Goal G-N11-001 — Bondemargin / kostnads-pris-skvis

## Hvorfor (forankring)

Tre uavhengige resonnementer peker på denne noden: objektivfunksjonen (Sett II navngir bondeøkonomi), systemmodellen (§6: prosjektet er svakest her), og spor C-scenariet (skvisen lander faktisk på N11, og vi er blinde). Dette goalet lukker den blindsonen — smalt og primærkilde-tractabelt.

## Spørsmålet som skal svares ut

Hvor hardt presses det norske primærleddet mellom stigende innsatskostnader og en konsentrert kjøperside, og hvordan utvikler bondens faktiske vederlag seg over tid? Konkret:

1. **Inntekts-/vederlagsutvikling:** vederlag til arbeid og egenkapital per årsverk i jordbruket, tidsserie (nyeste 10 år), og inntektsgapet mot andre grupper (jordbruksoppgjørets referansebruk).
2. **Kostnads-pris-skvisen:** utvikling i innsatskostnader (kraftfôr, gjødsel, energi, kapital) vs. produsentpriser — kostnadsindeks mot prisindeks, så «skvisen» tallfestes.
3. **Per produksjon der mulig:** melk, korn, svin, kylling, sau/storfe — hvilke ledd er mest skviset.
4. **Sjokk-respons (scenario-koblingen):** hvordan slo gjødsel-/energisjokket 2022–2023 ut i marginene (det nærmeste naturlige eksperimentet vi har)?

## Primærkilder (i prioritert rekkefølge)

- **Budsjettnemnda for jordbruket (BFJ)** — Totalkalkylen for jordbruket (normalisert/registrert regnskap), referansebruksberegninger.
- **NIBIO Driftsgranskinger i jordbruket** — faktiske driftsregnskap per bruk/produksjon.
- **Jordbruksoppgjøret** (regjeringen.no / LMD) — inntektsutvikling, inntektsgap, grunnlagsmateriale.
- **SSB** — produsentprisindeks jordbruk, kostnadsindeks; landbrukstelling.
- Skill normalisert kalkyle fra faktisk driftsregnskap eksplisitt; skill vederlag til arbeid+egenkapital fra «inntekt» løst.

## Leveranse og definition-of-done

- Skriv én fil: `research/external/r6/deep-research-r6-n11-bondemargin-2026-…md` (opprett `r6/` om nødvendig).
- Format: «## Kort dom» · «## Datatabell» (metrikk | verdi | enhet | år | geografi | metode | kildeeier | URL | locator | datakvalitet) · «## Kostnads-pris-skvis (indeks vs indeks)» · «## Per produksjon» · «## Sjokk-respons 2022–23» · «## Kildeledger» · «## Tomme celler / C» · «## Adversariell verifikasjon».
- **DoD:** primærkilde-forankret + uavhengig adversariell verifikasjon (URL-spot + aritmetikk) + mottaksrad (DRO-serie) + relevant gate (`audit:citable`/`gate:overclaim`) grønn før lukking.
- Kobling: oppdater systemmodellen (N11 fra «blind» mot «dekket») og scenariets forfremmelses-status når levert.

## Avgrensning (anti-scope-creep)

- Kun NO i denne runden (nordisk komparativ er en evt. senere utvidelse).
- Ikke aktørkontakt — det som krever bondeintervju/aktørtall markeres B, ikke fabrikkeres.
- Ikke politikk-anbefalinger her — dette er tallgrunnlaget; tolkning hører hjemme i spor B.

---

*Klar til å kjøres (sub-agent eller Codex, ett goal i isolert kontekst) i det øyeblikket objektivfunksjonen er vedtatt. Dette er spor C→A-forfremmelsen av scenariets høyest prioriterte kandidat.*
