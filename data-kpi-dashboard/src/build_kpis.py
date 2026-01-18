import csv
from collections import defaultdict
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "data" / "sample_members.csv"
OUTPUT_DIR = ROOT / "outputs"


def load_members() -> list[dict[str, object]]:
    with DATA_FILE.open(newline="", encoding="utf-8") as csv_file:
        members = list(csv.DictReader(csv_file))

    for member in members:
        join_date = datetime.strptime(str(member["join_date"]), "%Y-%m-%d")
        events_attended = int(str(member["events_attended"]))
        member["join_month"] = join_date.strftime("%Y-%m")
        member["events_attended"] = events_attended
        member["is_active"] = member["status"] == "active"
        member["engagement_score"] = min(events_attended * 10, 100)

    return members


def write_csv(filename: str, rows: list[dict[str, object]]) -> None:
    if not rows:
        return

    with (OUTPUT_DIR / filename).open("w", newline="", encoding="utf-8") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def build_summary(members: list[dict[str, object]]) -> list[dict[str, object]]:
    total_members = len(members)
    active_members = sum(1 for member in members if member["is_active"])
    inactive_members = total_members - active_members
    activity_rate = round(active_members / total_members * 100, 2)
    avg_events = round(sum(int(member["events_attended"]) for member in members) / total_members, 2)
    avg_engagement = round(sum(int(member["engagement_score"]) for member in members) / total_members, 2)

    return [
        {"metric": "total_members", "value": total_members},
        {"metric": "active_members", "value": active_members},
        {"metric": "inactive_members", "value": inactive_members},
        {"metric": "activity_rate_percent", "value": activity_rate},
        {"metric": "average_events_attended", "value": avg_events},
        {"metric": "average_engagement_score", "value": avg_engagement},
    ]


def build_grouped_outputs(members: list[dict[str, object]]) -> dict[str, list[dict[str, object]]]:
    regions: dict[str, dict[str, object]] = defaultdict(
        lambda: {"region": "", "members": 0, "active_members": 0, "engagement_total": 0}
    )
    months: dict[str, dict[str, object]] = defaultdict(
        lambda: {"join_month": "", "new_members": 0, "active_members": 0}
    )
    channels: dict[str, dict[str, object]] = defaultdict(
        lambda: {"channel": "", "members": 0, "active_members": 0, "events_total": 0}
    )

    for member in members:
        region = str(member["region"])
        month = str(member["join_month"])
        channel = str(member["channel"])
        is_active = bool(member["is_active"])

        regions[region]["region"] = region
        regions[region]["members"] = int(regions[region]["members"]) + 1
        regions[region]["active_members"] = int(regions[region]["active_members"]) + int(is_active)
        regions[region]["engagement_total"] = int(regions[region]["engagement_total"]) + int(member["engagement_score"])

        months[month]["join_month"] = month
        months[month]["new_members"] = int(months[month]["new_members"]) + 1
        months[month]["active_members"] = int(months[month]["active_members"]) + int(is_active)

        channels[channel]["channel"] = channel
        channels[channel]["members"] = int(channels[channel]["members"]) + 1
        channels[channel]["active_members"] = int(channels[channel]["active_members"]) + int(is_active)
        channels[channel]["events_total"] = int(channels[channel]["events_total"]) + int(member["events_attended"])

    by_region = []
    for row in regions.values():
        members_count = int(row["members"])
        by_region.append(
            {
                "region": row["region"],
                "members": members_count,
                "active_members": row["active_members"],
                "average_engagement": round(int(row["engagement_total"]) / members_count, 2),
            }
        )
    by_region.sort(key=lambda row: (int(row["members"]), int(row["active_members"])), reverse=True)

    by_month = []
    cumulative = 0
    for month in sorted(months):
        row = months[month]
        cumulative += int(row["new_members"])
        by_month.append(
            {
                "join_month": row["join_month"],
                "new_members": row["new_members"],
                "active_members": row["active_members"],
                "cumulative_members": cumulative,
            }
        )

    by_channel = []
    for row in channels.values():
        members_count = int(row["members"])
        by_channel.append(
            {
                "channel": row["channel"],
                "members": members_count,
                "active_members": row["active_members"],
                "average_events": round(int(row["events_total"]) / members_count, 2),
            }
        )
    by_channel.sort(key=lambda row: int(row["members"]), reverse=True)

    return {
        "members_by_region.csv": by_region,
        "members_by_month.csv": by_month,
        "members_by_channel.csv": by_channel,
    }


def main() -> None:
    OUTPUT_DIR.mkdir(exist_ok=True)
    members = load_members()
    write_csv("clean_members.csv", members)
    write_csv("kpi_summary.csv", build_summary(members))

    for filename, dataframe in build_grouped_outputs(members).items():
        write_csv(filename, dataframe)

    print(f"KPI files generated in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
