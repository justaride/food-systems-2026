'use client';

import { useMemo } from 'react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { linearRegression } from '@/lib/food-systems/pattern-analysis';

interface ZipfDataPoint {
    rank: number;
    value: number;
    logRank: number;
    logValue: number;
    name: string;
}

interface ZipfDistributionChartProps {
    data: Array<{ name: string; value: number }>;
    title?: string;
    valueLabel?: string;
    showRegressionLine?: boolean;
    referenceSlope?: number;
    height?: number;
    isNorwegian?: boolean;
}

export default function ZipfDistributionChart({
    data,
    title,
    valueLabel = 'Value',
    showRegressionLine = true,
    referenceSlope = -1,
    height = 400,
    isNorwegian = false,
}: ZipfDistributionChartProps) {
    const t = <T,>(en: T, no: T): T => (isNorwegian ? no : en);

    const chartData = useMemo<ZipfDataPoint[]>(() => {
        const sorted = [...data].sort((a, b) => b.value - a.value);
        return sorted.map((item, index) => ({
            rank: index + 1,
            value: item.value,
            logRank: Math.log10(index + 1),
            logValue: Math.log10(item.value),
            name: item.name,
        }));
    }, [data]);

    const regression = useMemo(() => {
        const x = chartData.map(d => d.logRank);
        const y = chartData.map(d => d.logValue);
        return linearRegression(x, y);
    }, [chartData]);

    const regressionLineData = useMemo(() => {
        if (!showRegressionLine || chartData.length < 2) return [];
        const minX = 0;
        const maxX = Math.max(...chartData.map(d => d.logRank));
        return [
            { logRank: minX, logValue: regression.intercept },
            { logRank: maxX, logValue: regression.slope * maxX + regression.intercept },
        ];
    }, [chartData, regression, showRegressionLine]);

    const referenceLineData = useMemo(() => {
        if (chartData.length < 2) return [];
        const minX = 0;
        const maxX = Math.max(...chartData.map(d => d.logRank));
        const refIntercept = chartData[0]?.logValue || 0;
        return [
            { logRank: minX, logValue: refIntercept },
            { logRank: maxX, logValue: referenceSlope * maxX + refIntercept },
        ];
    }, [chartData, referenceSlope]);

    const isZipf = regression.rSquared > 0.7 && regression.slope < -0.5 && regression.slope > -1.5;

    return (
        <div className="bg-gray-900/40 rounded-xl border border-gray-700/50 p-6">
            {title && (
                <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
            )}

            <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                <div className="bg-gray-800/60 rounded-lg p-3">
                    <div className="text-gray-400">{t('Slope', 'Helning')}</div>
                    <div className="text-xl font-bold text-purple-400">
                        {regression.slope.toFixed(3)}
                    </div>
                    <div className="text-xs text-gray-500">
                        {t('Zipf = -1', 'Zipf = -1')}
                    </div>
                </div>
                <div className="bg-gray-800/60 rounded-lg p-3">
                    <div className="text-gray-400">R²</div>
                    <div className="text-xl font-bold text-blue-400">
                        {regression.rSquared.toFixed(3)}
                    </div>
                    <div className="text-xs text-gray-500">
                        {t('Fit quality', 'Tilpasningskvalitet')}
                    </div>
                </div>
                <div className="bg-gray-800/60 rounded-lg p-3">
                    <div className="text-gray-400">{t('Result', 'Resultat')}</div>
                    <div className={`text-xl font-bold ${isZipf ? 'text-green-400' : 'text-yellow-400'}`}>
                        {isZipf ? t('Zipf', 'Zipf') : t('Steeper', 'Brattere')}
                    </div>
                    <div className="text-xs text-gray-500">
                        {regression.slope < -1
                            ? t('More concentrated', 'Mer konsentrert')
                            : t('More equal', 'Mer lik')}
                    </div>
                </div>
            </div>

            <div style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                            type="number"
                            dataKey="logRank"
                            name={t('Log(Rank)', 'Log(Rangering)')}
                            domain={['dataMin', 'dataMax']}
                            stroke="#9CA3AF"
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            label={{
                                value: t('log₁₀(Rank)', 'log₁₀(Rangering)'),
                                position: 'bottom',
                                fill: '#9CA3AF',
                                offset: 20,
                            }}
                        />
                        <YAxis
                            type="number"
                            dataKey="logValue"
                            name={t(`Log(${valueLabel})`, `Log(${valueLabel})`)}
                            domain={['dataMin', 'dataMax']}
                            stroke="#9CA3AF"
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            label={{
                                value: t(`log₁₀(${valueLabel})`, `log₁₀(${valueLabel})`),
                                angle: -90,
                                position: 'insideLeft',
                                fill: '#9CA3AF',
                                offset: -10,
                            }}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (!active || !payload?.[0]) return null;
                                const data = payload[0].payload as ZipfDataPoint;
                                return (
                                    <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl">
                                        <div className="font-semibold text-white">{data.name}</div>
                                        <div className="text-sm text-gray-300">
                                            {t('Rank', 'Rangering')}: #{data.rank}
                                        </div>
                                        <div className="text-sm text-gray-300">
                                            {valueLabel}: {data.value.toLocaleString()}
                                        </div>
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

                        {/* Reference line for pure Zipf */}
                        {referenceLineData.length > 0 && (
                            <Scatter
                                name={t(`Pure Zipf (slope=${referenceSlope})`, `Ren Zipf (helning=${referenceSlope})`)}
                                data={referenceLineData}
                                fill="transparent"
                                stroke="#6366F1"
                                strokeDasharray="5 5"
                                line
                                lineType="joint"
                            />
                        )}

                        {/* Regression line */}
                        {showRegressionLine && regressionLineData.length > 0 && (
                            <Scatter
                                name={t(`Fit (slope=${regression.slope.toFixed(2)})`, `Tilpasning (helning=${regression.slope.toFixed(2)})`)}
                                data={regressionLineData}
                                fill="transparent"
                                stroke="#A855F7"
                                strokeWidth={2}
                                line
                                lineType="joint"
                            />
                        )}

                        {/* Actual data points */}
                        <Scatter
                            name={t('Data points', 'Datapunkter')}
                            data={chartData}
                            fill="#22D3EE"
                            fillOpacity={0.7}
                        />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 text-sm text-gray-400">
                <p>
                    {t(
                        <>
                            <strong>Interpretation:</strong> A slope of -1 indicates pure Zipf distribution (self-organized).
                            A steeper slope (like {regression.slope.toFixed(2)}) suggests concentration is{' '}
                            <strong>{Math.abs(regression.slope) > 1 ? 'higher' : 'lower'}</strong> than natural emergence would predict.
                        </>,
                        <>
                            <strong>Tolkning:</strong> En helning på -1 indikerer ren Zipf-fordeling (selvorganisert).
                            En brattere helning (som {regression.slope.toFixed(2)}) antyder at konsentrasjonen er{' '}
                            <strong>{Math.abs(regression.slope) > 1 ? 'høyere' : 'lavere'}</strong> enn naturlig fremvekst ville forutsi.
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}
