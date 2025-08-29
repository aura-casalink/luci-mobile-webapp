// middleware.js
import { NextResponse, userAgent } from 'next/server';

const MOBILE_HOST = 'luci.aura-app.es';
const DESKTOP_HOST = 'desktop-luci.aura-app.es';

export function middleware(req) {
  const url = req.nextUrl;

  // Solo actuamos cuando el host es el MOBILE para evitar bucles.
  if (url.hostname !== MOBILE_HOST) return NextResponse.next();

  const { device, isBot } = userAgent(req);
  if (isBot) return NextResponse.next(); // deja pasar a bots/SEO

  // Overrides opcionales por cookie (útil para QA):
  // set-cookie "view=desktop" o "view=mobile"
  const pref = req.cookies.get('view')?.value;
  if (pref === 'desktop') {
    const dest = new URL(url.href);
    dest.hostname = DESKTOP_HOST;        // conserva path y query
    return NextResponse.redirect(dest, 307);
  }
  if (pref === 'mobile') return NextResponse.next();

  // En Next, device.type = 'mobile' | 'tablet' en móviles/tablets; undefined en desktop
  const isDesktop = !device?.type;
  if (isDesktop) {
    const dest = new URL(url.href);
    dest.hostname = DESKTOP_HOST;
    return NextResponse.redirect(dest, 307); // usa 308 si quieres permanente
  }

  return NextResponse.next();
}

// Aplica a todo menos estáticos comunes
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
