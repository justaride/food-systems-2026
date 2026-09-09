#!/usr/bin/env python3
import copy
import importlib.util
from pathlib import Path
import unittest
import itertools

spec = importlib.util.spec_from_file_location("cereals", Path(__file__).with_name("analyze-beredskap-cereals.py"))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


class DecoderTests(unittest.TestCase):
    def setUp(self):
        self.data = {"id": ["crop", "year"], "size": [2, 2],
                     "dimension": {"crop": {"category": {"index": {"B": 1, "A": 0}}},
                                   "year": {"category": {"index": {"2018": 0, "2019": 1}}}},
                     "value": {"0": 0, "2": 8, "3": 10}, "status": {"2": "p"}}

    def test_declared_order_and_sparse_missing(self):
        rows = m.decode(self.data)
        self.assertEqual([(r["crop"], r["year"], r["value"]) for r in rows],
                         [("A", "2018", 0), ("A", "2019", None), ("B", "2018", 8), ("B", "2019", 10)])

    def test_preserves_flags(self):
        self.assertEqual(m.decode(self.data)[2]["status"], "p")

    def test_dense_equals_sparse(self):
        data = copy.deepcopy(self.data)
        data["value"] = [0, None, 8, 10]
        self.assertEqual(m.decode(data), m.decode(self.data))

    def test_no_input_mutation(self):
        before = copy.deepcopy(self.data)
        m.decode(self.data)
        self.assertEqual(self.data, before)

    def test_rejects_nonfinite_or_boolean(self):
        for value in (float("nan"), float("inf"), True, ".."):
            with self.subTest(value=value), self.assertRaises(ValueError):
                data = copy.deepcopy(self.data)
                data["value"]["0"] = value
                m.decode(data)

    def test_rejects_bad_sparse_indices(self):
        for key in ("-1", "4", "01", "bad"):
            with self.subTest(key=key), self.assertRaises(ValueError):
                data = copy.deepcopy(self.data)
                data["value"][key] = 3
                m.decode(data)

    def test_rejects_bad_dense_length(self):
        self.data["value"] = [1]
        with self.assertRaises(ValueError):
            m.decode(self.data)

    def test_rejects_duplicate_axis_position(self):
        self.data["dimension"]["crop"]["category"]["index"] = {"A": 0, "B": 0}
        with self.assertRaises(ValueError):
            m.decode(self.data)

    def test_rejects_duplicate_dimensions(self):
        self.data["id"] = ["crop", "crop"]
        with self.assertRaises(ValueError):
            m.decode(self.data)

    def test_changes_have_explicit_denominator(self):
        self.assertEqual(m.change(60, 100), -40)
        self.assertIsNone(m.change(60, 0))
        self.assertIsNone(m.change(None, 100))
        self.assertIsNone(m.change(60, None))


class AnalysisTests(unittest.TestCase):
    @staticmethod
    def fixture(crops, countries):
        ids = ["freq", "crops", "strucpro", "geo", "time"]
        axes = [["A"], crops, list(m.MEASURES.values()), countries, [str(y) for y in range(2015, 2021)]]
        data = {"id": ids, "size": [len(a) for a in axes],
                "dimension": {d: {"category": {"index": dict(zip(a, range(len(a))))}} for d, a in zip(ids, axes)},
                "value": {}, "status": {}}
        for i, (_, crop, measure, geo, year) in enumerate(itertools.product(*axes)):
            data["value"][str(i)] = {"AR_THS_HA": 10, "HPRD_HUMD_EU_THS_T": 60 if year == "2018" else 100,
                                     "YLD_HUMD_EU_T_HA": 6 if year == "2018" else 10, "HUMD_EU_PC": 14}[measure]
        return data

    def setUp(self):
        self.main = self.fixture(["C1100", "C1300"], list(m.COUNTRIES))
        self.no = self.fixture(["C1110"], ["NO"])

    def event(self, result, country="SE"):
        return next(r for r in result["contrasts"] if (r["country"], r["crop"], r["year"]) == (country, "wheat", 2018))

    def selected_index(self):
        return str(next(r["cellIndex"] for r in m.decode(self.main) if r["geo"] == "SE" and r["crops"] == "C1100" and r["time"] == "2015" and r["strucpro"] == "HPRD_HUMD_EU_THS_T"))

    def test_whole_panel_and_baseline(self):
        result = m.analyze(self.main, self.no)
        self.assertEqual((len(result["records"]), len(result["contrasts"])), (48, 24))
        self.assertEqual(self.event(result)["production_kt_change_pct"], -40)
        self.assertEqual(self.event(result, "NO")["crop_code"], "C1110")

    def test_break_flag_withholds_affected_comparison(self):
        self.main["status"][self.selected_index()] = "b"
        r = self.event(m.analyze(self.main, self.no))
        self.assertIsNone(r["production_kt_change_pct"])
        self.assertIsNone(r["derived_yield_t_ha_change_pct"])
        self.assertEqual(r["area_kha_change_pct"], 0)
        self.assertEqual(r["production_change_vs_2017_pct"], -40)

    def test_missing_baseline_withholds_contrast(self):
        del self.main["value"][self.selected_index()]
        self.assertIsNone(self.event(m.analyze(self.main, self.no))["production_kt_change_pct"])

    def test_rejects_unknown_moisture(self):
        self.no["value"]["18"] = 13
        with self.assertRaisesRegex(ValueError, "humidity"):
            m.analyze(self.main, self.no)


if __name__ == "__main__":
    unittest.main()
