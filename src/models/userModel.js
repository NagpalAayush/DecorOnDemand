import { randomUUID } from 'node:crypto'
import { getDatabase } from '../config/database.js'

export async function createUser(name, hashedPassword, email, isLister = false) {
  const id = randomUUID()
  const database = getDatabase()
  const createdAt = new Date()
  const isActive = true
  const isAdmin = false

  await database.execute(
    'INSERT INTO users (id, name, password, email, created_at, is_active, is_admin, is_lister) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, name, hashedPassword, email, createdAt, isActive, isAdmin, isLister],
  )

  return { id, name, email, isActive, isAdmin, isLister }
}

export async function registerUserAsLister(userId) {
  const database = getDatabase()
  await database.execute('UPDATE users SET is_lister = TRUE WHERE id = ?', [userId])
}

export async function deregisterUserAsLister(userId) {
  const database = getDatabase()
  const [result] = await database.execute(
    `UPDATE users
     LEFT JOIN listings ON listings.user_id = users.id
     SET users.is_lister = FALSE
     WHERE users.id = ? AND users.is_lister = TRUE AND listings.id IS NULL`,
    [userId],
  )

  return result.affectedRows > 0
}

export async function getUserPasswordHash(userId) {
  const database = getDatabase()
  const [rows] = await database.execute('SELECT password FROM users WHERE id = ?', [userId])
  return rows[0]?.password || null
}

export async function updateUserPassword(userId, passwordHash) {
  const database = getDatabase()
  await database.execute('UPDATE users SET password = ? WHERE id = ?', [passwordHash, userId])
}
