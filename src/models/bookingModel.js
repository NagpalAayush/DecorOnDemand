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

const bookingRequestFields = `
  bookings.id,
  bookings.user_id AS userId,
  users.name AS customerName,
  users.email AS customerEmail,
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
  latitude,
  longitude,
}) {
  const database = getDatabase()
  const id = randomUUID()
  const [listings] = await database.execute(
    `SELECT price, latitude, longitude, service_radius_km AS serviceRadiusKm FROM listings
     WHERE id = ? AND listing_status = 'published' AND approval_status = 'approved'`,
    [listingId],
  )

  if (listings.length === 0) return null

  const listing = listings[0]
  const listingLatitude = Number(listing.latitude)
  const listingLongitude = Number(listing.longitude)
  const serviceRadiusKm = Number(listing.serviceRadiusKm)
  if (!Number.isFinite(listingLatitude)
    || !Number.isFinite(listingLongitude)
    || !Number.isFinite(serviceRadiusKm)) {
    return { outsideServiceArea: true }
  }

  const latitudeDifference = (Number(latitude) - listingLatitude) * Math.PI / 180
  const longitudeDifference = (Number(longitude) - listingLongitude) * Math.PI / 180
  const originLatitude = listingLatitude * Math.PI / 180
  const destinationLatitude = Number(latitude) * Math.PI / 180
  const distanceKm = 6371 * 2 * Math.asin(Math.sqrt(
    Math.sin(latitudeDifference / 2) ** 2
      + Math.cos(originLatitude) * Math.cos(destinationLatitude)
      * Math.sin(longitudeDifference / 2) ** 2,
  ))

  if (distanceKm > serviceRadiusKm) {
    return { outsideServiceArea: true, distanceKm, serviceRadiusKm }
  }

  await database.execute(
    `INSERT INTO bookings
      (id, user_id, listing_id, event_date, event_time, address, city, notes, price_at_booking)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, listingId, eventDate, eventTime || null, address, city || null, notes || null, listing.price],
  )

  const [rows] = await database.execute(
    `SELECT ${bookingFields}
     FROM bookings
     INNER JOIN listings ON listings.id = bookings.listing_id
     WHERE bookings.id = ?`,
    [id],
  )
  return { booking: normalizeBooking(rows[0]) }
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

export async function findBookingRequestsByListerId(listerId) {
  const database = getDatabase()
  const [rows] = await database.execute(
    `SELECT ${bookingRequestFields}
     FROM bookings
     INNER JOIN listings ON listings.id = bookings.listing_id
     INNER JOIN users ON users.id = bookings.user_id
     WHERE listings.user_id = ?
     ORDER BY bookings.event_date ASC, bookings.created_at DESC`,
    [listerId],
  )
  return rows.map(normalizeBooking)
}

export async function updateBookingStatus(bookingId, listerId, status) {
  const database = getDatabase()
  const [result] = await database.execute(
    `UPDATE bookings
     INNER JOIN listings ON listings.id = bookings.listing_id
     SET bookings.status = ?
     WHERE bookings.id = ? AND listings.user_id = ? AND bookings.status = 'pending'`,
    [status, bookingId, listerId],
  )

  return result.affectedRows > 0
}
