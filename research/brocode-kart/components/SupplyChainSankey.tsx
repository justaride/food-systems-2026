"use client";

import React, { useMemo, useCallback, useState } from "react";
import { usePlotly } from "./PlotlyChart";

interface SupplyChainSankeyProps {
    isNorwegian?: boolean;
}

type ColorMode = "parent" | "product";

const PARENT_COLORS: Record<string, string> = {
    NorgesGruppen: "#1565C0",
    Coop: "#E30613",
    "Rema 1000": "#4CAF50",
    Bunnpris: "#FF9800",
    Nortura: "#DC2626",
    Tine: "#2563EB",
    BAMA: "#16A34A",
    Orkla: "#7C3AED",
    Mowi: "#0891B2",
    "Lerøy": "#0D9488",
    Other: "#6B7280",
    Imports: "#F59E0B",
    Fisheries: "#0284C7",
    Aquaculture: "#06B6D4",
};

const PRODUCT_COLORS: Record<string, string> = {
    Dairy: "#3B82F6",
    Meat: "#EF4444",
    Grain: "#F59E0B",
    Produce: "#10B981",
    Seafood: "#0891B2",
    Imports: "#8B5CF6",
    Beverage: "#EC4899",
};

const NODE_LABELS = [
    "Farms: Dairy",
    "Farms: Grain",
    "Farms: Vegetables",
    "Farms: Livestock",
    "Farms: Mixed",
    "Imports",
    "Fisheries",
    "Aquaculture",
    "Nortura (Meat)",
    "Tine (Dairy)",
    "BAMA (Produce)",
    "Mowi (Seafood)",
    "Lerøy (Seafood)",
    "Orkla (Mixed)",
    "Other Processing",
    "ASKO (NG)",
    "C-Log (Coop)",
    "Rema Distribution",
    "Bunnpris Central",
    "NorgesGruppen (44%)",
    "Coop Norge (29%)",
    "Rema 1000 (24%)",
    "Bunnpris (3%)",
    "Seafood Export",
];

const NODE_PARENT_MAP: Record<number, string> = {
    0: "Tine",
    1: "Other",
    2: "BAMA",
    3: "Nortura",
    4: "Other",
    5: "Imports",
    6: "Fisheries",
    7: "Aquaculture",
    8: "Nortura",
    9: "Tine",
    10: "BAMA",
    11: "Mowi",
    12: "Lerøy",
    13: "Orkla",
    14: "Other",
    15: "NorgesGruppen",
    16: "Coop",
    17: "Rema 1000",
    18: "Bunnpris",
    19: "NorgesGruppen",
    20: "Coop",
    21: "Rema 1000",
    22: "Bunnpris",
    23: "Other",
};

const NODE_PRODUCT_MAP: Record<number, string> = {
    0: "Dairy",
    1: "Grain",
    2: "Produce",
    3: "Meat",
    4: "Produce",
    5: "Imports",
    6: "Seafood",
    7: "Seafood",
    8: "Meat",
    9: "Dairy",
    10: "Produce",
    11: "Seafood",
    12: "Seafood",
    13: "Produce",
    14: "Grain",
    15: "Produce",
    16: "Produce",
    17: "Produce",
    18: "Produce",
    19: "Produce",
    20: "Produce",
    21: "Produce",
    22: "Produce",
    23: "Seafood",
};

