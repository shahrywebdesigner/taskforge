import type { LucideIcon } from 'lucide-react'
import Card from '../../../components/ui/Card'

interface StatCardProps {
  title: string
  value: number
  description: string
  icon: LucideIcon
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
          <Icon size={20} />
        </div>
      </div>

      <h2 className="mt-4 text-3xl font-bold text-slate-900">
        {value}
      </h2>

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>
    </Card>
  )
}

export default StatCard