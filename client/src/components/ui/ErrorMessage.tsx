
import { AlertCircle } from 'lucide-react'
import Button from './Button'

interface ErrorMessageProps {
  message?: string
  onRetry?: () => void
}

function ErrorMessage({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: ErrorMessageProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 px-6 py-8 text-center"
      role="alert"
    >
      <AlertCircle size={28} className="text-red-500" />

      <p className="mt-3 text-sm font-medium text-red-700">
        {message}
      </p>

      {onRetry && (
        <Button
          variant="secondary"
          onClick={onRetry}
          className="mt-4"
        >
          Try Again
        </Button>
      )}
    </div>
  )
}

export default ErrorMessage
