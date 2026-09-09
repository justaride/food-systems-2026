#!/usr/bin/env python3
"""Recompute bounded checks, preserving source conflicts rather than correcting them."""
import argparse
import hashlib
import json
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

HERE = Path(__file__).resolve().parent

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    bindings = {}
    for name in ['125-001', '100-001']:
        d = json.loads((HERE/'dossiers'/f'{name}.json').read_text())
        bindings[name] = d['assessmentSha256']
    rows = [
        ('mjølkekyr', 45, 60, 55, 82),
        ('ammeku', 7, 63, 93, 97),
        ('okser intensiv', 39, 63, 61, 86),
        ('sau/lam', 12, 63, 88, 96),
        ('svin', 100, 71, 0, 71),
        ('kylling', 100, 40, 0, 40),
        ('egg', 100, 54, 0, 54),
    ]
    feed = []
    for animal, compound, domestic, roughage, reported in rows:
        assert compound + roughage == 100
        total = Decimal(compound)*Decimal(domestic)/100 + roughage
        rounded = int(total.quantize(Decimal('1'), rounding=ROUND_HALF_UP))
        assert rounded == reported
        feed.append(dict(animal=animal, compoundFeedShare=compound,
                         domesticShareOfCompoundFeed=domestic, roughageShare=roughage,
                         recomputedDomesticPercent=str(total), reportedRoundedPercent=reported))
    # Explicitly transcribed from Table 9; only the relevant rule path is evaluated.
    presence_rules = {('low', 'low'): 'low'}
    priority_rules = {('low', 'high'): 'medium'}
    expected = priority_rules[(presence_rules[('low','low')], 'high')]
    reported = 'low'
    assert expected != reported
    # Comparison is descriptive; the source simulation has not been replicated.
    values = {'DON_mean_ug_per_kg': (411,409), 'DON_maximum_ug_per_kg': (15400,5257),
              'DON_exceedance_percent': (6.2,7.5), 'ZEA_exceedance_percent': (6.7,13.7)}
    differences = {k: str(Decimal(str(a))-Decimal(str(b))) for k,(a,b) in values.items()}
    assert Decimal(differences['DON_mean_ug_per_kg']) > 0
    assert Decimal(differences['DON_exceedance_percent']) < 0
    receipt = dict(schema='offline-reading-quantitative-check/v1', result='passed',
        dossierBindings=bindings, scriptSha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        feedTable=dict(source='READ125-06; physical page 25, printed page 23, Table 2.3',
                       assumption='Normal year; all roughage domestic; Animalia 2020; no 2026 claim', rows=feed),
        priorityConflict=dict(source='READ100-07; Tables 5 and 9', recomputed=expected, reported=reported,
                              disposition='Preserve unresolved source rule inconsistency; no automatic correction'),
        wheatComparison=dict(source='READ100-05; Table 7; short minus conventional', differences=differences,
                             unitNote='Concentrations in µg/kg raw wheat; exceedance differences in percentage points',
                             interpretation='Different metrics move in different directions; no overall safety ranking'),
        limitations=['Source transcription checked against PDF images; raw data not replicated',
                     'Arithmetic agreement is not evidence of representativeness or operational effect'],
        human_verified=False, readinessChanged=False)
    content=json.dumps(receipt,ensure_ascii=False,sort_keys=True,indent=2)+'\n'
    path=HERE/'quantitative-verification.json'
    if args.write:
        path.write_text(content)
    else:
        assert path.read_text()==content, 'Quantitative receipt drift'
    print('Passed: 7 feed rows, preserved classification conflict, multidirectional simulation comparison.')

if __name__ == '__main__':
    main()
