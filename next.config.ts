import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable react strict mode for better error handling
  reactStrictMode: true,
  
  // Enable static optimization for better performance
  poweredByHeader: false,
  compress: true,
  
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maps.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
    ],
  },
  
  // Ensure proper handling of static assets
  experimental: {
    optimizeCss: true,
  },
  
  // Enable trailing slash handling
  trailingSlash: false,
  
  // Configure webpack for better optimization
  webpack: (config) => {
    // Important: return the modified config
    return config;
  },
};

export default nextConfig;