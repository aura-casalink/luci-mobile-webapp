'use client'
import { useEffect, useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useDemo } from '@/contexts/DemoContext'

export default function DemoOverlay() {
  const { 
    isDemoActive, 
    currentStepIndex,
    totalSteps,
    goToNextStep,
    goToPreviousStep,
    endDemo,
    canGoNext,
    canGoPrevious,
    highlightElement,
    tooltipText
  } = useDemo()
  
  const [highlightBox, setHighlightBox] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ bottom: '120px' })
  const updateIntervalRef = useRef(null)

  // Soporte teclado
  useEffect(() => {
    if (!isDemoActive) return

    const onKey = (e) => {
      if (e.key === 'ArrowRight' && canGoNext) goToNextStep()
      if (e.key === 'ArrowLeft' && canGoPrevious) goToPreviousStep()
      if (e.key === 'Escape') endDemo()
    }
    
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isDemoActive, canGoNext, canGoPrevious, goToNextStep, goToPreviousStep, endDemo])

  // Actualizar highlight continuamente para elementos que se mueven
  useEffect(() => {
    // Limpiar intervalo anterior
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current)
      updateIntervalRef.current = null
    }

    if (highlightElement && isDemoActive) {
      const updateHighlight = () => {
        const element = document.querySelector(highlightElement)
        if (element) {
          const rect = element.getBoundingClientRect()
          setHighlightBox({
            top: rect.top - 8,
            left: rect.left - 8,
            width: rect.width + 16,
            height: rect.height + 16
          })
          
          // Ajustar posición del tooltip según el paso
          switch(currentStepIndex) {
            case 1: // landing_scroll
              setTooltipPosition({
                bottom: `${window.innerHeight - rect.top + 20}px`,
                left: '5%',
                right: '5%'
              })
              break
            case 2: // landing_click_start
              setTooltipPosition({
                top: '20%',
                left: '5%',
                right: '5%'
              })
              break
            case 3: // chat_type_message
              setTooltipPosition({
                bottom: `${window.innerHeight - rect.top + 20}px`,
                left: '5%',
                right: '5%'
              })
              break
            case 4: // chat_show_explanation - Actualización continua para seguir el scroll
              setTooltipPosition({ 
                bottom: '120px',
                left: '5%',
                right: '5%'
              })
              break
            default:
              setTooltipPosition({ 
                bottom: '120px',
                left: '5%',
                right: '5%'
              })
          }
        }
      }

      // Actualizar inmediatamente
      updateHighlight()

      // Para el paso 4 (chat_show_explanation), actualizar continuamente
      if (currentStepIndex === 4) {
        updateIntervalRef.current = setInterval(updateHighlight, 100)
      }
    } else {
      setHighlightBox(null)
      setTooltipPosition({ bottom: '120px', left: '5%', right: '5%' })
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }
    }
  }, [highlightElement, isDemoActive, currentStepIndex])

  // Fade in
  useEffect(() => {
    if (isDemoActive) {
      setTimeout(() => setIsVisible(true), 50)
    } else {
      setIsVisible(false)
    }
  }, [isDemoActive])

  if (!isDemoActive) return null

  return (
    <>
      {/* Solo el borde dorado alrededor del elemento destacado */}
      {highlightBox && (
        <div
          className="fixed rounded-lg z-[100002] pointer-events-none"
          style={{
            top: `${highlightBox.top}px`,
            left: `${highlightBox.left}px`,
            width: `${highlightBox.width}px`,
            height: `${highlightBox.height}px`,
            border: '4px solid #D4AF37',
            boxShadow: '0 0 30px rgba(212, 175, 55, 0.8), 0 0 60px rgba(212, 175, 55, 0.4)',
            transition: currentStepIndex === 4 ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      )}

      {/* Tooltip con fondo */}
      {tooltipText && isVisible && (
        <div 
          className="fixed z-[100004]"
          style={{
            ...tooltipPosition,
            fontFamily: '"Caveat", cursive',
            fontSize: window.innerWidth < 768 ? '1.5rem' : '1.8rem',
            lineHeight: '1.3',
            color: '#FFFFFF',
            backgroundColor: 'rgba(10, 10, 35, 0.95)',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            whiteSpace: 'pre-wrap',
            padding: window.innerWidth < 768 ? '1.25rem' : '1.5rem',
            borderRadius: '20px',
            border: '2px solid #D4AF37',
            boxShadow: '0 10px 40px rgba(0,0,0,0.4), 0 0 60px rgba(212, 175, 55, 0.2)',
            maxHeight: '45vh',
            overflowY: 'auto'
          }}
        >
          {tooltipText}
        </div>
      )}

      {/* Flechas navegación */}
      <div className="fixed bottom-8 right-8 z-[100005] flex items-center gap-3 pointer-events-auto">
        <div className="bg-white rounded-full px-4 py-2 shadow-lg">
          <span className="text-sm font-medium text-gray-700">
            {currentStepIndex + 1} / {totalSteps}
          </span>
        </div>

        <button
          onClick={goToPreviousStep}
          disabled={!canGoPrevious}
          className={`w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center transition-all ${
            canGoPrevious ? 'hover:scale-110 cursor-pointer' : 'opacity-50 cursor-not-allowed'
          }`}
          aria-label="Anterior (←)"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </button>

        <button
          onClick={goToNextStep}
          disabled={!canGoNext}
          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${
            canGoNext ? 'hover:scale-110 cursor-pointer' : 'opacity-50 cursor-not-allowed'
          }`}
          style={{ backgroundColor: canGoNext ? '#D4AF37' : '#ccc' }}
          aria-label="Siguiente (→)"
        >
          <ChevronRight size={24} className="text-white" />
        </button>

        <button
          onClick={endDemo}
          className="w-12 h-12 rounded-full bg-red-500 shadow-lg flex items-center justify-center hover:bg-red-600 hover:scale-110 transition-all ml-2"
          aria-label="Cerrar (Esc)"
        >
          <X size={20} className="text-white" />
        </button>
      </div>
    </>
  )
}
