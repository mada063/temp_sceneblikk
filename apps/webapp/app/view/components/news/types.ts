import type { CellAppearance } from "../../../lib/layout-types";

export type NewsProps = {
  appearance: CellAppearance;
  colSpan?: number;
  rowSpan?: number;
  totalGridSize?: number;
  panelSize?: PanelSize;
};

export type NewsItem = {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
  source: string;
};

export type NewsFeed = {
  title: string;
  items: NewsItem[];
  lastUpdated: Date;
};

export type PanelSize = "tiny" | "small" | "medium" | "large" | "xlarge";

