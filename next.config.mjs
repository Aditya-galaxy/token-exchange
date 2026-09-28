/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export — the build output in `out/` is what gets uploaded to the
  // Internet Computer asset canister (see dfx.json).
  output: "export",
  images: {
    // The IC asset canister serves static files; no Next image optimizer there.
    unoptimized: true,
  },
  trailingSlash: true,
  basePath: "",
};

export default nextConfig;
