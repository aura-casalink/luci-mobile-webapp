'use client'
import { useState, useEffect } from 'react'

export default function SearchingAnimation() {
  const [currentLogo, setCurrentLogo] = useState(0)
  
  const logos = [
    {
      name: 'idealista',
      url: 'https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_zfdde9dc5a5fcebd59d8b0816_f1154154b098fe610_d20250827_m223950_c003_v0312030_t0027_u01756334390521'
    },
    {
      name: 'fotocasa',
      url: 'https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_zfdde9dc5a5fcebd59d8b0816_f1128682f1d191f53_d20250827_m223948_c003_v0312030_t0059_u01756334388927'
    },
    {
      name: 'habitaclia',
      url: 'https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_zfdde9dc5a5fcebd59d8b0816_f1017b698c5209bad_d20250827_m223947_c003_v0312028_t0002_u01756334387564'
    },
    {
      name: 'pisos.com',
      url: 'https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_zfdde9dc5a5fcebd59d8b0816_f11409ae20b84d572_d20250827_m223945_c003_v0312030_t0032_u01756334385521'
    },
    {
      name: 'yaencontre',
      url: 'https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_zfdde9dc5a5fcebd59d8b0816_f10185d237c9eac9a_d20250827_m223943_c003_v0312030_t0057_u01756334383566'
    }
  ]
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogo((prev) => (prev + 1) % logos.length)
    }, 1200)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md p-3 inline-block">
      <div className="flex items-center space-x-2">
        <span className="text-gray-600 text-sm">Buscando en</span>
        
        {/* Contenedor para los logos - más grande */}
        <div className="relative w-28 h-8 flex items-center justify-center">
          {logos.map((logo, index) => (
            <img 
              key={logo.name}
              src={logo.url} 
              alt={logo.name}
              className={`absolute h-8 w-auto object-contain transition-all duration-300 ${
                index === currentLogo 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-75'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
