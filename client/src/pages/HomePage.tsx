
import { Link } from 'react-router'
import { useTheme } from '../context/useTheme'
import {
  ArrowRight,
  CheckCircle2,
  FolderKanban,
  ShieldCheck,
  Users,
  Zap,
  Paperclip,
  ChartNoAxesCombined,
  Moon,
  Sun,
} from 'lucide-react'

const features = [
  {
    icon: FolderKanban,
    title: 'Project Management',
    description:
      'Organize projects, manage progress and keep your entire team aligned.',
  },
  {
    icon: CheckCircle2,
    title: 'Task Management',
    description:
      'Create tasks, assign responsibilities, set priorities and track deadlines.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description:
      'Manage workspace members and assign project-specific roles.',
  },
  {
    icon: Paperclip,
    title: 'File Sharing',
    description:
      'Share images, PDFs, documents and useful links inside projects and tasks.',
  },
  {
    icon: ChartNoAxesCombined,
    title: 'Progress Tracking',
    description:
      'Stay informed with project updates, activity and dashboard insights.',
  },
  {
    icon: ShieldCheck,
    title: 'Access Control',
    description:
      'Keep your workspace organized with role-based permissions.',
  },
]

function HomePage() {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Zap size={21} />
            </div>
            <span className="text-xl font-bold tracking-tight">
              TaskForge
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600">
              Features
            </a>
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-indigo-600">
              About
            </a>
            <a href="#contact" className="text-sm font-medium text-slate-600 hover:text-indigo-600">
              Contact
            </a>
          </nav>


<div className="flex items-center gap-2 sm:gap-3">
  <button
    onClick={toggleTheme}
    aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-yellow-400 dark:hover:bg-slate-700"
  >
    {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
  </button>

  <Link
    to="/login"
    className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 sm:inline-flex"
  >
    Log in
  </Link>

  <Link
    to="/register"
    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
  >
    Get Started
    <ArrowRight size={16} />
  </Link>
</div>

        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="relative overflow-hidden bg-slate-50">
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-indigo-100/70 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm font-medium text-indigo-700">
                <Zap size={15} />
                One workspace. Better teamwork.
              </div>

              <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Plan better.
                <span className="block text-indigo-600">
                  Work smarter.
                </span>
                Achieve more together.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                TaskForge helps teams organize projects, manage tasks,
                collaborate with members and keep important work in one place.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
                >
                  Start for Free
                  <ArrowRight size={17} />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Sign in to your account
                </Link>
              </div>

              <p className="mt-5 text-xs text-slate-500">
                Explore the website freely. Create an account whenever you're ready.
              </p>
            </div>

            {/* Dashboard preview */}
            <div className="relative">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-300/40 sm:p-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      WORKSPACE OVERVIEW
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-slate-900">
                      Your team's workspace
                    </h2>
                  </div>
                  <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600">
                    <FolderKanban size={22} />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-indigo-50 p-4">
                    <p className="text-xs text-indigo-600">Projects</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">12</p>
                    <p className="mt-1 text-xs text-slate-500">Team projects</p>
                  </div>
                  <div className="rounded-xl bg-blue-50 p-4">
                    <p className="text-xs text-blue-600">Tasks completed</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">84</p>
                    <p className="mt-1 text-xs text-slate-500">Work completed</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Recent projects</h3>
                    <span className="text-xs text-indigo-600">Overview</span>
                  </div>

                  {[
                    { name: 'Website Redesign', status: 'In Progress', width: '72%' },
                    { name: 'Mobile Application', status: 'Planning', width: '35%' },
                    { name: 'Marketing Campaign', status: 'Completed', width: '100%' },
                  ].map((project) => (
                    <div key={project.name} className="mb-5 last:mb-0">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-slate-700">
                          {project.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {project.status}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{ width: project.width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="rounded-lg bg-green-100 p-2 text-green-600">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Stay on top of your work
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Projects, tasks and team updates in one place.
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-4 hidden rounded-xl border border-slate-100 bg-white p-4 shadow-xl sm:block">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-green-50 p-2 text-green-600">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Task completed</p>
                    <p className="text-[10px] text-slate-400">Great progress!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-indigo-600">
              What you can do
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Everything your team needs to stay organized
            </h2>
            <p className="mt-4 leading-7 text-slate-500">
              Bring your projects, tasks, people and files together with
              practical tools designed for productive teamwork.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-slate-200/50"
                >
                  <div className="inline-flex rounded-xl bg-indigo-50 p-3 text-indigo-600">
                    <Icon size={23} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        {/* About */}
        <section id="about" className="bg-slate-50">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-24">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-indigo-600">
                Built for better teamwork
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Keep your team's work connected and organized.
              </h2>
            </div>
            <div>
              <p className="leading-8 text-slate-600">
                From planning a project to completing its final task, TaskForge
                gives your team a shared place to collaborate. Keep conversations,
                files, responsibilities and progress connected to the work itself.
              </p>
              <Link
                to="/register"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Create your free account <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-5xl rounded-3xl bg-indigo-600 px-6 py-14 text-center text-white sm:px-12">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Ready to bring your work together?
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-indigo-100">
              Create your TaskForge account and start organizing your projects
              and tasks with your team.
            </p>
            <Link
              to="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50"
            >
              Get Started Today <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
            <Zap size={18} className="text-indigo-600" />
            TaskForge
          </Link>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} TaskForge. All rights reserved.
          </p>
          <div className="flex gap-5 text-sm text-slate-500">
            <Link to="/login" className="hover:text-indigo-600">Log in</Link>
            <Link to="/register" className="hover:text-indigo-600">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
