'use client';

import { useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

interface LorenzDataPoint {
    cumulativeShare: number;
    cumulativeValue: number;
    name?: string;
    actualValue?: number;
}

interface LorenzCurveChartProps {
    data: Array<{ name: string; value: number }>;
    title?: string;
    shareLabel?: string;
    valueLabel?: string;
    height?: number;
    isNorwegian?: boolean;
}

function calculateGini(sortedValues: number[]): number {
    const n = sortedValues.length;
    if (n === 0) return 0;

    const total = sortedValues.reduce((a, b) => a + b, 0);
    if (total === 0) return 0;

    let sumOfDifferences = 0;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            sumOfDifferences += Math.abs(sortedValues[i] - sortedValues[j]);
        }
    }

    return sumOfDifferences / (2 * n * total);
}

export default function LorenzCurveChart({
    data,
    title,
    shareLabel = 'Share',
    valueLabel = 'Value',
    height = 400,
    isNorwegian = false,
}: LorenzCurveChartProps) {
    const t = <T,>(en: T, no: T): T => (isNorwegian ? no : en);

    const { lorenzData, gini } = useMemo(() => {
        const sorted = [...data].sort((a, b) => a.value - b.value);
        const total = sorted.reduce((sum, item) => sum + item.value, 0);
        const n = sorted.length;

        const lorenz: LorenzDataPoint[] = [
            { cumulativeShare: 0, cumulativeValue: 0 },
        ];

        let cumulativeValue = 0;
        sorted.forEach((item, index) => {
            cumulativeValue += item.value;
            lorenz.push({
                cumulativeShare: ((index + 1) / n) * 100,
                cumulativeValue: (cumulativeValue / total) * 100,
                name: item.name,
                actualValue: item.value,
            });
        });

        const giniCoeff = calculateGini(sorted.map(s => s.value));

        return { lorenzData: lorenz, gini: giniCoeff };
    }, [data]);

    const equalityLine = useMemo(() => {
        return [
            { cumulativeShare: 0, equality: 0 },
            { cumulativeShare: 100, equality: 100 },
        ];
    }, []);

    const giniColor = gini < 0.3 ? 'text-green-400' : gini < 0.5 ? 'text-yellow-400' : 'text-red-400';
    const giniDescription = gini < 0.3
        ? t('Relatively equal', 'Relativt lik')
        : gini < 0.5
        ? t('Moderate inequality', 'Moderat ulikhet')
        : t('High inequality', 'Høy ulikhet');

    return (
        <div className="bg-gray-900/40 rounded-xl border border-gray-700/50 p-6">
            {title && (
                <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
            )}

            <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                <div className="bg-gray-800/60 rounded-lg p-3">
                    <div className="text-gray-400">{t('Gini Coefficient', 'Gini-koeffisient')}</div>
                    <div className={`text-xl font-bold ${giniColor}`}>
                        {gini.toFixed(3)}
                    </div>
                    <div className="text-xs text-gray-500">
                        {t('0 = equal, 1 = unequal', '0 = lik, 1 = ulik')}
                    </div>
                </div>
                <div className="bg-gray-800/60 rounded-lg p-3">
                    <div className="text-gray-400">{t('Interpretation', 'Tolkning')}</div>
                    <div className={`text-lg font-bold ${giniColor}`}>
                        {giniDescription}
                    </div>
                </div>
                <div className="bg-gray-800/60 rounded-lg p-3">
                    <div className="text-gray-400">{t('Entities', 'Enheter')}</div>
                    <div className="text-xl font-bold text-blue-400">
                        {data.length}
                    </div>
                    <div className="text-xs text-gray-500">
                        {t('In distribution', 'I fordeling')}
                    </div>
                </div>
            </div>

            <div style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart margin={{ top: 20, right: 30, bottom: 40, left: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                            type="number"
                            dataKey="cumulativeShare"
                            domain={[0, 100]}
                            stroke="#9CA3AF"
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            tickFormatter={(v) => `${v}%`}
                            label={{
                                value: t(`Cumulative % of ${shareLabel}`, `Kumulativ % av ${shareLabel}`),
                                position: 'bottom',
                                fill: '#9CA3AF',
                                offset: 20,
                            }}
                        />
                        <YAxis
                            type="number"
                            dataKey="cumulativeValue"
                            domain={[0, 100]}
                            stroke="#9CA3AF"
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            tickFormatter={(v) => `${v}%`}
                            label={{
                                value: t(`Cumulative % of ${valueLabel}`, `Kumulativ % av ${valueLabel}`),
                                angle: -90,
                                position: 'insideLeft',
                                fill: '#9CA3AF',
                                offset: -10,
                            }}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (!active || !payload?.[0]) return null;
                                const data = payload[0].payload as LorenzDataPoint;
                                if (!data.name) return null;
                                return (
                                    <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl">
                                        <div className="font-semibold text-white">{data.name}</div>
                                        <div className="text-sm text-gray-300">
                                            {t('Cumulative share', 'Kumulativ andel')}: {data.cumulativeShare.toFixed(1)}%
                                        </div>
                                        <div className="text-sm text-gray-300">
                                            {t('Cumulative value', 'Kumulativ verdi')}: {data.cumulativeValue.toFixed(1)}%
                                        </div>
                                        {data.actualValue !== undefined && (
                                            <div className="text-sm text-gray-300">
                                                {valueLabel}: {data.actualValue.toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                );
                            }}
                        />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            formatter={(value) => (
                                <span className="text-gray-300 text-sm">{value}</span>
                            )}
                        />

                        {/* Perfect equality line */}
                        <Area
                            type="linear"
                            data={equalityLine}
                            dataKey="equality"
                            name={t('Perfect equality', 'Perfekt likhet')}
                            stroke="#6366F1"
                            strokeDasharray="5 5"
                            fill="none"
                        />

                        {/* Lorenz curve */}
                        <Area
                            type="monotone"
                            data={lorenzData}
                            dataKey="cumulativeValue"
                            name={t('Lorenz curve', 'Lorenz-kurve')}
                            stroke="#A855F7"
                            strokeWidth={2}
                            fill="#A855F7"
                            fillOpacity={0.3}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 text-sm text-gray-400">
                <p>
                    {t(
                        <>
                            <strong>Interpretation:</strong> The shaded area between the Lorenz curve and the equality line
                            represents inequality. The larger the area, the higher the Gini coefficient.
                            A Gini of {gini.toFixed(2)} indicates {giniDescription.toLowerCase()}.
                        </>,
                        <>
                            <strong>Tolkning:</strong> Det skraverte området mellom Lorenz-kurven og likhetslinja
                            representerer ulikhet. Jo større område, jo høyere Gini-koeffisient.
                            En Gini på {gini.toFixed(2)} indikerer {giniDescription.toLowerCase()}.
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}
