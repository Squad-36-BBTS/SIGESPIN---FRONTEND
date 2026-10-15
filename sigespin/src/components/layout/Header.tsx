import { Bell, Building2, ChevronDown, CircleHelp, LayoutDashboard, Lightbulb, GitBranch, Menu } from 'lucide-react'

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="flex min-h-9 items-center justify-between bg-[#123A85] px-4 text-[10px] text-white sm:px-6 lg:px-10">
        <span>BBTS · Banco do Brasil Tecnologia e Serviços</span>
        <div className="hidden items-center gap-4 sm:flex"><span>Acessibilidade</span><span>Comunicação e Inovação Aberta</span></div>
      </div>
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
        <a href="#inicio" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1553AE] text-white"><Building2 size={22} /></span>
          <span><strong className="block text-sm font-bold text-[#123A85]">SIGES-PIN</strong><small className="block text-[11px] text-slate-500">Gestão do Portfólio de Inovação</small></span>
        </a>
        <nav aria-label="Navegação principal" className="flex flex-wrap items-center gap-1 text-xs font-semibold text-slate-600">
          <a href="#dashboard" className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-blue-800"><LayoutDashboard size={15}/>Dashboard Executivo</a>
          <a href="#intake" className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-slate-100"><Lightbulb size={15}/>Intake Inteligente</a>
          <a href="#funil" className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-slate-100"><GitBranch size={15}/>Funil de Inovação</a>
        </nav>
        <div className="flex items-center gap-3 text-slate-500"><button aria-label="Ajuda" className="rounded-md p-2 hover:bg-slate-100"><CircleHelp size={17}/></button><button aria-label="Notificações" className="relative rounded-md p-2 hover:bg-slate-100"><Bell size={17}/><span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"/></button><button className="flex items-center gap-2 rounded-md border border-slate-200 p-1.5"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-800">AD</span><span className="hidden text-left sm:block"><strong className="block text-xs text-slate-700">Administrador</strong><small className="text-[10px]">Perfil de demonstração</small></span><ChevronDown size={14}/></button><button aria-label="Abrir menu" className="rounded-md p-2 hover:bg-slate-100 md:hidden"><Menu size={18}/></button></div>
      </div>
    </header>
  )
}
