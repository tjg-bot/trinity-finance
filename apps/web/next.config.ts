import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@trinity/ui", "@trinity/db", "@trinity/forms", "@trinity/ai", "@trinity/pdf", "@trinity/stoplight"],
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "puppeteer"],
  },
  images: {
    domains: ["s3.amazonaws.com"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://js.sentry-cdn.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.amazonaws.com",
              "connect-src 'self' https://*.clerk.com https://*.sentry.io https://api.anthropic.com https://sandbox.plaid.com https://production.plaid.com",
              "frame-src 'self' https://clerk.com https://*.clerk.accounts.dev",
            ].join("; "),
          },
        ],
      },
      {
        // No tracking on /apply pages
        source: "/apply/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
        ],
      },
    ];
  },
};

export default nextConfig;
