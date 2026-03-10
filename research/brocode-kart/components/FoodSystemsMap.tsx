"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useFoodSystems } from '@/contexts/FoodSystemsContext';
import { NORWAY_CENTER, DEFAULT_MAP_CONFIG, CHAIN_CONFIGS, LOGISTICS_OWNER_COLORS } from '@/lib/food-systems/types';
import { getDensityColor, getConcentrationColor } from '@/lib/food-systems/metrics';
import type { Store, LogisticsOwner } from '@/lib/food-systems/types';
import type { VulnerabilityScore } from '@/lib/food-systems/vulnerability';
import FoodDesertLayer from './FoodDesertLayer';
import FoodDesertPanel from './FoodDesertPanel';
import FarmLayer from './FarmLayer';
import FlowLayer from './FlowLayer';
import ProcessingPlantLayer from './ProcessingPlantLayer';
import PortLayer from './PortLayer';
import VulnerabilityLayer from './VulnerabilityLayer';
import VulnerabilityPanel from './VulnerabilityPanel';
import AquacultureLayer from './AquacultureLayer';

// Fix Leaflet default icon issue with Next.js
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface StoreCluster {
    center: [number, number];
    stores: Store[];
}

function clusterStores(stores: Store[], zoomLevel: number): StoreCluster[] {
    if (zoomLevel >= 12) {
        return stores.map(store => ({
            center: [store.location.lat, store.location.lng],
            stores: [store],
        }));
    }

    const gridSize = zoomLevel < 6 ? 2 : zoomLevel < 8 ? 1 : zoomLevel < 10 ? 0.5 : 0.2;
    const grid: Record<string, Store[]> = {};

    stores.forEach(store => {
        const cellX = Math.floor(store.location.lng / gridSize);
        const cellY = Math.floor(store.location.lat / gridSize);
        const key = `${cellX},${cellY}`;

        if (!grid[key]) grid[key] = [];
        grid[key].push(store);
    });

    return Object.values(grid).map(clusterStores => {
        const avgLat = clusterStores.reduce((sum, s) => sum + s.location.lat, 0) / clusterStores.length;
        const avgLng = clusterStores.reduce((sum, s) => sum + s.location.lng, 0) / clusterStores.length;
        return {
            center: [avgLat, avgLng],
            stores: clusterStores,
        };
    });
}

