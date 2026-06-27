# Celle-prompt: foredling-industri / meieri

Fyll inn i `_mal-deep-research-prompt.md`:

- `{{domene}}` = `foredling-industri`
- `{{subdomene}}` = `meieri`
- `{{antall}}` = 12-20 (feltet er konsentrert — TINE dominerer, så et håndterbart antall)

## Seed-liste (hovedaktører)
TINE SA, Q-Meieriene AS (Kavli-eid), Synnøve Finden AS, Rørosmeieriet AS, Normilk AS, Den Norske Isbilen, Diplom-Is (Unilever), Hennig-Olsen Is AS, Isbjørn Is, Skånemejerier(? – kun hvis norsk salg), gårdsmeierier av betydning (Stavanger Ysteri, Ostegården, Haukeli, Lille Trøndelag), TINEs konkurrenter i nisje (Fjordland – tilberedt, grenseland).

**NB — lenking:** TINE og Q ligger trolig i konserntrærne (`import-tine-tree`, `import-kavli-tree`). Oppgi org.nr → `companyId`-lenking + berik med `domene:foredling-industri`/`subdomene:meieri`. Q-Meieriene → `subsidiary_of` Kavli.

## Cellespesifikke kilder
- Brreg NACE `10.51` (meierivarer og ostproduksjon).
- NHO Mat og Drikke / Meierileverandørenes medlemslister.
- Landbruksdirektoratet (markedsordning melk) for de største aktørene/kvoter.
- Skill samvirke (TINE) vs. privat (Q/Synnøve/Røros) vs. gårdsmeieri i `notes`.

## Relasjoner å fange
- `supplier_to` mot dagligvare/grossist (TINE → ASKO/NorgesGruppen osv.).
- `subsidiary_of` (Q → Kavli; Diplom-Is → Unilever).
- `member_of`/leverandør-relasjon mot melkeprodusenter (primaerproduksjon/husdyr-beite) der det er kjent.
