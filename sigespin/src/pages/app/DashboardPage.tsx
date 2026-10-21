import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from 'chart.js';
import { ArrowRight, CheckCircle2, Filter, Gauge, Gavel, Layers, Megaphone, MessagesSquare, Plus, Wallet } from 'lucide-react';
import type { ReactNode } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

import { ArenaBadge, EtapaBadge, Erro, OrigemBadge, Skeleton, TrlBadge } from '@/components/common/ui';
import { RadarChart } from '@/components/radar/RadarChart';
import { useAsync, useAuth } from '@/hooks';
import { dashboardService, governancaService, projetoService } from '@/services';
import { ARENA_COR, ARENA_LABEL, ARENAS, ETAPA_COR, ETAPA_CURTO, TODAS_ETAPAS } from '@/utils/constants';
import { formatarMoedaBRL, tempoRelativo } from '@/utils/formatters';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip);

function Kpi({ titulo, valor, detalhe, icon, destaque, to }: { titulo: string; valor: ReactNode; detalhe: string; icon: ReactNode; destaque?: boolean; to?: string }) {
  const corpo = (
    <>
      <div className="flex items-start justify-between">
        <p className="eyebrow">{titulo}</p>
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-bb-blue-light text-bb-blue">{icon}</span>
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight">{valor}</p>
      <p className="mt-1 text-xs text-bb-muted">{detalhe}</p>
    </>
  );
  const classe = `card p-5 ${destaque ? 'border-bb-blue/30 ring-1 ring-bb-blue/10' : ''}`;
  return to ? (
    <Link to={to} className={`${classe} card-hover block`}>
      {corpo}
    </Link>
  ) : (
    <div className={classe}>{corpo}</div>
  );
}

