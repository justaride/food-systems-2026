'use client';

import { useState } from 'react';
import ZipfDistributionChart from './charts/ZipfDistributionChart';
import LorenzCurveChart from './charts/LorenzCurveChart';
import CausalLoopDiagram from './charts/CausalLoopDiagram';
import EmergenceVisualization from './charts/EmergenceVisualization';
import { CHAIN_CONFIGS, type Municipality } from '@/lib/food-systems/types';
import { useFoodSystems } from '@/contexts/FoodSystemsContext';

type PatternTab = 'power-laws' | 'feedback' | 'emergence' | 'metabolism';

interface TabConfig {
    id: PatternTab;
    label: { en: string; no: string };
    icon: React.ReactNode;
    activeClasses: string;
}

const TABS: TabConfig[] = [
    {
        id: 'power-laws',
        label: { en: 'Power Laws', no: 'Potenslov' },
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
        ),
        activeClasses: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    },
    {
        id: 'feedback',
        label: { en: 'Feedback Loops', no: 'Tilbakekoblingsløkker' },
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        ),
        activeClasses: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    },
    {
        id: 'emergence',
        label: { en: 'Emergence', no: 'Fremvekst' },
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
        activeClasses: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
    },
    {
        id: 'metabolism',
        label: { en: 'Metabolism', no: 'Metabolisme' },
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
        ),
        activeClasses: 'bg-green-500/20 text-green-400 border-green-500/50',
    },
];

