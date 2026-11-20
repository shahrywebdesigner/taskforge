
import express from 'express'
import { env } from './config/env.js'
import connectDB from './config/database.js'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'

import requestLogger from './middleware/requestLogger.js'
import notFound from './middleware/notFound.js'
import errorHandler from './middleware/errorHandler.js'
import asyncHandler from './utils/asyncHandler.js'

import authRoutes from './routes/auth.routes.js'
import workspaceRoutes from './routes/workspace.routes.js'
import projectRoutes from './routes/project.routes.js'
import taskRoutes from './routes/task.routes.js'
import billingRoutes from './routes/billing.routes.js'
import stripeWebhookRoutes from './routes/stripe-webhook.routes.js'
import notificationRoutes from './routes/notification.routes.js'
import commentRoutes from './routes/comment.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'

import { startEmailWorker } from './services/email-worker.service.js'
import { startSubscriptionEmailScheduler } from './services/subscription-email.service.js'

const app = express()

// Global middleware
app.use(helmet())

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
)

// Stripe webhook must receive raw body.
app.use('/api/billing/webhook', stripeWebhookRoutes)

app.use(express.json())
app.use(requestLogger)
app.use(cookieParser())

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/workspaces', workspaceRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/billing', billingRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/dashboard', dashboardRoutes)

// Health check API
app.get(
  '/api/health',
  asyncHandler(async (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'TaskForge API is running',
      timestamp: new Date().toISOString(),
    })
  })
)

// 404 and error handling
app.use(notFound)
app.use(errorHandler)

// Start server
const startServer = async (): Promise<void> => {
  try {
    await connectDB()

    startEmailWorker()
    startSubscriptionEmailScheduler()

    app.listen(env.PORT, () => {
      console.log(`TaskForge server running on port ${env.PORT}`)
    })
  } catch (error) {
    console.error('Server startup failed:', error)
    process.exit(1)
  }
}

startServer()
