"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import MermaidDiagram from "@/components/MermaidDiagram";

const SupplyChainSankey = dynamic(
    () => import("./SupplyChainSankey"),
    { ssr: false }
);

const SupplyNetworkGraph = dynamic(
    () => import("./SupplyNetworkGraph"),
    { ssr: false }
);

const FOOD_FLOW_DIAGRAM = `graph LR
    subgraph Imports ["Imports (~520k Tonnes)"]
        I1[Fruit & Veg: 479k]
        I2[Cheese: 20k]
        I3[Meat: 18k]
    end

    subgraph Domestic ["Domestic Production (~3.0M Tonnes)"]
        D1[Milk: 1.5M]
        D2[Grain: 1.2M]
        D3[Meat: 357k]
        D4[Fruit & Veg: 232k]
    end

    subgraph Seafood ["Seafood Catch (~2.8M Tonnes)"]
        S1[Fisheries: 1.5M]
        S2[Aquaculture: 1.3M]
    end

    I1 --> Consumption
    I2 --> Consumption
    I3 --> Consumption

    D1 --> Consumption
    D2 --> Consumption
    D3 --> Consumption
    D4 --> Consumption

    S1 -->|Major Export| Export[Export: ~2.8M Tonnes]
    S2 -->|Major Export| Export
    S1 -.->|Minor| Consumption
    S2 -.->|Minor| Consumption

    Consumption["Domestic Consumption (~3.5M Tonnes)"]

    style Seafood fill:#1e3a5f,stroke:#3b82f6,color:#93c5fd
    style Domestic fill:#14532d,stroke:#22c55e,color:#86efac
    style Imports fill:#451a03,stroke:#f59e0b,color:#fcd34d
    style Export fill:#083344,stroke:#06b6d4,color:#67e8f9
    style Consumption fill:#4c0519,stroke:#ec4899,color:#f9a8d4
`;

const VALUE_CHAIN_DIAGRAM = `graph TD
    subgraph Production ["Production (Thousands)"]
        P1[Farmers]
        P2[Fisheries]
        P3[Importers]
        P4[Industry]
    end

    subgraph Wholesale ["Wholesale (The Big 3)"]
        W1{ASKO / NorgesGruppen}
        W2{Rema Distribusjon}
        W3{Coop C-Log}
    end

    subgraph Retail ["Retail (Chains)"]
        R1[Kiwi, Meny, Spar, Joker]
        R2[Rema 1000]
        R3[Coop Extra, Obs, Prix]
        R4[Bunnpris]
    end

    subgraph Consumers ["Consumers (5.5 Million)"]
        C1(Norwegian Households)
    end

    P1 --> W1
    P1 --> W2
    P1 --> W3
    P2 --> W1
    P2 --> W2
    P2 --> W3
    P3 --> W1
    P3 --> W2
    P3 --> W3
    P4 --> W1
    P4 --> W2
    P4 --> W3

    W1 ==>|~44% Market Share| R1
    W1 -.->|Supply| R4
    W2 ==>|~23% Market Share| R2
    W3 ==>|~29% Market Share| R3

    R1 --> C1
    R2 --> C1
    R3 --> C1
    R4 --> C1

    style W1 fill:#ff9900,stroke:#fbbf24,color:#000
    style W2 fill:#0066cc,stroke:#3b82f6,color:#fff
    style W3 fill:#cc0000,stroke:#ef4444,color:#fff
    style Production fill:#1e3a5f,stroke:#3b82f6,color:#93c5fd
    style Wholesale fill:#4c0519,stroke:#ec4899,color:#f9a8d4
    style Retail fill:#14532d,stroke:#22c55e,color:#86efac
    style Consumers fill:#451a03,stroke:#f59e0b,color:#fcd34d
`;

type FlowTab = "food-flow" | "value-chain" | "supply-chain" | "network-graph";

interface TabConfig {
    id: FlowTab;
    label: { en: string; no: string };
    description: { en: string; no: string };
    icon: React.ReactNode;
}

const TABS: TabConfig[] = [
    {
        id: "food-flow",
        label: { en: "Food Flows", no: "Matstrommer" },
        description: {
            en: "Annual food production, imports, and consumption flows in Norway",
            no: "Arlig matproduksjon, import og forbruksstromme i Norge",
        },
        icon: (
            <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                />
            </svg>
        ),
    },
    {
        id: "value-chain",
        label: { en: "Value Chain", no: "Verdikjede" },
        description: {
            en: "Market concentration from producers through wholesale to consumers",
            no: "Markedskonsentrasjon fra produsenter via grossist til forbrukere",
        },
        icon: (
            <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
            </svg>
        ),
    },
    {
        id: "supply-chain",
        label: { en: "Supply Chain Sankey", no: "Forsyningskjede Sankey" },
        description: {
            en: "Interactive Sankey diagram showing food flow from farms to retail",
            no: "Interaktivt Sankey-diagram som viser matflyt fra gard til butikk",
        },
        icon: (
            <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
            </svg>
        ),
    },
    {
        id: "network-graph",
        label: { en: "Network Graph", no: "Nettverksgraf" },
        description: {
            en: "Force-directed network showing ownership and supply relationships",
            no: "Kraftstyrt nettverk som viser eierskap og forsyningsforhold",
        },
        icon: (
            <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
            </svg>
        ),
    },
];

