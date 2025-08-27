'use client'
import { useCallback } from 'react'

const PROPERTY_DATA = {
  1: {
    property_id: 1,
    propertyCode: "prop_1",
    title: "Ático en la Calle San Bernardo",
    address: "Palacio, Madrid",
    price: 1480000,
    pricePerSqm: 7668,
    builtArea: 193,
    usefulArea: 193,
    bedrooms: 4,
    bathrooms: 3,
    lat: 40.4271276,
    lng: -3.7090447,
    thumbnail: "https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_z8d6e5dd5a5cccbf59d6b0816_f111c9c7653cb0e93_d20250710_m075738_c003_v0312029_t0056_u01752134258027",
    images: [
      "https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_z8d6e5dd5a5cccbf59d6b0816_f111c9c7653cb0e93_d20250710_m075738_c003_v0312029_t0056_u01752134258027",
      "https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_z8d6e5dd5a5cccbf59d6b0816_f108148655c92f14e_d20250710_m075738_c003_v0312006_t0012_u01752134258167",
      "https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_z8d6e5dd5a5cccbf59d6b0816_f109c229b2e483ef1_d20250710_m075737_c003_v0312030_t0047_u01752134257742",
      "https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_z8d6e5dd5a5cccbf59d6b0816_f1018df8439e96569_d20250710_m075735_c003_v0312026_t0021_u01752134255919",
      "https://f003.backblazeb2.com/b2api/v1/b2_download_file_by_id?fileId=4_z8d6e5dd5a5cccbf59d6b0816_f115d407cf7494da2_d20250710_m075735_c003_v0312030_t0045_u01752134255810"
    ],
    description: "Ático exclusivo en el corazón de Madrid: Una oportunidad única para vivir en un espectacular ático exterior de 193 m², completamente reformado y recién amueblado con piezas de diseño, listo para entrar a vivir.",
    neighborhood: "Palacio",
    municipality: "Madrid"
  },
  2: {
    property_id: 2,
    propertyCode: "prop_2", 
    title: "Piso en venta en avenida de la Marina, 5",
    address: "Puerto de Sotogrande-La Marina, Sotogrande",
    price: 332000,
    pricePerSqm: 2338,
    builtArea: 142,
    usefulArea: 142,
    bedrooms: 2,
    bathrooms: 2,
    lat: 36.2874961,
    lng: -5.2828522,
    thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/be/b2/f1/1217657644.webp",
    images: [
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/be/b2/f1/1217657644.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/f4/c7/a1/1217657634.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/04/d1/fb/1217657636.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/2d/91/23/1217657638.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/a9/74/c1/1217657639.webp"
    ],
    description: "Sin comisión de Agencia! Vendemos un lote de apartamentos. Pisos chollo. Desde 332.000€ (Alquilado)",
    neighborhood: "Puerto de Sotogrande-La Marina",
    municipality: "Sotogrande"
  },
  3: {
    property_id: 3,
    propertyCode: "prop_3",
    title: "Piso en venta en Av Puerto Sotogrande",
    address: "Puerto de Sotogrande-La Marina, Sotogrande",
    price: 489000,
    pricePerSqm: 2794,
    builtArea: 174,
    usefulArea: 174,
    bedrooms: 3,
    bathrooms: 2,
    lat: 36.2871823,
    lng: -5.2825606,
    thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/47/aa/2a/1217657655.webp",
    images: [
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/47/aa/2a/1217657655.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/1c/87/26/1217657656.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/75/16/da/1217657654.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/bc/ce/c8/1217657664.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/48/29/c2/1217657666.webp"
    ],
    description: "Piso reformado con 3 habitaciones, dos plazas de garaje, trastero y piscina.",
    neighborhood: "Puerto de Sotogrande-La Marina",
    municipality: "Sotogrande"
  },
  4: {
    property_id: 4,
    propertyCode: "prop_4",
    title: "Chalet adosado en avenida Pernet",
    address: "Nueva Atalaya, Estepona",
    price: 459000,
    pricePerSqm: 2022,
    builtArea: 227,
    usefulArea: 227,
    bedrooms: 3,
    bathrooms: 3,
    lat: 36.4726642,
    lng: -5.0179132,
    thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/0e/a6/38/1305149519.webp",
    images: [
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/0e/a6/38/1305149519.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/2c/93/90/1305149507.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/2d/4a/df/1305149428.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/36/84/8d/1305149553.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/3b/d8/21/1305149551.webp"
    ],
    description: "Sin Comisión de Agencia! Se vende encantadora casa adosada en la codiciada zona de Monte Biarritz, a tan solo 5 minutos de la playa.",
    neighborhood: "Nueva Atalaya",
    municipality: "Estepona"
  },
  5: {
    property_id: 5,
    propertyCode: "prop_5",
    title: "Piso en calle Sierra Cazorla",
    address: "Lomas de Marbella Club, Marbella",
    price: 849000,
    pricePerSqm: 3343,
    builtArea: 254,
    usefulArea: 254,
    bedrooms: 3,
    bathrooms: 3,
    lat: 36.5118884,
    lng: -4.9380596,
    thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/03/2e/95/1257669958.webp",
    images: [
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/03/2e/95/1257669958.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/14/2c/c9/1257669913.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/14/c1/2b/1257669928.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/18/18/46/1257669956.webp",
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/19/94/db/1257669973.webp"
    ],
    description: "Sin Comisión de Agencia! PRECIO NEGOCIABLE - HACER OFERTA ¡Descubre tu nuevo hogar en la prestigiosa Milla de Oro!",
    neighborhood: "Lomas de Marbella Club",
    municipality: "Marbella"
  },
  6: {
    property_id: 6,
    propertyCode: "prop_6",
    title: "Estudio en venta en Retiro",
    address: "Retiro, Madrid",
    price: 320000,
    pricePerSqm: 8000,
    builtArea: 40,
    usefulArea: 38,
    bedrooms: 1,
    bathrooms: 1,
    lat: 40.4150,
    lng: -3.6850,
    thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/5a/c4/85/1347007848.webp",
    images: [
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/5a/c4/85/1347007848.webp",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop"
    ],
    description: "Acogedor estudio cerca del Parque del Retiro, ideal para jóvenes profesionales.",
    neighborhood: "Retiro",
    municipality: "Madrid"
  },
  7: {
    property_id: 7,
    propertyCode: "prop_7",
    title: "Piso en venta en Malasaña",
    address: "Malasaña, Madrid",
    price: 550000,
    pricePerSqm: 6875,
    builtArea: 80,
    usefulArea: 75,
    bedrooms: 2,
    bathrooms: 2,
    lat: 40.4250,
    lng: -3.7050,
    thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/3c/54/a2/1347007801.webp",
    images: [
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/3c/54/a2/1347007801.webp",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop"
    ],
    description: "Moderno piso en el vibrante barrio de Malasaña, rodeado de cafeterías y vida nocturna.",
    neighborhood: "Malasaña",
    municipality: "Madrid"
  },
  8: {
    property_id: 8,
    propertyCode: "prop_8",
    title: "Piso en venta en Chueca",
    address: "Chueca, Madrid",
    price: 680000,
    pricePerSqm: 7556,
    builtArea: 90,
    usefulArea: 85,
    bedrooms: 2,
    bathrooms: 2,
    lat: 40.4220,
    lng: -3.6950,
    thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/96/6b/9a/1347007850.webp",
    images: [
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/96/6b/9a/1347007850.webp",
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop"
    ],
    description: "Piso de diseño en Chueca, con todas las comodidades y un estilo contemporáneo único.",
    neighborhood: "Chueca",
    municipality: "Madrid"
  },
  9: {
    property_id: 9,
    propertyCode: "prop_9",
    title: "Piso en venta en Lavapiés",
    address: "Lavapiés, Madrid",
    price: 395000,
    pricePerSqm: 5642,
    builtArea: 70,
    usefulArea: 65,
    bedrooms: 2,
    bathrooms: 1,
    lat: 40.4080,
    lng: -3.7000,
    thumbnail: "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/77/54/29/1347007867.webp",
    images: [
      "https://img4.idealista.com/blur/480_360_mq/0/id.pro.es.image.master/77/54/29/1347007867.webp",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop"
    ],
    description: "Piso con carácter en el multicultural barrio de Lavapiés, lleno de arte y diversidad.",
    neighborhood: "Lavapiés",
    municipality: "Madrid"
  }
}

export function useExploreProperties() {
  const getPropertyDetails = useCallback((propertyId) => {
    return PROPERTY_DATA[propertyId] || null
  }, [])

  return { getPropertyDetails }
}
