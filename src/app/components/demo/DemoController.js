case 'chat_type_message':
  setTimeout(() => {
    const input = document.querySelector('[data-demo="chat-input"]')
    if (input) {
      setHighlightElement('[data-demo="chat-input"]')
      setTooltipText('Observa cómo escribimos tu búsqueda en lenguaje natural...')
      
      const text = 'Un piso en Madrid, de al menos 3 habitaciones, en una zona cercana a un metro por menos de 450k€.'
      let i = 0
      
      setTimeout(() => {
        const interval = setInterval(() => {
          if (i <= text.length) {
            input.value = text.slice(0, i)
            
            // Actualizar React de múltiples formas para asegurar que detecte el cambio
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set
            nativeInputValueSetter.call(input, text.slice(0, i))
            
            const inputEvent = new Event('input', { bubbles: true })
            input.dispatchEvent(inputEvent)
            
            const changeEvent = new Event('change', { bubbles: true })
            input.dispatchEvent(changeEvent)
            
            i++
          } else {
            clearInterval(interval)
            
            // Esperar más tiempo para que React actualice el botón
            setTimeout(() => {
              // Buscar el botón de enviar de varias formas
              let sendButton = document.querySelector('[data-demo="send-button"]')
              
              // Si no tiene data-demo, buscar por otras características
              if (!sendButton) {
                const buttons = document.querySelectorAll('button')
                buttons.forEach(btn => {
                  // Buscar el botón que tenga el SVG de enviar (flecha hacia arriba)
                  const svg = btn.querySelector('svg')
                  if (svg && btn.offsetParent !== null && !btn.disabled) {
                    const path = svg.querySelector('path[d*="M12 2"]')
                    if (path) {
                      sendButton = btn
                    }
                  }
                })
              }
              
              if (sendButton && !sendButton.disabled) {
                console.log('Demo: Clicking send button')
                sendButton.click()
                
                // Avanzar al siguiente paso después de un delay
                setTimeout(() => {
                  goToNextStep()
                }, 2500)
              } else {
                console.log('Demo: Send button not found or disabled, trying alternative methods')
                
                // Método alternativo: simular Enter
                const enterEvent = new KeyboardEvent('keypress', {
                  key: 'Enter',
                  code: 'Enter',
                  keyCode: 13,
                  which: 13,
                  bubbles: true,
                  cancelable: true
                })
                input.dispatchEvent(enterEvent)
                
                // O llamar directamente a la función sendMessage si está disponible
                if (window.sendMessage && typeof window.sendMessage === 'function') {
                  window.sendMessage()
                }
                
                setTimeout(() => goToNextStep(), 2500)
              }
            }, 1500) // Esperar 1.5 segundos para asegurar que React actualizó el botón
          }
        }, 30)
      }, 1000)
    }
  }, 500)
  break
