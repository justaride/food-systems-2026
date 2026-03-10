"use client";

import { ResponsivePie } from '@nivo/pie';
import { CHAIN_CONFIGS } from '@/lib/food-systems/types';
import type { Store, ChainId } from '@/lib/food-systems/types';

interface ParentCompanyChartProps {
    stores: Store[];
    isNorwegian: boolean;
}

const PARENT_COLORS: Record<string, string> = {
    'NorgesGruppen': '#1B4332',
    'Coop Norge': '#00529B',
    'Reitangruppen': '#E30613',
    'Bunnpris AS': '#E91E63',
    'Other': '#9CA3AF',
};

export default function ParentCompanyChart({ stores, isNorwegian }: ParentCompanyChartProps) {
    if (stores.length === 0) return null;

    // Aggregate by parent company
    const parentCounts = stores.reduce((acc, store) => {
        const config = CHAIN_CONFIGS[store.chainId as ChainId];
        const parent = config?.parent ?? 'Other';
        acc[parent] = (acc[parent] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Build chart data sorted by count
    const data = Object.entries(parentCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([parent, count]) => ({
            id: parent,
            label: parent,
            value: count,
            color: PARENT_COLORS[parent] ?? '#9CA3AF',
        }));

    return (
        <div className="w-full">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
                {isNorwegian ? 'Eierskap' : 'Ownership'}
            </h3>
            <div style={{ height: 160 }} className="relative">
                <ResponsivePie
                    data={data}
                    margin={{ top: 10, right: 10, bottom: 40, left: 10 }}
                    innerRadius={0.6}
                    padAngle={1}
                    cornerRadius={2}
                    activeOuterRadiusOffset={4}
                    colors={{ datum: 'data.color' }}
                    borderWidth={1}
                    borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                    enableArcLinkLabels={false}
                    arcLabelsSkipAngle={25}
                    arcLabelsTextColor="#ffffff"
                    arcLabel={(d) => `${Math.round((d.value / stores.length) * 100)}%`}
                    tooltip={({ datum }) => (
                        <div className="bg-white px-3 py-2 rounded shadow-lg border text-sm">
                            <span style={{ color: datum.color }}>●</span>{' '}
                            <strong>{datum.label}</strong>: {datum.value}{' '}
                            {isNorwegian ? 'butikker' : 'stores'}{' '}
                            ({Math.round((datum.value / stores.length) * 100)}%)
                        </div>
                    )}
                    legends={[
                        {
                            anchor: 'bottom',
                            direction: 'row',
                            translateY: 35,
                            itemWidth: 85,
                            itemHeight: 14,
                            itemTextColor: '#6B7280',
                            symbolSize: 8,
                            symbolShape: 'circle',
                        },
                    ]}
                />
            </div>
        </div>
    );
}
