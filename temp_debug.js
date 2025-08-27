// En useCallbacks.js, en la función enrichCallbackWithProperties, 
// AGREGAR estos console.log al inicio:

console.log('=== DEBUG CALLBACK ===')
console.log('Full callback:', callback)  
console.log('Callback payload:', payload)
console.log('payload.properties exists:', !!payload.properties)
console.log('payload.properties isArray:', Array.isArray(payload.properties))
if (payload.properties) {
  console.log('payload.properties length:', payload.properties.length)
}
console.log('=== END DEBUG ===')
