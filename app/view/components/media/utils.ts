import type { MediaItem } from "./types";

/**
 * Parse media items from comma/space separated URLs
 */
export function parseMediaItems(urlsString: string, mediaType: "image" | "video" = "image"): MediaItem[] {
  if (!urlsString || !urlsString.trim()) {
    return [];
  }

  // Split by comma or space (or newlines)
  const urls = urlsString
    .split(/[,\s\n]+/)
    .map(url => url.trim())
    .filter(url => url.length > 0);

  return urls.map((url, idx) => ({
    id: `media-${idx + 1}`,
    url: url,
    type: mediaType,
    duration: 5,
  }));
}

/**
 * Get media type from URL
 */
export function detectMediaType(url: string): "image" | "video" {
  if (!url) return "image";
  
  const videoExtensions = /\.(mp4|webm|ogg|mov|avi|wmv|flv)(\?|$)/i;
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/i;
  
  if (videoExtensions.test(url)) return "video";
  if (imageExtensions.test(url)) return "image";
  
  // Default to image if unknown
  return "image";
}

