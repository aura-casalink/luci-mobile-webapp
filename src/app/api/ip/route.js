export async function GET(request) {
  // En Vercel, la IP real viene en estos headers
  const xff = request.headers.get('x-forwarded-for') || ''
  const ip = xff.split(',')[0].trim() || 
             request.headers.get('x-real-ip') || 
             request.ip ||
             '0.0.0.0'
  
  return Response.json({ ip }, {
    headers: { 
      'Cache-Control': 'no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  })
}
