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

  // Calcular highlight
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
      }
    } else {
      setHighlightBox(null)
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
      {/* Overlay negro */}
      <div 
        className="fixed inset-0 z-[100000] pointer-events-none"
        style={{ 
          background: 'rgba(0, 0, 0, 0.7)',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      />
      
      {/* Highlight GOLD #D4AF37 */}
      {highlightBox && (
        <div
          className="fixed rounded-lg z-[100001] pointer-events-none"
          style={{
            top: `${highlightBox.top}px`,
            left: `${highlightBox.left}px`,
            width: `${highlightBox.width}px`,
            height: `${highlightBox.height}px`,
            outline: '4px solid #D4AF37',
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.7), 0 10px 30px rgba(0,0,0,0.35)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      )}

      {/* Tooltip handwritten */}
      {tooltipText && isVisible && (
        <div 
          className="fixed z-[100002] max-w-2xl p-6 bg-white rounded-2xl shadow-2xl"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontFamily: '"Caveat", cursive',
            fontSize: '1.5rem',
            lineHeight: '1.4',
            color: '#0A0A23',
            whiteSpace: 'pre-wrap'
          }}
        >
          {tooltipText}
        </div>
      )}

      {/* Flechas navegación */}
      <div className="fixed bottom-8 right-8 z-[100003] flex items-center gap-3 pointer-events-auto">
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
