// next.config.mjs
/** @type {import('next').NextConfig} */

const DESKTOP_UA = '(Windows NT|Macintosh|X11;|Linux x86_64|CrOS)';

const nextConfig = {
  async headers() {
    return [
      // Siempre variar por User-Agent (para que Vercel revalide por dispositivo)
      {
        source: '/(.*)',
        headers: [{ key: 'Vary', value: 'User-Agent' }],
      },
      // Evita cachear el HTML de la home: forzamos reevaluación del redirect
      {
        source: '/',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ];
  },
  async redirects() {
    return [
      // EXCLUIR /share/* del redirect a desktop
      {
        source: '/',
        has: [
          { type: 'host', value: 'luci.aura-app.es' },
          { type: 'header', key: 'user-agent', value: DESKTOP_UA },
        ],
        destination: 'https://desktop-luci.aura-app.es/',
        permanent: false,
      },
      // Para todas las demás rutas EXCEPTO /share/*
      {
        source: '/:path((?!share).*)',
        has: [
          { type: 'host', value: 'luci.aura-app.es' },
          { type: 'header', key: 'user-agent', value: DESKTOP_UA },
        ],
        destination: 'https://desktop-luci.aura-app.es/:path*',
        permanent: false,
      },
      // Preview environment (también excluir /share/*)
      {
        source: '/:path((?!share).*)',
        has: [
          { type: 'host', value: 'luci-mobile-webapp.vercel.app' },
          { type: 'header', key: 'user-agent', value: DESKTOP_UA },
        ],
        destination: 'https://desktop-luci.aura-app.es/:path*',
        permanent: false,
      },
    ];
  },

export default nextConfig;
