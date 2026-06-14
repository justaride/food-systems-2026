# Pilot: brreg MCP vs. importert NorgesGruppen-tre

> Validering av Brønnøysund-koblingens dekning mot eksisterende `import-norgesgruppen-tree.ts`.
> Dato: 2026-06-14 · Metode: live-kall mot Enhetsregisterets åpne API (samme datakilde som brreg-MCP-en, ingen API-nøkkel).

## Konklusjon først

Brønnøysund-koblingen **validerer** de importerte enhetene sterkt (orgNr, næringskode, adresse, stiftelsesår og styremedlemmer stemmer — Kiwi-styret matchet 5/5 eksakt), og **fyller flere hull** importen ikke har (daglig leder, fullstendig dagsaktuelt styre med ansatt­representanter, revisor/regnskapsfører, endrings­tidsstempler). Men den **kan ikke** levere to ting importen er avhengig av: **regnskapstall** og **eierandeler/konsern-tre** (`CompanyOwnership`). De krever andre kilder.

Netto: brreg-MCP er en sterk **validerings- og berikelseskilde** for `Company`, `BoardMember` og `PersonProfile`, og en **ferskhetsdetektor** via `sistEndret`. Den erstatter ikke regnskaps- eller eierskaps­innhentingen.

---

## Hva som ble testet

- **Parent:** NORGESGRUPPEN ASA — `819731322`
- **Datterselskap:** KIWI NORGE AS — `975959171`
- Endepunkter: `/enheter/{orgNr}`, `/enheter/{orgNr}/roller`, `/underenheter?overordnetEnhet={orgNr}`
- Importgrunnlag: `scripts/import-norgesgruppen-tree.ts` — 21 selskaper, 74 styre­oppføringer, parent `NG_ORG = 819731322`.

---

## 1. Validering — brreg bekrefter importen

### NorgesGruppen ASA (819731322)

| Felt | Importert | brreg (Enhetsregisteret) | Match |
|---|---|---|---|
| Navn | NorgesGruppen (parent) | NORGESGRUPPEN ASA | ✓ |
| Org.form | — | ASA (Allmennaksjeselskap) | ✓ |
| Næringskode | — | 47.110 Detaljhandel bredt vareutvalg | ✓ |
| Stiftet | — | 1963-10-16 | + |
| Ansatte | — | 150 | + |
| Aksjekapital | — | 400 000 000 NOK / 40 mill. aksjer | + |
| I konsern | (antatt) | `erIKonsern: true` | ✓ |
| Siste årsregnskap | revenue2024 brukt | `sisteInnsendteAarsregnskap: 2024` | ✓ |
| Adresse | — | Karenslyst allé 12, 0278 Oslo | + |

### Kiwi Norge AS (975959171)

| Felt | Importert | brreg | Match |
|---|---|---|---|
| Næringskode | 82.990 | 82.990 Annen forretningsmessig tj.yting | ✓ |
| Forretningsadresse | Ringeriksveien 4B, Lierstranda | Ringeriksveien 4B, 3414 Lierstranda | ✓ |
| Stiftet | 1995 | 1995-11-20 | ✓ |
| I konsern | family | `erIKonsern: true` | ✓ |
| **Styre** | 5 medlemmer | 5 medlemmer | **5/5 eksakt** |

Styre-match Kiwi: Runar Hollevik (leder), Øyvind Andersen, Silje Elisabeth Hals, Nina Brendsrud-Andersen, Truls Fjeldstad — alle bekreftet, inkl. rolle (leder vs. medlem).

**Tolkning:** De importerte enhetene er korrekt identifisert. brreg kan kjøres som en automatisk `db:audit`-lignende validering: slå opp hver `orgNr`, sammenlign navn/NACE/adresse/styre, flagg avvik.

---

## 2. Berikelse — hull brreg fyller

