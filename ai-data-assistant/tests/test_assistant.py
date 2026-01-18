import unittest
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.assistant import analyze, analyze_payload, load_rows, render_html, summarize, summarize_by_segment


class AssistantTest(unittest.TestCase):
    def setUp(self):
        self.data_file = ROOT / "data" / "sample_activity.csv"

    def test_load_rows_adds_activity_rate(self):
        rows = load_rows(self.data_file)

        self.assertEqual(len(rows), 16)
        self.assertIn("activity_rate", rows[0])

    def test_summary_contains_global_metrics(self):
        rows = load_rows(self.data_file)
        summary = summarize(rows)

        self.assertEqual(summary["rows"], 16)
        self.assertGreater(summary["total_users"], 0)
        self.assertGreater(summary["global_activity_rate"], 0)

    def test_segments_are_sorted_by_activity_rate(self):
        rows = load_rows(self.data_file)
        segments = summarize_by_segment(rows)

        self.assertGreaterEqual(segments[0]["activity_rate"], segments[-1]["activity_rate"])

    def test_analyze_generates_markdown_report(self):
        report = analyze(self.data_file)

        self.assertIn("# AI Data Assistant - Analysis Report", report)
        self.assertIn("## Generated Insights", report)

    def test_analyze_payload_contains_insights(self):
        payload = analyze_payload(self.data_file)

        self.assertIn("summary", payload)
        self.assertIn("segments", payload)
        self.assertGreater(len(payload["insights"]), 0)

    def test_render_html_generates_preview(self):
        payload = analyze_payload(self.data_file)
        html = render_html(payload["summary"], payload["segments"], payload["insights"])

        self.assertIn("<!doctype html>", html)
        self.assertIn("AI Data Assistant", html)


if __name__ == "__main__":
    unittest.main()