const LINKS = {
    source: [
        0, 0, 1, 1, 2, 2, 3, 3, 4, 4,
        5, 5, 5,
        6, 6, 7, 7,
        8, 8, 8, 8,
        9, 9, 9, 9,
        10, 10, 10, 10,
        11, 11, 12, 12,
        13, 13, 13, 13,
        14, 14, 14, 14,
        15, 16, 17, 18,
        15, 16, 17, 18,
        15, 16, 17, 18,
        15, 16, 17, 18,
        11, 12,
    ],
    target: [
        9, 8, 14, 8, 10, 13, 8, 8, 8, 10,
        10, 13, 15,
        11, 12, 11, 12,
        15, 16, 17, 18,
        15, 16, 17, 18,
        15, 16, 17, 18,
        15, 16, 17, 18,
        23, 15, 23, 16,
        15, 16, 17, 18,
        15, 16, 17, 18,
        19, 20, 21, 22,
        19, 20, 21, 22,
        19, 20, 21, 22,
        19, 20, 21, 22,
        23, 23,
    ],
    value: [
        1200, 324, 800, 383, 232, 150, 357, 50, 200, 100,
        300, 150, 29,
        750, 750, 650, 650,
        176, 116, 96, 12,
        360, 235, 195, 24,
        400, 260, 216, 27,
        40, 26, 45, 29,
        80, 20, 85, 22,
        140, 91, 76, 9,
        88, 58, 48, 6,
        1760, 1160, 960, 120,
        60, 40, 33, 4,
        120, 78, 65, 8,
        100, 66, 55, 7,
        1200, 1300,
    ],
    labels: [
        "Milk to Tine",
        "Dairy farms to Nortura",
        "Grain to mills",
        "Grain to feed",
        "Vegetables to BAMA",
        "Vegetables to Orkla",
        "Livestock to Nortura",
        "Mixed to Nortura",
        "Mixed meat to processing",
        "Mixed produce to BAMA",
        "Fruit/Veg imports to BAMA",
        "Imports to Orkla",
        "Imports to ASKO",
        "Wild catch to Mowi",
        "Wild catch to Lerøy",
        "Farmed to Mowi",
        "Farmed to Lerøy",
        "Meat to ASKO",
        "Meat to C-Log",
        "Meat to Rema",
        "Meat to Bunnpris",
        "Dairy to ASKO",
        "Dairy to C-Log",
        "Dairy to Rema",
        "Dairy to Bunnpris",
        "Produce to ASKO",
        "Produce to C-Log",
        "Produce to Rema",
        "Produce to Bunnpris",
        "Mowi to ASKO",
        "Mowi to C-Log",
        "Lerøy to ASKO",
        "Lerøy to C-Log",
        "Mowi Export",
        "Mowi Domestic",
        "Lerøy Export",
        "Lerøy Domestic",
        "Orkla to ASKO",
        "Orkla to C-Log",
        "Orkla to Rema",
        "Orkla to Bunnpris",
        "Grain to ASKO",
        "Grain to C-Log",
        "Grain to Rema",
        "Grain to Bunnpris",
        "ASKO to NG Retail",
        "C-Log to Coop Retail",
        "Rema Dist to Rema Stores",
        "Bunnpris Dist to Stores",
        "ASKO Fresh to NG",
        "C-Log Fresh to Coop",
        "Rema Fresh to Stores",
        "Bunnpris Fresh to Stores",
        "ASKO Dairy to NG",
        "C-Log Dairy to Coop",
        "Rema Dairy to Stores",
        "Bunnpris Dairy to Stores",
        "ASKO Meat to NG",
        "C-Log Meat to Coop",
        "Rema Meat to Stores",
        "Bunnpris Meat to Stores",
        "Mowi Global Export",
        "Lerøy Global Export",
    ],
};

