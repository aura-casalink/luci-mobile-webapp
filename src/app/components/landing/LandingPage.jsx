// src/components/landing/LandingPage.jsx
'use client'
import { useState, useEffect } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, MessageCircle, MapPin, Heart, Sparkles } from 'lucide-react'

export default function LandingPage({ onStart }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const slides = [
    {
      icon: <MessageCircle className="w-8 h-8 text-purple-500" />,
      title: "Chatea con AURA",
      description: "Habla con nuestra IA y te traeremos resultados personalizados directamente en la conversación. Sin formularios, sin complicaciones."
    },
    {
      icon: <Sparkles className="w-8 h-8 text-purple-500" />,
      title: "Insights inteligentes",
      description: "Pulsa en los resultados para obtener análisis profundos y ajustar tus criterios de búsqueda en tiempo real."
    },
    {
      icon: <Heart className="w-8 h-8 text-purple-500" />,
      title: "Guarda tus favoritos",
      description: "Marca las propiedades que más te gusten y accede a ellas cuando quieras. Tu lista personal siempre a mano."
    },
    {
      icon: <MapPin className="w-8 h-8 text-purple-500" />,
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 text-white overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 p-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            AURA
          </h1>
        </div>
      </header>

      {/* Hero Section con animación de fondo */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pb-20">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-pink-600/20"></div>
          
          {/* Animated gradient orbs */}
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          
          {/* Grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          ></div>

          {/* Floating house icons */}
          <div className="absolute inset-0">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${20 + i * 10}%`,
                  animationDelay: `${i * 0.5}s`
                }}
              >
                <div className="text-white/10 text-4xl">🏠</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Content */}
        <div className={`relative z-10 text-center max-w-3xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Encuentra tu casa
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              más rápido
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Somos el <span className="text-purple-400 font-semibold">primer buscador en España</span> con filtros avanzados por IA.
            <br className="hidden md:block" />
            <span className="text-lg block mt-2">
              Sabemos qué zonas son mejores, qué terraza es la más grande, 
              y te devolvemos tu tiempo para lo que importa.
            </span>
          </p>

          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-purple-500/20">
            <p className="text-gray-200 text-lg">
              <span className="text-purple-400 font-semibold">Una vez encontrada tu casa</span>, 
              ofrecemos paquetes de servicios completos: 
              <span className="text-pink-400"> reforma, revisión legal, financiación</span>. 
              Todo en un único lugar.
            </p>
          </div>

          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
          >
            <span className="relative z-10">Comenzar a buscar</span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <button 
            onClick={scrollToFeatures}
            className="flex flex-col items-center text-gray-400 hover:text-white transition-colors"
          >
            <span className="text-sm mb-2">Saber más</span>
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ¿Cómo funciona?
          </h3>

          {/* Mobile Carousel */}
          <div className="md:hidden relative">
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
              <div className="flex items-start space-x-4 mb-4">
                {slides[currentSlide].icon}
                <div className="flex-1">
                  <h4 className="text-xl font-semibold mb-2 text-white">
                    {currentSlide + 1}. {slides[currentSlide].title}
                  </h4>
                  <p className="text-gray-300">
                    {slides[currentSlide].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Carousel Controls */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={prevSlide}
                className="p-2 rounded-full bg-purple-600/30 hover:bg-purple-600/50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex space-x-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide 
                        ? 'bg-purple-400 w-8' 
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="p-2 rounded-full bg-purple-600/30 hover:bg-purple-600/50 transition-colors"
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
                className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 hover:border-purple-400/40 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    {slide.icon}
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-white">
                    {index + 1}. {slide.title}
                  </h4>
                  <p className="text-gray-300 text-sm">
                    {slide.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ¿Listo para encontrar tu hogar?
          </h3>
          <p className="text-gray-300 mb-8 text-lg">
            Únete a miles de personas que ya encontraron su casa ideal con AURA
          </p>
          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
          >
            <span className="relative z-10">Empezar ahora</span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </section>
    </div>
  )
}
