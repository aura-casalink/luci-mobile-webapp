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
                  // Actualizar el valor
                  const currentText = text.slice(0, i)
                  input.value = currentText
                  
                  // Método 1: Actualizar via setter nativo
                  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set
                  nativeInputValueSetter.call(input, currentText)
                  
                  // Método 2: Disparar evento React
                  const reactEvent = new Event('input', { bubbles: true })
                  Object.defineProperty(reactEvent, 'target', {
                    value: input,
                    enumerable: true
                  })
                  input.dispatchEvent(reactEvent)
                  
                  // Método 3: Forzar onChange también
                  const changeEvent = new Event('change', { bubbles: true })
                  input.dispatchEvent(changeEvent)
                  
                  // Método 4: Si el input tiene un handler React, llamarlo directamente
                  const reactProps = Object.keys(input).find(key => key.startsWith('__reactProps'))
                  if (reactProps && input[reactProps].onChange) {
                    input[reactProps].onChange({ target: { value: currentText } })
                  }
                  
                  i++
                } else {
                  clearInterval(interval)
                  
                  // Después de escribir todo el texto, esperar y buscar el botón correcto
                  setTimeout(() => {
                    // Verificar que el input tenga el texto completo
                    console.log('Demo: Input value is:', input.value)
                    
                    // Buscar específicamente el botón con el icono de enviar
                    const buttons = document.querySelectorAll('button')
                    let sendButton = null
                    
                    buttons.forEach(btn => {
                      // Buscar el SVG con la flecha hacia arriba (icono de enviar)
                      const svg = btn.querySelector('svg')
                      if (svg) {
                        const pathWithArrow = svg.querySelector('path[d*="M12 2L12 22"]') || 
                                             svg.querySelector('path[d*="M12 2L5 9"]')
                        if (pathWithArrow && !btn.disabled) {
                          sendButton = btn
                          console.log('Demo: Found send button with arrow icon')
                        }
                      }
                    })
                    
                    // Si no encontramos el botón con flecha, el estado no se actualizó
                    if (!sendButton) {
                      console.log('Demo: No send button found, forcing update')
                      
                      // Último intento: disparar manualmente el evento con tecla Enter
                      const enterEvent = new KeyboardEvent('keydown', {
                        key: 'Enter',
                        code: 'Enter',
                        keyCode: 13,
                        which: 13,
                        bubbles: true,
                        cancelable: true
                      })
                      
                      // Primero asegurarnos de que el input tiene el foco
                      input.focus()
                      
                      // Disparar el evento
                      input.dispatchEvent(enterEvent)
                      
                      // También intentar con keypress
                      const keypressEvent = new KeyboardEvent('keypress', {
                        key: 'Enter',
                        code: 'Enter',
                        keyCode: 13,
                        which: 13,
                        bubbles: true,
                        cancelable: true
                      })
                      input.dispatchEvent(keypressEvent)
                      
                      setTimeout(() => goToNextStep(), 2500)
                    } else {
                      // Si encontramos el botón, hacer click
                      sendButton.click()
                      console.log('Demo: Clicked send button')
                      setTimeout(() => goToNextStep(), 2500)
                    }
                  }, 2000) // Esperar 2 segundos completos para que React se actualice
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
            
            lastMessage.scrollIntoView({ behavior: 'smooth', block: 'center' })
            
            setTimeout(() => {
              lastMessage.setAttribute('data-demo-focus', '1')
              setHighlightElement('[data-demo-focus="1"]')
              
              setTooltipText(
                `A partir del texto o de una nota de voz, nuestra inteligencia artificial descompone lo que es importante ` +
                `y busca en <10" en los principales portales inmobiliarios, actualmente integrados Idealista, Fotocasa y ` +
                `Habitaclia, en proceso de sumar más.`
              )
            }, 500)
          }
        }, 1000)
        break

      case 'properties_carousel':
        setTimeout(() => {
          const carousel = document.querySelector('[data-demo="properties-carousel"]')
          if (carousel) {
            carousel.scrollIntoView({ behavior: 'smooth', block: 'center' })
            setHighlightElement('[data-demo="properties-carousel"]')
            setTooltipText('Explora las propiedades encontradas. Puedes deslizar para ver más opciones.')
          }
        }, 500)
        break

      case 'properties_scroll':
        const carousel = document.querySelector('[data-demo="properties-carousel"]')
        if (carousel) {
          setHighlightElement('[data-demo="properties-carousel"]')
          setTooltipText('Observa cómo puedes deslizar para ver más propiedades...')
          
          let scrollAmount = 0
          const scrollStep = 5
          const scrollInterval = setInterval(() => {
            carousel.scrollLeft += scrollStep
            scrollAmount += scrollStep
            
            if (scrollAmount >= 600) {
              clearInterval(scrollInterval)
              
              setTimeout(() => {
                const thirdProperty = carousel.children[2]
                if (thirdProperty) {
                  thirdProperty.setAttribute('data-demo-property', '1')
                  setHighlightElement('[data-demo-property="1"]')
                  setTooltipText('Haz clic en esta propiedad para ver todos los detalles')
                  
                  const handlePropertyClick = () => {
                    setTimeout(() => goToNextStep(), 500)
                    thirdProperty.removeEventListener('click', handlePropertyClick)
                  }
                  thirdProperty.addEventListener('click', handlePropertyClick)
                }
              }, 1000)
            }
          }, 20)
        }
        break

      case 'property_open':
        setTimeout(() => {
          setTooltipText('Aquí puedes ver todos los detalles de la propiedad: fotos, características, ubicación y más.')
          setTimeout(() => goToNextStep(), 3000)
        }, 1000)
        break

      case 'property_contact':
        setTimeout(() => {
          const contactSection = document.querySelector('[data-demo="contact-sales"]')
          if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
            setTimeout(() => {
              setHighlightElement('[data-demo="contact-sales"]')
              setTooltipText('Una vez encontramos el piso ideal, nuestro equipo de ventas se encarga de ponerse en contacto con la propiedad y realizar la intermediación.')
              setTimeout(() => goToNextStep(), 4000)
            }, 1000)
          }
        }, 500)
        break

      case 'property_street_view':
        setTimeout(() => {
          const streetViewButton = document.querySelector('[data-demo="street-view"]')
          if (streetViewButton) {
            streetViewButton.scrollIntoView({ behavior: 'smooth', block: 'center' })
            setTimeout(() => {
              setHighlightElement('[data-demo="street-view"]')
              setTooltipText('Explora los alrededores con Street View para conocer mejor el barrio')
              
              setTimeout(() => {
                streetViewButton.click()
                
                setTimeout(() => {
                  const closeButton = document.querySelector('[data-demo="close-street-view"]')
                  if (closeButton) closeButton.click()
                  goToNextStep()
                }, 3000)
              }, 2000)
            }, 1000)
          }
        }, 500)
        break

      case 'property_question':
        setTimeout(() => {
          const questionInput = document.querySelector('[data-demo="property-question-input"]')
          if (questionInput) {
            questionInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
            setTimeout(() => {
              setHighlightElement('[data-demo="property-question-bar"]')
              setTooltipText('Puedes hacer preguntas específicas sobre cualquier propiedad')
              
              const question = '¿Cuántos pisos similares a este en el mismo barrio valen menos en este momento?'
              let i = 0
              
              setTimeout(() => {
                const interval = setInterval(() => {
                  if (i <= question.length) {
                    questionInput.value = question.slice(0, i)
                    const event = new Event('input', { bubbles: true })
                    questionInput.dispatchEvent(event)
                    i++
                  } else {
                    clearInterval(interval)
                    
                    setTimeout(() => {
                      const sendButton = document.querySelector('[data-demo="send-property-question"]')
                      if (sendButton) {
                        sendButton.click()
                        setTimeout(() => goToNextStep(), 1000)
                      }
                    }, 500)
                  }
                }, 30)
              }, 2000)
            }, 1000)
          }
        }, 500)
        break

      case 'property_answer':
        setTimeout(() => {
          setTooltipText('Luci analiza el mercado en tiempo real y te da información actualizada')
          
          const responseContainer = document.querySelector('[data-demo="property-responses"]')
          if (responseContainer) {
            const response = document.createElement('div')
            response.className = 'p-3 bg-white border border-gray-200 rounded-lg mt-2'
            response.innerHTML = `
              <p class="text-sm text-gray-700">Actualmente solamente estos 2 pisos que te dejo a continuación están por debajo de este precio:</p>
              <div class="mt-2 space-y-2">
                <div class="p-2 bg-gray-50 rounded text-sm">• Piso en Calle Goya - 389.000€</div>
                <div class="p-2 bg-gray-50 rounded text-sm">• Piso en Calle Velázquez - 415.000€</div>
              </div>
            `
            responseContainer.appendChild(response)
          }
          
          setTimeout(() => {
            setTooltipText('¡Demo completado! Ya conoces todas las funcionalidades de Luci. ¿Listo para encontrar tu hogar ideal?')
          }, 3000)
        }, 1000)
        break

      default:
        break
    }
  }, [isDemoActive, currentStep, setHighlightElement, setTooltipText, goToNextStep, onStartApp])

  return null
}
