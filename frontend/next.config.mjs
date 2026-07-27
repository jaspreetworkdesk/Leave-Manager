/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/leave-manager",
  trailingSlash: true,

  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;