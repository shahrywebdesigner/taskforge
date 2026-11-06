
import { UserRound, Lock, Bell, Save } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your account preferences and profile."
      />

      <div className="mt-6 max-w-3xl space-y-6">
        <Card>
          <div className="mb-5 flex items-center gap-2">
            <UserRound size={20} className="text-indigo-600" />
            <h2 className="font-semibold text-slate-900">Profile Information</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Full Name" placeholder="Enter your name" />
            <Input label="Email Address" type="email" placeholder="Enter your email" />
          </div>
        </Card>

        <Card>
          <div className="mb-5 flex items-center gap-2">
            <Lock size={20} className="text-indigo-600" />
            <h2 className="font-semibold text-slate-900">Change Password</h2>
          </div>

          <div className="space-y-4">
            <Input label="Current Password" type="password" placeholder="Enter current password" />
            <Input label="New Password" type="password" placeholder="Enter new password" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-indigo-600" />
            <div>
              <h2 className="font-semibold text-slate-900">Notifications</h2>
              <p className="text-sm text-slate-500">
                Manage your notification preferences.
              </p>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button>
            <Save size={17} />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
