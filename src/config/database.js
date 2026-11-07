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

  console.log(`Database "${databaseName}" and users table are ready.`)
}

export function getDatabase() {
  if (!pool) {
    throw new Error('Database has not been initialized.')
  }

  return pool
}
