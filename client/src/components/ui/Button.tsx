interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  type?: 'button' | 'submit' | 'reset'
}

function Button({
  children,
  variant = 'primary',
  type = 'button',
}: ButtonProps) {
  const styles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
  }

  return (
    <button
      type={type}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${styles[variant]}`}
    >
      {children}
    </button>
  )
}

export default Button