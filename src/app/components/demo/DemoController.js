'use client'
import { useEffect } from 'react'
import { useDemo } from '@/contexts/DemoContext'

export default function DemoController({ onStartApp }) {
  const { 
    isDemoActive,
    currentStep, 
    setHighlightElement, 
    setTooltipText,
    goToNextStep
  } = useDemo()

  useEffect(() => {
    if (!isDemoActive || !currentStep) return

    setHighlightElement(null)
    setTooltipText('')

    switch(currentStep) {
      case 'landing_welcome':
        setTimeout(() => {
          setTooltipText('¡Bienvenido al tour de Luci!\n\nUsa las flechas del teclado (← →) o los botones para navegar.')
        }, 300)
        break

      case 'landing_scroll':
        const element = document.querySelector('[data-demo="skyscanner-section"]')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          setTimeout(() => {
            setHighlightElement('[data-demo="skyscanner-section"]')
            setTooltipText(
              `Queremos devolver tiempo a las personas en el arduo proceso de compra de su piso.\n\n` +
              `Para ello, tenemos la potencia tecnológica de buscar por todo internet, y comparar lo que existe allí con las ` +
              `preferencias concretas de las personas, no filtros, sino gustos, intereses e información más intangible como la ` +
              `seguridad de los barrios o la amplitud de las estancias.\n\n` +
              `Nuestro modelo de negocio es muy simple: un servicio de personal shopping democrático, en los que las personas ` +
              `puedan "autoservirse" con sistemas de alertas multiplataformas y búsquedas conversacionales, o bien puedan ` +
              `solicitar la ayuda de nuestro equipo en parte o en todo el proceso desde antes de encontrar la casa hasta que ` +
              `ya están dentro.`
            )
          }, 800)
        }
        break

      case 'landing_click_start':
        setHighlightElement('[data-demo="start-button"]')
        setTooltipText('Pulsa el botón "Comenzar a buscar" para iniciar tu búsqueda personalizada')
        
        const button = document.querySelector('[data-demo="start-button"]')
        if (button) {
          const handleClick = () => {
            setTimeout(() => goToNextStep(), 500)
            button.removeEventListener('click', handleClick)
          }
          button.addEventListener('click', handleClick)
        }
        break

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
                  // Actualizar el valor del input Y el estado de React
                  input.value = text.slice(0, i)
                  
                  // Forzar actualización del estado de React
                  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set
                  nativeInputValueSetter.call(input, text.slice(0, i))
                  
                  // Disparar evento para que React detecte el cambio
                  const event = new Event('input', { bubbles: true })
                  input.dispatchEvent(event)
                  
                  // También disparar onChange por si acaso
                  const changeEvent = new Event('change', { bubbles: true })
                  input.dispatchEvent(changeEvent)
                  
                  i++
                } else {
                  clearInterval(interval)
                  
                  // Esperar un poco para asegurar que el botón cambia de estado
                  setTimeout(() => {
                    // El botón debería haber cambiado porque hay texto
                    // Buscar el botón que esté visible y activo
                    const sendButton = document.querySelector('[data-demo="send-button"]')
                    
                    if (sendButton) {
                      // Verificar que el botón tiene el icono de enviar (no el de micrófono)
                      const hasSendIcon = sendButton.querySelector('svg path[d*="M12 2L12 22"]')
                      
                      if (hasSendIcon) {
                        // Es el botón correcto de enviar
                        console.log('Clicking send button with text')
                        sendButton.click()
                      } else {
                        // Intentar forzar el click del formulario
                        console.log('Attempting form submit')
                        const form = input.closest('form')
                        if (form) {
                          form.requestSubmit()
                        } else {
                          // Como último recurso, simular Enter
                          const enterEvent = new KeyboardEvent('keypress', {
                            key: 'Enter',
                            code: 'Enter',
                            keyCode: 13,
                            bubbles: true
                          })
                          input.dispatchEvent(enterEvent)
                        }
                      }
                      
                      setTimeout(() => goToNextStep(), 2000)
                    }
                  }, 1000) // Esperar 1 segundo para que React actualice el botón
                }
              }, 30)
            }, 1000)
          }
        }, 500)
        break

      case 'chat_show_explanation':
        setTimeout(() => {
          const userMessages = document.querySelectorAll('[data-demo="chat-message"].from-user')
          if (userMessages.length > 0) {
            const lastMessage = userMessages[userMessages.length - 1]
            lastMessage.setAttribute('data-demo-focus', '1')
            setHighlightElement('[data-demo-focus="1"]')
            
            setTooltipText(
              `A partir del texto o de una nota de voz, nuestra inteligencia artificial descompone lo que es importante ` +
              `y busca en <10" en los principales portales inmobiliarios, actualmente integrados Idealista, Fotocasa y ` +
              `Habitaclia, en proceso de sumar más.`
            )
          }
        }, 1000)
        break

      case 'properties_carousel':
        setTimeout(() => {
          const carousel = document.querySelector('[data-demo="properties-carousel"]')
          if (carousel) {
            setHighlightElement('[data-demo="properties-carousel"]')
            setTooltipText('Explora las propiedades encontradas. Puedes deslizar para ver más opciones.')
          }
        }, 500)
        break
    }
  }, [isDemoActive, currentStep, setHighlightElement, setTooltipText, goToNextStep, onStartApp])

  return null
}
