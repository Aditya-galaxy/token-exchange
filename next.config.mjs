/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      "utf-8-validate": false,
      bufferutil: false,
    };
    return config;
  },
};

export default nextConfig;
