---
tittel: Food TG — Mottak av Deep Research runde 3 (17.06.2026)
status: Mottaks-/valideringsnotat (intern)
eier: Gabriel
dato: 2026-06-17
scope: Validering og handling for de 4 runde-3-rapportene (Island gjødsel, nordisk digestat, norsk fiskeslam-census, Brasil-soya 2025). Kjørt på prompt-packen food-tg-deep-research-prompter-runde3-KLARE-2026-06-16.md.
bruksregel: >
  Ingen claim løftet til ekstern faktastemme. Rårapportene ligger i research/external/r3/. Runden lukket få nye tall, men korrigerer ett tidligere forbehold (R3-04) som er anvendt på whitepaper + claim-lock + handelsakse-figuren.
relaterte_filer:
  - research/external/r3/DRO-R3-INDEX-2026-06-17.md
  - docs/project/mandates/food-tg-claim-lock-table-2026-05.md
  - docs/project/mandates/food-tg-runde2-konsolidering-2026-06-16.md
  - content/hvitbok/02-nordisk-sirkularitet.md
  - public/data/food-systems/handelsakse-norge-brasil.json
---

# Mottak — Deep Research runde 3

## 1. Sammendrag

Fire rapporter (R3-01 Island gjødsel, R3-02 nordisk digestat, R3-03 norsk fiskeslam-census, R3-04 Brasil-soya 2025). **Runden lukket få nye tall, men gjorde tre verdifulle ting:** (a) bekreftet at to hull er *reelle data-arkitektur-hull*, ikke søkemiss; (b) ga noen nye deckklare enkeltfakta; og (c) **korrigerte ett tidligere forbehold** — det viktigste utfallet.

**Den viktigste enkeltsaken (R3-04):** det foreløpige 2025-fallet i Brasils soyaandel (~80 %→~42 %) er **trolig revisjonsstøy, ikke en reell vending**. SSB 2025 er foreløpig (endelig mai 2027), og selskapskildene viser ingen Brasil-exit (Denofa 2024 = 68 % Brasil; Felleskjøpet 2024 og 2025 = Brasil/USA/Canada/Polen). Jeg hadde overdrevet dette i whitepaper-kapittel 02 og claim-lock — **nå korrigert** (se §3).

**Ingenting nytt ble «lukket» til primær:** Island-verdiene ble fortsatt ikke uttrukket (eksport-blokkert) + ny basis-konflikt; digestat-N/P/K-retur og fiskeslam-aggregat er bekreftet ikke-eksisterende offentlig.

---

## 2. Mottaksrad per rapport

| # | Tema | Kort dom | Nytt av verdi | Importbeslutning |
|---|---|---|---|---|
| **R3-01** | Island mineralgjødsel | **needs-data** (uendret) | Tabell `LAN10001`, 2024 finnes; men verdiene ikke uttrukket. NY basis-konflikt: nåværende etikett `P/K` (element) vs. eldre Hagstofa-årbok `P2O5/K2O`. | Island forblir «ikke hentet» i gjødselfiguren. Legg basis-konflikt som forbehold. Alt. rute: Nordic Statistics FERT01 (kun N+P, «pure fertilizer»). |
| **R3-02** | Nordisk digestat/næringsretur | **bekreftet hull** | Realisert N/P/K-retur finnes ikke offentlig (DK/FI/NO/IS) utenom Sverige — reelt data-hull. **NY deckklar NO-fakta:** 218 000 t avvannet + 370 000 t flytende biorest (2022), **84 % spredd på jordbruksareal** (Landbruksdir. 17/2024). | NO-biorest-tallene → claim-lock (deckklart). N/P/K-retur → needs-data (alle land). |
| **R3-03** | Norsk fiskeslam-census | **bekreftet hull + nye anleggsfakta** | Nasjonalt aggregat per sluttbruk **finnes ikke** (Fiskeridir/SSB/Miljødir/Mattilsynet). Realiserte enkeltanlegg: Cermaq Forsan ~260 t TS/år (biogass); Norcem ~40 t (energi); IVAR Minorga 4 200–4 600 t blandet gjødsel/år (eksport Vietnam); Miljødir 2018 ~1 000 t TS til 2 biogassanlegg. | Anleggsfakta → claim-lock (deckklart, anleggsnivå). Nasjonalt aggregat → bekreftet «finnes ikke». Aktør-input-masse → needs-actor-validation. |
| **R3-04** | Brasil-soya 2025 | **needs-primary-check / revisjonsusikkerhet** | 2025-fallet er trolig foreløpig-statistikk-støy. Selskapskilder: Denofa 2024 = 68 % Brasil / 12 % Romania / 10 % Polen / 10 % Canada; Felleskjøpet 2024+2025 = Brasil/USA/Canada/Polen. Ingen Paraguay/Argentina-skifte. | **Korreksjon anvendt** (§3): whitepaper + claim-lock + handelsakse. |

