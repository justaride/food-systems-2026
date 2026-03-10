"use client";

import { useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import { useFoodSystems } from '@/contexts/FoodSystemsContext';
import { calculateMunicipalityMetrics, getConcentrationLevel } from '@/lib/food-systems/metrics';
import { CHAIN_CONFIGS } from '@/lib/food-systems/types';
import type { Store, Municipality, MunicipalityMetrics } from '@/lib/food-systems/types';
import {
    MarketShareChart,
    ParentCompanyChart,
    StoreTypeChart,
    ComparisonChart,
} from './charts';

interface MunicipalityPanelProps {
    isOpen: boolean;
}

interface MunicipalityData {
    municipality: Municipality | null;
    stores: Store[];
    metrics: MunicipalityMetrics | null;
}

function ComparisonIndicator({
    value1,
    value2,
    higherIsBetter = true,
    format = 'number',
}: {
    value1: number;
    value2: number;
    higherIsBetter?: boolean;
    format?: 'number' | 'percent' | 'decimal';
}) {
    if (value1 === value2) return null;

    const diff = value1 - value2;
    const percentDiff = value2 !== 0 ? Math.abs((diff / value2) * 100) : 0;
    const isHigher = diff > 0;
    const isBetter = higherIsBetter ? isHigher : !isHigher;

    const formattedDiff = format === 'percent'
        ? `${Math.abs(diff).toFixed(1)}%`
        : format === 'decimal'
            ? Math.abs(diff).toFixed(2)
            : Math.abs(diff).toLocaleString();

    return (
        <span className={`text-xs ml-1 ${isBetter ? 'text-emerald-600' : 'text-red-500'}`}>
            {isHigher ? '+' : '-'}{formattedDiff}
            {percentDiff > 0.1 && (
                <span className="text-gray-400 ml-0.5">({percentDiff.toFixed(0)}%)</span>
            )}
        </span>
    );
}

export default function MunicipalityPanel({ isOpen }: MunicipalityPanelProps) {
    const {
        selectedMunicipality,
        setSelectedMunicipality,
        comparisonMunicipality,
        setComparisonMunicipality,
        isComparisonMode,
        setIsPanelOpen,
        nationalMetrics,
        stores: allStores,
        municipalities: allMunicipalities,
        geojson,
        municipalityMetrics,
    } = useFoodSystems();
    const pathname = usePathname() ?? "/en";
    const isNorwegian = pathname.split("/")[1] === "no";
    const t = (en: string, no: string) => (isNorwegian ? no : en);

    // Memoize store-to-municipality mapping (only recalculate when geojson/stores change)
    const storesByMunicipality = useMemo(() => {
        if (!geojson || !allStores.length) return {};

        const mapping: Record<string, Store[]> = {};

        for (const feature of geojson.features) {
            const code = feature.properties?.kommunenummer;
            if (!code) continue;

            mapping[code] = allStores.filter(store => {
                try {
                    const storePoint = point([store.location.lng, store.location.lat]);
                    return booleanPointInPolygon(storePoint, feature as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>);
                } catch {
                    return false;
                }
            });
        }

        return mapping;
    }, [geojson, allStores]);

    // Get municipality data using memoized mapping
    const getMunicipalityData = useCallback((code: string | null): MunicipalityData => {
        if (!code || !allMunicipalities[code]) {
            return { municipality: null, stores: [], metrics: null };
        }

        const muni = allMunicipalities[code];
        const muniStores = storesByMunicipality[code] || [];
        const metrics = municipalityMetrics[code] || calculateMunicipalityMetrics(muni, muniStores);

        return { municipality: muni, stores: muniStores, metrics };
    }, [allMunicipalities, storesByMunicipality, municipalityMetrics]);

    // Memoize primary and comparison data
    const primaryData = useMemo(
        () => getMunicipalityData(selectedMunicipality),
        [selectedMunicipality, getMunicipalityData]
    );

    const comparisonData = useMemo(
        () => getMunicipalityData(comparisonMunicipality),
        [comparisonMunicipality, getMunicipalityData]
    );

    const showComparison = isComparisonMode && comparisonMunicipality && comparisonData.municipality;

    const handleClose = () => {
        setIsPanelOpen(false);
        setSelectedMunicipality(null);
        setComparisonMunicipality(null);
    };

    // Count stores by chain for primary municipality
    const primaryChainCounts = useMemo(() => {
        return primaryData.stores.reduce((acc, store) => {
            acc[store.chain] = (acc[store.chain] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [primaryData.stores]);

    const primarySortedChains = Object.entries(primaryChainCounts).sort((a, b) => b[1] - a[1]);

    // Count stores by chain for comparison municipality
    const comparisonChainCounts = useMemo(() => {
        return comparisonData.stores.reduce((acc, store) => {
            acc[store.chain] = (acc[store.chain] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [comparisonData.stores]);

    const comparisonSortedChains = Object.entries(comparisonChainCounts).sort((a, b) => b[1] - a[1]);

    // For backward compatibility
    const municipality = primaryData.municipality;
    const stores = primaryData.stores;
    const metrics = primaryData.metrics;

    const renderMunicipalityColumn = (
        data: MunicipalityData,
        sortedChains: [string, number][],
        isPrimary: boolean,
        compareData?: MunicipalityData
    ) => {
        const { municipality: muni, stores: muniStores, metrics: muniMetrics } = data;
        const compareMetrics = compareData?.metrics;
        const compareMuni = compareData?.municipality;

        if (!muni) return null;

        return (
            <div className={`${showComparison ? 'flex-1 min-w-0' : ''}`}>
                <div className={`${showComparison && !isPrimary ? 'border-l border-gray-200 pl-4' : ''}`}>
                    <div className="mb-4">
                        <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${isPrimary ? 'bg-emerald-500' : 'bg-violet-500'}`} />
                            <h3 className="text-lg font-bold text-gray-900">{muni.name}</h3>
                        </div>
                        <p className="text-xs text-gray-500 ml-5">
                            {t("Municipality", "Kommune")} {muni.code}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xl font-bold text-gray-900">
                                    {muni.population?.toLocaleString() ?? 'N/A'}
                                    {showComparison && compareMuni?.population && muni.population && (
                                        <ComparisonIndicator
                                            value1={muni.population}
                                            value2={compareMuni.population}
                                        />
                                    )}
                                </p>
                                <p className="text-xs text-gray-500">{t("Population", "Befolkning")}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xl font-bold text-gray-900">
                                    {muniStores.length}
                                    {showComparison && compareData && (
                                        <ComparisonIndicator
                                            value1={muniStores.length}
                                            value2={compareData.stores.length}
                                        />
                                    )}
                                </p>
                                <p className="text-xs text-gray-500">{t("Stores", "Butikker")}</p>
                            </div>
                        </div>

                        {muniMetrics && (
                            <>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">{t("Density", "Tetthet")}</span>
                                        <span className="text-sm font-medium text-gray-700">
                                            {muniMetrics.storesPerCapita.toFixed(2)}
                                            {showComparison && compareMetrics && (
                                                <ComparisonIndicator
                                                    value1={muniMetrics.storesPerCapita}
                                                    value2={compareMetrics.storesPerCapita}
                                                    format="decimal"
                                                />
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 mt-1">
                                        <div
                                            className={`h-1.5 rounded-full ${isPrimary ? 'bg-emerald-500' : 'bg-violet-500'}`}
                                            style={{ width: `${Math.min(muniMetrics.storesPerCapita / 2 * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">{t("HHI", "HHI")}</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                getConcentrationLevel(muniMetrics.hhi) === 'competitive'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : getConcentrationLevel(muniMetrics.hhi) === 'moderate'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : 'bg-red-100 text-red-700'
                                            }`}>
                                                {muniMetrics.hhi}
                                            </span>
                                            {showComparison && compareMetrics && (
                                                <ComparisonIndicator
                                                    value1={muniMetrics.hhi}
                                                    value2={compareMetrics.hhi}
                                                    higherIsBetter={false}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {getConcentrationLevel(muniMetrics.hhi) === 'competitive' && t('Competitive', 'Konkurransedyktig')}
                                        {getConcentrationLevel(muniMetrics.hhi) === 'moderate' && t('Moderate', 'Moderat')}
                                        {getConcentrationLevel(muniMetrics.hhi) === 'concentrated' && t('Concentrated', 'Konsentrert')}
                                    </p>
                                </div>
                            </>
                        )}

                        {muni.medianIncome && (
                            <div className="bg-blue-50 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-blue-600">{t("Median income", "Medianinntekt")}</span>
                                    <span className="text-sm font-bold text-blue-900">
                                        {(muni.medianIncome / 1000).toFixed(0)}k
                                        {showComparison && compareMuni?.medianIncome && (
                                            <ComparisonIndicator
                                                value1={muni.medianIncome}
                                                value2={compareMuni.medianIncome}
                                            />
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}

                        {muni.ageDistribution && (
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-amber-50 rounded-lg p-2">
                                    <p className="text-sm font-bold text-amber-900">
                                        {muni.ageDistribution.under18Pct}%
                                        {showComparison && compareMuni?.ageDistribution && (
                                            <ComparisonIndicator
                                                value1={muni.ageDistribution.under18Pct}
                                                value2={compareMuni.ageDistribution.under18Pct}
                                                format="percent"
                                            />
                                        )}
                                    </p>
                                    <p className="text-xs text-amber-600">{t("Under 18", "Under 18")}</p>
                                </div>
                                <div className="bg-teal-50 rounded-lg p-2">
                                    <p className="text-sm font-bold text-teal-900">
                                        {muni.ageDistribution.over65Pct}%
                                        {showComparison && compareMuni?.ageDistribution && (
                                            <ComparisonIndicator
                                                value1={muni.ageDistribution.over65Pct}
                                                value2={compareMuni.ageDistribution.over65Pct}
                                                format="percent"
                                            />
                                        )}
                                    </p>
                                    <p className="text-xs text-teal-600">{t("Over 65", "Over 65")}</p>
                                </div>
                            </div>
                        )}

                        {muniStores.length > 0 && (
                            <div>
                                <h4 className="text-xs font-semibold text-gray-600 mb-2">
                                    {t("Top Chains", "Topp kjeder")}
                                </h4>
                                <div className="space-y-1">
                                    {sortedChains.slice(0, 5).map(([chain, count]) => {
                                        const config = Object.values(CHAIN_CONFIGS).find(c => c.name === chain);
                                        const percentage = Math.round((count / muniStores.length) * 100);
                                        return (
                                            <div key={chain} className="flex items-center gap-2 text-xs">
                                                <span
                                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: config?.color ?? '#9CA3AF' }}
                                                />
                                                <span className="text-gray-700 flex-1 truncate">{chain}</span>
                                                <span className="text-gray-500">{count}</span>
                                                <span className="text-gray-400 w-8 text-right">{percentage}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && municipality && (
                <motion.div
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className={`absolute top-0 right-0 h-full bg-white shadow-xl border-l border-gray-200 z-[1001] overflow-y-auto ${
                        showComparison ? 'w-full md:w-[700px]' : 'w-full md:w-[400px]'
                    }`}
                >
                    <div className="p-4 md:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {showComparison ? (
                                    <h2 className="text-lg font-bold text-gray-900">
                                        {t("Comparing Municipalities", "Sammenligner kommuner")}
                                    </h2>
                                ) : (
                                    <h2 className="text-xl font-bold text-gray-900">{municipality.name}</h2>
                                )}
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label={t("Close panel", "Lukk panel")}
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {isComparisonMode && !comparisonMunicipality && (
                            <div className="mb-4 p-3 bg-violet-50 border border-violet-200 rounded-lg">
                                <p className="text-sm text-violet-700">
                                    {t(
                                        "Click another municipality on the map to compare",
                                        "Klikk pa en annen kommune pa kartet for a sammenligne"
                                    )}
                                </p>
                            </div>
                        )}

                        {showComparison ? (
                            <div className="flex gap-4">
                                {renderMunicipalityColumn(primaryData, primarySortedChains, true, comparisonData)}
                                {renderMunicipalityColumn(comparisonData, comparisonSortedChains, false, primaryData)}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-2xl font-bold text-gray-900">
                                            {municipality.population?.toLocaleString() ?? 'N/A'}
                                        </p>
                                        <p className="text-xs text-gray-500">{t("Population", "Befolkning")}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-2xl font-bold text-gray-900">
                                            {municipality.area?.toLocaleString() ?? 'N/A'} km2
                                        </p>
                                        <p className="text-xs text-gray-500">{t("Area", "Areal")}</p>
                                    </div>
                                </div>

                                {(municipality.medianIncome || municipality.ageDistribution) && (
                                    <div className="border-t border-gray-200 pt-4">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-3">{t("Demographics", "Demografi")}</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {municipality.medianIncome && (
                                                <div className="bg-blue-50 rounded-lg p-3">
                                                    <p className="text-lg font-bold text-blue-900">
                                                        {(municipality.medianIncome / 1000).toFixed(0)}k
                                                    </p>
                                                    <p className="text-xs text-blue-600">{t("Median income (NOK)", "Medianinntekt (kr)")}</p>
                                                </div>
                                            )}
                                            {municipality.households && (
                                                <div className="bg-purple-50 rounded-lg p-3">
                                                    <p className="text-lg font-bold text-purple-900">
                                                        {municipality.households.toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-purple-600">{t("Households", "Husholdninger")}</p>
                                                </div>
                                            )}
                                            {municipality.ageDistribution && (
                                                <>
                                                    <div className="bg-amber-50 rounded-lg p-3">
                                                        <p className="text-lg font-bold text-amber-900">
                                                            {municipality.ageDistribution.under18Pct}%
                                                        </p>
                                                        <p className="text-xs text-amber-600">{t("Under 18", "Under 18 ar")}</p>
                                                    </div>
                                                    <div className="bg-teal-50 rounded-lg p-3">
                                                        <p className="text-lg font-bold text-teal-900">
                                                            {municipality.ageDistribution.over65Pct}%
                                                        </p>
                                                        <p className="text-xs text-teal-600">{t("Over 65", "Over 65 ar")}</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {metrics && (
                                    <>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 mb-3">{t("Store Density", "Butikktetthet")}</h3>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-emerald-500 h-2 rounded-full"
                                                        style={{ width: `${Math.min(metrics.storesPerCapita / 2 * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">
                                                    {metrics.storesPerCapita.toFixed(2)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {t("per 1,000 residents (national avg: ~0.7)", "per 1 000 innbyggere (nasjonalt snitt: ~0,7)")}
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 mb-3">{t("Market Concentration", "Markedskonsentrasjon")}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    getConcentrationLevel(metrics.hhi) === 'competitive'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : getConcentrationLevel(metrics.hhi) === 'moderate'
                                                            ? 'bg-purple-100 text-purple-700'
                                                            : 'bg-red-100 text-red-700'
                                                }`}>
                                                    HHI: {metrics.hhi}
                                                </span>
                                                <span className="text-sm text-gray-600">
                                                    {getConcentrationLevel(metrics.hhi) === 'competitive' && t('Competitive', 'Konkurransedyktig')}
                                                    {getConcentrationLevel(metrics.hhi) === 'moderate' && t('Moderate', 'Moderat')}
                                                    {getConcentrationLevel(metrics.hhi) === 'concentrated' && t('Concentrated', 'Konsentrert')}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {stores.length > 0 ? (
                                    <>
                                        <MarketShareChart />

                                        <ParentCompanyChart stores={stores} isNorwegian={isNorwegian} />

                                        <StoreTypeChart stores={stores} isNorwegian={isNorwegian} />

                                        {metrics && nationalMetrics && (
                                            <ComparisonChart
                                                metrics={metrics}
                                                nationalMetrics={nationalMetrics}
                                                municipalityArea={municipality?.area ?? 0}
                                                isNorwegian={isNorwegian}
                                            />
                                        )}

                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                                {t(`Stores by Chain (${stores.length} total)`, `Butikker per kjede (${stores.length} totalt)`)}
                                            </h3>
                                            <div className="space-y-2">
                                                {primarySortedChains.map(([chain, count]) => {
                                                    const config = Object.values(CHAIN_CONFIGS).find(c => c.name === chain);
                                                    const percentage = Math.round((count / stores.length) * 100);
                                                    return (
                                                        <div key={chain} className="flex items-center gap-2">
                                                            <span
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: config?.color ?? '#9CA3AF' }}
                                                            />
                                                            <span className="text-sm text-gray-700 flex-1">{chain}</span>
                                                            <span className="text-sm text-gray-500">{count}</span>
                                                            <span className="text-xs text-gray-400 w-10 text-right">{percentage}%</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>{t("No stores found in this municipality", "Ingen butikker funnet i denne kommunen")}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
