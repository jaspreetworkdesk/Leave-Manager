/** @type {import("next").NextConfig} */

const rawBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH?.trim() || "";

const basePath =
  rawBasePath && rawBasePath !== "/"
    ? `/${rawBasePath.replace(/^\/+|\/+$/g, "")}`
    : "";

const nextConfig = {
  basePath,
  trailingSlash: true,

  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;