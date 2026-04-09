'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Save,
  Settings2,
  Percent,
  Info,
} from 'lucide-react'

interface Hotel {
  id: string
  name: string
  address: string
  city: string
  country: string
  description: string | null
  amenities: string[]
  contact_email: string | null
  contact_phone: string | null
  website: string | null
  pricing_method: string
  partner_discount: number | null
  commission_rate: number | null
  star_rating: number | null
}

const HOTEL_AMENITIES = [
  'Pool',
  'Gym',
  'Spa',
  'Restaurant',
  'Bar',
  'Business Center',
  'Parking',
  'Airport Shuttle',
  'Concierge',
  'Laundry Service',
  'Room Service',
  '24h Front Desk',
  'Meeting Rooms',
  'Luggage Storage',
  'Pet Friendly',
  'EV Charging',
]

const PRICING_METHODS = [
  { value: 'manual', label: 'Manual Pricing' },
  { value: 'booking_com', label: 'Booking.com Integration' },
  { value: 'channel_manager', label: 'Channel Manager' },
]

export default function SettingsPage() {
  const supabase = createClient()

  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [description, setDescription] = useState('')
  const [amenities, setAmenities] = useState<string[]>([])
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [pricingMethod, setPricingMethod] = useState('manual')
  const [partnerDiscount, setPartnerDiscount] = useState('0')

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

    const { data: hotelData } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', profile.hotel_id)
      .single()

    if (hotelData) {
      setHotel(hotelData)
      setName(hotelData.name ?? '')
      setAddress(hotelData.address ?? '')
      setCity(hotelData.city ?? '')
      setCountry(hotelData.country ?? '')
      setDescription(hotelData.description ?? '')
      setAmenities(hotelData.amenities ?? [])
      setContactEmail(hotelData.contact_email ?? '')
      setContactPhone(hotelData.contact_phone ?? '')
      setWebsite(hotelData.website ?? '')
      setPricingMethod(hotelData.pricing_method ?? 'manual')
      setPartnerDiscount((hotelData.partner_discount ?? 0).toString())
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  function toggleAmenity(amenity: string) {
    setAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    )
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!hotel) return
    setSaving(true)
    setSaved(false)

    await supabase
      .from('hotels')
      .update({
        name,
        address,
        city,
        country,
        description: description || null,
        amenities,
        contact_email: contactEmail || null,
        contact_phone: contactPhone || null,
        website: website || null,
        pricing_method: pricingMethod,
        partner_discount:
          pricingMethod === 'booking_com'
            ? parseFloat(partnerDiscount) || 0
            : null,
      })
      .eq('id', hotel.id)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-400">Loading settings...</div>
    )
  }

  if (!hotel) {
    return (
      <div className="py-20 text-center text-gray-400">
        Hotel not found
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Hotel Settings</h1>
          <p className="mt-1 text-gray-500">
            Manage your hotel profile and configuration
          </p>
        </div>
        {saved && (
          <Badge variant="success" className="text-sm">
            Settings saved successfully
          </Badge>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#38bdf8]" />
              Hotel Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Hotel Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              icon={<MapPin className="h-4 w-4" />}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <Input
                label="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                className="flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-[#38bdf8] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30"
                placeholder="Describe your hotel, location, and unique selling points..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {HOTEL_AMENITIES.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    amenities.includes(amenity)
                      ? 'border-[#38bdf8] bg-[#38bdf8]/10 text-[#1e3a5f]'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-[#38bdf8]" />
              Pricing Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Pricing Method"
              value={pricingMethod}
              onChange={(e) => setPricingMethod(e.target.value)}
              options={PRICING_METHODS}
            />

            {pricingMethod === 'booking_com' && (
              <div className="rounded-lg border border-sky-200 bg-sky-50/50 p-4">
                <p className="mb-3 flex items-center gap-2 text-sm font-medium text-[#1e3a5f]">
                  <Percent className="h-4 w-4" />
                  Booking.com Partner Discount
                </p>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={partnerDiscount}
                  onChange={(e) => setPartnerDiscount(e.target.value)}
                  placeholder="e.g. 15"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Percentage discount off Booking.com public rates offered to
                  airline partners through AeroStay
                </p>
              </div>
            )}

            {pricingMethod === 'channel_manager' && (
              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                <p className="flex items-center gap-2 text-sm text-amber-700">
                  <Info className="h-4 w-4" />
                  Channel Manager rates are synchronized automatically. Contact
                  support to configure your integration.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-[#38bdf8]" />
              Commission Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Platform Commission
                  </p>
                  <p className="text-xs text-gray-500">
                    Set by AeroStay admin. Contact support for adjustments.
                  </p>
                </div>
                <p className="text-2xl font-bold text-[#1e3a5f]">
                  {hotel.commission_rate != null
                    ? `${(hotel.commission_rate * 100).toFixed(1)}%`
                    : 'Not set'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-[#38bdf8]" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Contact Email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              icon={<Mail className="h-4 w-4" />}
            />
            <Input
              label="Contact Phone"
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              icon={<Phone className="h-4 w-4" />}
            />
            <Input
              label="Website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              icon={<Globe className="h-4 w-4" />}
              placeholder="https://..."
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" loading={saving}>
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  )
}
