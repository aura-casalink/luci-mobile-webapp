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

    // Limpiar estado anterior
    setHighlightElement(null)
    setTooltipText('')

    switch(currentStep) {
      case 'landing_welcome':
        setTimeout(() => {
          setTooltipText('¡Bienvenido al tour de Luci! Usa las flechas del teclado (← →) o los botones para navegar.')
        }, 300)
        break

      case 'landing_scroll':
        const element = document.querySelector('[data-demo="skyscanner-section"]')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          setTimeout(() => {
            setHighlightElement('[data-demo="skyscanner-section"]')
            // TEXTO COMPLETO EXACTO
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
        setTooltipText('Ahora vamos a empezar tu búsqueda personalizada...')
        
        // Click INMEDIATO cuando llega a este paso
        const button = document.querySelector('[data-demo="start-button"]')
        if (button) {
          setTimeout(() => {
            button.click()
            if (onStartApp) onStartApp()
            setTimeout(() => goToNextStep(), 600)
          }, 500)
        }
        break

      case 'chat_type_message':
        const input = document.querySelector('[data-demo="chat-input"]')
        if (input) {
          setHighlightElement('[data-demo="chat-input"]')
          setTooltipText('Observa cómo escribimos tu búsqueda en lenguaje natural...')
          
          // Simular escritura
          const text = 'Un piso en Madrid, de al menos 3 habitaciones, en una zona cercana a un metro por menos de 450k€.'
          let i = 0
          
          setTimeout(() => {
            const interval = setInterval(() => {
              if (i <= text.length) {
                input.value = text.slice(0, i)
                input.dispatchEvent(new Event('input', { bubbles: true }))
                i++
              } else {
                clearInterval(interval)
                
                // Simular envío del mensaje
                setTimeout(() => {
                  const sendButton = document.querySelector('[data-demo="send-button"]')
                  if (sendButton) {
                    sendButton.click()
                  }
                  setTimeout(() => goToNextStep(), 1500)
                }, 500)
              }
            }, 30)
          }, 1000)
        }
        break

      case 'chat_show_explanation':
        // Resaltar SOLO el último mensaje del usuario
        setTimeout(() => {
          const userMessages = document.querySelectorAll('[data-demo="chat-message"].from-user')
          if (userMessages.length) {
            const lastMessage = userMessages[userMessages.length - 1]
            lastMessage.setAttribute('data-demo-focus', '1')
            setHighlightElement('[data-demo-focus="1"]')
            
            setTooltipText(
              `A partir del texto o de una nota de voz, nuestra inteligencia artificial descompone lo que es importante ` +
              `y busca en <10" en los principales portales inmobiliarios, actualmente integrados Idealista, Fotocasa y ` +
              `Habitaclia, en proceso de sumar más.`
            )
          }
        }, 500)
        break

      case 'properties_carousel':
        setHighlightElement('[data-demo="properties-carousel"]')
        setTooltipText('Explora las propiedades encontradas. Puedes desliz
