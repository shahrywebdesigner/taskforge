
import { LoaderCircle } from 'lucide-react'

interface LoadingSpinnerProps {
  message?: string
  fullPage?: boolean
}

function LoadingSpinner({
  message = 'Loading...',
  fullPage = false,
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${
        fullPage ? 'min-h-[60vh]' : 'py-12'
      }`}
      role="status"
      aria-live="polite"
    >
      <LoaderCircle
        size={30}
        className="animate-spin text-indigo-600"
      />

      <p className="text-sm text-slate-500">{message}</p>
    </div>
  )
}

export default LoadingSpinner
