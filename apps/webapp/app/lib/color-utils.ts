export function hexToRgba(color: string | undefined, alpha: number) {
  if (!color) {
    return `rgba(255, 255, 255, ${alpha})`;
  }
  let hex = color.trim();
  if (hex.startsWith("#")) {
    hex = hex.slice(1);
  }
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  if (hex.length !== 6 || Number.isNaN(Number(`0x${hex}`))) {
    return `rgba(255, 255, 255, ${alpha})`;
  }
  const bigint = Number.parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function hexToRgb(color: string | undefined) {
  if (!color) {
    return null;
  }
  let hex = color.trim();
  if (hex.startsWith("#")) {
    hex = hex.slice(1);
  }
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  if (hex.length !== 6 || Number.isNaN(Number(`0x${hex}`))) {
    return null;
  }
  const value = Number.parseInt(hex, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

export function getReadableTextColor(color: string | undefined, fallback: string) {
  const rgb = hexToRgb(color);
  if (!rgb) {
    return fallback;
  }
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.6 ? "#0f172a" : "#ffffff";
}
