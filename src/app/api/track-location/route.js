import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req) {
  try {
    console.log('📍 === TRACK LOCATION API CALLED ===')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('📍 Supabase not configured')
      return NextResponse.json({ ok: true, tracked: false, reason: 'no_config' })
    }
    
    // Parsear body
    const body = await req.text()
    const payload = JSON.parse(body)
    console.log('📍 Received payload:', payload)
    
    const { session_id, browser_geo } = payload
    
    if (!session_id) {
      return NextResponse.json({ ok: false, error: 'missing_session_id' })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Obtener datos actuales de la sesión
    const { data: currentSession } = await supabase
      .from('chat_sessions')
      .select('browser_info')
      .eq('session_id', session_id)
      .single()

    // Obtener IP y headers del request
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1'
    
    // Crear objeto de localización completo
    const newBrowserInfo = {
      // Mantener datos existentes
      ...(currentSession?.browser_info || {}),
      
      // Actualizar con nuevos datos
      ip: ip,
      userAgent: req.headers.get('user-agent'),
      language: req.headers.get('accept-language'),
      host: req.headers.get('host'),
      referrer: req.headers.get('referer'),
      
      // Añadir geolocalización si existe
      ...(browser_geo && {
        browser_geo: browser_geo,
        has_geolocation: true,
        geo_timestamp: browser_geo.timestamp || new Date().toISOString()
      }),
      
      // Timestamp de actualización
      last_updated: new Date().toISOString()
    }

    console.log('📍 Updating browser_info with:', newBrowserInfo)

    // Actualizar en Supabase
    const { data, error } = await supabase
      .from('chat_sessions')
      .update({
        browser_info: newBrowserInfo,
        ip: ip,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', session_id)
      .select()
      .single()
    
    if (error) {
      console.error('📍 Supabase error:', error)
      // No fallar si es error de permisos
      if (error.code === '42501' || error.code === 'PGRST301') {
        return NextResponse.json({ ok: true, tracked: false, reason: 'permissions' })
      }
      throw error
    }

    console.log('📍 ✅ Successfully updated session:', session_id)
    console.log('📍 Updated data:', data?.browser_info)
    
    return NextResponse.json({
      ok: true,
      tracked: true,
      has_browser_geo: !!browser_geo,
      session_id: session_id,
      browser_info_updated: true
    })
    
  } catch (e) {
    console.error('📍 ❌ Error:', e)
    return NextResponse.json({ 
      ok: false,
      error: e.message 
    })
  }
}

// Manejar GET
export async function GET() {
  return NextResponse.json({ 
    ok: true,
    message: 'Use POST method'
  })
}