import { NextResponse, userAgent } from 'next/server';

// Configuración de dominios
const MOBILE_HOST = 'luci.aura-app.es';
const DESKTOP_HOST = 'desktop-luci.aura-app.es';

/**
 * Middleware para redirección automática desktop/mobile
 * Versión con debugging completo
 */
export function middleware(request) {
  const url = request.nextUrl;
  const ua = request.headers.get('user-agent') || '';
  
  // DEBUG: Log inicial
  console.log('========== MIDDLEWARE DEBUG ==========');
  console.log('URL completa:', url.href);
  console.log('Hostname actual:', url.hostname);
  console.log('Pathname:', url.pathname);
  console.log('User-Agent raw:', ua);
  
  // Solo actuar cuando el host es el dominio móvil
  if (url.hostname !== MOBILE_HOST) {
    console.log(`❌ No actuar: hostname (${url.hostname}) !== MOBILE_HOST (${MOBILE_HOST})`);
    return NextResponse.next();
  }
  
  console.log('✅ Hostname coincide con MOBILE_HOST');
  
  // Obtener información del user agent
  const { device, isBot, ua: parsedUa, browser, engine, os, cpu } = userAgent(request);
  
  // DEBUG: Log detallado del parsing
  console.log('User Agent Parsing:', {
    device_type: device.type || 'undefined (desktop)',
    device_vendor: device.vendor,
    device_model: device.model,
    isBot: isBot,
    browser: browser.name,
    os: os.name,
    engine: engine.name
  });
  
  // Permitir bots para SEO
  if (isBot) {
    console.log('🤖 Es un bot - no redirigir');
    return NextResponse.next();
  }
  
  // Detectar si es desktop con múltiples métodos
  const isMobileByDeviceType = device.type === 'mobile' || device.type === 'tablet';
  const isMobileByUserAgent = /mobile|android|iphone|ipad|phone/i.test(ua);
  const isTabletByUserAgent = /ipad|tablet|tab/i.test(ua) && !/mobile/i.test(ua);
  
  console.log('Detección de dispositivo:', {
    isMobileByDeviceType,
    isMobileByUserAgent,
    isTabletByUserAgent,
    device_type_raw: device.type
  });
  
  // Lógica principal: si NO es móvil/tablet, es desktop
  const isDesktop = !isMobileByDeviceType && !isMobileByUserAgent && !isTabletByUserAgent;
  
  console.log(`📱 Resultado final: ${isDesktop ? 'DESKTOP' : 'MOBILE/TABLET'}`);
  
  // Si es desktop, redirigir
  if (isDesktop) {
    const destinationUrl = new URL(url.href);
    destinationUrl.hostname = DESKTOP_HOST;
    
    console.log(`🔀 REDIRIGIENDO de ${url.href} a ${destinationUrl.href}`);
    console.log('========== FIN DEBUG ==========');
    
    // Añadir header para verificar en el navegador
    const response = NextResponse.redirect(destinationUrl, 307);
    response.headers.set('X-Redirect-Reason', 'desktop-device-detected');
    response.headers.set('X-Original-Host', MOBILE_HOST);
    return response;
  }
  
  console.log('📱 Es móvil/tablet - NO redirigir');
  console.log('========== FIN DEBUG ==========');
  
  // Añadir header para debugging
  const response = NextResponse.next();
  response.headers.set('X-Device-Type', isMobileByDeviceType ? 'mobile' : 'desktop');
  return response;
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
