'use client'

import { useState, useRef, useCallback, useMemo, type DragEvent } from 'react'
import {
  Upload,
  Check,
  FileText,
  Download,
  Mail,
  Users,
  Plane,
  Hotel,
  Calendar,
  Clock,
  AlertCircle,
} from 'lucide-react'
import Papa from 'papaparse'
import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'
import JSZip from 'jszip'
import { createClient } from '@/lib/supabase/client'
import { formatEuro, formatDate } from '@/lib/format'

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  layover: any
  booking: any
  existingPassengers: any[]
  roomTypes: any[]
}
/* eslint-enable @typescript-eslint/no-explicit-any */

interface ParsedPassenger {
  first_name: string
  last_name: string
  seat_number: string
  passport_last4: string
  room_type: 'single' | 'double'
}

interface AssignedPassenger extends ParsedPassenger {
  room_number: string
  voucher_code: string
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  detected: { bg: 'bg-slate-500/20', text: 'text-slate-300', label: 'Detected' },
  notified: { bg: 'bg-[#3B9EFF]/20', text: 'text-[#3B9EFF]', label: 'Notified' },
  booking_in_progress: { bg: 'bg-[#F5A623]/20', text: 'text-[#F5A623]', label: 'Booking in Progress' },
  booked: { bg: 'bg-[#22C55E]/20', text: 'text-[#22C55E]', label: 'Booked' },
  confirmed: { bg: 'bg-[#22C55E]/20', text: 'text-[#22C55E]', label: 'Confirmed' },
  cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Cancelled' },
}

function generateVoucherCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `AERO-${code}`
}

