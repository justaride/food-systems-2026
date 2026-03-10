"use client";

import { Download } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useFoodSystems } from '@/contexts/FoodSystemsContext';
import type { Store, Farm, ProcessingPlant, Port, LogisticsHub, Municipality, MunicipalityMetrics, AquacultureSite } from '@/lib/food-systems/types';

type ExportDataType = 'stores' | 'municipalities' | 'logistics' | 'farms' | 'processing' | 'ports' | 'aquaculture';

function escapeCSV(value: string | number | undefined | null): string {
    if (value === undefined || value === null) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

function generateStoresCSV(stores: Store[], activeChains: string[]): string {
    const filtered = stores.filter(s => activeChains.includes(s.chainId));
    const headers = ['id', 'name', 'chain', 'chainId', 'storeType', 'lat', 'lng', 'address', 'city', 'postcode', 'openingHours', 'phone'];
    const rows = filtered.map(s => [
        escapeCSV(s.id),
        escapeCSV(s.name),
        escapeCSV(s.chain),
        escapeCSV(s.chainId),
        escapeCSV(s.storeType),
        escapeCSV(s.location.lat),
        escapeCSV(s.location.lng),
        escapeCSV(s.address),
        escapeCSV(s.city),
        escapeCSV(s.postcode),
        escapeCSV(s.openingHours),
        escapeCSV(s.phone),
    ].join(','));
    return [headers.join(','), ...rows].join('\n');
}

function generateMunicipalitiesCSV(municipalities: Record<string, Municipality>, metrics: Record<string, MunicipalityMetrics>): string {
    const headers = ['code', 'name', 'population', 'area', 'storeCount', 'storesPerCapita', 'hhi', 'dominantChain', 'dominantChainShare'];
    const rows = Object.entries(municipalities).map(([code, m]) => {
        const met = metrics[code];
        return [
            escapeCSV(code),
            escapeCSV(m.name),
            escapeCSV(m.population),
            escapeCSV(m.area),
            escapeCSV(met?.storeCount),
            escapeCSV(met?.storesPerCapita?.toFixed(2)),
            escapeCSV(met?.hhi?.toFixed(0)),
            escapeCSV(met?.dominantChain),
            escapeCSV(met?.dominantChainShare?.toFixed(1)),
        ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
}

function generateLogisticsCSV(hubs: LogisticsHub[]): string {
    const headers = ['id', 'name', 'owner', 'type', 'city', 'role', 'capacity', 'storesServed', 'lng', 'lat'];
    const rows = hubs.map(h => [
        escapeCSV(h.id),
        escapeCSV(h.name),
        escapeCSV(h.owner),
        escapeCSV(h.type),
        escapeCSV(h.city),
        escapeCSV(h.role),
        escapeCSV(h.capacity),
        escapeCSV(h.storesServed),
        escapeCSV(h.coordinates[0]),
        escapeCSV(h.coordinates[1]),
    ].join(','));
    return [headers.join(','), ...rows].join('\n');
}

function generateFarmsCSV(farms: Farm[]): string {
    const headers = ['id', 'municipalityCode', 'type', 'productionArea', 'lng', 'lat', 'products'];
    const rows = farms.map(f => [
        escapeCSV(f.id),
        escapeCSV(f.municipalityCode),
        escapeCSV(f.type),
        escapeCSV(f.productionArea),
        escapeCSV(f.coordinates[0]),
        escapeCSV(f.coordinates[1]),
        escapeCSV(f.products?.join('; ')),
    ].join(','));
    return [headers.join(','), ...rows].join('\n');
}

function generateProcessingCSV(plants: ProcessingPlant[]): string {
    const headers = ['id', 'name', 'company', 'type', 'capacity', 'employees', 'lng', 'lat', 'products'];
    const rows = plants.map(p => [
        escapeCSV(p.id),
        escapeCSV(p.name),
        escapeCSV(p.company),
        escapeCSV(p.type),
        escapeCSV(p.capacity),
        escapeCSV(p.employees),
        escapeCSV(p.coordinates[0]),
        escapeCSV(p.coordinates[1]),
        escapeCSV(p.products?.join('; ')),
    ].join(','));
    return [headers.join(','), ...rows].join('\n');
}

function generatePortsCSV(ports: Port[]): string {
    const headers = ['id', 'name', 'type', 'region', 'annualTonnage', 'lng', 'lat', 'primaryCatch', 'facilities'];
    const rows = ports.map(p => [
        escapeCSV(p.id),
        escapeCSV(p.name),
        escapeCSV(p.type),
        escapeCSV(p.region),
        escapeCSV(p.annualTonnage),
        escapeCSV(p.coordinates[0]),
        escapeCSV(p.coordinates[1]),
        escapeCSV(p.primaryCatch?.join('; ')),
        escapeCSV(p.facilities?.join('; ')),
    ].join(','));
    return [headers.join(','), ...rows].join('\n');
}

function generateAquacultureCSV(sites: AquacultureSite[]): string {
    const headers = ['id', 'name', 'status', 'productionType', 'capacity', 'capacityUnit', 'placement', 'waterType', 'municipality', 'county', 'lng', 'lat', 'species'];
    const rows = sites.map(s => [
        escapeCSV(s.id),
        escapeCSV(s.name),
        escapeCSV(s.status),
        escapeCSV(s.productionType),
        escapeCSV(s.capacity),
        escapeCSV(s.capacityUnit),
        escapeCSV(s.placement),
        escapeCSV(s.waterType),
        escapeCSV(s.municipality),
        escapeCSV(s.county),
        escapeCSV(s.coordinates[0]),
        escapeCSV(s.coordinates[1]),
        escapeCSV(s.species.join('; ')),
    ].join(','));
    return [headers.join(','), ...rows].join('\n');
}

function downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export default function ExportButton() {
    const pathname = usePathname() ?? "/en";
    const isNorwegian = pathname.split("/")[1] === "no";
    const t = (en: string, no: string) => (isNorwegian ? no : en);

    const {
        stores,
        activeChains,
        activeLayers,
        municipalities,
        municipalityMetrics,
        logisticsHubs,
        farms,
        processingPlants,
        ports,
        aquacultureSites,
    } = useFoodSystems();

    const handleExport = (type: ExportDataType) => {
        let csv = '';
        let filename = '';
        const timestamp = new Date().toISOString().split('T')[0];

        switch (type) {
            case 'stores':
                csv = generateStoresCSV(stores, activeChains);
                filename = `stores_${timestamp}.csv`;
                break;
            case 'municipalities':
                csv = generateMunicipalitiesCSV(municipalities, municipalityMetrics);
                filename = `municipalities_${timestamp}.csv`;
                break;
            case 'logistics':
                csv = generateLogisticsCSV(logisticsHubs);
                filename = `logistics_hubs_${timestamp}.csv`;
                break;
            case 'farms':
                csv = generateFarmsCSV(farms);
                filename = `farms_${timestamp}.csv`;
                break;
            case 'processing':
                csv = generateProcessingCSV(processingPlants);
                filename = `processing_plants_${timestamp}.csv`;
                break;
            case 'ports':
                csv = generatePortsCSV(ports);
                filename = `ports_${timestamp}.csv`;
                break;
            case 'aquaculture':
                csv = generateAquacultureCSV(aquacultureSites);
                filename = `aquaculture_sites_${timestamp}.csv`;
                break;
        }

        if (csv) {
            downloadCSV(csv, filename);
        }
    };

    const exportOptions: { type: ExportDataType; label: string; labelNo: string; layer?: string }[] = [
        { type: 'stores', label: 'Stores', labelNo: 'Butikker', layer: 'stores' },
        { type: 'municipalities', label: 'Municipalities', labelNo: 'Kommuner' },
        { type: 'logistics', label: 'Logistics Hubs', labelNo: 'Logistikksentre', layer: 'logisticsHubs' },
        { type: 'farms', label: 'Farms', labelNo: 'Gårder', layer: 'farms' },
        { type: 'processing', label: 'Processing Plants', labelNo: 'Foredlingsanlegg', layer: 'processing-plants' },
        { type: 'ports', label: 'Ports', labelNo: 'Havner', layer: 'ports' },
        { type: 'aquaculture', label: 'Aquaculture Sites', labelNo: 'Akvakulturanlegg', layer: 'aquaculture' },
    ];

    const availableExports = exportOptions.filter(opt =>
        !opt.layer || activeLayers.includes(opt.layer as never)
    );

    return (
        <div className="relative group">
            <button
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                title={t("Export Data", "Eksporter data")}
            >
                <Download className="w-4 h-4" />
                <span lang="en">Export</span>
                <span lang="no">Eksporter</span>
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="py-1">
                    {availableExports.map(opt => (
                        <button
                            key={opt.type}
                            onClick={() => handleExport(opt.type)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            <span lang="en">{opt.label}</span>
                            <span lang="no">{opt.labelNo}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
