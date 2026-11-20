
import { useState } from 'react'
import {
  HelpCircle,
  BookOpen,
  BriefcaseBusiness,
  FolderKanban,
  CreditCard,
  UserRound,
  ChevronDown,
  Mail,
  MessageCircle,
} from 'lucide-react'

import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'

const faqItems = [
  {
    category: 'Getting Started',
    question: 'What is TaskForge?',
    answer:
      'TaskForge is a project and task management platform that helps individuals and teams organize workspaces, projects, tasks and team collaboration.',
  },
  {
    category: 'Getting Started',
    question: 'How do I get started?',
    answer:
      'Start by exploring your dashboard. If you are on the Pro plan, you can create a workspace, add projects and manage tasks. Free users can join existing workspaces when invited.',
  },
  {
    category: 'Workspaces',
    question: 'How can I create a workspace?',
    answer:
      'Workspace creation is available to users with an active Pro subscription. Open My Workspaces and use the Create Workspace option.',
  },
  {
    category: 'Workspaces',
    question: 'Can Free users join a workspace?',
    answer:
      'Yes. Free users can join an existing workspace through an invitation. They can access the workspace as Members, but cannot perform restricted management actions.',
  },
  {
    category: 'Projects',
    question: 'How do I manage projects?',
    answer:
      'Open Projects to view your projects across workspaces. Select a project to see its overview, details, tasks and available management actions.',
  },
  {
    category: 'Tasks',
    question: 'How do I manage my tasks?',
    answer:
      'Open My Tasks to see tasks assigned to you. Open a task to view its details, update its status where permitted and participate in comments.',
  },
  {
    category: 'Tasks',
    question: 'Who can edit a task?',
    answer:
      'Task editing depends on your workspace subscription and project permissions. Project Managers and Leads have task management permissions within their assigned projects. Free Members have read-only task access.',
  },
  {
    category: 'Billing',
    question: 'What happens when my Pro subscription expires?',
    answer:
      'Existing workspaces remain accessible in read-only mode. Workspace, project, task and member management actions remain restricted until the workspace owner renews their Pro subscription.',
  },
  {
    category: 'Billing',
    question: 'When does my Pro plan become active after payment?',
    answer:
      'Your Pro plan becomes active after the payment provider confirms the successful payment and TaskForge verifies the payment notification.',
  },
  {
    category: 'Account',
    question: 'How can I update my profile or password?',
    answer:
      'Open Settings to update your name, username and email address. You can also change your password by entering your current password and choosing a new one.',
  },
]

const sections = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of using TaskForge.',
    icon: BookOpen,
    items: [
      'Explore your Dashboard to see your workspace activity.',
      'Open My Workspaces to access workspaces you belong to.',
      'Create projects and organize work into tasks when your permissions allow.',
      'Use My Tasks to focus on work assigned to you.',
    ],
  },
  {
    title: 'Workspaces & Members',
    description: 'Understand workspace access and team roles.',
    icon: BriefcaseBusiness,
    items: [
      'Workspace Owners have full workspace control.',
      'Admins can manage workspace members within their permissions.',
      'Members can access workspace content according to their permissions.',
      'Project roles are managed from the relevant Project Overview.',
    ],
  },
  {
    title: 'Projects & Tasks',
    description: 'Organize projects and track progress.',
    icon: FolderKanban,
    items: [
      'Use Projects to view projects across your workspaces.',
      'Open a project to access its overview and tasks.',
      'Use My Tasks to find tasks assigned to your account.',
      'Task actions depend on your project role and workspace subscription.',
    ],
  },
  {
    title: 'Billing & Subscription',
    description: 'Understand Free and Pro access.',
    icon: CreditCard,
    items: [
      'Free users can join existing workspaces by invitation.',
      'Active Pro users can create and manage workspaces.',
      'An expired workspace owner subscription makes that workspace read-only.',
      'Visit Billing to view available plans and subscription information.',
    ],
  },
]

function HelpSupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div>
      <PageHeader
        title="Help & Support"
        description="Find answers and learn how to use TaskForge."
      />

      <div className="mt-6 max-w-4xl space-y-6">
        {/* Welcome */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <HelpCircle size={25} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                How can we help?
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Explore the guides below or browse frequently asked
                questions to find help with your TaskForge account.
              </p>
            </div>
          </div>
        </Card>

        {/* Guides */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Help Guides
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Learn about the main features of TaskForge.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {sections.map((section) => {
              const Icon = section.icon

              return (
                <Card key={section.title}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Icon size={20} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {section.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-2">
                    {section.items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2 text-sm leading-5 text-slate-600"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              )
            })}
          </div>
        </section>

        {/* FAQs */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Quick answers to common questions.
            </p>
          </div>

          <Card>
            <div className="divide-y divide-slate-100">
              {faqItems.map((faq, index) => {
                const isOpen = openFaq === index

                return (
                  <div key={faq.question} className="py-4 first:pt-0 last:pb-0">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenFaq(isOpen ? null : index)
                      }
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 text-left"
                    >
                      <div>
                        <span className="text-xs font-medium text-indigo-600">
                          {faq.category}
                        </span>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {faq.question}
                        </p>
                      </div>

                      <ChevronDown
                        size={18}
                        className={`shrink-0 text-slate-400 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <p className="mt-3 pr-8 text-sm leading-6 text-slate-600">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        </section>

        {/* Contact Support */}
        <Card>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <MessageCircle size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Still need help?
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                If you need assistance with workspace access or team
                permissions, contact your workspace Owner or Admin.
                For subscription questions, check your Billing page.
              </p>

              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                <UserRound size={16} />
                Workspace Owner / Admin
              </div>

              <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <Mail size={16} />
                Account and billing assistance
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default HelpSupportPage
