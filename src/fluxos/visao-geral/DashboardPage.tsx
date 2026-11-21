import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from 'chart.js';
import { Archive, ArrowRight, Gauge, Inbox, Layers, Megaphone, Plus, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

import { ArenaBadge, EtapaBadge, Erro, OrigemBadge, SeloDiscussao, Skeleton, TarefaBadge, TrlBadge } from '@/components/common/ui';
import { RadarChart } from '@/components/radar/RadarChart';
import { temRota } from '@/fluxos/registro';
import { useAsync, useAuth } from '@/hooks';
import { dashboardService, kanbanService, projetoService } from '@/services';
import type { FiltroDashboard, OrigemDemanda } from '@/types/domain';
import { ARENA_COR, ARENA_LABEL, ARENAS, ORIGEM_LABEL, PERFIL_LABEL, PERIODOS_REGISTRO, TAREFA_RESPONSAVEL, TAREFAS } from '@/utils/constants';
import { porPerfil } from '@/utils/permissoes';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip);

function Kpi({ titulo, valor, detalhe, icon, to }: { titulo: string; valor: ReactNode; detalhe: string; icon: ReactNode; to?: string }) {
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
  return to ? (
    <Link to={to} className="card card-hover block p-5">
      {corpo}
    </Link>
  ) : (
    <div className="card p-5">{corpo}</div>
  );
}

