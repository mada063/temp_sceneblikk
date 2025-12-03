/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    // Supported locales in the marketing site
    locales: ["nb", "en"],
    // Norwegian is the default for sceneblikk.no today
    defaultLocale: "nb",
    localeDetection: true,
  },
};

export default nextConfig;
