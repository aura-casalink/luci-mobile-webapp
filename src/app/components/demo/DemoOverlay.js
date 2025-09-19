'use client'
import { useEffect, useState } from 'react'
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

  // Calcular highlight y aplicar z-index al elemento
  useEffect(() => {
    if (highlightElement && isDemoActive) {
      const element = document.querySelector(highlightElement)
      if (element) {
        const rect = element.getBoundingClientRect()
        setHighlightBox({
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16
        })
        
        // Hacer que el elemento resaltado esté por encima del overlay
        element.style.position = 'relative'
        element.style.zIndex = '100002'
      }
    } else {
      // Limpiar z-index cuando no hay highlight
      if (highlightElement) {
        const oldElement = document.querySelector(highlightElement)
        if (oldElement) {
          oldElement.style.position = ''
          oldElement.style.zIndex = ''
        }
      }
      setHighlightBox(null)
    }
    
    // Cleanup function
    return () => {
      if (highlightElement) {
        const element = document.querySelector(highlightElement)
        if (element) {
          element.style.position = ''
          element.style.zIndex = ''
        }
      }
    }
  }, [highlightElement, isDemoActive])

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
      {/* Overlay negro MÁS OSCURO */}
      <div 
        className="fixed inset-0 z-[100000] pointer-events-none"
        style={{ 
          background: 'rgba(0, 0, 0, 0.85)', // Más oscuro: 0.85 en lugar de 0.7
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      />
      
      {/* Recorte para el highlight - crea un "agujero" en el overlay */}
      {highlightBox && (
        <>
          {/* Overlay con máscara SVG para crear el agujero */}
          <svg
            className="fixed inset-0 z-[100001] pointer-events-none"
            style={{ width: '100%', height: '100%' }}
          >
            <defs>
              <mask id="highlight-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                <rect
                  x={highlightBox.left}
                  y={highlightBox.top}
                  width={highlightBox.width}
                  height={highlightBox.height}
                  rx="8"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.85)"
              mask="url(#highlight-mask)"
            />
          </svg>
          
          {/* Borde dorado alrededor del elemento */}
          <div
            className="fixed rounded-lg z-[100002] pointer-events-none"
            style={{
              top: `${highlightBox.top}px`,
              left: `${highlightBox.left}px`,
              width: `${highlightBox.width}px`,
              height: `${highlightBox.height}px`,
              border: '4px solid #D4AF37',
              boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        </>
      )}

      {/* Tooltip handwritten - CERCA DE LAS FLECHAS Y MÁS ANCHO */}
      {tooltipText && isVisible && (
        <div 
          className="fixed z-[100004] px-4"
          style={{
            bottom: '120px', // Justo encima de las flechas de navegación
            left: '50%',
            transform: 'translateX(-50%)',
            width: window.innerWidth < 768 ? '90%' : '70%', // Más ancho
            maxWidth: '800px',
            fontFamily: '"Caveat", cursive',
            fontSize: window.innerWidth < 768 ? '1.4rem' : '1.8rem',
            lineHeight: '1.4',
            color: '#FFFFFF',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semitransparente para mejor legibilidad
            textShadow: '0 2px 10px rgba(0,0,0,0.9)',
            whiteSpace: 'pre-wrap',
            padding: '1.5rem',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxHeight: '40vh',
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
