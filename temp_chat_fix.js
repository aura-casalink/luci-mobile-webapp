// Buscar la función sendMessage en ChatInterface y reemplazar solo esta parte:

const sendMessage = async (message) => {
  if (!message.trim()) return

  await addMessage(message, 'user')
  setInputText('')
  setIsLoading(true)
  
  try {
    // Enviar a nuestra API local (que reenvía a n8n)
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        message: message.trim(), 
        session_id: sessionId,
        timestamp: new Date().toISOString(),
        source: 'webapp'
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('=== FRONTEND DEBUG ===')
    console.log('Full API Result:', result)
    console.log('Assistant Reply:', result.assistant_reply)
    console.log('Success:', result.success)
    console.log('=== END DEBUG ===')
    
    if (result.success) {
      console.log('Message sent to n8n successfully via API')
      
      // Verificar si hay respuesta del asistente
      if (result.assistant_reply) {
        console.log('SHOWING ASSISTANT REPLY:', result.assistant_reply)
        await addMessage(result.assistant_reply, 'assistant')
      } else {
        console.log('NO assistant_reply found in result')
      }
      
      setIsLoading(false)
    } else {
      throw new Error(result.error || 'Unknown API error')
    }
    
  } catch (error) {
    console.error('Error sending message:', error)
    addMessage('Error al enviar mensaje. ¿Puedes intentarlo de nuevo?', 'error')
    setIsLoading(false)
  }
}
