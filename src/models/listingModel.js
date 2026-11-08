import { randomUUID } from 'node:crypto'
import { getDatabase } from '../config/database.js'

const listingFields = `
  listings.id,
  listings.user_id AS userId,
  listings.title,
  listings.description,
  listings.category,
  listings.price,
  listings.location,
  listings.city,
  listings.latitude,
  listings.longitude,
  listings.service_radius_km AS serviceRadiusKm,
  listings.images,
  listings.listing_status AS listingStatus,
  listings.approval_status AS approvalStatus,
  listings.rejection_reason AS rejectionReason,
  listings.created_at AS createdAt,
  listings.updated_at AS updatedAt
`

function normalizeListing(listing) {
  return {
    ...listing,
    images: typeof listing.images === 'string' ? JSON.parse(listing.images) : (listing.images || []),
  }
}

export async function createListing({
  userId,
  title,
  description,
  category,
  price,
  location,
  city,
  latitude,
  longitude,
  serviceRadiusKm,
  images,
  listingStatus,
}) {
  const id = randomUUID()
  const database = getDatabase()

  await database.execute(
    `INSERT INTO listings
      (id, user_id, title, description, category, price, location, city, latitude, longitude, service_radius_km, images, listing_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
    [
      id,
      userId,
      title,
      description || null,
      category,
      price,
      location,
      city || null,
      latitude,
      longitude,
      serviceRadiusKm,
      JSON.stringify(images),
      listingStatus,
    ],
  )

  const [rows] = await database.execute(`SELECT ${listingFields} FROM listings WHERE id = ?`, [id])
  return normalizeListing(rows[0])
}

export async function findListingsByUserId(userId) {
  const database = getDatabase()
  const [rows] = await database.execute(
    `SELECT ${listingFields} FROM listings WHERE user_id = ? ORDER BY created_at DESC`,
    [userId],
  )
  return rows.map(normalizeListing)
}

export async function findPublishedListingsByUserId(userId) {
  const database = getDatabase()
  const [rows] = await database.execute(
    `SELECT ${listingFields}
     FROM listings
     WHERE user_id = ? AND listing_status = 'published' AND approval_status = 'approved'
     ORDER BY created_at DESC`,
    [userId],
  )
  return rows.map(normalizeListing)
}

export async function findPublishedListings({ city = null, latitude = null, longitude = null } = {}) {
  const database = getDatabase()
  const [rows] = await database.execute(
    `SELECT ${listingFields}
     FROM listings
     WHERE listings.listing_status = 'published'
       AND listings.approval_status = 'approved'
       AND (
         (? IS NOT NULL AND ? IS NOT NULL AND
          6371 * 2 * ASIN(SQRT(
            POW(SIN(RADIANS(listings.latitude - ?) / 2), 2) +
            COS(RADIANS(?)) * COS(RADIANS(listings.latitude)) *
            POW(SIN(RADIANS(listings.longitude - ?) / 2), 2)
          )) <= listings.service_radius_km)
         OR
         (? IS NULL OR ? IS NULL) AND (? IS NULL OR LOWER(TRIM(listings.city)) = LOWER(TRIM(?)))
       )
     ORDER BY listings.created_at DESC`,
    [latitude, longitude, latitude, latitude, longitude, longitude, latitude, longitude, city, city],
  )
  return rows.map(normalizeListing)
}

export async function findPublishedListingById(listingId) {
  const database = getDatabase()
  const [rows] = await database.execute(
    `SELECT ${listingFields}
     FROM listings
     WHERE listings.id = ? AND listings.listing_status = 'published'
       AND listings.approval_status = 'approved'`,
    [listingId],
  )
  return rows[0] ? normalizeListing(rows[0]) : null
}

export async function findListingsForApproval() {
  const database = getDatabase()
  const [rows] = await database.execute(
    `SELECT ${listingFields}, users.name AS listerName, users.email AS listerEmail
     FROM listings
     INNER JOIN users ON users.id = listings.user_id
     WHERE listings.approval_status = 'pending'
     ORDER BY listings.created_at ASC`,
  )
  return rows.map(normalizeListing)
}

export async function updateListingApproval(listingId, approvalStatus, rejectionReason = null) {
  const database = getDatabase()
  const [result] = await database.execute(
    `UPDATE listings
     SET approval_status = ?, rejection_reason = ?
     WHERE id = ?`,
    [approvalStatus, rejectionReason, listingId],
  )
  return result.affectedRows > 0
}
