interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'default'
}

function Badge({ children, variant = 'default' }: BadgeProps) {
  const styles = {
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    default: 'bg-slate-100 text-slate-600',
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  )
}

export default Badge