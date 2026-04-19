import Link from 'next/link'
import { Plus, Search, Hotel, Star, ExternalLink } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { createClient } from '@/lib/supabase/server'
import { DEMO_MODE } from '@/lib/demo'

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  active: 'success',
  inactive: 'danger',
  onboarding: 'warning',
  suspended: 'danger',
}

function StarRating({ stars }: { stars: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500">
      {Array.from({ length: stars }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-current" />
      ))}
    </span>
  )
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

export default async function AdminHotelsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  let hotels: any[] | null = null
  let params: { search?: string; status?: string } = {}

  try {
    params = await searchParams
    const supabase = await createClient()

    let query = supabase
      .from('hotels')
      .select('*, airport:airports(name, iata_code)')
      .order('name', { ascending: true })

    if (params.search) {
      query = query.or(
        `name.ilike.%${params.search}%,city.ilike.%${params.search}%`
      )
    }

    if (params.status) {
      query = query.eq('status', params.status)
    }

    const { data, error } = await query
    if (error) throw error
    hotels = data
  } catch {
    if (DEMO_MODE) {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Hotels</h1>
            <p className="mt-1 text-sm text-[#64748B]">
              Manage partner hotels across all airports
            </p>
          </div>
          <DemoFallback />
        </div>
      )
    }
    hotels = []
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Hotels</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Manage partner hotels across all airports
          </p>
        </div>
        <Button size="sm" variant="primary">
          <Plus className="h-4 w-4" />
          Add Hotel
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Hotel className="h-5 w-5" />
              All Hotels
              <Badge variant="default">{hotels?.length ?? 0}</Badge>
            </CardTitle>
            <HotelFilters
              currentSearch={params.search}
              currentStatus={params.status}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Airport</TableHead>
                <TableHead>Stars</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead>Discount %</TableHead>
                <TableHead>Commission %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(hotels ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-400 py-8">
                    No hotels found
                  </TableCell>
                </TableRow>
              ) : (
                (hotels ?? []).map((hotel: any) => (
                  <TableRow key={hotel.id}>
                    <TableCell className="font-medium">{hotel.name}</TableCell>
                    <TableCell>{hotel.city ?? '—'}</TableCell>
                    <TableCell>
                      {hotel.airport ? (
                        <span className="inline-flex items-center gap-1">
                          <span className="rounded bg-[#0F172A]/10 px-1.5 py-0.5 text-xs font-semibold text-[#0F172A]">
                            {hotel.airport.iata_code}
                          </span>
                          <span className="hidden text-gray-500 lg:inline">
                            {hotel.airport.name}
                          </span>
                        </span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      {hotel.star_rating ? (
                        <StarRating stars={hotel.star_rating} />
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="capitalize text-xs">
                      {hotel.pricing_method?.replace(/_/g, ' ') ?? '—'}
                    </TableCell>
                    <TableCell>
                      {hotel.discount_percentage != null
                        ? `${hotel.discount_percentage}%`
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {hotel.commission_rate != null
                        ? `${hotel.commission_rate}%`
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[hotel.status] ?? 'default'}>
                        {hotel.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/admin/hotels/${hotel.id}`}
                        className="inline-flex items-center gap-1 text-sm text-[#0EA5E9] hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View
                      </Link>
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

function HotelFilters({
  currentSearch,
  currentStatus,
}: {
  currentSearch?: string
  currentStatus?: string
}) {
  return (
    <form className="flex flex-col gap-2 sm:flex-row sm:items-center" method="GET">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          name="search"
          defaultValue={currentSearch}
          placeholder="Search hotels..."
          className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm placeholder:text-gray-400 focus:border-[#0EA5E9] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 sm:w-56"
        />
      </div>
      <select
        name="status"
        defaultValue={currentStatus ?? ''}
        className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-[#0EA5E9] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30"
      >
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="onboarding">Onboarding</option>
        <option value="suspended">Suspended</option>
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
