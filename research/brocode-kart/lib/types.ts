// Store Types
export type StoreType = 'discount' | 'convenience' | 'supermarket' | 'hypermarket';

// Chain identifiers
export type ChainId =
    | 'rema'
    | 'kiwi'
    | 'extra'
    | 'coop-prix'
    | 'bunnpris'
    | 'joker'
    | 'spar'
    | 'meny'
    | 'coop-mega'
    | 'coop-marked'
    | 'naerbutikken'
    | 'matkroken'
    | 'obs';

// Map Layers
export type FoodSystemsLayer =
    | 'stores'
    | 'density'
    | 'concentration'
    | 'coverage'
    | 'boundaries'
    | 'logisticsHubs'
    | 'farms'
    | 'food-desert'
    | 'flows'
    | 'processing-plants'
    | 'ports'
    | 'vulnerability'
    | 'aquaculture';

// Logistics hub owner types
export type LogisticsOwner = 'NorgesGruppen' | 'Coop' | 'Rema 1000' | 'Bunnpris AS';

// Farm types
export type FarmType = 'dairy' | 'grain' | 'vegetables' | 'livestock' | 'mixed';

// Farm data from GeoJSON
export interface Farm {
    id: string;
    municipalityCode: string;
    type: FarmType;
    productionArea: number; // hectares
    coordinates: [number, number]; // [lng, lat]
    products?: string[];
}

// Farm type color configuration
export const FARM_TYPE_COLORS: Record<FarmType, string> = {
    'dairy': '#3B82F6',      // blue
    'grain': '#F59E0B',      // amber
    'vegetables': '#10B981', // emerald
    'livestock': '#EF4444',  // red
    'mixed': '#8B5CF6',      // violet
};

// Port types
export type PortType = 'fishing' | 'cargo' | 'mixed' | 'aquaculture';

// Port data from GeoJSON
export interface Port {
    id: string;
    name: string;
    type: PortType;
    coordinates: [number, number]; // [lng, lat]
    annualTonnage?: number;
    primaryCatch?: string[];  // For fishing ports
    facilities?: string[];
    region: string;
}

// Port type color configuration
export const PORT_TYPE_COLORS: Record<PortType, string> = {
    'fishing': '#2563EB',      // blue
    'cargo': '#6B7280',        // gray
    'mixed': '#14B8A6',        // teal
    'aquaculture': '#0D9488',  // darker teal
};

// Aquaculture production types
export type AquacultureProductionType = 'matfisk' | 'settefisk' | 'stamfisk' | 'shellfish' | 'seaweed' | 'other';

// Aquaculture species categories
export type AquacultureSpecies = 'salmon' | 'trout' | 'cod' | 'halibut' | 'shellfish' | 'seaweed' | 'other';

// Aquaculture site data from Fiskeridirektoratet
export interface AquacultureSite {
    id: number;                      // loknr
    name: string;                    // navn
    status: string;                  // status_lokalitet
    capacity: number;                // kapasitet_lok
    capacityUnit: string;            // kapasitet_unittype (TN, STK, DA)
    placement: 'sea' | 'land';       // plassering (SJØ, LAND)
    waterType: string;               // vannmiljo
    county: string;                  // fylke
    municipality: string;            // kommune
    species: string[];               // til_arter (split by comma)
    productionType: AquacultureProductionType;  // derived from til_produksjonsform
    speciesCategory: AquacultureSpecies;        // derived from til_arter
    coordinates: [number, number];   // [lng, lat]
}

// Aquaculture production type colors
export const AQUACULTURE_PRODUCTION_COLORS: Record<AquacultureProductionType, string> = {
    'matfisk': '#0891B2',     // cyan - food fish
    'settefisk': '#8B5CF6',   // violet - smolt
    'stamfisk': '#EC4899',    // pink - broodstock
    'shellfish': '#F59E0B',   // amber - shellfish
    'seaweed': '#10B981',     // emerald - seaweed
    'other': '#6B7280',       // gray - other
};

// Aquaculture production type labels
export const AQUACULTURE_PRODUCTION_LABELS: Record<AquacultureProductionType, { en: string; no: string }> = {
    'matfisk': { en: 'Food Fish', no: 'Matfisk' },
    'settefisk': { en: 'Smolt/Juveniles', no: 'Settefisk' },
    'stamfisk': { en: 'Broodstock', no: 'Stamfisk' },
    'shellfish': { en: 'Shellfish', no: 'Skalldyr' },
    'seaweed': { en: 'Seaweed', no: 'Tang/Tare' },
    'other': { en: 'Other/Research', no: 'Andre/Forskning' },
};

// Processing plant types
export type ProcessingPlantType = 'dairy' | 'meat' | 'seafood' | 'produce' | 'grain' | 'beverage';

// Processing plant company types
export type ProcessingCompany = 'Nortura' | 'Tine' | 'BAMA' | 'Orkla' | 'Lerøy' | 'Mowi' | 'Other';

// Processing plant data
export interface ProcessingPlant {
    id: string;
    name: string;
    company: ProcessingCompany;
    type: ProcessingPlantType;
    coordinates: [number, number]; // [lng, lat]
    capacity?: string;
    products?: string[];
    employees?: number;
}

