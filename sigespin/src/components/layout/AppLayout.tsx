import {
  FilePlus2,
  FileStack,
  Filter,
  Gavel,
  Inbox,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessagesSquare,
  PanelRightClose,
  Plus,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { Avatar, Logo } from '@/components/common/ui';
import { useAuth } from '@/hooks';
import { dashboardService, entregaService, parecerService } from '@/services';
import { USE_MOCK } from '@/services/api';
import type { Usuario } from '@/types/domain';
import { rotuloUsuario } from '@/utils/constants';

type Contador = 'triagem' | 'pareceres' | 'pautas' | 'validacoes';

interface ItemMenu {
  to: string;
  label: string;
  icon: LucideIcon;
  mostrar?: (u: Usuario) => boolean;
  end?: boolean;
  contador?: Contador;
}

const MENU: ItemMenu[] = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/portfolio', label: 'Portfólio', icon: FileStack },
  { to: '/app/campanhas', label: 'Campanhas', icon: Megaphone },
  { to: '/app/demandas/nova', label: 'Nova demanda', icon: FilePlus2, mostrar: (u) => u.perfil === 'DEMANDANTE' },
  { to: '/app/minhas-demandas', label: 'Minhas demandas', icon: Inbox, mostrar: (u) => u.perfil === 'DEMANDANTE', contador: 'validacoes' },
  { to: '/app/triagem', label: 'Triagem', icon: Filter, mostrar: (u) => u.perfil === 'ANALISTA', contador: 'triagem' },
  { to: '/app/pareceres', label: 'Pareceres', icon: MessagesSquare, mostrar: (u) => u.perfil === 'ESPECIALISTA', contador: 'pareceres' },
  { to: '/app/governanca', label: 'Governança', icon: Gavel, mostrar: (u) => u.alcadaGovernanca, contador: 'pautas' },
  { to: '/app/perfil', label: 'Meu perfil', icon: UserRound },
];

const STORAGE_TRILHO = '@SIGES_PIN:menu-trilho';

