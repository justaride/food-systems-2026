"use client";

import { createContext, useContext, useState, useMemo, useEffect, useCallback, ReactNode } from 'react';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import type { FoodSystemsLayer, ChainId, Store, Municipality, MunicipalityMetrics, LogisticsHub, Farm, FarmType, SupplyFlow, Port, PortType, ProcessingPlant, ProcessingPlantType, AquacultureSite, AquacultureProductionType } from '@/lib/food-systems/types';
import { generateSupplyFlows } from '@/lib/food-systems/flow-utils';
import type { FoodSystemInsights, SSBStats, FinancialStats, TradeStats } from '@/lib/food-systems/insights-types';
import { calculateNationalMetrics, calculateMunicipalityMetrics, NationalMetrics } from '@/lib/food-systems/metrics';
import { calculateCoverageAnalysis, calculateMunicipalityCoverage, type CoverageAnalysis, type MunicipalityCoverage } from '@/lib/food-systems/desert-analysis';

interface FoodSystemsContextType {
    isLoading: boolean;
    error: string | null;
    selectedMunicipality: string | null;
    setSelectedMunicipality: (code: string | null) => void;
    comparisonMunicipality: string | null;
    setComparisonMunicipality: (code: string | null) => void;
    isComparisonMode: boolean;
    setIsComparisonMode: (enabled: boolean) => void;
    activeLayers: FoodSystemsLayer[];
    toggleLayer: (layer: FoodSystemsLayer) => void;
    activeChains: ChainId[];
    toggleChain: (chain: ChainId) => void;
    setActiveChains: (chains: ChainId[]) => void;
    isPanelOpen: boolean;
    setIsPanelOpen: (open: boolean) => void;
    isInsightsOpen: boolean;
    setIsInsightsOpen: (open: boolean) => void;
    nationalMetrics: NationalMetrics | null;
    municipalityMetrics: Record<string, MunicipalityMetrics>;
    municipalities: Record<string, Municipality>;
    insights: FoodSystemInsights | null;
    logisticsHubs: LogisticsHub[];
    zoomToBounds: [[number, number], [number, number]] | null;
    setZoomToBounds: (bounds: [[number, number], [number, number]] | null) => void;
    stores: Store[];
    geojson: GeoJSON.FeatureCollection | null;
    desertAnalysis: CoverageAnalysis | null;
    selectedMunicipalityCoverage: MunicipalityCoverage | null;
    farms: Farm[];
    supplyFlows: SupplyFlow[];
    ports: Port[];
    processingPlants: ProcessingPlant[];
    aquacultureSites: AquacultureSite[];
}

const FoodSystemsContext = createContext<FoodSystemsContextType | null>(null);

const ALL_CHAINS: ChainId[] = [
    'rema', 'kiwi', 'extra', 'coop-prix', 'bunnpris',
    'joker', 'spar', 'meny', 'coop-mega', 'coop-marked',
    'naerbutikken', 'matkroken', 'obs'
];

// Choropleth layers are mutually exclusive
const CHOROPLETH_LAYERS: FoodSystemsLayer[] = ['density', 'concentration'];

type MunicipalityFeature = GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;

type FeatureBounds = {
    minLng: number;
    minLat: number;
    maxLng: number;
    maxLat: number;
};

type StorePoint = {
    store: Store;
    point: ReturnType<typeof point>;
    lng: number;
    lat: number;
};

function getFeatureBounds(feature: MunicipalityFeature): FeatureBounds {
    const { geometry } = feature;
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;

    let minLng = Number.POSITIVE_INFINITY;
    let minLat = Number.POSITIVE_INFINITY;
    let maxLng = Number.NEGATIVE_INFINITY;
    let maxLat = Number.NEGATIVE_INFINITY;

    for (const polygon of polygons) {
        for (const ring of polygon) {
            for (const coordinate of ring) {
                const [lng, lat] = coordinate;
                if (lng < minLng) minLng = lng;
                if (lat < minLat) minLat = lat;
                if (lng > maxLng) maxLng = lng;
                if (lat > maxLat) maxLat = lat;
            }
        }
    }

    return { minLng, minLat, maxLng, maxLat };
}

function isWithinBounds(lng: number, lat: number, bounds: FeatureBounds): boolean {
    return (
        lng >= bounds.minLng &&
        lng <= bounds.maxLng &&
        lat >= bounds.minLat &&
        lat <= bounds.maxLat
    );
}

