
import { Check, CreditCard, Zap } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'For individuals getting started.',
    features: ['Up to 3 projects', 'Basic task management', 'Basic dashboard'],
    current: true,
  },
  {
    name: 'Pro',
    price: '$12',
    description: 'For teams that need more.',
    features: ['Unlimited projects', 'Advanced task management', 'Team collaboration', 'Priority support'],
    current: false,
  },
]

function BillingPage() {
  return (
    <div>
      <PageHeader
        title="Billing & Plans"
        description="Manage your subscription and explore available plans."
      />

      <div className="mt-6 flex items-center gap-3">
        <CreditCard className="text-indigo-600" size={22} />
        <div>
          <p className="font-semibold text-slate-900">Current Plan: Free</p>
          <p className="text-sm text-slate-500">Your workspace is on the Free plan.</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.name}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                {plan.name}
              </h2>
              {plan.current ? (
                <Badge variant="success">Current Plan</Badge>
              ) : (
                <Zap className="text-indigo-600" size={22} />
              )}
            </div>

            <p className="mt-4 text-3xl font-bold text-slate-900">
              {plan.price}
              <span className="text-sm font-normal text-slate-500"> / month</span>
            </p>

            <p className="mt-2 text-sm text-slate-500">{plan.description}</p>

            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                  <Check size={16} className="text-green-600" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <Button variant={plan.current ? 'secondary' : 'primary'}>
                {plan.current ? 'Current Plan' : 'Upgrade to Pro'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default BillingPage
