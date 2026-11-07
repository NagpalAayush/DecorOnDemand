import bcrypt from 'bcrypt'
import { createUser } from '../models/userModel.js'

export async function createUserController(request, response) {
  const { name, email, password } = request.body || {}

  if (!name || !email || !password) {
    response.status(400).json({ error: 'name, email, and password are required.' })
    return
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  const user = await createUser(name.trim(), hashedPassword, email.trim().toLowerCase())

  response.status(201).json(user)
}
