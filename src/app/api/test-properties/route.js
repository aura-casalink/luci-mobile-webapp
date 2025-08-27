import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const { session_id } = await request.json()
    
    console.log('Creating test callback with simulated properties for session:', session_id)
    
    // Propiedades simuladas (NO se insertan en DB)
    const mockProperties = [
      {
        id: `test_${Date.now()}_1`,
        session_id: session_id,
        title: "Ático en Calle de las Aguas",
        price: 850000,
        sqft: 106,
        bedrooms: 2,
        bathrooms: 1,
        address: "Calle de las Aguas, Madrid",
        neighborhood: "Palacio", 
        municipality: "Madrid",
        province: "Madrid",
        district: "Centro",
        thumbnail: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=250&fit=crop",
        propertyCode: `TEST_${Date.now()}_1`,
        url: "https://example.com/property1",
        operation: "sale",
        propertyType: "flat",
        description: "Exclusivo ático en el emblemático barrio de Palacio, Madrid. Descubre este magnífico ático de 98m2 en uno de los enclaves más históricos y codiciados de Madrid.",
        atico: true,
        terrace: true,
        air_con: true,
        exterior: true,
        numPhotos: 5,
        priceByArea: "8,019 €/m²"
      },
      {
        id: `test_${Date.now()}_2`,
        session_id: session_id,
        title: "Piso en Calle de Noblejas",
        price: 320000,
        sqft: 85,
        bedrooms: 2,
        bathrooms: 1,
        address: "Calle de Noblejas, Madrid",
        neighborhood: "Centro",
        municipality: "Madrid",
        province: "Madrid",
        district: "Centro",
        thumbnail: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=250&fit=crop",
        propertyCode: `TEST_${Date.now()}_2`,
        url: "https://example.com/property2",
        operation: "sale",
        propertyType: "flat",
        description: "Acogedor piso en el corazón de Madrid, completamente renovado y listo para entrar a vivir.",
        piso: true,
        elevator: true,
        balcony: true,
        exterior: true,
        built_in_wardrobes: true,
        numPhotos: 8,
        priceByArea: "3,765 €/m²"
      },
      {
        id: `test_${Date.now()}_3`,
        session_id: session_id,
        title: "Piso en Calle de Esparteros",
        price: 275000,
        sqft: 78,
        bedrooms: 1,
        bathrooms: 1,
        address: "Calle de Esparteros, Madrid",
        neighborhood: "Sol",
        municipality: "Madrid",
        province: "Madrid",
        district: "Centro",
        thumbnail: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=250&fit=crop",
        propertyCode: `TEST_${Date.now()}_3`,
        url: "https://example.com/property3",
        operation: "sale",
        propertyType: "flat",
        description: "Encantador piso en una de las calles más emblemáticas del centro de Madrid.",
        piso: true,
        exterior: false,
        numPhotos: 6,
        priceByArea: "3,526 €/m²"
      }
    ]
    
    // Insertar callback CON LAS PROPIEDADES INCLUIDAS
    const { data: callback, error: callbackError } = await supabase
      .from('callbacks')
      .insert({
        session_id: session_id,
        payload: {
          type: 'properties_search_completed',
          message: 'Búsqueda completada con resultados',
          properties_count: mockProperties.length,
          properties: mockProperties  // ← INCLUIR PROPIEDADES EN EL PAYLOAD
        },
        pending: true,
        updated_at: new Date().toISOString()
      })
      .select()
    
    if (callbackError) {
      console.error('Error inserting callback:', callbackError)
      throw callbackError
    }
    
    console.log(`✅ Callback inserted with ${mockProperties.length} simulated properties`)
    
    return NextResponse.json({
      success: true,
      message: `Created callback with ${mockProperties.length} simulated properties`,
      properties: mockProperties.length,
      callback_id: callback[0].id
    })
    
  } catch (error) {
    console.error('Test properties error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
