'use client'
import { useEffect, useMemo, useState } from 'react'

const AURA_BLACK = '#0A0A23'
const AURA_WHITE = '#FAFAFA'
const AURA_GOLD  = '#FFB300'

export default function LandingPage({ onStart }) {
  const slides = useMemo(() => ([
    { title: 'Chatea',             text: 'Te traeremos resultados directamente en la conversación.' },
    { title: 'Ajusta con insights',text: 'Pulsa en los resultados para ver insights y refinar criterios.' },
    { title: 'Guarda favoritos',   text: 'Marca los que más te gusten y retómalos cuando quieras.' },
    { title: 'Explora a tu manera',text: 'Exclusivas, sugerencias o nuestro mapa inteligente.' },
  ]), [])

  const videos = [
    'https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_zfdde9dc5a5fcebd59d8b0816_f11505e1bf52ca8bf_d20250829_m101203_c003_v0312011_t0001_u01756462323449',
    'https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_zfdde9dc5a5fcebd59d8b0816_f10786c5589addc06_d20250829_m101202_c003_v0312023_t0017_u01756462322190',
    'https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_zfdde9dc5a5fcebd59d8b0816_f113c8b81c434542a_d20250829_m101158_c003_v0312013_t0004_u01756462318863',
  ]

  const [vidIndex, setVidIndex] = useState(0)
  const [visible, setVisible] = useState(false)
  useEffect(() => { setVisible(true) }, [])

  const scrollToFeatures = () => {
    const el = document.getElementById('features-section')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: AURA_WHITE, color: AURA_BLACK }}>
      {/* Header minimal: AURA */}
      <header className="absolute top-0 left-0 right-0 z-20 p-5">
        <div className="inline-flex items-center rounded-full bg-white/90 px-4 py-2 shadow-sm">
          <span className="font-semibold tracking-wide" style={{ color: AURA_BLACK }}>AURA</span>
          <span className="ml-2 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: AURA_GOLD }} />
        </div>
      </header>

      {/* HERO con vídeos de fondo en secuencia */}
      <section className="relative min-h-[86vh] w-full overflow-hidden">
        <video
          key={vidIndex}
          src={videos[vidIndex]}
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={() => setVidIndex(i => (i + 1) % videos.length)}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Overlay para contraste */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(10,10,35,0.70) 0%, rgba(10,10,35,0.45) 50%, rgba(10,10,35,0.20) 100%)' }}
        />
        {/* Copy */}
        <div className={`relative z-10 px-6 pt-10 flex h-full flex-col justify-end pb-20 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
          <h1 className="text-white text-4xl font-extrabold leading-tight drop-shadow">
            Encuentra tu casa<br/>más rápido
          </h1>
          <p className="mt-3 text-white/95 text-[15px] leading-relaxed">
            Somos el <span className="font-semibold">primer buscador en España</span> con filtros avanzados.
            Hacemos el trabajo por ti: sabemos qué zonas son mejores en cada ciudad, qué terraza es la más grande entre los pisos disponibles, y te devolvemos tiempo.
            Una vez encontrada la casa, ofrecemos <span className="font-semibold">paquetes de servicios</span>: reforma, revisión legal y financiación — todo en un único lugar.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={onStart}
              className="inline-flex flex-1 items-center justify-center rounded-xl py-3 text-[15px] font-semibold shadow-md active:scale-[.99]"
              style={{ backgroundColor: AURA_BLACK, color: '#FFF' }}
            >
              Comenzar a buscar
            </button>

            <button
              onClick={scrollToFeatures}
              aria-label="Saber más"
              className="inline-flex h-12 w-12 items-center justify-center rounded-xl shadow-md bg-white/90"
              style={{ color: AURA_BLACK }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* ¿Cómo funciona? */}
      <section id="features-section" className="px-5 pt-8 pb-16">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">¿Cómo funciona?</h2>
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: AURA_GOLD }} />
        </div>

        {/* Carrusel táctil */}
        <div className="-mx-5 overflow-x-auto px-5">
          <div className="flex snap-x snap-mandatory gap-4">
            {slides.map((card, idx) => (
              <article
                key={idx}
                className="snap-start shrink-0 w-[86%] rounded-2xl border p-4 shadow-sm bg-white"
                style={{ borderColor: '#E5E7EB' }}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-bold"
                    style={{ backgroundColor: AURA_GOLD, color: AURA_BLACK }}
                  >
                    {idx + 1}
                  </span>
                  <h3 className="text-[15px] font-semibold">{card.title}</h3>
                </div>
                <p className="text-[14px] leading-relaxed" style={{ color: '#374151' }}>
                  {card.text}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* CTA inferior */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={onStart}
            className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-[15px] font-medium shadow-sm active:scale-[.99] bg-white"
            style={{ color: AURA_BLACK, border: '1px solid #E5E7EB' }}
          >
            Empezar ahora
          </button>
        </div>
      </section>
    </div>
  )
}
