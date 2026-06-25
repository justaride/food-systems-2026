---
tittel: R13-GAP-003 - Transport og lager-sårbarhet
status: Batch 02 research-output - ikke claim
id: R13-GAP-003
priority: P2
theme: gap-closure
geo: Nordic
gate: source-shortlist
accessedAt: 2026-06-25
sourceClass: A for qualitative nodes, C for capacity/open stock data
---

# R13-GAP-003 - Transport og lager-sårbarhet

## Kort dom

R13 fullfører R12-RES-005 som en matrelevant risikoinventar, ikke som tallfestet kapasitetsmodell. De sterkeste åpne kildene peker på konkrete matnoder og avhengigheter: internasjonal handel via havner, soya til kraftfôr via Fredrikstad, drivstoff/strøm/arbeidskraft for distribusjon, sentraliserte lager og kjøle-/frysekjede. Åpne tall for dagsdekning, kjølelagerkapasitet, sentrallagerbeholdning og alternative ruter er fortsatt C/actor-gate.

## Sterkeste kilde

Oslo Economics OE-rapport 60-2023 for Nærings- og fiskeridepartementet, `En gjennomgang av sårbarheten i globale forsyningskjeder for matvarer`, særlig kapittel 15 om logistikk og lagring. Supplert av FFI rapport 26/010, Riksrevisjonen Dokument 3:4 (2023-2024), DSB scenarioarbeid, Livsmedelsverket/Jordbruksverket i Sverige og Huoltovarmuuskeskus/NESA i Finland.

## Svakeste punkt

De fleste funnene er kvalitative struktur-/sårbarhetsfunn. Tallfestet nodekapasitet, dagsdekning, kjølekjedetonnasje, lagerbeholdning og beredskapsvolum er enten ikke publisert, forretningssensitivt eller beredskapssensitivt.

## Risikotabell

| Node | Land | Sårbarhetstype | Kilde | År | Kildeklasse | Caveat |
|---|---|---|---|---:|---|---|
| Rotterdam/utenlandsk havn som importknutepunkt | NO/EU | Havnekonsentrasjon og internasjonal handel | OE 60-2023 | 2023 | A for kvalitativt funn | Andel/tonn ikke tallfestet i åpen kilde. |
| Fredrikstad soya til kraftfôr | NO | Enkeltpunkt for fôrproteinimport | OE 60-2023 + R13-GAP-001 SSB-soya | 2023/2025 | A for node/SSB import | OE-node er kvalitativ; SSB sier import, ikke logistikkapasitet. |
| Drivstoffberedskap for matdistribusjon | NO | Tverrsektoravhengighet | OE 60-2023 | 2023 | A | Råd/struktur, ikke målt robusthet. |
| Strøm- og internettavhengighet | NO/Nordic | Kaldkjede, lager, bestilling og transport | OE/DSB/FFI | 2023-2026 | A/B | Generell samfunnsfunksjon; matspesifikk effekt må case-lukkes. |
| Sentrallager / just-in-time | NO | Lavere buffer ved avbrudd | FFI 26/010, Riksrevisjonen | 2023-2026 | A | Åpne dagsdekningstall mangler. |
| Kjøle-/fryselager for kjøtt/sjømat | NO | Temperaturkjede og kapasitetsflaskehals | OE 60-2023 | 2023 | B/C | Kvalitativt omtalt; ingen åpen kapasitetstabell. |
| Lageroppbygging Nord-Norge | NO | Regional forsyning ved transportbrudd | OE/FFI | 2023-2026 | B | Plan/tiltak, ikke ferdig volumserie. |
| Sjøtransport/havner | SE | Havner og transport som del av livsmedelsberedskap | Livsmedelsverket/Jordbruksverket/Trafikverket | 2024-2026 | A | Matspesifikk planstruktur, men ikke åpne nodevolum. |
| Gotland/øyforsyning | SE | Transportavbrudd som matforsyningscase | Livsmedelsverket Gotland-sammendrag | 2024/2025 | A/B | Case-spesifikt; ikke nordisk generell modell. |
| Finland security-of-supply network | FI | Lange avstander, lagre, maritim import og offentlig-privat beredskap | Huoltovarmuuskeskus/NESA | live 2026 | A | Lagerdetaljer og lokasjoner ikke åpne. |
| Danmark/Island | DK/IS | Mangler sammenlignbar matspesifikk nodekilde i batchen | ikke lukket | 2026 | C | Trenger egne nasjonale kilder. |

## Tomme celler

- Dagsdekning i grossist-/sentrallager per land/region.
- Kjøle-/fryselagerkapasitet og geografisk lokasjon.
- Reell omrutingskapasitet ved havne-, tunnel-, bro- eller drivstoffbrudd.
- Offentlig matandel av nasjonale havnevolum.
- Åpne kriseplaner som kobler bestemt matvare til bestemt transportnode.

## Ikke si

- Ikke si at kvalitative noder er tallfestede flaskehalser.
- Ikke gjøre generell transportberedskap til matspesifikk sårbarhet uten matkobling.
- Ikke publiser lager-/dagsdekningstall uten dataeier og sikkerhetsvurdering.
- Ikke si at robuste globale forsyningskjeder betyr at Norge er robust mot alle transportbrudd.
- Ikke bland plan, kapasitet og faktisk lagerbeholdning.

## Anbefalt gate

Source-shortlist. Bruk som risiko-/metodematrise og actor-gate-kø for dataeierne bak lager, kjølekjede og transportkapasitet.
