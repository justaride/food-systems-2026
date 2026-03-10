"use client";

import { ResponsivePie } from '@nivo/pie';
import { CHAIN_CONFIGS } from '@/lib/food-systems/types';
import type { Store, ChainId, StoreType } from '@/lib/food-systems/types';

interface StoreTypeChartProps {
    stores: Store[];
    isNorwegian: boolean;
}

const TYPE_COLORS: Record<StoreType, string> = {
    discount: '#3B82F6',      // blue
    supermarket: '#10B981',   // emerald
    convenience: '#F59E0B',   // amber
    hypermarket: '#8B5CF6',   // purple
};

const TYPE_LABELS: Record<StoreType, { en: string; no: string }> = {
    discount: { en: 'Discount', no: 'Lavpris' },
    supermarket: { en: 'Supermarket', no: 'Supermarked' },
    convenience: { en: 'Convenience', no: 'Nærbutikk' },
    hypermarket: { en: 'Hypermarket', no: 'Hypermarked' },
};

export default function StoreTypeChart({ stores, isNorwegian }: StoreTypeChartProps) {
    if (stores.length === 0) return null;

    // Count by store type (derived from chain config)
    const typeCounts = stores.reduce((acc, store) => {
        const config = CHAIN_CONFIGS[store.chainId as ChainId];
        const type = config?.type ?? store.storeType ?? 'convenience';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Build chart data
    const data = Object.entries(typeCounts)
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => ({
            id: type,
            label: TYPE_LABELS[type as StoreType]?.[isNorwegian ? 'no' : 'en'] ?? type,
            value: count,
            color: TYPE_COLORS[type as StoreType] ?? '#9CA3AF',
        }));

    return (
        <div className="w-full">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
                {isNorwegian ? 'Butikktype' : 'Store Type'}
            </h3>
            <div style={{ height: 150 }}>
                <ResponsivePie
                    data={data}
                    margin={{ top: 10, right: 10, bottom: 40, left: 10 }}
                    innerRadius={0}
                    padAngle={1}
                    cornerRadius={2}
                    activeOuterRadiusOffset={4}
                    colors={{ datum: 'data.color' }}
                    borderWidth={1}
                    borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                    enableArcLinkLabels={false}
                    arcLabelsSkipAngle={20}
                    arcLabelsTextColor="#ffffff"
                    arcLabel={(d) => `${Math.round((d.value / stores.length) * 100)}%`}
                    tooltip={({ datum }) => (
                        <div className="bg-white px-3 py-2 rounded shadow-lg border text-sm">
                            <span style={{ color: datum.color }}>●</span>{' '}
                            <strong>{datum.label}</strong>: {datum.value}{' '}
                            ({Math.round((datum.value / stores.length) * 100)}%)
                        </div>
                    )}
                    legends={[
                        {
                            anchor: 'bottom',
                            direction: 'row',
                            translateY: 35,
                            itemWidth: 80,
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