// Processing company color configuration
export const PROCESSING_COMPANY_COLORS: Record<ProcessingCompany, string> = {
    'Nortura': '#DC2626',    // red
    'Tine': '#2563EB',       // blue
    'BAMA': '#16A34A',       // green
    'Orkla': '#7C3AED',      // violet
    'Lerøy': '#0891B2',      // cyan
    'Mowi': '#0D9488',       // teal
    'Other': '#6B7280',      // gray
};

// Processing plant type labels
export const PROCESSING_TYPE_LABELS: Record<ProcessingPlantType, string> = {
    'dairy': 'Dairy',
    'meat': 'Meat',
    'seafood': 'Seafood',
    'produce': 'Produce',
    'grain': 'Grain',
    'beverage': 'Beverage',
};

// Logistics hub data from GeoJSON
export interface LogisticsHub {
    id: string;
    name: string;
    owner: LogisticsOwner;
    type: 'Central Hub' | 'Regional Hub';
    capacity?: string;
    role: string;
    storesServed?: number;
    automation?: string;
    throughput?: string;
    city: string;
    notes?: string;
    coordinates: [number, number]; // [lng, lat]
}

// Owner color configuration
export const LOGISTICS_OWNER_COLORS: Record<LogisticsOwner, string> = {
    'NorgesGruppen': '#1565C0',  // blue
    'Coop': '#E30613',           // red
    'Rema 1000': '#4CAF50',      // green
    'Bunnpris AS': '#FF9800',    // orange
};

// Supply chain flow types
export type FlowType = 'distribution' | 'import' | 'processing';
export type FlowSourceType = 'hub' | 'port' | 'plant';
export type FlowTargetType = 'store' | 'hub';

export interface SupplyFlow {
    id: string;
    from: {
        type: FlowSourceType;
        id: string;
        coordinates: [number, number]; // [lng, lat]
    };
    to: {
        type: FlowTargetType;
        id: string;
        coordinates: [number, number]; // [lng, lat]
    };
    volume: number;  // relative 1-10
    type: FlowType;
}

// Flow type colors
export const FLOW_TYPE_COLORS: Record<FlowType, string> = {
    'distribution': '#3B82F6',  // blue - hub to store
    'import': '#8B5CF6',        // violet - port to hub
    'processing': '#10B981',    // emerald - plant to hub
};

// Store data
export interface Store {
    id: string;
    osmId: number;
    name: string;
    chain: string;
    chainId: ChainId;
    storeType: StoreType;
    location: { lat: number; lng: number };
    address: string;
    city: string;
    postcode: string;
    // New fields from OSM
    openingHours?: string;
    wheelchair?: string;
    phone?: string;
    website?: string;
    organic?: string;
}

// Municipality data
export interface Municipality {
    code: string;
    name: string;
    population: number;
    area: number;
    // Demographics (SSB 2023-2024)
    medianIncome?: number;         // After-tax household income (NOK)
    households?: number;           // Number of households
    ageDistribution?: {
        under18Pct: number;        // Percentage under 18
        over65Pct: number;         // Percentage over 65
    };
    stores?: Store[];
    metrics?: MunicipalityMetrics;
}

// Calculated metrics per municipality
export interface MunicipalityMetrics {
    storeCount: number;
    storesPerCapita: number;      // per 1000 residents
    hhi: number;                   // Herfindahl-Hirschman Index (0-10000)
    dominantChain: string | null;
    dominantChainShare: number;
    avgDistanceToStore?: number;  // km
    coveragePercent?: number;     // % within 5km of store
}

// Chain configuration
export interface ChainConfig {
    id: ChainId;
    name: string;
    color: string;
    type: StoreType;
    parent?: string;  // Parent company
}

// Layer configuration
export interface LayerConfig {
    id: FoodSystemsLayer;
    name: string;
    nameNo: string;
    description: string;
    descriptionNo: string;
    enabled: boolean;
}

// Map configuration
export interface MapConfig {
    center: [number, number];
    zoom: number;
    minZoom: number;
    maxZoom: number;
}

// Norway bounds
export const NORWAY_BOUNDS: [[number, number], [number, number]] = [
    [57.9, 4.5],    // Southwest
    [71.2, 31.1]    // Northeast
];

// Norway center
export const NORWAY_CENTER: [number, number] = [64.5, 11.0];

// Default map config
export const DEFAULT_MAP_CONFIG: MapConfig = {
    center: NORWAY_CENTER,
    zoom: 5,
    minZoom: 4,
    maxZoom: 18,
};

