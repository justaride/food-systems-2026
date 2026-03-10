"use client";

import { useFoodSystems } from '@/contexts/FoodSystemsContext';

export default function NarrativeSection() {
    const { insights, municipalityMetrics } = useFoodSystems();

    // Calculate aggregate stats from municipality metrics
    const concentratedMunicipalities = municipalityMetrics
        ? Object.values(municipalityMetrics).filter(m => m.hhi > 2500).length
        : 0;
    const totalMunicipalities = municipalityMetrics ? Object.keys(municipalityMetrics).length : 357;
    const concentratedPct = Math.round((concentratedMunicipalities / totalMunicipalities) * 100);

    return (
        <div className="space-y-12">
            {/* Section Header */}
            <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    <span lang="en">The Norwegian Food System</span>
                    <span lang="no">Det norske matsystemet</span>
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    <span lang="en">
                        Research-backed analysis of market structure, self-sufficiency, and food sovereignty
                    </span>
                    <span lang="no">
                        Forskningsbasert analyse av markedsstruktur, selvforsyning og matsuverenitet
                    </span>
                </p>
            </div>

            {/* Market Concentration */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">
                            <span lang="en">Power Imbalances in the Supply Chain</span>
                            <span lang="no">Maktskjevheter i verdikjeden</span>
                        </h3>
                        <p className="text-sm text-gray-500">
                            <span lang="en">Nordic White Paper 2024, Intervention Area 9</span>
                            <span lang="no">Nordisk hvitbok 2024, Innsatsområde 9</span>
                        </p>
                    </div>
                </div>

                <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700" lang="en">
                        The Nordic countries face significant challenges with power imbalances in food supply systems.
                        <strong> Increased concentration at the retail level has led to escalating bargaining power </strong>
                        for large companies and lower profit margins for farmers and producers.
                    </p>
                    <p className="text-gray-700" lang="no">
                        De nordiske landene står overfor betydelige utfordringer med maktskjevheter i matsystemene.
                        <strong> Økt konsentrasjon på detaljistnivå har ført til økt forhandlingsmakt </strong>
                        for store selskaper og lavere fortjenestemarginer for bønder og produsenter.
                    </p>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-red-600">3</div>
                        <div className="text-sm text-gray-600">
                            <span lang="en">Companies control 99% of market</span>
                            <span lang="no">Selskaper kontrollerer 99% av markedet</span>
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-orange-600">{concentratedPct}%</div>
                        <div className="text-sm text-gray-600">
                            <span lang="en">Municipalities with high concentration (HHI &gt; 2500)</span>
                            <span lang="no">Kommuner med høy konsentrasjon (HHI &gt; 2500)</span>
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-amber-600">~2%</div>
                        <div className="text-sm text-gray-600">
                            <span lang="en">Industry operating margins</span>
                            <span lang="no">Bransjens driftsmarginer</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Self-Sufficiency */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-amber-100 rounded-lg">
                        <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">
                            <span lang="en">Self-Sufficiency and Food Sovereignty</span>
                            <span lang="no">Selvforsyning og matsuverenitet</span>
                        </h3>
                        <p className="text-sm text-gray-500">
                            <span lang="en">Nordic White Paper 2024, Intervention Area 11</span>
                            <span lang="no">Nordisk hvitbok 2024, Innsatsområde 11</span>
                        </p>
                    </div>
                </div>

                <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700" lang="en">
                        <strong>Increasing self-sufficiency underpins food sovereignty</strong> — the ability of citizens
                        to choose and source sustainably produced food equitably. Currently, corporate giants and market
                        institutions control which food can be accessed and at what price, influencing consumer choices.
                    </p>
                    <p className="text-gray-700" lang="no">
                        <strong>Økt selvforsyning underbygger matsuverenitet</strong> — borgernes evne til å velge og
                        skaffe bærekraftig produsert mat på en rettferdig måte. I dag kontrollerer store selskaper og
                        markedsinstitusjoner hvilken mat som er tilgjengelig og til hvilken pris.
                    </p>
                </div>

                {insights && (
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-700">
                                {(insights.ssb.production.self_sufficiency_2023.milk * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-600">
                                <span lang="en">Milk</span>
                                <span lang="no">Melk</span>
                            </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-700">
                                {(insights.ssb.production.self_sufficiency_2023.meat * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-600">
                                <span lang="en">Meat</span>
                                <span lang="no">Kjøtt</span>
                            </div>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-amber-700">
                                {(insights.ssb.production.self_sufficiency_2023.calories * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-600">
                                <span lang="en">Calories (total)</span>
                                <span lang="no">Kalorier (totalt)</span>
                            </div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-red-700">
                                {(insights.ssb.production.self_sufficiency_2023.fruit * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-600">
                                <span lang="en">Fruit</span>
                                <span lang="no">Frukt</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Blue Economy */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">
                            <span lang="en">The Nordic Blue Economy</span>
                            <span lang="no">Den nordiske blå økonomien</span>
                        </h3>
                        <p className="text-sm text-gray-500">
                            <span lang="en">Nordic White Paper 2024, Intervention Area 10</span>
                            <span lang="no">Nordisk hvitbok 2024, Innsatsområde 10</span>
                        </p>
                    </div>
                </div>

                <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700" lang="en">
                        The seafood sector is a critical economic segment for Norway. However, <strong>fishing quotas
                        are increasingly concentrated in fewer hands</strong>, causing debates on equitable social outcomes
                        and regional development. The industry must balance growth with sustainability and local impact.
                    </p>
                    <p className="text-gray-700" lang="no">
                        Sjømatsektoren er et viktig økonomisk segment for Norge. Imidlertid blir <strong>fiskekvoter
                        i økende grad konsentrert hos færre aktører</strong>, noe som skaper debatt om rettferdig
                        fordeling og regional utvikling. Bransjen må balansere vekst med bærekraft og lokale hensyn.
                    </p>
                </div>

                {insights && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="text-3xl font-bold text-blue-700">
                                {(insights.trade.exports.seafood_value_nok_bn).toFixed(0)} Mrd
                            </div>
                            <div className="text-sm text-gray-600">
                                <span lang="en">Seafood exports (NOK, 2023)</span>
                                <span lang="no">Sjømateksport (kr, 2023)</span>
                            </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="text-3xl font-bold text-blue-700">
                                {(insights.trade.exports.seafood_total_tonnes / 1e6).toFixed(1)}M
                            </div>
                            <div className="text-sm text-gray-600">
                                <span lang="en">Tonnes exported annually</span>
                                <span lang="no">Tonn eksportert årlig</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Emergency Preparedness */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                        <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">
                            <span lang="en">Resilience and Emergency Preparedness</span>
                            <span lang="no">Robusthet og beredskap</span>
                        </h3>
                        <p className="text-sm text-gray-500">
                            <span lang="en">Nordic White Paper 2024, Intervention Area 12</span>
                            <span lang="no">Nordisk hvitbok 2024, Innsatsområde 12</span>
                        </p>
                    </div>
                </div>

                <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700" lang="en">
                        Recent crises have exposed vulnerabilities in Nordic food systems. <strong>Just-in-time logistics
                        and import dependency</strong> create fragility. The research calls for improved Nordic cooperation
                        on crisis management and disaster preparedness to ensure food security during disruptions.
                    </p>
                    <p className="text-gray-700" lang="no">
                        Nylige kriser har avdekket sårbarheter i nordiske matsystemer. <strong>Just-in-time-logistikk
                        og importavhengighet</strong> skaper sårbarhet. Forskningen etterlyser bedre nordisk samarbeid
                        om krisehåndtering og beredskap for å sikre mattilgang under forstyrrelser.
                    </p>
                </div>

                {insights && (
                    <div className="mt-6 bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-lg font-bold text-purple-700">
                                    <span lang="en">Border Trade Leakage</span>
                                    <span lang="no">Grensehandel-lekkasje</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <span lang="en">Norwegians spending abroad annually</span>
                                    <span lang="no">Nordmenns årlige forbruk i utlandet</span>
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-purple-700">
                                {(insights.ssb.economics.border_trade_2023_nok / 1e9).toFixed(0)} Mrd
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Source Citation */}
            <div className="text-center text-sm text-gray-500 space-y-1">
                <p lang="en">
                    Research: Gaiani et al. (2024) "White Paper on Nordic Sustainable Food Systems",
                    Ruralia Institute, University of Helsinki
                </p>
                <p lang="no">
                    Forskning: Gaiani et al. (2024) "Hvitbok om nordiske bærekraftige matsystemer",
                    Ruralia-instituttet, Universitetet i Helsinki
                </p>
            </div>
        </div>
    );
}
