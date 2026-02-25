"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FiPlus, FiX } from "react-icons/fi";

type ChartDataPointField = {
  id: string;
  label: string;
  value: string | number;
  color?: string; // For doughnut chart slices
};

type ChartsEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

/**
 * Simple charts editor with input fields and color options
 */
export function ChartsEditor({ value, onChange }: ChartsEditorProps) {
  const [chartType, setChartType] = useState<string>("LineChart");
  const [title, setTitle] = useState<string>("");
  const [xAxisLabel, setXAxisLabel] = useState<string>("");
  const [yAxisLabel, setYAxisLabel] = useState<string>("");
  const [dataPoints, setDataPoints] = useState<ChartDataPointField[]>([]);
  
  // BarChart options
  const [barColor, setBarColor] = useState<string>("#3b82f6");
  const [barMaxColor, setBarMaxColor] = useState<string>("#22c55e");
  const [barMinColor, setBarMinColor] = useState<string>("#ef4444");
  const [averageLineColor, setAverageLineColor] = useState<string>("#f59e0b");
  const [axisColor, setAxisColor] = useState<string>("#ffffff");
  const [gridColor, setGridColor] = useState<string>("#ffffff30");
  const [labelColor, setLabelColor] = useState<string>("#ffffff");
  const [labelSecondaryColor, setLabelSecondaryColor] = useState<string>("#ffffff80");
  
  // LineChart options
  const [seriesColor, setSeriesColor] = useState<string>("#3b82f6");
  const [showAverage, setShowAverage] = useState<boolean>(false);
  const [showDots, setShowDots] = useState<boolean>(true);
  const [showArea, setShowArea] = useState<boolean>(false);
  const [lineType, setLineType] = useState<'linear' | 'curved' | 'step'>('curved');
  
  // DoughnutChart options
  const [gapDegrees, setGapDegrees] = useState<number>(0);
  const [segmentOutlineColor, setSegmentOutlineColor] = useState<string>("#ffffff");
  const [centerTextColor, setCenterTextColor] = useState<string>("#ffffff");
  const [centerValueColor, setCenterValueColor] = useState<string>("#ffffff");
  const [centerPercentageColor, setCenterPercentageColor] = useState<string>("#ffffff80");
  const [tooltipBackgroundColor, setTooltipBackgroundColor] = useState<string>("#1f2937");
  const [tooltipBorderColor, setTooltipBorderColor] = useState<string>("#374151");
  const [tooltipTextColor, setTooltipTextColor] = useState<string>("#ffffff");
  
  // RadarChart options
  const [centerTextColorRadar, setCenterTextColorRadar] = useState<string>("#ffffff");
  const [tooltipBackgroundColorRadar, setTooltipBackgroundColorRadar] = useState<string>("#1f2937");
  const [tooltipBorderColorRadar, setTooltipBorderColorRadar] = useState<string>("#374151");
  const [tooltipTextColorRadar, setTooltipTextColorRadar] = useState<string>("#ffffff");
  
  const isInternalUpdate = useRef(false);
  const lastSentValueRef = useRef<string>("");

  // Loosely typed icon components to avoid react-icons vs local React type incompatibilities
  const CloseIcon = FiX as React.ComponentType<{ className?: string }>;
  const PlusIcon = FiPlus as React.ComponentType<{ className?: string }>;

  // Chart types available from dallastek-ui
  const chartTypes = [
    "BarChart",
    "LineChart",
    "DoughnutChart",
    "RadarChart",
  ];

  // Helper to generate JSON from form data
  const generateJSON = useCallback(() => {
    const data = dataPoints
      .filter((dp) => dp.label.trim() && dp.value !== "" && dp.value !== null)
      .map((dp) => ({
        label: dp.label.trim(),
        value: typeof dp.value === "number" ? dp.value : Number(dp.value) || 0,
        ...(chartType === "DoughnutChart" && dp.color && { color: dp.color }),
      }));

    const config: any = {
      type: chartType,
      data,
      ...(title && { title }),
      ...(xAxisLabel && { xAxisLabel }),
      ...(yAxisLabel && { yAxisLabel }),
    };

    // Add chart-type-specific options
    if (chartType === "BarChart") {
      config.barColor = barColor;
      config.barMaxColor = barMaxColor;
      config.barMinColor = barMinColor;
      config.averageLineColor = averageLineColor;
      config.axisColor = axisColor;
      config.gridColor = gridColor;
      config.labelColor = labelColor;
      config.labelSecondaryColor = labelSecondaryColor;
    } else if (chartType === "LineChart") {
      config.seriesColors = [seriesColor];
      config.showAverage = showAverage;
      config.showDots = showDots;
      config.showArea = showArea;
      config.lineType = lineType;
      config.gridColor = gridColor;
      config.labelColor = labelColor;
      config.labelSecondaryColor = labelSecondaryColor;
    } else if (chartType === "DoughnutChart") {
      config.gapDegrees = gapDegrees;
      config.segmentOutlineColor = segmentOutlineColor;
      config.centerTextColor = centerTextColor;
      config.centerValueColor = centerValueColor;
      config.centerPercentageColor = centerPercentageColor;
      config.tooltipBackgroundColor = tooltipBackgroundColor;
      config.tooltipBorderColor = tooltipBorderColor;
      config.tooltipTextColor = tooltipTextColor;
    } else if (chartType === "RadarChart") {
      config.gridColor = gridColor;
      config.axisColor = axisColor;
      config.labelColor = labelColor;
      config.labelSecondaryColor = labelSecondaryColor;
      config.centerTextColorRadar = centerTextColorRadar;
      config.tooltipBackgroundColorRadar = tooltipBackgroundColorRadar;
      config.tooltipBorderColorRadar = tooltipBorderColorRadar;
      config.tooltipTextColorRadar = tooltipTextColorRadar;
    }

    return JSON.stringify(config);
  }, [
    chartType, dataPoints, title, xAxisLabel, yAxisLabel,
    barColor, barMaxColor, barMinColor, averageLineColor, axisColor, gridColor, labelColor, labelSecondaryColor,
    seriesColor, showAverage, showDots, showArea, lineType,
    gapDegrees, segmentOutlineColor, centerTextColor, centerValueColor, centerPercentageColor,
    tooltipBackgroundColor, tooltipBorderColor, tooltipTextColor,
    centerTextColorRadar, tooltipBackgroundColorRadar, tooltipBorderColorRadar, tooltipTextColorRadar,
  ]);

  // Parse existing value on mount and when value changes from external source
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    if (value === lastSentValueRef.current) {
      return;
    }

    try {
      if (value) {
        const parsed = JSON.parse(value);
        setChartType(parsed.type || "LineChart");
        setTitle(parsed.title || "");
        setXAxisLabel(parsed.xAxisLabel || "");
        setYAxisLabel(parsed.yAxisLabel || "");
        
        // BarChart options
        if (parsed.barColor) setBarColor(parsed.barColor);
        if (parsed.barMaxColor) setBarMaxColor(parsed.barMaxColor);
        if (parsed.barMinColor) setBarMinColor(parsed.barMinColor);
        if (parsed.averageLineColor) setAverageLineColor(parsed.averageLineColor);
        if (parsed.axisColor) setAxisColor(parsed.axisColor);
        if (parsed.gridColor) setGridColor(parsed.gridColor);
        if (parsed.labelColor) setLabelColor(parsed.labelColor);
        if (parsed.labelSecondaryColor) setLabelSecondaryColor(parsed.labelSecondaryColor);
        
        // LineChart options
        if (parsed.seriesColors && parsed.seriesColors[0]) setSeriesColor(parsed.seriesColors[0]);
        if (typeof parsed.showAverage === 'boolean') setShowAverage(parsed.showAverage);
        if (typeof parsed.showDots === 'boolean') setShowDots(parsed.showDots);
        if (typeof parsed.showArea === 'boolean') setShowArea(parsed.showArea);
        if (parsed.lineType) setLineType(parsed.lineType);
        
        // DoughnutChart options
        if (typeof parsed.gapDegrees === 'number') setGapDegrees(parsed.gapDegrees);
        if (parsed.segmentOutlineColor) setSegmentOutlineColor(parsed.segmentOutlineColor);
        if (parsed.centerTextColor) setCenterTextColor(parsed.centerTextColor);
        if (parsed.centerValueColor) setCenterValueColor(parsed.centerValueColor);
        if (parsed.centerPercentageColor) setCenterPercentageColor(parsed.centerPercentageColor);
        if (parsed.tooltipBackgroundColor) setTooltipBackgroundColor(parsed.tooltipBackgroundColor);
        if (parsed.tooltipBorderColor) setTooltipBorderColor(parsed.tooltipBorderColor);
        if (parsed.tooltipTextColor) setTooltipTextColor(parsed.tooltipTextColor);
        
        // RadarChart options
        if (parsed.centerTextColorRadar) setCenterTextColorRadar(parsed.centerTextColorRadar);
        if (parsed.tooltipBackgroundColorRadar) setTooltipBackgroundColorRadar(parsed.tooltipBackgroundColorRadar);
        if (parsed.tooltipBorderColorRadar) setTooltipBorderColorRadar(parsed.tooltipBorderColorRadar);
        if (parsed.tooltipTextColorRadar) setTooltipTextColorRadar(parsed.tooltipTextColorRadar);
        
        if (Array.isArray(parsed.data) && parsed.data.length > 0) {
          const newDataPoints = parsed.data.map((item: any, idx: number) => ({
            id: `point-${idx + 1}`,
            label: item.label || "",
            value: item.value ?? "",
            color: item.color,
          }));
          setDataPoints(newDataPoints);
        } else {
          setDataPoints([{ id: "point-1", label: "", value: "" }]);
        }
        lastSentValueRef.current = value;
      } else {
        // Reset to defaults
        setChartType("LineChart");
        setTitle("");
        setXAxisLabel("");
        setYAxisLabel("");
        setDataPoints([{ id: "point-1", label: "", value: "" }]);
        lastSentValueRef.current = "";
      }
    } catch {
      setChartType("LineChart");
      setTitle("");
      setXAxisLabel("");
      setYAxisLabel("");
      setDataPoints([{ id: "point-1", label: "", value: "" }]);
      lastSentValueRef.current = "";
    }
  }, [value]);

  // Update JSON whenever form data changes
  useEffect(() => {
    const jsonString = generateJSON();
    
    if (jsonString !== lastSentValueRef.current) {
      isInternalUpdate.current = true;
      lastSentValueRef.current = jsonString;
      onChange(jsonString);
    }
  }, [generateJSON, onChange]);

  const addDataPoint = () => {
    setDataPoints((prev) => [
      ...prev,
      {
        id: `point-${Date.now()}`,
        label: "",
        value: "",
        ...(chartType === "DoughnutChart" && { color: `#${Math.floor(Math.random()*16777215).toString(16)}` }),
      },
    ]);
  };

  const removeDataPoint = (id: string) => {
    setDataPoints((prev) => prev.filter((dp) => dp.id !== id));
  };

  const updateDataPoint = (id: string, updates: Partial<ChartDataPointField>) => {
    setDataPoints((prev) =>
      prev.map((dp) => (dp.id === id ? { ...dp, ...updates } : dp))
    );
  };

  const ColorInput = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
    <label className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 cursor-pointer rounded-md border border-black/10 bg-transparent p-0 shadow-sm"
        />
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-custom-color-500 dark:text-custom-color-100/80">
          {value.toUpperCase()}
        </span>
      </div>
    </label>
  );

  return (
    <div className="space-y-3">
      <label className="space-y-1">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
          Chart type
        </span>
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
        >
          {chartTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
          Chart title (optional)
        </span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Chart Title"
          className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
            X-axis label
          </span>
          <input
            type="text"
            value={xAxisLabel}
            onChange={(e) => setXAxisLabel(e.target.value)}
            placeholder="X-axis"
            className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
          />
        </label>
        <label className="space-y-1">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
            Y-axis label
          </span>
          <input
            type="text"
            value={yAxisLabel}
            onChange={(e) => setYAxisLabel(e.target.value)}
            placeholder="Y-axis"
            className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
          />
        </label>
      </div>

      {/* BarChart specific options */}
      {chartType === "BarChart" && (
        <div className="mt-3 space-y-2 rounded-lg border border-custom-color-300/40 p-3">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
            Bar Chart Colors
          </p>
          <ColorInput label="Bar color" value={barColor} onChange={setBarColor} />
          <ColorInput label="Max bar color" value={barMaxColor} onChange={setBarMaxColor} />
          <ColorInput label="Min bar color" value={barMinColor} onChange={setBarMinColor} />
          <ColorInput label="Average line" value={averageLineColor} onChange={setAverageLineColor} />
          <ColorInput label="Axis color" value={axisColor} onChange={setAxisColor} />
          <ColorInput label="Grid color" value={gridColor} onChange={setGridColor} />
          <ColorInput label="Label color" value={labelColor} onChange={setLabelColor} />
          <ColorInput label="Secondary label" value={labelSecondaryColor} onChange={setLabelSecondaryColor} />
        </div>
      )}

      {/* LineChart specific options */}
      {chartType === "LineChart" && (
        <div className="mt-3 space-y-2 rounded-lg border border-custom-color-300/40 p-3">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
            Line Chart Options
          </p>
          <ColorInput label="Line color" value={seriesColor} onChange={setSeriesColor} />
          <ColorInput label="Grid color" value={gridColor} onChange={setGridColor} />
          <ColorInput label="Label color" value={labelColor} onChange={setLabelColor} />
          <ColorInput label="Secondary label" value={labelSecondaryColor} onChange={setLabelSecondaryColor} />
          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showAverage}
                onChange={(e) => setShowAverage(e.target.checked)}
                className="h-3.5 w-3.5 border border-custom-color-400 text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
              />
              <span className="text-xs">Show average line</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showDots}
                onChange={(e) => setShowDots(e.target.checked)}
                className="h-3.5 w-3.5 border border-custom-color-400 text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
              />
              <span className="text-xs">Show dots</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showArea}
                onChange={(e) => setShowArea(e.target.checked)}
                className="h-3.5 w-3.5 border border-custom-color-400 text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
              />
              <span className="text-xs">Fill area</span>
            </label>
          </div>
          <label className="space-y-1">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
              Line type
            </span>
            <select
              value={lineType}
              onChange={(e) => setLineType(e.target.value as 'linear' | 'curved' | 'step')}
              className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
            >
              <option value="linear">Linear</option>
              <option value="curved">Curved</option>
              <option value="step">Step</option>
            </select>
          </label>
        </div>
      )}

      {/* DoughnutChart specific options */}
      {chartType === "DoughnutChart" && (
        <div className="mt-3 space-y-2 rounded-lg border border-custom-color-300/40 p-3">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
            Doughnut Chart Options
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
              <span>Gap between segments</span>
              <span>{gapDegrees}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              step={1}
              value={gapDegrees}
              onChange={(e) => setGapDegrees(Number(e.target.value))}
              className="w-full accent-custom-color-500 dark:accent-custom-color-300"
            />
          </div>
          <ColorInput label="Outline color" value={segmentOutlineColor} onChange={setSegmentOutlineColor} />
          <ColorInput label="Center text" value={centerTextColor} onChange={setCenterTextColor} />
          <ColorInput label="Center value" value={centerValueColor} onChange={setCenterValueColor} />
          <ColorInput label="Center percentage" value={centerPercentageColor} onChange={setCenterPercentageColor} />
          <p className="pt-2 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
            Tooltip Colors
          </p>
          <ColorInput label="Tooltip background" value={tooltipBackgroundColor} onChange={setTooltipBackgroundColor} />
          <ColorInput label="Tooltip border" value={tooltipBorderColor} onChange={setTooltipBorderColor} />
          <ColorInput label="Tooltip text" value={tooltipTextColor} onChange={setTooltipTextColor} />
        </div>
      )}

      {/* RadarChart specific options */}
      {chartType === "RadarChart" && (
        <div className="mt-3 space-y-2 rounded-lg border border-custom-color-300/40 p-3">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
            Radar Chart Colors
          </p>
          <ColorInput label="Grid color" value={gridColor} onChange={setGridColor} />
          <ColorInput label="Axis color" value={axisColor} onChange={setAxisColor} />
          <ColorInput label="Label color" value={labelColor} onChange={setLabelColor} />
          <ColorInput label="Secondary label" value={labelSecondaryColor} onChange={setLabelSecondaryColor} />
          <ColorInput label="Center text" value={centerTextColorRadar} onChange={setCenterTextColorRadar} />
          <p className="pt-2 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
            Tooltip Colors
          </p>
          <ColorInput label="Tooltip background" value={tooltipBackgroundColorRadar} onChange={setTooltipBackgroundColorRadar} />
          <ColorInput label="Tooltip border" value={tooltipBorderColorRadar} onChange={setTooltipBorderColorRadar} />
          <ColorInput label="Tooltip text" value={tooltipTextColorRadar} onChange={setTooltipTextColorRadar} />
        </div>
      )}

      <div className="space-y-2">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
          Data points
        </span>
        {dataPoints.map((point) => (
          <div key={point.id} className="flex gap-2">
            <input
              type="text"
              placeholder="Label"
              value={point.label}
              onChange={(e) => updateDataPoint(point.id, { label: e.target.value })}
              className="flex-1 rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
            />
            <input
              type="text"
              placeholder="Value"
              value={point.value}
              onChange={(e) => {
                const val = e.target.value;
                const numVal = Number(val);
                updateDataPoint(point.id, {
                  value: val === "" || isNaN(numVal) ? val : numVal,
                });
              }}
              className="w-24 rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
            />
            {chartType === "DoughnutChart" && (
              <input
                type="color"
                value={point.color || "#3b82f6"}
                onChange={(e) => updateDataPoint(point.id, { color: e.target.value })}
                className="h-10 w-10 cursor-pointer rounded-lg border border-custom-color-300/50 bg-transparent p-0 shadow-sm"
              />
            )}
            {dataPoints.length > 1 && (
              <button
                type="button"
                onClick={() => removeDataPoint(point.id)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-custom-color-300/50 bg-white/80 text-custom-color-600 transition hover:bg-custom-color-100 dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-300 dark:hover:bg-custom-color-700"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addDataPoint}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-600 transition hover:bg-custom-color-100 dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-300 dark:hover:bg-custom-color-700"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add data point</span>
        </button>
      </div>
    </div>
  );
}