// Chain configurations
export const CHAIN_CONFIGS: Record<ChainId, ChainConfig> = {
    rema: {
        id: 'rema',
        name: 'Rema 1000',
        color: '#E30613',
        type: 'discount',
        parent: 'Reitangruppen',
    },
    kiwi: {
        id: 'kiwi',
        name: 'Kiwi',
        color: '#4CAF50',
        type: 'discount',
        parent: 'NorgesGruppen',
    },
    extra: {
        id: 'extra',
        name: 'Extra',
        color: '#FFC107',
        type: 'discount',
        parent: 'Coop Norge',
    },
    'coop-prix': {
        id: 'coop-prix',
        name: 'Coop Prix',
        color: '#00529B',
        type: 'discount',
        parent: 'Coop Norge',
    },
    bunnpris: {
        id: 'bunnpris',
        name: 'Bunnpris',
        color: '#E91E63',
        type: 'discount',
        parent: 'Bunnpris AS',
    },
    joker: {
        id: 'joker',
        name: 'Joker',
        color: '#F44336',
        type: 'convenience',
        parent: 'NorgesGruppen',
    },
    spar: {
        id: 'spar',
        name: 'Spar',
        color: '#2E7D32',
        type: 'convenience',
        parent: 'NorgesGruppen',
    },
    meny: {
        id: 'meny',
        name: 'Meny',
        color: '#1565C0',
        type: 'supermarket',
        parent: 'NorgesGruppen',
    },
    'coop-mega': {
        id: 'coop-mega',
        name: 'Coop Mega',
        color: '#00529B',
        type: 'supermarket',
        parent: 'Coop Norge',
    },
    'coop-marked': {
        id: 'coop-marked',
        name: 'Coop Marked',
        color: '#00529B',
        type: 'convenience',
        parent: 'Coop Norge',
    },
    naerbutikken: {
        id: 'naerbutikken',
        name: 'Nærbutikken',
        color: '#795548',
        type: 'convenience',
        parent: 'NorgesGruppen',
    },
    matkroken: {
        id: 'matkroken',
        name: 'Matkroken',
        color: '#607D8B',
        type: 'convenience',
        parent: 'NorgesGruppen',
    },
    obs: {
        id: 'obs',
        name: 'Obs',
        color: '#00529B',
        type: 'hypermarket',
        parent: 'Coop Norge',
    },
};

// Layer definitions
export const LAYER_CONFIGS: Record<FoodSystemsLayer, Omit<LayerConfig, 'enabled'>> = {
    stores: {
        id: 'stores',
        name: 'Store Locations',
        nameNo: 'Butikkplasseringer',
        description: 'Individual store markers by chain',
        descriptionNo: 'Individuelle butikkmarkører etter kjede',
    },
    density: {
        id: 'density',
        name: 'Store Density',
        nameNo: 'Butikktetthet',
        description: 'Stores per 1000 residents by municipality',
        descriptionNo: 'Butikker per 1000 innbyggere per kommune',
    },
    concentration: {
        id: 'concentration',
        name: 'Market Concentration',
        nameNo: 'Markedskonsentrasjon',
        description: 'Herfindahl-Hirschman Index by municipality',
        descriptionNo: 'Herfindahl-Hirschman Index per kommune',
    },
    coverage: {
        id: 'coverage',
        name: 'Coverage Zones',
        nameNo: 'Dekningssoner',
        description: '5km radius from each store',
        descriptionNo: '5km radius fra hver butikk',
    },
    boundaries: {
        id: 'boundaries',
        name: 'Municipal Boundaries',
        nameNo: 'Kommunegrenser',
        description: 'Administrative boundaries',
        descriptionNo: 'Administrative grenser',
    },
    logisticsHubs: {
        id: 'logisticsHubs',
        name: 'Logistics Hubs',
        nameNo: 'Logistikksentre',
        description: 'Distribution centers by owner',
        descriptionNo: 'Distribusjonssentre etter eier',
    },
    farms: {
        id: 'farms',
        name: 'Farm Locations',
        nameNo: 'Gårdsplasseringer',
        description: 'Agricultural holdings by type',
        descriptionNo: 'Landbrukseiendommer etter type',
    },
    'food-desert': {
        id: 'food-desert',
        name: 'Food Desert Analysis',
        nameNo: 'Matørkenanalyse',
        description: '5km coverage zones around stores',
        descriptionNo: '5km dekningssoner rundt butikker',
    },
    flows: {
        id: 'flows',
        name: 'Supply Chain Flows',
        nameNo: 'Forsyningskjedestrømmer',
        description: 'Animated flows from hubs to stores',
        descriptionNo: 'Animerte strømmer fra sentre til butikker',
    },
    'processing-plants': {
        id: 'processing-plants',
        name: 'Processing Plants',
        nameNo: 'Foredlingsanlegg',
        description: 'Food processing facilities',
        descriptionNo: 'Matforedlingsanlegg',
    },
    ports: {
        id: 'ports',
        name: 'Ports & Harbors',
        nameNo: 'Havner',
        description: 'Fishing ports and cargo harbors',
        descriptionNo: 'Fiskehavner og lastehavner',
    },
    vulnerability: {
        id: 'vulnerability',
        name: 'Vulnerability Heat Map',
        nameNo: 'Sarbarhetsvarme',
        description: 'Supply chain risk by municipality',
        descriptionNo: 'Forsyningskjederisiko per kommune',
    },
    aquaculture: {
        id: 'aquaculture',
        name: 'Aquaculture Sites',
        nameNo: 'Akvakulturanlegg',
        description: 'Fish farms and aquaculture facilities',
        descriptionNo: 'Oppdrettsanlegg og akvakultur',
    },
};
