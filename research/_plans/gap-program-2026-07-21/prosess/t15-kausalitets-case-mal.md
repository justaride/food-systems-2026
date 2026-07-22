# T15 — kausalitets-case med evidensgradering

**Dato:** 2026-07-21
**Status:** H2-metodeutkast. Ingen case er fylt ut, reviewet eller claim-locket.
**Gap:** T15 — case-klasse som skiller mekanismehypotese, observert forløp og kausal slutning.
**Formål:** gjøre caseanalyse repeterbar uten å oppgradere samtidighet, sekvens eller plausibilitet til dokumentert årsak.

## 1. Ufravikelige stoppregler

1. En mekanismehypotese er ikke en kausal konklusjon.
2. «Etter», «samtidig med» og «i samme marked» dokumenterer ikke alene at A forårsaket B.
3. Alle eksterne faktapåstander skal følge `.claude/source-attribution-policy.md`: navngitt kildeklasse, `citationText`, `accessedAt`, lokator, `verificationStatus` og relevant `fieldPath`.
4. Prosjektets egen syntese kan binde sammen underlagskilder, men kan ikke erstatte manglende primærbevis.
5. Alternative forklaringer skal registreres før evidensnivå fastsettes.
6. Ingen case får eksternt brukbart språk før navngitt menneskereviewer har godkjent kildene, graderingen og den eksakte formuleringen.
7. Uavklart evidens skal stå som kontrollert usikkerhet; tomme felt skal ikke fylles med antakelser.

## 2. Evidensnivåer og tillatt språk

Nivået settes etter det svakeste nødvendige leddet i påstanden, ikke etter antall kilder.

| Nivå | Minimum | Tillatt formulering | Ikke tillatt |
|---|---|---|---|
| **E0 · ubelagt** | Hypotese eller intern observasjon uten tilstrekkelig lokator/verifikasjon | «Vi undersøker om …» | «viser», «førte til», «skyldes» |
| **E1 · plausibel mekanisme** | Dokumentert mekanisme eller faglig begrunnelse, men ingen case-spesifikk tids-/utfallsbinding | «En mulig mekanisme er …» | «mekanismen forklarer utfallet» |
| **E2 · dokumentert sekvens** | Kilder dokumenterer eksponering/hendelse før utfall, med tydelig avgrensning | «Utfallet fulgte etter …» / «er konsistent med …» | «forårsaket», «effekten av» |
| **E3 · triangulert bidrag** | Case-spesifikk sekvens + mekanisme + minst én uavhengig kilde eller datakjede + aktiv vurdering av sentrale alternative forklaringer | «Evidensen støtter at X kan ha bidratt til Y innenfor denne casen» | «X var den eneste årsaken» |
| **E4 · sterk kausal evidens** | Egnet kontroll-/sammenligningsdesign eller robust naturlig/quasi-eksperiment, prespesifisert utfall, sensitivitetsanalyse og navngitt metode-/fagreview | «Analysen gir sterk støtte for en kausal effekt innenfor den definerte populasjonen og perioden» | Generalisering utenfor designets systemgrense |

**Standard:** En case starter på E0. Den flyttes opp bare når alle minimumskrav for neste nivå er dokumentert. Flere medieoppslag om samme primærhendelse teller ikke som uavhengig triangulering.

## 3. Casekort — fylles ut per case

### A. Identitet og avgrensning

| Felt | Utfylling |
|---|---|
| Case-ID | `T15-CASE-___` |
| Arbeidstittel | |
| Eier | |
| Reviewer | |
| Reviewdato | `YYYY-MM-DD` |
| Geografi/populasjon | |
| Tidsperiode | |
| Verdikjedeledd | |
| Beslutning eller rapportdel casen skal informere | |
| Eksplisitt utenfor scope | |

### B. Påstanden som skal testes

- **Presis hypotese:**
- **Eksponering/hendelse X:**
- **Utfall Y:**
- **Forventet mekanisme X → Y:**
- **Forventet tidsrekkefølge/lag:**
- **Sammenligning eller kontrafaktisk spørsmål:** Hva ville vi forventet uten X?
- **Falsifiseringssignal:** Hvilket funn ville svekke eller avkrefte hypotesen?

### C. Alternative forklaringer

