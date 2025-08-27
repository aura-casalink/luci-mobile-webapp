import { Poppins } from 'next/font/google'
import './globals.css'

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
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${poppins.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
