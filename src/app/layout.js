// src/app/layout.js
import { Poppins } from 'next/font/google'
import './globals.css'
import Script from 'next/script'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata = {
  title: 'Luci - Tu Asistente Inmobiliario con IA',
  description: 'Encuentra tu hogar perfecto con AURA',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${poppins.variable} font-sans antialiased`}>
        {/* Redirect desktop → site de escritorio, antes de hidratar */}
        <Script id="device-redirect" strategy="beforeInteractive">
        {`
          (function() {
            try {
              var ua = navigator.userAgent || '';
              var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
              var isShareRoute = location.pathname.startsWith('/share/');
              
              // NO redirigir si es una ruta /share/*
              if (!isMobile && location.hostname === 'luci.aura-app.es' && !isShareRoute) {
                var dest = 'https://desktop-luci.aura-app.es' + location.pathname + location.search + location.hash;
                location.replace(dest);
              }
            } catch (e) {}
          })();
        `}
      </Script>

        {children}
      </body>
    </html>
  )
}
