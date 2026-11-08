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
  images,
  listingStatus,
}) {
  const id = randomUUID()
  const database = getDatabase()

  await database.execute(
    `INSERT INTO listings
      (id, user_id, title, description, category, price, location, city, images, listing_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      userId,
      title,
      description || null,
      category,
      price,
      location,
      city || null,
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

export async function findPublishedListings() {
  const database = getDatabase()
  const [rows] = await database.execute(
    `SELECT ${listingFields}
     FROM listings
     WHERE listings.listing_status = 'published'
       AND listings.approval_status = 'approved'
     ORDER BY listings.created_at DESC`,
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
