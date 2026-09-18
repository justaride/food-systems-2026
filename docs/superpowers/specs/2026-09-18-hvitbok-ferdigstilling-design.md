---
tittel: Hvitbok v3 og artikkelsporet — vedtak og prosess
dato: 2026-09-18
status: Retning vedtatt av Gabriel 18.09.2026. Prosessen er et forslag til gjennomføring.
eier: Gabriel
skriveplan: docs/superpowers/plans/2026-09-18-hvitbok-v3-skriveplan.md
---

# Hvitbok v3 og artikkelsporet

18. september 2026. Dette notatet samler trådene fra hvitbokarbeidet og tar valgene som trengs for å skrive en ferdig hvitbok. Det beskriver også hvordan korte artikler for Nordic Circular Hotspot (NCH) og Natural State skal tas ut av det samme grunnlaget.

## 1. Bakgrunn

- **Mars:** Leveransen ble satt til en innsiktsrapport eller hvitbok ([møtet 9. mars](../../meetings/9,%20mars%202026%20FOOD.md)).
- **19. juni:** Jan Thomas skisserte logikken: problem, karakteristikk per ledd i verdikjeden, styrker og svakheter, og til slutt 3–5 satsingsområder. Hvitboka skal også kunne gi korte presentasjoner ([møte 12](../../meetings/FOOD%20TRANSITION%20-%20Møte%2019-06-26.md)).
- **18. juni:** Objektivfunksjonen ble vedtatt: forsyningssikkerhet er hovedmål, sirkularitet delmål og bondeøkonomi en åpnet blindsone ([vedtaket](../../project/analysis/food-tg-objektivfunksjon-VEDTAK-2026-06-18.md)).
- **15. juli:** Mastermanuset [synthesis-v2](../../../research/whitepaper/food-systems-2026-synthesis-v2.md) ble det kanoniske utkastet. Det er intern syntese og kan ikke siteres.
- **September:** Samtalen med Jan Thomas flyttet tyngden mot beredskap og NordForsk. Resultatet ble et beredskapsutkast og en revisjon ([arbeidsutkast](../../project/analysis/source-review-beredskap-2026-09-09/WHITEPAPER-BEREDSKAP-ARBEIDSUTKAST.md), [revisjon](../../project/analysis/source-review-beredskap-2026-09-09/round-002/WHITEPAPER-REVISJON.md)), i tillegg til kompetanseresearchen i [R9](../../../research/beredskap-kompetanse-sammenstilling/KUNNSKAPSGRUNNLAG-SAMLET.md).
- **15. september:** Arbeidet ble delt i tre lag: kunnskapsbasen, søknaden og innsiktsproduktene. Hvitboka skal bære bredden og søknaden spissen. Ti rapportvinkler ble samlet i [innsiktskatalogen](../../project/analysis/food-tg-innsiktskatalog-2026-09-15.md) ([arbeidsavklaringen](../../meetings/GABRIEL-CLAUDE%20-%20Arbeidsavklaring%2015-09-26.md)).

## 2. Vedtak 18. september 2026

| # | Spørsmål | Vedtak |
|---|---|---|
| D1 | Hva slags hvitbok | **Én bred hvitbok med forsyningssikkerhet som rød tråd.** Den bygger på v2 og vever inn beredskapsrevisjonen fra september og kompetansefunnene fra R9. Strukturen følger Jan Thomas' logikk og ender i 3–5 satsingsområder. NordForsk-søknaden blir et eget, smalt uttrekk. |
| D2 | Hva «ferdig» betyr | **Presentasjonsklar** for partnere, NCH og eventer. Se del 3. Offentlig publisering er et eget, senere steg. |
| D3 | Tempo | Fable skriver et så ferdig utkast som mulig **18. september 2026**. Resten av løpet følger milepælene i del 5. |
| D4 | Artikler | **Parallelt, med tre piloter nå:** V9 bondeøkonomi, V6 EUDR og V10 sirkulære konkurser. Artiklene bruker det samme påstandsgrunnlaget som hvitboka. |

## 3. Hva presentasjonsklar betyr

Hvitboka er presentasjonsklar når alle punktene under er oppfylt:

1. Hver faktapåstand har en ID i påstandsregisteret, med kilde, status og forbehold.
2. Bare funn med status **Siterbar**, **Siterbar med forbehold** eller **Kontrollert internt** i innsiktskatalogen, eller [K]/[F] i v2, brukes som fakta. Forbeholdet skal stå i teksten.
3. Intern syntese og uklare funn er skrevet om til spørsmål, hypoteser eller kunnskapshull. De står uten tall.
4. Blokkerte funn står som datagap under «neste steg».
5. Ingenting fra listen over strøkne funn (innsiktskatalogen del 4) eller forbudt språk (v2 §13.2) er brukt.
6. Hvitboka har ingen personnavn fra maktkartet. Selskaper og konsern kan nevnes når funnet tillater det.
7. Tidskritiske fakta, som EUDR, gebyrsaken og Dagligvaretilsynet, er fersksjekket samme uke som hvitboka presenteres.
8. Rader med status «Kontrollert internt» som hvitboka bruker, er stikkprøvet mot primærkilde med lokator.
9. Gabriel og Jan Thomas har lest og signert versjonen med dato.