export default function DashboardPage() {
  const { usuario } = useAuth();
  const [filtro, setFiltro] = useState<FiltroDashboard>({ periodoDias: '', etapaId: '', origem: '' });
  const m = useAsync(() => dashboardService.metricas(filtro), [filtro.periodoDias, filtro.etapaId, filtro.origem]);
  const config = useAsync(() => kanbanService.configuracao(), []);
  // A lista de recentes usa os mesmos filtros dos indicadores
  const recentes = useAsync(() => projetoService.listar({ ...filtro, tamanho: 5 }), [filtro.periodoDias, filtro.etapaId, filtro.origem]);
  const d = m.dados;
  const temFiltro = !!(filtro.periodoDias || filtro.etapaId || filtro.origem);
  // Cada indicador leva ao portfólio com o mesmo recorte: período, origem e etapa
  const qs = (extra: Record<string, string | number>) => {
    const p = new URLSearchParams();
    if (filtro.periodoDias) p.set('periodo', String(filtro.periodoDias));
    if (filtro.origem) p.set('origem', String(filtro.origem));
    if (filtro.etapaId) p.set('etapa', String(filtro.etapaId));
    Object.entries(extra).forEach(([k, v]) => p.set(k, String(v)));
    return p.toString();
  };

  const h = new Date().getHours();
  const saudacao = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-panel bg-gradient-to-br from-bb-blue to-bb-navy px-6 py-7 text-white sm:px-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-bb-yellow/15 blur-2xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="badge border-transparent bg-bb-yellow text-bb-slate">Portfólio de inovação</span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              {saudacao}, {usuario?.nome.split(' ')[0]}.
            </h1>
            <p className="mt-1 max-w-xl text-sm text-white/80">Indicadores agregados do portfólio. Cada número leva aos projetos de origem.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/app/fila" className="btn-accent">
              <Inbox className="h-4 w-4" /> Minha fila
            </Link>
            {usuario && temRota('/app/demandas/nova') && porPerfil('registrarDemanda', usuario).permitido && (
              <Link to="/app/demandas/nova" className="btn h-10 border border-white/30 text-white hover:bg-white/10">
                <Plus className="h-4 w-4" /> Nova demanda
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="card flex flex-wrap items-center gap-2 p-3">
        <span className="px-1 text-sm font-semibold text-bb-muted">Filtros</span>
        <select className="input h-9 w-auto" value={filtro.periodoDias} onChange={(e) => setFiltro({ ...filtro, periodoDias: Number(e.target.value) || '' })} aria-label="Período de registro">
          {PERIODOS_REGISTRO.map((p) => (
            <option key={p.t} value={p.v}>
              {p.t}
            </option>
          ))}
        </select>
        <select className="input h-9 w-auto" value={filtro.etapaId} onChange={(e) => setFiltro({ ...filtro, etapaId: Number(e.target.value) || '' })} aria-label="Etapa">
          <option value="">Todas as etapas</option>
          {(config.dados?.etapas ?? []).filter((e) => e.ativa).map((e) => (
            <option key={e.id} value={e.id}>
              {e.nome}
            </option>
          ))}
        </select>
        <select className="input h-9 w-auto" value={filtro.origem} onChange={(e) => setFiltro({ ...filtro, origem: e.target.value as OrigemDemanda | '' })} aria-label="Origem">
          <option value="">Todas as origens</option>
          {(['ESPONTANEA', 'INDUZIDA'] as const).map((o) => (
            <option key={o} value={o}>
              {ORIGEM_LABEL[o]}
            </option>
          ))}
        </select>
        {temFiltro && (
          <button className="btn-ghost h-9" onClick={() => setFiltro({ periodoDias: '', etapaId: '', origem: '' })}>
            <X className="h-4 w-4" /> Limpar
          </button>
        )}
        <span className="ml-auto">
          <SeloDiscussao texto="Indicadores a validar com o cliente" />
        </span>
      </div>

      {m.erro && <Erro texto={m.erro} onTentar={m.recarregar} />}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {!d ? (
          [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-[132px]" />)
        ) : (
          <>
            <Kpi titulo="Projetos ativos" valor={d.totalProjetos} detalhe={temFiltro ? 'Com os filtros aplicados' : 'Em todo o portfólio'} icon={<Layers className="h-4 w-4" />} to={`/app/portfolio?${qs({})}`} />
            <Kpi titulo="Arquivados" valor={d.arquivados} detalhe="Consultáveis, fora dos indicadores" icon={<Archive className="h-4 w-4" />} to={`/app/portfolio?${qs({ arquivamento: 'ARQUIVADOS' })}`} />
            <Kpi
              titulo="TRL médio"
              valor={
                <>
                  {d.trlMedio.toFixed(1).replace('.', ',')}
                  <span className="text-base font-semibold text-bb-muted"> / 9</span>
                </>
              }
              detalhe="Indicador de maturidade atualizado por avaliações"
              icon={<Gauge className="h-4 w-4" />}
            />
            <Kpi titulo="Induzidas" valor={d.porOrigem.INDUZIDA} detalhe={`${d.porOrigem.ESPONTANEA} espontâneas`} icon={<Megaphone className="h-4 w-4" />} to={`/app/portfolio?${qs({ origem: 'INDUZIDA' })}`} />
          </>
        )}
      </section>

      <section className="card p-5">
        <h2 className="font-bold">Pendências do portfólio</h2>
        <p className="text-xs text-bb-muted">Estados de tarefa. Eles não são etapas do Kanban.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {TAREFAS.map((t) => (
            <Link key={t} to={`/app/portfolio?${qs({ pendencia: t })}`} className="rounded-xl border border-dashed border-bb-line-2 p-4 transition hover:border-bb-blue hover:bg-bb-blue-light/40">
              <TarefaBadge tarefa={t} />
              <p className="mt-2 text-3xl font-bold">{d ? d.pendencias[t] : '…'}</p>
              <p className="text-xs text-bb-muted">Responsável: {PERFIL_LABEL[TAREFA_RESPONSAVEL[t]]}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold">Projetos por etapa</h2>
              <p className="text-xs text-bb-muted">Etapas ativas na configuração do Kanban</p>
            </div>
            <Link to="/app/portfolio?visao=kanban" className="text-sm font-semibold text-bb-blue hover:underline">
              Abrir Kanban
            </Link>
          </div>
          <div className="mt-4 h-64">
            {d ? (
              <Bar
                data={{
                  labels: d.porEtapa.map((x) => x.etapa.nome),
                  datasets: [{ data: d.porEtapa.map((x) => x.total), backgroundColor: d.porEtapa.map((x) => x.etapa.cor), borderRadius: 8, maxBarThickness: 56 }],
                }}
                options={{
                  maintainAspectRatio: false,
                  animation: { duration: 500 },
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1, color: '#94A3B8' }, grid: { color: '#F1F5F9' }, border: { display: false } },
                    x: { ticks: { color: '#475569', font: { weight: 'bold' } }, grid: { display: false } },
                  },
                }}
              />
            ) : (
              <Skeleton className="h-full" />
            )}
          </div>
          {d && (
            <div className="mt-3 flex flex-wrap gap-2">
              {d.porEtapa.map((x) => (
                <Link key={x.etapa.id} to={`/app/portfolio?${qs({ etapa: x.etapa.id })}`} className="flex items-center gap-1.5 rounded-lg border border-bb-line px-2.5 py-1 text-xs hover:border-bb-blue">
                  <EtapaBadge etapa={x.etapa} /> <strong>{x.total}</strong>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="card p-5">
          <h2 className="font-bold">Projetos por arena</h2>
          {d ? (
            <div className="mt-4 flex items-center gap-4">
              <div className="h-28 w-28 shrink-0">
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
          ) : (
            <Skeleton className="mt-4 h-40" />
          )}
          <h2 className="mt-6 font-bold">Radar médio</h2>
          {d ? <RadarChart inicial={d.radarMedioInicial} atual={d.radarMedioAtual} altura={220} /> : <Skeleton className="mt-2 h-[220px]" />}
        </div>
      </section>

      <section className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold">Atualizados recentemente</h2>
            <p className="text-xs text-bb-muted">{temFiltro ? 'Com os filtros aplicados acima.' : 'Últimas atualizações de todo o portfólio ativo.'}</p>
          </div>
          <Link to={`/app/portfolio?${qs({})}`} className="inline-flex items-center gap-1 text-sm font-semibold text-bb-blue hover:underline">
            Ver todos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {!recentes.dados ? (
            [1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-32" />)
          ) : !recentes.dados.itens.length ? (
            <p className="col-span-full rounded-xl border border-dashed border-bb-line-2 py-8 text-center text-sm text-bb-muted">Nenhum projeto com os filtros aplicados.</p>
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
