
import type { ErrorRequestHandler } from 'express'

const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next
) => {
  const statusCode =
    typeof error.statusCode === 'number' ? error.statusCode : 500

  const message =
    error instanceof Error ? error.message : 'Internal server error'

  if (statusCode >= 500) {
    console.error(error)
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error instanceof Error ? error.stack : undefined,
    }),
  })
}

export default errorHandler
