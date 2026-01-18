from __future__ import annotations

import csv
import json
import sys
from collections import defaultdict
from pathlib import Path
from statistics import mean
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "outputs"


def load_rows(path: Path) -> list[dict[str, Any]]:
    with path.open(newline="", encoding="utf-8") as csv_file:
        rows = list(csv.DictReader(csv_file))

    for row in rows:
        for field in ["users", "active_users", "tickets"]:
            row[field] = int(row[field])
        for field in ["resolution_hours", "satisfaction"]:
            row[field] = float(row[field])
        row["activity_rate"] = round(row["active_users"] / row["users"] * 100, 2)

    return rows


def summarize(rows: list[dict[str, Any]]) -> dict[str, Any]:
    total_users = sum(row["users"] for row in rows)
    total_active_users = sum(row["active_users"] for row in rows)
    total_tickets = sum(row["tickets"] for row in rows)

    return {
        "rows": len(rows),
        "segments": sorted({row["segment"] for row in rows}),
        "total_users": total_users,
        "total_active_users": total_active_users,
        "global_activity_rate": round(total_active_users / total_users * 100, 2),
        "total_tickets": total_tickets,
        "average_resolution_hours": round(mean(row["resolution_hours"] for row in rows), 2),
        "average_satisfaction": round(mean(row["satisfaction"] for row in rows), 2),
    }


