"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useFoodSystems } from "@/contexts/FoodSystemsContext";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function MarketShareChart() {
  const { insights } = useFoodSystems();

  if (!insights)
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Loading market data...
      </div>
    );

  const shares = insights.ssb.market_overview.market_shares;

  const data = [
    { name: "Low Price (Discount)", value: shares.discount * 100 },
    { name: "Supermarket", value: shares.supermarket * 100 },
    { name: "Convenience", value: shares.convenience * 100 },
  ];

  return (
    <div className="w-full h-[300px] bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-sm font-bold mb-2 text-gray-700">
        Market Power (2024)
      </h3>
      <p className="text-xs text-gray-500 mb-2">
        Share of turnover by concept type
      </p>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `${(Number(value) || 0).toFixed(1)}%`}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