export default function SupplyChainSankey({
    isNorwegian = false,
}: SupplyChainSankeyProps) {
    const { Plot: PlotComponent, isLoading, error: plotError } = usePlotly();
    const [colorMode, setColorMode] = useState<ColorMode>("parent");

    const t = useCallback(<T,>(en: T, no: T): T => (isNorwegian ? no : en), [isNorwegian]);

    const nodeColors = useMemo(() => {
        const colorMap = colorMode === "parent" ? PARENT_COLORS : PRODUCT_COLORS;
        const nodeMap = colorMode === "parent" ? NODE_PARENT_MAP : NODE_PRODUCT_MAP;
        return NODE_LABELS.map((_, idx) => {
            const key = nodeMap[idx];
            return colorMap[key] || "#6B7280";
        });
    }, [colorMode]);

    const linkColors = useMemo(() => {
        const colorMap = colorMode === "parent" ? PARENT_COLORS : PRODUCT_COLORS;
        const nodeMap = colorMode === "parent" ? NODE_PARENT_MAP : NODE_PRODUCT_MAP;
        return LINKS.source.map((sourceIdx) => {
            const key = nodeMap[sourceIdx];
            const baseColor = colorMap[key] || "#6B7280";
            return baseColor + "40";
        });
    }, [colorMode]);

    const data = useMemo(
        () => [
            {
                type: "sankey" as const,
                orientation: "h" as const,
                arrangement: "snap" as const,
                node: {
                    pad: 20,
                    thickness: 25,
                    line: {
                        color: "#374151",
                        width: 1,
                    },
                    label: NODE_LABELS,
                    color: nodeColors,
                    hovertemplate:
                        "<b>%{label}</b><br>Total flow: %{value:,.0f}k tonnes<extra></extra>",
                },
                link: {
                    source: LINKS.source,
                    target: LINKS.target,
                    value: LINKS.value,
                    color: linkColors,
                    customdata: LINKS.labels,
                    hovertemplate:
                        "<b>%{customdata}</b><br>Volume: %{value:,.0f}k tonnes<extra></extra>",
                },
            },
        ],
        [nodeColors, linkColors]
    );

    const layout = useMemo(
        () => ({
            font: {
                size: 11,
                color: "#E5E7EB",
                family: "Inter, system-ui, sans-serif",
            },
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            margin: { l: 10, r: 10, t: 40, b: 30 },
            title: {
                text: t(
                    "Norway Food Supply Chain (2024, thousand tonnes)",
                    "Norges matforsyningskjede (2024, tusen tonn)"
                ),
                font: { size: 16, color: "#F9FAFB" },
                x: 0.5,
                xanchor: "center" as const,
            },
            annotations: [
                {
                    x: 0,
                    y: 1.08,
                    xref: "paper" as const,
                    yref: "paper" as const,
                    text: t("Sources", "Kilder"),
                    showarrow: false,
                    font: { size: 10, color: "#9CA3AF" },
                    xanchor: "left" as const,
                },
                {
                    x: 0.25,
                    y: 1.08,
                    xref: "paper" as const,
                    yref: "paper" as const,
                    text: t("Processing", "Foredling"),
                    showarrow: false,
                    font: { size: 10, color: "#9CA3AF" },
                    xanchor: "center" as const,
                },
                {
                    x: 0.55,
                    y: 1.08,
                    xref: "paper" as const,
                    yref: "paper" as const,
                    text: t("Distribution", "Distribusjon"),
                    showarrow: false,
                    font: { size: 10, color: "#9CA3AF" },
                    xanchor: "center" as const,
                },
                {
                    x: 0.85,
                    y: 1.08,
                    xref: "paper" as const,
                    yref: "paper" as const,
                    text: t("Retail", "Detaljhandel"),
                    showarrow: false,
                    font: { size: 10, color: "#9CA3AF" },
                    xanchor: "center" as const,
                },
            ],
        }),
        [t]
    );

    if (isLoading) {
        return (
            <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 p-6">
                <div className="flex items-center justify-center h-[500px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                </div>
                <p className="text-center text-gray-400 mt-4">
                    {t("Loading supply chain visualization...", "Laster forsyningskjedevisualisering...")}
                </p>
            </div>
        );
    }

    if (!PlotComponent) {
        return (
            <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 p-6">
                <p className="text-center text-gray-400">
                    {t("Failed to load visualization", "Kunne ikke laste visualisering")}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <button
                        onClick={() => setColorMode("parent")}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                            colorMode === "parent"
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                                : "bg-gray-800/60 text-gray-400 border-gray-700 hover:bg-gray-700/60"
                        }`}
                    >
                        {t("Color by Company", "Farge etter selskap")}
                    </button>
                    <button
                        onClick={() => setColorMode("product")}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                            colorMode === "product"
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                                : "bg-gray-800/60 text-gray-400 border-gray-700 hover:bg-gray-700/60"
                        }`}
                    >
                        {t("Color by Product", "Farge etter produkt")}
                    </button>
                </div>
            </div>

            <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 overflow-hidden">
                <PlotComponent
                    data={data}
                    layout={layout}
                    config={{
                        responsive: true,
                        displayModeBar: true,
                        displaylogo: false,
                        modeBarButtonsToRemove: ["lasso2d", "select2d"],
                    }}
                    style={{ width: "100%", height: "600px" }}
                />
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-800/40 rounded-lg border border-gray-700/50 p-4">
                    <h4 className="font-semibold text-emerald-400 mb-2">
                        {t("Production Sources", "Produksjonskilder")}
                    </h4>
                    <ul className="text-gray-300 space-y-1">
                        <li>{t("50 farms across 5 types", "50 gårder fordelt på 5 typer")}</li>
                        <li>{t("1.5M tonnes milk annually", "1,5M tonn melk årlig")}</li>
                        <li>{t("1.2M tonnes grain", "1,2M tonn korn")}</li>
                        <li>{t("357k tonnes meat", "357k tonn kjøtt")}</li>
                        <li>{t("2.8M tonnes seafood", "2,8M tonn sjømat")}</li>
                    </ul>
                </div>
                <div className="bg-gray-800/40 rounded-lg border border-gray-700/50 p-4">
                    <h4 className="font-semibold text-blue-400 mb-2">
                        {t("Processing & Distribution", "Foredling & Distribusjon")}
                    </h4>
                    <ul className="text-gray-300 space-y-1">
                        <li>{t("30 processing plants", "30 foredlingsanlegg")}</li>
                        <li>{t("19 logistics hubs", "19 logistikksentre")}</li>
                        <li>{t("25 ports for imports/fishing", "25 havner for import/fiske")}</li>
                        <li>{t("3 major distributors", "3 hovedgrossister")}</li>
                    </ul>
                </div>
                <div className="bg-gray-800/40 rounded-lg border border-gray-700/50 p-4">
                    <h4 className="font-semibold text-amber-400 mb-2">
                        {t("Retail Market Share", "Detaljhandelsandeler")}
                    </h4>
                    <ul className="text-gray-300 space-y-1">
                        <li>NorgesGruppen: 44%</li>
                        <li>Coop Norge: 29%</li>
                        <li>Rema 1000: 24%</li>
                        <li>Bunnpris: 3%</li>
                        <li className="text-gray-500 italic">
                            {t("3,849 stores total", "3 849 butikker totalt")}
                        </li>
                    </ul>
                </div>
            </div>

            <div className="text-xs text-gray-500 text-center">
                {t(
                    "Data: SSB, Virke Dagligvare 2024, Seafood Norway, company reports. Flow values estimated from production volumes and market shares.",
                    "Data: SSB, Virke Dagligvare 2024, Sjømat Norge, selskapsrapporter. Strømverdier estimert fra produksjonsvolumer og markedsandeler."
                )}
            </div>
        </div>
    );
}
