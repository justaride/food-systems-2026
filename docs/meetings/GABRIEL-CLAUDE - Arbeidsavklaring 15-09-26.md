# Gabriel + Claude — Arbeidsavklaring 15. september 2026

**Dato:** 15. september 2026
**Deltakere:** Gabriel Freeman, Claude (KI-assistent i Claude Code)
**Format:** Skriftlig arbeidsøkt
**Type:** Arbeidsavklaring. Ikke formelt Food TG-vedtak og ikke ekstern validering.

> Bearbeidet logg, ikke ordrett gjengivelse. Vurderinger fra Claude er merket som vurderinger. Alle funn som nevnes, er interne til de har gått gjennom claim-lock og kildepolicy.

## 1. Kompetanse og beredskap: R9 og merging

- Økten fulgte [HANDOVER-R9.md](../project/analysis/beredskap-kompetanse-2026-09-14/HANDOVER-R9.md). Sammenstillingen (R9) ble laget på de kontrollerte funnene fra runde 1 og runde 2: [KUNNSKAPSGRUNNLAG-SAMLET.md](../../research/beredskap-kompetanse-sammenstilling/KUNNSKAPSGRUNNLAG-SAMLET.md).
- Grunnlaget er 707 kontrollerte påstander: 532 behold, 169 rett, 1 forkast, 3 ikke verifisert og 2 som bare viser til prosjektets egne filer. De 52 hovedinnsiktene fra rundene er samlet i 14 innsikter på tvers. Åtte nye tilfeller av motstrid eller uklarhet ble avgjort i kontrollfilene, uten ny nettresearch.
- Gabriel ba om merge i rekkefølge. PR #424, #426 og #427 ble merget til `main` etter sjekk av grønn CI og `base=main`.

**Hovedmønstre i R9:**
1. Kompetanse er dokumentert som mekanisme og krav, nesten aldri som effekt.
2. Myndighetene beskriver kritiske funksjoner, ikke kritiske personer eller terskler for bemanning.
3. Mange hull ligger i hvordan statistikken teller: varer, virksomheter og tjenestemottakere, ikke funksjoner i en krise.
4. Revisjoner i fire land peker på svak strategisk samordning, mens operativ respons fungerer bedre.
5. Krav om kompetanse retter seg mot virksomheten, ikke mot personen.

**Sikrest:** regelverk, revisjoner, offisiell statistikk og de svenske tallene for måltidsberedskap. **Svakest:** læring fra øvelser (arrangørens egne rapporter), dokumentert tap av kunnskap (få informanter) og bransjeundersøkelser (selvrapportert).

**Hull som betyr mest:** effekt av kompetanse og øvelser, terskler og erstattbarhet i kritiske roller, hvem som er avhengige av kommunens mat, transport og manuell drift uten IT, og kapasitet i nettverk av entreprenører og vaktordninger.

## 2. NordForsk: tema 1 eller tema 2

- **Bakgrunn:** Utlysningen «Nordic and Baltic solutions on food security» har frist 2. desember 2026. Tema 1 er transnasjonal eller regional beredskap og kriserespons. Tema 2 er resiliens og avhengigheter i kritisk infrastruktur. NordForsk sier at det ikke er noen fordel å dekke flere tema, og prosjekteier må være en forskningsutførende organisasjon.
- [Gap-studien 2. september](../project/analysis/matsikkerhet-beredskap-plattform-gap-studie-2026-09-02.md) anbefalte tema 2 som hovedretning og tema 1 som sekundærretning. Grok anbefalte tema 1. Kontrollen i [GROK-VURDERING.md](../../research/beredskap-kompetanse-2026-09-15/GROK-VURDERING.md) vurderte Groks temavalg som en mening, ikke et funn.
- Gabriel spurte om gap-studien da veier tyngre. **Claudes vurdering:** ja, framfor Grok. Den bygger på formålet (avhengigheter i matsystemet, med sirkularitet som mulig mekanisme) og på det plattformen er sterkest på. To forbehold: studien ba selv om å teste tema 2 mot tema 1, og den ble skrevet før kompetanseresearchen.
- Gabriel spurte hva som er logisk. **Claudes vurdering:** tema 2 som hovedlogikk, med kompetanse som den menneskelige siden av infrastrukturen og scenarioer og samordning som metode, ikke som eget tema. Det som kan endre valget, er hvilken forskningspartner som skal eie søknaden.
- Utkast til hovedlogikk i én setning: *Hvilke kritiske funksjoner i nordisk matforsyning – transport, lager, energi og IT – står og faller på få noder og få mennesker, og hvordan kan sirkulære løsninger og nordisk samarbeid gjøre dem mindre sårbare?*
- **Status:** Ikke besluttet. Valget ligger hos Gabriel og Jan Thomas.

## 3. Bekymring: at prosjektets arbeid forsvinner

