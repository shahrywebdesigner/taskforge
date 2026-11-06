
import { Mail, Users } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

const members = [
  {
    name: 'Alex Morgan',
    email: 'alex@example.com',
    role: 'Admin',
    status: 'Active',
  },
  {
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    role: 'Member',
    status: 'Active',
  },
  {
    name: 'John Smith',
    email: 'john@example.com',
    role: 'Member',
    status: 'Pending',
  },
]

function MembersPage() {
  return (
    <div>
      <PageHeader
        title="Team Members"
        description="Manage your workspace members and their roles."
      />

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {members.map((member) => (
          <Card key={member.email}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <Users size={20} />
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">
                  {member.name}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <Mail size={13} />
                  {member.email}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <Badge>{member.role}</Badge>

              <Badge variant={member.status === 'Active' ? 'success' : 'warning'}>
                {member.status}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default MembersPage
