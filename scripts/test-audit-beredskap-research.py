import importlib.util
import pathlib
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("audit", pathlib.Path(__file__).with_name("audit-beredskap-research.py"))
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


class SourceAuditTests(unittest.TestCase):
    def test_changed_bytes_cannot_reach_semantic_queue(self):
        with tempfile.TemporaryDirectory() as directory:
            path = pathlib.Path(directory) / "source"
            path.write_bytes(b"changed")
            source = audit.inspect_source({"sourceId": "S1", "archivePath": str(path),
                                           "sha256": audit.digest(b"original"),
                                           "readStatus": "fulltekst_relevant_del"})
            observation = audit.inspect_observation({"observationId": "O1", "assessment": "kildestottet_avgrenset",
                "sourceRefs": [{"sourceId": "S1", "locator": "page 1"}]}, {"S1": source})
            self.assertEqual(observation["route"], "resolve_source_identity")
            self.assertEqual(observation["semanticReview"], "not_performed")
            self.assertEqual(observation["priorAssessment"], "kildestottet_avgrenset")

    def test_missing_reference_and_empty_locator_are_not_evidence(self):
        observation = audit.inspect_observation({"observationId": "O1", "sourceRefs": [{"sourceId": "missing", "locator": ""}]}, {})
        self.assertEqual(observation["route"], "repair_references")
        self.assertEqual(len(observation["referenceErrors"]), 2)

    def test_valid_hash_does_not_mean_semantic_approval(self):
        with tempfile.TemporaryDirectory() as directory:
            path = pathlib.Path(directory) / "source"
            path.write_bytes(b"original")
            source = audit.inspect_source({"sourceId": "S1", "archivePath": str(path), "sha256": audit.digest(b"original"), "readStatus": "fulltekst_relevant_del"})
            observation = audit.inspect_observation({"observationId": "O1", "sourceRefs": [{"sourceId": "S1", "locator": "page 1"}]}, {"S1": source})
            self.assertEqual(observation["route"], "prepare_semantic_review")
            self.assertEqual(observation["semanticReview"], "not_performed")
            self.assertEqual(observation["authority"], "internal_analysis_only")

    def test_existing_run_is_never_overwritten(self):
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaises(FileExistsError):
                audit.audit(pathlib.Path("unused"), pathlib.Path(directory))


if __name__ == "__main__":
    unittest.main()