---

## 3. Korreksjon utført (R3-04)

R3-04 viste at jeg hadde overdrevet 2025-fallet. Rettet i tre filer:

1. **`content/hvitbok/02-nordisk-sirkularitet.md`** — 2025-setningen omskrevet: fallet skal ikke leses som en dokumentert vending; selskapskildene viser ingen Brasil-exit.
2. **`docs/project/mandates/food-tg-claim-lock-table-2026-05.md`** — ny «Runde 3-delta 2026-06-17»-seksjon med korreksjon til `CL-A-022` + oppdatert «ikke si»: ikke si «Brasil-andelen falt i 2025» som faktum; ikke si «EUDR flyttet norske kjøp bort fra Brasil».
3. **`public/data/food-systems/handelsakse-norge-brasil.json`** — skjerpet 2025-forbehold (revisjonsstøy; Brasil fortsatt hovedopprinnelse).

Handelsakse-figuren markerte allerede 2025 som foreløpig (referanselinje + badge), så den var korrekt på akse-nivå; korreksjonen gjelder *tolkningen* av fallet.

---

## 4. Nye deckklare fakta (staget til claim-lock «Runde 3-delta»)

- Norsk biorest: 218 000 t avvannet + 370 000 t flytende (2022); **84 % spredd på jordbruksareal** (Landbruksdir. 17/2024).
- Fiskeslam realiserte anlegg: Cermaq Forsan ~260 t TS/år; Norcem ~40 t; IVAR Minorga 4 200–4 600 t blandet/år; Miljødir 2018 ~1 000 t TS.
- Denofa opprinnelsesmiks 2024: 68 % Brasil / 12 % Romania / 10 % Polen / 10 % Canada.

**Disse styrker potensial-vs-realisert-narrativet ytterligere:** selv biorest som *produseres* (218k+370k t) og *spres på jord* (84 %) mangler N/P/K-tallfesting — og fiskeslam har ikke engang et nasjonalt aggregat. Gapet er ikke bare «lite realisert», men «ikke engang målt».

---

## 5. Gjenstår (datahull bekreftet — ikke søkbart videre nå)

| Hull | Status | Vei videre |
|---|---|---|
| Island N/P/K-verdier | needs-data; eksport-blokkert + basis-konflikt | Direkte PxWeb-uttrekk (POST) eller Nordic Statistics FERT01 (kun N+P); verifiser element vs. oksid-basis. |
| Digestat-N/P/K-retur (DK/FI/NO/IS) | reelt data-arkitektur-hull | Krever aktør-/anleggsdata, ikke offentlig statistikk. Parker som «finnes ikke nasjonalt». |
| Fiskeslam aktør-input-masse | needs-actor-validation | Bioretur/Terramarine/IVAR-aktørask (etter vedtak). |
| SSB-soya 2025 endelig | foreløpig til mai 2027 | Monitor (DEL 3 i runde-3-pakken). |

---

*Ingen claim løftet til ekstern validert status. R3-04-korreksjonen er anvendt; nye fakta staget i claim-lock «Runde 3-delta». Rårapporter: `research/external/r3/`.*
