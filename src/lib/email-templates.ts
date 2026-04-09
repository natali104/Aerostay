const BRAND_NAVY = '#1e3a5f'
const BRAND_SKY = '#38bdf8'

function layout(body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fa;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:${BRAND_NAVY};padding:28px 32px;border-radius:12px 12px 0 0;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">✈ AeroStay</h1>
            <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">Airline Layover Hotel Booking</p>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;">
            ${body}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">© ${new Date().getFullYear()} AeroStay. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function button(text: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:${BRAND_SKY};color:#0f172a;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin:8px 0;">${text}</a>`
}

function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 12px;color:#64748b;font-size:14px;border-bottom:1px solid #f1f5f9;">${label}</td>
    <td style="padding:8px 12px;color:#1e293b;font-size:14px;font-weight:500;border-bottom:1px solid #f1f5f9;">${value}</td>
  </tr>`
}

function infoTable(rows: [string, string][]): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
    ${rows.map(([label, value]) => infoRow(label, value)).join('')}
  </table>`
}

export function layoverDetectedEmail(data: {
  airlineName: string
  flightNumber: string
  origin: string
  destination: string
  passengerCount: number
  reason: string
  estimatedDeparture: string
}): { subject: string; html: string } {
  return {
    subject: `🚨 Layover Detected — ${data.flightNumber} at Sofia Airport`,
    html: layout(`
      <h2 style="margin:0 0 8px;color:${BRAND_NAVY};font-size:20px;">New Layover Detected</h2>
      <p style="margin:0 0 16px;color:#475569;font-size:15px;">A flight disruption has been detected requiring hotel accommodation for passengers.</p>
      ${infoTable([
        ['Airline', data.airlineName],
        ['Flight', data.flightNumber],
        ['Route', `${data.origin} → ${data.destination}`],
        ['Passengers', String(data.passengerCount)],
        ['Reason', data.reason],
        ['Est. Departure', data.estimatedDeparture],
      ])}
      <p style="margin:16px 0 0;color:#475569;font-size:14px;">A booking link has been sent to the airline's operations team. Hotel partners near the airport have been notified.</p>
    `),
  }
}

export function bookingLinkEmail(data: {
  contactName: string
  flightNumber: string
  passengerCount: number
  bookingUrl: string
}): { subject: string; html: string } {
  return {
    subject: `Book Hotels for ${data.flightNumber} — ${data.passengerCount} Passengers`,
    html: layout(`
      <h2 style="margin:0 0 8px;color:${BRAND_NAVY};font-size:20px;">Book Hotel Rooms</h2>
      <p style="margin:0 0 16px;color:#475569;font-size:15px;">Hi ${data.contactName},</p>
      <p style="margin:0 0 16px;color:#475569;font-size:15px;">Flight <strong>${data.flightNumber}</strong> requires hotel accommodation for <strong>${data.passengerCount} passengers</strong>. Use the link below to browse available hotels and submit a booking request.</p>
      <div style="text-align:center;margin:24px 0;">${button('Book Hotels Now', data.bookingUrl)}</div>
      <p style="margin:16px 0 0;color:#94a3b8;font-size:13px;">This link expires in 48 hours. If you have any issues, contact our support team.</p>
    `),
  }
}

export function newBookingRequestEmail(data: {
  hotelName: string
  airlineName: string
  flightNumber: string
  guestCount: number
  checkIn: string
  checkOut: string
  totalAmount: string
  dashboardUrl: string
}): { subject: string; html: string } {
  return {
    subject: `📋 New Booking Request from ${data.airlineName} — ${data.guestCount} guests`,
    html: layout(`
      <h2 style="margin:0 0 8px;color:${BRAND_NAVY};font-size:20px;">New Booking Request</h2>
      <p style="margin:0 0 16px;color:#475569;font-size:15px;">You have received a new booking request for <strong>${data.hotelName}</strong>.</p>
      ${infoTable([
        ['Airline', data.airlineName],
        ['Flight', data.flightNumber],
        ['Guests', String(data.guestCount)],
        ['Check-in', data.checkIn],
        ['Check-out', data.checkOut],
        ['Total Amount', data.totalAmount],
      ])}
      <div style="text-align:center;margin:24px 0;">${button('View & Respond', data.dashboardUrl)}</div>
      <p style="margin:16px 0 0;color:#94a3b8;font-size:13px;">Please respond within 30 minutes to secure this booking.</p>
    `),
  }
}

export function bookingConfirmedEmail(data: {
  airlineName: string
  hotelName: string
  flightNumber: string
  guestCount: number
  checkIn: string
  checkOut: string
  totalAmount: string
  contactName: string
}): { subject: string; html: string } {
  return {
    subject: `✅ Booking Confirmed — ${data.hotelName} for ${data.flightNumber}`,
    html: layout(`
      <h2 style="margin:0 0 8px;color:${BRAND_NAVY};font-size:20px;">Booking Confirmed</h2>
      <p style="margin:0 0 16px;color:#475569;font-size:15px;">Hi ${data.contactName},</p>
      <p style="margin:0 0 16px;color:#475569;font-size:15px;">Great news! <strong>${data.hotelName}</strong> has confirmed your booking request.</p>
      ${infoTable([
        ['Hotel', data.hotelName],
        ['Flight', data.flightNumber],
        ['Guests', String(data.guestCount)],
        ['Check-in', data.checkIn],
        ['Check-out', data.checkOut],
        ['Total', data.totalAmount],
      ])}
      <p style="margin:16px 0 0;color:#475569;font-size:14px;">The hotel is prepared to receive your passengers. Shuttle and check-in details will follow.</p>
    `),
  }
}

export function negotiationEmail(data: {
  recipientName: string
  proposedBy: string
  proposedPrice: string
  message: string
  hotelName: string
  flightNumber: string
  dashboardUrl: string
}): { subject: string; html: string } {
  return {
    subject: `💬 Counter-offer on booking — ${data.hotelName} / ${data.flightNumber}`,
    html: layout(`
      <h2 style="margin:0 0 8px;color:${BRAND_NAVY};font-size:20px;">New Counter-Offer</h2>
      <p style="margin:0 0 16px;color:#475569;font-size:15px;">Hi ${data.recipientName},</p>
      <p style="margin:0 0 16px;color:#475569;font-size:15px;">The <strong>${data.proposedBy}</strong> has submitted a counter-offer on the booking for <strong>${data.flightNumber}</strong> at <strong>${data.hotelName}</strong>.</p>
      ${infoTable([
        ['Proposed Price', data.proposedPrice],
        ['Message', data.message || '—'],
      ])}
      <div style="text-align:center;margin:24px 0;">${button('View & Respond', data.dashboardUrl)}</div>
    `),
  }
}
