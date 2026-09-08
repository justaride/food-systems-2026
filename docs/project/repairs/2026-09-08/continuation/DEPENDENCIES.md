# Prisma-avhengigheter — kontrollert sikkerhetsoppdatering

8. september 2026. Prisma, klienten og PostgreSQL-adapteren beholdes på 7.9.1. To versjonsavgrensede npm-overstyringer oppdaterer `@prisma/config@7.9.1 → deepmerge-ts` til 8.0.2 og `prisma@7.9.1 → mysql2` til 3.24.4. Dette er en lokal kompatibilitetsbeslutning, ikke en påstand om at Prisma har sertifisert disse kombinasjonene. Ved neste Prisma-oppgradering må overstyringene vurderes på nytt; de gjelder bare de navngitte foreldreversjonene.

Bakgrunn: også stabile Prisma 7.10.0 låser de to gamle underavhengighetene. Npm sitt automatiske forslag om Prisma 6.19.3 er derfor ikke fulgt. Gjeldende latest-tag peker på en 8.0.0-forhåndsutgave.

## Omfang og kompatibilitet

Deepmerge 8 endrer blant annet dyp sammenslåing av Map-verdier og håndtering av `deepmergeInto`. Prisma-konfigurasjonen i dette prosjektet bruker vanlige objekter med skjema-, migrasjons- og PostgreSQL-innstillinger. Prisma bruker den offentlige `deepmerge`-funksjonen gjennom c12. Regresjonstesten laster en virkelig Prisma-konfigurasjon med denne avhengigheten, kontrollerer nested innstillinger og bevarer inputobjektene. En separat test gjenskaper to selvrefererende objektgrafer og kontrollerer at sammenslåingen avsluttes uten stack exhaustion.

MySQL2 inngår gjennom Prisma-verktøyet. Prosjektets databaseklient bruker PostgreSQL. MySQL-tilkobling er ikke funksjonstestet, og fravær av MySQL-bruk brukes ikke som begrunnelse for å skjule auditfunn.

Ren `npm ci`, Prisma-klientgenerering, `prisma validate`, tre kompatibilitetstester, TypeScript, målrettet ESLint og produksjonsbygg besto lokalt. Både `npm audit` og `npm audit --omit=dev` rapporterte null sårbarheter etter oppdateringen. CI og faktisk produksjonsversjon dokumenteres separat i leveranserapporten.

## Primærkilder

- [Deepmerge sikkerhetsvarsel](https://github.com/RebeccaStevens/deepmerge-ts/security/advisories/GHSA-ggr8-5vv4-36mx): rekursive objektgrafer før 8.0.0 kan gi stack exhaustion.
- [Deepmerge 8.0.0-endringer](https://github.com/RebeccaStevens/deepmerge-ts/releases/tag/v8.0.0): endrede Map-/mutasjonssemantikker og håndtering av sirkulære referanser.
- [MySQL2 komprimeringsvarsel](https://github.com/sidorares/node-mysql2/security/advisories/GHSA-rgwj-5xj2-c3m3): ubundet dekomprimering til og med 3.23.0; auditens påvirkede intervall er kontrollert mot den installerte 3.24.4.
- [MySQL2 3.24.4](https://github.com/sidorares/node-mysql2/releases/tag/v3.24.4).