interface SystemFlowsSectionProps {
    isNorwegian?: boolean;
}

export default function SystemFlowsSection({
    isNorwegian = false,
}: SystemFlowsSectionProps) {
    const [activeTab, setActiveTab] = useState<FlowTab>("food-flow");

    const t = <T,>(en: T, no: T): T => (isNorwegian ? no : en);

    const activeConfig = TABS.find((tab) => tab.id === activeTab)!;

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm">
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                    </svg>
                    {t("System Flows", "Systemstromme")}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                    {t("Visualizing the Food System", "Visualisering av matsystemet")}
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    {t(
                        "Interactive diagrams showing how food flows through Norway's supply chain",
                        "Interaktive diagrammer som viser hvordan mat stromme gjennom Norges forsyningskjede"
                    )}
                </p>
            </div>

            <div
                className="flex justify-center gap-3"
                role="tablist"
                aria-label={t("System flow diagrams", "Systemstrom-diagrammer")}
            >
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        aria-controls={`panel-${tab.id}`}
                        id={`tab-${tab.id}`}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                            activeTab === tab.id
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                                : "bg-gray-800/60 text-gray-400 border-gray-700 hover:bg-gray-700/60"
                        }`}
                    >
                        {tab.icon}
                        <span>{isNorwegian ? tab.label.no : tab.label.en}</span>
                    </button>
                ))}
            </div>

            <div
                role="tabpanel"
                id={`panel-${activeTab}`}
                aria-labelledby={`tab-${activeTab}`}
                className="bg-gray-800/40 rounded-xl border border-gray-700/50 p-6"
            >
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-1">
                        {isNorwegian ? activeConfig.label.no : activeConfig.label.en}
                    </h3>
                    <p className="text-sm text-gray-400">
                        {isNorwegian
                            ? activeConfig.description.no
                            : activeConfig.description.en}
                    </p>
                </div>

                {activeTab === "supply-chain" ? (
                    <SupplyChainSankey isNorwegian={isNorwegian} />
                ) : activeTab === "network-graph" ? (
                    <SupplyNetworkGraph isNorwegian={isNorwegian} />
                ) : (
                    <>
                        <div className="bg-gray-900/60 rounded-lg p-4 overflow-hidden">
                            {activeTab === "food-flow" && (
                                <MermaidDiagram
                                    code={FOOD_FLOW_DIAGRAM}
                                    id="food-flow-diagram"
                                    className="[&_svg]:mx-auto [&_svg]:max-w-full"
                                />
                            )}
                            {activeTab === "value-chain" && (
                                <MermaidDiagram
                                    code={VALUE_CHAIN_DIAGRAM}
                                    id="value-chain-diagram"
                                    className="[&_svg]:mx-auto [&_svg]:max-w-full"
                                />
                            )}
                        </div>

                        <div className="mt-4 text-xs text-gray-500 text-center">
                            {t(
                                "Data sources: SSB, Virke Dagligvare Report 2024",
                                "Datakilder: SSB, Virke Dagligvarerapport 2024"
                            )}
                        </div>
                    </>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-800/40 rounded-lg border border-gray-700/50 p-4">
                    <h4 className="text-sm font-semibold text-emerald-400 mb-2">
                        {t("Key Insight: The Hourglass", "Nokkelfunn: Timeglasset")}
                    </h4>
                    <p className="text-sm text-gray-300">
                        {t(
                            "Thousands of producers and millions of consumers pass through just 3 wholesale gatekeepers. This 'hourglass' structure concentrates power at the narrowest point.",
                            "Tusenvis av produsenter og millioner av forbrukere gar gjennom bare 3 grossistportvoktere. Denne 'timeglass'-strukturen konsentrerer makt pa det smaleste punktet."
                        )}
                    </p>
                </div>
                <div className="bg-gray-800/40 rounded-lg border border-gray-700/50 p-4">
                    <h4 className="text-sm font-semibold text-blue-400 mb-2">
                        {t("Export Paradox", "Eksportparadoks")}
                    </h4>
                    <p className="text-sm text-gray-300">
                        {t(
                            "Norway exports ~2.8M tonnes of seafood annually while importing ~520k tonnes of other food. We're a net exporter by volume, but heavily import-dependent for calories.",
                            "Norge eksporterer ~2,8M tonn sjomat arlig mens vi importerer ~520k tonn annen mat. Vi er nettoeksporter i volum, men sterkt importavhengige for kalorier."
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}
