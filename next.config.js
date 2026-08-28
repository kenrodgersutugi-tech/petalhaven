const defaultRuntimeCaching = require('next-pwa/cache');

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    // 1. Supabase auth session routes & token refresh must always fetch fresh from network
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/auth\/.*/i,
      handler: 'NetworkOnly',
      options: {
        cacheName: 'supabase-auth-session',
      },
    },
    {
      urlPattern: /\/(api\/)?auth\/(v1|session|callback|token|user).*/i,
      handler: 'NetworkOnly',
      options: {
        cacheName: 'auth-session-fresh',
      },
    },
    // 2. M-Pesa payment confirmation and checkout callback routes must always fetch fresh
    {
      urlPattern: /.*(mpesa|m-pesa|daraja|stkpush).*/i,
      handler: 'NetworkOnly',
      options: {
        cacheName: 'mpesa-fresh-routes',
      },
    },
    {
      urlPattern: /.*(payment|checkout\/confirmation|order-confirmation).*/i,
      handler: 'NetworkOnly',
      options: {
        cacheName: 'payment-confirmation-fresh',
      },
    },
    ...defaultRuntimeCaching,
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
