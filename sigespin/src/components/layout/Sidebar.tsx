import {
  LayoutDashboard,
  Lightbulb,
  GitBranch,
  List,
  Settings,
  ClipboardList,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navigation = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Cadastro de Demanda',
    href: '/demandas/nova',
    icon: Lightbulb,
  },
  {
    label: 'Kanban do Portfólio',
    href: '/kanban',
    icon: GitBranch,
  },
  {
    label: 'Portfólio em Lista',
    href: '/projetos',
    icon: List,
  },
  {
    label: 'Solicitações e Deliberações',
    href: '/solicitacoes',
    icon: ClipboardList,
  },
  {
    label: 'Configurações',
    href: '/configuracoes',
    icon: Settings,
  },
]

export default function Sidebar() {
  return (
    <aside className="w-full shrink-0 border-b border-slate-200 bg-white md:min-h-[calc(100vh-76px)] md:w-60 md:border-b-0 md:border-r">
      <nav
        aria-label="Menu principal"
        className="flex gap-1 overflow-x-auto p-3 md:sticky md:top-0 md:flex-col md:gap-2 md:p-4"
      >
        <p className="hidden px-3 pb-2 pt-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 md:block">
          Menu principal
        </p>

        {navigation.map(({ label, href, icon: Icon }) => (
          <NavLink
            key={href}
            to={href}
            end={href === '/dashboard'}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
                isActive
                  ? 'bg-blue-50 text-blue-800'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}