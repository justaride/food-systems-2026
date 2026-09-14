#!/usr/bin/env python3
"""Generate a dated, candidate-only follow-up queue from frozen worker returns.

No source acquisition, database access, historical mutation or review decision.
"""
import argparse
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
BASE = ROOT / 'docs/project/analysis/source-review-beredskap-2026-09-09'
RUN = BASE / 'research-runs/20260909-beredskap-wave1'


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(path):
    return json.loads(path.read_text())


def outputs():
    coordinator = load(RUN / 'coordinator.json')
    intake_path = RUN / 'M-ASTRA/master-intake-corrections-002.json'
    intake = load(intake_path)
    returns = {w['packageId']: w for w in intake['workerReturns']}
    items = []
    for package in sorted(returns):
        # Select by exact latest intake path and hash, never glob recency.
        paths = [ROOT / returns[package]['handoffPath']]
        paths = [p for p in paths if digest(p) == returns[package]['handoffSha256']]
        if len(paths) != 1:
            raise ValueError(f'Expected one frozen return for {package}')
        handoff_path = paths[0]
        h = load(handoff_path)
        gaps_path = handoff_path.parent / 'gaps.json'
        g = load(gaps_path)
        rows = []
        for key in ('gaps', 'ownedGaps', 'newSubGaps'):
            for row in g.get(key, []):
                if not isinstance(row, dict) or not row.get('gapId'):
                    raise ValueError(f'Invalid gap in {gaps_path}')
                rows.append({
                    'gapId': row['gapId'],
                    'originalGapId': row.get('originalGapId'),
                    'referenceCorrection': row.get('referenceCorrection'),
                    'question': row.get('question'),
                    'dataOwnerRole': row.get('dataOwnerRole'),
                    'requiredDocument': row.get('requiredDocument'),
                    'missingFields': row.get('missingFields', []),
                    'nextAction': row.get('nextAction'),
                    'stopReason': row.get('stopReason'),
                    'overlapWithGapIds': row.get('overlapWithGapIds', []),
                    'sourceDisposition': row.get('disposition'),
                    'semanticGapClosed': False,
                    'human_verified': False,
                })
        items.append({
            'packageId': package,
            'workerStatus': h['status'],
            'handoffPath': str(handoff_path.relative_to(ROOT)),
            'handoffSha256': digest(handoff_path),
            'gapsPath': str(gaps_path.relative_to(ROOT)),
            'gapsSha256': digest(gaps_path),
            'intakeStatus': 'unsent_internal_preparation',
            'recipientName': None,
            'recipientEmail': None,
            'contactAuthorized': False,
            'researchRestartRule': 'Only a concrete new document or authorized owner return; preserve prior stops.',
            'gaps': rows,
        })
    assert len(items) == 20
    assert len({r['packageId'] for r in items}) == 20
    queue = {
        'schema': 'food-systems-followup-queue/v1',
        'asOf': '2026-09-09',
        'basis': 'Latest hash-bound worker returns selected by corrections intake 002; master scientific review remains separate.',
        'intakePath': str(intake_path.relative_to(ROOT)),
        'intakeSha256': digest(intake_path),
        'authority': 'internal_preparation_only',
        'workerStatusMix': coordinator['masterIntake']['statusMix'],
        'gapCountingRule': 'Rows include overlapping historical references and new subgaps; not unique knowledge holes.',
        'coordinatorPath': str((RUN / 'coordinator.json').relative_to(ROOT)),
        'coordinatorSha256': digest(RUN / 'coordinator.json'),
        'human_verified': False,
        'readinessChanged': False,
        'contactsSent': False,
        'packages': items,
    }
    lines = ['# Kilde- og dataeierbehov etter de 20 researchreturene', '',
             '9. september 2026. Internt og usendt. Ingen mottaker er valgt, ingen kontakt er sendt, og ingen eier er tildelt ansvar.', '',
             'Dette er en sporbar uttrekking fra returene i siste rettelsesinntak 002, inkludert rettede avhengigheter og B19s frakobling fra FS-03. Masterkontrollens faglige vurderinger må leses i tillegg. Fem pakker meldte ferdig innenfor oppdraget, elleve ventet på dataeier og fire på konkrete kilder. Dette er ikke en faglig ferdigprosent.', '',
             '## Første avklaringer', '',
             '1. Furuset: dagens produksjon, faktisk Q1-behov og mottak/silo etter ombygging. Uten dette kan melcaset ikke tallfestes.',
             '2. Cerealia Norge/Sverige: datert bulkspesifikasjon for nøyaktig 160105/160585, med metoder, fuktbasis og akseptgrenser.',
             '3. Deretter: batch/lager/allokering, foredling og energi/vann/transport/lossetid innen samme 72-timersscenario.',
             '4. Statistikksaker B07–B09 og mattilgang B13 gjenåpnes bare med den presise manglende filen/versjonen.', '',
             '## Felles returkrav', '',
             'Be om dokument-ID, revisjon, gyldighetsdato, dataeierrolle, enhet og målemetode. Skill faktisk observert drift fra plan og katalog. Oppgi intern bruksrett og eventuelle begrensninger. Ukjent verdi beholdes som ukjent. Ny informasjon får ny kildehash, kandidatversjon og kontroll; den endrer ingen historisk godkjenning automatisk.', '']
    for item in items:
        lines += [f"## {item['packageId']} — {item['workerStatus']}", '',
                  f"[Gjeldende kandidatretur](../../../{item['handoffPath'].removeprefix('docs/project/')})", '']
        for row in item['gaps']:
            lines += [f"### {row['gapId']}", '', str(row['question'] or 'Se den opprinnelige gapbeskrivelsen.'), '',
                      '**Mulig dataeierrolle:** ' + str(row['dataOwnerRole'] or 'Ikke navngitt i returen; må avklares.'), '',
                      '**Neste dokument/handling:** ' + str(row['requiredDocument'] or row['nextAction'] or 'Se opprinnelig retur.'), '']
            if row['missingFields']:
                lines += ['**Felter som mangler:** ' + '; '.join(str(f) for f in row['missingFields']), '']
            if row['stopReason']:
                lines += ['**Presist stopp:** ' + str(row['stopReason']), '']
    # Links from this status directory to the repository-relative handoff.
    rendered = '\n'.join(lines).replace('../../../analysis/', '../../analysis/') + '\n'
    return {'source-owner-queue.json': json.dumps(queue, ensure_ascii=False, indent=2) + '\n',
            'KILDE-OG-DATAEIERBEHOV.md': rendered}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    for name, content in outputs().items():
        path = HERE / name
        if args.write:
            path.write_text(content)
        elif not path.is_file() or path.read_text() != content:
            raise SystemExit(f'Stale output: {name}')
    print('20 selected returns and derived source/owner queue verified')
