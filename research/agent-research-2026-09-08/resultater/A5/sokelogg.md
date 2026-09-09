# A5 – søkelogg

Dato: 2026-09-08
Søkene ble gjort mot åpne nettressurser. Ingen råfiler ble lastet ned eller lagret utenfor Git. Interne verktøyreferanser er ikke brukt som kildehenvisning i resultatene; URL og lesestatus er oppgitt i `data.json`.

## Målrettede søk og åpninger

| ID | Spørsmål | Søk/åpning | Resultat og lesestatus |
|---|---|---|---|
| A5-L001 | Q1 | `site:lovdata.no 2005-04-14-10 Norge Finland avtale økonomisk samarbeid artikkel 3 leveringsprotokoll` | Treff på hovedavtalen. Åpnet relevant avtaletekst; S001 `fulltekst_relevant_del`. |
| A5-L002 | Q1 | `"Norge Finland" kriseavtale protokoll matvarer leveringsforpliktelser` | Ingen matspesifikk protokoll. Treffene ga generell omtale eller hovedavtalen; `ikke_funnet_i_soket`. |
| A5-L003 | Q1 | `"Norway Finland" security of supply agreement food protocol` | Ingen relevant offentlig matprotokoll; `ikke_funnet_i_soket`. |
| A5-L004 | Q2 | `"Nordic Declaration" "security of supply" 2026 implementation` | Åpnet Government.se-deklarasjonen og norsk myndighetspressemelding; S006/S007 `fulltekst_relevant_del`. |
| A5-L005 | Q1 | Direkte åpning av `https://lovdata.no/dokument/TRAKTAT/traktat/2005-04-14-10` | Nettåpning returnerte 405 Method Not Allowed. Samme offentlige URL ble deretter lest som HTTP-strøm med vanlig brukeragent; relevant artikkeltekst ble kontrollert, ingen fil skrevet. |
| A5-L006 | Q1 | `site:lovdata.no/dokument/TRAKTAT "vare- og tjenestebyttet" protokoll Norge Finland` | Treff på samme hovedavtale; ingen separat sektorprotokoll. |
| A5-L007 | Q5 | `site:regeringen.ax nr57 2026 enskild rk1a försörjningsberedskap nordisk deklaration` | Ingen relevant aktuell tekst i søkeresultatene; `ikke_funnet_i_soket`. |
| A5-L008 | Q5 | `site:regeringen.ax "försörjningsberedskap" 2026 nordisk deklaration` | Treff på eldre/andre Åland-dokumenter, ikke aktuell deklarasjonstekst; `ikke_funnet_i_soket`. |
| A5-L009 | Q5 | `site:lagtinget.ax "Joint Nordic Declaration on Security of Supply" 2026 Åland` | Ingen relevant kopi; `ikke_funnet_i_soket`. |
| A5-L010 | Q5 | Søk på eksakt URL `https://www.regeringen.ax/sites/default/files/attachments/protocol/nr57-2026-enskild-rk1a.pdf` | Ingen alternativ relevant søkeresultatkopi. |
| A5-L011 | Q5 | Direkte åpning av Åland-PDF-en | Returnerte 403 Forbidden. S015 er derfor bare `metadata`; innholdet brukes ikke som bevis. |
| A5-L012 | Q1 | `site:lovdata.no/dokument/TRAKTAT/traktat/2005-04-14-10 mat matkorn mel matvarer` | Ingen matspesifikk protokoll eller vare-/mengdeoppføring; `ikke_funnet_i_soket`. |
| A5-L013 | Q1 | `site:finlex.fi/fi/valtiosopimukset elintarvike Norja 55/2006 sopimus pöytäkirja` | Treff på Finlex gjennomføringslov/register, ingen matprotokoll; `ikke_funnet_i_soket`. |
| A5-L014 | Q1 | `site:regjeringen.no "Norge og Finland" "matvarer" "leveranseforpliktelser"` | Ingen relevant offentlig protokoll; `ikke_funnet_i_soket`. |
| A5-L015 | Q1 | `site:um.fi "Norway" "food" "security of supply" bilateral agreement` | Ingen relevant bilateral matprotokoll; `ikke_funnet_i_soket`. |
| A5-L016 | Q3/Q4 | `site:regjeringen.no matvareberedskap transport kapasitet krise korn mel leveransetid`; `site:regjeringen.no "matvarer" "transportkapasitet" beredskap`; `site:regjeringen.no "receiving" allied reception supply lines Norway Finland transport preparedness`; `site:regjeringen.no "transport" "matvareberedskap" "beredskapslager"` | Treff på Meld. St. 9, Meld. St. 14, FFI og kornberedskap. Ingen matspesifikk nordisk transportavtale eller ledetid. |
| A5-L017 | Q2 | `site:regjeringen.no "Joint Nordic Declaration on Security of Supply"`; `site:regjeringen.no "Nordic Declaration on Security of Supply" 2 September 2026` | Åpnet norsk pressemelding S007; ingen separat norsk deklarasjonskopi utover omtalen. |
| A5-L018 | Q2/Q3/Q5 | Søk etter nåværende deklarasjonsimplementering, finansiering, transportøvelse og operativ status i Government.se, Regjeringen.no og Valtioneuvosto | Fant deklarasjonens planlagte 2027–2028-oppfølging, transportstrategi og Cold Response 26. Fant ingen matspesifikk leveranse, kontrakt eller finansiert mottakskapasitet. |
| A5-L019 | Q1 | `"Avtale mellom Norge og Finland" oppsigelse 2024 2026`; `"Sopimus" "Norjan" "55/2006" irtisanominen`; `site:finlex.fi 55/2006 Norja sopimus irtisanottu`; `site:lovdata.no/... oppsigelse` | Ingen relevant oppsigelses- eller endringsmelding funnet; gjeldende status etter 2026 er derfor et gap. |
| A5-L020 | Q1 | `site:finlex.fi/fi/valtiosopimukset "tavaroiden ja palvelujen vaihdon ylläpitämisestä" "pöytäkirja"`; `site:finlex.fi/fi/valtiosopimukset "Suomen ja Norjan" "sota- ja kriisitilanteissa"`; `site:regjeringen.no "Norge og Finland" "særskilte varer" beredskap`; `site:lovdata.no "Avtale mellom Norge og Finland" "protokoll" "krigs- og krisesituasjoner"` | Treff på 445/2006, traktatregister og HE 145/2025. Ingen offentlig matspesifikk protokoll. |
| A5-L021 | Q1 | `"Sopimusta ei olla sovellettu kertaakaan" Norja`; `"55/2006" "ei ole sovellettu"` | Treff på offisiell HE 145/2025 og sekundær gjengivelse. S005 registrert som `sokeutdrag`; påstanden er ikke løftet til fulltekststatus. |
| A5-L022 | Q1/Q5 | Direkte åpning og søk i Lovdata for `https://lovdata.no/LTI/lov/2011-12-16-65` | § 6 ble lest som relevant del: prioritering, omfordeling, leverings-/produksjonspålegg, lager/transportopplysninger og øvelser. S013 `fulltekst_relevant_del`. |
| A5-L023 | Q3 | `find`-søk etter `food` i transportstrategien S008 | Ingen treff. Dette støtter avgrensningen at strategien ikke er matspesifikk; ikke et bevis på fravær av all matrelevans. |
| A5-L024 | Q4 | `find`-søk etter `civilian`, `supply` og prioriterings-/kapasitetsavsnitt i S008 | Relevante treff om dual-use, militær/sivil belastning, flaskehalser og videre kapasitetsanalyse; S008 `fulltekst_relevant_del`. |

## Åpnede originalkilder

- Lovdata-avtalen S001: relevant fulltekst lest etter 405 ved første nettåpning.
- Finlex 445/2006 S002 og traktatregister S004: relevante register-/lovopplysninger lest.
- Government.se-deklarasjonen S006: hele relevante deler åpnet, inkludert ikke-bindende klausul og oppfølgingspunkter.
- Regjeringen.no-pressemelding S007: relevante deler om signering og videre arbeid åpnet.
- Transportstrategien S008 og finsk myndighetsmelding S009: relevante sider/avsnitt åpnet og lest.
- Meld. St. 9 S010, Meld. St. 14 S011, FFI S012, næringsberedskapsloven S013 og Prop. 1 S S014: relevante avsnitt åpnet og lest.
- Åland S015: bare URL/tilgang kontrollert; dokumentet er ikke lest.

## Ikke utført

- Ingen kontakt med dataeiere, myndigheter eller andre personer.
- Ingen innkjøp, innlogging eller omgåelse av tilgangsbegrensning.
- Ingen import, publisering eller endring av andre filer.
- Ingen råfiler lastet ned eller oppbevart privat.
