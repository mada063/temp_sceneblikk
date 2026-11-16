export type PowerLocale = "nb" | "en";

export type PowerLabels = {
  powerSourceLabel: string;
  powerPricesToday: string;
  powerPriceNow: string;
  powerTodayLabel: string;
  powerAreaNO1: string;
  powerAreaNO2: string;
  powerAreaNO3: string;
  powerAreaNO4: string;
  powerAreaNO5: string;
};

const POWER_LABELS_NB: PowerLabels = {
  powerSourceLabel: "Hva koster strømmen.no",
  powerPricesToday: "Dagens priser",
  powerPriceNow: "Nå",
  powerTodayLabel: "I dag",
  powerAreaNO1: "Oslo / Øst-Norge",
  powerAreaNO2: "Kristiansand / Sør-Norge",
  powerAreaNO3: "Trondheim / Midt-Norge",
  powerAreaNO4: "Tromsø / Nord-Norge",
  powerAreaNO5: "Bergen / Vest-Norge",
};

const POWER_LABELS_EN: PowerLabels = {
  powerSourceLabel: "What does the power cost",
  powerPricesToday: "Today's prices",
  powerPriceNow: "Now",
  powerTodayLabel: "Today",
  powerAreaNO1: "Oslo / East Norway",
  powerAreaNO2: "Kristiansand / South Norway",
  powerAreaNO3: "Trondheim / Central Norway",
  powerAreaNO4: "Tromsø / North Norway",
  powerAreaNO5: "Bergen / West Norway",
};

export const POWER_LABELS: Record<PowerLocale, PowerLabels> = {
  nb: POWER_LABELS_NB,
  en: POWER_LABELS_EN,
};

export function getPowerAreaLabel(area: string, locale: PowerLocale): string {
  const key = `powerArea${area}` as keyof PowerLabels;
  return POWER_LABELS[locale][key] ?? area;
}
