"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { ProcessingPlant, ProcessingPlantType, ProcessingCompany } from '@/lib/food-systems/types';
import { PROCESSING_COMPANY_COLORS, PROCESSING_TYPE_LABELS } from '@/lib/food-systems/types';

interface ProcessingPlantLayerProps {
    map: L.Map | null;
    plants: ProcessingPlant[];
    isActive: boolean;
}

const PROCESSING_TYPE_ICONS: Record<ProcessingPlantType, string> = {
    'dairy': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z',
    'meat': 'M18 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-5 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
    'seafood': 'M12 20c4.97 0 9-4.48 9-10S16.97 0 12 0 3 4.48 3 10s4.03 10 9 10zm0-2c-3.87 0-7-3.58-7-8s3.13-8 7-8 7 3.58 7 8-3.13 8-7 8z',
    'produce': 'M17.21 9l-4.38-6.56c-.19-.28-.51-.42-.83-.42-.32 0-.64.14-.83.43L6.79 9C6.3 9.71 6 10.57 6 11.5c0 3.08 2.92 5.5 6 5.5s6-2.42 6-5.5c0-.93-.3-1.79-.79-2.5z',
    'grain': 'M12 3L4 9v12h16V9l-8-6zm0 2.18L18 9v10H6V9l6-3.82z',
    'beverage': 'M3 2l2.01 18.23C5.13 21.23 5.97 22 7 22h10c1.03 0 1.87-.77 1.99-1.77L21 2H3zm14 18H7L5.22 4h13.56L17 20z',
};

function createPlantIcon(company: ProcessingCompany, type: ProcessingPlantType, size: number = 28): L.DivIcon {
    const color = PROCESSING_COMPANY_COLORS[company];
    return L.divIcon({
        className: 'processing-plant-marker',
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
                    <path d="${PROCESSING_TYPE_ICONS[type]}"/>
                </svg>
            </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

function createClusterIcon(count: number, companies: ProcessingCompany[]): L.DivIcon {
    const size = Math.min(40 + count * 2, 60);
    const dominantCompany = companies.length > 0
        ? companies.sort((a, b) =>
            companies.filter(c => c === b).length - companies.filter(c => c === a).length
          )[0]
        : 'Other';
    const color = PROCESSING_COMPANY_COLORS[dominantCompany] ?? '#6B7280';

    return L.divIcon({
        className: 'processing-plant-cluster',
        html: `
            <div style="
                width: ${size}px;
                height: ${size}px;
                background-color: ${color};
                border: 3px solid white;
                border-radius: 4px;
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
    plants: ProcessingPlant[];
}

function clusterPlants(plants: ProcessingPlant[], zoomLevel: number): Cluster[] {
    if (zoomLevel >= 10) {
        return plants.map(plant => ({
            center: [plant.coordinates[1], plant.coordinates[0]],
            plants: [plant],
        }));
    }

    const gridSize = zoomLevel < 6 ? 3 : zoomLevel < 8 ? 1.5 : 0.5;
    const grid: Record<string, ProcessingPlant[]> = {};

    plants.forEach(plant => {
        const [lng, lat] = plant.coordinates;
        const cellX = Math.floor(lng / gridSize);
        const cellY = Math.floor(lat / gridSize);
        const key = `${cellX},${cellY}`;

        if (!grid[key]) grid[key] = [];
        grid[key].push(plant);
    });

    return Object.values(grid).map(clusterPlants => {
        const avgLat = clusterPlants.reduce((sum, p) => sum + p.coordinates[1], 0) / clusterPlants.length;
        const avgLng = clusterPlants.reduce((sum, p) => sum + p.coordinates[0], 0) / clusterPlants.length;
        return {
            center: [avgLat, avgLng],
            plants: clusterPlants,
        };
    });
}

export default function ProcessingPlantLayer({ map, plants, isActive }: ProcessingPlantLayerProps) {
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
            const clusters = clusterPlants(plants, zoomLevel);

            clusters.forEach(cluster => {
                if (cluster.plants.length === 1) {
                    const plant = cluster.plants[0];
                    const marker = L.marker(cluster.center as [number, number], {
                        icon: createPlantIcon(plant.company, plant.type),
                    });

                    const products = plant.products?.join(', ') || 'Various products';
                    const companyColor = PROCESSING_COMPANY_COLORS[plant.company];

                    marker.bindPopup(`
                        <div style="min-width: 220px;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                <div style="
                                    width: 16px; height: 16px;
                                    background-color: ${companyColor};
                                    border-radius: 4px;
                                "></div>
                                <strong style="font-size: 14px;">${plant.name}</strong>
                            </div>
                            <div style="font-size: 12px; color: #666;">
                                <div><strong>Company:</strong> ${plant.company}</div>
                                <div><strong>Type:</strong> ${PROCESSING_TYPE_LABELS[plant.type]}</div>
                                ${plant.capacity ? `<div><strong>Capacity:</strong> ${plant.capacity}</div>` : ''}
                                ${plant.employees ? `<div><strong>Employees:</strong> ${plant.employees.toLocaleString()}</div>` : ''}
                                <div style="margin-top: 6px;"><strong>Products:</strong> ${products}</div>
                            </div>
                        </div>
                    `);

                    marker.addTo(layerGroup);
                } else {
                    const companies = cluster.plants.map(p => p.company);
                    const marker = L.marker(cluster.center as [number, number], {
                        icon: createClusterIcon(cluster.plants.length, companies),
                    });

                    const companyCounts: Record<string, number> = {};
                    const typeCounts: Record<string, number> = {};
                    cluster.plants.forEach(p => {
                        companyCounts[p.company] = (companyCounts[p.company] || 0) + 1;
                        typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
                    });

                    const companyBreakdown = Object.entries(companyCounts)
                        .map(([company, count]) => `
                            <div style="display: flex; align-items: center; gap: 4px;">
                                <div style="
                                    width: 8px; height: 8px;
                                    background-color: ${PROCESSING_COMPANY_COLORS[company as ProcessingCompany]};
                                    border-radius: 2px;
                                "></div>
                                <span>${company}: ${count}</span>
                            </div>
                        `)
                        .join('');

                    const typeBreakdown = Object.entries(typeCounts)
                        .map(([type, count]) => `${PROCESSING_TYPE_LABELS[type as ProcessingPlantType]}: ${count}`)
                        .join(', ');

                    const totalEmployees = cluster.plants.reduce((sum, p) => sum + (p.employees || 0), 0);

                    marker.bindPopup(`
                        <div style="min-width: 200px;">
                            <strong>${cluster.plants.length} Processing Plants</strong>
                            <div style="font-size: 12px; color: #666; margin-top: 8px;">
                                <div style="margin-bottom: 6px;"><strong>By Company:</strong></div>
                                ${companyBreakdown}
                                <div style="margin-top: 8px; border-top: 1px solid #eee; padding-top: 6px;">
                                    <div><strong>Types:</strong> ${typeBreakdown}</div>
                                    ${totalEmployees > 0 ? `<div><strong>Total Employees:</strong> ${totalEmployees.toLocaleString()}</div>` : ''}
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
    }, [map, plants, isActive]);

    return null;
}
