import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Missing token parameter' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: authToken, error } = await supabase
      .from('auth_tokens')
      .select(`
        id,
        token,
        email,
        expires_at,
        used_at,
        layover:layovers(
          id,
          flight_number,
          origin_airport,
          destination_airport,
          original_departure,
          estimated_departure,
          passenger_count,
          reason,
          status,
          airport:airports(id, iata_code, name, city, country)
        ),
        airline:airlines(
          id,
          name,
          iata_code,
          logo_url
        )
      `)
      .eq('token', token)
      .single()

    if (error || !authToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const expiresAt = new Date(authToken.expires_at)
    if (expiresAt < new Date()) {
      return NextResponse.json({ error: 'Token has expired' }, { status: 401 })
    }

    if (!authToken.used_at) {
      await supabase
        .from('auth_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('id', authToken.id)
    }

    return NextResponse.json({
      valid: true,
      email: authToken.email,
      layover: authToken.layover,
      airline: authToken.airline,
    })
  } catch (error) {
    console.error('GET /api/auth/token error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
