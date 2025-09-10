export const runtime = 'edge'; 

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Solo server-side
)

export async function POST(req) {
  try {
    const payload = await req.json().catch(() => ({}))
    const { session_id, browser_geo } = payload || {}
    
    if (!session_id) {
      return NextResponse.json({ ok: false, error: 'missing session_id' }, { status: 400 })
    }

    const g = req.geo || {}
    const edge_geo = {
      country: g.country || null,
      region: g.region || null,
      city: g.city || null,
      latitude: g.latitude ?? null,
      longitude: g.longitude ?? null,
      source: g.country ? 'edge' : null,
    }

    const geolocationPatch = {
      geolocation: {
        edge: edge_geo,
        browser: browser_geo || null,
        captured_at: new Date().toISOString(),
      }
    }

    const { error } = await supabase.rpc('merge_browser_info', {
      p_session_id: session_id,
      p_patch: geolocationPatch,
    })
    
    if (error) throw error

    return NextResponse.json({
      ok: true,
      tracked: { 
        has_edge_geo: !!edge_geo.city, 
        has_browser_geo: !!browser_geo 
      }
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
