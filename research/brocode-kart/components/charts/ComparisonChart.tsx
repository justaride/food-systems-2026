"use client";

import { ResponsiveBar } from '@nivo/bar';
import type { MunicipalityMetrics } from '@/lib/food-systems/types';
import type { NationalMetrics } from '@/lib/food-systems/metrics';

interface ComparisonChartProps {
    metrics: MunicipalityMetrics;
    nationalMetrics: NationalMetrics;
    municipalityArea: number;
    isNorwegian: boolean;
}

export default function ComparisonChart({
    metrics,
    nationalMetrics,
    municipalityArea,
    isNorwegian,
}: ComparisonChartProps) {
    // Calculate stores per km² for this municipality
    const storesPerKm2 = municipalityArea > 0
        ? Math.round((metrics.storeCount / municipalityArea) * 100) / 100
        : 0;

    const data = [
        {
            metric: isNorwegian ? 'Butikker/1000' : 'Stores/1000',
            [isNorwegian ? 'Kommune' : 'Municipality']: metrics.storesPerCapita,
            [isNorwegian ? 'Nasjonalt' : 'National']: nationalMetrics.storesPerCapita,
        },
        {
            metric: 'HHI',
            [isNorwegian ? 'Kommune' : 'Municipality']: metrics.hhi / 100, // Scale down for display
            [isNorwegian ? 'Nasjonalt' : 'National']: nationalMetrics.avgHHI / 100,
        },
        {
            metric: isNorwegian ? 'Butikker/km²' : 'Stores/km²',
            [isNorwegian ? 'Kommune' : 'Municipality']: storesPerKm2,
            [isNorwegian ? 'Nasjonalt' : 'National']: nationalMetrics.storesPerKm2,
        },
    ];

    const keys = isNorwegian ? ['Kommune', 'Nasjonalt'] : ['Municipality', 'National'];

    return (
        <div className="w-full">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
                {isNorwegian ? 'Sammenligning' : 'Comparison'}
            </h3>
            <div style={{ height: 140 }}>
                <ResponsiveBar
                    data={data}
                    keys={keys}
                    indexBy="metric"
                    layout="horizontal"
                    margin={{ top: 10, right: 80, bottom: 10, left: 90 }}
                    padding={0.3}
                    groupMode="grouped"
                    colors={['#10B981', '#9CA3AF']}
                    borderRadius={2}
                    enableGridX={true}
                    enableGridY={false}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={null}
                    axisLeft={{
                        tickSize: 0,
                        tickPadding: 8,
                    }}
                    enableLabel={true}
                    label={(d) => {
                        // Show original HHI value for HHI metric
                        if (d.indexValue === 'HHI') {
                            return String(Math.round(Number(d.value) * 100));
                        }
                        return String(d.value);
                    }}
                    labelSkipWidth={20}
                    labelTextColor="#ffffff"
                    legends={[
                        {
                            dataFrom: 'keys',
                            anchor: 'right',
                            direction: 'column',
                            translateX: 75,
                            itemWidth: 70,
                            itemHeight: 18,
                            itemTextColor: '#6B7280',
                            symbolSize: 10,
                            symbolShape: 'circle',
                        },
                    ]}
                    tooltip={({ id, value, indexValue, color }) => (
                        <div className="bg-white px-3 py-2 rounded shadow-lg border text-sm">
                            <span style={{ color }}>●</span>{' '}
                            <strong>{String(id)}</strong> - {String(indexValue)}:{' '}
                            {indexValue === 'HHI' ? Math.round(Number(value) * 100) : value}
                        </div>
                    )}
                />
            </div>
        </div>
    );
}
