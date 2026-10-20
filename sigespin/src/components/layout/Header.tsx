import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import {
  Bell,
  ChevronDown,
  CircleHelp,
  LayoutDashboard,
  Lightbulb,
  GitBranch,
  Menu,
  LogOut,
  Settings,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    setProfileOpen(false)
    logout()
    navigate('/login')
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="flex min-h-9 items-center justify-between bg-[#123A85] px-4 text-[10px] text-white sm:px-6 lg:px-10">
        <span className="font-medium tracking-wide">BBTS · Banco do Brasil Tecnologia e Serviços</span>
        <div className="hidden items-center gap-4 sm:flex">
          <span>Acessibilidade</span>
          <span className="h-3 w-px bg-blue-400/40" />
          <span>Comunicação e Inovação Aberta</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1553AE] p-1.5 shadow-sm transition group-hover:bg-[#123A85]">
            <Logo className="h-full w-auto object-contain" />
          </span>
          <span>
            <strong className="block text-sm font-bold text-[#123A85] group-hover:text-blue-900 transition-colors">SIGES-PIN</strong>
            <small className="block text-[11px] text-slate-500">Gestão do Portfólio de Inovação</small>
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="flex flex-wrap items-center gap-1 text-xs font-semibold text-slate-600">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-blue-800 transition hover:bg-blue-100/70"
          >
            <LayoutDashboard size={15} />
            Dashboard Executivo
          </Link>
          <Link
            to="/demandas/nova"
            className="flex items-center gap-2 rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Lightbulb size={15} />
            Intake Inteligente
          </Link>
          <Link
            to="/kanban"
            className="flex items-center gap-2 rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <GitBranch size={15} />
            Funil de Inovação
          </Link>
        </nav>

        <div className="flex items-center gap-3 text-slate-500">
          <button aria-label="Ajuda" className="rounded-md p-2 hover:bg-slate-100" title="Ajuda e Suporte">
            <CircleHelp size={17} />
          </button>
          <button aria-label="Notificações" className="relative rounded-md p-2 hover:bg-slate-100" title="Notificações">
            <Bell size={17} />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {/* User profile dropdown container */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-expanded={profileOpen}
              className="flex items-center gap-2 rounded-lg border border-slate-200 p-1.5 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1553AE] text-[11px] font-bold text-white shadow-xs">
                {user?.initials || 'AD'}
              </span>
              <span className="hidden text-left sm:block">
                <strong className="block text-xs font-medium text-slate-800 truncate max-w-[130px]">
                  {user?.name || 'Administrador'}
                </strong>
                <small className="block text-[10px] text-slate-500 truncate max-w-[130px]">
                  {user?.role || 'Acesso Corporativo'}
                </small>
              </span>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="rounded-lg bg-slate-50 p-3 mb-2 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1553AE] text-sm font-bold text-white shadow-xs">
                      {user?.initials || 'AD'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-900">{user?.name || 'Administrador'}</p>
                      <p className="truncate text-[11px] text-slate-500">{user?.email || 'admin@bbts.com.br'}</p>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] font-medium text-blue-700">
                        <ShieldCheck size={12} />
                        <span>Chave: {user?.matricula || 'F7389102'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60">
                    <span className="inline-block rounded-md bg-blue-100/70 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                      {user?.role || 'Administrador do Sistema'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Link
                    to="/configuracoes"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                  >
                    <Settings size={15} className="text-slate-500" />
                    <span>Configurações da Conta</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut size={15} className="text-red-500" />
                    <span>Sair do SIGES-PIN</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button aria-label="Abrir menu" className="rounded-md p-2 hover:bg-slate-100 md:hidden">
            <Menu size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}
