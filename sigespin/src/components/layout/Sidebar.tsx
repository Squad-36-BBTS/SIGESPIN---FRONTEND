import {
  LayoutDashboard,
  Lightbulb,
  GitBranch,
  List,
  Settings,
  ClipboardList,
  LogOut,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

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
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-full shrink-0 border-b border-slate-200 bg-white md:min-h-[calc(100vh-76px)] md:w-60 md:border-b-0 md:border-r flex flex-col justify-between">
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

      <div className="hidden md:block p-4 border-t border-slate-100">
        <div className="rounded-lg bg-slate-50 p-2.5 mb-2 border border-slate-100">
          <p className="truncate text-xs font-semibold text-slate-800">{user?.name || 'Administrador'}</p>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-[10px] text-slate-500">{user?.matricula || 'F7389102'}</span>
            <span className="text-[9px] font-semibold text-blue-700 bg-blue-100/70 px-1 rounded">
              Conectado
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          type="button"
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 transition"
        >
          <LogOut size={15} />
          <span>Sair da conta</span>
        </button>
      </div>
    </aside>
  )
}
