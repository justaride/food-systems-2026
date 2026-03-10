"use client";

import { usePathname } from 'next/navigation';
import { useFoodSystems } from '@/contexts/FoodSystemsContext';
import { FOOD_DESERT_RADIUS_KM } from '@/lib/food-systems/desert-analysis';
import type { CoverageAnalysis, MunicipalityCoverage } from '@/lib/food-systems/desert-analysis';

interface FoodDesertPanelProps {
    coverageAnalysis: CoverageAnalysis | null;
    selectedMunicipalityCoverage: MunicipalityCoverage | null;
}

export default function FoodDesertPanel({
    coverageAnalysis,
    selectedMunicipalityCoverage,
}: FoodDesertPanelProps) {
    const { activeLayers, selectedMunicipality, municipalities } = useFoodSystems();
    const pathname = usePathname() ?? "/en";
    const isNorwegian = pathname.split("/")[1] === "no";
    const t = (en: string, no: string) => (isNorwegian ? no : en);

    const isActive = activeLayers.includes('food-desert');

    if (!isActive) return null;

    const selectedMuniName = selectedMunicipality
        ? municipalities[selectedMunicipality]?.name
        : null;

    return (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-md border border-gray-200 p-4 max-w-[280px]">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-green-500 opacity-60" />
                <h3 className="text-sm font-semibold text-gray-800">
                    {t("Food Desert Analysis", "Matorkestanalyse")}
                </h3>
            </div>

            <p className="text-xs text-gray-500 mb-3">
                {t(
                    `Areas within ${FOOD_DESERT_RADIUS_KM}km of a grocery store`,
                    `Omrader innen ${FOOD_DESERT_RADIUS_KM}km fra en dagligvarebutikk`
                )}
            </p>

            {coverageAnalysis ? (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-green-50 rounded-lg p-2">
                            <p className="text-lg font-bold text-green-700">
                                {coverageAnalysis.coveragePercent}%
                            </p>
                            <p className="text-xs text-green-600">
                                {t("Coverage", "Dekning")}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-lg font-bold text-gray-700">
                                {coverageAnalysis.coveredArea.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                                {t("km2 covered", "km2 dekket")}
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500">
                                {t("Uncovered area", "Udekket omrade")}
                            </span>
                            <span className="text-gray-700 font-medium">
                                {coverageAnalysis.uncoveredArea.toLocaleString()} km2
                            </span>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                            <span className="text-gray-500">
                                {t("Municipalities without stores", "Kommuner uten butikker")}
                            </span>
                            <span className="text-gray-700 font-medium">
                                {coverageAnalysis.affectedMunicipalities.length}
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-xs text-gray-400 italic">
                    {t("Calculating coverage...", "Beregner dekning...")}
                </div>
            )}

            {selectedMunicipality && selectedMunicipalityCoverage && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">
                        {selectedMuniName || selectedMunicipality}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-emerald-50 rounded p-2">
                            <p className="text-sm font-bold text-emerald-700">
                                {selectedMunicipalityCoverage.coveragePercent}%
                            </p>
                            <p className="text-xs text-emerald-600">
                                {t("Local coverage", "Lokal dekning")}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                            <p className="text-sm font-bold text-gray-700">
                                {selectedMunicipalityCoverage.coveredArea.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                                {t("of", "av")} {selectedMunicipalityCoverage.totalArea.toLocaleString()} km2
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-3 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-green-500 opacity-40" />
                        {t("Covered", "Dekket")}
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-red-500 opacity-40" />
                        {t("Food desert", "Matorken")}
                    </span>
                </div>
            </div>
        </div>
    );
}