- **Gabriel:** Beredskap er et viktig fokus, og det er der arbeidet ligger nå. Samtidig er det en risiko for at det øvrige arbeidet i prosjektet blir borte i den retningen. Ønsker rapporter med innfallsvinkler som får mest mulig ut av innsikten, blant annet perspektiver som er interessante for arbeidet i Nordic Circular Hotspot (NCH).
- **Drøftet:** Arbeidet kan deles i tre lag. Kunnskapsbasen (plattformen og de kontrollerte kunnskapsgrunnlagene) eies av Natural State/NCH og mater alt annet. Søknaden er et smalt utsnitt som eies av forskningspartneren. Innsiktsproduktene er rapporter og notater med egne vinkler for nettverk, eventer og partnere. Hvitboka kan bære bredden, mens søknaden bærer spissen.
- **Drøftet:** Mye av det tidligere arbeidet er allerede grunnmur for beredskapssporet: maktkartet (få konserner og samvirker på tvers av ledd), proteinimporten («soyafri er ikke importfri»), låsesløyfene i systemmodellen og objektivfunksjonen fra juni, som satte resiliens som hovedmål og sirkularitet som delmål.

## 4. Mulige rapportvinkler (forslag, ikke valgt)

| Vinkel | Kjernen | Interessant for |
|---|---|---|
| Norden har løst utnyttelse, ikke verdi | Restråstoff brukes, men mest til lavverdi. Norge, Island og Skottland sammenlignet | NCH-medlemmer i sjømat og sidestrømmer |
| Soyafri er ikke importfri | Proteinimporten flytter seg i stedet for å forsvinne | Fôraktører, beredskapsmyndigheter |
| Koblingsmegleren som mangler | Sirkulære løsninger strander på koblingen, ikke teknologien | NCH spesielt |
| Hvor makten i matsystemet ligger | Vertikal integrasjon gjennom samvirke og familieeie | Politikk, forskning, media (sensitivt) |
| Styring slår teknologi | Styrevedtak og kontroll endret fôret (Valio) | Partnere som vil se handlingsrom |
| EUDR-treffkartet | Hvor avskogingsregelverket treffer nordiske verdikjeder | Importører; tidskritisk mot 30.12.2026 |
| Det ingen teller | Kompetanse i beredskap er krav og mekanisme, ikke målt effekt | Myndigheter, beredskapsmiljøer |
| Institusjonskjøkken som bro | Der sirkularitet, kompetanse og beredskap møtes | Kommuner, kobling til Cities |
| Hvor sjokket lander | Kostnads- og prisskvisen i bondeøkonomien | Landbruk og distrikt |

## 5. Avklaringer i økten

| Hva | Status |
|---|---|
| Merge av #424, #426 og #427 | Gjort 15.09.2026 etter Gabriels ja |
| NordForsk hovedtema | Åpen. Beslutning for Gabriel og Jan Thomas |
| Innsiktskatalog som første steg | Avtalt og laget samme dag: [food-tg-innsiktskatalog-2026-09-15.md](../project/analysis/food-tg-innsiktskatalog-2026-09-15.md) |
| Hvilke rapportvinkler og hvor mange produkter | Åpen |

## 6. Åpne spørsmål

- Hvem er hovedpublikum for rapportene: NCH-medlemmer, myndigheter, forskningspartnere eller LinkedIn og media?
- Er oktober-eventet «sirkulær mat i Norden» fortsatt aktuelt som lansering?
- Skal rapportene være offentlige eller bare for partnere? Det avgjør hvor mye kontroll som trengs.
- Hvor mange produkter er det kapasitet til fram til 2. desember 2026?
- Hvilken forskningspartner skal eie en NordForsk-søknad?

## 7. Grunnlag i repoet

- [KUNNSKAPSGRUNNLAG-SAMLET.md](../../research/beredskap-kompetanse-sammenstilling/KUNNSKAPSGRUNNLAG-SAMLET.md)
- [Gap-studien 2. september](../project/analysis/matsikkerhet-beredskap-plattform-gap-studie-2026-09-02.md) og [samtaleanalysen 2. september](../project/analysis/food-systems-samtaleanalyse-jan-thomas-2026-09-02.md)
- [STATUS-OG-FOKUS.md](../project/analysis/beredskap-kompetanse-2026-09-14/STATUS-OG-FOKUS.md)
- [Innsiktssyntesen 12. juni](../project/analysis/food-tg-innsiktssyntese-2026-06-12.md), [maktkart-syntesen](../project/analysis/food-tg-maktkart-syntese-2026-06-14.md) og [systemmodellen](../project/analysis/food-tg-systemmodell-integrert-2026-06-18.md)
- [Vedtaket om objektivfunksjon](../project/analysis/food-tg-objektivfunksjon-VEDTAK-2026-06-18.md)
