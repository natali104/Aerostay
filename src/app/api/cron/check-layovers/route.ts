import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { v4 as uuidv4 } from 'uuid'
import {
  layoverDetectedEmail,
  bookingLinkEmail,
} from '@/lib/email-templates'

export const dynamic = 'force-dynamic'

const AIRLINES = [
  { iata: 'LH', name: 'Lufthansa' },
  { iata: 'W6', name: 'Wizz Air' },
  { iata: 'FB', name: 'Bulgaria Air' },
  { iata: 'TK', name: 'Turkish Airlines' },
  { iata: 'QR', name: 'Qatar Airways' },
  { iata: 'EK', name: 'Emirates' },
]

const ROUTES = [
  { origin: 'FRA', destination: 'IST' },
  { origin: 'CDG', destination: 'DOH' },
  { origin: 'LHR', destination: 'DXB' },
  { origin: 'MUC', destination: 'ATH' },
  { origin: 'VIE', destination: 'TLV' },
  { origin: 'AMS', destination: 'BKK' },
]

const REASONS = [
  'Technical issue — aircraft maintenance required',
  'Weather delay — severe thunderstorm at destination',
  'Crew rest time exceeded — mandatory rest period',
  'Air traffic control restriction',
  'Diversion due to medical emergency on board',
  'Runway closure at destination airport',
]

interface SimulatedLayover {
  flightNumber: string
  airlineIata: string
  airlineName: string
  origin: string
  destination: string
  passengerCount: number
  reason: string
  originalDeparture: Date
  estimatedDeparture: Date
}

function simulateLayoverDetection(): SimulatedLayover[] {
  const count = Math.floor(Math.random() * 3) // 0-2
  const layovers: SimulatedLayover[] = []

  for (let i = 0; i < count; i++) {
    const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)]
    const route = ROUTES[Math.floor(Math.random() * ROUTES.length)]
    const flightNum = Math.floor(Math.random() * 9000) + 1000

    const now = new Date()
    const originalDeparture = new Date(now.getTime() - Math.floor(Math.random() * 4) * 3600000)
    const delayHours = 8 + Math.floor(Math.random() * 16) // 8-24h delay
    const estimatedDeparture = new Date(originalDeparture.getTime() + delayHours * 3600000)

    layovers.push({
      flightNumber: `${airline.iata}${flightNum}`,
      airlineIata: airline.iata,
      airlineName: airline.name,
      origin: route.origin,
      destination: route.destination,
      passengerCount: 50 + Math.floor(Math.random() * 150),
      reason: REASONS[Math.floor(Math.random() * REASONS.length)],
      originalDeparture,
      estimatedDeparture,
    })
  }

  return layovers
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // In production, use service role client to bypass RLS for cron jobs
    const supabase = await createClient()

    const { data: airport } = await supabase
      .from('airports')
      .select('id, iata_code, name')
      .eq('is_monitored', true)
      .eq('iata_code', 'SOF')
      .single()

    if (!airport) {
      return NextResponse.json({ message: 'No monitored airport found for SOF', new_layovers: 0 })
    }

    const simulatedLayovers = simulateLayoverDetection()

    if (simulatedLayovers.length === 0) {
      return NextResponse.json({ message: 'No new layovers detected', new_layovers: 0 })
    }

    const createdLayovers: Array<{ id: string; flightNumber: string }> = []

    for (const layover of simulatedLayovers) {
      const { data: existingLayover } = await supabase
        .from('layovers')
        .select('id')
        .eq('flight_number', layover.flightNumber)
        .eq('airport_id', airport.id)
        .gte('created_at', new Date(Date.now() - 24 * 3600000).toISOString())
        .maybeSingle()

      if (existingLayover) continue

      const { data: airline } = await supabase
        .from('airlines')
        .select('id, name')
        .eq('iata_code', layover.airlineIata)
        .eq('is_active', true)
        .maybeSingle()

      const { data: newLayover, error: layoverError } = await supabase
        .from('layovers')
        .insert({
          airport_id: airport.id,
          airline_id: airline?.id ?? null,
          flight_number: layover.flightNumber,
          origin_airport: layover.origin,
          destination_airport: layover.destination,
          original_departure: layover.originalDeparture.toISOString(),
          estimated_departure: layover.estimatedDeparture.toISOString(),
          passenger_count: layover.passengerCount,
          reason: layover.reason,
          status: 'detected',
        })
        .select('id')
        .single()

      if (layoverError || !newLayover) {
        console.error('Failed to create layover:', layoverError)
        continue
      }

      createdLayovers.push({ id: newLayover.id, flightNumber: layover.flightNumber })

      if (airline) {
        const { data: contacts } = await supabase
          .from('airline_contacts')
          .select('email, name')
          .eq('airline_id', airline.id)

        if (contacts && contacts.length > 0) {
          const emailData = layoverDetectedEmail({
            airlineName: airline.name,
            flightNumber: layover.flightNumber,
            origin: layover.origin,
            destination: layover.destination,
            passengerCount: layover.passengerCount,
            reason: layover.reason,
            estimatedDeparture: layover.estimatedDeparture.toISOString(),
          })

          try {
            await resend.emails.send({
              from: FROM_EMAIL,
              to: contacts.map((c) => c.email),
              subject: emailData.subject,
              html: emailData.html,
            })
          } catch (emailErr) {
            console.error('Failed to send notification email:', emailErr)
          }

          const primaryContact = contacts.find((c) => c.name) ?? contacts[0]
          const token = uuidv4()
          const expiresAt = new Date(Date.now() + 48 * 3600000)

          await supabase.from('auth_tokens').insert({
            token,
            email: primaryContact.email,
            layover_id: newLayover.id,
            airline_id: airline.id,
            expires_at: expiresAt.toISOString(),
          })

          const bookingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://aerostay.app'}/book?token=${token}`

          const linkEmail = bookingLinkEmail({
            contactName: primaryContact.name || 'Operations Team',
            flightNumber: layover.flightNumber,
            passengerCount: layover.passengerCount,
            bookingUrl,
          })

          try {
            await resend.emails.send({
              from: FROM_EMAIL,
              to: contacts.map((c) => c.email),
              subject: linkEmail.subject,
              html: linkEmail.html,
            })
          } catch (emailErr) {
            console.error('Failed to send booking link email:', emailErr)
          }

          await supabase
            .from('layovers')
            .update({ status: 'notified' })
            .eq('id', newLayover.id)
        }
      }
    }

    return NextResponse.json({
      message: `Processed ${simulatedLayovers.length} layovers`,
      new_layovers: createdLayovers.length,
      layovers: createdLayovers,
    })
  } catch (error) {
    console.error('Cron check-layovers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
