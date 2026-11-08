import 'dotenv/config'
import { getAuthenticatedUser } from '../auth/jwt.js'

export function verifyToken(req, res, next) {
    const user = getAuthenticatedUser(req.cookies?.token)
    if (!user) {
        return res.status(401).json({ message: 'Invalid Login, Please Login Again' })
    }

    req.user = user
    next()
}