| Datatype | Status i import | Hva brreg gir | Mater modell |
|---|---|---|---|
| **Daglig leder (CEO)** | Mangler | Kiwi: Vegard Kjuus (f. 1972); NG ASA: Runar Hollevik | `BoardMember`/`PersonProfile` (role: daglig-leder) |
| **Fullt, dagsaktuelt styre** | Delvis/utdatert for ASA | NG ASA: 10 medlemmer inkl. 2 ansatt­representanter (Cecilie Blindern Myhre, Mats Gunnar Torsvik Knudsen) | `BoardMember` |
| **Fødselsdato per person** | Mangler | Alle roller har `fodselsdato` | Styrker `personKey`-disambiguering + interlock-deteksjon |
| **Revisor** | Mangler | Ernst & Young AS (976389387) | `BusinessRelationship` (revisor) |
| **Regnskapsfører** | Mangler | NG Regnskap AS (883743512); Kiwi også Cedra Norge AS | `BusinessRelationship` (regnskap) |
| **Endrings­tidsstempel** | Mangler | `sistEndret` på styre (NG 2026-02-17, Kiwi 2026-02-10) | **Ferskhetssignal** — vet når et styre sist endret seg |
| Aksjekapital, sektorkode, MVA-status | Mangler | Strukturert i `/enheter` | `Company`-metadata |

**Datakvalitet-funn:** Importens NG ASA-styre ser ut til å blande inn CEO og være eldre enn brregs nåværende 10-personers styre. brregs `sistEndret` + rolleliste lar dere oppdage og rette dette automatisk. Merk også stavemåte: import `Oyvind Andersen` vs. brreg `Øyvind Andersen` — `normalizePersonKey()` stripper diakritiske tegn, så nøkkelen matcher, men visningsnavn bør hentes fra brreg.

---

## 3. Grenser — hva brreg IKKE kan gi

| Manglende | Hvorfor | Riktig kilde |
|---|---|---|
| **Regnskapstall** (revenue 1739, driftsresultat 104, eiendeler 2330 MNOK) | Enhetsregisteret har *ikke* finansielle tall | Regnskapsregisteret-API (midlertidig FoU, nøkkeltall fra 2018) eller årsrapport |
| **Eierandeler / konsern-tre** (`CompanyOwnership` parent→child, %) | `/underenheter` returnerte **kun 1 underenhet** — NG ASAs egen driftsbedrift (BEDR), *ikke* datterselskapene Kiwi/MENY osv. Datterselskap er egne `enheter` uten eier­lenke i åpent API | **Aksjonærregisteret** (Skatteetaten, årlig nedlastbar) eller årsrapport |
| **Analytiske felt** (`ownershipType: family`, `valueChainStage: retail`) | Egen klassifisering, ikke registerdata | Prosjektets egen kuratering |

Dette er det viktigste forbeholdet: **`underenheter` ≠ datterselskaper.** Eierstrukturen mellom juridiske enheter må fortsatt bygges fra Aksjonærregisteret eller årsrapporter. brreg bekrefter at en enhet *er* i konsern (`erIKonsern: true`), men ikke hvem som eier hvor mye.

---

## 4. Verdivurdering av koblingen

**Sterkt ja for:**
- Automatisk validering av alle `orgNr` i basen (navn, NACE, adresse, status, konkurs-flagg).
- Berikelse av `BoardMember`/`PersonProfile` med dagsaktuelle styrer, CEO-er og fødselsdatoer — direkte løft for interlocking-director-analysen.
- `BusinessRelationship`-kandidater (revisor, regnskapsfører) gratis.
- Ferskhets­overvåking via `sistEndret` — et planlagt brreg-sjekk kan flagge styreendringer i hele konsern-universet.

**Må suppleres med:**
- Regnskapsregisteret/årsrapport for `CompanyFinancial`.
- Aksjonærregisteret for `CompanyOwnership`-prosenter.

**Anbefaling:** Ta i bruk brreg-MCP (eller et lite eget importskript mot samme åpne API) som **validerings- og berikelseslag**, kjørt idempotent (upsert) i tråd med `data-imports.md`. Behold dagens kilder for tall og eierandeler. Et naturlig neste steg er et `validate-against-brreg.ts`-skript som går gjennom alle `Company.orgNr`, henter `/enheter` + `/roller`, og skriver en avviksrapport (à la `COMPANY-EXTRACTION-AUDIT.md`).

---

### Kilder

- [Enhetsregisteret API-dokumentasjon](https://data.brreg.no/enhetsregisteret/api/dokumentasjon/en/index.html)
- [Brønnøysund — Datasets and API](https://www.brreg.no/en/use-of-data-from-the-bronnoysund-register-centre/datasets-and-api/)
- Live-kall 2026-06-14: `/enheter/819731322`, `/enheter/819731322/roller`, `/enheter/975959171`, `/enheter/975959171/roller`, `/underenheter?overordnetEnhet=819731322`