function createStoreClusterIcon(count: number, chainIds: string[]): L.DivIcon {
    const size = Math.min(30 + Math.log2(count) * 6, 50);

    const chainCounts: Record<string, number> = {};
    chainIds.forEach(id => {
        chainCounts[id] = (chainCounts[id] || 0) + 1;
    });
    const dominantChain = Object.entries(chainCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const config = CHAIN_CONFIGS[dominantChain as keyof typeof CHAIN_CONFIGS];
    const color = config?.color ?? '#6B7280';

    return L.divIcon({
        className: 'store-cluster',
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

export default function FoodSystemsMap() {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersLayerRef = useRef<L.LayerGroup | null>(null);
    const logisticsLayerRef = useRef<L.LayerGroup | null>(null);
    const boundariesLayerRef = useRef<L.GeoJSON | null>(null);

    const {
        activeLayers,
        activeChains,
        selectedMunicipality,
        setSelectedMunicipality,
        comparisonMunicipality,
        setComparisonMunicipality,
        isComparisonMode,
        setIsPanelOpen,
        municipalityMetrics,
        logisticsHubs,
        zoomToBounds,
        setZoomToBounds,
        stores,
        municipalities,
        geojson,
        desertAnalysis,
        selectedMunicipalityCoverage,
        farms,
        supplyFlows,
        processingPlants,
        ports,
        aquacultureSites,
    } = useFoodSystems();

    const [mapReady, setMapReady] = useState(false);
    const [vulnerabilityScores, setVulnerabilityScores] = useState<Record<string, VulnerabilityScore>>({});

    const handleVulnerabilityScoresCalculated = useCallback((scores: Record<string, VulnerabilityScore>) => {
        setVulnerabilityScores(scores);
    }, []);

    // Determine active choropleth mode
    const choroplethMode = activeLayers.includes('density')
        ? 'density'
        : activeLayers.includes('concentration')
            ? 'concentration'
            : null;

    // Ref for Leaflet event handlers to access current React state without layer recreation
    const mapStateRef = useRef({
        selectedMunicipality,
        comparisonMunicipality,
        isComparisonMode,
        choroplethMode,
        municipalityMetrics,
        municipalities,
    });
    mapStateRef.current = {
        selectedMunicipality,
        comparisonMunicipality,
        isComparisonMode,
        choroplethMode,
        municipalityMetrics,
        municipalities,
    };

    const getFeatureStyle = useCallback((code: string): L.PathOptions => {
        const s = mapStateRef.current;
        if (code === s.selectedMunicipality) {
            return { color: '#10B981', weight: 3, fillColor: '#10B981', fillOpacity: 0.25 };
        }
        if (code === s.comparisonMunicipality && s.isComparisonMode) {
            return { color: '#8B5CF6', weight: 3, fillColor: '#8B5CF6', fillOpacity: 0.25 };
        }
        let fillColor = '#F3F4F6';
        let fillOpacity = 0.1;
        if (s.choroplethMode) {
            fillOpacity = 0.6;
            const m = s.municipalityMetrics[code];
            if (!m) {
                fillColor = '#E5E7EB';
            } else if (s.choroplethMode === 'density') {
                fillColor = getDensityColor(m.storesPerCapita);
            } else {
                fillColor = getConcentrationColor(m.hhi);
            }
        }
        return { color: '#6B7280', weight: 1, fillColor, fillOpacity };
    }, []);

    // Initialize map
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const map = L.map(mapContainerRef.current, {
            center: NORWAY_CENTER,
            zoom: DEFAULT_MAP_CONFIG.zoom,
            minZoom: DEFAULT_MAP_CONFIG.minZoom,
            maxZoom: DEFAULT_MAP_CONFIG.maxZoom,
            zoomControl: true,
        });

        // Light CartoDB Positron tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors © CARTO',
        }).addTo(map);

        // Create layer groups
        markersLayerRef.current = L.layerGroup().addTo(map);
        logisticsLayerRef.current = L.layerGroup().addTo(map);

        mapRef.current = map;
        setMapReady(true);

        return () => {
            map.remove();
            mapRef.current = null;
            setMapReady(false);
        };
    }, []);

    // Handle zoom to bounds when a municipality is searched
    useEffect(() => {
        if (!mapRef.current || !zoomToBounds) return;

        mapRef.current.fitBounds(zoomToBounds, {
            padding: [50, 50],
            maxZoom: 12,
        });

        setZoomToBounds(null);
    }, [zoomToBounds, setZoomToBounds]);

    // Create boundary layer ONCE when geojson loads (event handlers read from ref)
    useEffect(() => {
        if (!mapRef.current || !geojson) return;

        if (boundariesLayerRef.current) {
            mapRef.current.removeLayer(boundariesLayerRef.current);
        }

        const layer = L.geoJSON(geojson, {
            style: (feature) => getFeatureStyle(feature?.properties?.kommunenummer ?? ''),
            onEachFeature: (feature, featureLayer) => {
                const code = feature.properties?.kommunenummer;
                const name = feature.properties?.kommunenavn;

                featureLayer.on({
                    mouseover: (e) => {
                        const s = mapStateRef.current;
                        const isSelected = code === s.selectedMunicipality;
                        const isComparison = code === s.comparisonMunicipality && s.isComparisonMode;
                        if (!isSelected && !isComparison) {
                            const baseOpacity = s.choroplethMode ? 0.6 : 0.1;
                            e.target.setStyle({ weight: 2, fillOpacity: Math.min(baseOpacity + 0.15, 0.85) });
                        }
                    },
                    mouseout: (e) => {
                        e.target.setStyle(getFeatureStyle(code));
                    },
                    click: () => {
                        if (!code) return;
                        const s = mapStateRef.current;
                        if (s.isComparisonMode && s.selectedMunicipality && code !== s.selectedMunicipality) {
                            setComparisonMunicipality(code);
                        } else {
                            setSelectedMunicipality(code);
                            if (s.isComparisonMode && s.comparisonMunicipality === code) {
                                setComparisonMunicipality(null);
                            }
                        }
                        setIsPanelOpen(true);
                    },
                });

                // Dynamic tooltip — reads current state from ref on each show
                featureLayer.bindTooltip(() => {
                    const s = mapStateRef.current;
                    const muni = s.municipalities[code];
                    const metrics = s.municipalityMetrics[code];
                    let content = `<strong>${name}</strong>`;
                    if (muni) {
                        content += `<br/>Pop: ${muni.population?.toLocaleString() ?? 'N/A'}`;
                    }
                    if (metrics && s.choroplethMode === 'density') {
                        content += `<br/>Stores/1000: ${metrics.storesPerCapita.toFixed(2)}`;
                    }
                    if (metrics && s.choroplethMode === 'concentration') {
                        content += `<br/>HHI: ${metrics.hhi}`;
                    }
                    return content;
                }, { sticky: true });
            },
        });

        boundariesLayerRef.current = layer;

        return () => {
            if (mapRef.current && layer) {
                mapRef.current.removeLayer(layer);
            }
            boundariesLayerRef.current = null;
        };
    }, [geojson, getFeatureStyle, setSelectedMunicipality, setComparisonMunicipality, setIsPanelOpen]);

    // Update boundary visibility and styles (CHEAP — setStyle iterates existing features, no DOM recreation)
    useEffect(() => {
        const layer = boundariesLayerRef.current;
        if (!layer || !mapRef.current) return;

        const isVulnerabilityActive = activeLayers.includes('vulnerability');
        const showBoundaries = (activeLayers.includes('boundaries') || choroplethMode !== null) && !isVulnerabilityActive;

        if (!showBoundaries) {
            if (mapRef.current.hasLayer(layer)) mapRef.current.removeLayer(layer);
            return;
        }

        if (!mapRef.current.hasLayer(layer)) layer.addTo(mapRef.current);

        layer.setStyle((feature) => getFeatureStyle(feature?.properties?.kommunenummer ?? ''));
    }, [activeLayers, choroplethMode, municipalityMetrics, selectedMunicipality, comparisonMunicipality, isComparisonMode, getFeatureStyle]);

    // Add store markers with clustering
    useEffect(() => {
        if (!mapRef.current || !markersLayerRef.current) return;

        const map = mapRef.current;
        const layerGroup = markersLayerRef.current;

        const updateMarkers = () => {
            layerGroup.clearLayers();

            if (!activeLayers.includes('stores')) return;

            const filteredStores = stores.filter(store =>
                activeChains.includes(store.chainId as keyof typeof CHAIN_CONFIGS)
            );

            if (filteredStores.length === 0) return;

            const zoomLevel = map.getZoom();
            const clusters = clusterStores(filteredStores, zoomLevel);

            clusters.forEach(cluster => {
                if (cluster.stores.length === 1) {
                    const store = cluster.stores[0];
                    const chainConfig = CHAIN_CONFIGS[store.chainId as keyof typeof CHAIN_CONFIGS];
                    if (!chainConfig) return;

                    const marker = L.circleMarker(cluster.center, {
                        radius: 5,
                        fillColor: chainConfig.color,
                        color: '#fff',
                        weight: 1,
                        fillOpacity: 0.8,
                    });

                    let popupContent = `
                        <div style="min-width: 180px;">
                            <strong>${store.name}</strong><br/>
                            <span style="color: ${chainConfig.color};">●</span> ${store.chain}
                    `;
                    if (store.openingHours) {
                        popupContent += `<br/><small>🕐 ${store.openingHours}</small>`;
                    }
                    if (store.wheelchair === 'yes') {
                        popupContent += `<br/><small>♿ Wheelchair accessible</small>`;
                    }
                    if (store.phone) {
                        popupContent += `<br/><small>📞 ${store.phone}</small>`;
                    }
                    popupContent += `</div>`;

                    marker.bindPopup(popupContent);
                    marker.addTo(layerGroup);
                } else {
                    const chainIds = cluster.stores.map(s => s.chainId);
                    const marker = L.marker(cluster.center, {
                        icon: createStoreClusterIcon(cluster.stores.length, chainIds),
                    });

                    const chainCounts: Record<string, number> = {};
                    cluster.stores.forEach(s => {
                        const config = CHAIN_CONFIGS[s.chainId as keyof typeof CHAIN_CONFIGS];
                        const name = config?.name || s.chain;
                        chainCounts[name] = (chainCounts[name] || 0) + 1;
                    });

                    const breakdown = Object.entries(chainCounts)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([name, count]) => `<div>${name}: ${count}</div>`)
                        .join('');

                    marker.bindPopup(`
                        <div style="min-width: 140px;">
                            <strong>${cluster.stores.length} Stores</strong>
                            <div style="font-size: 12px; color: #666; margin-top: 6px;">
                                ${breakdown}
                                ${Object.keys(chainCounts).length > 5 ? '<div>...</div>' : ''}
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
            debounceTimer = setTimeout(updateMarkers, 150);
        };

        map.on('zoomend', debouncedUpdate);

        return () => {
            clearTimeout(debounceTimer);
            map.off('zoomend', debouncedUpdate);
        };
    }, [stores, activeLayers, activeChains]);

    // Add logistics hub markers
    useEffect(() => {
        if (!mapRef.current || !logisticsLayerRef.current) return;

        logisticsLayerRef.current.clearLayers();

        if (!activeLayers.includes('logisticsHubs')) return;

        logisticsHubs.forEach(hub => {
            const ownerColor = LOGISTICS_OWNER_COLORS[hub.owner as LogisticsOwner] || '#666666';
            const isCentral = hub.type === 'Central Hub';

            // Create diamond-shaped divIcon for logistics hubs
            const icon = L.divIcon({
                className: 'logistics-hub-marker',
                html: `
                    <div style="
                        width: ${isCentral ? 24 : 18}px;
                        height: ${isCentral ? 24 : 18}px;
                        background-color: ${ownerColor};
                        border: 2px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        transform: rotate(45deg);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <svg style="transform: rotate(-45deg); width: ${isCentral ? 14 : 10}px; height: ${isCentral ? 14 : 10}px;" viewBox="0 0 24 24" fill="white">
                            <path d="M4 4h16v12H4V4zm0 14h16v2H4v-2zm2-10h4v4H6V8zm6 0h6v2h-6V8zm0 4h6v2h-6v-2z"/>
                        </svg>
                    </div>
                `,
                iconSize: [isCentral ? 24 : 18, isCentral ? 24 : 18],
                iconAnchor: [isCentral ? 12 : 9, isCentral ? 12 : 9],
            });

            // Note: coordinates are [lng, lat] from GeoJSON
            const marker = L.marker([hub.coordinates[1], hub.coordinates[0]], { icon });

            // Build popup content
            let popupContent = `
                <div style="min-width: 220px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <div style="
                            width: 16px; height: 16px;
                            background-color: ${ownerColor};
                            transform: rotate(45deg);
                        "></div>
                        <strong style="font-size: 14px;">${hub.name}</strong>
                    </div>
                    <div style="color: #666; font-size: 12px;">
                        <div><strong>Owner:</strong> ${hub.owner}</div>
                        <div><strong>Type:</strong> ${hub.type}</div>
                        <div><strong>Role:</strong> ${hub.role}</div>
                        <div><strong>Location:</strong> ${hub.city}</div>
            `;
            if (hub.capacity) {
                popupContent += `<div><strong>Capacity:</strong> ${hub.capacity}</div>`;
            }
            if (hub.storesServed) {
                popupContent += `<div><strong>Stores Served:</strong> ${hub.storesServed.toLocaleString()}</div>`;
            }
            if (hub.automation) {
                popupContent += `<div><strong>Automation:</strong> ${hub.automation}</div>`;
            }
            if (hub.throughput) {
                popupContent += `<div><strong>Throughput:</strong> ${hub.throughput}</div>`;
            }
            if (hub.notes) {
                popupContent += `<div style="margin-top: 4px; font-style: italic;">${hub.notes}</div>`;
            }
            popupContent += `</div></div>`;

            marker.bindPopup(popupContent);
            marker.addTo(logisticsLayerRef.current!);
        });
    }, [logisticsHubs, activeLayers]);

    const storesForDesertLayer = stores;

    return (
        <>
            <div
                ref={mapContainerRef}
                className="w-full h-full"
                style={{ background: '#F9FAFB' }}
            />
            {mapReady && (
                <>
                    <FoodDesertLayer
                        map={mapRef.current}
                        stores={storesForDesertLayer}
                    />
                    <FarmLayer
                        map={mapRef.current}
                        farms={farms}
                        isActive={activeLayers.includes('farms')}
                    />
                    <FlowLayer
                        map={mapRef.current}
                        flows={supplyFlows}
                        isActive={activeLayers.includes('flows')}
                    />
                    <ProcessingPlantLayer
                        map={mapRef.current}
                        plants={processingPlants}
                        isActive={activeLayers.includes('processing-plants')}
                    />
                    <PortLayer
                        map={mapRef.current}
                        ports={ports}
                        isActive={activeLayers.includes('ports')}
                    />
                    <VulnerabilityLayer
                        map={mapRef.current}
                        geojson={geojson}
                        isActive={activeLayers.includes('vulnerability')}
                        onScoresCalculated={handleVulnerabilityScoresCalculated}
                    />
                    <AquacultureLayer
                        map={mapRef.current}
                        sites={aquacultureSites}
                        isActive={activeLayers.includes('aquaculture')}
                    />
                </>
            )}
            <FoodDesertPanel
                coverageAnalysis={desertAnalysis}
                selectedMunicipalityCoverage={selectedMunicipalityCoverage}
            />
            <VulnerabilityPanel scores={vulnerabilityScores} />
        </>
    );
}
