"""
Nordic Analysis Panel Visualization Suite
Generates 3 publication-quality figures from the harmonized Nordic panel.
All figures: 300dpi, PNG + PDF, consistent minimal theme.
"""

from __future__ import annotations

import csv
import os
from datetime import datetime

import matplotlib

matplotlib.use("Agg")
import matplotlib.dates as mdates
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker


BASE_DIR = os.path.dirname(__file__)
FIGDIR = os.path.join(BASE_DIR, "..", "figurer")
os.makedirs(FIGDIR, exist_ok=True)
PANEL_PATH = os.path.join(BASE_DIR, "..", "..", "data", "nordic", "analysis-panel", "nordic_harmonized_panel.csv")

COLORS = {
    "NO": "#ba0c2f",
    "DK": "#c8102e",
    "SE": "#006aa7",
    "FI": "#003580",
    "IS": "#4b9cd3",
    "bg": "#ffffff",
    "grid": "#e5e7eb",
    "text": "#111827",
}

COUNTRY_NAMES = {
    "NO": "Norway",
    "DK": "Denmark",
    "SE": "Sweden",
    "FI": "Finland",
    "IS": "Iceland",
}

FONT = {"family": "sans-serif", "size": 10}
matplotlib.rc("font", **FONT)
matplotlib.rc("axes", labelcolor=COLORS["text"], edgecolor=COLORS["grid"])
matplotlib.rc("xtick", color=COLORS["text"])
matplotlib.rc("ytick", color=COLORS["text"])


def save(fig, name: str) -> None:
    for fmt in ["png", "pdf"]:
        path = os.path.join(FIGDIR, f"{name}.{fmt}")
        fig.savefig(path, dpi=300, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print(f"  Saved: {name}.png / .pdf")


def load_panel_rows() -> list[dict[str, str]]:
    with open(PANEL_PATH, newline="") as handle:
        return list(csv.DictReader(handle))


def parse_month(value: str) -> datetime:
    return datetime.strptime(value, "%Y-%m")


def parse_year(value: str) -> datetime:
    return datetime.strptime(value, "%Y")


def fig12_food_price_panel(rows: list[dict[str, str]]) -> None:
    print("Fig 12: Nordic Food Price Panel")
    subset = [row for row in rows if row["comparison_group"] == "nordic_food_price_index"]

    fig, ax = plt.subplots(figsize=(10.5, 5.5))
    for country in ["NO", "DK", "SE", "FI", "IS"]:
        country_rows = sorted(
            [row for row in subset if row["country"] == country],
            key=lambda row: row["period"],
        )
        dates = [parse_month(row["period"]) for row in country_rows]
        values = [float(row["analysis_value"]) for row in country_rows]
        ax.plot(dates, values, linewidth=2, color=COLORS[country], label=COUNTRY_NAMES[country])
        ax.text(dates[-1], values[-1], f" {COUNTRY_NAMES[country]} {values[-1]:.1f}",
                color=COLORS[country], va="center", fontsize=8)

    ax.axhline(100, color=COLORS["grid"], linestyle="--", linewidth=0.8)
    ax.set_title("Nordic Food Inflation Panel: HICP Food and Non-Alcoholic Beverages",
                 fontsize=12, fontweight="bold", pad=12)
    ax.set_ylabel("Index (2015=100)")
    ax.xaxis.set_major_locator(mdates.YearLocator(2))
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%Y"))
    ax.yaxis.set_major_formatter(mticker.FormatStrFormatter("%.0f"))
    ax.grid(axis="y", color=COLORS["grid"], linewidth=0.5)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.legend(loc="upper left", frameon=False, fontsize=8)

    fig.text(0.99, 0.01, "Source: Harmonized panel from Eurostat prc_hicp_midx (CP01, I15), latest month: Dec 2025",
             ha="right", fontsize=7, color="#9ca3af")
    save(fig, "fig12_nordic_food_price_panel")


def common_base_trade(rows: list[dict[str, str]], flow: str, base_period: str = "2022-01") -> dict[str, list[tuple[datetime, float]]]:
    subset = [
        row
        for row in rows
        if row["comparison_group"] == "nordic_total_goods_trade_change" and row["flow"] == flow
    ]
    output: dict[str, list[tuple[datetime, float]]] = {}
    for country in ["NO", "DK", "SE", "IS"]:
        country_rows = sorted(
            [row for row in subset if row["country"] == country and row["period"] >= base_period],
            key=lambda row: row["period"],
        )
        base_row = next((row for row in country_rows if row["period"] == base_period), None)
        if base_row is None:
            continue
        base_value = float(base_row["value_raw"])
        output[country] = [
            (parse_month(row["period"]), (float(row["value_raw"]) / base_value) * 100.0)
            for row in country_rows
        ]
    return output


def fig13_trade_change_panel(rows: list[dict[str, str]]) -> None:
    print("Fig 13: Nordic Trade Change Panel")
    imports = common_base_trade(rows, "imports")
    exports = common_base_trade(rows, "exports")

    fig, axes = plt.subplots(1, 2, figsize=(13, 5.2), sharey=True)
    for ax, flow_label, series in [
        (axes[0], "Imports", imports),
        (axes[1], "Exports", exports),
    ]:
        for country in ["NO", "DK", "SE", "IS"]:
            points = series.get(country, [])
            if not points:
                continue
            dates = [point[0] for point in points]
            values = [point[1] for point in points]
            ax.plot(dates, values, linewidth=2, color=COLORS[country], label=COUNTRY_NAMES[country])
            ax.text(dates[-1], values[-1], f" {COUNTRY_NAMES[country]} {values[-1]:.1f}",
                    color=COLORS[country], va="center", fontsize=8)

        ax.axhline(100, color=COLORS["grid"], linestyle="--", linewidth=0.8)
        ax.set_title(flow_label, fontsize=11, fontweight="bold")
        ax.xaxis.set_major_locator(mdates.YearLocator(1))
        ax.xaxis.set_major_formatter(mdates.DateFormatter("%Y"))
        ax.yaxis.set_major_formatter(mticker.FormatStrFormatter("%.0f"))
        ax.grid(axis="y", color=COLORS["grid"], linewidth=0.5)
        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)

    axes[0].set_ylabel("Index (Jan 2022 = 100)")
    axes[0].legend(loc="upper left", frameon=False, fontsize=8)
    fig.suptitle("Nordic Trade Change Panel: Total Goods Trade Rebasing to Jan 2022",
                 fontsize=12, fontweight="bold", y=1.02)
    fig.text(0.99, -0.02, "Source: Harmonized panel; DK/NO/SE/IS total-goods trade rebased to common month 2022-01",
             ha="right", fontsize=7, color="#9ca3af")
    fig.tight_layout()
    save(fig, "fig13_nordic_trade_change_panel")