Offentlig publisering krever i tillegg portene H-01 til H-06 i v2 §15. Det gjelder særlig juridisk kontroll av maktkartet og nordiske partneres gjennomlesning.

## 4. Slik henger delene sammen

```
Kunnskapsbasen (plattform, katalog, kontrollfiler)
        │
        ▼
Påstandsregister v3 (én kontroll, nøkkel = katalog-ID)
        │
        ├──► Hvitbok v3 (bredden)
        ├──► Artikler for NCH og Natural State (én vinkel hver)
        └──► NordForsk-uttrekk (spissen, eies av forskningspartner)
```

Katalog-IDen (for eksempel MA-04 eller KO-03) er fellesnøkkelen. Når et funn er kontrollert for hvitboka, er det kontrollert for artiklene også. Katalogen selv endres ikke, og ingen status heves i den.

## 5. Prosess

| Fase | Hva | Hvem | Resultat | Forslag til tid |
|---|---|---|---|---|
| 0 | Vedtak om retning (D1–D4) | Gabriel | Dette notatet | 18.09 |
| 1 | Skrive utkast v3, påstandsregister og tre artikkelpiloter | Fable, etter [skriveplanen](../plans/2026-09-18-hvitbok-v3-skriveplan.md) | Filer i `research/whitepaper/v3/` | 18.09 |
| 2 | Kontroll av utkastet: påstander mot register, strøkne funn, forbudt språk og personnavn | Claude | Rettet utkast og kontrollrapport i PR | 18.–19.09 |
| 3 | Lesing og valg: satsingsområder, hovedfortelling, NordForsk-tema | Gabriel og Jan Thomas | Kommentarer og beslutninger | Uke 39 |
| 4 | Påstandskontroll: stikkprøver av brukte «Kontrollert internt»-rader mot primærkilde, og fersksjekk av tidskritiske fakta | Claude eller Codex, med KI-review | Oppdatert register | Uke 40 |
| 5 | Ferdigstilling: språk, figurer, layout i Natural State-malen (`brand/`), PDF, plattformside og kort presentasjon | Claude og Gabriel | Signert, presentasjonsklar hvitbok | Uke 41–42 |

Artiklene følger fase 2–4 sammen med hvitboka. De kan publiseres når påstandene deres er kontrollert, uten å vente på resten av hvitboka. V6 er tidskritisk mot EU-datoen 30.12.2026.

## 6. Artikkelsporet

**Format:** 700–1 000 ord, én innsikt per artikkel. Hver artikkel har tittel, ingress, 3–5 mellomtitler, en del om hva funnet betyr og en om hva vi ennå ikke vet. I tillegg kommer forslag til faktaboks eller figur, kildeliste, en LinkedIn-versjon på høyst 1 300 tegn og en intern kontrollboks med katalog-IDer.

**Avsender:** Natural State og NCH. Stemmen er kunnskapsformidling, ikke kampanje.

**Første tre:**

| Vinkel | Hvorfor først | Hovedkilde |
|---|---|---|
| V9 Hvor sjokket lander | Klarest status: BE-18 og BE-19 er siterbare | `research/external/r6/` |
| V6 EUDR-treffkartet | Tidskritisk mot 30.12.2026, kontrollert mot primærkilder 15.09 | `docs/project/analysis/case-avsjekk/mottak-eudr-v6-kontroll-2026-09-15.md` |
| V10 Hva som feilet | Sterk fortelling, registerdatoer kontrollert 15.09 | `research/sirkulaere-konkurser/hva-feilet-syntese-2026-09-15.md` |

**Neste kandidater** etter hvitboka: V7 Det ingen teller (kontrollert), V5 Styring slår teknologi og V1 Norden har løst utnyttelse. V4 om makt venter på juridisk kontroll. V3 om koblingsmegleren trenger mer dokumentasjon.

## 7. Hva som ikke endres nå

- v2 er fortsatt det kanoniske manuset, og `/hvitbok` viser v2 til v3 er signert. Å bytte kilde for plattformsiden er et eget steg (`scripts/generate-whitepaper-chapters.ts`).
- Innsiktskatalogen, claim-lock-tabellen og CITABLE-ACCEPTANCE-TESTS endres ikke.
- Ingen databaseskriving, ingen kontakt med eksterne og ingen publisering.
- Repoet er offentlig. Utkastene skal derfor ikke inneholde personnavn fra maktkartet eller annen persondata.

## 8. Åpne beslutninger

- NordForsk: tema 1 eller tema 2, og hvilken forskningspartner som skal eie søknaden (Gabriel og Jan Thomas).
- Hvilke 3–5 satsingsområder hvitboka skal anbefale. Utkastet foreslår, fase 3 bestemmer.
- Hovedpublikum og kanal for artiklene, og om oktober-eventet om sirkulær mat i Norden blir lanseringen.
- Språk: utkastet skrives på norsk. Om NCH trenger engelsk sammendrag og engelske artikler, avgjøres i fase 3.

## 9. Verifikasjon

- Skriveplanens egenkontroll er kjørt av Fable, og kontrollen i fase 2 er kjørt av Claude.
- `git diff --check` er ren.
- Ingen korpusregistrerte filer er endret. Utkastet ligger i nye filer.