| Alternativ forklaring | Hvorfor plausibel | Evidens for/mot | Håndtering i analysen | Restusikkerhet |
|---|---|---|---|---|
| A1 | | | | |
| A2 | | | | |
| A3 | | | | |

Minimum: vurder felles trend/tid, seleksjon, måleendring, regulatorisk endring, pris-/kostnadssjokk og andre samtidige hendelser når de er relevante.

## 4. Evidensregister

Én rad per kilde–påstand-kobling. Samme kilde kan ha flere rader dersom den dokumenterer ulike felt.

| Evidens-ID | Påstand/felt | Kildeklasse | Tittel/avsender | Publisert | `accessedAt` | URL/lokal lokator | `fieldPath`/side/tabell | `verificationStatus` | Uavhengig av hovedkilden? | Begrensning |
|---|---|---|---|---|---|---|---|---|---|---|
| EV-01 | | | | | | | | `unverified` | | |
| EV-02 | | | | | | | | `unverified` | | |

For sentrale nettsidekilder uten stabil PDF/DOI skal Wayback- eller lokal arkivkopi vurderes etter kildepolicyen. Kilden klassifiseres etter hva den faktisk dokumenterer; selskapets egen pressemelding er ikke uavhengig bekreftelse av selskapets forklaring.

## 5. Appraisal og metodekontroll

| Kontroll | Vurdering |
|---|---|
| Fulltekst lest, ikke bare sammendrag? | |
| Studiedesign/dataproduksjon | |
| Måledefinisjon for X | |
| Måledefinisjon for Y | |
| Datadekning og mangler | |
| Tidsrekkefølge dokumentert? | |
| Sammenligningsgrunnlag/kontrafaktisk design | |
| Risk of bias | |
| Interessekonflikt/kildeavhengighet | |
| Overførbarhet til norsk/nordisk kontekst | |
| Sensitivitets-/robusthetskontroll | |
| Kildehash eller versjonsbinding der relevant | |

En appraisal fyller vurderingslaget; den oppgraderer ikke automatisk citation readiness eller evidensnivå.

## 6. Graderingsbeslutning

- **Foreslått nivå:** E0 / E1 / E2 / E3 / E4
- **Hvorfor nivået er oppfylt:**
- **Hvorfor neste nivå ikke er oppfylt:**
- **Sentrale restusikkerheter:**
- **Tillatt intern formulering:**
- **Foreslått ekstern formulering:**
- **Eksplisitt forbudt overclaim:**
- **Reviewerbeslutning:** godkjent / returnert / avvist
- **Reviewer og dato:**

## 7. Kontrollert arbeidsflyt

```text
Case-intake
  → presis hypotese og systemgrense
  → kilder med lokator og accessedAt
  → evidensregister og fulltekst-appraisal
  → alternative forklaringer og falsifiseringssignal
  → foreløpig evidensnivå
  → navngitt menneskereview
  → claim-lock / gate:overclaim ved ekstern bruk
  → eventuell import eller publisering med proveniens
```

Ingen agent eller batchjobb skal hoppe direkte fra case-intake til et låst kausalitetsutsagn.

## 8. Ferdigkriterier per case

En case kan markeres **metodisk ferdig vurdert** først når:

- [ ] case-ID, eier, systemgrense og tidsperiode er fylt ut
- [ ] X, Y, mekanisme, kontrafaktisk spørsmål og falsifiseringssignal er eksplisitte
- [ ] alle sentrale faktapåstander har kildeklasse, lokator, tilgangsdato og felt-/sidelokator
- [ ] primærbevis og prosjektets syntese er holdt atskilt
- [ ] minst tre relevante alternative forklaringer er vurdert, eller fravær er begrunnet
- [ ] fulltekst-appraisal og risk-of-bias-vurdering er dokumentert
- [ ] evidensnivå og tillatt språk er begrunnet
- [ ] navngitt menneskereviewer og reviewdato er registrert
- [ ] relevante citation-/overclaim-gater er grønne før ekstern bruk

Selv når alle punktene er oppfylt, betyr «metodisk ferdig vurdert» ikke at hypotesen er bekreftet. Resultatet kan legitimt være E0, E1 eller avvist.

---

*Internt H2-metodeartefakt. Malen inneholder ingen ferdige casefunn og etablerer ingen kausal påstand.*
