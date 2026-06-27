# Celle-prompt: primaerproduksjon / havbruk-akvakultur

Fyll inn i `_mal-deep-research-prompt.md`:

- `{{domene}}` = `primaerproduksjon`
- `{{subdomene}}` = `havbruk-akvakultur`
- `{{antall}}` = 20-30 signifikante aktører (de store + neste sjikt regionale)

## Seed-liste (hovedaktører — valider org.nr mot Brreg, lenk mot eksisterende konsern)
Mowi ASA, SalMar ASA, Lerøy Seafood Group ASA, Grieg Seafood ASA, Cermaq Norway AS, Nordlaks, Nova Sea AS, Bremnes Seashore AS, Sinkaberg-Hansen AS, Måsøval AS, Eide Fjordbruk AS, Bjørøya AS, Ellingsen Seafood AS, Kvarøy Fiskeoppdrett, Nekton Havbruk, Wenberg Fiskeoppdrett, Salaks AS, Gifas, Salmon Evolution (landbasert), Andfjord Salmon (landbasert), Atlantic Sapphire.

**NB — lenking:** Mowi, SalMar, Lerøy m.fl. ligger trolig alt i konserntrærne (`import-mowi-tree`, `import-salmar-tree`, `import-leroy-tree`). Oppgi org.nr så importeren setter `companyId` og **beriker** dem (legg til `domene:primaerproduksjon`/`subdomene:havbruk-akvakultur` + relasjoner), ikke dupliserer. Det var nettopp dette register-slicen bommet på (tok 20 «A»-selskap, ikke disse).

## Cellespesifikke kilder
- Fiskeridirektoratets akvakulturregister (prosjektet har alt `scripts/import-akvakulturregister.ts` — kryss-referer).
- Brreg NACE `03.21` (havbasert akvakultur) / `03.22` (ferskvannsbasert).
- Børsmeldinger/årsrapporter for de noterte (Mowi/SalMar/Lerøy/Grieg/Andfjord/Salmon Evolution).
- Skill mellom sjøbasert (tradisjonell) og landbasert/RAS (Salmon Evolution, Andfjord, Atlantic Sapphire) i `notes`.

## Relasjoner å fange
- `subsidiary_of` til morselskap/konsern (f.eks. Cermaq → Mitsubishi; datterselskap → konsernspiss).
- `supplier_to` mot foredling/grossist der kjent.
- Konsolidering/oppkjøp i `notes` (havbruk er sterkt konsolidert).
