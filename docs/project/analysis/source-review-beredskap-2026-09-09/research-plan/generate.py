#!/usr/bin/env python3
"""Regenerate dispatch documents from the versioned plan registry; --check is read-only."""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO_PREFIX = 'docs/project/analysis/source-review-beredskap-2026-09-09/research-plan'


def outputs():
    registry = json.loads((ROOT / 'work-packages.json').read_text())
    coverage = json.loads((ROOT / 'coverage.json').read_text())
    gaps = {g['id']: g for g in coverage['gaps']}
    files = {}
    for b in registry['packages']:
        lines = [f"# {b['id']} — {b['title']}", '',
                 'Kopier oppdraget til en agent eller egen sesjon. Koordinator fyller først inn kjøringsidentitet og isolert worktree.', '',
                 '## Oppdrag', '',
                 f"Du er ansvarlig for **{b['id']}** i beredskapsprogrammet. Les først `{REPO_PREFIX}/FELLES-KONTRAKT.md` og prosjektets `AGENTS.md`. Kontrakten er del av dette oppdraget.", '',
                 'Koordinator tildeler: `programRunId`, `runId`, `planCommit`, `worktreePath` og privat artefaktrot. Ikke finn på at disse er tildelt. Modellen følger brukerens sesjonsvalg; avsluttende masterkontroll utføres separat med gpt-6-astra.', '',
                 f"**Avgrensning:** {b['scope']}", '', '## Spørsmål som skal besvares', '']
        lines += [f'{i}. {q}' for i, q in enumerate(b['questions'], 1)]
        lines += ['', '## Les før nye søk', '']
        lines += [f'- `{f}`' for f in b['inputs']]
        lines += ['', 'Bruk også kilde- og JSON-pekerne for dine gap i `research-plan/coverage.json`. Private råkilder må være faktisk tilgjengelige og hashkontrollerte; en referanse til en utilgjengelig fil gir ikke lesebevis.', '', '## Kildekanaler', '']
        lines += [f'- {s}' for s in b['sourceChannels']]
        lines += ['', '**Stoppregel:** ' + b['stopRule'], '', '## Ansvar og avhengigheter', '',
                  f"- Bølge: {b['wave']}.",
                  '- Må ha terminal, hashbundet retur fra: ' + (', '.join(b['dependsOn']) or 'ingen annen pakke') + '.',
                  '- Samordne grenseflater med: ' + (', '.join(b['coordinationWith']) or 'koordinator') + '.',
                  '- Kandidatområder: ' + (', '.join(b['candidateIds']) or 'tverrgående') + '.',
                  '- Formål: ' + (', '.join(b['purposeIds']) or 'tverrgående') + '.', '',
                  'Samordning er ikke en skjult startavhengighet. Bruk koordinator for grenseflater; ikke vent gjensidig. Manglende opplysninger blir eksplisitte gap. Nye opplysninger etter levering behandles i ny kjøring.', '', '## Eide gapreferanser', '']
        lines += [f"- **{gid}** — {gaps[gid]['question']}" for gid in b['ownedGapIds']] or ['Ingen egen historisk gap-ID. Oppdraget dekker tverrgående kapittel-/proveniensbehov; det er ikke en tillatelse til å utvide scope.']
        lines += ['', '## Returkrav', '',
                  'Lever `findings.md`, `sources.json`, `observations.json`, `gaps.json`, `search-log.json`, `handoff.json` og `verification.json` i den unike kjøringsmappen angitt i felleskontrakten. Bruk `research-plan/templates/`. Lever kode og frosne input når du beregner noe. Legg råkilder utenfor Git.', '',
                  'Hvert spørsmål får svar eller presist stopp. Hver eid gap-ID får en begrunnet disposisjon. Alle påstander bindes til eksakt kildeversjon, lokator, evidens, målprofil og policy. Ingen oppdiktede tall, lesebevis eller human review.', '',
                  b['sizeRule'], '',
                  'Leveransen skal kunne etterprøves direkte av Astra i M-ASTRA. Ikke endre tidligere runder, planregister, kanoniske data eller readiness. Ikke send henvendelser eller publiser. Oppdraget er ferdig når en kontrollert retur eller et dokumentert stopp er levert; det betyr ikke at et kunnskapshull er løst.', '']
        files[f"prompts/{b['id']}.md"] = '\n'.join(lines)
    lines = ['# Researchplan for beredskap — utdeling og Astra-master', '',
             'Planen deler alt registrert kartleggingsarbeid i beredskapssporet i **20 oppdrag** som kan gis til forskjellige agenter og sesjoner. Den avsluttes med en egen fullstendig mastervalidering med **gpt-6-astra**.', '',
             'Omfanget er C1–C5, P1–P5, opprinnelige A1–A5-gap, oppfølgingsgap gjennom runde 006 og disponeringen av hvitbokens 15 kapitler. De 30 historiske FS-punktene avgrenser research fra implementering og menneskelig autoritet. Dette er ikke en ny kartlegging av hele applikasjonen.', '',
             '**Status: planlagt. Ingen nye researchsesjoner eller Astra-runde er startet av denne planen.** Grunnlag: `4026a90d62edf129d4323f7f0971ace716b03983`, datert 9. september 2026. Historiske statusfelt er ikke oppdaterte verifikasjoner.', '',
             '## Slik deles arbeidet ut', '',
             '1. Les [felleskontrakten](FELLES-KONTRAKT.md) og velg en pakke nedenfor. Koordinator oppgir programRunId, unik runId, plan-commit, eget worktree og privat artefaktrot. Kopier hele pakkeprompten til sesjonen.',
             '2. Start uavhengige pakker i bølge 1 etter tilgjengelig kapasitet. En praktisk første gruppe er B01–B03, deretter B04–B06. B07/B08 bør også tas tidlig fordi B09 avhenger av dem. Dette er prioritering, ikke en sperre for de øvrige uavhengige pakkene.',
             '3. Kjør B09 etter terminal retur fra B07/B08. Kjør B20 etter terminal retur fra B01–B19. Dokumenterte kilde-/eierstopp teller som returer, men gir ikke faglig dekning for en syntese.',
             '4. Kontroller returformat og frys et [masterinntak](templates/master-intake.json) med alle 20 leveranser, eksakte hashes og avhengigheter. Råkilder skal være tilgjengelige for master på autorisert måte.',
             '5. Start en egen sesjon med modellen **gpt-6-astra** og [masteroppdraget](MASTER-ASTRA.md). Astra leser originalpassasjer, rekjører beregninger og gir et begrunnet utfall for hver påstand.',
             '6. Eventuelle returer får nye kjørings-ID-er og et nytt frosset inntak. Endrede kilde-/påstandsbindinger krever ny kontroll. Menneskelig vurdering, kanonisk promotering og publisering ligger utenfor programmet.', '',
             'Bølge 1 har 18 uavhengige pakker. De kan fordeles over mange sesjoner; samtidig kjøring er valgfritt. B19 gjør først en selvstendig gjennomgang av eksisterende proveniens. Inngående leveranser kontrolleres deretter av koordinator og Astra, slik at B19 og B20 ikke venter på hverandre.', '',
             '## Oppdrag som kan deles ut', '',
             '| Pakke | Oppdrag/prompt | Bølge | Krever retur fra | Eide gap-ID-er |',
             '|---|---|---:|---|---:|']
    for b in registry['packages']:
        lines.append(f"| {b['id']} | [{b['title']}](prompts/{b['id']}.md) | {b['wave']} | {', '.join(b['dependsOn']) or '—'} | {len(b['ownedGapIds'])} |")
    lines += ['', '## Dekning og avgrensning', '',
              '[Gap- og kapittelkartet](GAP-KART.md) viser eier for alle **92 historiske gapreferanser**. Foreldre og senere presiseringer overlapper; dette er ikke 92 uavhengige kunnskapshull eller en ferdigprosent. Planen hevder ikke at gapene er lukket.', '',
              'B18 dekker relevant markeds- og kostnadsbakgrunn. B19 dekker kildeidentitet, rettigheter og proveniens. De har ikke egne arvede gap-ID-er. B20 dekker syntese og betingede anbefalinger. Kapittel 15 er en eksplisitt menneskelig beslutning; research gir eventuelt underlag, ingen KI-godkjenning.', '',
              '## Filer og kontroll', '',
              '- [Arbeidskontrakt](FELLES-KONTRAKT.md): kilder, lagring, returkrav, stopp og autoritet.',
              '- [Astra-master](MASTER-ASTRA.md): inngangskontroll, full påstandsvurdering og returrunde.',
              '- [Returmal](templates/handoff.json), [kildemal](templates/source.json), [påstandsmal](templates/observation.json), [gapmal](templates/gap.json), [mastervurdering](templates/master-review.json).',
              '- [Pakkeregister](work-packages.json), [dekningsregister](coverage.json) og [frosset inputmanifest](input-manifest.json) er maskinlesbare.', '',
              'Fra repository-roten:', '', '```sh',
              f'python3 {REPO_PREFIX}/generate.py --check',
              f'python3 {REPO_PREFIX}/verify.py', '```', '',
              '`build-registers.py` kontrollerer at registrene kan gjenskapes fra det frosne grunnlaget; eksplisitt `--write` regenererer dem. `generate.py` regenererer README, GAP-KART og pakkeprompter fra registrene. `verify.py` kontrollerer planstruktur, eierskap, kildepekere, avhengigheter og frosne historiske filer. Kontrollen validerer planens integritet, ikke forskningsfunn eller en utført Astra-runde. Private historiske baselines kontrolleres lokalt når de er tilgjengelige, og rapporteres ellers som ikke verifisert.', '']
    files['README.md'] = '\n'.join(lines)
    lines = ['# Gap- og kapittelkart', '', 'Generert fra `coverage.json` og `work-packages.json`. Alle tall beskriver registrering/dekning i planen. Ingen gap er lukket gjennom denne tildelingen.', '', '## Historiske gapreferanser', '', '| Gap-ID | Eier | Spørsmål | Opprinnelig kilde og JSON-peker |', '|---|---|---|---|']
    for g in coverage['gaps']:
        q = g['question'].replace('|', '\\|').replace('\n', ' ')
        lines.append(f"| {g['id']} | [{g['primaryPackageId']}](prompts/{g['primaryPackageId']}.md) | {q} | `{g['sourcePath']}` `{g['jsonPointer']}` |")
    lines += ['', '## Hvitbokens kapitler', '', '| Kapittel | Tittel | Pakker | Disposisjon |', '|---:|---|---|---|']
    for c in coverage['chapters']:
        lines.append(f"| {c['chapter']} | {c['title']} | {', '.join(c['ownerPackages']) or 'Menneskelig beslutning'} | {c['disposition']} |")
    lines += ['', '## Grense mot øvrige prosjektoppgaver', '', 'FS-status er historisk og ikke verifisert på nytt. Bare angitt researchdel inngår. Implementering og eksterne autoritetsporter må behandles separat.', '', '| ID | Historisk oppgave | Researchpakker | Avgrensning |', '|---|---|---|---|']
    for o in coverage['operationalBoundary']:
        lines.append(f"| {o['id']} | {o['title']} | {', '.join(o['researchPackages']) or 'Utenfor researchprogrammet'} | {o['disposition']} |")
    lines += ['', '## Formål', '', '| ID | Spørsmål |', '|---|---|']
    for purpose in coverage['purposes']:
        lines.append(f"| {purpose['id']} | {purpose['question']} |")
    files['GAP-KART.md'] = '\n'.join(lines) + '\n'
    return files


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    stale = []
    for name, content in outputs().items():
        target = ROOT / name
        if args.check:
            if not target.exists() or target.read_text() != content:
                stale.append(name)
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(content)
    if stale:
        raise SystemExit('Stale generated files: ' + ', '.join(stale))
    print('22 generated documents verified' if args.check else '22 documents generated')


if __name__ == '__main__':
    main()
