// src/lib/utils/ip-helper.js
export function getRealUserIP(request) {
  // Prioridad de headers para obtener IP real
  const ipHeaders = [
    'cf-connecting-ip',     // Cloudflare
    'x-real-ip',            // Nginx proxy
    'x-forwarded-for',      // Standard proxy
    'x-client-ip',          // Algunos proxies
    'true-client-ip',       // Akamai, Cloudflare Enterprise
  ];
  
  for (const header of ipHeaders) {
    const value = request.headers.get(header);
    if (value && value !== '::1' && value !== '127.0.0.1') {
      // x-forwarded-for puede tener múltiples IPs
      if (header === 'x-forwarded-for') {
        return value.split(',')[0].trim();
      }
      return value;
    }
  }
  
  // Fallback para desarrollo
  return process.env.NODE_ENV === 'development' 
    ? 'dev-localhost' 
    : 'unknown';
}

export function validateIP(ip) {
  // Validación básica IPv4
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  // Validación básica IPv6
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip) || ip === 'dev-localhost';
}
