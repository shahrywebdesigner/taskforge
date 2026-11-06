import type { ChangeEvent } from 'react'
interface InputProps {
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
}

function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
}: InputProps) {
  return (
    <div className="w-full">
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
        onChange(event.target.value)}
        // onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  )
}

export default Input