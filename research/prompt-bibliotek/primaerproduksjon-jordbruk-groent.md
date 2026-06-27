# Celle-prompt: primaerproduksjon / jordbruk-groent

Fyll inn i `_mal-deep-research-prompt.md`:

- `{{domene}}` = `primaerproduksjon`
- `{{subdomene}}` = `jordbruk-groent`
- `{{antall}}` = 15-25 SIGNIFIKANTE strukturaktører (ikke alle gårder)

## Viktig avgrensning — dybde vs. langhale
Dette feltet har **tusenvis av gårder**. Det er ikke deep-research-jobben å enumerere dem — det er langhalen (register/Codex via produksjonstilskudd/Landbruksregister). Deep-research skal fange de **strukturbærende** aktørene:
1. **Produsentsamvirker / produsentpakkerier** som binder gårdene til verdikjeden.
2. **De største kommersielle dyrkerne/gartneriene.**

## Seed-liste (strukturaktører)
Gartnerhallen SA (det dominerende grøntsamvirket, leverer til Bama), Nordgrønt SA, Norgrønt, produsentpakkeriene (BAMA-tilknyttede), Miljøgartneriet AS, Wiig Gartneri AS, Lauvsnes Gartneri, Mester Grønn (hvis grønt/ikke kun blomster), Findus Norge ( erter/grønt-kontrakt), Hvassergartneriet, Grønn Næring-aktører, NLR (rådgivning – grenseland mot fou).

**NB — lenking:** Gartnerhallen og produsentpakkeriene kobler tett mot BAMA/NorgesGruppen-trærne. Oppgi org.nr → `companyId`-lenking der selskapet alt finnes; ellers opprett som ny node med `subsidiary_of`/`supplier_to`-relasjon mot konsernet.

## Cellespesifikke kilder
- Gartnerhallen + Nordgrønt medlems-/produsentlister.
- Landbruksdirektoratet produksjonstilskudd (prosjektet har `scripts/import-produksjonstilskudd.ts`) — de største grønt-mottakerne.
- Norsk Gartnerforbund.
- Brreg NACE `01.13` (dyrking av grønnsaker, meloner, rot- og knollvekster).

## Relasjoner å fange
- `member_of` gård/dyrker → produsentsamvirke (Gartnerhallen/Nordgrønt).
- `supplier_to` samvirke/pakkeri → grossist (BAMA) → dagligvare.
- Marker i `notes` at de individuelle gårdene tilhører langhalen (register-sporet), ikke denne dybde-cellen.