def summarize_by_segment(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        grouped[row["segment"]].append(row)

    segments = []
    for segment, items in grouped.items():
        users = sum(row["users"] for row in items)
        active_users = sum(row["active_users"] for row in items)
        tickets = sum(row["tickets"] for row in items)
        segments.append(
            {
                "segment": segment,
                "users": users,
                "active_users": active_users,
                "activity_rate": round(active_users / users * 100, 2),
                "tickets": tickets,
                "average_resolution_hours": round(mean(row["resolution_hours"] for row in items), 2),
                "average_satisfaction": round(mean(row["satisfaction"] for row in items), 2),
            }
        )

    return sorted(segments, key=lambda item: item["activity_rate"], reverse=True)


def generate_insights(summary: dict[str, Any], segments: list[dict[str, Any]]) -> list[str]:
    insights = []
    best_segment = max(segments, key=lambda item: item["activity_rate"])
    slowest_segment = max(segments, key=lambda item: item["average_resolution_hours"])
    lowest_satisfaction = min(segments, key=lambda item: item["average_satisfaction"])

    insights.append(
        f"Le taux d'activité global est de {summary['global_activity_rate']} %, avec {summary['total_active_users']} utilisateurs actifs."
    )
    insights.append(
        f"Le segment le plus engagé est {best_segment['segment']} avec {best_segment['activity_rate']} % d'activité."
    )
    insights.append(
        f"Le segment {slowest_segment['segment']} a le temps de résolution moyen le plus élevé ({slowest_segment['average_resolution_hours']} h)."
    )
    insights.append(
        f"La satisfaction la plus faible est observée sur {lowest_satisfaction['segment']} ({lowest_satisfaction['average_satisfaction']}/5)."
    )

    if summary["average_resolution_hours"] > 20:
        insights.append("Priorité recommandée : réduire les délais de résolution, car la moyenne dépasse 20 h.")
    else:
        insights.append("Les délais de résolution sont globalement maîtrisés, avec une moyenne sous 20 h.")

    return insights


def render_report(summary: dict[str, Any], segments: list[dict[str, Any]], insights: list[str]) -> str:
    lines = [
        "# AI Data Assistant - Analysis Report",
        "",
        "## Global Summary",
        "",
        f"- Rows analyzed: {summary['rows']}",
        f"- Segments: {', '.join(summary['segments'])}",
        f"- Total users: {summary['total_users']}",
        f"- Active users: {summary['total_active_users']}",
        f"- Global activity rate: {summary['global_activity_rate']} %",
        f"- Total tickets: {summary['total_tickets']}",
        f"- Average resolution time: {summary['average_resolution_hours']} h",
        f"- Average satisfaction: {summary['average_satisfaction']}/5",
        "",
        "## Segment Analysis",
        "",
        "| Segment | Users | Activity rate | Tickets | Resolution h | Satisfaction |",
        "| --- | ---: | ---: | ---: | ---: | ---: |",
    ]

    for segment in segments:
        lines.append(
            f"| {segment['segment']} | {segment['users']} | {segment['activity_rate']} % | {segment['tickets']} | {segment['average_resolution_hours']} | {segment['average_satisfaction']} |"
        )

    lines.extend(["", "## Generated Insights", ""])
    lines.extend(f"- {insight}" for insight in insights)
    lines.append("")

    return "\n".join(lines)


def render_html(summary: dict[str, Any], segments: list[dict[str, Any]], insights: list[str]) -> str:
    segment_rows = "\n".join(
        f"""
          <tr>
            <td>{segment['segment']}</td>
            <td>{segment['users']}</td>
            <td>{segment['activity_rate']}%</td>
            <td>{segment['tickets']}</td>
            <td>{segment['average_resolution_hours']} h</td>
            <td>{segment['average_satisfaction']}/5</td>
          </tr>"""
        for segment in segments
    )
    insight_items = "\n".join(f"<li>{insight}</li>" for insight in insights)

    return f"""<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>AI Data Assistant Report</title>
    <style>
      :root {{
        --background: #f4f6f8;
        --foreground: #17212b;
        --muted: #64717d;
        --line: #d9e2e6;
        --panel: #ffffff;
        --primary: #245b70;
        --accent: #6b5b95;
      }}

      * {{ box-sizing: border-box; }}

      body {{
        margin: 0;
        color: var(--foreground);
        background: var(--background);
        font-family: Arial, Helvetica, sans-serif;
      }}

      main {{
        width: min(1120px, calc(100% - 32px));
        margin: 0 auto;
        padding: 32px 0;
      }}

      .hero {{
        padding: 30px;
        color: #ffffff;
        background: var(--primary);
        border-radius: 8px;
      }}

      .hero h1,
      .hero p {{ margin: 0; }}

      .hero p {{
        margin-top: 10px;
        color: #eaf3f6;
      }}

      .grid {{
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 14px;
        margin-top: 18px;
      }}

      .card,
      .panel {{
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 8px;
      }}

      .card {{
        min-height: 112px;
        padding: 18px;
      }}

      .card span,
      .panel li {{
        color: var(--muted);
      }}

      .card strong {{
        display: block;
        margin-top: 10px;
        color: var(--primary);
        font-size: 30px;
      }}

      .panel {{
        margin-top: 18px;
        padding: 22px;
      }}

      .panel h2 {{
        margin: 0 0 16px;
        font-size: 20px;
      }}

      table {{
        width: 100%;
        border-collapse: collapse;
      }}

      th,
      td {{
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid var(--line);
      }}

      th {{
        color: var(--muted);
        font-size: 12px;
        text-transform: uppercase;
      }}

      li {{ margin: 10px 0; }}

      @media (max-width: 800px) {{
        .grid {{ grid-template-columns: 1fr 1fr; }}
        table {{ display: block; overflow-x: auto; }}
      }}

      @media (max-width: 520px) {{
        .grid {{ grid-template-columns: 1fr; }}
      }}
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <h1>AI Data Assistant</h1>
        <p>Rapport généré automatiquement depuis un CSV fictif, avec synthèse, segments et recommandations.</p>
      </section>

      <section class="grid" aria-label="Indicateurs">
        <article class="card"><span>Lignes analysées</span><strong>{summary['rows']}</strong></article>
        <article class="card"><span>Utilisateurs</span><strong>{summary['total_users']}</strong></article>
        <article class="card"><span>Taux activité</span><strong>{summary['global_activity_rate']}%</strong></article>
        <article class="card"><span>Satisfaction</span><strong>{summary['average_satisfaction']}/5</strong></article>
      </section>

      <section class="panel">
        <h2>Analyse par segment</h2>
        <table>
          <thead>
            <tr>
              <th>Segment</th>
              <th>Users</th>
              <th>Activité</th>
              <th>Tickets</th>
              <th>Résolution</th>
              <th>Satisfaction</th>
            </tr>
          </thead>
          <tbody>{segment_rows}
          </tbody>
        </table>
      </section>

      <section class="panel">
        <h2>Insights générés</h2>
        <ul>
          {insight_items}
        </ul>
      </section>
    </main>
  </body>
</html>
"""


def analyze_payload(input_path: Path) -> dict[str, Any]:
    rows = load_rows(input_path)
    summary = summarize(rows)
    segments = summarize_by_segment(rows)
    insights = generate_insights(summary, segments)

    return {
        "summary": summary,
        "segments": segments,
        "insights": insights,
    }


def analyze(input_path: Path) -> str:
    payload = analyze_payload(input_path)
    return render_report(payload["summary"], payload["segments"], payload["insights"])


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python3 src/assistant.py data/sample_activity.csv")
        return 1

    input_path = Path(sys.argv[1])
    payload = analyze_payload(input_path)
    report = render_report(payload["summary"], payload["segments"], payload["insights"])
    html = render_html(payload["summary"], payload["segments"], payload["insights"])
    OUTPUT_DIR.mkdir(exist_ok=True)
    output_path = OUTPUT_DIR / "analysis-report.md"
    output_path.write_text(report, encoding="utf-8")
    (OUTPUT_DIR / "analysis-summary.json").write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    (OUTPUT_DIR / "report-preview.html").write_text(html, encoding="utf-8")
    print(f"Report generated: {output_path}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
