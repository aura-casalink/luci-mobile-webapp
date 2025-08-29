// middleware.js (proyecto MOBILE: luci.aura-app.es)
import { NextResponse } from 'next/server';

const DESKTOP_HOST = 'desktop-luci.aura-app.es';

// Regex móvil/tablet clásico
const MOBILE_RE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

export function middleware(req) {
  const url = req.nextUrl;

  // Ignora estáticos
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/assets') ||
    url.pathname === '/favicon.ico' ||
    url.pathname === '/robots.txt' ||
    url.pathname === '/sitemap.xml'
  ) {
    return NextResponse.next();
  }

  // Override manual por cookie (útil para QA)
  const pref = req.cookies.get('view')?.value;
  if (pref === 'mobile') return NextResponse.next();
  if (pref === 'desktop') {
    const dest = new URL(url.href);
    dest.hostname = DESKTOP_HOST;
    return NextResponse.redirect(dest, 307);
  }

  const ua = req.headers.get('user-agent') || '';
  const isMobile = MOBILE_RE.test(ua);

  // Si NO es móvil/tablet => redirige al host desktop (conserva ruta y query)
  if (!isMobile && url.hostname !== DESKTOP_HOST) {
    const dest = new URL(url.href);
    dest.hostname = DESKTOP_HOST;
    return NextResponse.redirect(dest, 307); // usa 308 cuando lo quieras hacer permanente
  }

  // Cabeceras de diagnóstico para comprobar que el middleware corre
  const res = NextResponse.next();
  res.headers.set('x-aura-middleware', 'hit');
  res.headers.set('x-aura-ua', ua.slice(0, 80));
  res.headers.set('x-aura-device', isMobile ? 'mobile' : 'desktop');
  return res;
}

// Aplica a todo
export const config = {
  matcher: ['/:path*'],
};
