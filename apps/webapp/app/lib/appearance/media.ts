export type MediaAppearance = {
  mediaType?: "image" | "video";
  mediaUrls?: string;
  mediaAutoPlay?: boolean;
  mediaTransitionDuration?: number;
};

export const mediaAppearanceDefaults: Required<
  Pick<
    MediaAppearance,
    "mediaType" | "mediaUrls" | "mediaAutoPlay" | "mediaTransitionDuration"
  >
> = {
  mediaType: "image",
  mediaUrls: "",
  mediaAutoPlay: true,
  mediaTransitionDuration: 5,
};
