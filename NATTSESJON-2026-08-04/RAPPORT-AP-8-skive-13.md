# Rapport AP-8: Kildelesing og klassifisering — skive 13

**Status:** FULLFØRT  
**Agent:** codex-gpt-5  
**Tidsrom:** 2026-08-04, nattøkt  
**Lesekatalog:** `codex/nordic-knowledge-canonical-v1` / kun lesing  
**Egen utdata:** kun triagefilen og denne rapporten  

## 1. Hva som ble gjort

Jeg leste briefen, AP-8-fanouten og manifestet før kildelesingen. Manifestfilteret for `slice == 13` inneholdt 26 enheter, og alle 26 relative kildebaner fantes i lesekatalogen. Hver kilde ble åpnet og lest på filnivå; lange PDF-er er merket `read_partially` når relevante deler er lest uten at alle referanser og vedlegg er gjennomgått i full detalj.

Det er skrevet nøyaktig én provisorisk JSON-post per manifestenhet til `triage/triage-skive-13.jsonl`. Postene beskriver hva kildene eller de interne arbeidsdokumentene sier; de bekrefter ikke at alle påstander er sanne.

## 2. Tellinger og klassifisering

- Manifestenheter: **26**
- Kildebaner funnet: **26 av 26**
- JSON-poster skrevet: **26**
- Unike `identityKey`: **26**
- `readState`:
  - `read_fully`: **21**
  - `read_partially`: **5** — SIFO kundeprogrammer, Sørensen-avhandlingen, Konkurrensverket 2024:4, Menon funksjonelt skille og NKJ White Paper
  - `unreadable`: **0**
- Foreslått rolle:
  - `primary_evidence`: **10**
  - `internal_synthesis`: **11**
  - `operational_control`: **5**
- `machineRoleWasCorrect: false`: **17 av 26**
- `verdictForOwner`:
  - `prioriter`: **15**
  - `standard`: **4**
  - `lav`: **5**
  - `ut_av_omfang`: **2**
- Duplikatmistanker: **0**

Maskinrolle-feilene gjelder særlig interne R12/R13/R4/R6-synteser, locator-/snapshot-artefakter og korte sekundærkilder som ikke bør behandles som primær evidens. R13- og R12-dokumentene er beholdt som `internal_synthesis` selv når de bygger på eksterne kilder, fordi selve enheten er et internt arbeidsprodukt og ikke den verifiserte originalkilden.

## 3. Viktigste funn for eier

1. **Norsk makt og regulering:** Menon-utredningen og Konkurrensverkets svenske rapport gir de sterkeste ferske sporene for vertikal makt, EMV, grossisttilgang, konsentrasjon, etablering og lokal tilgjengelighet. Menon er en oppdragsutredning om mulige reguleringsgrep, mens Konkurrensverket selv begrenser flere slutninger til indikasjoner og ikke full kausalitet.
2. **Offentlig innkjøp:** Sørensen-avhandlingen gir et eldre, men detaljert dansk benchmark for økologisk omstilling i offentlige kjøkken. R12-DIST-002 og R4-analysen er interne kandidater for videre kontroll av regionale kontrakter og nordiske sammenligninger; begge må holdes adskilt fra dokumentert nasjonalt volum eller markedsandel.
3. **Protein-, jord- og biodiversitetsgap:** R12-FEED-004, R13-GAP-004 og R13-PROT-002 tydeliggjør skillet mellom varekode, planlagt kapasitet, matproduksjon og realisert fôrvolum. R13-OKO-003 og R13-OKO-004 gjør samtidig måle- og baselinebegrensninger for jordkarbon og biodiversitet synlige. Disse er verdifulle prioriteringskart, men interne synteser og ikke ferdig promotérbar evidens.

## 4. Kilde- og gapforbehold

- Regjeringsposten om norsk beredskap, KRAVs effektrapport, KRAVs Ekobarometer, DUG Foodtech-årsrapporten og NHH-posten er locator-/snapshot-enheter uten tilgjengelig underliggende fulltekst. De er derfor klassifisert som `operational_control` og ikke som primær evidens.
- Green Queen og IntraFish er mediekilder med begrenset metode- og kildelistedekning. De kan brukes som verifikasjonslead for alternativ-protein-konsolidering, ikke som komplett konkurs- eller årsaksanalyse.
- NKJ White Paper har omfattende lokalt tekstuttrekk, men fila sier selv at den er en snapshot og ikke fersk kildeverifikasjon. Den er merket delvis lest og bør kontrolleres mot canonical PDF før presise sitater eller tall brukes.
- Alle tall, prosentandeler, rangeringer og aktørpåstander i triagepostene er beholdt som påstander kilden oppgir. `claimsWorthVerifying` peker på hva som bør etterprøves mot original- eller kontrakilder.

## 5. Validering og scope

Valideringen ga **26 gyldige JSONL-poster**. Alle poster har `schemaVersion`, `provisional`, `producedBy`, `slice`, `readBy`, `pageCount`, `wordCount`, `proposedRoleConfidence`, `summary`, `datagapNotes`, `qualityFlags`, `duplicateSuspicion` og `verdictReason`. Alle `qualityDimensions` bruker kun `sterk`, `middels`, `svak` eller `ikke_relevant`, og alle `datagapFields` bruker briefens eksakte slugs.

Alle poster har `provisional: true` og `producedBy: "nattsesjon-2026-08-04"`. Det ble ikke skrevet til `knowledge/corpus/`, register, køer eller `research/evidence-pack/`, og ingen identiteter ble flettet. Det ble ikke gjort database-, merge- eller deploy-operasjoner.

## 6. Hva som gjenstår

- Etterprøv de 15 `prioriter`-postene mot kanoniske originalkilder før de brukes videre i AP-9 eller annen syntese.
- Hent fulltekst for de fem locator-/snapshot-enhetene før de eventuelt flyttes ut av operativ kontroll.
- Verifiser interne R12/R13/R4/R6-arbeidsprodukter mot rådata, tildelingsdokumenter, selskapskilder og måleprogrammer før påstander promoteres.
