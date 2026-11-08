import express from 'express'
import { createBookingController, getMyBookingsController } from '../controllers/bookingController.js'
import { verifyToken } from '../middleware/verifyToken.js'

export const bookingRoutes = express.Router()

bookingRoutes.use(verifyToken)
bookingRoutes.get('/', getMyBookingsController)
bookingRoutes.post('/', createBookingController)
