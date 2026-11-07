import bcrypt from 'bcrypt'
import { createUser } from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import { getDatabase } from '../config/database.js'
import 'dotenv/config'

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

export async function getUserController(request, response) {
  const { email, password } = request.body || {};
  if (!email || !password) {
    response.status(400).json({ error: 'email and password are required.' });
    return;
  }
  try {
    const database = getDatabase();
    const [rows] = await database.execute('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (rows.length === 0) {
      response.status(404).json({ error: 'User not found.' });
      return;
    }
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      response.status(401).json({ error: 'Invalid password.' });
      return;
    }
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    response.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    response.json({ token });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Internal server error.' });
  }

}
