export const DEMO_MODE = true;

export const DEMO_HOTEL = {
  id: 'demo-hotel-1',
  name: 'Hyatt Regency Sofia',
  address: '3 Maria Luiza Blvd, Sofia 1000, Bulgaria',
  city: 'Sofia',
  country: 'Bulgaria',
  star_rating: 5,
  total_rooms: 120,
  available_rooms: 47,
  price_per_room_eur: 89,
  pricing_mode: 'manual' as 'manual' | 'booking_com' | 'channel_mgr',
  booking_com_discount_pct: 12,
  commission_rate: 8,
  is_active: true,
  accept_requests: true,
  breakfast_included: true,
  auto_confirm: false,
  sms_alerts: true,
  show_on_map: true,
  phone: '+359 2 234 1234',
  email: 'reservations@hyatt-sofia.com',
  website: 'hyatt.com/sofia',
  checkin_time: '14:00',
  checkout_time: '12:00',
  max_pax_per_room: 2,
};

export const DEMO_AIRLINE = {
  id: 'demo-airline-1',
  name: 'Bulgaria Air',
  iata_code: 'FB',
  ops_contact_email: 'ops@air.bg',
};

export const DEMO_LAYOVER_EVENTS = [
  { id: 'e1', flight_number: 'LZ481', pax_count: 52, status: 'pending', detected_at: new Date(Date.now() - 4 * 60000).toISOString(), airline_name: 'Bulgaria Air', rooms_needed: 26, airport_code: 'SOF', amount_eur: 0 },
  { id: 'e2', flight_number: 'W64455', pax_count: 38, status: 'confirmed', detected_at: new Date(Date.now() - 14 * 60000).toISOString(), airline_name: 'Wizz Air', rooms_needed: 19, amount_eur: 1691, airport_code: 'SOF' },
  { id: 'e3', flight_number: 'TK1234', pax_count: 67, status: 'booking_in_progress', detected_at: new Date(Date.now() - 2 * 60000).toISOString(), airline_name: 'Turkish Airlines', rooms_needed: 34, airport_code: 'SOF', amount_eur: 0 },
  { id: 'e4', flight_number: 'OS801', pax_count: 22, status: 'confirmed', detected_at: new Date(Date.now() - 45 * 60000).toISOString(), airline_name: 'Austrian Airlines', rooms_needed: 11, amount_eur: 979, airport_code: 'SOF' },
  { id: 'e5', flight_number: 'RY2234', pax_count: 189, status: 'pending', detected_at: new Date(Date.now() - 1 * 60000).toISOString(), airline_name: 'Ryanair', rooms_needed: 95, airport_code: 'SOF', amount_eur: 0 },
];

export const DEMO_HOTELS_NEARBY = [
  { id: 'h1', name: 'Hyatt Regency Sofia', stars: 5, available_rooms: 47, price: 89, owned: true },
  { id: 'h2', name: 'Hilton Sofia', stars: 5, available_rooms: 23, price: 110, owned: false },
  { id: 'h3', name: 'Radisson Blu', stars: 4, available_rooms: 61, price: 79, owned: false },
  { id: 'h4', name: 'InterContinental', stars: 5, available_rooms: 12, price: 135, owned: false },
  { id: 'h5', name: 'Marinela Hotel', stars: 4, available_rooms: 34, price: 65, owned: false },
];

export const DEMO_BOOKING_HISTORY = [
  { day: 'Mon', rooms: 12 },
  { day: 'Tue', rooms: 8 },
  { day: 'Wed', rooms: 23 },
  { day: 'Thu', rooms: 15 },
  { day: 'Fri', rooms: 19 },
  { day: 'Sat', rooms: 31 },
  { day: 'Sun', rooms: 14 },
];

export const DEMO_ROOMS = Array.from({ length: 120 }, (_, i) => ({
  number: 100 + i + 1,
  floor: Math.floor(i / 20) + 1,
  status: (i < 73 ? 'occupied' : i < 113 ? 'available' : 'blocked') as 'occupied' | 'available' | 'blocked',
  type: (i % 3 === 0 ? 'double' : 'single') as 'double' | 'single',
}));

export function timeAgo(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export type DemoHotel = typeof DEMO_HOTEL;
export type DemoEvent = (typeof DEMO_LAYOVER_EVENTS)[number];
export type DemoNearbyHotel = (typeof DEMO_HOTELS_NEARBY)[number];
export type DemoRoom = (typeof DEMO_ROOMS)[number];