def fig14_oats_production_panel(rows: list[dict[str, str]]) -> None:
    print("Fig 14: Nordic Oats Production Panel")
    subset = [row for row in rows if row["comparison_group"] == "nordic_oats_production_volume"]

    fig, ax = plt.subplots(figsize=(10, 5.2))
    for country in ["NO", "SE", "FI"]:
        country_rows = sorted(
            [row for row in subset if row["country"] == country],
            key=lambda row: row["period"],
        )
        dates = [parse_year(row["period"]) for row in country_rows]
        values = [float(row["analysis_value"]) for row in country_rows]
        ax.plot(dates, values, linewidth=2.2, marker="o", markersize=4.5,
                color=COLORS[country], label=COUNTRY_NAMES[country])
        ax.text(dates[-1], values[-1], f" {COUNTRY_NAMES[country]} {values[-1]:.1f}",
                color=COLORS[country], va="center", fontsize=8)

    ax.set_title("Nordic Oats Production Panel: Comparable Volume Series",
                 fontsize=12, fontweight="bold", pad=12)
    ax.set_ylabel("Oats production (1,000 tonnes)")
    ax.xaxis.set_major_locator(mdates.YearLocator(2))
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%Y"))
    ax.yaxis.set_major_formatter(mticker.FormatStrFormatter("%.0f"))
    ax.grid(axis="y", color=COLORS["grid"], linewidth=0.5)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.legend(loc="upper right", frameon=False, fontsize=8)

    fig.text(0.99, 0.01, "Source: Harmonized panel; FI/NO/SE oats production standardized to 1,000 tonnes. DK/IS remain fallback series.",
             ha="right", fontsize=7, color="#9ca3af")
    save(fig, "fig14_nordic_oats_production_panel")


if __name__ == "__main__":
    print("Generating Nordic Analysis Panel Figures...\n")
    panel_rows = load_panel_rows()
    fig12_food_price_panel(panel_rows)
    fig13_trade_change_panel(panel_rows)
    fig14_oats_production_panel(panel_rows)
    print("\nAll figures generated successfully.")
