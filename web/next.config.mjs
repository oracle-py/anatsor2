import { imageHosts } from './image-hosts.config.mjs';

// Served at www.anatsor.org/login via a rewrite in the main site's vercel.json.
const basePath = '/login';

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  productionBrowserSourceMaps: false,
  turbopack: {},
  distDir: process.env.DIST_DIR || '.next',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: imageHosts,
    minimumCacheTTL: 60,
    qualities: [75, 85, 100],
  },
  ...(process.env.ENABLE_COMPONENT_TAGGER === 'true' || process.env.WATCH_IGNORED_PATHS
    ? {
        webpack(config, { dev: dev }) {
          if (dev) {
            // Optional visual-editor tagging adds work to every source transform.
            if (process.env.ENABLE_COMPONENT_TAGGER === 'true')
              config.module.rules.push({
                test: /\.(jsx|tsx)$/,
                exclude: [/node_modules/],
                use: [
                  {
                    loader: '@dhiwise/component-tagger/nextLoader',
                  },
                ],
              });
            const ignoredPaths = (process.env.WATCH_IGNORED_PATHS || '')
              .split(',')
              .map((p) => p.trim())
              .filter(Boolean);
            config.watchOptions = {
              ignored: ignoredPaths.length
                ? ignoredPaths.map((p) => `**/${p.replace(/^\/+|\/+$/g, '')}/**`)
                : undefined,
            };
          }
          return config;
        },
      }
    : {}),
};
export default nextConfig;
