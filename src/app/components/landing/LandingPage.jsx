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

  // URLs de los videos en Cloudinary
  const videoUrls = [
    'https://res.cloudinary.com/dr3mimpok/video/upload/v1756467936/14214170_2160_3840_30fps_1_qeyxsm.mp4',
    'https://res.cloudinary.com/dr3mimpok/video/upload/v1756468041/13657669_1080_1920_30fps_1_lbpwji.mp4',
    'https://res.cloudinary.com/dr3mimpok/video/upload/v1756468039/13622414_1080_1920_30fps_sfhqcc.mov'
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
      icon: <MessageCircle className="w-8 h-8" style={{ color: '#FFB300' }} />,
      title: "Chatea con AURA",
      description: "Habla con nuestra IA y te traeremos resultados personalizados directamente en la conversación. Sin formularios, sin complicaciones."
    },
    {
      icon: <Sparkles className="w-8 h-8" style={{ color: '#FFB300' }} />,
      title: "Insights inteligentes",
      description: "Pulsa en los resultados para obtener análisis profundos y ajustar tus criterios de búsqueda en tiempo real."
    },
    {
      icon: <Heart className="w-8 h-8" style={{ color: '#FFB300' }} />,
      title: "Guarda tus favoritos",
      description: "Marca las propiedades que más te gusten y accede a ellas cuando quieras. Tu lista personal siempre a mano."
    },
    {
      icon: <MapPin className="w-8 h-8" style={{ color: '#FFB300' }} />,
      title: "Explora el mapa",
      description: "Descubre propiedades exclusivas, nuestras sugerencias personalizadas y navega por el mapa interactivo."
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

      {/* Hero Section - PADDING TOP REDUCIDO para móvil */}
      <section className="relative min-h-screen flex flex-col justify-center px-4 md:px-6 pt-12 md:pt-20 pb-20">
        {/* Video Background - SIN OVERLAY O OVERLAY OSCURO PARA CONTRASTE */}
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
          
          {/* Overlay OSCURO semi-transparente para mejor contraste con texto */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'rgba(0, 0, 0, 0.3)' // Overlay oscuro en lugar de blanco
            }}
          ></div>
        </div>

        {/* Hero Content - Espacios normales */}
        <div className={`relative z-10 w-full max-w-6xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-left">
            <h2 className="text-4xl md:text-7xl font-bold mb-4 leading-tight" style={{ color: '#FAFAFA' }}>
              Encuentra tu casa
              <span className="block mt-2" style={{ color: '#FAFAFA' }}>
                <span 
                  className="inline-block px-3 py-1 rounded-lg text-3xl md:text-6xl"
                  style={{ 
                    backgroundColor: '#FFB300',
                    color: '#0A0A23'
                  }}
                >
                  {typingText}
                  <span className="animate-pulse">|</span>
                </span>
              </span>
            </h2>
            
            <p className="text-base md:text-2xl mb-6 md:mb-8 max-w-2xl" style={{ color: '#FAFAFA' }}>
              Bienvenido al <span style={{ color: '#FFB300' }} className="font-bold">Skyscanner de pisos</span> en España, 
              con filtros avanzados con IA que no existen en otras plataformas.
            </p>

            <button
              onClick={onStart}
              className="group relative inline-flex items-center justify-center px-8 md:px-10 py-4 md:py-5 text-lg md:text-xl font-bold rounded-full overflow-hidden transition-all duration-300 hover:scale-105 mb-8 md:mb-12"
              style={{ 
                backgroundColor: '#FFB300',
                color: '#0A0A23',
                boxShadow: '0 10px 30px rgba(255, 179, 0, 0.3)'
              }}
            >
              <span className="relative z-10">Comenzar a buscar</span>
            </button>

            {/* Contenido adicional */}
            <div className="space-y-4 md:space-y-6 max-w-2xl">
              <p className="text-sm md:text-lg" style={{ color: '#FAFAFA', opacity: 0.9 }}>
                Sabemos qué zonas son mejores, qué terraza es la más grande, 
                y te devolvemos tu tiempo para lo que importa.
              </p>

              <div 
                className="backdrop-blur-sm p-4 md:p-6"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '2px solid #FFB300',
                  borderRadius: '24px 24px 32px 32px',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)'
                }}
              >
                <p className="text-sm md:text-lg" style={{ color: '#0A0A23' }}>
                  <span style={{ color: '#0A0A23' }} className="font-bold">Una vez encontrada tu casa</span>, 
                  ofrecemos paquetes de servicios completos: 
                  <span style={{ color: '#0A0A23', fontWeight: '600' }}> reforma, revisión legal, financiación</span>. 
                  Todo en un único lugar.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 md:bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <button 
            onClick={scrollToFeatures}
            className="flex flex-col items-center transition-colors"
            style={{ color: '#FAFAFA' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FFB300'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#FAFAFA'}
          >
            <span className="text-sm mb-2 font-semibold">Saber más</span>
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="relative py-20 px-6" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: '#0A0A23' }}>
            ¿Cómo funciona?
          </h3>

          {/* Mobile Carousel */}
          <div className="md:hidden relative">
            <div 
              className="backdrop-blur-sm p-8 shadow-lg"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '2px solid #FFB300',
                borderRadius: '20px 20px 28px 28px'
              }}
            >
              <div className="flex items-start space-x-4 mb-4">
                {slides[currentSlide].icon}
                <div className="flex-1">
                  <h4 className="text-xl font-semibold mb-2" style={{ color: '#0A0A23' }}>
                    {currentSlide + 1}. {slides[currentSlide].title}
                  </h4>
                  <p style={{ color: '#0A0A23', opacity: 0.7 }}>
                    {slides[currentSlide].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Carousel Controls */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={prevSlide}
                className="p-2 rounded-full transition-all"
                style={{ 
                  backgroundColor: 'rgba(255, 179, 0, 0.15)',
                  color: '#FFB300'
                }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex space-x-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: index === currentSlide ? '32px' : '8px',
                      backgroundColor: index === currentSlide ? '#FFB300' : 'rgba(10, 10, 35, 0.2)'
                    }}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="p-2 rounded-full transition-all"
                style={{ 
                  backgroundColor: 'rgba(255, 179, 0, 0.15)',
                  color: '#FFB300'
                }}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {slides.map((slide, index) => (
              <div 
                key={index}
                className="backdrop-blur-sm p-6 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '2px solid #FFB300',
                  borderRadius: '20px 20px 28px 28px'
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
      <section className="relative py-20 px-6" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4" style={{ color: '#0A0A23' }}>
            ¿Listo para encontrar tu hogar?
          </h3>
          <p className="mb-8 text-lg" style={{ color: '#0A0A23', opacity: 0.8 }}>
            Únete a miles de personas que ya encontraron su casa ideal con AURA
          </p>
          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-full overflow-hidden transition-all duration-300"
            style={{ 
              backgroundColor: '#FFB300',
              color: '#0A0A23',
              boxShadow: '0 10px 30px rgba(255, 179, 0, 0.25)'
            }}
          >
            <span className="relative z-10 font-semibold">Empezar ahora</span>
          </button>
        </div>
      </section>
    </div>
  )
}
