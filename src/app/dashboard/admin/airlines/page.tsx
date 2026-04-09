import Link from 'next/link'
import { Plus, Plane, ExternalLink } from 'lucide-react'
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

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  active: 'success',
  inactive: 'danger',
  onboarding: 'warning',
  suspended: 'danger',
}

export default async function AdminAirlinesPage() {
  const supabase = await createClient()

  const { data: airlines } = await supabase
    .from('airlines')
    .select('*, contacts:airline_contacts(id)')
    .order('name', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Airlines</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage airline partners and their contacts
          </p>
        </div>
        <Button size="sm" variant="primary">
          <Plus className="h-4 w-4" />
          Add Airline
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            All Airlines
            <Badge variant="default">{airlines?.length ?? 0}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Airline Name</TableHead>
                <TableHead>IATA Code</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Contacts</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(airlines ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                    No airlines found
                  </TableCell>
                </TableRow>
              ) : (
                (airlines ?? []).map((airline: any) => (
                  <TableRow key={airline.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e3a5f]/10 text-sm font-bold text-[#1e3a5f]">
                          {airline.iata_code ?? airline.name?.slice(0, 2)?.toUpperCase()}
                        </div>
                        <span className="font-medium">{airline.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="rounded bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700">
                        {airline.iata_code ?? '—'}
                      </span>
                    </TableCell>
                    <TableCell>{airline.country ?? '—'}</TableCell>
                    <TableCell>
                      <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-gray-100 px-2 text-xs font-medium text-gray-600">
                        {airline.contacts?.length ?? 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[airline.status] ?? 'default'}>
                        {airline.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/admin/airlines/${airline.id}`}
                        className="inline-flex items-center gap-1 text-sm text-[#38bdf8] hover:underline"
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
