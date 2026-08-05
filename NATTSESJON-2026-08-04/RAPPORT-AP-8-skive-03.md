# Rapport AP-8: Skive 03 — kildelesing og klassifisering

**Status:** FULLFØRT  
**Agent:** Codex GPT-5  
**Tidsrom:** 2026-08-04 nattøkt – 03:52 CEST  
**Gren / worktree:** kun lesing for kildene  
**Commits laget:** ingen

## 1. Hva som ble gjort

Briefen, stoppreglene, regelen om trygg fart, Vedlegg A og AP-8-skjemaet ble lest før triage. Manifestet ble filtrert på `slice == 03`, og alle 25 enhetene ble åpnet i den angitte lesekatalogen. PDF-er ble lest med metadata, tekstuttrekk og relevante deler; tekstfiler ble lest som innhold, ikke klassifisert fra filnavn alene.

Det ble skrevet én post per manifestenhet til skivefilen. Delvise uttrekk, locator-filer og capture-/proveniensproblemer er markert i `readState`, `readNotes`, `qualityFlags` og `uncertainty`. Ingen identiteter ble slått sammen, og kildeutsagn er ført som verifikasjonspunkter, ikke som bekreftede sannheter.

## 2. Kommandoer og resultat

- Leserutdrag med `sed` og `rg` for brief, AP-8-skjema og manifestkontroll: gjennomført.
- Manifestkontroll med Python: 25 enheter med `slice == 03`.
- PDF-lesing med `pdfinfo` og `pdftotext`, supplert med målrettede seksjoner i de store dokumentene: gjennomført.
- Tekstkilder åpnet og lest direkte: gjennomført.
- Ingen database-, miljøvariabel- eller hemmelighetslesing ble brukt.

## 3. Verifikasjon

| Kontroll | Resultat |
|---|---:|
| Enheter i manifestet | 25 |
| Triage-poster skrevet | 25 |
| Gyldige JSONL-linjer | 25 |
| `read_fully` | 20 |
| `read_partially` | 5 |
| `unreadable` | 0 |
| `verdictForOwner: prioriter` | 11 |
| `verdictForOwner: standard` | 6 |
| `verdictForOwner: lav` | 6 |
| `verdictForOwner: ut_av_omfang` | 2 |
| `machineRoleWasCorrect: false` | 13 |

Alle 25 identitetsnøkler, kø-ID-er og relative kildebaner samsvarer med manifestet. Alle 25 manifestfiler fantes, og manifestert `sizeBytes` samsvarte med faktisk filstørrelse ved kontroll. Hver post har alle obligatoriske skjema-felt, `provisional: true` og `producedBy: "nattsesjon-2026-08-04"`.

De tre mest verdifulle funnene i skiven er:

1. `document:cmqgiod5900mo4nvm196zby1n` — Landbruksdirektoratets rapport om økologiske jordbruksvarer gir et ferskt, bredt 2025-baselinegrunnlag, men den lokale kopien må fortsatt behandles som en foreløpig kildepakke.
2. `document:cmqu1y7b000taktvm57pa9dad` — R13-ledgeren for industrielle næringssidestømmer gjør eldre tall, ukjente fraksjoner og manglende volum-/aktørdata eksplisitte, og peker dermed på et konkret materialstrømgap.
3. `document:cmql058rq00pt76vmormmz3q9` — R2-notatet skiller mellom fôr-, total- og oppløste næringsmålinger og viser at offentlig evidens ikke gir et komplett årlig nordisk N-P-K-regnskap eller sikker dokumentasjon på kommersiell kommunal svartvannshydroponi.

Duplikatmistanke gjelder kun to separate enheter: `document:cmqfqrtyi00pi2hvmg8s0p44w` og `document:cmqfqrtyn00pj2hvmtshuukdq`. De gjelder henholdsvis et hovednotat og en lenkeoversikt i samme Brazil/Natural State/Nordic Circular Hotspot/kaffe-spor. Begge identitetene er beholdt separat.

Ingen kommandoer skrev til `knowledge/corpus/`, registeret, køene eller `research/evidence-pack/`. Det ble heller ikke skrevet til andre filer enn skivefilen og denne rapporten.

## 4. Hva som gjenstår

- Hent originalene bak de fem delvise enhetene: Organic Denmark-markedsrapporten, KRAVs Ekobarometer, Matsmart-resultatene, Arla FarmAhead-kilden og WUR-rapporten om agri-residues.
- Hent den faktiske København-matstrategien. Den lokale enheten er lest i sin helhet, men innholdet er en generell kommuneside og ikke selve strategien.
- Etterprøv tall og årsakspåstander i `claimsWorthVerifying` mot primærkilder før eventuell eierbekreftelse eller promotering.
- La AP-9 vurdere prioritering mot øvrige skiver; triagepostene er ikke en kildeanalyse eller registeroppdatering.

## 5. Beslutninger Gabriel må ta

1. **Skal de fem delvise kildene re-hentes?** Anbefaling: ja. Uten originaltekst bør de brukes som navigasjon eller lavere tillitsnivå, ikke som ferdig evidens.
2. **Skal den feilfangede København-enheten beholdes i triage?** Anbefaling: behold identiteten, men bestill originalstrategien separat. Å erstatte lokalfilen ville bryte sporbarheten.
3. **Skal de to Brazil/kaffe-enhetene slås sammen?** Anbefaling: nei. Behold separate identiteter og la en senere eierprosess avgjøre eventuell relasjon eller kildehierarki.
4. **Hvilke spor bør prioriteres videre?** Anbefaling: start med den ferske økologirapporten, materialstrømledgeren og nutrient-loop-notatet, og trianguler deretter de akademiske kildene om innkjøp, mattrygghet og dagligvarebarrierer.

## 6. Risiko og forbehold

`read_fully` betyr at den lokale filen er lest; det betyr ikke at lokalfilen nødvendigvis er originalen eller at alle kildeutsagn er verifisert. Fem enheter er eksplisitt delvise, og flere interne notater inneholder hypoteser, sekundærreferanser eller eldre tallgrunnlag. Tall og årsaksforklaringer må derfor gjennom en senere kilde- og eierkontroll.

Tretten av 25 maskinroller ble korrigert etter faktisk lesing. Det er et systemfunn for AP-9: filnavn- og plasseringheuristikken er ikke tilstrekkelig som rollebevis, særlig for interne ledgers, strategifangster og kilde-/lenkeoversikter. Alle resultater i denne rapporten og skivefilen er foreløpige.
