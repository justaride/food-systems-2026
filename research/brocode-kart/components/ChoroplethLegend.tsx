"use client";

import { usePathname } from 'next/navigation';

interface ChoroplethLegendProps {
    mode: 'density' | 'concentration' | null;
}

const DENSITY_STOPS = [
    { value: 0, color: '#EF4444', label: '0' },
    { value: 0.3, color: '#F97316', label: '0.3' },
    { value: 0.5, color: '#FBBF24', label: '0.5' },
    { value: 0.7, color: '#84CC16', label: '0.7' },
    { value: 1.0, color: '#22C55E', label: '1.0+' },
];

const CONCENTRATION_STOPS = [
    { value: 0, color: '#3B82F6', label: '0' },
    { value: 1500, color: '#8B5CF6', label: '1500' },
    { value: 2500, color: '#EC4899', label: '2500' },
    { value: 4000, color: '#DC2626', label: '4000+' },
];

export default function ChoroplethLegend({ mode }: ChoroplethLegendProps) {
    const pathname = usePathname() ?? "/en";
    const isNorwegian = pathname.split("/")[1] === "no";

    if (!mode) return null;

    const isDensity = mode === 'density';
    const stops = isDensity ? DENSITY_STOPS : CONCENTRATION_STOPS;

    const title = isDensity
        ? (isNorwegian ? 'Butikktetthet' : 'Store Density')
        : (isNorwegian ? 'Markedskonsentrasjon' : 'Market Concentration');

    const subtitle = isDensity
        ? (isNorwegian ? 'per 1 000 innbyggere' : 'per 1,000 residents')
        : 'HHI Index';

    const lowLabel = isDensity
        ? (isNorwegian ? 'Lav' : 'Low')
        : (isNorwegian ? 'Konkurransedyktig' : 'Competitive');

    const highLabel = isDensity
        ? (isNorwegian ? 'Høy' : 'High')
        : (isNorwegian ? 'Konsentrert' : 'Concentrated');

    // Build gradient string
    const gradientColors = stops.map((s, i) => {
        const percent = (i / (stops.length - 1)) * 100;
        return `${s.color} ${percent}%`;
    }).join(', ');

    return (
        <div className="absolute bottom-8 left-4 z-[1000] bg-white rounded-lg shadow-md border border-gray-200 p-3 min-w-[160px]">
            <h4 className="text-xs font-semibold text-gray-700 mb-1">{title}</h4>
            <p className="text-[10px] text-gray-500 mb-2">{subtitle}</p>

            <div
                className="h-3 rounded-sm mb-1"
                style={{
                    background: `linear-gradient(to right, ${gradientColors})`,
                }}
            />

            <div className="flex justify-between text-[10px] text-gray-500 mb-2">
                {stops.map((stop, i) => (
                    <span key={i}>{stop.label}</span>
                ))}
            </div>

            <div className="flex justify-between text-[10px] text-gray-600 font-medium">
                <span>{lowLabel}</span>
                <span>{highLabel}</span>
            </div>
        </div>
    );
}
