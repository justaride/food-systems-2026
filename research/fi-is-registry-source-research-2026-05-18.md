# FI/IS registry source research - 2026-05-18

Scope: Finland/PRH Virre and Iceland/Skatturinn traces for Kesko Oyj and Hagar hf. No DB, Prisma, script, test, or central status files were changed.

## FI - Kesko Oyj

Status: applicable for PRH/YTJ basic register fields; blocked for non-API Virre extract/document artifacts.

Company: Kesko Oyj  
Business ID: 0109862-8  
Official source paths checked:

- PRH open data YTJ API: `https://avoindata.prh.fi/opendata-ytj-api/v3/companies?businessId=0109862-8`
- PRH open data frontdoor: `https://avoindata.prh.fi/en`
- Virre frontdoor: `https://virre.prh.fi/novus/home?userLang=en`
- Virre instructions: `https://www.prh.fi/en/companiesandorganisations/tietopalvelut/virre/virre_-_instructions.html`
- PRH Trade Register extract instructions: `https://www.prh.fi/en/companiesandorganisations/tietopalvelut/trade_register_extract.html`
- PRH financial statements instructions: `https://www.prh.fi/en/companiesandorganisations/financial_statements.html`

Findings:

- Acquired company-specific PRH open-data JSON for Kesko Oyj. It contains the Business ID, official names, EUID, company form, registered entries, addresses, trade register status, and `lastModified`.
- PRH states open-data APIs retrieve basic details and digital financial statement information, while other financial statements are bought via Virre.
- PRH/Virre states basic details and electronic Trade Register extracts are free of charge, but the stable public route is the interactive Virre UI. Direct scripted Virre frontdoor access redirected between session states and did not produce a stable company-specific extract artifact.
- PRH states financial statements are public and available from Virre, but purchasable document flow is outside the non-paid artifact stop rule unless a zero-price public artifact is directly exposed.

Stop-rule:

- Use the PRH open-data JSON for field citations to basic register details now.
- Do not claim a field citation to a Virre Trade Register extract until the actual extract PDF/HTML is saved from a Virre browser session.
- Do not claim a field citation to Kesko financial statement documents from PRH/Virre until the company-specific document or a stable company-specific Virre availability page is archived.

## IS - Hagar hf

Status: applicable for Skatturinn company lookup and annual-account availability; blocked for final downloaded overview/annual-account PDF artifacts and company-specific beneficial-owner certificate.

Company: Hagar hf.  
Kennitala: 6702032120  
Official source paths checked:

- Skatturinn company-registry frontdoor: `https://www.skatturinn.is/fyrirtaekjaskra/`
- Hagar company lookup: `https://www.skatturinn.is/fyrirtaekjaskra/leit/kennitala/6702032120`
- Skatturinn company information/certificate instructions: `https://www.skatturinn.is/fyrirtaekjaskra/thjonusta/upplysingar-ur-fyrirtaekjaskra/`
- Skatturinn beneficial-owner path: `https://www.rsk.is/fyrirtaekjaskra/raunverulegir-eigendur/`
- Skatturinn vefverslun cart route for free registration overview and annual-account items.

Findings:

- Acquired company-specific Skatturinn lookup HTML for Hagar hf. It contains company name, kennitala, established/registered date, address, legal form, representative, free registration overview button, certificate button, VAT entries, and annual-account registry entries.
- The Hagar lookup lists annual-account registry items from 2004 through 2025. The 2025 consolidated annual account appears as item `799554`, type `2`, submitted 18.06.2025.
- The Skatturinn vefverslun cart accepted both the free registration overview and the 2025 consolidated annual account as price `0`, but the scripted non-browser post did not produce a downloaded PDF/overview artifact before the session-flow stop point.
- Skatturinn public instructions say basic information is shown on the company page and a more detailed overview can be obtained free of charge through the web shop. Certified registration certificates cost ISK 1,500.
- The beneficial-owner path is official and archived as a frontdoor/path source, but no company-specific Hagar beneficial-owner certificate was obtained in this pass.

Stop-rule:

- Use the Hagar company lookup page for field citations to company basic details and annual-account availability now.
- Use the cart pages only as availability/acquisition evidence, not as the final annual-account or registration-overview document.
- Do not claim a field citation to beneficial-owner data until a company-specific beneficial-owner artifact for Hagar hf is obtained and archived.

## Artifact manifest

All access dates are 2026-05-18.