// Layout autenticado: barra superior enxuta + menu na lateral DIREITA, escondido por padrão.
// O botão do topo abre a gaveta de 260px por cima do conteúdo (desktop e celular).
// No desktop, quem preferir pode fixar um trilho fino de ícones (64px).
export function AppLayout() {
  const { usuario, sair, temPerfil } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [aberto, setAberto] = useState(false);
  const [trilho, setTrilho] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_TRILHO) === '1';
    } catch {
      return false;
    }
  });
  const [contadores, setContadores] = useState<Partial<Record<Contador, number>>>({});

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TRILHO, trilho ? '1' : '0');
    } catch {
      // ignora
    }
  }, [trilho]);

  // Fecha a gaveta ao trocar de página
  useEffect(() => {
    setAberto(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  // Pendências do próprio usuário, atualizadas a cada troca de página
  useEffect(() => {
    if (!usuario) return;
    let vivo = true;
    (async () => {
      const c: Partial<Record<Contador, number>> = {};
      try {
        const m = await dashboardService.metricas();
        c.triagem = m.aguardandoTriagem;
        c.pautas = m.pautasPendentes;
        if (usuario.perfil === 'ESPECIALISTA') c.pareceres = (await parecerService.minhas()).filter((x) => x.status === 'PENDENTE').length;
        if (usuario.perfil === 'DEMANDANTE') c.validacoes = (await entregaService.paraValidar()).length;
      } catch {
        // contadores são opcionais
      }
      if (vivo) setContadores(c);
    })();
    return () => {
      vivo = false;
    };
  }, [location.pathname, usuario]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setAberto(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!usuario) return null;
  const itens = MENU.filter((i) => !i.mostrar || i.mostrar(usuario));
  const atalho = itens.find((i) => i.contador && (contadores[i.contador] ?? 0) > 0);

  const handleSair = async () => {
    await sair();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen ${trilho ? 'lg:pr-16' : ''}`}>
      <header className="sticky top-0 z-40 border-b border-bb-line bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link to="/app" className="shrink-0" aria-label="Ir para o dashboard">
            <Logo />
          </Link>
          {USE_MOCK && (
            <span className="hidden rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 md:inline">
              Modo demonstração
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            {temPerfil('DEMANDANTE') && (
              <Link to="/app/demandas/nova" className="btn-accent hidden sm:inline-flex">
                <Plus className="h-4 w-4" /> Nova demanda
              </Link>
            )}
            {atalho && atalho.contador && (
              <Link to={atalho.to} className="btn-secondary hidden sm:inline-flex">
                <atalho.icon className="h-4 w-4" /> {atalho.label}: {contadores[atalho.contador]}
              </Link>
            )}
            <Link to="/app/perfil" className="hidden items-center gap-2.5 rounded-lg px-2 py-1 hover:bg-slate-50 md:flex">
              <Avatar nome={usuario.nome} />
              <span className="leading-tight">
                <span className="block text-sm font-bold">{usuario.nome}</span>
                <span className="block text-[11px] text-bb-muted">{rotuloUsuario(usuario)}</span>
              </span>
            </Link>
            <button
              className={`btn-ghost relative h-10 w-10 px-0 ${trilho ? 'lg:hidden' : ''}`}
              onClick={() => setAberto((v) => !v)}
              aria-expanded={aberto}
              aria-controls="menu-lateral"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
              {Object.values(contadores).some((n) => (n ?? 0) > 0) && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-bb-yellow ring-2 ring-white" />}
            </button>
          </div>
        </div>
      </header>

      {aberto && <div className="fade-in fixed inset-0 z-40 bg-slate-900/25" onClick={() => setAberto(false)} aria-hidden="true" />}

      <aside
        id="menu-lateral"
        aria-label="Menu principal"
        className={`fixed inset-y-0 right-0 z-50 flex flex-col border-l border-bb-line bg-white shadow-float transition-[width,transform] duration-300 ease-out lg:shadow-none ${
          aberto ? 'w-[260px] translate-x-0 lg:shadow-float' : trilho ? 'w-[260px] translate-x-full lg:w-16 lg:translate-x-0' : 'w-[260px] translate-x-full'
        }`}
      >
        <div className={`flex h-16 items-center border-b border-bb-line ${aberto ? 'justify-between px-4' : 'justify-center'}`}>
          {aberto && <span className="eyebrow">Menu</span>}
          <button
            className="btn-ghost h-10 w-10 px-0"
            onClick={() => setAberto((v) => !v)}
            aria-expanded={aberto}
            aria-label={aberto ? 'Recolher menu' : 'Expandir menu'}
            title={aberto ? 'Recolher menu' : 'Expandir menu'}
          >
            {aberto ? <PanelRightClose className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {itens.map((item) => {
            const n = item.contador ? contadores[item.contador] ?? 0 : 0;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `group relative flex h-11 items-center gap-3 rounded-lg text-sm font-semibold transition-colors ${aberto ? 'px-3' : 'justify-center'} ${
                    isActive ? 'bg-bb-blue text-white' : 'text-slate-600 hover:bg-bb-blue-light hover:text-bb-blue'
                  }`
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {aberto ? (
                  <span className="flex-1 truncate">{item.label}</span>
                ) : (
                  <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-md bg-bb-slate px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-float transition-opacity group-hover:opacity-100 lg:block">
                    {item.label}
                  </span>
                )}
                {n > 0 && (
                  <span className={`grid h-5 min-w-5 place-items-center rounded-full bg-bb-yellow px-1 text-[10px] font-bold text-bb-slate ${aberto ? '' : 'absolute right-1.5 top-1'}`}>
                    {n}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-bb-line p-2">
          {aberto && (
            <label className="mb-2 hidden cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 lg:flex">
              Fixar trilho de ícones
              <input type="checkbox" className="h-4 w-4 accent-bb-blue" checked={trilho} onChange={(e) => setTrilho(e.target.checked)} />
            </label>
          )}
          {aberto && (
            <div className="mb-2 flex items-center gap-2.5 rounded-lg bg-slate-50 p-2.5">
              <Avatar nome={usuario.nome} tamanho="sm" />
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-sm font-bold">{usuario.nome}</span>
                <span className="block truncate text-[11px] text-bb-muted">{rotuloUsuario(usuario)}</span>
              </span>
            </div>
          )}
          <button
            onClick={handleSair}
            className={`group relative flex h-11 w-full items-center gap-3 rounded-lg text-sm font-semibold text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-700 ${
              aberto ? 'px-3' : 'justify-center'
            }`}
            title="Sair"
          >
            <LogOut className="h-5 w-5" />
            {aberto && 'Sair'}
          </button>
        </div>
      </aside>

      <main key={location.pathname} className="page-in mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
}
