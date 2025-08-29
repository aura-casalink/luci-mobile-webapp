// src/components/landing/LandingPage.jsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, MessageCircle, MapPin, Heart, Sparkles } from 'lucide-react'

export default function LandingPage({ onStart }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [nextVideoIndex, setNextVideoIndex] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [typingText, setTypingText] = useState('')
  const videoRef = useRef(null)
  const nextVideoRef = useRef(null)

  // URLs de los videos
  const videoUrls = [
    'https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_zfdde9dc5a5fcebd59d8b0816_f11505e1bf52ca8bf_d20250829_m101203_c003_v0312011_t0001_u01756462323449',
    'https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_zfdde9dc5a5fcebd59d8b0816_f10786c5589addc06_d20250829_m101202_c003_v0312023_t0017_u01756462322190',
    'https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_zfdde9dc5a5fcebd59d8b0816_f113c8b81c434542a_d20250829_m101158_c003_v0312013_t0004_u01756462318863'
  ]

  useEffect(() => {
    setIsVisible(true)
    
    // Efecto typing para "más rápido"
    const text = 'más rápido'
    let index = 0
    const timer = setInterval(() => {
      if (index <= text.length) {
        setTypingText(text.slice(0, index))
        index++
      } else {
        clearInterval(timer)
      }
    }, 100)
    
    return () => clearInterval(timer)
  }, [])

  // Manejar la rotación de videos con transición suave
  useEffect(() => {
    const handleVideoEnd = () => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentVideoIndex((prev) => (prev + 1) % videoUrls.length)
        setNextVideoIndex((prev) => (prev + 1) % videoUrls.length)
        setIsTransitioning(false)
      }, 500)
    }

    const video = videoRef.current
    if (video) {
      video.addEventListener('ended', handleVideoEnd)
      return () => video.removeEventListener('ended', handleVideoEnd)
    }
  }, [currentVideoIndex, videoUrls.length])

  const slides = [
    {
      icon: <MessageCircle className="w-6 h-6 md:w-8 md:h-8" style={{ color: '#FFB300' }} />,
      title: "Chatea con AURA",
      description: "Habla con nuestra IA y te traeremos resultados personalizados directamente en la conversación."
    },
    {
      icon: <Sparkles className="w-6 h-6 md:w-8 md:h-8" style={{ color: '#FFB300' }} />,
      title: "Insights inteligentes",
      description: "Pulsa en los resultados para obtener análisis profundos y ajustar tus criterios de búsqueda."
    },
    {
      icon: <Heart className="w-6 h-6 md:w-8 md:h-8" style={{ color: '#FFB300' }} />,
      title: "Guarda tus favoritos",
      description: "Marca las propiedades que más te gusten y accede a ellas cuando quieras."
    },
    {
      icon: <MapPin className="w-6 h-6 md:w-8 md:h-8" style={{ color: '#FFB300' }} />,
      title: "Explora el mapa",
      description: "Descubre propiedades exclusivas y navega por el mapa interactivo."
    }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const scrollToFeatures = () => {
    document.getElementById('features-section').scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen overflow-hidden" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6">
        <div className="flex items-center">
          <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#FFB300' }}>
            AURA
          </h1>
        </div>
      </header>

      {/* Hero Section - ULTRA COMPACTO PARA MÓVIL */}
      <section className="relative h-screen flex flex-col justify-center px-4 md:px-6">
        {/* Video Background - SIN FILTROS PARA MÁXIMA VISIBILIDAD */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            ref={videoRef}
            key={`current-${currentVideoIndex}`}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
            style={{ 
              opacity: isTransitioning ? 0 : 1
            }}
          >
            <source src={videoUrls[currentVideoIndex]} type="video/mp4" />
          </video>
          
          <video
            ref={nextVideoRef}
            key={`next-${nextVideoIndex}`}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ 
              opacity: isTransitioning ? 1 : 0
            }}
          >
            <source src={videoUrls[nextVideoIndex]} type="video/mp4" />
          </video>
          
          {/* Overlay mínimo solo para legibilidad */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'rgba(250, 250, 250, 0.15)'
            }}
          ></div>
        </div>

        {/* Hero Content - SUPER COMPACTO */}
        <div className={`relative z-10 w-full max-w-6xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-left">
            {/* Título más pequeño en móvil */}
            <h2 className="text-3xl md:text-6xl font-bold mb-1 md:mb-3 leading-none" style={{ color: '#0A0A23' }}>
              Encuentra tu casa
              <span className="block" style={{ color: '#0A0A23' }}>
                <span 
                  className="inline-block px-2 md:px-3 rounded-md text-2xl md:text-5xl"
                  style={{ 
                    backgroundColor: '#FFB300',
                    padding: '2px 8px'
                  }}
                >
                  {typingText}!
                </span>
              </span>
            </h2>
            
            {/* Subtítulo más pequeño */}
            <p className="text-sm md:text-xl mb-3 md:mb-6 max-w-2xl leading-tight" style={{ color: '#0A0A23' }}>
              Bienvenido al <span className="font-bold">Skyscanner de pisos</span> en España, 
              con IA que no existe en otras plataformas.
            </p>

            {/* Botón más compacto */}
            <button
              onClick={onStart}
              className="inline-flex items-center justify-center px-6 md:px-8 py-2.5 md:py-4 text-base md:text-lg font-bold rounded-full mb-3 md:mb-8"
              style={{ 
                backgroundColor: '#FFB300',
                color: '#0A0A23',
                boxShadow: '0 4px 12px rgba(255, 179, 0, 0.2)'
              }}
            >
              Comenzar a buscar
            </button>

            {/* Contenido adicional ultra compacto */}
            <div className="space-y-2 md:space-y-4 max-w-2xl">
              <p className="text-xs md:text-base leading-tight" style={{ color: '#0A0A23', opacity: 0.85 }}>
                Sabemos qué zonas son mejores y te devolvemos tu tiempo.
              </p>

              <div 
                className="p-2.5 md:p-5"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  border: '2px solid #FFB300',
                  borderRadius: '16px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}
              >
                <p className="text-xs md:text-base leading-tight" style={{ color: '#0A0A23' }}>
                  <span className="font-bold">Una vez encontrada tu casa</span>: 
                  reforma, revisión legal, financiación.
                  Todo en un único lugar.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator más pequeño y arriba */}
        <div className="absolute bottom-2 md:bottom-8 left-1/2 transform -translate-x-1/2">
          <button 
            onClick={scrollToFeatures}
            className="flex flex-col items-center p-1"
            style={{ color: '#0A0A23' }}
          >
            <span className="text-xs md:text-sm font-semibold">Saber más</span>
            <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </section>

      {/* Features Section - También más compacta */}
      <section id="features-section" className="relative py-12 md:py-20 px-4 md:px-6" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12" style={{ color: '#0A0A23' }}>
            ¿Cómo funciona?
          </h3>

          {/* Mobile Carousel */}
          <div className="md:hidden relative">
            <div 
              className="p-6 shadow-lg"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '2px solid #FFB300',
                borderRadius: '16px'
              }}
            >
              <div className="flex items-start space-x-3">
                {slides[currentSlide].icon}
                <div className="flex-1">
                  <h4 className="text-base font-semibold mb-1" style={{ color: '#0A0A23' }}>
                    {currentSlide + 1}. {slides[currentSlide].title}
                  </h4>
                  <p className="text-xs leading-tight" style={{ color: '#0A0A23', opacity: 0.7 }}>
                    {slides[currentSlide].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Carousel Controls */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={prevSlide}
                className="p-2 rounded-full"
                style={{ 
                  backgroundColor: 'rgba(255, 179, 0, 0.15)',
                  color: '#FFB300'
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex space-x-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: index === currentSlide ? '24px' : '6px',
                      backgroundColor: index === currentSlide ? '#FFB300' : 'rgba(10, 10, 35, 0.2)'
                    }}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="p-2 rounded-full"
                style={{ 
                  backgroundColor: 'rgba(255, 179, 0, 0.15)',
                  color: '#FFB300'
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {slides.map((slide, index) => (
              <div 
                key={index}
                className="p-6 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '2px solid #FFB300',
                  borderRadius: '20px'
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    {slide.icon}
                  </div>
                  <h4 className="text-lg font-semibold mb-2" style={{ color: '#0A0A23' }}>
                    {index + 1}. {slide.title}
                  </h4>
                  <p className="text-sm" style={{ color: '#0A0A23', opacity: 0.7 }}>
                    {slide.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative py-12 md:py-20 px-4 md:px-6" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4" style={{ color: '#0A0A23' }}>
            ¿Listo para encontrar tu hogar?
          </h3>
          <p className="mb-6 md:mb-8 text-sm md:text-lg" style={{ color: '#0A0A23', opacity: 0.8 }}>
            Únete a miles de personas que ya encontraron su casa ideal con AURA
          </p>
          <button
            onClick={onStart}
            className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-full"
            style={{ 
              backgroundColor: '#FFB300',
              color: '#0A0A23',
              boxShadow: '0 8px 20px rgba(255, 179, 0, 0.25)'
            }}
          >
            Empezar ahora
          </button>
        </div>
      </section>
    </div>
  )
}
