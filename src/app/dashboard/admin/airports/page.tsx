import { Plus, MapPin } from 'lucide-react'
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

export default async function AdminAirportsPage() {
  const supabase = await createClient()

  const { data: airports } = await supabase
    .from('airports')
    .select('*, hotels(id)')
    .order('iata_code', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Airports</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage monitored airports and their hotel coverage
          </p>
        </div>
        <Button size="sm" variant="primary">
          <Plus className="h-4 w-4" />
          Add Airport
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Monitored Airports
            <Badge variant="default">{airports?.length ?? 0}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IATA Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Monitored</TableHead>
                <TableHead>Hotels</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(airports ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                    No airports found
                  </TableCell>
                </TableRow>
              ) : (
                (airports ?? []).map((airport: any) => {
                  const hotelCount = airport.hotels?.length ?? 0

                  return (
                    <TableRow key={airport.id}>
                      <TableCell>
                        <span className="inline-flex items-center rounded-lg bg-[#1e3a5f] px-2.5 py-1 text-sm font-bold tracking-wider text-white">
                          {airport.iata_code}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {airport.name}
                      </TableCell>
                      <TableCell>{airport.city ?? '—'}</TableCell>
                      <TableCell>{airport.country ?? '—'}</TableCell>
                      <TableCell>
                        {airport.is_monitored ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="text-sm text-emerald-700">Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-gray-300" />
                            <span className="text-sm text-gray-500">Inactive</span>
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-sky-50 px-2 text-xs font-medium text-sky-700">
                          {hotelCount}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
