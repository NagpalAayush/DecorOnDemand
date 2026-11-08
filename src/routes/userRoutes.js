import {
  createUserController,
  changePasswordController,
  deregisterAsListerController,
  getUserController,
  registerAsListerController,
} from '../controllers/userController.js'
import express from 'express'
import { verifyToken } from '../middleware/verifyToken.js'

export const userRoutes = express.Router()

userRoutes.post('/signup', createUserController);
userRoutes.post('/signin', getUserController);
userRoutes.post('/register-lister', verifyToken, registerAsListerController);
userRoutes.post('/deregister-lister', verifyToken, deregisterAsListerController);
userRoutes.post('/change-password', verifyToken, changePasswordController);
userRoutes.get('/admin/verify', verifyToken, (request, response, next) => {
  if (!request.user.isAdmin) {
    response.status(403).json({ error: 'Administrator access is required.' })
    return
  }

  next()
}, (request, response) => {
  response.json({ isAdmin: true })
});
userRoutes.post('/signout', (request, response) => {
  response.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })
  response.status(204).end()
});
