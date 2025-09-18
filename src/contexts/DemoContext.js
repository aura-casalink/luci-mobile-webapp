'use client'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const DemoContext = createContext()

export const DEMO_STEPS = [
  'landing_welcome',
  'landing_scroll',
  'landing_click_start', 
  'chat_type_message',
  'chat_show_explanation',
  'properties_carousel'
]

export function DemoProvider({ children }) {
  const [isDemoActive, setIsDemoActive] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [highlightElement, setHighlightElement] = useState(null)
  const [tooltipText, setTooltipText] = useState('')

  // Activación automática por URL o localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const params = new URLSearchParams(window.location.search)
    const fromQuery = params.get('demo') === '1'
    const fromStorage = window.localStorage.getItem('demoMode') === '1'
    
    if (fromQuery || fromStorage) {
      setIsDemoActive(true)
      setCurrentStepIndex(0)
      
      // Guardar en localStorage para persistir
      if (fromQuery) {
        window.localStorage.setItem('demoMode', '1')
      }
    }
  }, [])

  const startDemo = useCallback(() => {
    setIsDemoActive(true)
    setCurrentStepIndex(0)
    
    // Persistir en localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('demoMode', '1')
      
      // Agregar param a URL sin recargar
      const url = new URL(window.location)
      url.searchParams.set('demo', '1')
      window.history.pushState({}, '', url)
    }
  }, [])

  const endDemo = useCallback(() => {
    setIsDemoActive(false)
    setCurrentStepIndex(0)
    setHighlightElement(null)
    setTooltipText('')
    
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('demoMode')
      
      // Remover param de URL
      const url = new URL(window.location)
      url.searchParams.delete('demo')
      window.history.pushState({}, '', url)
    }
  }, [])

  const goToNextStep = useCallback(() => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
    }
  }, [currentStepIndex])

  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }, [currentStepIndex])

  const value = {
    isDemoActive,
    currentStep: DEMO_STEPS[currentStepIndex],
    currentStepIndex,
    totalSteps: DEMO_STEPS.length,
    startDemo,
    endDemo,
    goToNextStep,
    goToPreviousStep,
    canGoNext: currentStepIndex < DEMO_STEPS.length - 1,
    canGoPrevious: currentStepIndex > 0,
    highlightElement,
    setHighlightElement,
    tooltipText,
    setTooltipText
  }

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export const useDemo = () => {
  const context = useContext(DemoContext)
  if (!context) throw new Error('useDemo must be used within DemoProvider')
  return context
}
