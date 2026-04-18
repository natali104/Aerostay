'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { UserPlus, Pencil, Trash2, X, Check } from 'lucide-react'

interface Contact {
  id: string
  name: string
  email: string
  role: string
  is_primary: boolean
}

const roleOptions = ['operations', 'crew_manager', 'dispatch', 'admin', 'other']

export default function AirlineContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [airlineId, setAirlineId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', role: 'operations' })
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const loadContacts = useCallback(async () => {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('airline_id')
      .eq('id', user.id)
      .single()

    if (!profile?.airline_id) return
    setAirlineId(profile.airline_id)

    const { data } = await supabase
      .from('airline_contacts')
      .select('id, name, email, role, is_primary')
      .eq('airline_id', profile.airline_id)
      .order('is_primary', { ascending: false })
      .order('name')

    setContacts(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadContacts()
  }, [loadContacts])

  function openAdd() {
    setEditingId(null)
    setForm({ name: '', email: '', role: 'operations' })
    setShowForm(true)
  }

  function openEdit(c: Contact) {
    setEditingId(c.id)
    setForm({ name: c.name, email: c.email, role: c.role })
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!airlineId) return
    setSubmitting(true)

    const supabase = createClient()

    if (editingId) {
      await supabase
        .from('airline_contacts')
        .update({ name: form.name, email: form.email, role: form.role })
        .eq('id', editingId)
    } else {
      await supabase.from('airline_contacts').insert({
        airline_id: airlineId,
        name: form.name,
        email: form.email,
        role: form.role,
        is_primary: false,
      })
    }

    setShowForm(false)
    setSubmitting(false)
    loadContacts()
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('airline_contacts').delete().eq('id', id)
    setDeleteConfirm(null)
    loadContacts()
  }

  async function togglePrimary(contact: Contact) {
    if (!airlineId) return
    const supabase = createClient()

    if (!contact.is_primary) {
      await supabase
        .from('airline_contacts')
        .update({ is_primary: false })
        .eq('airline_id', airlineId)
    }

    await supabase
      .from('airline_contacts')
      .update({ is_primary: !contact.is_primary })
      .eq('id', contact.id)

    loadContacts()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1120]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#3B9EFF] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B1120] p-6">
      <DashboardHeader
        title="Contacts"
        subtitle="Manage notification contacts for layover alerts"
      />

      <div className="mb-4 flex justify-end">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-[#3B9EFF] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3B9EFF]/90"
        >
          <UserPlus className="h-4 w-4" />
          Add Contact
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-white/[0.08] bg-[#111827] p-6">
          <h3 className="mb-4 text-lg font-semibold text-[#F1F5F9]">
            {editingId ? 'Edit Contact' : 'New Contact'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Jane Smith"
                  className="w-full rounded-lg border border-white/[0.1] bg-[#0B1120] px-3 py-2.5 text-sm text-[#F1F5F9] placeholder-[#94A3B8]/50 focus:border-[#3B9EFF] focus:outline-none focus:ring-1 focus:ring-[#3B9EFF]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder="jane@airline.com"
                  className="w-full rounded-lg border border-white/[0.1] bg-[#0B1120] px-3 py-2.5 text-sm text-[#F1F5F9] placeholder-[#94A3B8]/50 focus:border-[#3B9EFF] focus:outline-none focus:ring-1 focus:ring-[#3B9EFF]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-lg border border-white/[0.1] bg-[#0B1120] px-3 py-2.5 text-sm text-[#F1F5F9] focus:border-[#3B9EFF] focus:outline-none focus:ring-1 focus:ring-[#3B9EFF]"
                >
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>
                      {r.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-[#3B9EFF] px-4 py-2 text-sm font-medium text-white hover:bg-[#3B9EFF]/90 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingId ? 'Update' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-white/[0.1] px-4 py-2 text-sm font-medium text-[#94A3B8] hover:bg-white/[0.06]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-xl border border-white/[0.08] bg-[#111827] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                  Name
                </th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                  Email
                </th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                  Role
                </th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                  Primary
                </th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-[#94A3B8] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {contacts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-[#94A3B8]"
                  >
                    No contacts added yet
                  </td>
                </tr>
              ) : (
                contacts.map((c) => (
                  <tr
                    key={c.id}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-[#F1F5F9]">
                      {c.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-[#94A3B8]">
                      {c.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-[#3B9EFF]/15 px-2.5 py-0.5 text-xs font-medium text-[#3B9EFF]">
                        {c.role?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <button
                        onClick={() => togglePrimary(c)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          c.is_primary ? 'bg-[#22C55E]' : 'bg-white/[0.1]'
                        }`}
                        role="switch"
                        aria-checked={c.is_primary}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                            c.is_primary ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          className="rounded-md p-2 text-[#94A3B8] hover:bg-white/[0.06] hover:text-[#F1F5F9]"
                          aria-label="Edit contact"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {deleteConfirm === c.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="rounded-md bg-red-500/20 p-2 text-red-400 hover:bg-red-500/30"
                              aria-label="Confirm delete"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="rounded-md p-2 text-[#94A3B8] hover:bg-white/[0.06]"
                              aria-label="Cancel delete"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(c.id)}
                            className="rounded-md p-2 text-[#94A3B8] hover:bg-red-500/20 hover:text-red-400"
                            aria-label="Delete contact"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
