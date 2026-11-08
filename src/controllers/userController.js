import bcrypt from 'bcrypt'
import { createUser } from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import { getDatabase } from '../config/database.js'
import 'dotenv/config'

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isActive: Boolean(user.is_active),
    isAdmin: Boolean(user.is_admin),
  }
}

export async function createUserController(request, response) {
  const { name, email, password } = request.body || {}

  if (!name || !email || !password) {
    response.status(400).json({ error: 'name, email, and password are required.' })
    return
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await createUser(name.trim(), hashedPassword, email.trim().toLowerCase())

    response.status(201).json(user)
  } catch (error) {
    console.error('User signup failed:', error)

    if (error.code === 'ER_DUP_ENTRY') {
      response.status(409).json({ error: 'An account with this email already exists.' })
      return
    }

    response.status(500).json({ error: 'Unable to create the account.' })
  }
}

export async function getUserController(request, response) {
  const { email, password } = request.body || {};
  if (!email || !password) {
    response.status(400).json({ error: 'email and password are required.' });
    return;
  }
  try {
    const database = getDatabase();
    const [rows] = await database.execute(
      'SELECT id, name, email, password, is_active, is_admin FROM users WHERE email = ?',
      [email.trim().toLowerCase()],
    );
    if (rows.length === 0) {
      response.status(404).json({ error: 'User not found.' });
      return;
    }
    const user = rows[0];
    if (!user.is_active) {
      response.status(403).json({ error: 'This account is inactive.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      response.status(401).json({ error: 'Invalid password.' });
      return;
    }
    const token = jwt.sign({
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: Boolean(user.is_active),
      isAdmin: Boolean(user.is_admin),
    }, process.env.JWT_SECRET, { expiresIn: '1h' });
    response.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    response.json({ user: publicUser(user) });
  } catch (error) {
    console.error('User signin failed:', error);
    response.status(500).json({ error: 'Internal server error.' });
  }

}
