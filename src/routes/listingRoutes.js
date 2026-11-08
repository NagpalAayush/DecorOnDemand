import express from 'express'
import {
  createListingController,
  getListingsForApprovalController,
  getListingsByUserIdController,
  getPublishedListingsController,
  getPublishedListingByIdController,
  getMyListingsController,
  updateListingApprovalController,
} from '../controllers/listingController.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { verifyAdmin } from '../middleware/verifyAdmin.js'

export const listingRoutes = express.Router()

listingRoutes.get('/user/:userId', getListingsByUserIdController)
listingRoutes.get('/published', getPublishedListingsController)
listingRoutes.get('/:listingId', getPublishedListingByIdController)
listingRoutes.use(verifyToken)
listingRoutes.get('/admin/approval', verifyAdmin, getListingsForApprovalController)
listingRoutes.patch('/admin/:listingId/approval', verifyAdmin, updateListingApprovalController)
listingRoutes.get('/', getMyListingsController)
listingRoutes.post('/', createListingController)
