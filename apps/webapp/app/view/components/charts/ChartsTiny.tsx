"use client";

import type { ChartsProps, ChartConfig } from "./types";
import { FiBarChart2 } from "react-icons/fi";

// Loosely typed icon components to avoid react-icons vs local React type incompatibilities
const BarChartIcon = FiBarChart2 as React.ComponentType<{ className?: string }>;

type ChartsTinyProps = ChartsProps & {
  chartConfig: ChartConfig | null;
};

export function ChartsTiny({ appearance, chartConfig }: ChartsTinyProps) {
  const primaryColor = appearance.textColor || "#ffffff";

  if (!chartConfig || !chartConfig.data || chartConfig.data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-xs opacity-50" style={{ color: primaryColor }}>
          <BarChartIcon className="h-4 w-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center p-2">
      <div className="text-center opacity-70" style={{ color: primaryColor }}>
        <div className="text-[0.5rem] mb-1">{chartConfig.type}</div>
        <div className="text-[0.4375rem]">{chartConfig.data.length} points</div>
      </div>
    </div>
  );
}


