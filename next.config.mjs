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
      // PROD: si llegan a luci.aura-app.es desde ESCRITORIO → redirige a desktop-luci.aura-app.es
      {
        source: '/:path*',
        has: [
          { type: 'host', value: 'luci.aura-app.es' },
          { type: 'header', key: 'user-agent', value: DESKTOP_UA },
        ],
        destination: 'https://desktop-luci.aura-app.es/:path*',
        permanent: false, // pon true cuando lo valides (308)
      },
      // (Opcional) PREVIEW: si navegas a la preview de Vercel desde ESCRITORIO → redirige igual
      {
        source: '/:path*',
        has: [
          { type: 'host', value: 'luci-mobile-webapp.vercel.app' },
          { type: 'header', key: 'user-agent', value: DESKTOP_UA },
        ],
        destination: 'https://desktop-luci.aura-app.es/:path*',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
