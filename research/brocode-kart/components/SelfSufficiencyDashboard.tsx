"use client";

import { useFoodSystems } from '@/contexts/FoodSystemsContext';

interface CategoryData {
    key: string;
    labelEn: string;
    labelNo: string;
    value: number;
    icon: string;
}

type RiskLevel = 'secure' | 'stable' | 'vulnerable' | 'critical';

function getRiskLevel(value: number): RiskLevel {
    if (value >= 80) return 'secure';
    if (value >= 50) return 'stable';
    if (value >= 10) return 'vulnerable';
    return 'critical';
}

function getRiskColors(level: RiskLevel): { bg: string; text: string; border: string; bar: string } {
    switch (level) {
        case 'secure':
            return {
                bg: 'bg-emerald-500/10',
                text: 'text-emerald-400',
                border: 'border-emerald-500/30',
                bar: 'bg-emerald-500',
            };
        case 'stable':
            return {
                bg: 'bg-amber-500/10',
                text: 'text-amber-400',
                border: 'border-amber-500/30',
                bar: 'bg-amber-500',
            };
        case 'vulnerable':
            return {
                bg: 'bg-orange-500/10',
                text: 'text-orange-400',
                border: 'border-orange-500/30',
                bar: 'bg-orange-500',
            };
        case 'critical':
            return {
                bg: 'bg-red-500/10',
                text: 'text-red-400',
                border: 'border-red-500/30',
                bar: 'bg-red-500',
            };
    }
}

function getRiskLabel(level: RiskLevel): { en: string; no: string } {
    switch (level) {
        case 'secure':
            return { en: 'Secure', no: 'Sikker' };
        case 'stable':
            return { en: 'Stable', no: 'Stabil' };
        case 'vulnerable':
            return { en: 'Vulnerable', no: 'Sarbar' };
        case 'critical':
            return { en: 'Critical', no: 'Kritisk' };
    }
}

function SufficiencyCard({ category }: { category: CategoryData }) {
    const percent = Math.round(category.value * 100);
    const riskLevel = getRiskLevel(percent);
    const colors = getRiskColors(riskLevel);
    const riskLabel = getRiskLabel(riskLevel);

    return (
        <div className={`relative overflow-hidden rounded-xl border ${colors.border} ${colors.bg} backdrop-blur-sm p-4 transition-all hover:scale-[1.02]`}>
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h4 className="text-sm font-medium text-gray-300">
                        <span lang="en">{category.labelEn}</span>
                        <span lang="no">{category.labelNo}</span>
                    </h4>
                    <span className={`text-xs ${colors.text} font-medium`}>
                        <span lang="en">{riskLabel.en}</span>
                        <span lang="no">{riskLabel.no}</span>
                    </span>
                </div>
                <span className="text-2xl">{category.icon}</span>
            </div>

            <div className="flex items-end gap-2 mb-2">
                <span className={`text-3xl font-bold ${colors.text}`}>{percent}%</span>
                <span className="text-xs text-gray-500 mb-1">
                    <span lang="en">domestic</span>
                    <span lang="no">norsk</span>
                </span>
            </div>

            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                />
            </div>

            <div className="mt-2 text-xs text-gray-500">
                <span lang="en">{100 - percent}% imported</span>
                <span lang="no">{100 - percent}% importert</span>
            </div>
        </div>
    );
}

function VulnerabilityGauge({ score }: { score: number }) {
    const normalizedScore = Math.round(score * 100);
    const rotation = (normalizedScore / 100) * 180 - 90;

    return (
        <div className="relative flex flex-col items-center">
            <svg viewBox="0 0 120 70" className="w-full max-w-[200px]">
                <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="33%" stopColor="#eab308" />
                        <stop offset="66%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                </defs>

                <path
                    d="M 10 60 A 50 50 0 0 1 110 60"
                    fill="none"
                    stroke="url(#gaugeGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                />

                <path
                    d="M 10 60 A 50 50 0 0 1 110 60"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="10"
                    strokeLinecap="round"
                />

                <g transform={`rotate(${rotation}, 60, 60)`}>
                    <line
                        x1="60"
                        y1="60"
                        x2="60"
                        y2="20"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                    <circle cx="60" cy="60" r="4" fill="white" />
                </g>
            </svg>

            <div className="text-center -mt-2">
                <span className="text-2xl font-bold text-white">{normalizedScore}%</span>
                <div className="text-xs text-gray-400">
                    <span lang="en">Import Dependency</span>
                    <span lang="no">Importavhengighet</span>
                </div>
            </div>
        </div>
    );
}