| Country | Artifact | URL | Local path | SHA-256 | Method | Field citation now |
| --- | --- | --- | --- | --- | --- | --- |
| FI | Kesko PRH open-data company JSON | `https://avoindata.prh.fi/opendata-ytj-api/v3/companies?businessId=0109862-8` | `research/evidence-pack/registry-sources/fi-is-2026-05-18/fi/kesko-prh-open-data-company-0109862-8.json` | `f144452ef98c520310ea3acd23a335d85c04a6ac1a7a6565c9a0c6a4ff56730e` | HTTP GET | Yes - basic register details |
| FI | PRH open-data frontdoor | `https://avoindata.prh.fi/en` | `research/evidence-pack/registry-sources/fi-is-2026-05-18/fi/prh-open-data-frontdoor.html` | `a77aa903b4b9b70cd24093678abd3ef5d307980f0d04be5a56a7457ee0df6e6b` | HTTP GET | No - service/path citation only |
| FI | Virre frontdoor redirect evidence | `https://virre.prh.fi/novus/home?userLang=en` | `research/evidence-pack/registry-sources/fi-is-2026-05-18/fi/prh-virre-frontdoor-http-redirect.txt` | `b360d8b7d2ffed6c63b5b4929921fe8fd3f0c2fd6ce596da0160a96db3c05e17` | HTTP GET headers | No |
| FI | Virre instructions | `https://www.prh.fi/en/companiesandorganisations/tietopalvelut/virre/virre_-_instructions.html` | `research/evidence-pack/registry-sources/fi-is-2026-05-18/fi/prh-virre-instructions.html` | `2c986dc7ef52c493fc797f975c896bfa675bd1628701bbf2875e0cebaa9cd2df` | HTTP GET | No - service/path citation only |
| FI | PRH Trade Register extract instructions | `https://www.prh.fi/en/companiesandorganisations/tietopalvelut/trade_register_extract.html` | `research/evidence-pack/registry-sources/fi-is-2026-05-18/fi/prh-trade-register-extract-instructions.html` | `f21f02254d55a1491c4585bdd4fc7bd5ebc7df293d1640e9dd10b7deaedd7899` | HTTP GET | No - acquisition instructions only |
| FI | PRH financial statements instructions | `https://www.prh.fi/en/companiesandorganisations/financial_statements.html` | `research/evidence-pack/registry-sources/fi-is-2026-05-18/fi/prh-financial-statements-instructions.html` | `57356369fba46b736821fa9ecbbe5616106432ce058f134f5db9d1f36233ea28` | HTTP GET | No - acquisition instructions only |
| IS | Hagar Skatturinn company lookup | `https://www.skatturinn.is/fyrirtaekjaskra/leit/kennitala/6702032120` | `research/evidence-pack/registry-sources/fi-is-2026-05-18/is/hagar-skatturinn-company-6702032120.html` | `19a320bec148f0c945652168e0249ab3f6620d73811c8c98b7c44249715c4052` | HTTP GET via search/kennitala | Yes - basic details and annual-account availability |
| IS | Skatturinn company-registry frontdoor | `https://www.skatturinn.is/fyrirtaekjaskra/` | `research/evidence-pack/registry-sources/fi-is-2026-05-18/is/skatturinn-company-registry-frontdoor.html` | `5358823a40b5577346cc52fa065c112b57b8f51c5cf5b818f6cbda367198b8d9` | HTTP GET | No - service/path citation only |
| IS | Skatturinn company information/certificate instructions | `https://www.skatturinn.is/fyrirtaekjaskra/thjonusta/upplysingar-ur-fyrirtaekjaskra/` | `research/evidence-pack/registry-sources/fi-is-2026-05-18/is/skatturinn-company-info-certificates.html` | `d5547ab309f1e05f050d247a7d0bc6d6d3c6ab28a693664dfd2bbc5603984426` | HTTP GET | No - acquisition instructions only |
| IS | Skatturinn beneficial-owner path | `https://www.rsk.is/fyrirtaekjaskra/raunverulegir-eigendur/` | `research/evidence-pack/registry-sources/fi-is-2026-05-18/is/skatturinn-beneficial-owners.html` | `6d00c81c3e05fa373cfdea09c5967904280641bef062f54ac034d1dabf57c6c9` | HTTP GET | No - path only, not company-specific |
| IS | Hagar free registration overview cart evidence | `https://www.skatturinn.is/da/CartService/addToCart?itemid=6702032120&typeid=9` | `research/evidence-pack/registry-sources/fi-is-2026-05-18/is/hagar-registration-overview-cart.html` | `649cab0ef98dfa3f1a7b8218ca745350637ccf03e1c720c84df8a7ad251f8b8a` | Session HTTP GET to cart service, then cart page | No - availability/acquisition evidence only |
| IS | Hagar registration overview cart URL | ephemeral vefverslun URL saved locally | `research/evidence-pack/registry-sources/fi-is-2026-05-18/is/hagar-registration-overview-cart-url.txt` | `7e6fbcf3dc49feedc66e857e24c3906e2a98be24925a86572497eb46733a1973` | Session HTTP GET | No |
| IS | Hagar 2025 consolidated annual-account cart evidence | `https://www.skatturinn.is/da/CartService/addToCart?itemid=799554&typeid=2` | `research/evidence-pack/registry-sources/fi-is-2026-05-18/is/hagar-annual-account-2025-consolidated-cart.html` | `93a19b2ca6d2339e1683e68de8f38f134840df3ca130994c3ff0a5ee2c79647d` | Session HTTP GET to cart service, then cart page | No - availability/acquisition evidence only |
| IS | Hagar annual-account cart URL | ephemeral vefverslun URL saved locally | `research/evidence-pack/registry-sources/fi-is-2026-05-18/is/hagar-annual-account-2025-consolidated-cart-url.txt` | `7e6fbcf3dc49feedc66e857e24c3906e2a98be24925a86572497eb46733a1973` | Session HTTP GET | No |
