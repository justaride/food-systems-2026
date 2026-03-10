"use client";

import { useFoodSystems } from '@/contexts/FoodSystemsContext';
import MarketShareChart from './charts/MarketShareChart';
import MarginsChart from './charts/MarginsChart';
import SelfSufficiencyChart from './charts/SelfSufficiencyChart';
import FoodFlowSankey from './charts/FoodFlowSankey';

export default function InsightsDashboard() {
    const { isInsightsOpen, setIsInsightsOpen, insights } = useFoodSystems();

    if (!isInsightsOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-gray-50 w-full max-w-7xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Food Systems Intelligence (2024)</h2>
                        <p className="text-sm text-gray-500">Live data from SSB, Virke, and Konkurransetilsynet</p>
                    </div>
                    <button 
                        onClick={() => setIsInsightsOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {!insights ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Row 1: The Flow */}
                            <div className="col-span-1 md:col-span-2 lg:col-span-3">
                                <FoodFlowSankey />
                            </div>

                            {/* Row 2: Market Dynamics */}
                            <div className="col-span-1">
                                <MarketShareChart />
                            </div>
                            <div className="col-span-1">
                                <MarginsChart />
                            </div>
                            <div className="col-span-1">
                                <SelfSufficiencyChart />
                            </div>

                            {/* Row 3: Key Stats Cards */}
                            <div className="col-span-1 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Total Turnover</h4>
                                <div className="text-2xl font-bold text-emerald-600">
                                    {(insights.ssb.market_overview.total_grocery_turnover_2024 / 1e9).toFixed(1)} Mrd NOK
                                </div>
                                <div className="text-xs text-green-600 mt-1">
                                    +{(insights.ssb.market_overview.growth_rate * 100).toFixed(1)}% growth (YoY)
                                </div>
                            </div>

                            <div className="col-span-1 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Border Trade</h4>
                                <div className="text-2xl font-bold text-blue-600">
                                    {(insights.ssb.economics.border_trade_2023_nok / 1e9).toFixed(1)} Mrd NOK
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Est. 2023 (SSB)
                                </div>
                            </div>

                            <div className="col-span-1 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Private Label Share</h4>
                                <div className="text-2xl font-bold text-purple-600">
                                    {(insights.ssb.market_overview.private_label_share * 100).toFixed(1)}%
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Of total turnover (EMV)
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
