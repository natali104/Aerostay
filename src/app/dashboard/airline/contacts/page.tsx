'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Modal, ModalTitle, ModalBody, ModalFooter } from '@/components/ui/modal'
import { UserPlus, Pencil, Trash2, Mail, Shield } from 'lucide-react'

interface Contact {
  id: string
  name: string
  email: string
  role: string
  is_primary: boolean
}

const roleOptions = [
  { value: 'operations', label: 'Operations' },
  { value: 'crew_manager', label: 'Crew Manager' },
  { value: 'dispatch', label: 'Dispatch' },
  { value: 'admin', label: 'Admin' },
  { value: 'other', label: 'Other' },
]

export default function AirlineContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [airlineId, setAirlineId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', role: 'operations', is_primary: false })
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const loadContacts = useCallback(async () => {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
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

  function openAddModal() {
    setEditingContact(null)
    setFormData({ name: '', email: '', role: 'operations', is_primary: false })
    setModalOpen(true)
  }

  function openEditModal(contact: Contact) {
    setEditingContact(contact)
    setFormData({
      name: contact.name,
      email: contact.email,
      role: contact.role,
      is_primary: contact.is_primary,
    })
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!airlineId) return
    setSubmitting(true)

    const supabase = createClient()

    if (formData.is_primary) {
      await supabase
        .from('airline_contacts')
        .update({ is_primary: false })
        .eq('airline_id', airlineId)
    }

    if (editingContact) {
      await supabase
        .from('airline_contacts')
        .update({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          is_primary: formData.is_primary,
        })
        .eq('id', editingContact.id)
    } else {
      await supabase.from('airline_contacts').insert({
        airline_id: airlineId,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        is_primary: formData.is_primary,
      })
    }

    setModalOpen(false)
    setSubmitting(false)
    loadContacts()
  }

  async function handleDelete(contactId: string) {
    const supabase = createClient()
    await supabase.from('airline_contacts').delete().eq('id', contactId)
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
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1e3a5f] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Contacts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage contacts who receive layover booking notifications
          </p>
        </div>
        <Button onClick={openAddModal} size="md">
          <UserPlus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Notification Recipients
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <div className="py-12 text-center">
              <Mail className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">No contacts added yet</p>
              <p className="mt-1 text-xs text-gray-400">
                Add contacts to receive layover booking notifications via email
              </p>
              <Button onClick={openAddModal} variant="outline" size="sm" className="mt-4">
                <UserPlus className="h-4 w-4" />
                Add First Contact
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Primary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell className="text-gray-600">{contact.email}</TableCell>
                    <TableCell>
                      <Badge variant="info">
                        {contact.role?.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => togglePrimary(contact)}
                        className="flex items-center gap-1 text-sm"
                      >
                        <Shield
                          className={`h-4 w-4 ${
                            contact.is_primary
                              ? 'fill-emerald-500 text-emerald-500'
                              : 'text-gray-300'
                          }`}
                        />
                        {contact.is_primary && (
                          <span className="text-xs text-emerald-600">Primary</span>
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(contact)}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          aria-label="Edit contact"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {deleteConfirm === contact.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(contact.id)}
                              className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(contact.id)}
                            className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            aria-label="Delete contact"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalTitle>{editingContact ? 'Edit Contact' : 'Add Contact'}</ModalTitle>
        <form onSubmit={handleSubmit}>
          <ModalBody className="space-y-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Jane Smith"
            />
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="jane@airline.com"
            />
            <Select
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={roleOptions}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.is_primary}
                onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-[#1e3a5f] focus:ring-[#38bdf8]"
              />
              <span className="text-gray-700">Set as primary contact</span>
            </label>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingContact ? 'Update' : 'Add'} Contact
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  )
}
