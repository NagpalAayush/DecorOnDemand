import 'dotenv/config'
import jwt from 'jsonwebtoken'

export function getAuthenticatedUser(token) {
  if (!token) {
    return null
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    if (typeof payload !== 'object' || !payload.id || !payload.email) {
      return null
    }

    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      isActive: payload.isActive !== false,
      isAdmin: Boolean(payload.isAdmin),
    }
  } catch {
    return null
  }
}
