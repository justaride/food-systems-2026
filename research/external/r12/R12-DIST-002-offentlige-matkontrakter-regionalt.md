# R12-DIST-002 - Offentlige matkontrakter regionalt

**Dato:** 2026-06-24  
**Status:** Batch 03 output - underlag, ikke claim  
**Gate:** PCQ  
**Beslutning:** enrich

## Kort dom

Doffin viser at offentlige matkontrakter kan brukes som kanal-ledger pa regionalt niva, men ikke som nasjonal markedsandelsserie uten videre dataarbeid. Samplede Doffin-resultater viser kjente grossist-/kategoriaktorer som ASKO, Bama Storkjokken, Servicegrossistene, Nortura og Tine som vinnere i flere regionale rammeavtaler. Funnet er egnet som PCQ-kandidat for en regional kontrakttabell, men ikke som claim om samlet nasjonal andel eller lokalmattilgang.

## Sterkeste kilde

Doffin public webclient API og Doffin notice-sider, blant annet:

- `https://api.doffin.no/webclient/api/v2/notices-api/notices/2025-102264`
- `https://api.doffin.no/webclient/api/v2/notices-api/notices/2025-119895`
- `https://api.doffin.no/webclient/api/v2/notices-api/notices/2026-108326`
- `https://api.doffin.no/webclient/api/v2/notices-api/notices/2024-102276`
- `https://api.doffin.no/webclient/api/v2/notices-api/notices/2026-108997`

## Funn-tabell

| Oppdragsgiver/region | Notice | Ar | Type | Vinnere / status | Kildeklasse | Caveat |
|---|---|---:|---|---|---|---|
| RIIK/Kongsvingerregionen | `2025-102264` Matvarer storkjokken, rammeavtale | 2025 | Resultat | Asko Hedmark AS; Bama Storkjokken AS | A | Doffin-resultat, men delkontraktfordeling ma trekkes fra eForm for presis kategori. |
| GKI/Grenlandskommunene | `2025-119895` Rammeavtale Matvarer / Naeringsmidler | 2025 | Resultat | Nortura; Servicegrossisten Ost AS; Asko Ost AS; Tine SA; Bama Storkjokken AS | A | Doffin viser flere awardedNames; samme navn kan forekomme per delkontrakt. |
| Fredrikstad/Hvaler | `2026-108326` Kolonialvarer | 2026 | Resultat | Asko Ost AS | A | Kolonialvarer, ikke komplett matkurv. |
| Vestland fylkeskommune | `2024-102276` Rammeavtale matvarer | 2024 | Resultat | Bama Storkjokken AS; Servicegrossistene AS | A | Videregaende skoler/kantiner; ikke fylkets totale matkjop. |
| Rogaland fylkeskommune | `2026-108997` Naeringsmiddelavtale | 2026 | Konkurranse | Ikke tildeling i hentet notice; delkontrakter for kolonial, kjott, fisk, frukt/gront, meieri | A for kunngjoring, C for vinner | Frist 2026-06-05; trenger resultatnotice for vinner. |
| Nasjonal andel offentlige matkontrakter per leverandor | Doffindata/videre uttrekk | 2024-2026 | Aggregat | Ikke beregnet i denne batchen | C | Krever komplett CPV/procedureId-kobling og resultatdekning. |

## Tomme celler

- Komplett nasjonal winner-share per leverandor og CPV-kategori.
- Full delkontrakt-til-leverandor mapping for alle samplede notices.
- Kontraktsverdi per leverandor der Doffin bare viser vinnernavn i kompaktfelt.
- Lokal/regional produsentandel i hver avtale.

## Ikke si

- Ikke si at offentlige kontrakter beviser en alternativ kanal for smaprodusenter uten avrops-/leverandordata.
- Ikke si at Doffin-samplet er nasjonal markedsandel.
- Ikke bland konkurransekunngjoring med kontraktstildeling.
- Ikke bland kategori-vinner med totalramme-vinner nar avtalen har delkontrakter.
- Ikke si at `awardedNames` alene viser volum eller verdi.

## Anbefalt gate

PCQ. Importer som regional kontrakt-ledger og krev neste uttrekk: `noticeId`, `procedureId`, `buyer`, `region`, `CPV`, `delkontrakt`, `awardedNames`, `receivedTenders`, `value`, `contractPeriod`, `sourceUrl`.

