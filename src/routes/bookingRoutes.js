import express from 'express'
import {
  createBookingController,
  getBookingRequestsController,
  getMyBookingsController,
  updateBookingStatusController,
} from '../controllers/bookingController.js'
import { verifyToken } from '../middleware/verifyToken.js'

export const bookingRoutes = express.Router()

bookingRoutes.use(verifyToken)
bookingRoutes.get('/requests', getBookingRequestsController)
bookingRoutes.patch('/:bookingId/status', updateBookingStatusController)
bookingRoutes.get('/', getMyBookingsController)
bookingRoutes.post('/', createBookingController)
