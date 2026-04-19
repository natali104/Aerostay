import { Clock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { formatDateTime } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { DEMO_MODE } from '@/lib/demo'

const statusVariant: Record<string, 'info' | 'warning' | 'success' | 'danger' | 'default'> = {
  detected: 'info',
  notified: 'warning',
  booking_in_progress: 'info',
  booked: 'success',
  expired: 'danger',
  cancelled: 'danger',
}

function DemoFallback() {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 text-center">
      <p className="text-sm text-[#64748B]">
        Demo mode — data will appear when connected to production database
      </p>
    </div>
  )
}

export default async function AdminLayoversPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; airport?: string }>
}) {
  let layovers: any[] | null = null
  let airports: any[] = []
  let params: { status?: string; airport?: string } = {}

  try {
    params = await searchParams
    const supabase = await createClient()

    let query = supabase
      .from('layovers')
      .select(
        '*, airport:airports(name, iata_code), airline:airlines(name, iata_code)'
      )
      .order('detected_at', { ascending: false })

    if (params.status) {
      query = query.eq('status', params.status)
    }

    if (params.airport) {
      query = query.eq('airport_id', params.airport)
    }

    const [layoverResult, airportResult] = await Promise.all([
      query,
      supabase
        .from('airports')
        .select('id, iata_code, name')
        .order('iata_code', { ascending: true }),
    ])

    if (layoverResult.error) throw layoverResult.error
    layovers = layoverResult.data
    airports = airportResult.data ?? []
  } catch {
    if (DEMO_MODE) {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Layovers</h1>
            <p className="mt-1 text-sm text-[#64748B]">
              Track and manage detected airline layovers
            </p>
          </div>
          <DemoFallback />
        </div>
      )
    }
    layovers = []
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Layovers</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Track and manage detected airline layovers
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              All Layovers
              <Badge variant="default">{layovers?.length ?? 0}</Badge>
            </CardTitle>
            <LayoverFilters
              currentStatus={params.status}
              currentAirport={params.airport}
              airports={airports}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flight</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Airport</TableHead>
                <TableHead>Airline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Passengers</TableHead>
                <TableHead>Detected At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(layovers ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-400 py-8">
                    No layovers found
                  </TableCell>
                </TableRow>
              ) : (
                (layovers ?? []).map((layover: any) => (
                  <TableRow key={layover.id}>
                    <TableCell className="font-medium">
                      {layover.flight_number}
                    </TableCell>
                    <TableCell>
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-700">
                        {layover.origin_airport ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-700">
                        {layover.destination_airport ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {layover.airport ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="rounded bg-[#0F172A]/10 px-1.5 py-0.5 text-xs font-semibold text-[#0F172A]">
                            {layover.airport.iata_code}
                          </span>
                          <span className="hidden text-xs text-gray-500 xl:inline">
                            {layover.airport.name}
                          </span>
                        </span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      {layover.airline ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="rounded bg-sky-50 px-1.5 py-0.5 text-xs font-semibold text-sky-700">
                            {layover.airline.iata_code}
                          </span>
                          <span className="hidden text-xs text-gray-500 xl:inline">
                            {layover.airline.name}
                          </span>
                        </span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[layover.status] ?? 'default'}>
                        {layover.status?.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {layover.passenger_count ?? '—'}
                    </TableCell>
                    <TableCell className="text-gray-500 whitespace-nowrap">
                      {layover.detected_at
                        ? formatDateTime(layover.detected_at)
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function LayoverFilters({
  currentStatus,
  currentAirport,
  airports,
}: {
  currentStatus?: string
  currentAirport?: string
  airports: any[]
}) {
  return (
    <form className="flex flex-col gap-2 sm:flex-row sm:items-center" method="GET">
      <select
        name="status"
        defaultValue={currentStatus ?? ''}
        className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-[#0EA5E9] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30"
      >
        <option value="">All Statuses</option>
        <option value="detected">Detected</option>
        <option value="notified">Notified</option>
        <option value="booking_in_progress">Booking in Progress</option>
        <option value="booked">Booked</option>
        <option value="expired">Expired</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <select
        name="airport"
        defaultValue={currentAirport ?? ''}
        className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-[#0EA5E9] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30"
      >
        <option value="">All Airports</option>
        {airports.map((airport: any) => (
          <option key={airport.id} value={airport.id}>
            {airport.iata_code} — {airport.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="h-9 rounded-lg bg-[#0EA5E9] px-4 text-sm font-medium text-white hover:bg-[#0284C7] transition-colors"
      >
        Filter
      </button>
    </form>
  )
}
