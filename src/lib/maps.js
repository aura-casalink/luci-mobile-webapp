export function getStreetViewUrl(property) {
  // Buscar coordenadas en diferentes formatos
  const lat = property?.latitude || property?.lat || property?.location?.lat
  const lng = property?.longitude || property?.lng || property?.location?.lng
  
  if (lat && lng) {
    return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`
  }
  
  // Fallback: buscar por dirección
  const address = property?.address || property?.neighborhood || 'Madrid'
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}
