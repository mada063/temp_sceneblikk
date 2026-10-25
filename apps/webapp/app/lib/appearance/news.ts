export type NewsAppearance = {
  newsFeed?: string;
  newsScrollSpeed?: number;
  newsMaxItems?: number;
  newsShowSource?: boolean;
};

export const newsAppearanceDefaults: Required<NewsAppearance> = {
  newsFeed: "nrk_main",
  newsScrollSpeed: 50,
  newsMaxItems: 10,
  newsShowSource: true,
};
