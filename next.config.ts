import type { NextConfig } from 'next'
import path from 'node:path'
import createNextIntlPlugin from 'next-intl/plugin'

// Heliobond investor app. Full Next.js app (Node runtime) — deliberately NOT a
// static export, so Server Components + real Soroban/Stellar data fetching can be
// added per route later without restructuring.
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Build performance (issue #303): use Turbopack for dev/build and keep a
  // persistent webpack filesystem cache for the legacy bundler so rebuilds of
  // unchanged modules are skipped, cutting the local dev loop well under 10s.
  experimental: {
    turbo: {},
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      config.cache = {
        type: 'filesystem',
        version: 'heliobond-1.0.0',
        buildDependencies: { config: [path.join(process.cwd(), 'next.config.ts')] },
        cacheDirectory: path.join(process.cwd(), '.next', 'cache', 'webpack'),
      }
    }
    return config
  },
}

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

export default withNextIntl(nextConfig)
