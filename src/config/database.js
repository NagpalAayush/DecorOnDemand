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
      is_admin BOOLEAN DEFAULT FALSE
    )
  `)

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
      availability_status ENUM('available', 'unavailable') NOT NULL DEFAULT 'available',
      listing_status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_listings_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      INDEX idx_listings_user_id (user_id),
      INDEX idx_listings_category (category),
      INDEX idx_listings_city (city),
      INDEX idx_listings_status (listing_status, availability_status)
    )
  `)

  console.log(`Database "${databaseName}", users table, and listings table are ready.`)
}

export function getDatabase() {
  if (!pool) {
    throw new Error('Database has not been initialized.')
  }

  return pool
}
