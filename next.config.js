// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   output: 'export',
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   images: { unoptimized: true },
//   webpack: (config) => {
//     config.resolve.alias.canvas = false;
//     config.resolve.alias.encoding = false;
//     return config;
//   },
//   experimental: {
//     serverComponentsExternalPackages: ["pdfjs-dist"]
//   }
// };

// module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ["pdfjs-dist"]
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "no-store",
        },
      ],
    },
  ],
};

module.exports = nextConfig;
