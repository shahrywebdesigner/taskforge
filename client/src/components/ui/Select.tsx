interface SelectOption {
  label: string
  value: string
}

interface SelectProps {
  label: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
}

function Select({
  label,
  options,
  value,
  onChange,
}: SelectProps) {
  return (
    <div className="w-full">
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      >
        <option value="">Select an option</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default Select