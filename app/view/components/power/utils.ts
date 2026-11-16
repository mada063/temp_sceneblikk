import type { PowerData, PowerHourPrice, PowerAreaId } from "./types";

const API_BASE = "https://www.hvakosterstrommen.no/api/v1/prices";

/**
 * Fetch spot prices for a given date and area.
 * API: GET https://www.hvakosterstrommen.no/api/v1/prices/YYYY/MM-DD_AREA.json
 * Tomorrow's prices available from ~13:00 day before.
 */
export async function fetchPowerPrices(
  date: Date,
  area: PowerAreaId
): Promise<PowerHourPrice[]> {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const url = `${API_BASE}/${year}/${month}-${day}_${area}.json`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Strømpris API: ${res.status}`);
  }

  const data = (await res.json()) as Array<{
    NOK_per_kWh: number;
    EUR_per_kWh: number;
    time_start: string;
    time_end: string;
  }>;

  return data.map((row) => ({
    timeStart: row.time_start,
    timeEnd: row.time_end,
    NOK_per_kWh: row.NOK_per_kWh,
    EUR_per_kWh: row.EUR_per_kWh,
  }));
}

/**
 * Find index of the current or next hour in the prices array.
 */
export function getCurrentHourIndex(prices: PowerHourPrice[]): number {
  const now = new Date();
  const iso = now.toISOString();
  for (let i = 0; i < prices.length; i++) {
    if (prices[i].timeStart <= iso && iso < prices[i].timeEnd) return i;
    if (prices[i].timeStart > iso) return i;
  }
  return 0;
}

/**
 * Format price for display (NOK per kWh).
 */
export function formatPrice(nokPerKwh: number): string {
  return nokPerKwh.toFixed(2).replace(".", ",");
}

export function formatTimeRange(timeStart: string, timeEnd: string, format: "12h" | "24h"): string {
  const start = new Date(timeStart);
  const end = new Date(timeEnd);
  if (format === "12h") {
    return `${start.toLocaleTimeString("en-US", { hour: "numeric", hour12: true })} – ${end.toLocaleTimeString("en-US", { hour: "numeric", hour12: true })}`;
  }
  return `${start.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit", hour12: false })} – ${end.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
}
