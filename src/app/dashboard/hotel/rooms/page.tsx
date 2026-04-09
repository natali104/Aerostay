'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Modal,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@/components/ui/modal'
import { formatCurrency } from '@/lib/utils'
import {
  BedDouble,
  Users,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react'

interface RoomType {
  id: string
  hotel_id: string
  name: string
  max_occupancy: number
  total_rooms: number
  base_price: number
  amenities: string[]
  description: string | null
}

const COMMON_AMENITIES = [
  'WiFi',
  'TV',
  'Air Conditioning',
  'Mini Bar',
  'Room Service',
  'Safe',
  'Coffee Maker',
  'Iron',
  'Hair Dryer',
  'Bathrobe',
  'Balcony',
  'Ocean View',
  'Desk',
  'Refrigerator',
]

export default function RoomsPage() {
  const supabase = createClient()

  const [hotelId, setHotelId] = useState<string | null>(null)
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [modal, setModal] = useState<{
    open: boolean
    mode: 'add' | 'edit'
    roomType?: RoomType
  }>({ open: false, mode: 'add' })

  const [formName, setFormName] = useState('')
  const [formOccupancy, setFormOccupancy] = useState('2')
  const [formTotalRooms, setFormTotalRooms] = useState('10')
  const [formBasePrice, setFormBasePrice] = useState('100')
  const [formDescription, setFormDescription] = useState('')
  const [formAmenities, setFormAmenities] = useState<string[]>([])

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('hotel_id')
      .eq('id', user.id)
      .single()

    if (!profile?.hotel_id) return
    setHotelId(profile.hotel_id)

    const { data } = await supabase
      .from('room_types')
      .select('*')
      .eq('hotel_id', profile.hotel_id)
      .order('name')

    setRoomTypes(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  function openAddModal() {
    setFormName('')
    setFormOccupancy('2')
    setFormTotalRooms('10')
    setFormBasePrice('100')
    setFormDescription('')
    setFormAmenities([])
    setModal({ open: true, mode: 'add' })
  }

  function openEditModal(rt: RoomType) {
    setFormName(rt.name)
    setFormOccupancy(rt.max_occupancy.toString())
    setFormTotalRooms(rt.total_rooms.toString())
    setFormBasePrice(rt.base_price.toString())
    setFormDescription(rt.description ?? '')
    setFormAmenities(rt.amenities ?? [])
    setModal({ open: true, mode: 'edit', roomType: rt })
  }

  function toggleAmenity(amenity: string) {
    setFormAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!hotelId) return
    setSaving(true)

    const payload = {
      hotel_id: hotelId,
      name: formName,
      max_occupancy: parseInt(formOccupancy),
      total_rooms: parseInt(formTotalRooms),
      base_price: parseFloat(formBasePrice),
      description: formDescription || null,
      amenities: formAmenities,
    }

    if (modal.mode === 'edit' && modal.roomType) {
      await supabase
        .from('room_types')
        .update(payload)
        .eq('id', modal.roomType.id)
    } else {
      await supabase.from('room_types').insert(payload)
    }

    setModal({ open: false, mode: 'add' })
    setSaving(false)
    loadData()
  }

  async function handleDelete(id: string) {
    await supabase.from('room_types').delete().eq('id', id)
    setDeleteConfirm(null)
    loadData()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Room Management</h1>
          <p className="mt-1 text-gray-500">
            Configure your room types and amenities
          </p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="mr-2 h-4 w-4" />
          Add Room Type
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400">Loading rooms...</div>
      ) : roomTypes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roomTypes.map((rt) => (
            <Card key={rt.id} className="relative">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BedDouble className="h-5 w-5 text-[#38bdf8]" />
                  {rt.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gray-50 p-3 text-center">
                    <Users className="mx-auto mb-1 h-4 w-4 text-gray-400" />
                    <p className="text-lg font-bold text-[#1e3a5f]">
                      {rt.max_occupancy}
                    </p>
                    <p className="text-xs text-gray-500">Max Guests</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 text-center">
                    <BedDouble className="mx-auto mb-1 h-4 w-4 text-gray-400" />
                    <p className="text-lg font-bold text-[#1e3a5f]">
                      {rt.total_rooms}
                    </p>
                    <p className="text-xs text-gray-500">Total Rooms</p>
                  </div>
                </div>

                <div className="rounded-lg border border-[#38bdf8]/20 bg-sky-50/50 p-3 text-center">
                  <p className="text-xs text-gray-500">Base Price / Night</p>
                  <p className="text-xl font-bold text-[#1e3a5f]">
                    {formatCurrency(rt.base_price)}
                  </p>
                </div>

                {rt.amenities && rt.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {rt.amenities.slice(0, 6).map((amenity) => (
                      <Badge key={amenity} variant="default" className="text-[10px]">
                        {amenity}
                      </Badge>
                    ))}
                    {rt.amenities.length > 6 && (
                      <Badge variant="info" className="text-[10px]">
                        +{rt.amenities.length - 6} more
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditModal(rt)}
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => setDeleteConfirm(rt.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <BedDouble className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-gray-500">No room types configured yet</p>
            <Button className="mt-4" onClick={openAddModal}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Room Type
            </Button>
          </CardContent>
        </Card>
      )}

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, mode: 'add' })}
        className="max-w-xl"
      >
        <ModalTitle>
          {modal.mode === 'edit' ? 'Edit Room Type' : 'Add Room Type'}
        </ModalTitle>
        <form onSubmit={handleSubmit}>
          <ModalBody className="space-y-4">
            <Input
              label="Room Type Name"
              placeholder="e.g. Deluxe King"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Max Occupancy"
                type="number"
                min="1"
                value={formOccupancy}
                onChange={(e) => setFormOccupancy(e.target.value)}
                required
              />
              <Input
                label="Total Rooms"
                type="number"
                min="1"
                value={formTotalRooms}
                onChange={(e) => setFormTotalRooms(e.target.value)}
                required
              />
              <Input
                label="Base Price"
                type="number"
                step="0.01"
                min="0"
                value={formBasePrice}
                onChange={(e) => setFormBasePrice(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                className="flex min-h-[60px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-[#38bdf8] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30"
                placeholder="Brief description of this room type..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Amenities
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_AMENITIES.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      formAmenities.includes(amenity)
                        ? 'border-[#38bdf8] bg-[#38bdf8]/10 text-[#1e3a5f]'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModal({ open: false, mode: 'add' })}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {modal.mode === 'edit' ? 'Save Changes' : 'Add Room Type'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      <Modal
        open={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
      >
        <ModalTitle>Delete Room Type</ModalTitle>
        <ModalBody>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this room type? This action cannot be
            undone and will remove all associated availability data.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
