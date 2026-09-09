"""Adversarial local queue checks. No network, model calls, DB or production data."""
import importlib.util
import json
import pathlib
import subprocess
import sys
import unittest
from unittest.mock import patch


def load(name, filename):
    spec = importlib.util.spec_from_file_location(name, pathlib.Path(__file__).with_name(filename))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


q = load("queue_runner", "run-beredskap-review-queue.py")
fixtures = load("receipt_fixtures", "test-verify-beredskap-review.py")


class QueueTests(unittest.TestCase):
    def setUp(self):
        self.fixture = fixtures.ReceiptIntegrityTests()
        self.fixture.setUp()
        self.addCleanup(self.fixture.doCleanups)
        # macOS temp paths can start with /var, a symlink to /private/var.
        self.root = self.fixture.p.resolve()
        self.packet = self.root / "packet.json"
        self.packet.write_text(json.dumps(self.fixture.d))
        _, vh, ph = q.load_verifier()
        self.manifest = {"verifierSha256": vh, "policySha256": ph, "jobs": [
            {"jobId": "one", "packetPath": str(self.packet), "packetSha256": q.sha(self.packet.read_bytes())}]}
        self.manifest_path = self.root / "queue.json"
        self.output = self.root / "output"

    def run_queue(self):
        self.manifest_path.write_text(json.dumps(self.manifest))
        result = q.run_queue(self.manifest_path, self.output)
        self.assertEqual(json.loads((self.output / "summary.json").read_text()), result)
        return result

    def job_result(self):
        return json.loads((self.output / "job-one.json").read_text())

    def test_valid_bindings_and_exclusive_results(self):
        result = self.run_queue()
        self.assertEqual(result["status"], "passed")
        self.assertFalse(result["semanticTruthVerified"])
        self.assertEqual(result["humanReview"], "not_performed")
        job = self.job_result()
        self.assertFalse(job["newReviewRequired"])
        self.assertEqual(job["actualPacketSha256"], self.manifest["jobs"][0]["packetSha256"])
        self.assertEqual(result["jobs"][0]["resultSha256"], q.sha((self.output / "job-one.json").read_bytes()))
        self.assertEqual((self.output / "job-one.json").stat().st_mode & 0o222, 0)
        with self.assertRaises(FileExistsError):
            q.write_new(self.output, "job-one.json", {})

    def test_stale_packet(self):
        self.packet.write_text(self.packet.read_text() + " ")
        self.assertEqual(self.run_queue()["counts"], {"input_changed": 1})
        self.assertTrue(self.job_result()["newReviewRequired"])

    def test_stale_source(self):
        pathlib.Path(self.fixture.d["sources"][0]["rawPath"]).write_text("Changed")
        self.assertEqual(self.run_queue()["counts"], {"failed": 1})
        self.assertFalse(self.job_result()["verification"]["ok"])
        self.assertTrue(self.job_result()["newReviewRequired"])

    def test_missing_source(self):
        pathlib.Path(self.fixture.d["sources"][0]["rawPath"]).unlink()
        self.assertEqual(self.run_queue()["counts"], {"failed": 1})

    def test_missing_packet(self):
        self.packet.unlink()
        self.assertEqual(self.run_queue()["counts"], {"missing_input": 1})

    def test_malformed_packet_json(self):
        self.packet.write_text("{malformed")
        self.manifest["jobs"][0]["packetSha256"] = q.sha(self.packet.read_bytes())
        self.assertEqual(self.run_queue()["counts"], {"invalid_input": 1})

    def test_malformed_manifest(self):
        self.manifest_path.write_text("{malformed")
        result = q.run_queue(self.manifest_path, self.output)
        self.assertEqual(result["status"], "invalid_input")
        self.assertEqual(result["jobs"], [])

    def test_duplicate_json_key(self):
        self.manifest_path.write_text('{"jobs": [], "jobs": []}')
        result = q.run_queue(self.manifest_path, self.output)
        self.assertEqual(result["status"], "invalid_input")
        self.assertIn("duplicate_json_key", result["errors"][0])

    def test_duplicate_ids_prevent_all_execution(self):
        self.manifest["jobs"] *= 2
        result = self.run_queue()
        self.assertEqual(result["status"], "invalid_input")
        self.assertEqual(list(self.output.glob("job-*")), [])

    def test_unsafe_job_id(self):
        self.manifest["jobs"][0]["jobId"] = "../outside"
        self.assertEqual(self.run_queue()["status"], "invalid_input")
        self.assertFalse((self.root / "outside.json").exists())

    def test_case_insensitive_job_collision_rejected_before_execution(self):
        self.manifest["jobs"].append(dict(self.manifest["jobs"][0], jobId="One"))
        result = self.run_queue()
        self.assertEqual(result["status"], "invalid_input")
        self.assertEqual(result["jobs"], [])
        self.assertEqual(list(self.output.glob("job-*")), [])

    def test_no_overwrite_existing_directory(self):
        self.output.mkdir()
        existing = self.output / "summary.json"
        existing.write_text("Existing result")
        with self.assertRaises(FileExistsError):
            self.run_queue()
        self.assertEqual(existing.read_text(), "Existing result")

    def test_symlink_output_parent_rejected(self):
        link = self.root / "redirect"
        link.symlink_to(self.root, target_is_directory=True)
        with self.assertRaises(ValueError):
            q.new_output(link / "escaped")
        self.assertFalse((self.root / "escaped").exists())

    def test_relative_and_parent_traversal_output_rejected(self):
        for path in [pathlib.Path("relative"), self.root / "unused" / ".." / "escaped"]:
            with self.subTest(path=path), self.assertRaises(ValueError):
                q.new_output(path)

    def test_policy_binding_changed(self):
        self.manifest["policySha256"] = "0" * 64
        self.assertEqual(self.run_queue()["status"], "invalid_input")

    def test_verifier_binding_changed(self):
        self.manifest["verifierSha256"] = "0" * 64
        self.assertEqual(self.run_queue()["status"], "invalid_input")

    def test_partial_queue_failure_does_not_skip_good_job(self):
        self.manifest["jobs"].insert(0, {"jobId": "absent", "packetPath": str(self.root / "absent"), "packetSha256": "0" * 64})
        result = self.run_queue()
        self.assertEqual(result["status"], "failed")
        self.assertEqual(result["counts"], {"missing_input": 1, "passed": 1})
        self.assertEqual(self.job_result()["status"], "passed")

    def test_source_changes_during_verification(self):
        verifier, vh, ph = q.load_verifier()
        original = verifier.verify

        def mutate(packet):
            result = original(packet)
            pathlib.Path(packet["sources"][0]["rawPath"]).write_text("Changed during verification")
            return result

        with patch.object(verifier, "verify", mutate):
            result = q.run_job(self.manifest["jobs"][0], verifier, vh, ph)
        self.assertEqual(result["status"], "input_changed")
        self.assertTrue(result["newReviewRequired"])

    def test_limit_and_fifo_guard(self):
        self.manifest["jobs"] = [dict(self.manifest["jobs"][0], jobId=f"job{i}") for i in range(21)]
        self.assertEqual(self.run_queue()["status"], "invalid_input")
        fifo = self.root / "fifo"
        q.os.mkfifo(fifo)
        with self.assertRaises(ValueError):
            q.read_input(fifo)

    def test_cli_failure_nonzero(self):
        self.manifest_path.write_text(json.dumps(self.manifest))
        self.packet.unlink()
        result = subprocess.run([sys.executable, q.__file__, "--manifest", str(self.manifest_path),
                                 "--output-dir", str(self.output)], capture_output=True, text=True)
        self.assertEqual(result.returncode, 1, result.stderr)
        self.assertEqual(json.loads(result.stdout)["status"], "failed")


if __name__ == "__main__":
    unittest.main(verbosity=2)
