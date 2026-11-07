import { createUserController, getUserController } from '../controllers/userController.js'
import express from 'express'

export const userRoutes = express.Router()

userRoutes.post('/signup', createUserController);
userRoutes.post('/signin', getUserController);
