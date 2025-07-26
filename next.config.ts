import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  
  // Experimental features for better performance
  experimental: {
    // Temporarily disable CSS optimization due to critters module issue
    // optimizeCss: true,
    optimizePackageImports: [
      "@radix-ui/react-icons",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-dialog",
      "@radix-ui/react-popover",
      "@radix-ui/react-select",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-label",
      "lucide-react",
    ],
  },

  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Compression
  compress: true,

  // Bundle analyzer (enable with ANALYZE=true)
  ...(process.env.ANALYZE === "true" && {
    webpack: (config: any) => {
      config.plugins.push(
        new (require("@next/bundle-analyzer")())({
          enabled: true,
        })
      );
      return config;
    },
  }),

  // Optimized webpack configuration
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    // Optimize bundle splitting
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Separate chunk for large libraries
          xlsx: {
            name: "xlsx",
            test: /[\\/]node_modules[\\/]xlsx[\\/]/,
            chunks: "all",
            priority: 20,
          },
          recharts: {
            name: "recharts",
            test: /[\\/]node_modules[\\/]recharts[\\/]/,
            chunks: "all",
            priority: 20,
          },
          // Radix UI components
          radix: {
            name: "radix",
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            chunks: "all",
            priority: 15,
          },
          // React Query
          reactQuery: {
            name: "react-query",
            test: /[\\/]node_modules[\\/]@tanstack[\\/]react-query[\\/]/,
            chunks: "all",
            priority: 15,
          },
        },
      };
    }
    return config;
  },

  // Output configuration for better caching
  generateEtags: true,
  poweredByHeader: false,
};

export default nextConfig;
