'use client'

import { useState } from 'react'
import { UserPlus } from 'lucide-react'

interface Contact {
  id: string
  name: string
  email: string
  role: string
  primary: boolean
}

const INITIAL_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Maria Petrova',
    email: 'maria@bulgariaair.bg',
    role: 'Operations Manager',
    primary: true,
  },
  {
    id: '2',
    name: 'Ivan Dimitrov',
    email: 'ivan@bulgariaair.bg',
    role: 'Dispatch Lead',
    primary: false,
  },
  {
    id: '3',
    name: 'Elena Todorova',
    email: 'elena@bulgariaair.bg',
    role: 'Ground Ops',
    primary: false,
  },
]

export default function AirlineContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', role: '' })

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.role) return
    setContacts((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: form.name,
        email: form.email,
        role: form.role,
        primary: false,
      },
    ])
    setForm({ name: '', email: '', role: '' })
    setShowForm(false)
  }

  function togglePrimary(id: string) {
    setContacts((prev) =>
      prev.map((c) => ({
        ...c,
        primary: c.id === id ? !c.primary : c.primary,
      }))
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>
            Contacts
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
            Manage notification contacts for layover alerts
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: '#0EA5E9' }}
        >
          <UserPlus className="h-4 w-4" />
          Add Contact
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div
          className="rounded-xl bg-white p-5"
          style={{ border: '1px solid #E2E8F0' }}
        >
          <h3
            className="mb-4 text-sm font-semibold"
            style={{ color: '#0F172A' }}
          >
            New Contact
          </h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label
                  className="mb-1.5 block text-xs font-medium"
                  style={{ color: '#64748B' }}
                >
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Full name"
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    color: '#0F172A',
                  }}
                />
              </div>
              <div>
                <label
                  className="mb-1.5 block text-xs font-medium"
                  style={{ color: '#64748B' }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder="email@airline.com"
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    color: '#0F172A',
                  }}
                />
              </div>
              <div>
                <label
                  className="mb-1.5 block text-xs font-medium"
                  style={{ color: '#64748B' }}
                >
                  Role
                </label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  required
                  placeholder="e.g. Dispatch Lead"
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    color: '#0F172A',
                  }}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: '#0EA5E9' }}
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium"
                style={{ color: '#64748B', border: '1px solid #E2E8F0' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div
        className="overflow-hidden rounded-xl bg-white"
        style={{ border: '1px solid #E2E8F0' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                {['Name', 'Email', 'Role', 'Primary'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#64748B' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contacts.map((c, idx) => (
                <tr
                  key={c.id}
                  className="transition-colors hover:bg-[#F8FAFC]"
                  style={{
                    borderBottom:
                      idx < contacts.length - 1
                        ? '1px solid #F1F5F9'
                        : undefined,
                  }}
                >
                  <td
                    className="whitespace-nowrap px-5 py-3.5 font-semibold"
                    style={{ color: '#0F172A' }}
                  >
                    {c.name}
                  </td>
                  <td
                    className="whitespace-nowrap px-5 py-3.5"
                    style={{ color: '#64748B' }}
                  >
                    {c.email}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: 'rgba(14,165,233,0.1)',
                        color: '#0369A1',
                      }}
                    >
                      {c.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <button
                      onClick={() => togglePrimary(c.id)}
                      className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200"
                      style={{
                        backgroundColor: c.primary ? '#22C55E' : '#E2E8F0',
                      }}
                      role="switch"
                      aria-checked={c.primary}
                    >
                      <span
                        className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
                        style={{
                          transform: c.primary
                            ? 'translateX(20px)'
                            : 'translateX(0)',
                        }}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
