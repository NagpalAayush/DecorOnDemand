import { createUserController } from '../controllers/userController.js'
import express from 'express'

export const userRoutes = express.Router()

userRoutes.post('/', createUserController)
