
import { Router } from 'express'
import { getDashboardController } from '../controllers/dashboard.controller.js'
import  authMiddleware  from '../middleware/auth.middleware.js'
import  asyncHandler  from '../utils/asyncHandler.js'

const router = Router()

router.get('/', authMiddleware, asyncHandler(getDashboardController))

export default router
