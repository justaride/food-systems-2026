# R12-RES-005 - Transport, lager og kaldkjede

**Dato:** 2026-06-25  
**Status:** Batch 07 output - underlag, ikke claim  
**Gate:** source-shortlist  
**Beslutning:** enrich

## Kort dom

Det fins godt apent kildemateriale pa NIVA av matspesifikke transport-/logistikk-sarbarheter for Norge, men nesten utelukkende kvalitativt: Oslo Economics' utredning for NFD (OE-rapport 60/2023) navngir konkrete matrelevante knutepunkter (Rotterdam som hovedhavn for store deler av varetransporten til Norge; all soya til kraftfor sjoveien via Fredrikstad), peker pa arbeidskraftmangel og el/drivstoff-avhengighet, men konkluderer at logistikkjedene stort sett er robuste og substituerbare. Riksrevisjonen (2023) og DSB (2017/2023) bekrefter at myndighetene forutsetter fungerende import/transport ogsa i krise og at vi ikke er godt nok forberedt. Sverige (Livsmedelsverket, MSB/MCF, Trafikverket) og Finland (NESA/HVK) har sektoransvarsstrukturer som eksplisitt knytter transport/havn til matforsyning, men apne tallfestede sarbarhetsmal (kapasitet, dager dekning, kjolekjede-tonnasje) er i stor grad ikke publisert eller beredskapssensitive. Realiserte volumtall per node er nesten gjennomgaende tomme/C-celler.

## Sterkeste kilde

Oslo Economics, `En gjennomgang av sarbarheten i globale forsyningskjeder for matvarer` (OE-rapport 60-2023, for Naerings- og fiskeridepartementet), kap. 15 `Logistikk og lagring i verdikjedene`. Supplert av Riksrevisjonen 2023, DSB, Livsmedelsverket, MSB og Trafikverket. Lokatorer (faktisk fetchet denne sesjonen):

- `https://www.regjeringen.no/contentassets/2617bce77a8240c784c5b4a1d55c12fd/oe-rapport-60-2023-med-vedlegg.pdf` (kap. 15, hentet og tekstuttrekt)
- `https://www.dsb.no/ros-og-beredskap/samfunnssikkerhet-og-samordning/analyser-av-krisescenarioer/`
- `https://www.livsmedelsverket.se/beredskap/livsmedelsberedskap--vad-ar-det/samhallsviktiga-verksamheter-inom-sektorn-livsmedelsforsorjning-och-dricksvatten`
- `https://www.huoltovarmuuskeskus.fi/en/security-of-supply`
- `https://www.trafikverket.se/om-oss/var-verksamhet-vision-och-uppdrag/civilt-forsvar-och-krisberedskap/`

## Funn-tabell

