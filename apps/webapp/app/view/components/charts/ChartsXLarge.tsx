"use client";

import { useState } from "react";
import type { ChartsProps, ChartConfig } from "./types";
import { FiBarChart2 } from "react-icons/fi";
import { BarChart, LineChart, DoughnutChart, RadarChart } from "dallastek-ui";

type ChartsXLargeProps = ChartsProps & {
  chartConfig: ChartConfig | null;
};

export function ChartsXLarge({ appearance, chartConfig }: ChartsXLargeProps) {
  const primaryColor = appearance.textColor || "#ffffff";
  const [highlightedSlice, setHighlightedSlice] = useState<string | null>(null);
  const [highlightedEntity, setHighlightedEntity] = useState<string | null>(null);

  if (!chartConfig || !chartConfig.data || chartConfig.data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center opacity-50" style={{ color: primaryColor }}>
          <FiBarChart2 className="mx-auto mb-3 h-16 w-16" />
          <div className="text-lg">No chart data</div>
        </div>
      </div>
    );
  }

  const chartColor = primaryColor;

  const renderChart = () => {
    switch (chartConfig.type) {
      case "BarChart": {
        const barData = chartConfig.data.map((dp) => ({
          label: dp.label,
          revenue: dp.value,
        }));
        const values = chartConfig.data.map((dp) => dp.value);
        const maxValue = Math.max(...values, 0);
        const minValue = Math.min(...values, 0);
        const avgValue = values.reduce((a, b) => a + b, 0) / values.length || 0;

        return (
          <BarChart
            data={barData}
            orientation="vertical"
            showAverageLine={true}
            averageRevenue={avgValue}
            minRevenue={minValue}
            maxRevenue={maxValue}
            barColor={chartConfig.barColor || chartColor}
            barMaxColor={chartConfig.barMaxColor}
            barMinColor={chartConfig.barMinColor}
            averageLineColor={chartConfig.averageLineColor}
            axisColor={chartConfig.axisColor || chartColor}
            gridColor={chartConfig.gridColor || `${chartColor}30`}
            labelColor={chartConfig.labelColor || chartColor}
            labelSecondaryColor={chartConfig.labelSecondaryColor || `${chartColor}80`}
          />
        );
      }

      case "LineChart": {
        const lineData = chartConfig.data.map((dp) => ({
          label: dp.label,
          values: [dp.value],
        }));

        return (
          <LineChart
            data={lineData}
            seriesNames={["Value"]}
            seriesColors={chartConfig.seriesColors || [chartColor]}
            visibleSeries={[true]}
            gridColor={chartConfig.gridColor || `${chartColor}30`}
            labelColor={chartConfig.labelColor || chartColor}
            labelSecondaryColor={chartConfig.labelSecondaryColor || `${chartColor}80`}
            showAverage={chartConfig.showAverage}
            showDots={chartConfig.showDots !== false}
            showArea={chartConfig.showArea}
            lineType={chartConfig.lineType || "curved"}
          />
        );
      }

      case "DoughnutChart": {
        const total = chartConfig.data.reduce((sum, dp) => sum + dp.value, 0);
        const doughnutData = chartConfig.data.map((dp: any, idx) => ({
          id: `slice-${idx}`,
          name: dp.label,
          value: dp.value,
          percentage: total > 0 ? (dp.value / total) * 100 : 0,
          color: dp.color || chartColor,
        }));

        return (
          <DoughnutChart
            data={doughnutData}
            highlightedSlice={highlightedSlice}
            setHighlightedSlice={setHighlightedSlice}
            gapDegrees={chartConfig.gapDegrees}
            segmentOutlineColor={chartConfig.segmentOutlineColor}
            centerTextColor={chartConfig.centerTextColor || chartColor}
            centerValueColor={chartConfig.centerValueColor || chartColor}
            centerPercentageColor={chartConfig.centerPercentageColor || `${chartColor}80`}
            tooltipBackgroundColor={chartConfig.tooltipBackgroundColor}
            tooltipBorderColor={chartConfig.tooltipBorderColor}
            tooltipTextColor={chartConfig.tooltipTextColor || chartColor}
          />
        );
      }

      case "RadarChart": {
        const maxValue = Math.max(...chartConfig.data.map((d) => d.value), 100);
        const metrics = chartConfig.data.map((dp) => ({
          name: dp.label,
          maxValue,
          formatter: (v: number) => String(v),
        }));

        const radarEntity = {
          id: "entity-1",
          name: chartConfig.title || "Data",
          color: chartConfig.seriesColors?.[0] || chartColor,
          values: chartConfig.data.map((dp) => dp.value),
          normalizedValues: chartConfig.data.map((dp) => {
            return maxValue > 0 ? (dp.value / maxValue) * 100 : 0;
          }),
        };

        return (
          <RadarChart
            data={[radarEntity]}
            metrics={metrics}
            highlightedEntity={highlightedEntity}
            setHighlightedEntity={setHighlightedEntity}
            gridColor={chartConfig.gridColor || `${chartColor}30`}
            axisColor={chartConfig.axisColor || chartColor}
            labelColor={chartConfig.labelColor || chartColor}
            labelSecondaryColor={chartConfig.labelSecondaryColor || `${chartColor}80`}
            centerTextColor={chartConfig.centerTextColorRadar || chartColor}
            tooltipBackgroundColor={chartConfig.tooltipBackgroundColorRadar}
            tooltipBorderColor={chartConfig.tooltipBorderColorRadar}
            tooltipTextColor={chartConfig.tooltipTextColorRadar || chartColor}
          />
        );
      }

      default:
        return (
          <div className="text-center opacity-70 text-base" style={{ color: primaryColor }}>
            Unsupported: {chartConfig.type}
          </div>
        );
    }
  };

  return (
    <div className="flex h-full w-full flex-col p-6">
      {chartConfig.title && (
        <div
          className="mb-4 text-lg font-semibold"
          style={{ color: primaryColor }}
        >
          {chartConfig.title}
        </div>
      )}
      {(chartConfig.xAxisLabel || chartConfig.yAxisLabel) && (
        <div className="mb-3 flex gap-4 text-sm opacity-70" style={{ color: primaryColor }}>
          {chartConfig.xAxisLabel && <span>X: {chartConfig.xAxisLabel}</span>}
          {chartConfig.yAxisLabel && <span>Y: {chartConfig.yAxisLabel}</span>}
        </div>
      )}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <div className="h-full w-full">
          {renderChart()}
        </div>
      </div>
    </div>
  );
}

