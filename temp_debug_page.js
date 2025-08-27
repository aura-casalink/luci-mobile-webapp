// Agregar estas líneas justo antes del return en page.js, dentro de la función renderContent para el case 'saved':

case 'saved':
  console.log('[page.js] Rendering SavedPropertiesContainer with props:', {
    sessionId,
    savedProperties: savedProperties ? Array.from(savedProperties) : 'undefined',
    onToggleSave: typeof handleToggleSaveProperty
  })
  
  return <SavedPropertiesContainer 
    sessionId={sessionId}
    savedProperties={savedProperties}
    onToggleSave={handleToggleSaveProperty}
  />
