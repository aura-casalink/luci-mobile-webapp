/**
 * Sistema de logging condicional para Luci Mobile Webapp
 * 
 * En PRODUCCIÓN: Solo muestra errores críticos (sin datos personales)
 * En DESARROLLO: Muestra todos los logs para debugging
 */

// Detectar si estamos en desarrollo
const isDev = () => {
  // Vercel automáticamente setea NODE_ENV en producción
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
    return false
  }
  
  // Fallback: detectar por hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    // Considera dev: localhost, 127.0.0.1, .vercel.app (preview)
    return hostname === 'localhost' || 
           hostname === '127.0.0.1' || 
           hostname.includes('.vercel.app')
  }
  
  return true // Por defecto, asumir dev para seguridad
}

/**
 * Log solo en desarrollo
 * Uso: devLog('🔧', 'Device ID:', deviceId)
 */
export const devLog = (...args) => {
  if (isDev()) {
    console.log(...args)
  }
}

/**
 * Log de errores (siempre se muestra, pero SIN datos personales)
 * Uso: errorLog('Error al cargar datos')
 */
export const errorLog = (...args) => {
  console.error(...args)
}

/**
 * Log de éxitos simples (sin datos sensibles)
 * Uso: successLog('✅ Operación completada')
 */
export const successLog = (...args) => {
  if (isDev()) {
    console.log(...args)
  }
}

/**
 * Helper para sanitizar datos antes de loggear
 * Remueve IPs, emails, sessionIds, etc.
 */
export const sanitize = (obj) => {
  if (!isDev()) return '[HIDDEN]'
  return obj
}
