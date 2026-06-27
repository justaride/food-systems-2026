# Celle-prompt: distribusjon-grossist / grossist-distributor

Fyll inn i `_mal-deep-research-prompt.md`:

- `{{domene}}` = `distribusjon-grossist`
- `{{subdomene}}` = `grossist-distributor`
- `{{antall}}` = 15-25 (de strukturbærende grossistene + neste sjikt spesialgrossister)

## Seed-liste (hovedaktører)
ASKO Norge AS (NorgesGruppen), Bama Gruppen AS, Unil AS (NorgesGruppens eget vareforsyning), Coop Norge Handel / Coop Logistikk, REMA Distribusjon Norge AS (Reitan), Servicegrossistene AS, Norgesgruppen Servicehandel, Cater AS, ASKO Storkjøkken, Brødrene Dahl(? – ikke mat), Grossisten/Dagrofa(? – dansk), Nordfjord Kjøtt (foredler+distribusjon), Mills/Orkla-distribusjon, Tine distribusjon, Lyche/regionale ferskvaregrossister.

**NB — lenking (kritisk her):** ASKO, Bama, Unil, REMA Distribusjon, Coop Logistikk ligger alt i konserntrærne (`import-asko`, `import-bama-tree`, `import-ng-tree`, `import-coop-tree`, `import-reitan-tree`). Register-slicen i #211 fanget 6 BAMA-enheter alfabetisk — her skal du i stedet bevisst lenke **hver** BAMA/ASKO-enhet via `org_nr`→`companyId` og fange konsern-relasjonene, ikke ta et A/B-utvalg.

## Cellespesifikke kilder
- Brreg NACE `46.3x` (engroshandel med nærings- og nytelsesmidler): 46.31 frukt/grønt, 46.32 kjøtt, 46.33 meieri/egg/oljer, 46.34 drikkevarer, 46.39 uspesifisert.
- Konserntrærne i DB (lenk mot eksisterende `Company`-rader).
- Skill mellom dagligvare-grossist (ASKO/Unil/REMA Dist.) vs. HORECA/storkjøkken-grossist (Cater/Servicegrossistene/ASKO Storkjøkken) vs. spesial/ferskvare i `notes`.

## Relasjoner å fange
- `subsidiary_of` mot konsernspiss (ASKO → NorgesGruppen; REMA Distribusjon → Reitan; Unil → NorgesGruppen; BAMA-enheter → BAMA Gruppen).
- `supplier_to` mot dagligvarekjedene (handel-dagligvare-cellen).
- `buyer_of` mot foredling/primærproduksjon der kjent.