export function FoodSystemsProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);
    const [comparisonMunicipality, setComparisonMunicipality] = useState<string | null>(null);
    const [isComparisonMode, setIsComparisonMode] = useState(false);
    const [activeLayers, setActiveLayers] = useState<FoodSystemsLayer[]>(['stores', 'boundaries']);
    const [activeChains, setActiveChains] = useState<ChainId[]>(ALL_CHAINS);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isInsightsOpen, setIsInsightsOpen] = useState(false);
    const [nationalMetrics, setNationalMetrics] = useState<NationalMetrics | null>(null);
    const [municipalityMetrics, setMunicipalityMetrics] = useState<Record<string, MunicipalityMetrics>>({});
    const [municipalities, setMunicipalities] = useState<Record<string, Municipality>>({});
    const [insights, setInsights] = useState<FoodSystemInsights | null>(null);
    const [logisticsHubs, setLogisticsHubs] = useState<LogisticsHub[]>([]);
    const [zoomToBounds, setZoomToBounds] = useState<[[number, number], [number, number]] | null>(null);
    const [stores, setStores] = useState<Store[]>([]);
    const [geojson, setGeojson] = useState<GeoJSON.FeatureCollection | null>(null);
    const [desertAnalysis, setDesertAnalysis] = useState<CoverageAnalysis | null>(null);
    const [farms, setFarms] = useState<Farm[]>([]);
    const [supplyFlows, setSupplyFlows] = useState<SupplyFlow[]>([]);
    const [ports, setPorts] = useState<Port[]>([]);
    const [processingPlants, setProcessingPlants] = useState<ProcessingPlant[]>([]);
    const [aquacultureSites, setAquacultureSites] = useState<AquacultureSite[]>([]);

    // Phase 1: Load essential data (stores, municipalities, geojson)
    useEffect(() => {
        setIsLoading(true);
        setError(null);

        const fetchJson = (url: string) =>
            fetch(url).then(r => {
                if (!r.ok) throw new Error(`Failed to fetch ${url}: ${r.status}`);
                return r.json();
            });

        // Essential data first
        Promise.all([
            fetchJson('/data/food-systems/stores.json'),
            fetchJson('/data/food-systems/municipalities.json'),
            fetchJson('/data/food-systems/norway-municipalities.geojson'),
        ]).then(([storesData, municipalitiesData, geojsonData]: [Store[], Record<string, Municipality>, GeoJSON.FeatureCollection]) => {
            setStores(storesData);
            setGeojson(geojsonData);
            setMunicipalities(municipalitiesData);
            setNationalMetrics(calculateNationalMetrics(storesData, municipalitiesData));
            setIsLoading(false);

            // Defer heavy point-in-polygon to chunked idle processing (keeps UI responsive)
            const municipalFeatures = geojsonData.features as MunicipalityFeature[];
            const storePoints: StorePoint[] = storesData.map((store) => ({
                store,
                point: point([store.location.lng, store.location.lat]),
                lng: store.location.lng,
                lat: store.location.lat,
            }));

            let featureIdx = 0;
            const metrics: Record<string, MunicipalityMetrics> = {};
            const CHUNK_SIZE = 20;

            const processChunk = () => {
                const end = Math.min(featureIdx + CHUNK_SIZE, municipalFeatures.length);
                for (; featureIdx < end; featureIdx++) {
                    const feature = municipalFeatures[featureIdx];
                    const code = feature.properties?.kommunenummer;
                    if (!code || !municipalitiesData[code]) continue;

                    const muni = municipalitiesData[code];
                    const bounds = getFeatureBounds(feature);
                    const muniStores: Store[] = [];

                    for (const storePoint of storePoints) {
                        if (!isWithinBounds(storePoint.lng, storePoint.lat, bounds)) continue;
                        try {
                            if (booleanPointInPolygon(storePoint.point, feature)) {
                                muniStores.push(storePoint.store);
                            }
                        } catch {
                            // Ignore malformed geometries
                        }
                    }
                    metrics[code] = calculateMunicipalityMetrics(muni, muniStores);
                }

                if (featureIdx < municipalFeatures.length) {
                    requestAnimationFrame(() => setTimeout(processChunk, 0));
                } else {
                    setMunicipalityMetrics(metrics);
                }
            };

            requestAnimationFrame(() => setTimeout(processChunk, 0));

            // Phase 2: Load supplementary data (non-blocking)
            const loadSupplementary = async () => {
                // Insights
                try {
                    const [ssb, financials, trade] = await Promise.all([
                        fetchJson('/data/food-systems/raw_data/ssb_landbruk_2024.json'),
                        fetchJson('/data/food-systems/raw_data/financial_insights_2024.json'),
                        fetchJson('/data/food-systems/raw_data/trade_volumes_2024.json'),
                    ]);
                    setInsights({ ssb, financials, trade });
                } catch (err) {
                    console.error('Failed to load insights data:', err);
                }

                // Supply chain layers
                try {
                    const [logisticsGeojson, farmsGeojson, portsGeojson, processingPlantsGeojson, aquacultureGeojson] = await Promise.all([
                        fetchJson('/data/food-systems/logistics_hubs.geojson'),
                        fetchJson('/data/food-systems/farms.geojson'),
                        fetchJson('/data/food-systems/ports.geojson'),
                        fetchJson('/data/food-systems/processing_plants.geojson'),
                        fetchJson('/data/food-systems/aquaculture_sites.geojson'),
                    ]);

                    const hubs: LogisticsHub[] = logisticsGeojson.features.map((feature: GeoJSON.Feature) => {
                        const props = feature.properties as Record<string, unknown>;
                        const geometry = feature.geometry as GeoJSON.Point;
                        return {
                            id: props.id as string,
                            name: props.name as string,
                            owner: props.owner as LogisticsHub['owner'],
                            type: props.type as LogisticsHub['type'],
                            capacity: props.capacity as string | undefined,
                            role: props.role as string,
                            storesServed: props.storesServed as number | undefined,
                            automation: props.automation as string | undefined,
                            throughput: props.throughput as string | undefined,
                            city: props.city as string,
                            notes: props.notes as string | undefined,
                            coordinates: geometry.coordinates as [number, number],
                        };
                    });
                    setLogisticsHubs(hubs);

                    const parsedFarms: Farm[] = farmsGeojson.features.map((feature: GeoJSON.Feature) => {
                        const props = feature.properties as Record<string, unknown>;
                        const geometry = feature.geometry as GeoJSON.Point;
                        return {
                            id: props.id as string,
                            municipalityCode: props.municipalityCode as string,
                            type: props.type as FarmType,
                            productionArea: props.productionArea as number,
                            coordinates: geometry.coordinates as [number, number],
                            products: props.products as string[] | undefined,
                        };
                    });
                    setFarms(parsedFarms);

                    const parsedPorts: Port[] = portsGeojson.features.map((feature: GeoJSON.Feature) => {
                        const props = feature.properties as Record<string, unknown>;
                        const geometry = feature.geometry as GeoJSON.Point;
                        return {
                            id: props.id as string,
                            name: props.name as string,
                            type: props.type as PortType,
                            coordinates: geometry.coordinates as [number, number],
                            annualTonnage: props.annualTonnage as number | undefined,
                            primaryCatch: props.primaryCatch as string[] | undefined,
                            facilities: props.facilities as string[] | undefined,
                            region: props.region as string,
                        };
                    });
                    setPorts(parsedPorts);

                    const parsedPlants: ProcessingPlant[] = processingPlantsGeojson.features.map((feature: GeoJSON.Feature) => {
                        const props = feature.properties as Record<string, unknown>;
                        const geometry = feature.geometry as GeoJSON.Point;
                        return {
                            id: props.id as string,
                            name: props.name as string,
                            company: props.company as ProcessingPlant['company'],
                            type: props.type as ProcessingPlantType,
                            coordinates: geometry.coordinates as [number, number],
                            capacity: props.capacity as string | undefined,
                            products: props.products as string[] | undefined,
                            employees: props.employees as number | undefined,
                        };
                    });
                    setProcessingPlants(parsedPlants);

                    const parsedAquaculture: AquacultureSite[] = aquacultureGeojson.features.map((feature: GeoJSON.Feature) => {
                        const props = feature.properties as Record<string, unknown>;
                        const geometry = feature.geometry as GeoJSON.Point;

                        const prodForm = (props.til_produksjonsform as string || '').toLowerCase();
                        let productionType: AquacultureProductionType = 'other';
                        if (prodForm.includes('matfisk')) productionType = 'matfisk';
                        else if (prodForm.includes('settefisk')) productionType = 'settefisk';
                        else if (prodForm.includes('stamfisk')) productionType = 'stamfisk';
                        else if (prodForm.includes('bløtdyr') || prodForm.includes('skjell')) productionType = 'shellfish';
                        else if (prodForm.includes('alger') || prodForm.includes('tare')) productionType = 'seaweed';

                        const species = (props.til_arter as string || '').toLowerCase();
                        let speciesCategory: import('@/lib/food-systems/types').AquacultureSpecies = 'other';
                        if (species.includes('laks')) speciesCategory = 'salmon';
                        else if (species.includes('ørret') || species.includes('regnbue')) speciesCategory = 'trout';
                        else if (species.includes('torsk')) speciesCategory = 'cod';
                        else if (species.includes('kveite')) speciesCategory = 'halibut';
                        else if (species.includes('blåskjell') || species.includes('østers') || species.includes('kamskjell')) speciesCategory = 'shellfish';
                        else if (species.includes('tare') || species.includes('tang')) speciesCategory = 'seaweed';

                        return {
                            id: props.loknr as number,
                            name: props.navn as string,
                            status: props.status_lokalitet as string,
                            capacity: (props.kapasitet_lok as number) ?? 0,
                            capacityUnit: (props.kapasitet_unittype as string) ?? 'TN',
                            placement: (props.plassering as string) === 'SJØ' ? 'sea' : 'land',
                            waterType: (props.vannmiljo as string) ?? 'Unknown',
                            county: (props.fylke as string) ?? '',
                            municipality: (props.kommune as string) ?? '',
                            species: ((props.til_arter as string) ?? '').split(', ').filter(Boolean),
                            productionType,
                            speciesCategory,
                            coordinates: geometry.coordinates as [number, number],
                        };
                    });
                    setAquacultureSites(parsedAquaculture);

                    // Supply flows computed lazily when flows layer is activated
                } catch (err) {
                    console.error('Failed to load supply chain data:', err);
                }
            };

            loadSupplementary();
        }).catch(err => {
            console.error('Failed to load food systems data:', err);
            setError(`Failed to load core data: ${err.message}`);
            setIsLoading(false);
        });
    }, []);

    const toggleLayer = useCallback((layer: FoodSystemsLayer) => {
        setActiveLayers(prev => {
            if (prev.includes(layer)) {
                // Turning off
                return prev.filter(l => l !== layer);
            } else {
                // Turning on - if choropleth, disable other choropleth layers
                if (CHOROPLETH_LAYERS.includes(layer)) {
                    return [...prev.filter(l => !CHOROPLETH_LAYERS.includes(l)), layer];
                }
                return [...prev, layer];
            }
        });
    }, []);

    const toggleChain = (chain: ChainId) => {
        setActiveChains(prev =>
            prev.includes(chain)
                ? prev.filter(c => c !== chain)
                : [...prev, chain]
        );
    };

    const selectedMunicipalityCoverage = useMemo(() => {
        if (!selectedMunicipality || !stores.length || !municipalities[selectedMunicipality] || !geojson) {
            return null;
        }
        if (!activeLayers.includes('food-desert')) return null;
        return calculateMunicipalityCoverage(selectedMunicipality, stores, municipalities, geojson);
    }, [selectedMunicipality, stores, municipalities, geojson, activeLayers]);

    // Lazy: compute supply flows only when flows layer is activated
    useEffect(() => {
        if (!activeLayers.includes('flows')) return;
        if (supplyFlows.length > 0 || !logisticsHubs.length || !stores.length) return;
        const timer = setTimeout(() => {
            const flows = generateSupplyFlows(logisticsHubs, stores);
            setSupplyFlows(flows);
        }, 0);
        return () => clearTimeout(timer);
    }, [activeLayers, logisticsHubs, stores, supplyFlows.length]);

    // Lazy: compute coverage analysis only when food-desert layer is activated
    useEffect(() => {
        if (!activeLayers.includes('food-desert')) return;
        if (desertAnalysis || !stores.length || Object.keys(municipalities).length === 0 || !geojson) return;
        const timer = setTimeout(() => {
            const coverage = calculateCoverageAnalysis(stores, municipalities, geojson);
            setDesertAnalysis(coverage);
        }, 0);
        return () => clearTimeout(timer);
    }, [activeLayers, stores, municipalities, geojson, desertAnalysis]);

    const value = useMemo(() => ({
        isLoading,
        error,
        selectedMunicipality,
        setSelectedMunicipality,
        comparisonMunicipality,
        setComparisonMunicipality,
        isComparisonMode,
        setIsComparisonMode,
        activeLayers,
        toggleLayer,
        activeChains,
        toggleChain,
        setActiveChains,
        isPanelOpen,
        setIsPanelOpen,
        isInsightsOpen,
        setIsInsightsOpen,
        nationalMetrics,
        municipalityMetrics,
        municipalities,
        insights,
        logisticsHubs,
        zoomToBounds,
        setZoomToBounds,
        stores,
        geojson,
        desertAnalysis,
        selectedMunicipalityCoverage,
        farms,
        supplyFlows,
        ports,
        processingPlants,
        aquacultureSites,
    }), [isLoading, error, selectedMunicipality, comparisonMunicipality, isComparisonMode, activeLayers, toggleLayer, activeChains, isPanelOpen, isInsightsOpen, nationalMetrics, municipalityMetrics, municipalities, insights, logisticsHubs, zoomToBounds, stores, geojson, desertAnalysis, selectedMunicipalityCoverage, farms, supplyFlows, ports, processingPlants, aquacultureSites]);

    return (
        <FoodSystemsContext.Provider value={value}>
            {children}
        </FoodSystemsContext.Provider>
    );
}

export function useFoodSystems() {
    const context = useContext(FoodSystemsContext);
    if (!context) {
        throw new Error('useFoodSystems must be used within FoodSystemsProvider');
    }
    return context;
}
