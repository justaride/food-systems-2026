"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Farm, FarmType } from '@/lib/food-systems/types';
import { FARM_TYPE_COLORS } from '@/lib/food-systems/types';

interface FarmLayerProps {
    map: L.Map | null;
    farms: Farm[];
    isActive: boolean;
}

const FARM_TYPE_LABELS: Record<FarmType, string> = {
    'dairy': 'Dairy',
    'grain': 'Grain',
    'vegetables': 'Vegetables',
    'livestock': 'Livestock',
    'mixed': 'Mixed',
};

const FARM_TYPE_ICONS: Record<FarmType, string> = {
    'dairy': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2v-2zm0-12h2v8h-2V5z',
    'grain': 'M12 3L4 9v12h16V9l-8-6zm0 2.18L18 9v10H6V9l6-3.82z',
    'vegetables': 'M17.21 9l-4.38-6.56c-.19-.28-.51-.42-.83-.42-.32 0-.64.14-.83.43L6.79 9C6.3 9.71 6 10.57 6 11.5c0 3.08 2.92 5.5 6 5.5s6-2.42 6-5.5c0-.93-.3-1.79-.79-2.5z',
    'livestock': 'M18 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-5 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
    'mixed': 'M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5z',
};

function createFarmIcon(type: FarmType, size: number = 24): L.DivIcon {
    const color = FARM_TYPE_COLORS[type];
    return L.divIcon({
        className: 'farm-marker',
        html: `
            <div style="
                width: ${size}px;
                height: ${size}px;
                background-color: ${color};
                border: 2px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <svg viewBox="0 0 24 24" fill="white" width="${size * 0.6}px" height="${size * 0.6}px">
                    <path d="${FARM_TYPE_ICONS[type]}"/>
                </svg>
            </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

function createClusterIcon(count: number, types: FarmType[]): L.DivIcon {
    const size = Math.min(40 + count * 2, 60);
    const dominantType = types.length > 0
        ? types.sort((a, b) =>
            types.filter(t => t === b).length - types.filter(t => t === a).length
          )[0]
        : 'mixed';
    const color = FARM_TYPE_COLORS[dominantType] ?? '#6B7280';

    return L.divIcon({
        className: 'farm-cluster',
        html: `
            <div style="
                width: ${size}px;
                height: ${size}px;
                background-color: ${color};
                border: 3px solid white;
                border-radius: 50%;
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
    farms: Farm[];
}

function clusterFarms(farms: Farm[], zoomLevel: number): Cluster[] {
    if (zoomLevel >= 10) {
        return farms.map(farm => ({
            center: [farm.coordinates[1], farm.coordinates[0]],
            farms: [farm],
        }));
    }

    const gridSize = zoomLevel < 6 ? 3 : zoomLevel < 8 ? 1.5 : 0.5;
    const grid: Record<string, Farm[]> = {};

    farms.forEach(farm => {
        const [lng, lat] = farm.coordinates;
        const cellX = Math.floor(lng / gridSize);
        const cellY = Math.floor(lat / gridSize);
        const key = `${cellX},${cellY}`;

        if (!grid[key]) grid[key] = [];
        grid[key].push(farm);
    });

    return Object.values(grid).map(clusterFarms => {
        const avgLat = clusterFarms.reduce((sum, f) => sum + f.coordinates[1], 0) / clusterFarms.length;
        const avgLng = clusterFarms.reduce((sum, f) => sum + f.coordinates[0], 0) / clusterFarms.length;
        return {
            center: [avgLat, avgLng],
            farms: clusterFarms,
        };
    });
}

export default function FarmLayer({ map, farms, isActive }: FarmLayerProps) {
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
            const clusters = clusterFarms(farms, zoomLevel);

            clusters.forEach(cluster => {
                if (cluster.farms.length === 1) {
                    const farm = cluster.farms[0];
                    const marker = L.marker(cluster.center as [number, number], {
                        icon: createFarmIcon(farm.type),
                    });

                    const products = farm.products?.join(', ') || 'Various';
                    marker.bindPopup(`
                        <div style="min-width: 180px;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                <div style="
                                    width: 12px; height: 12px;
                                    background-color: ${FARM_TYPE_COLORS[farm.type]};
                                    border-radius: 50%;
                                "></div>
                                <strong>${FARM_TYPE_LABELS[farm.type]} Farm</strong>
                            </div>
                            <div style="font-size: 12px; color: #666;">
                                <div><strong>Area:</strong> ${farm.productionArea} ha</div>
                                <div><strong>Products:</strong> ${products}</div>
                                <div><strong>Municipality:</strong> ${farm.municipalityCode}</div>
                            </div>
                        </div>
                    `);

                    marker.addTo(layerGroup);
                } else {
                    const types = cluster.farms.map(f => f.type);
                    const marker = L.marker(cluster.center as [number, number], {
                        icon: createClusterIcon(cluster.farms.length, types),
                    });

                    const typeCounts: Record<string, number> = {};
                    cluster.farms.forEach(f => {
                        typeCounts[f.type] = (typeCounts[f.type] || 0) + 1;
                    });

                    const breakdown = Object.entries(typeCounts)
                        .map(([type, count]) => `
                            <div style="display: flex; align-items: center; gap: 4px;">
                                <div style="
                                    width: 8px; height: 8px;
                                    background-color: ${FARM_TYPE_COLORS[type as FarmType]};
                                    border-radius: 50%;
                                "></div>
                                <span>${FARM_TYPE_LABELS[type as FarmType]}: ${count}</span>
                            </div>
                        `)
                        .join('');

                    const totalArea = cluster.farms.reduce((sum, f) => sum + f.productionArea, 0);

                    marker.bindPopup(`
                        <div style="min-width: 160px;">
                            <strong>${cluster.farms.length} Farms</strong>
                            <div style="font-size: 12px; color: #666; margin-top: 8px;">
                                ${breakdown}
                                <div style="margin-top: 6px; border-top: 1px solid #eee; padding-top: 6px;">
                                    <strong>Total Area:</strong> ${totalArea.toLocaleString()} ha
                                </div>
                            </div>
                        </div>
                    `);

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
    }, [map, farms, isActive]);

    return null;
}
