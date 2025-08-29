import { NextResponse, userAgent } from 'next/server';

// Configuración de dominios
const MOBILE_DOMAINS = [
  'luci.aura-app.es',
  'luci-mobile-webapp.vercel.app', // Dominio de Vercel
  'www.luci.aura-app.es' // Por si acaso hay www
];

const DESKTOP_HOST = 'desktop-luci.aura-app.es';

/**
 * Middleware para redirección automática desktop/mobile
 * Versión que maneja dominios personalizados y Vercel
 */
export function middleware(request) {
  const url = request.nextUrl;
  
  // Obtener el host real desde headers (importante para dominios personalizados)
  const hostHeader = request.headers.get('host') || '';
  const xForwardedHost = request.headers.get('x-forwarded-host') || '';
  const actualHost = xForwardedHost || hostHeader || url.hostname;
  
  // DEBUG: Log completo de hosts
  console.log('========== MIDDLEWARE HOST DEBUG ==========');
  console.log('URL hostname:', url.hostname);
  console.log('Host header:', hostHeader);
  console.log('X-Forwarded-Host:', xForwardedHost);
  console.log('Actual host usado:', actualHost);
  console.log('URL completa:', url.href);
  console.log('Pathname:', url.pathname);
  
  // Verificar si estamos en un dominio móvil
  const isOnMobileDomain = MOBILE_DOMAINS.some(domain => 
    actualHost === domain || actualHost.startsWith(`${domain}:`)
  );
  
  if (!isOnMobileDomain) {
    console.log(`❌ No es dominio móvil. Host actual: ${actualHost}`);
    console.log('Dominios móviles configurados:', MOBILE_DOMAINS);
    return NextResponse.next();
  }
  
  console.log('✅ Detectado dominio móvil');
  
  // Obtener información del user agent
  const ua = request.headers.get('user-agent') || '';
  const { device, isBot } = userAgent(request);
  
  console.log('User Agent:', ua);
  console.log('Device type:', device.type || 'undefined (desktop probable)');
  console.log('Es bot:', isBot);
  
  // Permitir bots para SEO
  if (isBot) {
    console.log('🤖 Es un bot - no redirigir');
    return NextResponse.next();
  }
  
  // Detectar si es desktop con múltiples métodos
  const isMobileByDeviceType = device.type === 'mobile' || device.type === 'tablet';
  
  // Detección adicional por user agent string
  const isMobileByPattern = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTabletByPattern = /iPad|Android.*Tablet|Tablet.*Android/i.test(ua);
  
  // Si no detecta como móvil/tablet por ningún método, es desktop
  const isDesktop = !isMobileByDeviceType && !isMobileByPattern && !isTabletByPattern;
  
  console.log('Detección:', {
    isMobileByDeviceType,
    isMobileByPattern,
    isTabletByPattern,
    resultado: isDesktop ? 'DESKTOP' : 'MOBILE/TABLET'
  });
  
  // Si es desktop, redirigir
  if (isDesktop) {
    // Construir URL de destino preservando path y query
    const destinationUrl = `https://${DESKTOP_HOST}${url.pathname}${url.search}`;
    
    console.log(`🔀 REDIRIGIENDO a: ${destinationUrl}`);
    console.log('========== FIN DEBUG ==========');
    
    // Crear respuesta con headers de debugging
    const response = NextResponse.redirect(destinationUrl, 307);
    response.headers.set('X-Redirect-Reason', 'desktop-detected');
    response.headers.set('X-Original-Host', actualHost);
    response.headers.set('X-Device-Detection', 'desktop');
    
    return response;
  }
  
  console.log('📱 Es móvil/tablet - NO redirigir');
  console.log('========== FIN DEBUG ==========');
  
  // Continuar sin redirección
  const response = NextResponse.next();
  response.headers.set('X-Device-Detection', 'mobile');
  return response;
}

// Configuración del matcher
export const config = {
  matcher: [
    /*
     * Aplicar a todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico, robots.txt, sitemap.xml
     * - Archivos con extensión
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
  ],
};