export default function DashboardPage() {
  const { usuario, podeVerFinanceiro, temPerfil, temAlcada } = useAuth();
  const m = useAsync(() => dashboardService.metricas(), []);
  const recentes = useAsync(() => projetoService.listar({ tamanho: 5 }), []);
  const pautas = useAsync(() => governancaService.pautas(), []);

  const h = new Date().getHours();
  const saudacao = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  const d = m.dados;

  // Um indicador de "minha fila" por perfil
  const minhaFila = !d
    ? null
    : temPerfil('ANALISTA')
      ? { t: 'Aguardando triagem', v: d.aguardandoTriagem, det: 'Novas demandas no backlog', icon: <Filter className="h-4 w-4" />, to: '/app/triagem' }
      : temPerfil('ESPECIALISTA')
        ? { t: 'Pareceres pendentes', v: d.pareceresPendentes, det: 'Consultas técnicas em aberto', icon: <MessagesSquare className="h-4 w-4" />, to: '/app/pareceres' }
        : { t: 'Entregas a validar', v: d.entregasAguardandoValidacao, det: 'Aguardando validação dos demandantes', icon: <CheckCircle2 className="h-4 w-4" />, to: '/app/minhas-demandas' };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-panel bg-gradient-to-br from-bb-blue to-bb-navy px-6 py-7 text-white sm:px-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-bb-yellow/15 blur-2xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="badge border-transparent bg-bb-yellow text-bb-slate">Gestão do portfólio de inovação</span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              {saudacao}, {usuario?.nome.split(' ')[0]}.
            </h1>
            <p className="mt-1 max-w-xl text-sm text-white/80">Da entrada da demanda à entrega validada: triagem, maturidade, governança e indicadores.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/app/portfolio?visao=kanban" className="btn h-10 border border-white/30 text-white hover:bg-white/10">
              Ver jornada
            </Link>
            {temPerfil('DEMANDANTE') && (
              <Link to="/app/demandas/nova" className="btn-accent">
                <Plus className="h-4 w-4" /> Nova demanda
              </Link>
            )}
            {temPerfil('ANALISTA') && (
              <Link to="/app/triagem" className="btn-accent">
                <Filter className="h-4 w-4" /> Triagem
              </Link>
            )}
            {temAlcada && (
              <Link to="/app/governanca" className="btn-accent">
                <Gavel className="h-4 w-4" /> Governança
              </Link>
            )}
          </div>
        </div>
      </section>

      {m.erro && <Erro texto={m.erro} onTentar={m.recarregar} />}

      <section className={`grid gap-4 sm:grid-cols-2 ${podeVerFinanceiro ? 'xl:grid-cols-5' : 'xl:grid-cols-4'}`}>
        {!d || !minhaFila ? (
          Array.from({ length: podeVerFinanceiro ? 5 : 4 }, (_, i) => <Skeleton key={i} className="h-[132px]" />)
        ) : (
          <>
            <Kpi titulo="Demandas" valor={d.totalProjetos} detalhe={`${d.ativos} em andamento · ${d.campanhasAbertas} campanhas abertas`} icon={<Layers className="h-4 w-4" />} to="/app/portfolio" />
            <Kpi
              titulo="TRL médio"
              valor={
                <>
                  {d.trlMedio.toFixed(1).replace('.', ',')}
                  <span className="text-base font-semibold text-bb-muted"> / 9</span>
                </>
              }
              detalhe="Indicador atualizado por evidências"
              icon={<Gauge className="h-4 w-4" />}
            />
            <Kpi titulo={minhaFila.t} valor={minhaFila.v} detalhe={minhaFila.det} icon={minhaFila.icon} destaque={minhaFila.v > 0} to={minhaFila.to} />
            <Kpi
              titulo="Pauta de governança"
              valor={d.pautasPendentes}
              detalhe="Itens aguardando priorização ou decisão"
              icon={<Gavel className="h-4 w-4" />}
              destaque={temAlcada && d.pautasPendentes > 0}
              to={temAlcada ? '/app/governanca' : undefined}
            />
            {podeVerFinanceiro && (
              <Kpi titulo="Dispêndio estimado" valor={<span className="text-2xl">{formatarMoedaBRL(d.dispendioTotal)}</span>} detalhe="Projetos vivos com valor informado" icon={<Wallet className="h-4 w-4" />} />
            )}
          </>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold">Jornada por etapa</h2>
              <p className="text-xs text-bb-muted">Quantidade de demandas em cada marco da jornada</p>
            </div>
            <Link to="/app/portfolio?visao=kanban" className="text-sm font-semibold text-bb-blue hover:underline">
              Abrir Kanban
            </Link>
          </div>
          <div className="mt-4 h-64">
            {d ? (
              <Bar
                data={{
                  labels: TODAS_ETAPAS.map((s) => ETAPA_CURTO[s]),
                  datasets: [{ data: TODAS_ETAPAS.map((s) => d.porEtapa[s] ?? 0), backgroundColor: TODAS_ETAPAS.map((s) => ETAPA_COR[s]), borderRadius: 8, maxBarThickness: 48 }],
                }}
                options={{
                  maintainAspectRatio: false,
                  animation: { duration: 500 },
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1, color: '#94A3B8' }, grid: { color: '#F1F5F9' }, border: { display: false } },
                    x: { ticks: { color: '#475569', font: { weight: 'bold', size: 11 } }, grid: { display: false } },
                  },
                }}
              />
            ) : (
              <Skeleton className="h-full" />
            )}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-bold">Origem das demandas</h2>
          <p className="text-xs text-bb-muted">Backlog espontâneo × campanhas e desafios</p>
          {d ? (
            <>
              <div className="mt-5 flex h-4 overflow-hidden rounded-full">
                <span className="bg-lime-500 transition-all" style={{ width: `${(d.porOrigem.ESPONTANEA / Math.max(d.totalProjetos, 1)) * 100}%` }} />
                <span className="bg-orange-500 transition-all" style={{ width: `${(d.porOrigem.INDUZIDA / Math.max(d.totalProjetos, 1)) * 100}%` }} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-lime-50 p-3">
                  <p className="text-2xl font-bold text-lime-800">{d.porOrigem.ESPONTANEA}</p>
                  <p className="text-xs font-semibold text-lime-800">Espontâneas</p>
                </div>
                <Link to="/app/campanhas" className="rounded-xl bg-orange-50 p-3 transition hover:bg-orange-100">
                  <p className="text-2xl font-bold text-orange-800">{d.porOrigem.INDUZIDA}</p>
                  <p className="flex items-center gap-1 text-xs font-semibold text-orange-800">
                    <Megaphone className="h-3 w-3" /> Induzidas
                  </p>
                </Link>
              </div>
              <h3 className="mt-6 text-sm font-bold">Por arena</h3>
              <div className="mt-3 flex items-center gap-4">
                <div className="h-24 w-24 shrink-0">
                  <Doughnut
                    data={{ labels: ARENAS.map((a) => ARENA_LABEL[a]), datasets: [{ data: ARENAS.map((a) => d.porArena[a]), backgroundColor: ARENAS.map((a) => ARENA_COR[a]), borderWidth: 2, borderColor: '#fff' }] }}
                    options={{ cutout: '65%', animation: { duration: 500 }, plugins: { legend: { display: false } } }}
                  />
                </div>
                <ul className="flex-1 space-y-1.5">
                  {ARENAS.map((a) => (
                    <li key={a} className="flex items-center gap-2 text-xs">
                      <span className="h-2 w-2 rounded-full" style={{ background: ARENA_COR[a] }} />
                      <span className="flex-1 text-slate-600">{ARENA_LABEL[a]}</span>
                      <span className="font-bold">{d.porArena[a]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <Skeleton className="mt-4 h-64" />
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5">
          <h2 className="font-bold">Radar médio do portfólio</h2>
          <p className="text-xs text-bb-muted">Leitura inicial × leitura atual mais recente</p>
          <div className="mt-2">{d ? <RadarChart inicial={d.radarMedioInicial} atual={d.radarMedioAtual} altura={250} /> : <Skeleton className="h-[250px]" />}</div>
        </div>

        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold">Pauta de governança</h2>
              <p className="text-xs text-bb-muted">Itens aguardando priorização ou decisão de quem tem alçada</p>
            </div>
            {temAlcada && (
              <Link to="/app/governanca" className="text-sm font-semibold text-bb-blue hover:underline">
                Decidir
              </Link>
            )}
          </div>
          <div className="mt-4 divide-y divide-bb-line">
            {pautas.erro ? (
              <Erro texto={pautas.erro} onTentar={pautas.recarregar} />
            ) : !pautas.dados ? (
              <Skeleton className="h-40" />
            ) : pautas.dados.length === 0 ? (
              <p className="py-8 text-center text-sm text-bb-muted">Nenhum item na pauta.</p>
            ) : (
              pautas.dados.slice(0, 5).map((pt) => (
                <Link key={pt.id} to={`/app/projetos/${pt.projetoId}?aba=governanca`} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition hover:bg-slate-50">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-yellow-50 text-yellow-800">
                    <Gavel className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{pt.projetoTitulo}</span>
                    <span className="block truncate text-xs text-bb-muted">
                      {ETAPA_CURTO[pt.etapaAtual]}
                      {pt.etapaProposta ? ` → ${ETAPA_CURTO[pt.etapaProposta]}` : ' · deliberação'} · {pt.encaminhadaPor.nome} · {tempoRelativo(pt.criadaEm)}
                    </span>
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Atualizadas recentemente</h2>
          <Link to="/app/portfolio" className="inline-flex items-center gap-1 text-sm font-semibold text-bb-blue hover:underline">
            Ver todas <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {recentes.erro ? (
            <Erro texto={recentes.erro} onTentar={recentes.recarregar} />
          ) : !recentes.dados ? (
            Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-32" />)
          ) : (
            recentes.dados.itens.map((p) => (
                <Link key={p.id} to={`/app/projetos/${p.id}`} className="card card-hover flex flex-col gap-2 p-4">
                  <div className="flex flex-wrap gap-1">
                    <EtapaBadge etapa={p.etapa} />
                    <TrlBadge trl={p.trlAtual} />
                  </div>
                  <p className="line-clamp-2 text-sm font-bold">{p.titulo}</p>
                  <div className="mt-auto flex flex-wrap gap-1">
                    <OrigemBadge origem={p.origem} campanha={p.campanha} />
                    <ArenaBadge arena={p.arena} />
                  </div>
                </Link>
              ))
          )}
        </div>
      </section>
    </div>
  );
}
