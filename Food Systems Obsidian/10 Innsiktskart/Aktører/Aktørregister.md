---
type: hub
status: kuratert
kilde: Food Systems Obsidian/10 Innsiktskart/Aktører; data/vault-export/companies.json
siterbarhet: intern
oppdatert: 2026-07-15
---

# Aktørregister

> Veiviser mellom kuraterte aktørnoter, stakeholder-skjelett og de store DB-genererte registrene. Et registrert navn dokumenterer ikke automatisk aktivitet, kapasitet, intensjon eller effekt.

## Tre aktørlag

- **Kuratert analysekontekst:** aktørnotene i denne mappen, brukt av [[Innsiktskartet]].
- **Makt- og selskapsdata:** [[Selskapsregister]], [[Eierskapsregisteret]] og [[Personregister]].
- **Menneskelig validering:** [[Stakeholder-register]] med prioriterte spørsmål og uutfylte stemmer.

## Kuraterte aktører

```dataview
TABLE status, siterbarhet, kilde
FROM "10 Innsiktskart/Aktører"
WHERE type = "aktor"
SORT file.name ASC
```

## Identitetsregel

Selskap, person, eierfamilie og stakeholder er forskjellige roller selv når navn ligner. Bruk path-kvalifiserte lenker ved navnekollisjon, og les [[Metadata- og navnekonvensjoner]] før nye identiteter opprettes.

## Koblinger

- [[Feltkart – kunnskapsbasen]]
- [[Maktkartet]]
- [[Selskapsregister]]
- [[Personregister]]
- [[Stakeholder-register]]

## Notater

_Dataview-listen dekker kuraterte aktørnoter; den er ikke et universestimat for matsystemet._
