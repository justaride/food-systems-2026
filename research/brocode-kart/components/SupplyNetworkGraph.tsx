"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { usePlotly } from "./PlotlyChart";
import { GROCERY_GROUPS } from "@/data/food-systems/chains";
import { CHAIN_CONFIGS, ChainId } from "@/lib/food-systems/types";

interface SupplyNetworkGraphProps {
    isNorwegian?: boolean;
}

interface NetworkNode {
    id: string;
    label: string;
    type: "parent" | "chain" | "hub";
    parent?: string;
    x: number;
    y: number;
    size: number;
    color: string;
}

interface NetworkEdge {
    source: string;
    target: string;
    type: "ownership" | "supply";
    weight: number;
}

interface HubData {
    id: string;
    name: string;
    owner: string;
    type: string;
    city: string;
}

const PARENT_COLORS: Record<string, string> = {
    NorgesGruppen: "#1565C0",
    "Coop Norge": "#E30613",
    Reitangruppen: "#4CAF50",
    "Bunnpris AS": "#FF9800",
};

const MARKET_SHARES: Record<string, number> = {
    NorgesGruppen: 44,
    "Coop Norge": 29,
    Reitangruppen: 24,
    "Bunnpris AS": 3,
};

function forceSimulation(
    nodes: NetworkNode[],
    edges: NetworkEdge[],
    iterations: number = 100
): NetworkNode[] {
    const result = nodes.map((n) => ({ ...n }));
    const k = 0.15;
    const repulsion = 2000;
    const attraction = 0.02;

    for (let iter = 0; iter < iterations; iter++) {
        const cooling = 1 - iter / iterations;

        for (let i = 0; i < result.length; i++) {
            for (let j = i + 1; j < result.length; j++) {
                const dx = result[j].x - result[i].x;
                const dy = result[j].y - result[i].y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
                const force = (repulsion / (dist * dist)) * cooling;
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;
                result[i].x -= fx * k;
                result[i].y -= fy * k;
                result[j].x += fx * k;
                result[j].y += fy * k;
            }
        }

        for (const edge of edges) {
            const source = result.find((n) => n.id === edge.source);
            const target = result.find((n) => n.id === edge.target);
            if (!source || !target) continue;

            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
            const force = dist * attraction * edge.weight * cooling;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            source.x += fx * k;
            source.y += fy * k;
            target.x -= fx * k;
            target.y -= fy * k;
        }

        for (const node of result) {
            if (node.type === "parent") {
                node.y = Math.max(0.1, Math.min(0.3, node.y));
            } else if (node.type === "chain") {
                node.y = Math.max(0.35, Math.min(0.65, node.y));
            } else {
                node.y = Math.max(0.7, Math.min(0.95, node.y));
            }
            node.x = Math.max(0.05, Math.min(0.95, node.x));
        }
    }

    return result;
}

