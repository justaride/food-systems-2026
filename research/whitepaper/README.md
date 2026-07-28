---
tittel: Whitepaper — kanonisk redaksjonell sti
dato: 2026-07-15
status: intern redaksjonell kontrakt
gate: internal
canonical_master: research/whitepaper/food-systems-2026-synthesis-v2.md
publication_surface: content/hvitbok
---

# Whitepaper — kanonisk redaksjonell sti

## Kanonisk beslutning

Det kanoniske **mastermanuset** er
[food-systems-2026-synthesis-v2.md](./food-systems-2026-synthesis-v2.md).
Det samler systemgrense og metode, Norge/Norden-analysen, sirkularitet og
N/P/K, kjente kunnskapshull, roadmap/videreføring og synlige menneskeporter.

Den kanoniske **publikasjonsflaten** er
[content/hvitbok](../../content/hvitbok/). Kapittelrekkefølge og ruting styres av
[src/lib/hvitbok/chapters.ts](../../src/lib/hvitbok/chapters.ts). App-kapitlene
er sekundære publikasjonsuttrekk og skal spores til mastermanuset, ikke utvikle
en uavhengig fortelling.

Dette betyr ikke at v2 eller app-kapitlene er eksternt godkjent eller
claim-locket. V2 er merket intern-syntese-til-godkjenning og
ekstern_sitering: false; alle tre registrerte app-kapitler er merket Utkast.

Gjeldende lokale godkjenningsutkast for programretningen er:
[roadmap-food-tg-2026-2029-v0.2-draft.md](../../docs/project/mandates/roadmap-food-tg-2026-2029-v0.2-draft.md).
Roadmapen er et retningsdokument med porter, ikke et funnregister, og skal ikke
kopieres inn som om uvaliderte case er vedtatt. V0.2 er fortsatt en kontrollert
intern draft; v0.1 bevares som historisk basis.

Gjeldende ferdigstillingsdelta står i [gap-list.md](./gap-list.md), og samlet
prosjektstatus står i
[completion register](../../docs/project/status/food-systems-completion-register-2026-07-15.md).

## Filroller

| Fil / sti | Rolle fra 2026-07-15 | Kan publiseres direkte? |
|---|---|---|
| [food-systems-2026-synthesis-v2.md](./food-systems-2026-synthesis-v2.md) | Kanonisk mastermanus og redaksjonell/faglig godkjenningsflate | Nei. Status er intern syntese; [I]- og [H]-rader stopper før ekstern bruk. |
| [content/hvitbok](../../content/hvitbok/) | Sekundære app-/publikasjonsuttrekk fra mastermanuset | Nei. Kapitlene er utkast og må spores til v2, gjennom gjeldende claim-gater og menneskelig godkjenning. |
| [chapters.ts](../../src/lib/hvitbok/chapters.ts) | Publikasjonsregister og rekkefølge | Nei. Registrering er ruting, ikke evidensstatus. |
| [roadmap v0.2 draft](../../docs/project/mandates/roadmap-food-tg-2026-2029-v0.2-draft.md) | Gjeldende lokalt M16-godkjenningsutkast med eksplisitte porter | Nei. Formell godkjenning, partnerrespons og programforankring mangler. |
| [roadmap v0.1](../../docs/project/mandates/roadmap-food-tg-2026-2029-v0.1.md) | Historisk basis for v0.2 | Nei. Bevares som proveniens, ikke gjeldende redaksjonell autoritet. |
| [continuation plan](../../docs/project/mandates/continuation-plan-food-tg-2026.md) | Gjeldende lokalt M18-beslutningsutkast | Nei. Organisatorisk hjem, eier, budsjett og finansiering er åpne. |
| [adoption-track.md](../evidence-pack/adoption-track.md) | Internt v2.0-derivat for mulig anvendelse etter porter | Nei. Autoriserer ikke outreach, policyposisjon, pilot eller søknad. |
| [food-systems-2026-draft-v1.md](./food-systems-2026-draft-v1.md) | Legacy langt manus fra mars 2026; kilde til disposisjon og formuleringer | Nei. Ikke kanonisk og ikke oppdatert mot senere R13/R14-kontroller. |
| [food-systems-2026-draft-v1-reviewed.md](./food-systems-2026-draft-v1-reviewed.md) | Byte-identisk legacy-kopi av filen over | Nei. Filnavnet reviewed dokumenterer ingen faktisk reviewed-delta. |
| [section-7-circular-food-systems.md](./section-7-circular-food-systems.md) | Frakoblet legacy-sirkularitetsutkast og proveniens for v2 kapittel 8 | Nei. V2 er den kanoniske syntesen; originalen er ikke en parallell faktastemme. |
| [executive-brief.md](./executive-brief.md) | Datert, kort beslutningsderivat av v2 | Nei. Mottaker, delingsnivå og relevante menneske-/publiseringsporter må godkjennes. |
| [gap-list.md](./gap-list.md) | Nåværende completion delta | Nei. Operativ status, ikke whitepapertekst. |

