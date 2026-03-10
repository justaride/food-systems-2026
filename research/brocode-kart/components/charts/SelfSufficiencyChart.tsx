"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useFoodSystems } from "@/contexts/FoodSystemsContext";

export default function SelfSufficiencyChart() {
  const { insights } = useFoodSystems();

  if (!insights)
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Loading production data...
      </div>
    );

  const self = insights.ssb.production.self_sufficiency_2023;

  const data = [
    { name: "Milk", value: self.milk * 100 },
    { name: "Meat", value: self.meat * 100 },
    { name: "Potatoes", value: self.potatoes * 100 },
    { name: "Vegetables", value: self.vegetables * 100 },
    { name: "Calories (Total)", value: self.calories * 100 },
    { name: "Fruit", value: self.fruit * 100 },
  ];

  return (
    <div className="w-full h-[300px] bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-sm font-bold mb-2 text-gray-700">
        Self-Sufficiency (2023)
      </h3>
      <p className="text-xs text-gray-500 mb-2">
        Percentage of consumption covered by domestic production
      </p>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={true}
            vertical={true}
          />
          <XAxis type="number" unit="%" domain={[0, 100]} />
          <YAxis dataKey="name" type="category" fontSize={10} width={70} />
          <Tooltip
            formatter={(value) => `${(Number(value) || 0).toFixed(0)}%`}
          />
          <Bar dataKey="value" name="Self-Sufficiency" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.value < 50 ? "#FF5722" : "#4CAF50"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
