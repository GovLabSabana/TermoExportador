/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'https://merry-courage-production.up.railway.app',
    JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-key',
  },
  
  // Railway-specific optimizations
  output: 'standalone',
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  },
  
  // Configure experimental features for better performance
  experimental: {
    optimizePackageImports: ['zustand', 'js-cookie']
  }
};

export default nextConfig;
