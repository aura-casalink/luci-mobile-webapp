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
        
        // NO AUTO-CLICK - El usuario debe pulsar manualmente
        // Escuchar el click del usuario
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
        // Asegurar que el input está visible
        setTimeout(() => {
          const input = document.querySelector('[data-demo="chat-input"]')
          if (input) {
            setHighlightElement('[data-demo="chat-input"]')
            setTooltipText('Observa cómo escribimos tu búsqueda en lenguaje natural...')
            
            const text = 'Un piso en Madrid, de al menos 3 habitaciones, en una zona cercana a un metro por menos de 450k€.'
            let i = 0
            
            // Empezar a escribir después de un delay
            setTimeout(() => {
              const interval = setInterval(() => {
                if (i <= text.length) {
                  input.value = text.slice(0, i)
                  // Disparar evento de input para que React actualice el estado
                  const event = new Event('input', { bubbles: true })
                  input.dispatchEvent(event)
                  // También cambiar el estado directamente si es necesario
                  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set
                  nativeInputValueSetter.call(input, text.slice(0, i))
                  const inputEvent = new Event('input', { bubbles: true})
                  input.dispatchEvent(inputEvent)
                  i++
                } else {
                  clearInterval(interval)
                  
                  // Después de escribir, encontrar el botón correcto de enviar (no el de audio)
                  setTimeout(() => {
                    // Buscar específicamente el botón cuando hay texto
                    const buttons = document.querySelectorAll('[data-demo="send-button"]')
                    let sendButton = null
                    
                    // El botón de enviar debe estar activo (no disabled) y visible
                    buttons.forEach(btn => {
                      if (!btn.disabled && btn.offsetParent !== null) {
                        sendButton = btn
                      }
                    })
                    
                    if (sendButton) {
                      sendButton.click()
                      setTimeout(() => goToNextStep(), 2000)
                    }
                  }, 500)
                }
              }, 30)
            }, 1000)
          }
        }, 500)
        break

      case 'chat_show_explanation':
        setTimeout(() => {
          // Buscar mensajes del usuario
          const userMessages = document.querySelectorAll('[data-demo="chat-message"].from-user')
          if (userMessages.length > 0) {
            // Tomar el último mensaje del usuario
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
          // Buscar el carousel de propiedades
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