| Sarbarhetsnode | Aktor/land | Ar/periode | Lokator | Kildeklasse | Status | Caveat |
|---|---|---:|---|---|---|---|
| Havnekonsentrasjon: stor andel varetransport til Norge gar via Rotterdam | OE-rapport 60/2023 (NFD), Norge | 2023 | OE-rapport 60-2023, kap. 15.2.1 | A | Hypotese/kvalitativ | Basert pa intervjuer; ingen andel/tonn oppgitt. Sarbarhet avhenger av om andre transportformer kan brukes ved blokade. |
| Enkeltpunkt-import: all soya til kraftfor kommer sjoveien til Fredrikstad | OE-rapport 60/2023, Norge | 2023 | OE-rapport 60-2023, kap. 15.2.1 | A | Realisert (rute), kvalitativ | Konkret enkeltpunkt-avhengighet for forprotein; ingen volumtall i kilden her. Kobler til R12-FEED-004 (soya/SPC). |
| Substituerbarhet transport (tog/sjo/vei/fly); vei naer ubegrenset ruter | OE-rapport 60/2023, Norge | 2023 | OE-rapport 60-2023, kap. 15.2.2 | A | Kapasitet/vurdering | Kilden vurderer logistikkbrist alene som lite sannsynlig arsak til langvarig bortfall. Ikke bruk som garanti. |
| Arbeidskraftmangel i transport; utestengte russiske cargofly-/logistikkselskap | OE-rapport 60/2023, Norge | 2022-2023 | OE-rapport 60-2023, kap. 15.2.3 | A | Realisert utfordring | Hoyere kostnad/press pa sjomateksport (fly). Kvalitativt, ikke kvantifisert. |
| El-, drivstoff- og internett-avhengighet i matlogistikk | OE-rapport 60/2023, Norge | 2023 | OE-rapport 60-2023 (innsatsfaktorer/logistikk) | A | Vurdering/avhengighet | Navngitt som tverrgaende avhengighet; ligger delvis utenfor rapportens mandat. Ingen tall. |
| Rad for drivstoffberedskap (matvaredistributorer: Rema Distribusjon, NorgesGruppen, Coop Norge Handel, Servicegrossistene, Tine Logistikk) | NFD/Norge | lopende (omtalt 2023) | OE-rapport 60-2023 (beredskapsstruktur) | A | Plan/struktur | Bekrefter institusjonell kobling drivstoff<->matdistribusjon. Ikke en malt sarbarhet. |
| Lageroppbyggingsplaner for matvarer til Nord-Norge | bransje/Norge | omtalt 2023 | OE-rapport 60-2023, kap. 15.3 | B | Plan | Aktorers egne planer; ingen apen tonnasje/dagsdekning i kilden her. |
| Frysekapasitet/kjolekjede for kjott og oppdrettsfisk | OE-rapport 60/2023, Norge | 2023 | OE-rapport 60-2023 (verdikjede kjott/sjomat) | B | Kapasitet (kvalitativ) | Frys-/slaktekapasitet nevnt som flaskehals for kjott; ingen kapasitetstall. Kaldkjede-svikt ved stromutfall ikke tallfestet. |
| Strommrasjonering Sor-Vestlandet - folger for kritiske samfunnsfunksjoner | DSB, Norge | 2023 | DSB Analyser av krisescenarioer (Stromrasjonering 2023) | A | Scenario/plan | Generelt el-scenario; matkobling ma utledes, ikke matspesifikk node i seg selv. |
| Myndighetene forutsetter import/transport ogsa i krise; ikke godt nok forberedt | Riksrevisjonen, Norge | 2023 (behandlet Stortinget jan 2024) | Riksrevisjonen Dok 3 2023-2024 / stortinget.no | A | Vurdering/funn | Systemkritikk, ikke en spesifikk transportnode. Brukes som ramme, ikke som node-tall. |
| Havner som samhallsviktig infrastruktur (~90% av Sveriges import/eksport via havn) | MCF/MSB, Sverige | 2025 (oppdatert) | MCF handbok civilt forsvar, havnar | A | Realisert (struktur) | Generell havnestatistikk; ikke isolert matandel. Mat er én av sektorene som etterspor transport. |
| Trafikverket sektorsansvarig for Beredskapssektor Transporter (inkl. havn-planansvar) | Trafikverket, Sverige | 2024-2025 | trafikverket.se civilt forsvar och krisberedskap | A | Plan/struktur | Siden navner ikke livsmedel eksplisitt; matkobling via tverrsektoriell etterspørsel (MSB-/sektorkilder). |
| Livsmedelsforsorjning + transport som samhallsviktig; el-beroende, sarbara distributionskedjor | Livsmedelsverket/MSB, Sverige | 2024-2025 | livsmedelsverket.se samhallsviktiga verksamheter; MCF/MSB | A | Vurdering/struktur | Fungerande transporter + import navnt som grunnforutsetning. Ingen apne dagsdekning-/kapasitetstall. |
| Forsyningssikkerhet avhengig av maritim transport, lange avstander, kaldt klima | NESA/HVK, Finland | lopende | huoltovarmuuskeskus.fi security-of-supply | A | Vurdering/struktur | Lagre integrert i kommersielle logistikkjeder; detaljert lager/lokasjon ikke apent. |
| Apne tallfestede dagsdekning/kapasitet per havn/sentrallager/kjolekjede | Norden | lopende | (ikke funnet apent) | C | Tom celle | Beredskapssensitivt/ikke malt i apne kilder. Ma ikke estimeres. |

## Tomme celler

- Apne, sammenlignbare tall for hvor mange dagers matforsyning som ligger i grossist-/sentrallager per land (klassifisert/forretningssensitivt; ikke i kildene her).
- Tonnasje og lokasjon for kjole-/fryselager som faktisk barer matforsyning (beredskaps-/forretningssensitivt).
- Kvantifisert kjolekjede-sarbarhet ved stromutfall (kvalitativt nevnt for kjott/sjomat, ikke malt).
- Volum/andel for havne-knutepunkter (Rotterdam-andel, Fredrikstad-soya-tonn) - oppgitt kvalitativt, ikke tallfestet i fetchet kilde.
- Separat finsk/dansk apen node-status pa samme detaljniva som de norske OE-funnene.

## Ikke si

- Ikke gjor generell transportberedskap (Trafikverket, DSB-scenarioer, NESA struktur) til en matspesifikk sarbarhet uten eksplisitt matkobling i kilden.
- Ikke fremstill Rotterdam-andelen eller Fredrikstad-soya som tallfestet - kildene er intervjubaserte/kvalitative.
- Ikke fremstill "logistikkjedene er robuste" som en garanti; det er OE/intervjuvurdering med forbehold om arbeidskraft, el og drivstoff.
- Ikke bland sammen plan/struktur (rad, sektoransvar, lageroppbyggingsplaner) med realisert kapasitet eller malt beholdning.
- Ikke fyll tomme dagsdekning-/kapasitetsceller med estimat; beredskapstall er ofte klassifisert og skal sta som C.

## Anbefalt gate

source-shortlist. Importer som matrelevant transport/kaldkjede-sarbarhetsmatrise med egne kolonner for `realisert/kapasitet/plan/potensial/hypotese` og `kildeklasse`; behold de norske OE-nodene (Rotterdam, Fredrikstad-soya, drivstoffrad, kjolekjede) som de sterkeste matspesifikke, og hold svensk/finsk transportstruktur som ramme inntil matspesifikk lokator finnes.
