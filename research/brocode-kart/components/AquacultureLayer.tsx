"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { AquacultureSite, AquacultureProductionType } from '@/lib/food-systems/types';
import { AQUACULTURE_PRODUCTION_COLORS, AQUACULTURE_PRODUCTION_LABELS } from '@/lib/food-systems/types';

interface AquacultureLayerProps {
    map: L.Map | null;
    sites: AquacultureSite[];
    isActive: boolean;
}

function createSiteIcon(productionType: AquacultureProductionType, size: number = 20): L.DivIcon {
    const color = AQUACULTURE_PRODUCTION_COLORS[productionType];
    return L.divIcon({
        className: 'aquaculture-site-marker',
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
                    <path d="M12 20c4.97 0 9-4.48 9-10S16.97 0 12 0 3 4.48 3 10s4.03 10 9 10zm0-2c-3.87 0-7-3.58-7-8s3.13-8 7-8 7 3.58 7 8-3.13 8-7 8z"/>
                </svg>
            </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

function createClusterIcon(count: number, types: AquacultureProductionType[]): L.DivIcon {
    const size = Math.min(30 + Math.log2(count) * 8, 50);
    const dominantType = types.length > 0
        ? types.sort((a, b) =>
            types.filter(t => t === b).length - types.filter(t => t === a).length
          )[0]
        : 'matfisk';
    const color = AQUACULTURE_PRODUCTION_COLORS[dominantType] ?? '#6B7280';

    return L.divIcon({
        className: 'aquaculture-cluster',
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
    sites: AquacultureSite[];
}

function clusterSites(sites: AquacultureSite[], zoomLevel: number): Cluster[] {
    if (zoomLevel >= 11) {
        return sites.map(site => ({
            center: [site.coordinates[1], site.coordinates[0]],
            sites: [site],
        }));
    }

    const gridSize = zoomLevel < 5 ? 4 : zoomLevel < 7 ? 2 : zoomLevel < 9 ? 1 : 0.3;
    const grid: Record<string, AquacultureSite[]> = {};

    sites.forEach(site => {
        const [lng, lat] = site.coordinates;
        const cellX = Math.floor(lng / gridSize);
        const cellY = Math.floor(lat / gridSize);
        const key = `${cellX},${cellY}`;

        if (!grid[key]) grid[key] = [];
        grid[key].push(site);
    });

    return Object.values(grid).map(clusterSites => {
        const avgLat = clusterSites.reduce((sum, s) => sum + s.coordinates[1], 0) / clusterSites.length;
        const avgLng = clusterSites.reduce((sum, s) => sum + s.coordinates[0], 0) / clusterSites.length;
        return {
            center: [avgLat, avgLng],
            sites: clusterSites,
        };
    });
}

function formatCapacity(capacity: number, unit: string): string {
    if (capacity === 0) return 'N/A';
    if (unit === 'TN') return `${capacity.toLocaleString()} tonnes`;
    if (unit === 'STK') return `${capacity.toLocaleString()} individuals`;
    if (unit === 'DA') return `${capacity.toLocaleString()} da`;
    return `${capacity.toLocaleString()} ${unit}`;
}

export default function AquacultureLayer({ map, sites, isActive }: AquacultureLayerProps) {
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
            const bounds = map.getBounds();

            // Filter sites by viewport for performance
            const visibleSites = sites.filter(site => {
                const lat = site.coordinates[1];
                const lng = site.coordinates[0];
                return bounds.contains([lat, lng]);
            });

            const clusters = clusterSites(visibleSites, zoomLevel);

            clusters.forEach(cluster => {
                if (cluster.sites.length === 1) {
                    const site = cluster.sites[0];
                    const marker = L.marker(cluster.center as [number, number], {
                        icon: createSiteIcon(site.productionType),
                    });

                    const typeLabel = AQUACULTURE_PRODUCTION_LABELS[site.productionType];
                    const color = AQUACULTURE_PRODUCTION_COLORS[site.productionType];

                    marker.bindPopup(`
                        <div style="min-width: 240px;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                <div style="
                                    width: 14px; height: 14px;
                                    background-color: ${color};
                                    border-radius: 50%;
                                "></div>
                                <strong style="font-size: 14px;">${site.name}</strong>
                            </div>
                            <div style="font-size: 12px; color: #666;">
                                <div><strong>ID:</strong> ${site.id}</div>
                                <div><strong>Type:</strong> ${typeLabel.en} (${typeLabel.no})</div>
                                <div><strong>Capacity:</strong> ${formatCapacity(site.capacity, site.capacityUnit)}</div>
                                <div><strong>Location:</strong> ${site.placement === 'sea' ? '🌊 Sea' : '🏭 Land'}</div>
                                <div><strong>Water:</strong> ${site.waterType}</div>
                                <div style="margin-top: 6px;"><strong>Species:</strong></div>
                                <div style="font-size: 11px; color: #888; max-height: 60px; overflow-y: auto;">
                                    ${site.species.join(', ')}
                                </div>
                                <div style="margin-top: 6px; border-top: 1px solid #eee; padding-top: 6px;">
                                    <strong>${site.municipality}, ${site.county}</strong>
                                </div>
                            </div>
                        </div>
                    `);

                    marker.addTo(layerGroup);
                } else {
                    const types = cluster.sites.map(s => s.productionType);
                    const marker = L.marker(cluster.center as [number, number], {
                        icon: createClusterIcon(cluster.sites.length, types),
                    });

                    const typeCounts: Record<string, number> = {};
                    let totalCapacity = 0;
                    cluster.sites.forEach(s => {
                        typeCounts[s.productionType] = (typeCounts[s.productionType] || 0) + 1;
                        if (s.capacityUnit === 'TN') totalCapacity += s.capacity;
                    });

                    const typeBreakdown = Object.entries(typeCounts)
                        .map(([type, count]) => {
                            const label = AQUACULTURE_PRODUCTION_LABELS[type as AquacultureProductionType];
                            const color = AQUACULTURE_PRODUCTION_COLORS[type as AquacultureProductionType];
                            return `
                                <div style="display: flex; align-items: center; gap: 4px;">
                                    <div style="
                                        width: 8px; height: 8px;
                                        background-color: ${color};
                                        border-radius: 50%;
                                    "></div>
                                    <span>${label.en}: ${count}</span>
                                </div>
                            `;
                        })
                        .join('');

                    const seaCount = cluster.sites.filter(s => s.placement === 'sea').length;
                    const landCount = cluster.sites.filter(s => s.placement === 'land').length;

                    marker.bindPopup(`
                        <div style="min-width: 220px;">
                            <strong>${cluster.sites.length} Aquaculture Sites</strong>
                            <div style="font-size: 12px; color: #666; margin-top: 8px;">
                                <div style="margin-bottom: 6px;"><strong>By Type:</strong></div>
                                ${typeBreakdown}
                                <div style="margin-top: 8px; border-top: 1px solid #eee; padding-top: 6px;">
                                    <div>🌊 Sea: ${seaCount} | 🏭 Land: ${landCount}</div>
                                    ${totalCapacity > 0 ? `<div><strong>Total Capacity:</strong> ${totalCapacity.toLocaleString()} tonnes</div>` : ''}
                                </div>
                            </div>
                        </div>
                    `);

                    marker.addTo(layerGroup);
                }
            });
        };

        updateMarkers();

        let debounceTimer: ReturnType<typeof setTimeout>;
        const debouncedUpdate = () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(updateMarkers, 200);
        };

        map.on('zoomend', debouncedUpdate);
        map.on('moveend', debouncedUpdate);

        return () => {
            clearTimeout(debounceTimer);
            map.off('zoomend', debouncedUpdate);
            map.off('moveend', debouncedUpdate);
            layerGroup.clearLayers();
            map.removeLayer(layerGroup);
        };
    }, [map, sites, isActive]);

    return null;
}