export function LayoverDetail({ layover, booking, existingPassengers, roomTypes }: Props) {
  const hasExistingPassengers = existingPassengers.length > 0
  const initialStep = hasExistingPassengers ? 3 : 1

  const [currentStep, setCurrentStep] = useState(initialStep)
  const [parsedRows, setParsedRows] = useState<ParsedPassenger[]>([])
  const [assignedPassengers, setAssignedPassengers] = useState<AssignedPassenger[]>(
    hasExistingPassengers
      ? existingPassengers.map((p) => ({
          first_name: p.first_name,
          last_name: p.last_name,
          seat_number: p.seat_number ?? '',
          passport_last4: p.passport_last4 ?? '',
          room_type: p.room_type ?? 'single',
          room_number: p.room_number ?? '',
          voucher_code: p.voucher_code ?? generateVoucherCode(),
        }))
      : []
  )
  const [isDragOver, setIsDragOver] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [vouchersGenerated, setVouchersGenerated] = useState(hasExistingPassengers)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const airport = layover.airports
    ? Array.isArray(layover.airports)
      ? layover.airports[0]
      : layover.airports
    : null
  const hotel = booking?.hotels
    ? Array.isArray(booking.hotels)
      ? booking.hotels[0]
      : booking.hotels
    : null

  const roomMap = useMemo(() => {
    const map: { number: string; type: string; maxOccupancy: number; blocked: boolean }[] = []
    if (!roomTypes.length) return map
    for (const rt of roomTypes) {
      const totalRooms = rt.total_rooms ?? 20
      const floor = rt.name?.toLowerCase().includes('double') ? 2 : 1
      for (let i = 1; i <= totalRooms; i++) {
        map.push({
          number: `${floor}${String(i).padStart(2, '0')}`,
          type: rt.name ?? 'Standard',
          maxOccupancy: rt.max_occupancy ?? 1,
          blocked: false,
        })
      }
    }
    return map
  }, [roomTypes])

  const assignmentMap = useMemo(() => {
    const m = new Map<string, AssignedPassenger[]>()
    for (const p of assignedPassengers) {
      if (p.room_number) {
        const existing = m.get(p.room_number) ?? []
        existing.push(p)
        m.set(p.room_number, existing)
      }
    }
    return m
  }, [assignedPassengers])

  const unassignedPassengers = useMemo(
    () => assignedPassengers.filter((p) => !p.room_number),
    [assignedPassengers]
  )

  // CSV parsing
  const handleFile = useCallback((file: File) => {
    setParseError(null)
    if (!file.name.endsWith('.csv')) {
      setParseError('Please upload a .csv file')
      return
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, string>[]
        if (rows.length === 0) {
          setParseError('CSV file is empty')
          return
        }
        const required = ['first_name', 'last_name']
        const headers = Object.keys(rows[0])
        const missing = required.filter((h) => !headers.includes(h))
        if (missing.length > 0) {
          setParseError(`Missing required columns: ${missing.join(', ')}`)
          return
        }
        const passengers: ParsedPassenger[] = rows.map((r) => ({
          first_name: r.first_name?.trim() ?? '',
          last_name: r.last_name?.trim() ?? '',
          seat_number: r.seat_number?.trim() ?? '',
          passport_last4: r.passport_last4?.trim() ?? '',
          room_type: (r.room_type?.trim() as 'single' | 'double') || 'single',
        }))
        setParsedRows(passengers)
      },
      error: () => setParseError('Failed to parse CSV file'),
    })
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => setIsDragOver(false), [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  // Step transitions
  const goToStep2 = useCallback(() => {
    const assigned: AssignedPassenger[] = parsedRows.map((p) => ({
      ...p,
      room_number: '',
      voucher_code: generateVoucherCode(),
    }))
    setAssignedPassengers(assigned)
    setCurrentStep(2)
  }, [parsedRows])

  const autoAssignRooms = useCallback(() => {
    const singles = assignedPassengers.filter((p) => p.room_type === 'single')
    const doubles = assignedPassengers.filter((p) => p.room_type === 'double')

    const singleRooms = roomMap.filter((r) => r.maxOccupancy === 1 && !r.blocked)
    const doubleRooms = roomMap.filter((r) => r.maxOccupancy >= 2 && !r.blocked)
    const allRooms = roomMap.filter((r) => !r.blocked)

    const usedRooms = new Set<string>()
    const updated = [...assignedPassengers]

    // Assign singles first
    let singleIdx = 0
    for (const p of singles) {
      const idx = updated.findIndex(
        (u) => u.first_name === p.first_name && u.last_name === p.last_name && u.seat_number === p.seat_number
      )
      if (idx === -1) continue
      const available = (singleRooms.length > 0 ? singleRooms : allRooms).filter(
        (r) => !usedRooms.has(r.number)
      )
      if (singleIdx < available.length) {
        updated[idx] = { ...updated[idx], room_number: available[singleIdx].number }
        usedRooms.add(available[singleIdx].number)
        singleIdx++
      }
    }

    // Assign doubles in pairs
    let doubleIdx = 0
    const availableDoubles = doubleRooms.filter((r) => !usedRooms.has(r.number))
    const fallbackRooms = allRooms.filter((r) => !usedRooms.has(r.number))
    const doublePool = availableDoubles.length > 0 ? availableDoubles : fallbackRooms

    for (let i = 0; i < doubles.length; i++) {
      const idx = updated.findIndex(
        (u) =>
          u.first_name === doubles[i].first_name &&
          u.last_name === doubles[i].last_name &&
          u.seat_number === doubles[i].seat_number &&
          !u.room_number
      )
      if (idx === -1) continue

      // Pair up: two people per double room
      if (i % 2 === 0 && doubleIdx < doublePool.length) {
        updated[idx] = { ...updated[idx], room_number: doublePool[doubleIdx].number }
      } else if (i % 2 === 1 && doubleIdx < doublePool.length) {
        updated[idx] = { ...updated[idx], room_number: doublePool[doubleIdx].number }
        usedRooms.add(doublePool[doubleIdx].number)
        doubleIdx++
      }
    }

    // Fallback: assign any remaining unassigned to any available room
    for (let i = 0; i < updated.length; i++) {
      if (!updated[i].room_number) {
        const remaining = allRooms.filter((r) => !usedRooms.has(r.number))
        if (remaining.length > 0) {
          updated[i] = { ...updated[i], room_number: remaining[0].number }
          usedRooms.add(remaining[0].number)
        }
      }
    }

    setAssignedPassengers(updated)
  }, [assignedPassengers, roomMap])

  // Drag & drop room assignment
  const handlePassengerDragStart = useCallback(
    (e: DragEvent<HTMLDivElement>, idx: number) => {
      e.dataTransfer.setData('text/plain', String(idx))
      e.dataTransfer.effectAllowed = 'move'
    },
    []
  )

  const handleRoomDrop = useCallback(
    (e: DragEvent<HTMLDivElement>, roomNumber: string) => {
      e.preventDefault()
      const pIdx = parseInt(e.dataTransfer.getData('text/plain'), 10)
      if (isNaN(pIdx)) return
      setAssignedPassengers((prev) =>
        prev.map((p, i) => (i === pIdx ? { ...p, room_number: roomNumber } : p))
      )
    },
    []
  )

  // Save passengers to Supabase
  const savePassengers = useCallback(async () => {
    if (!booking) return
    setIsSaving(true)
    try {
      const supabase = createClient()
      const rows = assignedPassengers.map((p) => ({
        booking_request_id: booking.id,
        first_name: p.first_name,
        last_name: p.last_name,
        seat_number: p.seat_number || null,
        passport_last4: p.passport_last4 || null,
        room_number: p.room_number || null,
        room_type: p.room_type,
        voucher_code: p.voucher_code,
      }))
      await supabase.from('passengers').delete().eq('booking_request_id', booking.id)
      await supabase.from('passengers').insert(rows)
      setCurrentStep(3)
    } finally {
      setIsSaving(false)
    }
  }, [assignedPassengers, booking])

  // PDF generation for a single voucher page
  const renderVoucherPage = useCallback(
    async (doc: jsPDF, passenger: AssignedPassenger, qrDataUrl: string) => {
      const w = 148
      const h = 210

      // Dark header
      doc.setFillColor(13, 20, 38)
      doc.rect(0, 0, w, 30, 'F')
      doc.setTextColor(59, 158, 255)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('\u2726 AEROSTAY', w / 2, 19, { align: 'center' })

      // Title
      doc.setTextColor(30, 41, 59)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('HOTEL ACCOMMODATION VOUCHER', w / 2, 44, { align: 'center' })

      // Divider
      doc.setDrawColor(200, 200, 200)
      doc.line(14, 50, w - 14, 50)

      // Passenger name
      doc.setFontSize(18)
      doc.setTextColor(15, 23, 42)
      doc.text(`${passenger.first_name} ${passenger.last_name}`, w / 2, 62, { align: 'center' })

      // Details grid
      const leftX = 16
      const rightX = w / 2 + 4
      let y = 76

      const addField = (label: string, value: string, x: number, yPos: number) => {
        doc.setFontSize(8)
        doc.setTextColor(148, 163, 184)
        doc.setFont('helvetica', 'normal')
        doc.text(label, x, yPos)
        doc.setFontSize(11)
        doc.setTextColor(30, 41, 59)
        doc.setFont('helvetica', 'bold')
        doc.text(value || '—', x, yPos + 5)
      }

      addField('FLIGHT', layover.flight_number ?? '', leftX, y)
      addField('DATE', booking?.check_in ? formatDate(booking.check_in) : '—', rightX, y)
      y += 16
      addField('HOTEL', hotel?.name ?? '', leftX, y)
      addField('ADDRESS', hotel?.address ?? '', rightX, y)
      y += 16
      addField('ROOM', passenger.room_number, leftX, y)
      addField('TYPE', passenger.room_type === 'double' ? 'Double' : 'Single', rightX, y)
      y += 16
      addField('CHECK-IN', booking?.check_in ? formatDate(booking.check_in) : '—', leftX, y)
      addField('CHECK-OUT', booking?.check_out ? formatDate(booking.check_out) : '—', rightX, y)
      y += 16
      addField('SEAT', passenger.seat_number || '—', leftX, y)
      addField('BREAKFAST', 'Included', rightX, y)

      // QR code
      doc.addImage(qrDataUrl, 'PNG', w - 50, h - 60, 35, 35)

      // Voucher code
      doc.setFontSize(8)
      doc.setFont('courier', 'normal')
      doc.setTextColor(59, 158, 255)
      doc.text(`VOUCHER: ${passenger.voucher_code}`, w - 50, h - 20)

      // Footer
      doc.setFontSize(7)
      doc.setTextColor(148, 163, 184)
      doc.setFont('helvetica', 'normal')
      doc.text(
        'Issued in compliance with EU Regulation 261/2004 \u00B7 Powered by AeroStay',
        w / 2,
        h - 8,
        { align: 'center' }
      )
    },
    [layover, booking, hotel]
  )

  const generateQR = useCallback(
    async (passenger: AssignedPassenger): Promise<string> => {
      return QRCode.toDataURL(
        JSON.stringify({
          voucher: passenger.voucher_code,
          name: `${passenger.first_name} ${passenger.last_name}`,
          flight: layover.flight_number,
          room: passenger.room_number,
          hotel: hotel?.name,
        }),
        { width: 200, margin: 1 }
      )
    },
    [layover, hotel]
  )

  const generateAllVouchers = useCallback(async () => {
    setIsGenerating(true)
    setGenerationProgress(0)
    const total = assignedPassengers.length
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [148, 210] })

    for (let i = 0; i < total; i++) {
      if (i > 0) doc.addPage([148, 210])
      const qrDataUrl = await generateQR(assignedPassengers[i])
      await renderVoucherPage(doc, assignedPassengers[i], qrDataUrl)
      setGenerationProgress(i + 1)
      // Yield to UI
      await new Promise((r) => setTimeout(r, 10))
    }

    setIsGenerating(false)
    setVouchersGenerated(true)
  }, [assignedPassengers, generateQR, renderVoucherPage])

  const downloadCombinedPDF = useCallback(async () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [148, 210] })
    for (let i = 0; i < assignedPassengers.length; i++) {
      if (i > 0) doc.addPage([148, 210])
      const qrDataUrl = await generateQR(assignedPassengers[i])
      await renderVoucherPage(doc, assignedPassengers[i], qrDataUrl)
    }
    doc.save(`Vouchers_Flight_${layover.flight_number}.pdf`)
  }, [assignedPassengers, generateQR, renderVoucherPage, layover])

  const downloadZIP = useCallback(async () => {
    const zip = new JSZip()
    for (let i = 0; i < assignedPassengers.length; i++) {
      const p = assignedPassengers[i]
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [148, 210] })
      const qrDataUrl = await generateQR(p)
      await renderVoucherPage(doc, p, qrDataUrl)
      const blob = doc.output('blob')
      zip.file(`Voucher_${p.last_name}_${p.voucher_code}.pdf`, blob)
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Vouchers_Flight_${layover.flight_number}.zip`
    a.click()
    URL.revokeObjectURL(url)
  }, [assignedPassengers, generateQR, renderVoucherPage, layover])

  const sendEmail = useCallback(async () => {
    setSendingEmail(true)
    try {
      await fetch('/api/vouchers/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightNumber: layover.flight_number,
          airlineEmail: booking?.contact_email ?? '',
          bookingId: booking?.id,
        }),
      })
      setEmailSent(true)
    } finally {
      setSendingEmail(false)
    }
  }, [layover, booking])

  const steps = [
    { num: 1, label: 'Upload CSV' },
    { num: 2, label: 'Review & Assign' },
    { num: 3, label: 'Generate Vouchers' },
  ]

  const singleCount = assignedPassengers.filter((p) => p.room_type === 'single').length
  const doubleCount = assignedPassengers.filter((p) => p.room_type === 'double').length

  return (
    <div className="space-y-6">
      {/* LAYOVER SUMMARY CARD */}
      <div className="rounded-xl border border-white/[0.08] bg-[#111827] p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Left: Flight info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#94A3B8]">
              <Plane className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Flight</span>
            </div>
            <p className="text-3xl font-bold text-[#F1F5F9]">{layover.flight_number}</p>
            {airport && (
              <p className="text-sm text-[#94A3B8]">
                {airport.name} ({airport.iata_code}) · {airport.city}
              </p>
            )}
            {layover.origin_airport && layover.destination_airport && (
              <p className="text-sm text-[#94A3B8]">
                {layover.origin_airport} → {layover.destination_airport}
              </p>
            )}
            {layover.detected_at && (
              <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                <Clock className="h-3 w-3" />
                Detected {formatDate(layover.detected_at)}
              </div>
            )}
          </div>

          {/* Center: Pax count & status */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="flex items-center gap-2 text-[#94A3B8]">
              <Users className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider">Passengers</span>
            </div>
            <p className="text-5xl font-bold text-[#F1F5F9]">{layover.passenger_count ?? 0}</p>
            {layover.status && (
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  statusColors[layover.status]?.bg ?? 'bg-slate-500/20'
                } ${statusColors[layover.status]?.text ?? 'text-slate-300'}`}
              >
                {statusColors[layover.status]?.label ?? layover.status}
              </span>
            )}
          </div>

          {/* Right: Booking info */}
          <div className="space-y-3">
            {booking && hotel ? (
              <>
                <div className="flex items-center gap-2 text-[#94A3B8]">
                  <Hotel className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wider">Accommodation</span>
                </div>
                <p className="text-lg font-semibold text-[#F1F5F9]">{hotel.name}</p>
                {hotel.star_rating && (
                  <p className="text-sm text-[#F5A623]">
                    {'★'.repeat(hotel.star_rating)}{'☆'.repeat(5 - hotel.star_rating)}
                  </p>
                )}
                <p className="text-sm text-[#94A3B8]">{hotel.address}</p>
                <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                  <Calendar className="h-3 w-3" />
                  {booking.check_in ? formatDate(booking.check_in) : '—'} →{' '}
                  {booking.check_out ? formatDate(booking.check_out) : '—'}
                </div>
                {booking.total_amount && (
                  <p className="text-lg font-semibold text-[#22C55E]">
                    {formatEuro(Number(booking.total_amount))}
                  </p>
                )}
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-[#94A3B8]">
                <AlertCircle className="mb-2 h-8 w-8 opacity-40" />
                <p className="text-sm">No confirmed booking yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Only show manifest flow if booking exists */}
      {booking ? (
        <>
          {/* STEP PROGRESS BAR */}
          <div className="flex items-center justify-center gap-0">
            {steps.map((step, i) => (
              <div key={step.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                      currentStep > step.num
                        ? 'border-[#22C55E] bg-[#22C55E]/20 text-[#22C55E]'
                        : currentStep === step.num
                          ? 'border-[#3B9EFF] bg-[#3B9EFF]/20 text-[#3B9EFF]'
                          : 'border-white/[0.12] bg-transparent text-[#94A3B8]'
                    }`}
                  >
                    {currentStep > step.num ? <Check className="h-4 w-4" /> : step.num}
                  </div>
                  <span
                    className={`mt-1.5 text-xs font-medium ${
                      currentStep >= step.num ? 'text-[#F1F5F9]' : 'text-[#94A3B8]'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`mx-3 h-0.5 w-16 sm:w-24 ${
                      currentStep > step.num ? 'bg-[#22C55E]' : 'bg-white/[0.08]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* STEP 1: UPLOAD CSV */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div
                className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
                  isDragOver
                    ? 'border-[#3B9EFF] bg-[rgba(59,158,255,0.08)]'
                    : 'border-[rgba(59,158,255,0.3)] bg-[rgba(59,158,255,0.03)]'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mb-3 h-10 w-10 text-[#3B9EFF] opacity-60" />
                <p className="text-sm font-medium text-[#F1F5F9]">
                  Drop passenger CSV here or click to browse
                </p>
                <p className="mt-1 text-xs text-[#94A3B8]">Accepts .csv files only</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </div>

              {parseError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {parseError}
                </div>
              )}

              {/* CSV format example */}
              <div className="rounded-lg border border-white/[0.08] bg-[#0A0F1E] p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                  Expected CSV Format
                </p>
                <pre className="overflow-x-auto text-xs text-[#94A3B8]">
{`first_name,last_name,seat_number,passport_last4,room_type
John,Doe,12A,4567,single
Jane,Smith,12B,8901,double`}
                </pre>
              </div>

              {/* Preview table */}
              {parsedRows.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-[#F1F5F9]">
                    Preview ({parsedRows.length} passengers)
                  </p>
                  <div className="overflow-hidden rounded-lg border border-white/[0.08]">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-white/[0.08] bg-[#0A0F1E]">
                          <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                            Name
                          </th>
                          <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                            Seat
                          </th>
                          <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                            Passport
                          </th>
                          <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                            Room Type
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06]">
                        {parsedRows.slice(0, 5).map((p, i) => (
                          <tr key={i} className="hover:bg-white/[0.02]">
                            <td className="px-4 py-2.5 text-[#F1F5F9]">
                              {p.first_name} {p.last_name}
                            </td>
                            <td className="px-4 py-2.5 text-[#94A3B8]">{p.seat_number || '—'}</td>
                            <td className="px-4 py-2.5 text-[#94A3B8]">
                              {p.passport_last4 ? `••••${p.passport_last4}` : '—'}
                            </td>
                            <td className="px-4 py-2.5">
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                  p.room_type === 'double'
                                    ? 'bg-[#F5A623]/20 text-[#F5A623]'
                                    : 'bg-[#3B9EFF]/20 text-[#3B9EFF]'
                                }`}
                              >
                                {p.room_type}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedRows.length > 5 && (
                    <p className="text-xs text-[#94A3B8]">
                      and {parsedRows.length - 5} more passengers…
                    </p>
                  )}
                  <button
                    onClick={goToStep2}
                    className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#3B9EFF] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3B9EFF]/90"
                  >
                    Continue to Room Assignment →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: ROOM ASSIGNMENT */}
          {currentStep === 2 && (
            <div className="space-y-5">
              {/* Summary line */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-[#94A3B8]">
                <span>
                  Total passengers: <strong className="text-[#F1F5F9]">{assignedPassengers.length}</strong>
                </span>
                <span>·</span>
                <span>
                  Single rooms: <strong className="text-[#3B9EFF]">{singleCount}</strong>
                </span>
                <span>·</span>
                <span>
                  Double rooms: <strong className="text-[#F5A623]">{doubleCount}</strong>
                </span>
                <span>·</span>
                <span>
                  Unassigned: <strong className="text-red-400">{unassignedPassengers.length}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Room grid */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[#F1F5F9]">Room Grid</p>
                    <button
                      onClick={autoAssignRooms}
                      className="rounded-lg border border-[#3B9EFF]/30 bg-[#3B9EFF]/10 px-3 py-1.5 text-xs font-medium text-[#3B9EFF] transition-colors hover:bg-[#3B9EFF]/20"
                    >
                      Auto-assign Rooms
                    </button>
                  </div>

                  {roomMap.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {roomMap.map((room) => {
                        const occupants = assignmentMap.get(room.number) ?? []
                        const isAssigned = occupants.length > 0
                        const isBlocked = room.blocked
                        return (
                          <div
                            key={room.number}
                            className={`flex h-14 w-14 flex-col items-center justify-center rounded-lg border text-center transition-colors ${
                              isBlocked
                                ? 'border-red-500/40 bg-red-500/15 cursor-not-allowed'
                                : isAssigned
                                  ? 'border-[#3B9EFF] bg-[rgba(59,158,255,0.2)]'
                                  : 'border-white/[0.08] bg-[#1a2035] hover:border-[#3B9EFF]/40'
                            }`}
                            onDragOver={(e) => {
                              if (!isBlocked) e.preventDefault()
                            }}
                            onDrop={(e) => {
                              if (!isBlocked) handleRoomDrop(e, room.number)
                            }}
                          >
                            {isBlocked ? (
                              <span className="text-xs font-bold text-red-400">X</span>
                            ) : isAssigned ? (
                              <>
                                <span className="text-[10px] font-bold text-[#3B9EFF]">
                                  {occupants.map((o) => `${o.first_name[0]}${o.last_name[0]}`).join(' ')}
                                </span>
                                <span className="text-[9px] text-[#94A3B8]">{room.number}</span>
                              </>
                            ) : (
                              <span className="text-xs text-[#94A3B8]">{room.number}</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-white/[0.08] bg-[#0A0F1E] p-8 text-center text-sm text-[#94A3B8]">
                      No room types configured for this hotel. Using auto-generated room numbers.
                    </div>
                  )}

                  {/* If no room types, show auto-generated grid */}
                  {roomMap.length === 0 && (
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: Math.max(assignedPassengers.length, 20) }, (_, i) => {
                        const roomNum = `${Math.floor(i / 20) + 1}${String((i % 20) + 1).padStart(2, '0')}`
                        const occupants = assignedPassengers.filter((p) => p.room_number === roomNum)
                        const isAssigned = occupants.length > 0
                        return (
                          <div
                            key={roomNum}
                            className={`flex h-14 w-14 flex-col items-center justify-center rounded-lg border text-center transition-colors ${
                              isAssigned
                                ? 'border-[#3B9EFF] bg-[rgba(59,158,255,0.2)]'
                                : 'border-white/[0.08] bg-[#1a2035] hover:border-[#3B9EFF]/40'
                            }`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleRoomDrop(e, roomNum)}
                          >
                            {isAssigned ? (
                              <>
                                <span className="text-[10px] font-bold text-[#3B9EFF]">
                                  {occupants.map((o) => `${o.first_name[0]}${o.last_name[0]}`).join(' ')}
                                </span>
                                <span className="text-[9px] text-[#94A3B8]">{roomNum}</span>
                              </>
                            ) : (
                              <span className="text-xs text-[#94A3B8]">{roomNum}</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Passenger list (draggable) */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[#F1F5F9]">
                    Passengers ({unassignedPassengers.length} unassigned)
                  </p>
                  <div className="max-h-[500px] space-y-1.5 overflow-y-auto pr-1">
                    {assignedPassengers.map((p, i) => (
                      <div
                        key={i}
                        draggable={!p.room_number}
                        onDragStart={(e) => handlePassengerDragStart(e as DragEvent<HTMLDivElement>, i)}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                          p.room_number
                            ? 'border-[#22C55E]/30 bg-[#22C55E]/5 cursor-default'
                            : 'border-white/[0.08] bg-[#1a2035] cursor-grab active:cursor-grabbing hover:border-[#3B9EFF]/40'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-[#F1F5F9]">
                            {p.first_name} {p.last_name}
                          </p>
                          <p className="text-xs text-[#94A3B8]">
                            {p.seat_number || 'No seat'} ·{' '}
                            <span
                              className={
                                p.room_type === 'double' ? 'text-[#F5A623]' : 'text-[#3B9EFF]'
                              }
                            >
                              {p.room_type}
                            </span>
                          </p>
                        </div>
                        {p.room_number ? (
                          <span className="shrink-0 rounded bg-[#22C55E]/20 px-2 py-0.5 text-xs font-medium text-[#22C55E]">
                            {p.room_number}
                          </span>
                        ) : (
                          <span className="shrink-0 text-xs text-[#94A3B8]">drag →</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="rounded-lg border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-[#94A3B8] transition-colors hover:bg-white/[0.04] hover:text-[#F1F5F9]"
                >
                  ← Back
                </button>
                <button
                  onClick={savePassengers}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#3B9EFF] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3B9EFF]/90 disabled:opacity-50"
                >
                  {isSaving ? 'Saving…' : 'Confirm Assignments →'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: GENERATE VOUCHERS */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Passenger summary */}
              <div className="rounded-xl border border-white/[0.08] bg-[#111827] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#F1F5F9]">
                      {assignedPassengers.length} passengers assigned
                    </p>
                    <p className="mt-0.5 text-xs text-[#94A3B8]">
                      {assignedPassengers.filter((p) => p.room_number).length} with room assignments
                    </p>
                  </div>
                  {!hasExistingPassengers && (
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-xs text-[#3B9EFF] hover:underline"
                    >
                      Edit Assignments
                    </button>
                  )}
                </div>

                {/* Compact passenger table */}
                <div className="mt-4 max-h-[300px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.08]">
                        <th className="pb-2 pr-4 font-medium text-[#94A3B8]">Name</th>
                        <th className="pb-2 pr-4 font-medium text-[#94A3B8]">Seat</th>
                        <th className="pb-2 pr-4 font-medium text-[#94A3B8]">Room</th>
                        <th className="pb-2 pr-4 font-medium text-[#94A3B8]">Type</th>
                        <th className="pb-2 font-medium text-[#94A3B8]">Voucher</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {assignedPassengers.map((p, i) => (
                        <tr key={i}>
                          <td className="py-1.5 pr-4 text-[#F1F5F9]">
                            {p.first_name} {p.last_name}
                          </td>
                          <td className="py-1.5 pr-4 text-[#94A3B8]">{p.seat_number || '—'}</td>
                          <td className="py-1.5 pr-4 font-medium text-[#3B9EFF]">
                            {p.room_number || '—'}
                          </td>
                          <td className="py-1.5 pr-4 text-[#94A3B8]">{p.room_type}</td>
                          <td className="py-1.5 font-mono text-[10px] text-[#94A3B8]">
                            {p.voucher_code}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Generation controls */}
              {!vouchersGenerated ? (
                <div className="space-y-4">
                  <button
                    onClick={generateAllVouchers}
                    disabled={isGenerating}
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#3B9EFF] px-6 py-4 text-base font-bold text-white transition-colors hover:bg-[#3B9EFF]/90 disabled:opacity-60"
                  >
                    <FileText className="h-5 w-5" />
                    {isGenerating ? 'Generating…' : 'Generate All Vouchers'}
                  </button>

                  {isGenerating && (
                    <div className="space-y-2">
                      <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                        <div
                          className="h-full rounded-full bg-[#3B9EFF] transition-all duration-300"
                          style={{
                            width: `${(generationProgress / assignedPassengers.length) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-center text-xs text-[#94A3B8]">
                        Generating voucher {generationProgress} of {assignedPassengers.length}…
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Success banner */}
                  <div className="flex items-center gap-3 rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/10 px-5 py-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#22C55E]/20">
                      <Check className="h-4 w-4 text-[#22C55E]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#22C55E]">
                        {assignedPassengers.length} vouchers generated
                      </p>
                      <p className="text-xs text-[#94A3B8]">
                        All passenger vouchers are ready for download
                      </p>
                    </div>
                  </div>

                  {/* Download buttons */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <button
                      onClick={downloadZIP}
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-[#111827] px-4 py-3.5 text-sm font-semibold text-[#F1F5F9] transition-colors hover:bg-white/[0.04]"
                    >
                      <Download className="h-4 w-4 text-[#3B9EFF]" />
                      Download ZIP
                    </button>
                    <button
                      onClick={downloadCombinedPDF}
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-[#111827] px-4 py-3.5 text-sm font-semibold text-[#F1F5F9] transition-colors hover:bg-white/[0.04]"
                    >
                      <FileText className="h-4 w-4 text-[#F5A623]" />
                      Download Combined PDF
                    </button>
                    <button
                      onClick={sendEmail}
                      disabled={sendingEmail || emailSent}
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-[#111827] px-4 py-3.5 text-sm font-semibold text-[#F1F5F9] transition-colors hover:bg-white/[0.04] disabled:opacity-50"
                    >
                      <Mail className="h-4 w-4 text-[#22C55E]" />
                      {emailSent ? 'Email Sent ✓' : sendingEmail ? 'Sending…' : 'Send to Airline Email'}
                    </button>
                  </div>

                  {/* Regenerate option */}
                  <div className="pt-2 text-center">
                    <button
                      onClick={() => {
                        setVouchersGenerated(false)
                        setEmailSent(false)
                      }}
                      className="text-xs text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
                    >
                      Regenerate vouchers
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-white/[0.08] bg-[#111827] p-12 text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-[#94A3B8] opacity-40" />
          <p className="text-lg font-medium text-[#F1F5F9]">No Confirmed Booking</p>
          <p className="mt-1 text-sm text-[#94A3B8]">
            Passenger manifest upload will be available once a booking is confirmed for this layover.
          </p>
        </div>
      )}
    </div>
  )
}
