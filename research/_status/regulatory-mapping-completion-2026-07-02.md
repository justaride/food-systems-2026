# Regulatory mapping completion - official-source pass (2026-07-02)

## Scope

This pass controls the WS3 regulatory-mapping gap in `research/_plans/MASTER-RESEARCH-PLAN-2026-07-01.md`: extend `research/regulatory/nordic-regulatorisk-sammenligning-2026.md` with enforcement-case detail for the Nordic grocery/food-chain regimes.

The pass is deliberately official-source only because legal/regulatory status is drift-prone. It does not infer active enforcement where the authority source only proves policy, monitoring, merger review, or case closure without sanction.

## Artifact updated

- `research/regulatory/nordic-regulatorisk-sammenligning-2026.md`

## Official-source ledger added

| Country | Controlled evidence added | Enforcement class | Locator |
| :--- | :--- | :--- | :--- |
| Norway | Price-hunter case against Coop, Norgesgruppen and Rema, with NOK 4.9bn fines and cessation order upheld by the Competition Appeals Tribunal; Dagligvaretilsynet responsibility transfer to Konkurransetilsynet from 30 April 2026; 2025 grocery report monitoring context. | Competition enforcement + regulatory responsibility transfer + monitoring | `https://konkurransetilsynet.no/norwegian-competition-authority-decision-fully-upheld-in-the-price-hunter-case/?lang=en`; `https://www.regjeringen.no/no/aktuelt/dagligvaretilsynet-legges-ned-og-oppgavene-flyttes-til-konkurransetilsynet-fra-30.-april/id3156506/`; `https://konkurransetilsynet.no/wp-content/uploads/2026/04/Dagligvarerapport-2025.pdf` |
| Sweden | Everfresh LOH/UTP fine upheld in court; Konkurrensverket report 2024:5 on food-industry competition issues. | UTP enforcement + sector inquiry | `https://www.konkurrensverket.se/en/news/the-swedish-competition-authoritys-decision-to-fine-a-wholesale-company-stands-firm-after-court-review/`; `https://www.konkurrensverket.se/globalassets/dokument/informationsmaterial/rapporter-och-broschyrer/rapportserie/rapport_2024-5_summary.pdf` |
| Denmark | KFST/Konkurrencerådet approval of Salling Group's acquisition of 33 Coop Danmark stores after two stores were excluded; January 2026 Competition Council report with grocery-market focus. | Merger control + authority monitoring | `https://en.kfst.dk/nyheder/kfst/english/decisions/2025/20250326-salling-group-acquires-33-stores-from-coop-danmark`; `https://kfst.dk/media/3ozmhzqh/20260128-konkurrenceraadets-beretning-januar-2026.pdf` |
| Finland | FCCA/KKV §4a grocery-market dominance rule; Kesko Food/SOK sales-data-sharing investigation closed without further action. | Structural dominance framework + case closeout | `https://www.kkv.fi/en/current/press-releases/competition-act-provision-on-grocery-trade-became-effective-on-1st-of-january/`; `https://www.kkv.fi/en/current/press-releases/the-fcca-completed-its-investigation-into-the-sharing-of-kesko-foods-and-soks-sales-data-on-the-daily-consumer-goods-trade/` |
| Iceland | Samkeppniseftirlitið food-price/competition monitoring page and official decisions/publications register, including 2026 grocery-price report listing. | Monitoring/advocacy + merger/publication register | `https://www.samkeppni.is/en/release/news/price-increases-and-competition/`; `https://www.samkeppni.is/en/solutions/` |

## Controlled conclusions

- Norway and Sweden have the clearest recent enforcement markers for the whitepaper: Norway via competition-law enforcement in the price-hunter case; Sweden via a UTP/LOH fine upheld by the administrative court.
- Denmark is evidence-backed for local merger-control scrutiny and active grocery-market monitoring, not a broad supplier-protection sanction record in this pass.
- Finland has the strongest structural dominance shortcut through Competition Act §4a, but the official grocery-use case found here is a no-further-action closeout, not a sanction.
- Iceland should be framed as active on price/competition monitoring and advocacy; this pass did not verify a mature UTP-equivalent enforcement practice.
- Downstream copy must not claim GCA-equivalent enforcement maturity across all five Nordic countries.

## Verification

- `git diff --check` passed after Markdown hard-break cleanup.
- `npm run audit:research-artifacts -- --base=origin/main` passed: 0 violations across 3342 tracked files.
