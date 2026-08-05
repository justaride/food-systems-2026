# NOTAT — locatorer for AP-10

**Dato:** 2026-08-04

**Status:** Provisorisk locator- og rettighetsnotat. Ingen kildebytes er lastet ned, og ingen kø-, register-, database- eller evidence-pack-felt er endret.

## Metode og avgrensning

AP-10-køen har 29 rader:

- 11 rader med `state=missing` og privat capture tilgjengelig lokalt, men med `privateCaptureRightsState=pending_not_cleared`.
- 18 rader med `state=no_locator`, uten privat capture.

Det er søkt etter offentlige, stabile locators på institusjonelle sider, DOI-/URN-locators og offisielle rapportportaler. Et treff betyr ikke at repository-restaurering eller gjenbruk er godkjent. Rettighetsstatus er derfor ført som en separat gate.

## Oppdatert kontroll 2026-08-04

- **ETMV 2024:** Den eksakte offentlige kildidentiteten er nå bundet til
  Ruokavirastos offisielle PDF *Elintarvikemarkkinavaltuutetun
  toimintakertomus 2024* (18 sider). Dette lukker locator-usikkerheten, men
  ikke rettighets- eller restore-gaten. [Offisiell ETMV-PDF](https://www.ruokavirasto.fi/globalassets/etmv/etmv-toimintakertomus-2024.pdf)
- **Bornholm-oppgaven:** Det offentlige speilet identifiserer forfatteren som
  Vicente Bueso Bordils, veilederne Michael Søgaard Jørgensen og Stig Hirsbak,
  og dato June 2021. Søk mot AAU-/institusjonelle treff ga ikke en autoritativ
  studentrecord eller fulltekstlocator for akkurat denne tittelen. Et offentlig
  ISWM-verktøy knytter samtidig forfatteren til Aalborg University in Copenhagen
  og BOFA, men uten å registrere denne oppgaven som en institusjonell post.
  En ny målrettet kontroll mot AAU-prosjekt-/forskningsflater, AAU-biblioteksøk
  og danske studentarkiv ga fortsatt ingen treff på den eksakte tittelen eller
  forfatteren. Dette styrker stoppkonklusjonen, men beviser ikke at en lukket
  eller ikke-indeksert institusjonell post ikke finnes.
  ReadKong beholdes derfor som et mulig innholds-/identitetsspor, ikke som
  rettighets- eller restorebevis. [Foreløpig speiltreff](https://www.readkong.com/page/sustainable-cities-master-thesis-study-on-food-waste-2630599), [offentlig ISWM-verktøy](https://www.imp.gda.pl/wasteman/EN/artykuly/ISWM%20Toolbox_fin.pdf)
- **`source_doc:src-78`:** Konkurrensverkets offisielle rapport 2024:4 omtaler
  uttrykkelig Sveriges 290 kommuner og lokale dagligvarekonkurranse, men dette
  er fortsatt ikke tilstrekkelig tittelbinding til den interne locatoren
  *Nærmeste konkurrent-analyse: 290 kommuner*. Identiteten holdes separat.
  [Konkurrensverket rapport 2024:4](https://www.konkurrensverket.se/informationsmaterial/rapportlista/dagligvaruhandelns-etablering-i-kommunerna/)

## 1. Missing — privat capture tilgjengelig, rettigheter ikke klarert

Alle de 11 radene har samme operative neste steg: den private capture-en kan brukes i kontrollert intern arbeidsflyt for å lage content-bound full-text receipt, men repository-restaurering må avgjøres separat. Ingen av disse capture-ene ble åpnet, kopiert eller lastet ned i denne arbeidspakken.

| identityKey | Tittel | Offentlig locator / funn | Restaureringsverdi | Rettighets-/neste steg |
|---|---|---|---|---|
| `document:cmppajyqy0002njvmeo5z64yk` | Circular food systems: a content and discourse analysis | [KTH DiVA-record](https://kth.diva-portal.org/smash/record.jsf?pid=diva2%3A1802630), URN `urn:nbn:se:kth:diva-337665` | Høy | Studentoppgave med åpen fulltekst i DiVA; bekreft lisens og om lokal lagring/derivat er tillatt. |
| `document:cmppajyr60004njvmkuyujbnd` | How food companies operating in Finland translate circular economy principles into business model innovation | [Södertörn DiVA fulltekst](https://sh.diva-portal.org/smash/get/diva2%3A2041632/FULLTEXT01.pdf) | Høy | Masteroppgave; bekreft DiVA-/forfattervilkår før repository-lagring. |
| `document:cmppajyrr0008njvm72f0l3n2` | Study on food waste streams and creation of circular solutions on Bornholm | [ReadKong-kopi som foreløpig treff](https://www.readkong.com/page/sustainable-cities-master-thesis-study-on-food-waste-2630599) | Middels/lav | Ikke funnet en autoritativ institusjonell fulltekstlocator i denne runden. Finn original institusjon/forfatterarkiv før restaurering; ikke bruk speil som rettighetsbevis. |
| `document:cmppajyrz000anjvm40x9zv8t` | Impact of food retail market power on small food producers in Sweden: Challenges and opportunities | [Beijer-publikasjonsside](https://beijer.kva.se/publication/impact-of-food-retail-market-power-on-small-food-producers-in-sweden-challenges-and-opportunities/) og [SLU fulltekstlocator](https://pub.epsilon.slu.se/39994/1/lundberg-e-et-al-20260430.pdf) | Høy | Artikkelen er publisert med CC BY-NC-ND-opplysning i funnet; bekreft at lokal arkivering følger vilkårene og ikke innebærer ulovlig bearbeiding. |
| `document:cmppajys2000bnjvm18kstw5z` | Circular economy in the food and retail industry: a case study of ICA | [Uppsala DiVA fulltekst](https://uu.diva-portal.org/smash/get/diva2%3A938165/FULLTEXT01.pdf) | Middels/høy | Masteroppgave; bekreft postens record-side og lisens før restore. |
| `document:cmppajyu3000onjvmqmv7ycxt` | Policy tools for sustainable and healthy eating | [Nordic Council publication](https://www.norden.org/en/publication/policy-tools-sustainable-and-healthy-eating), [NordPub fulltekst](https://pub.norden.org/nord2024-007/about-this-publication.html), DOI `10.6027/nord2024-007` | Høy | Offentlig Nord 2024:007. Bekreft repository-policy, men offentlig rapportlocator er stabil. |
| `document:cmppajyue000rnjvmxrad483t` | Elintarvikemarkkinavaltuutetun toimintakertomus 2024 | [Offisiell ETMV-PDF](https://www.ruokavirasto.fi/globalassets/etmv/etmv-toimintakertomus-2024.pdf) | Høy | Eksakt rapport og tittel er bundet. Bekreft lisens og lokal lagring/derivat separat før restore. |
| `document:cmppajyvb0012njvmnphhze07` | UNESCO Biosphere Reserves — A Path to Local Holistic Sustainability | [NordPub om publikasjonen](https://pub.norden.org/nord2024-023/about-this-publication.html), DOI `10.6027/nord2024-023` | Høy | Offentlig Nord 2024:023. Merk at gammel intern filsti bruker et annet alias; identitet må ikke auto-fusjoneres. |
| `document:cmppajyve0013njvmw7zok4yr` | Beyond Zero — Nordic Architecture on the Road Towards Renewed Practices | [NordPub om publikasjonen](https://pub.norden.org/nord2025-010/about-this-publication.html), [offisiell PDF](https://pub.norden.org/nord2025-010/nord2025-010.pdf), DOI `10.6027/nord2025-010` | Høy | Offentlig Nord 2025:010. Publikasjonen oppgir egne foto-/designkrediteringer; repository-lagring må respektere disse og eventuell separat fotolisens. |
| `document:cmppajyxz001snjvmjzin1ww1` | Konkurrensverket rapport 2025:5 — livsmedelsutredningen | [Konkurrensverket, evaluering av LOH](https://www.konkurrensverket.se/informationsmaterial/rapportlista/utvardering-av-lagen-om-forbud-mot-otillborliga-handelsmetoder/) | Høy | Offisiell rapportside funnet. Bekreft PDF-identitet, tilgangsmetadata og at eventuell lokal kopi følger myndighetens vilkår. |
| `document:cmppajyyw0021njvmam1pbay7` | KFST Evaluering af foedevarehandelsloven 2024 | [KFST offisiell PDF](https://kfst.dk/media/3wxbfqqe/20241120-evaluering-af-foedevarehandelsloven-2024.pdf) | Høy | Offentlig dansk myndighetsrapport. Bekreft dokumentmetadata og lokal lagring/attribution før restore. |

## 2. No locator — offentlig locatorjakt

| identityKey | Tittel | Resultat | Locator | Konfidens / neste steg |
|---|---|---|---|---|
| `report:food-systems-2026-internal-artifact-register` | Food Systems 2026 interne metode- og figurartefakter | Internt prosjektmateriale, ikke offentlig kilde | Ingen offentlig locator funnet | Høy sikkerhet på at intern eier-/pakkeavklaring kreves. Ikke behandle som ekstern evidens. |
| `report:food-systems-2026-pilot-funding-dossiers` | Food Systems 2026 pilot- og finansieringsdossierer | Internt prosjektmateriale, ikke offentlig kilde | Ingen offentlig locator funnet | Krever intern source package/eier. Ikke gjenopprett fra søkemotor eller relatert tekst. |
| `report:future-nordic-diets-tn2017-566` | Future Nordic Diets | Offisiell rapport funnet | [Nordic Council](https://www.norden.org/en/publication/future-nordic-diets), [DOI](https://doi.org/10.6027/TN2017-566), [DiVA PDF](https://norden.diva-portal.org/smash/get/diva2%3A1163192/FULLTEXT01.pdf) | Høy. Hold denne identiteten separat fra `source_doc:src-182` inntil en eier godkjenner eventuell deduplisering. |
| `report:konkurrensverket-etablering-2026` | Åtgärder för att förbättra förutsättningarna för etablering av dagligvarubutiker | Offisiell rapportside og PDF funnet | [Konkurrensverket rapport 2024:4](https://www.konkurrensverket.se/informationsmaterial/rapportlista/dagligvaruhandelns-etablering-i-kommunerna/), [PDF](https://www.konkurrensverket.se/globalassets/dokument/informationsmaterial/rapporter-och-broschyrer/rapportserie/rapport_2024-4.pdf) | Høy. Bekreft at lokal tittel/år samsvarer med PDF-identiteten før binding. |
| `report:konkurrensverket-lonsamhet-2025` | Lönsamheten i livsmedelsindustrin, dagligvaruhandeln och dess grossister | Offisiell rapportside og PDF funnet | [Konkurrensverket rapport 2025:3](https://www.konkurrensverket.se/informationsmaterial/rapportlista/lonsamheten-i-livsmedelsindustrin-dagligvaruhandeln-och-dess-grossister/), [PDF](https://www.konkurrensverket.se/globalassets/dokument/informationsmaterial/rapporter-och-broschyrer/rapportserie/rapport_2025-3.pdf) | Høy. Bekreft lokal tittelbinding og myndighetsvilkår. |
| `report:solutions-menu-2018` | Solutions Menu | Offisiell Nordic Council-publikasjon funnet | [Nordic Council publication](https://www.norden.org/en/publication/solutions-menu-nordic-guide-sustainable-food-policy), [informasjonsside](https://www.norden.org/en/information/solutions-menu), [DiVA PDF-locator](https://norden.diva-portal.org/smash/get/diva2%3A1214792/FULLTEXT01.pdf) | Høy. Den gamle publikasjonssiden er tilgjengelig igjen; bruk publikasjonsnummer 2018:786 som identitetsanker. |
| `source_doc:src-138` | Reitan Eiendom årsrapport 2024 | Offisiell digital årsrapportside funnet | [Reitan Eiendom årsrapport 2024](https://2024.reitaneiendom.no/) | Høy som landingslocator. Følg den offisielle siden til full rapport; ikke gjett PDF-URL. |
| `source_doc:src-141` | Konkurrensverket rapport 2025:5 — Utvärdering av lagen om förbud mot otillbörliga handelsmetoder | Offisiell rapportside funnet | [Konkurrensverket 2025:5](https://www.konkurrensverket.se/informationsmaterial/rapportlista/utvardering-av-lagen-om-forbud-mot-otillborliga-handelsmetoder/) | Høy. Dette er en offentlig locator, ikke en automatisk restore- eller rettighetskvittering. |
| `source_doc:src-142` | KFST Evaluering af foedevarehandelsloven 2024 | Offisiell PDF funnet | [KFST PDF](https://kfst.dk/media/3wxbfqqe/20241120-evaluering-af-foedevarehandelsloven-2024.pdf) | Høy. Bevar dansk tittel og separat identity key. |
| `source_doc:src-143` | Elintarvikemarkkinavaltuutetun toimintakertomus 2024 | Offisiell PDF med samsvarende tittel og år | [Offisiell ETMV-PDF](https://www.ruokavirasto.fi/globalassets/etmv/etmv-toimintakertomus-2024.pdf) | Høy for locator/identitet. Rights og restore må fortsatt avgjøres separat. |
| `source_doc:src-154` | Managing a Circular Food System in Sustainable Urban Farming | Offisiell institusjonell record og DOI funnet | [UTU repository](https://www.utupub.fi/items/decac4a3-04ca-43dd-b7fd-a9dabc46f8f5), [MDPI-artikkel](https://www.mdpi.com/2071-1050/13/11/6231), [URN](https://urn.fi/URN:NBN:fi-fe2021093048752), DOI `10.3390/su13116231` | Høy. Artikkelen er open access; bekreft lokal lagring/metadata før restore. |
| `source_doc:src-155` | Nested circularity in food systems: A Nordic case study on connecting biomass, nutrient and energy flows from field scale to continent | Offisiell forskningsportal, DOI og publisher-side funnet | [University of Helsinki record](https://researchportal.helsinki.fi/en/publications/nested-circularity-in-food-systems-a-nordic-case-study-on-connect/), [ScienceDirect](https://www.sciencedirect.com/science/article/pii/S0921344920305346), DOI `10.1016/j.resconrec.2020.105218` | Høy. Det finnes en separat correction-DOI; den skal ikke blandes inn uten metadatareview. |
| `source_doc:src-164` | Handlingsplan for en sirkulær økonomi 2024–2025 | Offisiell regjering-side og PDF funnet | [Regjeringen dokument](https://www.regjeringen.no/no/dokumenter/handlingsplan-for-en-sirkular-okonomi/id3029477/), [PDF](https://www.regjeringen.no/contentassets/0173313ba73941c6b5072c5a0ee27434/no/pdfs/handlingsplan-sirkulaer-okonomi.pdf) | Høy. Bevar norsk myndighetsidentitet og publikasjonskode T-1586 B. |
| `source_doc:src-182` | Future Nordic Diets: Exploring ways for sustainably feeding the Nordics | Offisiell rapport/DOI funnet | [Nordic Council](https://www.norden.org/en/publication/future-nordic-diets), [DOI](https://doi.org/10.6027/TN2017-566), [DiVA PDF](https://norden.diva-portal.org/smash/get/diva2%3A1163192/FULLTEXT01.pdf) | Høy. Sannsynlig identitetsduplikat med `report:future-nordic-diets-tn2017-566`; kun duplicate suspicion, ikke fusjon. |
| `source_doc:src-78` | Nærmeste konkurrent-analyse: 290 kommuner | Offisiell KKV-side og PDF-locator for rapport 2024:4 funnet, men lokal alias-tittel er ikke identisk med rapporttittelen | [KKV-side](https://www.konkurrensverket.se/informationsmaterial/rapportlista/dagligvaruhandelns-etablering-i-kommunerna/), [PDF](https://www.konkurrensverket.se/globalassets/dokument/informationsmaterial/rapporter-och-broschyrer/rapportserie/rapport_2024-4.pdf) | Middels for locator, åpen for endelig identitetsbinding. Bevar aliaset separat til eierkvittering eller eksplisitt metadatarevisjon. |
| `source_doc:src-93` | Beyond FLW Reduction Targets: Measuring and Valuing Food Loss and Waste | Offisiell OECD-side og DOI funnet | [OECD publication](https://www.oecd.org/en/publications/beyond-food-loss-and-waste-reduction-targets_59cf6c95-en.html), DOI `10.1787/59cf6c95-en` | Høy. Bruk OECD-recorden som identitetsanker; ikke rekonstruer lokal PDF fra annet speil. |
| `source_doc:src-94` | Feeding a Monster: Vest-afrikansk fiskemel i norsk laksefor | Offisiell Greenpeace-reportside og PDF-locator funnet | [Greenpeace reportside](https://www.greenpeace.org/africa/en/press/13778/major-european-companies-linked-to-food-insecurity-in-west-africa/), [rapport-PDF](https://www.greenpeace.org/static/planet4-africa-stateless/2021/05/47227297-feeding-a-monster-en-final-small.pdf) | Høy som offentlig locator, men rapportens egne påstander må holdes adskilt fra uavhengig evidens. Rettighets- og gjenbruksbetingelser må avklares før lokal kopi. |
| `thesis:tesdal-2013` | Nøkkelhull på matvarer — private aktørers økonomiske interesser og konsekvensene for myndighetenes merkeordning | Institusjonelle locator-kandidater funnet | [UiO DUO](https://www.duo.uio.no/handle/10852/34009), [NVA record](https://nva.sikt.no/registration/019c95276ac1-6b96ca8d-628e-4298-8215-1ec6f6b38579) | Middels. Tittelekvivalens og tilgang er plausible, men eksakt record/fulltekst må bekreftes uten speilnedlasting før restore. |

## Arbeidskonklusjon

Locatorjakt har gitt sterke, offentlige treff for de fleste eksterne kildene. De mest konkrete åpne punktene er:

1. ETMV 2024 er bundet til en eksakt finsk PDF; rights/restore-gaten står fortsatt.
2. Bornholm-oppgaven må spores til autoritativ institusjonell record i stedet for ReadKong-speilet.
3. `src-78` må ikke automatisk bindes til KKV 2024:4.
4. `report:future-nordic-diets-tn2017-566` og `source_doc:src-182` må holdes som separate identiteter inntil deduplisering er eiergodkjent.
5. Ingen offentlig locator opphever `privateCaptureRightsState=pending_not_cleared`.

Dette notatet er en locator- og beslutningsforberedende leveranse. Det er ikke en kildeimport, en evidensvurdering eller en rettighetsklarering.
