import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, BriefcaseBusiness, Gauge, Lightbulb, Plus, TrendingUp } from 'lucide-react'
import ArenaChart from '../components/dashboard/ArenaChart'
import MaturityRadar from '../components/dashboard/MaturityRadar'

const indicators = [
  { title: 'Total de projetos', value: '42', detail: 'Iniciativas no portfólio', icon: Lightbulb, trend: '+12%', color: 'blue' },
  { title: 'TRL médio', value: '5,4', detail: 'Maturidade tecnológica', icon: Gauge, trend: 'Fase POC/MVP', color: 'violet' },
  { title: 'Projetos aprovados', value: '19', detail: 'Projetos com aprovação', icon: TrendingUp, trend: 'Demonstrativo', color: 'emerald' },
  { title: 'Startups homologadas', value: '18', detail: 'Startups no ecossistema', icon: BriefcaseBusiness, trend: 'Homologadas', color: 'amber' },
]
const iconColors: Record<string, string> = { blue: 'bg-blue-50 text-blue-700', violet: 'bg-violet-50 text-violet-700', emerald: 'bg-emerald-50 text-emerald-700', amber: 'bg-amber-50 text-amber-700' }
const startups = [
  { name: 'Novas soluções digitais', category: 'Negócios digitais', status: 'Em avaliação', color: 'bg-blue-500' },
  { name: 'Automação de processos', category: 'Eficiência operacional', status: 'Em análise', color: 'bg-violet-500' },
  { name: 'Segurança tecnológica', category: 'Segurança integrada', status: 'Em prospecção', color: 'bg-emerald-500' },
  { name: 'Plataformas inteligentes', category: 'Negócios digitais', status: 'Em homologação', color: 'bg-amber-500' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  return <div className="min-h-screen bg-[#F3F6FC] text-slate-800">
    <main id="dashboard" className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">

<button
  type="button"
  onClick={() => navigate('/demandas/nova')}
  className="mt-5 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
>
  <Plus size={17} />
  Nova iniciativa
</button>
    <section aria-label="Indicadores do portfólio" className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{indicators.map(item => { const Icon = item.icon; return <article key={item.title} className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-slate-500">{item.title}</p><p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{item.value}</p></div><div className={`rounded-lg p-2.5 ${iconColors[item.color]}`}><Icon size={21}/></div></div><div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4"><p className="text-xs text-slate-500">{item.detail}</p><span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700"><ArrowUpRight size={12}/>{item.trend}</span></div></article> })}</section>
    <section className="mt-6 grid grid-cols-1 items-stretch gap-5 xl:grid-cols-5"><article className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-3"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-sm font-bold text-slate-900">Distribuição Estratégica de Projetos por Arena</h2><p className="mt-1 text-xs text-slate-500">Acompanhamento das iniciativas por arena de negócio</p></div><span className="rounded-md bg-blue-50 px-2.5 py-1.5 text-[11px] font-medium text-blue-800">Total por arena</span></div><div className="mt-5 min-w-0"><ArenaChart/></div><div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">{[{name:'Eficiência operacional',value:'18 projetos'},{name:'Negócios digitais',value:'14 projetos'},{name:'Segurança integrada',value:'10 projetos'}].map(a=><div key={a.name} className="rounded-md bg-slate-50 p-3"><p className="text-[11px] text-slate-500">{a.name}</p><p className="mt-1 text-sm font-bold text-blue-800">{a.value}</p></div>)}</div></article>
    <article id="funil" className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2"><h2 className="text-sm font-bold text-slate-900">Visão do Funil de Inovação</h2><p className="mt-1 text-xs text-slate-500">Distribuição das iniciativas por estágio</p><div className="mt-7 space-y-6">{[{name:'Ideação',count:18,color:'bg-blue-600'},{name:'POC',count:14,color:'bg-violet-600'},{name:'MVP',count:10,color:'bg-amber-500'},{name:'Concluído',count:6,color:'bg-emerald-600'}].map(s=><div key={s.name}><div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium text-slate-700">{s.name}</span><span className="text-sm font-bold text-slate-900">{s.count}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${s.color}`} style={{width:`${s.count/18*100}%`}}/></div></div>)}</div><div className="mt-7 rounded-lg bg-blue-50 p-4"><p className="text-sm font-semibold text-blue-900">Acompanhamento estratégico</p><p className="mt-1 text-xs leading-5 text-blue-800">Acompanhe a distribuição das iniciativas ao longo do processo de inovação.</p></div></article></section>
    <section className="mt-6 grid grid-cols-1 items-stretch gap-5 xl:grid-cols-2"><article className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-sm font-bold text-slate-900">Radar de Maturidade Corporativa</h2><p className="mt-1 text-xs text-slate-500">Avaliação das dimensões de maturidade das iniciativas</p><div className="mt-4"><MaturityRadar/></div><p className="text-center text-[11px] text-slate-500">Dados ilustrativos para visualização da interface.</p></article>
    <article id="intake" className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-bold text-slate-900">Ecossistema de Open Innovation</h2><p className="mt-1 text-xs text-slate-500">Startups parceiras e conexões de inovação</p></div><button type="button" className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-800"><Plus size={15}/>Conectar startup</button></div><div className="mt-6 grid grid-cols-2 gap-4"><div className="rounded-lg border border-slate-200 p-4"><p className="text-xs text-slate-500">Startups parceiras</p><p className="mt-2 text-2xl font-bold text-slate-900">12</p></div><div className="rounded-lg border border-slate-200 p-4"><p className="text-xs text-slate-500">Oportunidades</p><p className="mt-2 text-2xl font-bold text-slate-900">08</p></div></div><div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">{startups.map(s=><div key={s.name} className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-100 p-3 transition hover:bg-slate-50"><div className={`h-9 w-1.5 shrink-0 rounded-full ${s.color}`}/><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{s.name}</p><p className="mt-1 truncate text-xs text-slate-500">{s.category}</p><span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">{s.status}</span></div></div>)}</div><p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">Os números e registros apresentados são demonstrativos, sem conexão com o back-end.</p></article></section>
    <footer className="mt-5 flex flex-col gap-2 border-t border-slate-200 py-6 text-center text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:text-left"><p>SIGES-PIN · Sistema Corporativo de Gestão do Portfólio de Inovação</p><p>Ambiente de desenvolvimento</p></footer>
  </main></div>
}
