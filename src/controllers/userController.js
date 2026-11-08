import bcrypt from 'bcrypt'
import {
  createUser,
  deregisterUserAsLister,
  getUserPasswordHash,
  registerUserAsLister,
  updateUserPassword,
} from '../models/userModel.js'
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
    isLister: Boolean(user.is_lister),
  }
}

export async function createUserController(request, response) {
  const { name, email, password, isLister = false } = request.body || {}

  if (!name || !email || !password) {
    response.status(400).json({ error: 'name, email, and password are required.' })
    return
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12)
    if (typeof isLister !== 'boolean') {
      response.status(400).json({ error: 'isLister must be a boolean.' })
      return
    }

    const user = await createUser(name.trim(), hashedPassword, email.trim().toLowerCase(), isLister)

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
      'SELECT id, name, email, password, is_active, is_admin, is_lister FROM users WHERE email = ?',
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
      isLister: Boolean(user.is_lister),
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

export async function registerAsListerController(request, response) {
  try {
    if (!request.body?.password) {
      response.status(400).json({ error: 'Password is required for confirmation.' })
      return
    }

    const passwordHash = await getUserPasswordHash(request.user.id)
    const isPasswordValid = passwordHash && await bcrypt.compare(request.body.password, passwordHash)
    if (!isPasswordValid) {
      response.status(401).json({ error: 'The password provided is incorrect.' })
      return
    }

    await registerUserAsLister(request.user.id)
    const token = jwt.sign({
      id: request.user.id,
      name: request.user.name,
      email: request.user.email,
      isActive: request.user.isActive,
      isAdmin: request.user.isAdmin,
      isLister: true,
    }, process.env.JWT_SECRET, { expiresIn: '1h' })

    response.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })
    response.json({ isLister: true })
  } catch (error) {
    console.error('Lister registration failed:', error)
    response.status(500).json({ error: 'Unable to register as a lister.' })
  }
}

export async function deregisterAsListerController(request, response) {
  try {
    if (!request.body?.password) {
      response.status(400).json({ error: 'Password is required for confirmation.' })
      return
    }

    const passwordHash = await getUserPasswordHash(request.user.id)
    const isPasswordValid = passwordHash && await bcrypt.compare(request.body.password, passwordHash)
    if (!isPasswordValid) {
      response.status(401).json({ error: 'The password provided is incorrect.' })
      return
    }

    const deregistered = await deregisterUserAsLister(request.user.id)
    if (!deregistered) {
      response.status(409).json({ error: 'Delete your listings before deregistering as a lister.' })
      return
    }

    const token = jwt.sign({
      id: request.user.id,
      name: request.user.name,
      email: request.user.email,
      isActive: request.user.isActive,
      isAdmin: request.user.isAdmin,
      isLister: false,
    }, process.env.JWT_SECRET, { expiresIn: '1h' })

    response.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })
    response.json({ isLister: false })
  } catch (error) {
    console.error('Lister deregistration failed:', error)
    response.status(500).json({ error: 'Unable to deregister as a lister.' })
  }
}

export async function changePasswordController(request, response) {
  const { currentPassword, newPassword, confirmPassword } = request.body || {}

  if (!currentPassword || !newPassword || !confirmPassword) {
    response.status(400).json({ error: 'Current password, new password, and confirmation are required.' })
    return
  }

  if (newPassword.length < 8) {
    response.status(400).json({ error: 'New password must be at least 8 characters long.' })
    return
  }

  if (newPassword !== confirmPassword) {
    response.status(400).json({ error: 'New password and confirmation do not match.' })
    return
  }

  if (currentPassword === newPassword) {
    response.status(400).json({ error: 'New password must be different from your current password.' })
    return
  }

  try {
    const passwordHash = await getUserPasswordHash(request.user.id)
    const isCurrentPasswordValid = passwordHash && await bcrypt.compare(currentPassword, passwordHash)

    if (!isCurrentPasswordValid) {
      response.status(401).json({ error: 'The current password is incorrect.' })
      return
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12)
    await updateUserPassword(request.user.id, newPasswordHash)
    response.json({ message: 'Password changed successfully.' })
  } catch (error) {
    console.error('Password change failed:', error)
    response.status(500).json({ error: 'Unable to change the password.' })
  }
}
