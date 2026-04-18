'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Role = 'hotel' | 'airline' | 'admin' | null

interface UseRoleReturn {
  role: Role
  loading: boolean
  userId: string | null
}

export function useRole(): UseRoleReturn {
  const [role, setRole] = useState<Role>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    async function fetchRole() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user || cancelled) {
        setLoading(false)
        return
      }

      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!cancelled) {
        setRole((profile?.role as Role) ?? null)
        setLoading(false)
      }
    }

    fetchRole()

    return () => {
      cancelled = true
    }
  }, [])

  return { role, loading, userId }
}
