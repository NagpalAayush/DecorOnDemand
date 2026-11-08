import 'dotenv/config'
import mysql from 'mysql2/promise'

const databaseName = process.env.MYSQL_DATABASE || 'decorondemand'
const connectionConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
}

let pool


export async function initializeDatabase() {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``)
  } finally {
    await connection.end()
  }

  pool = mysql.createPool({
    ...connectionConfig,
    database: databaseName,
    waitForConnections: true,
    connectionLimit: 10,
  })

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
      name VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE,
      is_admin BOOLEAN DEFAULT FALSE,
      is_lister BOOLEAN DEFAULT FALSE
    )
  `)

  const [userColumns] = await pool.query(
    `SELECT COUNT(*) AS column_count
     FROM information_schema.columns
     WHERE table_schema = ? AND table_name = 'users' AND column_name = 'is_lister'`,
    [databaseName],
  )

  if (userColumns[0].column_count === 0) {
    await pool.query('ALTER TABLE users ADD COLUMN is_lister BOOLEAN DEFAULT FALSE')
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS listings (
      id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
      user_id CHAR(36) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      location VARCHAR(255) NOT NULL,
      city VARCHAR(100),
      images JSON,
      listing_status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
      approval_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
      rejection_reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_listings_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      INDEX idx_listings_user_id (user_id),
      INDEX idx_listings_category (category),
      INDEX idx_listings_city (city),
      INDEX idx_listings_status (listing_status)
    )
  `)

  const [approvalColumns] = await pool.query(
    `SELECT COUNT(*) AS column_count
     FROM information_schema.columns
     WHERE table_schema = ? AND table_name = 'listings' AND column_name = 'approval_status'`,
    [databaseName],
  )

  if (approvalColumns[0].column_count === 0) {
    await pool.query("ALTER TABLE listings ADD COLUMN approval_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending'")
    await pool.query('ALTER TABLE listings ADD COLUMN rejection_reason TEXT')
  }

  const [listingAvailabilityColumns] = await pool.query(
    `SELECT COUNT(*) AS column_count
     FROM information_schema.columns
     WHERE table_schema = ? AND table_name = 'listings' AND column_name = 'availability_status'`,
    [databaseName],
  )

  if (listingAvailabilityColumns[0].column_count > 0) {
    const [availabilityIndexes] = await pool.query(
      `SELECT COUNT(*) AS index_count
       FROM information_schema.statistics
       WHERE table_schema = ? AND table_name = 'listings' AND index_name = 'idx_listings_status'`,
      [databaseName],
    )

    if (availabilityIndexes[0].index_count > 0) {
      await pool.query('ALTER TABLE listings DROP INDEX idx_listings_status')
    }

    await pool.query('ALTER TABLE listings DROP COLUMN availability_status')
    await pool.query('ALTER TABLE listings ADD INDEX idx_listings_status (listing_status)')
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id CHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
      user_id CHAR(36) NOT NULL,
      listing_id CHAR(36) NOT NULL,
      event_date DATE NOT NULL,
      event_time TIME,
      address VARCHAR(500) NOT NULL,
      city VARCHAR(100),
      notes TEXT,
      price_at_booking DECIMAL(10, 2) NOT NULL,
      status ENUM('pending', 'confirmed', 'rejected', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_bookings_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT fk_bookings_listing
        FOREIGN KEY (listing_id) REFERENCES listings(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
      INDEX idx_bookings_user_id (user_id),
      INDEX idx_bookings_listing_id (listing_id),
      INDEX idx_bookings_event_date (event_date),
      INDEX idx_bookings_status (status)
    )
  `)

  const [bookingQuantityColumns] = await pool.query(
    `SELECT COUNT(*) AS column_count
     FROM information_schema.columns
     WHERE table_schema = ? AND table_name = 'bookings' AND column_name = 'quantity'`,
    [databaseName],
  )

  if (bookingQuantityColumns[0].column_count > 0) {
    await pool.query('ALTER TABLE bookings DROP COLUMN quantity')
  }

  console.log(`Database "${databaseName}", users, listings, and bookings tables are ready.`)
}

export function getDatabase() {
  if (!pool) {
    throw new Error('Database has not been initialized.')
  }

  return pool
}
