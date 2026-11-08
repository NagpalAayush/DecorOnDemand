import { createUserController, getUserController } from '../controllers/userController.js'
import express from 'express'

export const userRoutes = express.Router()

userRoutes.post('/signup', createUserController);
userRoutes.post('/signin', getUserController);
userRoutes.post('/signout', (request, response) => {
  response.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })
  response.status(204).end()
});
