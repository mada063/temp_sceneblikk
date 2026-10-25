export type BrandAppearance = {
  brandingLogoUrl?: string;
  brandingText?: string;
};

export const brandAppearanceDefaults: Required<BrandAppearance> = {
  brandingLogoUrl: "",
  brandingText: "",
};
