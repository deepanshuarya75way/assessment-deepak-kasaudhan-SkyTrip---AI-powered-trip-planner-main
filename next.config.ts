import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 images:{
  domains: ['places.googleapis.com'],
 },
 typescript: {
   ignoreBuildErrors: true,
 },
 eslint: {
   ignoreDuringBuilds: true,
 }
};

export default nextConfig;
