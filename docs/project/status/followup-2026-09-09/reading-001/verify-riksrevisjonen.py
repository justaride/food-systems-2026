#!/usr/bin/env python3
"""Reproduce bounded arithmetic; retain original figures and unresolved bases."""
import argparse
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    dossier = json.loads((HERE / 'dossiers/129-002.json').read_text())
    checks = []
    for numerator, denominator, expected in [(172, 222, 77), (172, 212, 81), (183, 228, 80)]:
        value = 100 * numerator / denominator
        assert round(value) == expected
        checks.append(dict(claimId='READ129-16', numerator=numerator, denominator=denominator,
                           calculatedPercent=round(value, 4), roundedPercent=expected,
                           disposition='Different survey denominators; no national extrapolation'))
    value = .38 * .88 + .62 * .21
    assert abs(value - .4646) < 1e-12
    checks.append(dict(claimId='READ129-19', calculatedPercent=round(value * 100, 2),
                       disposition='Weighted rounded shares; no feed correction or new observation'))
    for compound, norwegian, roughage, total in [(45, 60, 55, 82), (7, 63, 93, 97),
                                                (39, 63, 61, 86), (12, 63, 88, 96),
                                                (100, 71, 0, 71), (100, 40, 0, 40), (100, 54, 0, 54)]:
        value = compound * norwegian / 100 + roughage
        assert round(value) == total
        checks.append(dict(claimId='READ129-21', compoundPercent=compound,
                           norwegianCompoundPercent=norwegian, roughagePercent=roughage,
                           computedNorwegianTotalPercent=round(value, 2), sourceRoundedTotal=total,
                           disposition='Normal-year ration; shared Animalia evidence, not independent replication'))
    assert not 34 <= 32 <= 40
    checks.append(dict(claimId='READ129-18', sourceRange=[34, 40], source2019=32,
                       disposition='Preserve internal range conflict; obtain versioned underlying series'))
    assert 27 != 26
    checks.append(dict(claimId='READ129-18', proseCornEnergyPercent=27, figureCornEnergyPercent=26,
                       disposition='Preserve figure/text conflict; do not silently harmonize'))
    result = dict(schema='offline-riksrevisjonen-consistency-check/v1',
                  result='passed_with_preserved_source_conflicts',
                  assessmentSha256=dossier['assessmentSha256'],
                  scriptSha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
                  checks=checks, human_verified=False, readinessChanged=False)
    content = json.dumps(result, ensure_ascii=False, sort_keys=True, indent=2) + '\n'
    output = HERE / 'riksrevisjonen-verification.json'
    if args.write:
        output.write_text(content)
    else:
        assert output.read_text() == content
    print(f'Passed {len(checks)} checks; source conflicts and partial reading preserved.')


if __name__ == '__main__':
    main()