export default function PatternsSection({ isNorwegian = false }: { isNorwegian?: boolean }) {
    const [activeTab, setActiveTab] = useState<PatternTab>('power-laws');
    const { stores, municipalities } = useFoodSystems();

    const t = <T,>(en: T, no: T): T => (isNorwegian ? no : en);

    const isLoading = stores.length === 0 || Object.keys(municipalities).length === 0;

    // Prepare chain data for Zipf/Lorenz charts
    const chainData = stores.length > 0
        ? Object.entries(
            stores.reduce<Record<string, number>>((acc, store) => {
                acc[store.chain] = (acc[store.chain] || 0) + 1;
                return acc;
            }, {})
        ).map(([chain, count]) => ({ name: chain, value: count }))
        : [];

    // Prepare parent company data
    const parentData = stores.length > 0
        ? Object.entries(
            stores.reduce<Record<string, number>>((acc, store) => {
                const config = CHAIN_CONFIGS[store.chainId as keyof typeof CHAIN_CONFIGS];
                const parent = config?.parent || 'Other';
                acc[parent] = (acc[parent] || 0) + 1;
                return acc;
            }, {})
        ).map(([parent, count]) => ({ name: parent, value: count }))
        : [];

    // Prepare population data for municipalities
    const populationData = Object.keys(municipalities).length > 0
        ? Object.values(municipalities)
            .filter((m): m is Municipality => m.population > 0)
            .map(m => ({ name: m.name, value: m.population }))
        : [];

    return (
        <div className="space-y-8">
            {/* Section Header */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    {t('Systems Thinking', 'Systemtenkning')}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                    {t('The Pattern That Connects', 'Mønsteret som forbinder')}
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    {t(
                        'Applying power laws, feedback loops, emergence, and ecological metabolism to understand food system dynamics',
                        'Bruk av power laws, tilbakekoblingsløkker, fremvekst og økologisk metabolisme for å forstå matsystemets dynamikk'
                    )}
                </p>
            </div>

            {/* Tab Navigation */}
            <div
                className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-2"
                role="tablist"
                aria-label={t('Pattern analysis tabs', 'Mønsteranalyse-faner')}
            >
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        aria-controls={`panel-${tab.id}`}
                        id={`tab-${tab.id}`}
                        className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all border ${
                            activeTab === tab.id
                                ? tab.activeClasses
                                : 'bg-gray-800/60 text-gray-400 border-gray-700 hover:bg-gray-700/60'
                        }`}
                    >
                        {tab.icon}
                        <span>{isNorwegian ? tab.label.no : tab.label.en}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="mt-8">
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                            <p className="text-gray-400 text-sm">
                                {t('Loading pattern analysis...', 'Laster mønsteranalyse...')}
                            </p>
                        </div>
                    </div>
                )}

                {!isLoading && activeTab === 'power-laws' && (
                    <div
                        role="tabpanel"
                        id="panel-power-laws"
                        aria-labelledby="tab-power-laws"
                        className="space-y-8"
                    >
                        <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 p-6">
                            <h3 className="text-xl font-bold text-white mb-4">
                                {t('Power Laws: The Signature of Self-Organization', 'Potenslov: Signaturen til selvorganisering')}
                            </h3>
                            <p className="text-gray-300 mb-6">
                                {t(
                                    'When you see a power law, you\'re witnessing self-organization at work. The distribution wasn\'t designed—it emerged from local interactions following simple rules.',
                                    'Når du ser en power law, ser du selvorganisering i arbeid. Fordelingen ble ikke designet—den oppsto fra lokale interaksjoner som følger enkle regler.'
                                )}
                            </p>

                            <div className="grid md:grid-cols-2 gap-6">
                                {chainData.length > 0 && (
                                    <ZipfDistributionChart
                                        data={chainData}
                                        title={t('Chain Store Distribution', 'Kjedebutikkfordeling')}
                                        valueLabel={t('Stores', 'Butikker')}
                                        isNorwegian={isNorwegian}
                                        height={300}
                                    />
                                )}
                                {populationData.length > 0 && (
                                    <ZipfDistributionChart
                                        data={populationData}
                                        title={t('Municipality Population (Reference)', 'Kommunebefolkning (referanse)')}
                                        valueLabel={t('Population', 'Befolkning')}
                                        isNorwegian={isNorwegian}
                                        height={300}
                                    />
                                )}
                            </div>
                        </div>

                        {parentData.length > 0 && (
                            <LorenzCurveChart
                                data={parentData}
                                title={t('Market Concentration: Parent Companies', 'Markedskonsentrasjon: Morselskaper')}
                                shareLabel={t('Companies', 'Selskaper')}
                                valueLabel={t('Stores', 'Butikker')}
                                isNorwegian={isNorwegian}
                                height={350}
                            />
                        )}
                    </div>
                )}

                {!isLoading && activeTab === 'feedback' && (
                    <div
                        role="tabpanel"
                        id="panel-feedback"
                        aria-labelledby="tab-feedback"
                        className="bg-gray-800/40 rounded-xl border border-gray-700/50 p-6"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">
                            {t('Feedback Loops: Why Concentration Persists', 'Tilbakekoblingsløkker: Hvorfor konsentrasjon vedvarer')}
                        </h3>

                        <CausalLoopDiagram isNorwegian={isNorwegian} />

                        <div className="grid md:grid-cols-2 gap-6 mb-6 mt-6">
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                <h4 className="text-red-400 font-semibold mb-2">
                                    {t('R1: Scale Reinforcing Loop', 'R1: Skala-forsterkende løkke')}
                                </h4>
                                <div className="text-gray-300 text-sm space-y-1">
                                    <p>{t('Market Share → Buyer Power → Better Terms', 'Markedsandel → Kjøpsmakt → Bedre vilkår')}</p>
                                    <p>{t('→ Lower Prices → More Customers → Market Share ↑', '→ Lavere priser → Flere kunder → Markedsandel ↑')}</p>
                                </div>
                            </div>

                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                <h4 className="text-red-400 font-semibold mb-2">
                                    {t('R2: EMV Dependency Loop', 'R2: EMV-avhengighetsløkke')}
                                </h4>
                                <div className="text-gray-300 text-sm space-y-1">
                                    <p>{t('Retail Controls Shelf → Producers Accept EMV', 'Detaljist kontrollerer hylle → Produsenter aksepterer EMV')}</p>
                                    <p>{t('→ Producers Lose Brand → Retail Expands EMV ↑', '→ Produsenter mister merkevare → Detaljist utvider EMV ↑')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                            <h4 className="text-blue-400 font-semibold mb-2">
                                {t('B1: Broken Balancing Loop', 'B1: Ødelagt balanserende løkke')}
                            </h4>
                            <div className="text-gray-300 text-sm">
                                <p>{t(
                                    'Expected: High Profits → Entry → Competition → Lower Profits',
                                    'Forventet: Høy profitt → Nyetablering → Konkurranse → Lavere profitt'
                                )}</p>
                                <p className="text-red-400 mt-2">{t(
                                    'Reality: Infrastructure barriers block entry. The balancing loop is broken.',
                                    'Virkelighet: Infrastrukturbarrierer blokkerer nyetablering. Den balanserende løkken er ødelagt.'
                                )}</p>
                            </div>
                        </div>

                        <div className="text-gray-400 text-sm">
                            {t(
                                'Reference: Gregory Bateson\'s cybernetics — systems with insufficient negative feedback "run away" toward extreme states.',
                                'Referanse: Gregory Batesons kybernetikk — systemer med utilstrekkelig negativ tilbakekobling "løper løpsk" mot ekstreme tilstander.'
                            )}
                        </div>
                    </div>
                )}

                {!isLoading && activeTab === 'emergence' && (
                    <div
                        role="tabpanel"
                        id="panel-emergence"
                        aria-labelledby="tab-emergence"
                        className="bg-gray-800/40 rounded-xl border border-gray-700/50 p-6"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">
                            {t('Emergence: Simple Rules, Complex Patterns', 'Fremvekst: Enkle regler, komplekse mønstre')}
                        </h3>

                        <p className="text-gray-300 mb-6">
                            {t(
                                'The triopoly wasn\'t designed by conspiracy—it emerged from simple competitive rules followed locally:',
                                'Triopolet ble ikke designet av sammensvergelse—det oppsto fra enkle konkurranseregler fulgt lokalt:'
                            )}
                        </p>

                        <EmergenceVisualization isNorwegian={isNorwegian} />

                        <h4 className="text-lg font-semibold text-white mt-8 mb-4">
                            {t('The Competitive Rules', 'Konkurransereglene')}
                        </h4>

                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                                <div className="text-amber-400 font-bold mb-2">{t('Rule 1', 'Regel 1')}</div>
                                <p className="text-gray-300 text-sm">
                                    {t(
                                        '"Match the lowest visible consumer price"',
                                        '"Match den laveste synlige forbrukerprisen"'
                                    )}
                                </p>
                            </div>
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                                <div className="text-amber-400 font-bold mb-2">{t('Rule 2', 'Regel 2')}</div>
                                <p className="text-gray-300 text-sm">
                                    {t(
                                        '"Maximize volume through owned logistics"',
                                        '"Maksimer volum gjennom egen logistikk"'
                                    )}
                                </p>
                            </div>
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                                <div className="text-amber-400 font-bold mb-2">{t('Rule 3', 'Regel 3')}</div>
                                <p className="text-gray-300 text-sm">
                                    {t(
                                        '"Acquire suppliers before competitors"',
                                        '"Kjøp opp leverandører før konkurrentene"'
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-700/40 rounded-lg p-4 mb-6">
                            <h4 className="text-white font-semibold mb-2">
                                {t('Why 3 Players, Not 2 or 4?', 'Hvorfor 3 spillere, ikke 2 eller 4?')}
                            </h4>
                            <ul className="text-gray-300 text-sm space-y-1">
                                <li>• {t('2 players: Unstable — one can kill the other', '2 spillere: Ustabilt — én kan drepe den andre')}</li>
                                <li>• {t('3 players: Stable — tacit coordination; if one defects, two can punish', '3 spillere: Stabilt — stilltiende koordinering; hvis én bryter, kan to straffe')}</li>
                                <li>• {t('4+ players: Unstable — coordination breaks down', '4+ spillere: Ustabilt — koordinering bryter sammen')}</li>
                            </ul>
                        </div>

                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                            <h4 className="text-purple-400 font-semibold mb-2">
                                {t('The Attractor Insight', 'Attraktør-innsikten')}
                            </h4>
                            <p className="text-gray-300 text-sm">
                                {t(
                                    'The triopoly is an attractor state. Breaking up companies creates temporary perturbation—but the same dynamics will reconcentrate the market. To change the outcome, change the rules.',
                                    'Triopolet er en attraktør-tilstand. Å bryte opp selskaper skaper midlertidig forstyrrelse—men de samme dynamikkene vil rekonsentrere markedet. For å endre utfallet, endre reglene.'
                                )}
                            </p>
                        </div>
                    </div>
                )}

                {!isLoading && activeTab === 'metabolism' && (
                    <div
                        role="tabpanel"
                        id="panel-metabolism"
                        aria-labelledby="tab-metabolism"
                        className="bg-gray-800/40 rounded-xl border border-gray-700/50 p-6"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">
                            {t('Ecological Metabolism: Flows and Value Capture', 'Økologisk metabolisme: Strømmer og verdifangst')}
                        </h3>

                        <p className="text-gray-300 mb-6">
                            {t(
                                'Treating the food system as an ecosystem reveals who captures value at each trophic level:',
                                'Å behandle matsystemet som et økosystem avslører hvem som fanger verdi på hvert trofisk nivå:'
                            )}
                        </p>

                        <div className="bg-gray-700/40 rounded-lg p-4 mb-6">
                            <h4 className="text-white font-semibold mb-3">
                                {t('The Price Transmission Paradox', 'Prisoverføringsparadokset')}
                            </h4>
                            <div className="grid md:grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-red-400">+42.7%</div>
                                    <div className="text-sm text-gray-400">{t('Producer Prices (PPI)', 'Produsentpriser (PPI)')}</div>
                                    <div className="text-xs text-gray-500">{t('2020-2025', '2020-2025')}</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-400">+32.5%</div>
                                    <div className="text-sm text-gray-400">{t('Consumer Prices (KPI)', 'Konsumentpriser (KPI)')}</div>
                                    <div className="text-xs text-gray-500">{t('2020-2025', '2020-2025')}</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-yellow-400">-10.2%</div>
                                    <div className="text-sm text-gray-400">{t('Gap', 'Gap')}</div>
                                    <div className="text-xs text-gray-500">{t('Hidden extraction', 'Skjult uttrekk')}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                            <h4 className="text-red-400 font-semibold mb-2">
                                {t('Hidden Profit Extraction', 'Skjult profittuttrekk')}
                            </h4>
                            <p className="text-gray-300 text-sm">
                                {t(
                                    'Counter-intuitive finding: Retailers absorbed some of the cost shock. But "super-profits" are hidden in fixed fees, kickbacks, and transfer pricing—not transparent shelf prices.',
                                    'Kontraintuitiv funn: Detaljistene absorberte noe av kostnadssjokket. Men "superprofitt" er skjult i faste avgifter, tilbakebetalinger og internprising—ikke transparente hyllepriser.'
                                )}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                <h4 className="text-green-400 font-semibold mb-2">
                                    {t('Self-Sufficiency', 'Selvforsyning')}
                                </h4>
                                <div className="text-3xl font-bold text-green-400">44%</div>
                                <p className="text-gray-400 text-sm">
                                    {t('Total caloric self-sufficiency', 'Total kalorisk selvforsyning')}
                                </p>
                            </div>
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                <h4 className="text-red-400 font-semibold mb-2">
                                    {t('Critical Vulnerability', 'Kritisk sårbarhet')}
                                </h4>
                                <div className="text-3xl font-bold text-red-400">4%</div>
                                <p className="text-gray-400 text-sm">
                                    {t('Fruit self-sufficiency (import dependent)', 'Frukt-selvforsyning (importavhengig)')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Citation */}
            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-700/50">
                <p>
                    {t(
                        'Framework: Bateson (Ecology of Mind), McKenna (Emergence), Damer (Emergence Ladder)',
                        'Rammeverk: Bateson (Ecology of Mind), McKenna (Fremvekst), Damer (Fremvekststigen)'
                    )}
                </p>
            </div>
        </div>
    );
}
