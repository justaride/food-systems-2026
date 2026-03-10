"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Port, PortType } from '@/lib/food-systems/types';
import { PORT_TYPE_COLORS } from '@/lib/food-systems/types';

interface PortLayerProps {
    map: L.Map | null;
    ports: Port[];
    isActive: boolean;
}

const PORT_TYPE_LABELS: Record<PortType, string> = {
    'fishing': 'Fishing',
    'cargo': 'Cargo',
    'mixed': 'Mixed',
    'aquaculture': 'Aquaculture',
};

function createPortIcon(type: PortType, tonnage?: number): L.DivIcon {
    const color = PORT_TYPE_COLORS[type] ?? '#6B7280';
    const baseSize = 20;
    const size = tonnage && tonnage > 0 ? Math.min(baseSize + Math.log10(tonnage) * 3, 36) : baseSize;

    return L.divIcon({
        className: 'port-marker',
        html: `
            <div style="
                width: ${size}px;
                height: ${size}px;
                background-color: ${color};
                border: 2px solid white;
                border-radius: 4px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <svg viewBox="0 0 24 24" fill="white" width="${size * 0.6}px" height="${size * 0.6}px">
                    <path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-2 .9-2 2v4.62l-1.29.42c-.26.08-.48.26-.6.5s-.15.52-.06.78L3.95 19zM6 6h12v3.97L12 8 6 9.97V6z"/>
                </svg>
            </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

function createClusterIcon(count: number, types: PortType[]): L.DivIcon {
    const size = Math.min(40 + count * 2, 60);
    const dominantType = types.length > 0
        ? types.sort((a, b) =>
            types.filter(t => t === b).length - types.filter(t => t === a).length
          )[0]
        : 'mixed';
    const color = PORT_TYPE_COLORS[dominantType] ?? '#6B7280';

    return L.divIcon({
        className: 'port-cluster',
        html: `
            <div style="
                width: ${size}px;
                height: ${size}px;
                background-color: ${color};
                border: 3px solid white;
                border-radius: 8px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.35);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: white;
                font-size: ${size * 0.35}px;
            ">
                ${count}
            </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

interface Cluster {
    center: [number, number];
    ports: Port[];
}

function clusterPorts(ports: Port[], zoomLevel: number): Cluster[] {
    if (zoomLevel >= 8) {
        return ports.map(port => ({
            center: [port.coordinates[1], port.coordinates[0]],
            ports: [port],
        }));
    }

    const gridSize = zoomLevel < 5 ? 4 : zoomLevel < 7 ? 2 : 1;
    const grid: Record<string, Port[]> = {};

    ports.forEach(port => {
        const [lng, lat] = port.coordinates;
        const cellX = Math.floor(lng / gridSize);
        const cellY = Math.floor(lat / gridSize);
        const key = `${cellX},${cellY}`;

        if (!grid[key]) grid[key] = [];
        grid[key].push(port);
    });

    return Object.values(grid).map(clusterPorts => {
        const avgLat = clusterPorts.reduce((sum, p) => sum + p.coordinates[1], 0) / clusterPorts.length;
        const avgLng = clusterPorts.reduce((sum, p) => sum + p.coordinates[0], 0) / clusterPorts.length;
        return {
            center: [avgLat, avgLng],
            ports: clusterPorts,
        };
    });
}

function formatTonnage(tonnage: number): string {
    if (tonnage >= 1000000) {
        return `${(tonnage / 1000000).toFixed(1)}M`;
    }
    if (tonnage >= 1000) {
        return `${(tonnage / 1000).toFixed(0)}K`;
    }
    return tonnage.toLocaleString();
}

export default function PortLayer({ map, ports, isActive }: PortLayerProps) {
    const layerGroupRef = useRef<L.LayerGroup | null>(null);

    useEffect(() => {
        if (!map) return;

        if (!layerGroupRef.current) {
            layerGroupRef.current = L.layerGroup();
        }

        const layerGroup = layerGroupRef.current;

        if (!isActive) {
            layerGroup.clearLayers();
            map.removeLayer(layerGroup);
            return;
        }

        layerGroup.addTo(map);

        const updateMarkers = () => {
            layerGroup.clearLayers();
            const zoomLevel = map.getZoom();
            const clusters = clusterPorts(ports, zoomLevel);

            clusters.forEach(cluster => {
                if (cluster.ports.length === 1) {
                    const port = cluster.ports[0];
                    const marker = L.marker(cluster.center as [number, number], {
                        icon: createPortIcon(port.type, port.annualTonnage),
                    });

                    const catches = port.primaryCatch?.join(', ') || '';
                    const facilities = port.facilities?.join(', ') || '';

                    let popupContent = `
                        <div style="min-width: 200px;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                <div style="
                                    width: 14px; height: 14px;
                                    background-color: ${PORT_TYPE_COLORS[port.type]};
                                    border-radius: 3px;
                                "></div>
                                <strong style="font-size: 14px;">${port.name}</strong>
                            </div>
                            <div style="font-size: 12px; color: #666;">
                                <div><strong>Type:</strong> ${PORT_TYPE_LABELS[port.type]}</div>
                                <div><strong>Region:</strong> ${port.region}</div>
                    `;

                    if (port.annualTonnage) {
                        popupContent += `<div><strong>Annual Tonnage:</strong> ${formatTonnage(port.annualTonnage)} tonnes</div>`;
                    }
                    if (catches) {
                        popupContent += `<div><strong>Primary Catch:</strong> ${catches}</div>`;
                    }
                    if (facilities) {
                        popupContent += `<div><strong>Facilities:</strong> ${facilities}</div>`;
                    }

                    popupContent += `</div></div>`;

                    marker.bindPopup(popupContent);
                    marker.addTo(layerGroup);
                } else {
                    const types = cluster.ports.map(p => p.type);
                    const marker = L.marker(cluster.center as [number, number], {
                        icon: createClusterIcon(cluster.ports.length, types),
                    });

                    const typeCounts: Record<string, number> = {};
                    let totalTonnage = 0;
                    cluster.ports.forEach(p => {
                        typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
                        if (p.annualTonnage) totalTonnage += p.annualTonnage;
                    });

                    const breakdown = Object.entries(typeCounts)
                        .map(([type, count]) => `
                            <div style="display: flex; align-items: center; gap: 4px;">
                                <div style="
                                    width: 8px; height: 8px;
                                    background-color: ${PORT_TYPE_COLORS[type as PortType]};
                                    border-radius: 2px;
                                "></div>
                                <span>${PORT_TYPE_LABELS[type as PortType]}: ${count}</span>
                            </div>
                        `)
                        .join('');

                    let popupContent = `
                        <div style="min-width: 160px;">
                            <strong>${cluster.ports.length} Ports</strong>
                            <div style="font-size: 12px; color: #666; margin-top: 8px;">
                                ${breakdown}
                    `;

                    if (totalTonnage > 0) {
                        popupContent += `
                            <div style="margin-top: 6px; border-top: 1px solid #eee; padding-top: 6px;">
                                <strong>Total Tonnage:</strong> ${formatTonnage(totalTonnage)} tonnes
                            </div>
                        `;
                    }

                    popupContent += `</div></div>`;

                    marker.bindPopup(popupContent);
                    marker.addTo(layerGroup);
                }
            });
        };

        updateMarkers();
        map.on('zoomend', updateMarkers);

        return () => {
            map.off('zoomend', updateMarkers);
            layerGroup.clearLayers();
            map.removeLayer(layerGroup);
        };
    }, [map, ports, isActive]);

    return null;
}
