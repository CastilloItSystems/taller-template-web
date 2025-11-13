/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Configuración necesaria para NextAuth
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: "/api/auth/[...nextauth]",
      },
    ];
  },

  // Mantener tus redirects existentes
  async redirects() {
    return [
      {
        source: "/apps/mail",
        destination: "/apps/mail/inbox",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
