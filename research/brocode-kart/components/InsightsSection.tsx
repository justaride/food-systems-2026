"use client";

import { useFoodSystems } from '@/contexts/FoodSystemsContext';
import MarginsChart from './charts/MarginsChart';
import SelfSufficiencyChart from './charts/SelfSufficiencyChart';
import FoodFlowSankey from './charts/FoodFlowSankey';
import SelfSufficiencyDashboard from './SelfSufficiencyDashboard';

export default function InsightsSection() {
    const { insights } = useFoodSystems();

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    <span lang="en">Food Systems Intelligence</span>
                    <span lang="no">Matsystem-innsikt</span>
                </h2>
                <p className="text-gray-600">
                    <span lang="en">National data from SSB, Virke, and corporate reports (2024)</span>
                    <span lang="no">Nasjonale data fra SSB, Virke og selskapsrapporter (2024)</span>
                </p>
            </div>

            {!insights ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
            ) : (
                <>
                    {/* Self-Sufficiency Dashboard */}
                    <SelfSufficiencyDashboard />

                    {/* Key Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
                                <span lang="en">Total Turnover</span>
                                <span lang="no">Total omsetning</span>
                            </h4>
                            <div className="text-3xl font-bold text-emerald-600">
                                {(insights.ssb.market_overview.total_grocery_turnover_2024 / 1e9).toFixed(0)} Mrd
                            </div>
                            <div className="text-sm text-gray-500 mt-1">NOK (2024)</div>
                            <div className="text-xs text-green-600 mt-2">
                                +{(insights.ssb.market_overview.growth_rate * 100).toFixed(1)}% YoY
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
                                <span lang="en">Border Trade</span>
                                <span lang="no">Grensehandel</span>
                            </h4>
                            <div className="text-3xl font-bold text-blue-600">
                                {(insights.ssb.economics.border_trade_2023_nok / 1e9).toFixed(0)} Mrd
                            </div>
                            <div className="text-sm text-gray-500 mt-1">NOK (2023 est.)</div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
                                <span lang="en">Private Label Share</span>
                                <span lang="no">EMV-andel</span>
                            </h4>
                            <div className="text-3xl font-bold text-purple-600">
                                {(insights.ssb.market_overview.private_label_share * 100).toFixed(0)}%
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                                <span lang="en">of total turnover</span>
                                <span lang="no">av total omsetning</span>
                            </div>
                        </div>
                    </div>

                    {/* Food Flow Sankey */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <FoodFlowSankey />
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MarginsChart />
                        <SelfSufficiencyChart />
                    </div>

                    {/* Market Insights */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            <span lang="en">Market Structure</span>
                            <span lang="no">Markedsstruktur</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-2">NorgesGruppen</h4>
                                <p className="text-gray-600">
                                    <span lang="en">118 Mrd NOK revenue, 3.3% margin. Owns Kiwi, Meny, Joker, Spar.</span>
                                    <span lang="no">118 Mrd kr omsetning, 3,3% margin. Eier Kiwi, Meny, Joker, Spar.</span>
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-2">Reitangruppen</h4>
                                <p className="text-gray-600">
                                    <span lang="en">54.5 Mrd NOK revenue, 3.85% margin. Owns Rema 1000.</span>
                                    <span lang="no">54,5 Mrd kr omsetning, 3,85% margin. Eier Rema 1000.</span>
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-2">Coop Norge</h4>
                                <p className="text-gray-600">
                                    <span lang="en">61 Mrd NOK revenue, 1.0% margin. Owns Extra, Obs, Coop Prix.</span>
                                    <span lang="no">61 Mrd kr omsetning, 1,0% margin. Eier Extra, Obs, Coop Prix.</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
