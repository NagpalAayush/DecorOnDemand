import { randomUUID } from 'node:crypto'
import { getDatabase } from '../config/database.js'

const bookingFields = `
  bookings.id,
  bookings.user_id AS userId,
  bookings.listing_id AS listingId,
  listings.title AS listingTitle,
  listings.images AS listingImages,
  listings.location AS listingLocation,
  bookings.event_date AS eventDate,
  bookings.event_time AS eventTime,
  bookings.address,
  bookings.city,
  bookings.notes,
  bookings.price_at_booking AS priceAtBooking,
  bookings.status,
  bookings.created_at AS createdAt,
  bookings.updated_at AS updatedAt
`

function normalizeBooking(booking) {
  return {
    ...booking,
    listingImages: typeof booking.listingImages === 'string'
      ? JSON.parse(booking.listingImages)
      : (booking.listingImages || []),
  }
}

export async function createBooking({
  userId,
  listingId,
  eventDate,
  eventTime,
  address,
  city,
  notes,
}) {
  const database = getDatabase()
  const id = randomUUID()
  const [listings] = await database.execute(
    `SELECT price FROM listings
     WHERE id = ? AND listing_status = 'published' AND approval_status = 'approved'`,
    [listingId],
  )

  if (listings.length === 0) return null

  await database.execute(
    `INSERT INTO bookings
      (id, user_id, listing_id, event_date, event_time, address, city, notes, price_at_booking)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, listingId, eventDate, eventTime || null, address, city || null, notes || null, listings[0].price],
  )

  const [rows] = await database.execute(
    `SELECT ${bookingFields}
     FROM bookings
     INNER JOIN listings ON listings.id = bookings.listing_id
     WHERE bookings.id = ?`,
    [id],
  )
  return normalizeBooking(rows[0])
}

export async function findBookingsByUserId(userId) {
  const database = getDatabase()
  const [rows] = await database.execute(
    `SELECT ${bookingFields}
     FROM bookings
     INNER JOIN listings ON listings.id = bookings.listing_id
     WHERE bookings.user_id = ?
     ORDER BY bookings.event_date ASC, bookings.created_at DESC`,
    [userId],
  )
  return rows.map(normalizeBooking)
}
