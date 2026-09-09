#!/usr/bin/env python3
"""Focused invariants for the round005 calculation; no network or DB."""
import copy
import importlib.util
import json
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location("c1", Path(__file__).with_name("analyze-beredskap-c1.py"))
c1 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(c1)
MANIFEST = Path(__file__).resolve().parents[1] / "docs/project/analysis/source-review-beredskap-2026-09-09/round-005/input-manifest.json"


class TestC1(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.manifest = json.loads(MANIFEST.read_text())
        cls.raw = c1.checked_inputs(cls.manifest)
        cls.result = c1.analyze(cls.raw)

    def test_no_operational_numbers_from_design(self):
        self.assertIsNone(self.result["delivery"]["national_t"])
        self.assertIsNone(self.result["delivery"]["nordic_t"])
        self.assertIsNone(self.result["delivery"]["netNeed_t"])
        self.assertIsNone(self.result["delivery"]["nordicAdditional_t"])
        self.assertFalse(self.result["deliveryTestPerformed"])
        self.assertTrue(all(not r["observedRecipientDemand"] for r in self.result["designArithmetic"]))

    def test_positive_unit_conversion_and_mass_conservation(self):
        self.assertAlmostEqual(c1.grain_requirement(20, .78), 25.64102564102564)
        for r in self.result["designArithmetic"]:
            self.assertAlmostEqual(r["grain_required_t"] * r["assumed_extraction_fraction"], r["illustrative_flour_target_t"])
            self.assertGreaterEqual(r["grain_required_t"], r["illustrative_flour_target_t"])

    def test_invalid_arithmetic_rejected(self):
        for f, y in [(None,.78), (20,None), (True,.78), (20,0), (20,1.1), (-1,.78), (float('nan'),.78), (20,float('inf'))]:
            with self.subTest(f=f,y=y), self.assertRaises(ValueError):
                c1.grain_requirement(f,y)

    def test_source_hash_rejection(self):
        bad=copy.deepcopy(self.manifest)
        bad["inputs"]["case"]["sha256"]="0"*64
        with self.assertRaisesRegex(ValueError,"changed source bytes"):
            c1.checked_inputs(bad)

    def test_all_eight_warnings_and_crop_codes_preserved(self):
        rows=self.result["yieldDiagnostics"]
        self.assertEqual(len(rows),8)
        self.assertEqual(len({(r['country'],r['crop_code'],r['year']) for r in rows}),8)
        self.assertTrue(all(r['status'].startswith('unresolved') for r in rows))
        self.assertTrue(all(r['crop_code']=='C1110' for r in rows if r['country']=='NO' and r['crop_code']!='C1300'))

    def test_fi_residual_and_common_factor(self):
        a,b=self.result['finland2018']
        self.assertAlmostEqual(a['residual_kt'],6.9)
        self.assertAlmostEqual(b['residual_kt'],17.09)
        self.assertFalse(self.result['commonMoistureOnlyFactorCompatibleWithBoth'])
        self.assertTrue(all(x['observed_national_moisture_pct'] is None for x in [a,b]))

    def test_national_cell_flags_fail_closed(self):
        raw=dict(self.raw); data=json.loads(raw['no_yield']);data['status']={'0':'p'};raw['no_yield']=json.dumps(data).encode()
        with self.assertRaisesRegex(ValueError,'flagged'):
            c1.analyze(raw)

    def test_eurostat_flags_fail_closed(self):
        raw=dict(self.raw);data=json.loads(raw['eu_panel']);data['status']={'81':'p'};raw['eu_panel']=json.dumps(data).encode()
        with self.assertRaisesRegex(ValueError,'flagged Eurostat'):
            c1.analyze(raw)

    def test_new_operational_evidence_not_silently_consumed(self):
        raw=dict(self.raw);case=json.loads(raw['case']);case['alternatives'][0]['observedQuantities']['deliveredAcceptedFlour_t']=20
        raw['case']=json.dumps(case).encode()
        with self.assertRaisesRegex(ValueError,'new operational evidence'):
            c1.analyze(raw)


if __name__ == '__main__':
    unittest.main()
