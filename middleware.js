import { NextResponse, userAgent } from 'next/server';

// Configuración de dominios
const MOBILE_HOST = 'luci.aura-app.es';
const DESKTOP_HOST = 'desktop-luci.aura-app.es';

/**
 * Middleware para redirección automática desktop/mobile
 * - Redirige usuarios de desktop desde el dominio móvil al dominio desktop
 * - Preserva rutas y query params
 * - Ignora bots para SEO
 */
export function middleware(request) {
  const url = request.nextUrl;
  
  // Solo actuar cuando el host es el dominio móvil
  // Esto previene bucles de redirección y efectos no deseados en el dominio desktop
  if (url.hostname !== MOBILE_HOST) {
    return NextResponse.next();
  }
  
  // Obtener información del user agent
  const { device, isBot } = userAgent(request);
  
  // Permitir bots para SEO (Google, Bing, etc.)
  if (isBot) {
    return NextResponse.next();
  }
  
  // Detectar si es desktop
  // En Next.js, device.type será 'mobile' o 'tablet' para dispositivos móviles
  // Para desktop, device.type será undefined
  const isMobileDevice = device.type === 'mobile' || device.type === 'tablet';
  const isDesktop = !isMobileDevice;
  
  // Si es desktop, redirigir al dominio desktop
  if (isDesktop) {
    // Clonar la URL actual
    const destinationUrl = new URL(url.href);
    
    // Cambiar solo el hostname, preservando ruta y query params
    destinationUrl.hostname = DESKTOP_HOST;
    
    // Log para debugging (puedes comentar en producción)
    console.log(`[Middleware] Redirigiendo desktop user de ${url.href} a ${destinationUrl.href}`);
    
    // Usar 307 Temporary Redirect para mantener el método HTTP
    return NextResponse.redirect(destinationUrl, 307);
  }
  
  // Si es móvil, continuar normalmente
  return NextResponse.next();
}

// Configuración del matcher - define qué rutas procesa el middleware
export const config = {
  matcher: [
    /*
     * Aplicar a todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico, robots.txt, sitemap.xml (archivos públicos comunes)
     * - Archivos con extensión (ej: .png, .jpg, .css, .js)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
  ],
};
