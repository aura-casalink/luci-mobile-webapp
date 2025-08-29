// src/components/landing/LandingPage.jsx (o src/app/components/landing/LandingPage.jsx según tu estructura)
'use client'
import { useState, useEffect, useRef } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, MessageCircle, MapPin, Heart, Sparkles } from 'lucide-react'

export default function LandingPage({ onStart }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const videoRef = useRef(null)

  // URLs de los videos
  const videoUrls = [
    'https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_zfdde9dc5a5fcebd59d8b0816_f11505e1bf52ca8bf_d20250829_m101203_c003_v0312011_t0001_u01756462323449',
    'https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_zfdde9dc5a5fcebd59d8b0816_f10786c5589addc06_d20250829_m101202_c003_v0312023_t0017_u01756462322190',
    'https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_zfdde9dc5a5fcebd59d8b0816_f113c8b81c434542a_d20250829_m101158_c003_v0312013_t0004_u01756462318863'
  ]

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Manejar la rotación de videos
  useEffect(() => {
    const handleVideoEnd = () => {
      setCurrentVideoIndex((prev) => (prev + 1) % videoUrls.length)
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
      <header className="absolute top-0 left-0 right-0 z-20 p-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold" style={{ color: '#FFB300' }}>
            AURA
          </h1>
        </div>
      </header>

      {/* Hero Section con video de fondo */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pb-20">
        {/* Video Background */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            ref={videoRef}
            key={currentVideoIndex}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ 
              filter: 'brightness(0.7) contrast(0.9)',
              opacity: 0.9
            }}
          >
            <source src={videoUrls[currentVideoIndex]} type="video/mp4" />
          </video>
          
          {/* Overlay gradiente sutil */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(250, 250, 250, 0.75) 0%, rgba(250, 250, 250, 0.6) 50%, rgba(250, 250, 250, 0.75) 100%)'
            }}
          ></div>
          
          {/* Grid pattern overlay sutil */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(to right, #0A0A23 1px, transparent 1px), linear-gradient(to bottom, #0A0A23 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          ></div>
        </div>

        {/* Hero Content */}
        <div className={`relative z-10 text-center max-w-3xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight" style={{ color: '#0A0A23' }}>
            Encuentra tu casa
            <span className="block" style={{ color: '#FFB300' }}>
              más rápido
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl mb-8 leading-relaxed" style={{ color: '#0A0A23' }}>
            Somos el <span style={{ color: '#FFB300' }} className="font-semibold">primer buscador en España</span> con filtros avanzados por IA.
            <br className="hidden md:block" />
            <span className="text-lg block mt-2" style={{ color: '#0A0A23', opacity: 0.8 }}>
              Sabemos qué zonas son mejores, qué terraza es la más grande, 
              y te devolvemos tu tiempo para lo que importa.
            </span>
          </p>

          <div 
            className="backdrop-blur-sm p-6 mb-8"
            style={{ 
              backgroundColor: 'rgba(255, 179, 0, 0.08)',
              border: '1px solid rgba(255, 179, 0, 0.3)',
              borderRadius: '24px 24px 32px 32px'
            }}
          >
            <p className="text-lg" style={{ color: '#0A0A23' }}>
              <span style={{ color: '#FFB300' }} className="font-semibold">Una vez encontrada tu casa</span>, 
              ofrecemos paquetes de servicios completos: 
              <span style={{ color: '#FFB300' }}> reforma, revisión legal, financiación</span>. 
              Todo en un único lugar.
            </p>
          </div>

          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-full overflow-hidden transition-all duration-300 hover:scale-105"
            style={{ 
              backgroundColor: '#FFB300',
              color: '#0A0A23',
              boxShadow: '0 10px 30px rgba(255, 179, 0, 0.25)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(255, 179, 0, 0.4)'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 179, 0, 0.25)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <span className="relative z-10 font-semibold">Comenzar a buscar</span>
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <button 
            onClick={scrollToFeatures}
            className="flex flex-col items-center transition-colors"
            style={{ color: '#0A0A23' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FFB300'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#0A0A23'}
          >
            <span className="text-sm mb-2">Saber más</span>
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="relative py-20 px-6" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: '#FFB300' }}>
            ¿Cómo funciona?
          </h3>

          {/* Mobile Carousel */}
          <div className="md:hidden relative">
            <div 
              className="backdrop-blur-sm p-8 shadow-lg"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(255, 179, 0, 0.2)',
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
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 179, 0, 0.25)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 179, 0, 0.15)'}
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
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 179, 0, 0.25)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 179, 0, 0.15)'}
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
                  border: '1px solid rgba(255, 179, 0, 0.2)',
                  borderRadius: '20px 20px 28px 28px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)'
                  e.currentTarget.style.borderColor = 'rgba(255, 179, 0, 0.4)'
                  e.currentTarget.style.transform = 'scale(1.05) translateY(-4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)'
                  e.currentTarget.style.borderColor = 'rgba(255, 179, 0, 0.2)'
                  e.currentTarget.style.transform = 'scale(1) translateY(0)'
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
          <h3 className="text-3xl font-bold mb-4" style={{ color: '#FFB300' }}>
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
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(255, 179, 0, 0.4)'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 179, 0, 0.25)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <span className="relative z-10 font-semibold">Empezar ahora</span>
          </button>
        </div>
      </section>
    </div>
  )
}
