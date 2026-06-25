# Mottakslogg — lokale-verdikjeder 2026-06-25

Dataset: `lokale-verdikjeder-2026-06-25`
Import-dato: 2026-06-25
Importer: `scripts/import-domain-actors.ts`

## Noder importert

### Re-tagga eksisterende noder (10)

| Slug | Navn | Subdomene |
|---|---|---|
| reko-norge (actor-reko-norge) | REKO-ringer Norge | paraply-nettverk |
| andelslandbruk-no | Andelslandbruk (Oekologisk Norge) | paraply-nettverk |
| stiftelsen-bondens-marked | Stiftelsen Bondens marked Norge | paraply-nettverk |
| hanen | HANEN | paraply-nettverk |
| matsentralen-norge (actor-matsentralen) | Matsentralen Norge | paraply-nettverk |
| overland-andelslandbruk | Oeverland Andelslandbruk SA | andelslandbruk |
| reko-sverige | REKO-ringar Sverige | reko |
| reko-danmark | REKO i Danmark (forsoekt) | reko |
| reko-finland | REKO (opprinnelse) | reko |
| beint-fra-byli | Beint fraa byli | paraply-nettverk |

Alle 10 eksisterende aktører beriket additivt (themeTags-union): la til `domene:lokale-verdikjeder`, `subdomene:<X>`, og `lokale-verdikjeder-2026-06-25`. Ingen kuraterte felter overskrevet.

### Nye noder (16)

| Slug | Navn | Subdomene |
|---|---|---|
| reko-ring-trondheim | REKO-ringen Trondheim | reko |
| reko-ring-sandnes-stavanger | REKO-ringen Sandnes/Stavanger | reko |
| reko-ring-moss | REKO-ringen Moss | reko |
| reko-ring-kristiansand | REKO-ringen Kristiansand | reko |
| reko-ring-bodo | REKO-ringen Bodoe | reko |
| reko-ring-lillestrom | REKO-Ringen Lillestroem | reko |
| tveten-andelsgaard | Tveten andelsgaard | andelslandbruk |
| kirkeby-andelslandbruk | Kirkeby andelslandbruk | andelslandbruk |
| ommang-sondre-andelslandbruk | Ommang Soendre andelslandbruk | andelslandbruk |
| sverdstad-andelslandbruk | Sverdstad andelslandbruk | andelslandbruk |
| virgenes-andelsgaard | Virgenes Andelsgaard | andelslandbruk |
| dun-andelslandbruk | Dun Andelslandbruk | andelslandbruk |
| bondens-marked-oslo | Bondens marked Oslo og Omegn | bondens-marked |
| bondens-marked-trondelag | Bondens marked Troendelag | bondens-marked |
| bondens-marked-rogaland | Bondens marked Rogaland | bondens-marked |
| bondens-marked-bergen | Bondens marked Bergen | bondens-marked |

## Kilder brukt

- **REKO**: Facebook-grupper for enkelt-ringer (reko-ring-trondheim, reko-ring-sandnes-stavanger, reko-ring-moss, reko-ring-kristiansand, reko-ring-bodo, reko-ring-lillestrom) + REKO Norge nasjonal paraply
- **Andelslandbruk**: Egne nettsteder for gaardene + Oekologisk Norge Oekoguiden (okologisknorge.no/oekoguiden) for Kirkeby, Ommang Soendre, Sverdstad, Virgenes, Dun
- **Bondens marked**: bondensmarked.no/lokallag for alle fire lokallags-sider (Oslo og Omegn, Troendelag, Rogaland, Bergen) + Stiftelsen Bondens marked

## Dedup-utfall

- 10 eksisterende noder funnet via slug-match; berikt additivt
- 16 nye noder opprettet
- Ingen duplikater opprettet

## Dekningsdelta (foer → etter)

| Subdomene | Foer | Etter | Delta |
|---|---|---|---|
| reko (NO) | 0 | 6 | +6 |
| andelslandbruk (NO) | 0 | 7 | +7 |
| bondens-marked (NO) | 0 | 4 | +4 |
| paraply-nettverk (NO) | 0 | 5 | +5 |
| gaardsutsalg (NO) | 0 | 0 | 0 |
| markedshager (NO) | 0 | 0 | 0 |

Totalt domene-tagga aktorer i NO-cellene: 22. I tillegg ble 4 noder med Norden-kontekst re-tagget (reko-sverige/danmark/finland → reko; beint-fra-byli → paraply-nettverk) — disse faller utenfor NO-dekningsboka og telles derfor ikke i cellene over (26 noder totalt tagget).

Gap-reduksjon: reko 140→134, andelslandbruk 93→86, bondens-marked 20→16, paraply-nettverk 8→3.
