"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useFoodSystems } from "@/contexts/FoodSystemsContext";

export default function MarginsChart() {
  const { insights } = useFoodSystems();

  if (!insights)
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Loading financial data...
      </div>
    );

  const corp = insights.financials.corporate_results;

  // Normalize data: use operating margin where possible, fallback to profit margin
  const data = [
    {
      name: "NorgesGruppen",
      margin: corp.NorgesGruppen.profit_margin_percent,
      type: "Retail Group",
    },
    {
      name: "Reitan (Rema)",
      margin: corp.Reitan_Retail_Norway.operating_margin_percent,
      type: "Retail Group",
    },
    {
      name: "Coop Norge",
      margin: corp.Coop_Norge.result_margin_percent,
      type: "Retail Group",
    },
    {
      name: "Suppliers (Avg)",
      margin: 6.0, // Placeholder/Estimate from Konkurransetilsynet finding "Supplier margins generally higher"
      type: "Supplier",
    },
    {
      name: "Industry Avg",
      margin: insights.ssb.economics.operating_margin_grocery * 100,
      type: "Benchmark",
    },
  ];

  return (
    <div className="w-full h-[300px] bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-sm font-bold mb-2 text-gray-700">
        The Money: Profit Margins (2024)
      </h3>
      <p className="text-xs text-gray-500 mb-2">
        Operating/Profit margins comparing Retail vs. Suppliers
      </p>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" fontSize={10} interval={0} />
          <YAxis unit="%" fontSize={12} />
          <Tooltip
            formatter={(value) => `${(Number(value) || 0).toFixed(1)}%`}
          />
          <Legend />
          <Bar
            dataKey="margin"
            fill="#4CAF50"
            name="Margin %"
            radius={[4, 4, 0, 0]}
          />
          <ReferenceLine
            y={insights.ssb.economics.operating_margin_grocery * 100}
            label="Avg"
            stroke="red"
            strokeDasharray="3 3"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
