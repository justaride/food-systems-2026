"use client";

import { usePathname } from 'next/navigation';
import { useFoodSystems } from '@/contexts/FoodSystemsContext';
import { LAYER_CONFIGS, CHAIN_CONFIGS, FARM_TYPE_COLORS, FLOW_TYPE_COLORS, PORT_TYPE_COLORS, PROCESSING_COMPANY_COLORS, AQUACULTURE_PRODUCTION_COLORS, AQUACULTURE_PRODUCTION_LABELS, FoodSystemsLayer, ChainId, FarmType, FlowType, PortType, ProcessingCompany, AquacultureProductionType } from '@/lib/food-systems/types';

export default function LayerControls() {
    const {
        activeLayers,
        toggleLayer,
        activeChains,
        toggleChain,
        isComparisonMode,
        setIsComparisonMode,
        selectedMunicipality,
        setComparisonMunicipality,
    } = useFoodSystems();

    const pathname = usePathname() ?? "/en";
    const isNorwegian = pathname.split("/")[1] === "no";
    const t = (en: string, no: string) => (isNorwegian ? no : en);

    const layers: FoodSystemsLayer[] = ['stores', 'logisticsHubs', 'boundaries', 'density', 'concentration'];
    const productionLayers: FoodSystemsLayer[] = ['farms', 'processing-plants'];
    const maritimeLayers: FoodSystemsLayer[] = ['ports', 'aquaculture'];
    const analysisLayers: FoodSystemsLayer[] = ['food-desert', 'flows', 'vulnerability'];

    const FARM_TYPE_LABELS: Record<FarmType, string> = {
        'dairy': 'Dairy',
        'grain': 'Grain',
        'vegetables': 'Vegetables',
        'livestock': 'Livestock',
        'mixed': 'Mixed',
    };

    const PORT_TYPE_LABELS: Record<PortType, string> = {
        'fishing': 'Fishing',
        'cargo': 'Cargo',
        'mixed': 'Mixed',
        'aquaculture': 'Aquaculture',
    };

    const handleComparisonToggle = () => {
        if (isComparisonMode) {
            setComparisonMunicipality(null);
        }
        setIsComparisonMode(!isComparisonMode);
    };

    return (
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-[1000] bg-white rounded-lg shadow-md border border-gray-200 p-2 sm:p-3 max-w-[160px] sm:max-w-[200px] max-h-[calc(100vh-100px)] overflow-y-auto">
            <div className="space-y-3">
                <div>
                    <button
                        onClick={handleComparisonToggle}
                        className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-3 ${
                            isComparisonMode
                                ? 'bg-violet-100 text-violet-700 border border-violet-300'
                                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                        }`}
                        title={t("Compare two municipalities side-by-side", "Sammenlign to kommuner side ved side")}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        {t("Compare", "Sammenlign")}
                    </button>

                    {isComparisonMode && !selectedMunicipality && (
                        <p className="text-xs text-violet-600 mb-3">
                            {t("Click a municipality to start", "Klikk pa en kommune for a starte")}
                        </p>
                    )}

                    <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide" lang="en">
                        Layers
                    </h4>
                    <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide" lang="no">
                        Lag
                    </h4>
                    <div className="space-y-1">
                        {layers.map(layerId => {
                            const config = LAYER_CONFIGS[layerId];
                            const isActive = activeLayers.includes(layerId);
                            return (
                                <label
                                    key={layerId}
                                    className="flex items-center gap-2 cursor-pointer text-sm"
                                >
                                    <input
                                        type="checkbox"
                                        checked={isActive}
                                        onChange={() => toggleLayer(layerId)}
                                        className="w-3.5 h-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-gray-700" lang="en">{config.name}</span>
                                    <span className="text-gray-700" lang="no">{config.nameNo}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide" lang="en">
                        Production
                    </h4>
                    <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide" lang="no">
                        Produksjon
                    </h4>
                    <div className="space-y-1">
                        {productionLayers.map(layerId => {
                            const config = LAYER_CONFIGS[layerId];
                            const isActive = activeLayers.includes(layerId);
                            return (
                                <label
                                    key={layerId}
                                    className="flex items-center gap-2 cursor-pointer text-sm"
                                >
                                    <input
                                        type="checkbox"
                                        checked={isActive}
                                        onChange={() => toggleLayer(layerId)}
                                        className="w-3.5 h-3.5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                    />
                                    <span className="text-gray-700" lang="en">{config.name}</span>
                                    <span className="text-gray-700" lang="no">{config.nameNo}</span>
                                </label>
                            );
                        })}
                    </div>
                    {activeLayers.includes('farms') && (
                        <div className="mt-2 ml-4 space-y-0.5">
                            {(Object.keys(FARM_TYPE_COLORS) as FarmType[]).map(type => (
                                <div key={type} className="flex items-center gap-2 text-xs text-gray-600">
                                    <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: FARM_TYPE_COLORS[type] }}
                                    />
                                    <span>{FARM_TYPE_LABELS[type]}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeLayers.includes('processing-plants') && (
                        <div className="mt-2 ml-4 space-y-0.5">
                            {(Object.keys(PROCESSING_COMPANY_COLORS) as ProcessingCompany[]).map(company => (
                                <div key={company} className="flex items-center gap-2 text-xs text-gray-600">
                                    <span
                                        className="w-2 h-2 rounded"
                                        style={{ backgroundColor: PROCESSING_COMPANY_COLORS[company] }}
                                    />
                                    <span>{company}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide" lang="en">
                        Maritime
                    </h4>
                    <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide" lang="no">
                        Maritim
                    </h4>
                    <div className="space-y-1">
                        {maritimeLayers.map(layerId => {
                            const config = LAYER_CONFIGS[layerId];
                            const isActive = activeLayers.includes(layerId);
                            return (
                                <label
                                    key={layerId}
                                    className="flex items-center gap-2 cursor-pointer text-sm"
                                >
                                    <input
                                        type="checkbox"
                                        checked={isActive}
                                        onChange={() => toggleLayer(layerId)}
                                        className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700" lang="en">{config.name}</span>
                                    <span className="text-gray-700" lang="no">{config.nameNo}</span>
                                </label>
                            );
                        })}
                    </div>
                    {activeLayers.includes('ports') && (
                        <div className="mt-2 ml-4 space-y-0.5">
                            {(Object.keys(PORT_TYPE_COLORS) as PortType[]).map(type => (
                                <div key={type} className="flex items-center gap-2 text-xs text-gray-600">
                                    <span
                                        className="w-2 h-2 rounded"
                                        style={{ backgroundColor: PORT_TYPE_COLORS[type] }}
                                    />
                                    <span>{PORT_TYPE_LABELS[type]}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeLayers.includes('aquaculture') && (
                        <div className="mt-2 ml-4 space-y-0.5">
                            {(Object.keys(AQUACULTURE_PRODUCTION_COLORS) as AquacultureProductionType[]).map(type => (
                                <div key={type} className="flex items-center gap-2 text-xs text-gray-600">
                                    <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: AQUACULTURE_PRODUCTION_COLORS[type] }}
                                    />
                                    <span>{AQUACULTURE_PRODUCTION_LABELS[type].en}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide" lang="en">
                        Analysis
                    </h4>
                    <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide" lang="no">
                        Analyse
                    </h4>
                    <div className="space-y-1">
                        {analysisLayers.map(layerId => {
                            const config = LAYER_CONFIGS[layerId];
                            const isActive = activeLayers.includes(layerId);
                            const indicatorColor = layerId === 'flows' ? FLOW_TYPE_COLORS.distribution : undefined;
                            return (
                                <label
                                    key={layerId}
                                    className="flex items-center gap-2 cursor-pointer text-sm"
                                >
                                    <input
                                        type="checkbox"
                                        checked={isActive}
                                        onChange={() => toggleLayer(layerId)}
                                        className="w-3.5 h-3.5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                    <span
                                        className="w-2 h-2 rounded-full opacity-60"
                                        style={{ backgroundColor: indicatorColor || '#22C55E' }}
                                    />
                                    <span className="text-gray-700" lang="en">{config.name}</span>
                                    <span className="text-gray-700" lang="no">{config.nameNo}</span>
                                </label>
                            );
                        })}
                    </div>
                    {activeLayers.includes('flows') && (
                        <div className="mt-2 ml-4 space-y-0.5">
                            {(Object.keys(FLOW_TYPE_COLORS) as FlowType[]).map(type => (
                                <div key={type} className="flex items-center gap-2 text-xs text-gray-600">
                                    <span
                                        className="w-4 h-0.5"
                                        style={{ backgroundColor: FLOW_TYPE_COLORS[type] }}
                                    />
                                    <span className="capitalize">{type}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeLayers.includes('vulnerability') && (
                        <div className="mt-2 ml-4 space-y-0.5">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22C55E' }} />
                                <span>{t("Low risk", "Lav risiko")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FBBF24' }} />
                                <span>{t("Medium risk", "Middels risiko")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F97316' }} />
                                <span>{t("High risk", "Høy risiko")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#EF4444' }} />
                                <span>{t("Critical risk", "Kritisk risiko")}</span>
                            </div>
                        </div>
                    )}
                </div>

                {activeLayers.includes('stores') && (
                    <div>
                        <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide" lang="en">
                            Chains
                        </h4>
                        <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide" lang="no">
                            Kjeder
                        </h4>
                        <div className="space-y-1 max-h-[200px] overflow-y-auto">
                            {Object.entries(CHAIN_CONFIGS).map(([chainId, config]) => {
                                const isActive = activeChains.includes(chainId as ChainId);
                                return (
                                    <label
                                        key={chainId}
                                        className="flex items-center gap-2 cursor-pointer text-sm"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isActive}
                                            onChange={() => toggleChain(chainId as ChainId)}
                                            className="w-3.5 h-3.5 rounded border-gray-300"
                                            style={{
                                                accentColor: config.color
                                            }}
                                        />
                                        <span
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: config.color }}
                                        />
                                        <span className="text-gray-700 text-xs">{config.name}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