export default function SupplyNetworkGraph({
    isNorwegian = false,
}: SupplyNetworkGraphProps) {
    const { Plot: PlotComponent, isLoading, error: plotError } = usePlotly();
    const [hubs, setHubs] = useState<HubData[]>([]);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);

    useEffect(() => {
        fetch("/data/food-systems/logistics_hubs.geojson")
            .then((res) => res.json())
            .then((data) => {
                const hubData: HubData[] = data.features.map((f: any) => ({
                    id: f.properties.id,
                    name: f.properties.name,
                    owner: f.properties.owner,
                    type: f.properties.type,
                    city: f.properties.city,
                }));
                setHubs(hubData);
            })
            .catch((err) => console.error("Failed to load hubs:", err));
    }, []);

    const t = useCallback(<T,>(en: T, no: T): T => (isNorwegian ? no : en), [isNorwegian]);

    const { nodes, edges } = useMemo(() => {
        const nodeList: NetworkNode[] = [];
        const edgeList: NetworkEdge[] = [];

        const parentPositions: Record<string, number> = {
            NorgesGruppen: 0.2,
            "Coop Norge": 0.45,
            Reitangruppen: 0.7,
            "Bunnpris AS": 0.9,
        };

        Object.values(GROCERY_GROUPS).forEach((group) => {
            const parentName = group.name;
            nodeList.push({
                id: group.id,
                label: `${parentName} (${MARKET_SHARES[parentName]}%)`,
                type: "parent",
                x: parentPositions[parentName] || 0.5,
                y: 0.15,
                size: 30 + MARKET_SHARES[parentName] * 0.5,
                color: PARENT_COLORS[parentName] || "#6B7280",
            });
        });

        let chainIndex = 0;
        Object.values(GROCERY_GROUPS).forEach((group) => {
            const parentX = parentPositions[group.name] || 0.5;
            const chainCount = group.chains.length;
            group.chains.forEach((chainId, idx) => {
                const config = CHAIN_CONFIGS[chainId as ChainId];
                if (!config) return;

                const spread = 0.15;
                const offset = chainCount > 1 ? (idx - (chainCount - 1) / 2) * (spread / chainCount) : 0;

                nodeList.push({
                    id: chainId,
                    label: config.name,
                    type: "chain",
                    parent: group.id,
                    x: parentX + offset,
                    y: 0.5 + (chainIndex % 3) * 0.05,
                    size: 18,
                    color: config.color,
                });

                edgeList.push({
                    source: group.id,
                    target: chainId,
                    type: "ownership",
                    weight: 2,
                });

                chainIndex++;
            });
        });

        const ownerToParent: Record<string, string> = {
            NorgesGruppen: "norgesgruppen",
            Coop: "coop",
            "Rema 1000": "reitangruppen",
            "Bunnpris AS": "bunnpris",
        };

        hubs.forEach((hub, idx) => {
            const parentId = ownerToParent[hub.owner] || "norgesgruppen";
            const parent = nodeList.find((n) => n.id === parentId);
            const baseX = parent?.x || 0.5;

            nodeList.push({
                id: hub.id,
                label: hub.name,
                type: "hub",
                parent: parentId,
                x: baseX + (Math.random() - 0.5) * 0.1,
                y: 0.85 + (idx % 4) * 0.03,
                size: hub.type === "Central Hub" ? 15 : 10,
                color: PARENT_COLORS[Object.keys(ownerToParent).find((k) => ownerToParent[k] === parentId) || "NorgesGruppen"] || "#6B7280",
            });

            const parentGroup = Object.values(GROCERY_GROUPS).find((g) => g.id === parentId);
            if (parentGroup) {
                parentGroup.chains.forEach((chainId) => {
                    edgeList.push({
                        source: hub.id,
                        target: chainId,
                        type: "supply",
                        weight: 1,
                    });
                });
            }
        });

        const simulatedNodes = forceSimulation(nodeList, edgeList, 80);

        return { nodes: simulatedNodes, edges: edgeList };
    }, [hubs]);

    const handleClick = useCallback((event: any) => {
        if (event.points && event.points[0]) {
            const pointIndex = event.points[0].pointIndex;
            const clickedNode = nodes[pointIndex];
            if (clickedNode) {
                setSelectedNode(selectedNode === clickedNode.id ? null : clickedNode.id);
            }
        }
    }, [nodes, selectedNode]);

    const { nodeTrace, edgeTraces } = useMemo(() => {
        const ownershipEdges: { x: (number | null)[]; y: (number | null)[] } = { x: [], y: [] };
        const supplyEdges: { x: (number | null)[]; y: (number | null)[] } = { x: [], y: [] };

        edges.forEach((edge) => {
            const source = nodes.find((n) => n.id === edge.source);
            const target = nodes.find((n) => n.id === edge.target);
            if (!source || !target) return;

            const isHighlighted = !selectedNode || selectedNode === edge.source || selectedNode === edge.target;
            if (!isHighlighted && selectedNode) return;

            const edgeCollection = edge.type === "ownership" ? ownershipEdges : supplyEdges;
            edgeCollection.x.push(source.x, target.x, null);
            edgeCollection.y.push(source.y, target.y, null);
        });

        const filteredNodes = selectedNode
            ? nodes.filter((n) => {
                  if (n.id === selectedNode) return true;
                  const relatedEdge = edges.find(
                      (e) =>
                          (e.source === selectedNode && e.target === n.id) ||
                          (e.target === selectedNode && e.source === n.id)
                  );
                  return !!relatedEdge;
              })
            : nodes;

        const nodeTrace = {
            type: "scatter" as const,
            mode: "markers+text" as const,
            x: filteredNodes.map((n) => n.x),
            y: filteredNodes.map((n) => n.y),
            text: filteredNodes.map((n) => n.label),
            textposition: filteredNodes.map((n) =>
                n.type === "parent" ? "top center" : n.type === "chain" ? "bottom center" : "right"
            ),
            textfont: {
                size: filteredNodes.map((n) => (n.type === "parent" ? 12 : n.type === "chain" ? 10 : 8)),
                color: "#E5E7EB",
            },
            marker: {
                size: filteredNodes.map((n) => n.size),
                color: filteredNodes.map((n) => n.color),
                line: {
                    width: filteredNodes.map((n) => (n.type === "parent" ? 3 : 1)),
                    color: filteredNodes.map((n) => (n.type === "parent" ? "#F9FAFB" : "#374151")),
                },
                opacity: filteredNodes.map(() => (selectedNode ? 1 : 0.9)),
            },
            hovertemplate: filteredNodes.map((n) => {
                if (n.type === "parent") {
                    return `<b>${n.label}</b><br>Type: Parent Company<extra></extra>`;
                } else if (n.type === "chain") {
                    const parent = nodes.find((p) => p.id === n.parent);
                    return `<b>${n.label}</b><br>Parent: ${parent?.label || "Unknown"}<br>Type: Retail Chain<extra></extra>`;
                } else {
                    const hub = hubs.find((h) => h.id === n.id);
                    return `<b>${n.label}</b><br>Owner: ${hub?.owner || "Unknown"}<br>Type: ${hub?.type || "Hub"}<br>City: ${hub?.city || "Unknown"}<extra></extra>`;
                }
            }),
            customdata: filteredNodes.map((n) => n.id),
        };

        const ownershipTrace = {
            type: "scatter" as const,
            mode: "lines" as const,
            x: ownershipEdges.x,
            y: ownershipEdges.y,
            line: {
                width: 2,
                color: "#60A5FA",
            },
            hoverinfo: "skip" as const,
            showlegend: true,
            name: t("Ownership", "Eierskap"),
        };

        const supplyTrace = {
            type: "scatter" as const,
            mode: "lines" as const,
            x: supplyEdges.x,
            y: supplyEdges.y,
            line: {
                width: 1,
                color: "#34D39980",
                dash: "dot" as const,
            },
            hoverinfo: "skip" as const,
            showlegend: true,
            name: t("Supply", "Forsyning"),
        };

        return {
            nodeTrace,
            edgeTraces: [ownershipTrace, supplyTrace],
        };
    }, [nodes, edges, hubs, selectedNode, t]);

    const layout = useMemo(
        () => ({
            font: {
                family: "Inter, system-ui, sans-serif",
                color: "#E5E7EB",
            },
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            margin: { l: 20, r: 20, t: 60, b: 40 },
            title: {
                text: t(
                    "Norwegian Grocery Supply Network",
                    "Norsk dagligvareforsyningsnettverk"
                ),
                font: { size: 16, color: "#F9FAFB" },
                x: 0.5,
                xanchor: "center" as const,
            },
            xaxis: {
                showgrid: false,
                zeroline: false,
                showticklabels: false,
                range: [-0.05, 1.05],
            },
            yaxis: {
                showgrid: false,
                zeroline: false,
                showticklabels: false,
                range: [-0.05, 1.1],
            },
            legend: {
                x: 0.02,
                y: 0.98,
                bgcolor: "rgba(31, 41, 55, 0.8)",
                bordercolor: "#374151",
                borderwidth: 1,
                font: { size: 10, color: "#E5E7EB" },
            },
            annotations: [
                {
                    x: 0.5,
                    y: 1.02,
                    xref: "paper" as const,
                    yref: "paper" as const,
                    text: t("Parent Companies", "Morselskaper"),
                    showarrow: false,
                    font: { size: 10, color: "#9CA3AF" },
                    xanchor: "center" as const,
                },
                {
                    x: 0.5,
                    y: 0.58,
                    xref: "paper" as const,
                    yref: "paper" as const,
                    text: t("Retail Chains", "Butikkjeder"),
                    showarrow: false,
                    font: { size: 10, color: "#9CA3AF" },
                    xanchor: "center" as const,
                },
                {
                    x: 0.5,
                    y: 0.18,
                    xref: "paper" as const,
                    yref: "paper" as const,
                    text: t("Logistics Hubs", "Logistikksentre"),
                    showarrow: false,
                    font: { size: 10, color: "#9CA3AF" },
                    xanchor: "center" as const,
                },
            ],
            hovermode: "closest" as const,
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
                    {t("Loading network visualization...", "Laster nettverksvisualisering...")}
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
                <p className="text-sm text-gray-400">
                    {t(
                        "Click nodes to highlight connections. Shows parent companies, retail chains, and logistics hubs.",
                        "Klikk noder for a fremheve forbindelser. Viser morselskaper, butikkjeder og logistikksentre."
                    )}
                </p>
                {selectedNode && (
                    <button
                        onClick={() => setSelectedNode(null)}
                        className="px-3 py-1.5 text-sm rounded-lg border bg-gray-800/60 text-gray-400 border-gray-700 hover:bg-gray-700/60 transition-all"
                    >
                        {t("Clear Selection", "Fjern valg")}
                    </button>
                )}
            </div>

            <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 overflow-hidden">
                <PlotComponent
                    data={[...edgeTraces, nodeTrace]}
                    layout={layout}
                    config={{
                        responsive: true,
                        displayModeBar: true,
                        displaylogo: false,
                        modeBarButtonsToRemove: ["lasso2d", "select2d", "autoScale2d"],
                    }}
                    style={{ width: "100%", height: "600px" }}
                    onClick={handleClick}
                />
            </div>

            <div className="grid md:grid-cols-4 gap-3">
                {Object.values(GROCERY_GROUPS).map((group) => {
                    const share = MARKET_SHARES[group.name] || 0;
                    return (
                        <div
                            key={group.id}
                            className="bg-gray-800/40 rounded-lg border border-gray-700/50 p-3"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: PARENT_COLORS[group.name] }}
                                />
                                <h4 className="font-semibold text-white text-sm">{group.name}</h4>
                            </div>
                            <p className="text-xs text-gray-400">
                                {share}% {t("market share", "markedsandel")}
                            </p>
                            <p className="text-xs text-gray-500">
                                {group.chains.length} {t("chains", "kjeder")} |{" "}
                                {hubs.filter((h) => h.owner === group.name || (group.name === "Reitangruppen" && h.owner === "Rema 1000")).length}{" "}
                                {t("hubs", "sentre")}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="text-xs text-gray-500 text-center">
                {t(
                    "Data: Virke Dagligvare 2024, company reports. Network layout computed using force-directed simulation.",
                    "Data: Virke Dagligvare 2024, selskapsrapporter. Nettverkslayout beregnet med kraftstyrt simulering."
                )}
            </div>
        </div>
    );
}
