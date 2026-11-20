
import { Router } from 'express'

import {
  createCheckout,
  checkPaymentStatus,
} from '../controllers/billing.controller.js'
import protect from '../middleware/auth.middleware.js'

const router = Router()

// All billing routes require authentication
router.use(protect)

router.post('/checkout', createCheckout)

router.get('/status/:sessionId', checkPaymentStatus)

export default router
