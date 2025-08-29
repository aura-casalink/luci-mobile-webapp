import { NextResponse, userAgent } from 'next/server';

// Configuración de dominios
const DESKTOP_HOST = 'desktop-luci.aura-app.es';

/**
 * Middleware para redirección - versión de diagnóstico
 */
export function middleware(request) {
  const url = request.nextUrl;
  const ua = request.headers.get('user-agent') || '';
  
  // DIAGNÓSTICO: Añadir header a TODAS las respuestas para verificar que el middleware funciona
  const response = NextResponse.next();
  response.headers.set('X-Middleware-Executed', 'true');
  response.headers.set('X-Detected-Host', url.hostname);
  response.headers.set('X-Timestamp', new Date().toISOString());
  
  // Log para Vercel
  console.log(`[${new Date().toISOString()}] Middleware ejecutado en: ${url.hostname}${url.pathname}`);
  
  // NO actuar si ya estamos en el dominio desktop
  if (url.hostname === DESKTOP_HOST) {
    response.headers.set('X-Skip-Reason', 'already-on-desktop');
    return response;
  }
  
  // Detectar user agent
  const { device, isBot } = userAgent(request);
  
  // Si es bot, no redirigir
  if (isBot) {
    response.headers.set('X-Skip-Reason', 'bot-detected');
    return response;
  }
  
  // Detección simple y directa de desktop
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|webOS|BlackBerry/i.test(ua);
  const isTablet = /iPad|Android.*Tablet|Tablet/i.test(ua);
  const isDesktop = !isMobile && !isTablet;
  
  // Añadir información de detección a los headers
  response.headers.set('X-Device-Detection', isDesktop ? 'desktop' : 'mobile');
  response.headers.set('X-User-Agent-Match', isMobile ? 'mobile-pattern' : 'no-mobile-pattern');
  
  // Si es desktop, REDIRIGIR
  if (isDesktop) {
    const destinationUrl = new URL(url);
    destinationUrl.hostname = DESKTOP_HOST;
    
    console.log(`REDIRIGIENDO: ${url.href} → ${destinationUrl.href}`);
    
    const redirectResponse = NextResponse.redirect(destinationUrl, 307);
    redirectResponse.headers.set('X-Redirect-Reason', 'desktop-detected');
    redirectResponse.headers.set('X-Original-UA', ua.substring(0, 100));
    
    return redirectResponse;
  }
  
  // Si es móvil, devolver la response con headers de debug
  response.headers.set('X-Skip-Reason', 'mobile-detected');
  return response;
}

// Matcher simplificado para asegurar que se ejecuta
export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