## De to legacy-utkastene

[food-systems-2026-draft-v1.md](./food-systems-2026-draft-v1.md) og
[food-systems-2026-draft-v1-reviewed.md](./food-systems-2026-draft-v1-reviewed.md)
har samme SHA-1:

    22cfee4b2afa9deb8123021b28f3422ca0ed77ec

De er dermed byte-identiske. Overskriften i begge sier Draft v1.1 — reviewed,
men den ene filen representerer ikke en senere eller mer godkjent versjon enn
den andre. Begge bevares som proveniens/legacy og skal ikke brukes som
redaksjonell autoritet.

Ingen av filene slettes i denne konsolideringen. Historikken er nyttig, men
statusen må være entydig.

## Det frakoblede sirkularitetskapitlet

[section-7-circular-food-systems.md](./section-7-circular-food-systems.md) er
merket komplett utkast fra 2026-03-30, men var frakoblet legacy-manuset og
app-kapitlene. V2 kapittel 8 har nå gjort den lokale syntesejobben mot nyere
waste-/VK4-underlag, med eksplisitt skille mellom realisert, modellert,
kapasitet, plan og potensial.

Originalfilen bevares som datert proveniens. Den skal ikke brukes som
redaksjonell autoritet, og app-uttrekk skal hentes fra v2 og kontrolleres mot de
underliggende kildene.

## Obligatorisk redaksjonell rekkefølge

1. **Faglig/redaksjonell godkjenning av v2:** gå gjennom statuskodene [K], [F],
   [I] og [H], kildekartet og godkjenningssiden.
2. **Claim-hygiene:** bekreft at supersederte aktive tall er borte. HHI 3445
   skal ikke brukes som gjeldende omsetnings-HHI; kontrollert referanse er HHI
   3327, med CR3 96,6 prosent som egen størrelse.
3. **Menneskestemme og nordisk validering:** sett inn bare godkjente sitater og
   dokumentert partnerrespons; behold ulukkede porter som porter.
4. **Publikasjonsuttrekk:** oppdater app-kapitlene fra godkjente deler av v2 og
   dokumenter kapittel-til-master-sporbarhet.
5. **Publiseringskontroll:** kjør relevante citable-, overclaim- og
   source-locator-gater, app-readback og eventuell PDF-kontroll.
6. **Eiergodkjenning:** publiser først når faglig, juridisk og programmatisk
   godkjenning er eksplisitt dokumentert.

## Ikke bruk

- Ikke velg den reviewed-navngitte legacy-filen som kanon bare på grunn av
  filnavnet.
- Ikke kopier legacy-tall inn i app-kapitlene uten kontroll mot gjeldende
  acceptance tests og kontrollerte kilder.
- Ikke bruk frakoblet section 7 som ferdig ekstern faktastemme.
- Ikke bruk app-kapitlene som en uavhengig sannhetskilde ved siden av v2.
- Ikke la kapittelstatus Utkast bli tolket som godkjent, partner-validert eller
  publiseringsklart.
- Ikke opprett et nytt langt manus ved siden av v2. Hvis en samlet PDF trengs,
  skal den genereres fra eller bygges eksplisitt på v2.