export default function SelfSufficiencyDashboard() {
    const { insights } = useFoodSystems();

    if (!insights) {
        return (
            <div className="animate-pulse bg-gray-800/50 rounded-xl h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const self = insights.ssb.production.self_sufficiency_2023;

    const categories: CategoryData[] = [
        { key: 'milk', labelEn: 'Milk', labelNo: 'Melk', value: self.milk, icon: '🥛' },
        { key: 'meat', labelEn: 'Meat', labelNo: 'Kjott', value: self.meat, icon: '🥩' },
        { key: 'potatoes', labelEn: 'Potatoes', labelNo: 'Poteter', value: self.potatoes, icon: '🥔' },
        { key: 'vegetables', labelEn: 'Vegetables', labelNo: 'Gronnsaker', value: self.vegetables, icon: '🥬' },
        { key: 'fruit', labelEn: 'Fruit', labelNo: 'Frukt', value: self.fruit, icon: '🍎' },
    ];

    const overallCalories = Math.round(self.calories * 100);
    const correctedCalories = Math.round(self.calories_corrected_for_feed * 100);
    const importDependency = 1 - self.calories;

    const secureCategories = categories.filter(c => getRiskLevel(c.value * 100) === 'secure');
    const criticalCategories = categories.filter(c => getRiskLevel(c.value * 100) === 'critical');

    return (
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 space-y-6">
            <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-white">
                    <span lang="en">Food Self-Sufficiency</span>
                    <span lang="no">Matvareselvforsyning</span>
                </h3>
                <p className="text-sm text-gray-400">
                    <span lang="en">Norway's domestic food production capacity (2023)</span>
                    <span lang="no">Norges innenlandske matproduksjonskapasitet (2023)</span>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <VulnerabilityGauge score={importDependency} />

                        <div className="flex-1 space-y-4">
                            <div>
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="text-sm text-gray-400">
                                        <span lang="en">Overall Calorie Self-Sufficiency</span>
                                        <span lang="no">Total kaloriselvforsyning</span>
                                    </span>
                                    <span className="text-lg font-bold text-amber-400">{overallCalories}%</span>
                                </div>
                                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                                        style={{ width: `${overallCalories}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="text-sm text-gray-400">
                                        <span lang="en">Corrected for Imported Feed</span>
                                        <span lang="no">Korrigert for importert for</span>
                                    </span>
                                    <span className="text-lg font-bold text-orange-400">{correctedCalories}%</span>
                                </div>
                                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                                        style={{ width: `${correctedCalories}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    <span lang="en">* Excludes calories from animals fed with imported grain</span>
                                    <span lang="no">* Ekskluderer kalorier fra dyr foret med importert korn</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50 space-y-4">
                    <h4 className="text-sm font-semibold text-gray-300">
                        <span lang="en">Security Summary</span>
                        <span lang="no">Sikkerhetsoversikt</span>
                    </h4>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-lg font-bold text-emerald-400">{secureCategories.length}</div>
                                <div className="text-xs text-gray-500">
                                    <span lang="en">Secure categories</span>
                                    <span lang="no">Sikre kategorier</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-lg font-bold text-red-400">{criticalCategories.length}</div>
                                <div className="text-xs text-gray-500">
                                    <span lang="en">Critical dependencies</span>
                                    <span lang="no">Kritiske avhengigheter</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-3">
                    <span lang="en">By Category</span>
                    <span lang="no">Per kategori</span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {categories.map((category) => (
                        <SufficiencyCard key={category.key} category={category} />
                    ))}
                </div>
            </div>

            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h5 className="text-sm font-medium text-gray-300 mb-1">
                            <span lang="en">Key Insight</span>
                            <span lang="no">Nokkelfunn</span>
                        </h5>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            <span lang="en">
                                Norway produces only 44% of its caloric needs domestically. While dairy and meat production
                                is nearly self-sufficient, fruit production covers just 4% of consumption, making it highly
                                dependent on imports - primarily from the EU.
                            </span>
                            <span lang="no">
                                Norge produserer kun 44% av sitt kaloribehov innenlands. Mens melke- og kjottproduksjonen
                                er nesten selvforsynt, dekker fruktproduksjonen bare 4% av forbruket, noe som gjor den
                                svart avhengig av import - hovedsakelig fra EU.
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
