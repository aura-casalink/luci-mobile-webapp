import SharePropertyView from './SharePropertyView'

export default function SharePropertyPage({ params }) {
  return <SharePropertyView propertyCode={params.propertyCode} />
}

export async function generateMetadata({ params }) {
  // Generar metadata dinámica para SEO/preview en redes sociales
  const propertyCode = params.propertyCode
  
  return {
    title: `Propiedad ${propertyCode} - Luci`,
    description: 'Descubre esta increíble propiedad seleccionada por Luci',
    openGraph: {
      title: `Propiedad en Madrid`,
      description: 'Ver detalles de esta propiedad',
      type: 'website',
    }
  }
}
