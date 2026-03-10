"use client";

import { Sankey, Tooltip, ResponsiveContainer, Layer, Rectangle } from 'recharts';

// Data derived from docs/data/food-systems/raw_data/trade_volumes_2024.json
const data = {
    nodes: [
        { name: 'Imports: Fruit & Veg', fill: '#FF9800' }, // 0
        { name: 'Imports: Meat/Dairy', fill: '#FFB74D' }, // 1
        { name: 'Domestic: Milk', fill: '#4CAF50' },      // 2
        { name: 'Domestic: Grain', fill: '#8BC34A' },     // 3
        { name: 'Domestic: Meat', fill: '#CDDC39' },      // 4
        { name: 'Domestic: Fruit & Veg', fill: '#AED581' }, // 5
        { name: 'Seafood: Fisheries', fill: '#2196F3' },  // 6
        { name: 'Seafood: Aquaculture', fill: '#03A9F4' }, // 7
        { name: 'Domestic Consumption', fill: '#E91E63' }, // 8
        { name: 'Global Exports', fill: '#00BCD4' },      // 9
    ],
    links: [
        // To Consumption
        { source: 0, target: 8, value: 479229 },  // Import Fruit/Veg
        { source: 1, target: 8, value: 38241 },   // Import Meat/Cheese
        { source: 2, target: 8, value: 1524400 }, // Domestic Milk
        { source: 3, target: 8, value: 1183800 }, // Domestic Grain
        { source: 4, target: 8, value: 357086 },  // Domestic Meat
        { source: 5, target: 8, value: 232340 },  // Domestic Fruit/Veg
        
        // Seafood Split (Approx 5% domestic, 95% export)
        { source: 6, target: 8, value: 75000 },   // Fisheries -> Domestic
        { source: 6, target: 9, value: 1425000 }, // Fisheries -> Export
        { source: 7, target: 8, value: 65000 },   // Aqua -> Domestic
        { source: 7, target: 9, value: 1235000 }, // Aqua -> Export
    ],
};

const CustomSankeyNode = ({ x, y, width, height, index, payload, containerWidth }: any) => {
    const isOut = x + width + 6 > containerWidth;
    return (
        <Layer key={`CustomNode${index}`}>
            <Rectangle 
                x={x} y={y} 
                width={width} height={height} 
                fill={payload.fill || "#8884d8"} 
                fillOpacity="1" 
            />
            <text
                textAnchor={isOut ? 'end' : 'start'}
                x={isOut ? x - 6 : x + width + 6}
                y={y + height / 2}
                fontSize="12"
                fill="#333" // Darker text for visibility on light backgrounds
                stroke="none"
                dominantBaseline="middle"
                fontWeight="bold"
            >
                {payload.name}
            </text>
        </Layer>
    );
};

export default function FoodFlowSankey() {
    return (
        <div className="w-full h-[600px] bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold mb-4 text-gray-800">The Flow of Food (Tonnes, 2024)</h3>
            <p className="text-sm text-gray-500 mb-2">
                Visualizing the massive scale of seafood exports vs. domestic consumption patterns.
            </p>
            <ResponsiveContainer width="100%" height="90%">
                <Sankey
                    data={data}
                    node={<CustomSankeyNode />}
                    nodePadding={50}
                    margin={{
                        left: 20,
                        right: 120, // Extra space for labels
                        top: 20,
                        bottom: 20,
                    }}
                    link={{ stroke: '#B0BEC5', strokeOpacity: 0.3 }}
                >
                    <Tooltip 
                        formatter={(value: any) => `${Number(value).toLocaleString()} tonnes`}
                    />
                </Sankey>
            </ResponsiveContainer>
        </div>
    );
}
