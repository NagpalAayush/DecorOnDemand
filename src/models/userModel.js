import { randomUUID } from 'node:crypto'
import { getDatabase } from '../config/database.js'

export async function createUser(name, hashedPassword, email) {
  const id = randomUUID()
  const database = getDatabase()
  const createdAt = new Date()
  const isActive = true
  const isAdmin = false

  await database.execute(
    'INSERT INTO users (id, name, password, email, created_at, is_active, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, name, hashedPassword, email, createdAt, isActive, isAdmin],
  )

  return { id, name, email, isActive, isAdmin }
}
