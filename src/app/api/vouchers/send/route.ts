import { NextRequest, NextResponse } from 'next/server'
import { getResend, FROM_EMAIL } from '@/lib/resend'

export async function POST(request: NextRequest) {
  const { flightNumber, airlineEmail } = await request.json()

  if (!flightNumber || !airlineEmail) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: airlineEmail,
      subject: `Passenger Vouchers Ready — Flight ${flightNumber}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0D1426;padding:20px 30px;text-align:center">
          <span style="color:#3B9EFF;font-size:18px;font-weight:bold">&#10022; AEROSTAY</span>
        </div>
        <div style="padding:30px;background:#ffffff">
          <h2 style="color:#1e3a5f;margin-bottom:16px">Passenger Vouchers Ready</h2>
          <p style="color:#475569;line-height:1.6">
            The hotel accommodation vouchers for <strong>Flight ${flightNumber}</strong> have been generated and are ready for download.
          </p>
          <p style="color:#475569;line-height:1.6">
            Each passenger has been assigned a room with an individual voucher containing a QR code for hotel check-in.
          </p>
          <div style="text-align:center;margin:24px 0">
            <a href="https://aerostay.app/dashboard/airline/bookings" style="background:#3B9EFF;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
              View Vouchers on Dashboard
            </a>
          </div>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px">
            Vouchers comply with EU Regulation 261/2004 requirements.
          </p>
        </div>
        <div style="background:#f8fafc;padding:16px 30px;text-align:center;font-size:11px;color:#94a3b8">
          Powered by AeroStay &middot; aerostay.app
        </div>
      </div>`,
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
