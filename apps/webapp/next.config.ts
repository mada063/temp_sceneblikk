import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  i18n: {
    locales: ["nb", "en"],
    defaultLocale: "nb",
    localeDetection: true,
  },
};

export default nextConfig;
