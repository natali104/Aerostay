import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, hotel_id, airline_id')
    .eq('id', user.id)
    .single()

  const role = (profile?.role ?? 'admin') as 'admin' | 'hotel' | 'airline'
  const userName = profile?.full_name ?? user.email?.split('@')[0] ?? 'User'
  const userEmail = user.email ?? ''

  return (
    <DashboardShell role={role} userName={userName} userEmail={userEmail}>
      {children}
    </DashboardShell>
  )
}
