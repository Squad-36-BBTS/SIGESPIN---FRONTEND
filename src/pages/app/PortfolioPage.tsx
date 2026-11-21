// Tela compartilhada: vai em todos os zips, mas só o responsável altera. Responsável: Zip 3 · Especialista · Segurança da informação.
import { ChevronLeft, ChevronRight, Columns3, List, Plus, Search, Settings2, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { ArenaBadge, EtapaBadge, Erro, OrigemBadge, PageHeader, Selo, Skeleton, TarefaBadge, TrlMeter, Vazio } from '@/components/common/ui';
import { temRota } from '@/fluxos/registro';
import { useAsync, useAuth, useDebounce } from '@/hooks';
import { campanhaService, kanbanService, projetoService } from '@/services';
import type { ArenaTipo, EstadoTarefa, EtapaKanban, FiltroArquivamento, OrigemDemanda, Projeto } from '@/types/domain';
import { ARENA_LABEL, ARENAS, ORIGEM_LABEL, PERIODOS_REGISTRO, TAREFA_LABEL, TAREFAS, TIPO_CAMPANHA_LABEL, areaSigla } from '@/utils/constants';
import { formatarData } from '@/utils/formatters';
import { porPerfil } from '@/utils/permissoes';

const TAMANHO_PAGINA = 8;

export default function PortfolioPage() {
  const { usuario } = useAuth();
  const [params, setParams] = useSearchParams();
  const visao = params.get('visao') === 'kanban' ? 'kanban' : 'lista';
  const [busca, setBusca] = useState(params.get('q') ?? '');
  const [arena, setArena] = useState<ArenaTipo | ''>((params.get('arena') as ArenaTipo) ?? '');
  // Período de registro: vem do dashboard, para o portfólio mostrar o mesmo recorte dos indicadores
  const [periodoDias, setPeriodoDias] = useState<number | ''>(Number(params.get('periodo')) || '');
  const [etapaId, setEtapaId] = useState<number | ''>(Number(params.get('etapa')) || '');
  const [origem, setOrigem] = useState<OrigemDemanda | ''>(params.get('campanha') ? 'INDUZIDA' : ((params.get('origem') as OrigemDemanda) ?? ''));
  const [campanhaId, setCampanhaId] = useState<number | ''>(Number(params.get('campanha')) || '');
  const [pendencia, setPendencia] = useState<EstadoTarefa | ''>((params.get('pendencia') as EstadoTarefa) ?? '');
  // Arquivados continuam consultáveis; por padrão a lista mostra só os projetos ativos
  const [arquivamento, setArquivamento] = useState<FiltroArquivamento>((params.get('arquivamento') as FiltroArquivamento) || 'ATIVOS');
  const [pagina, setPagina] = useState(0);
  const buscaDebounced = useDebounce(busca, 300);
  const campanhas = useAsync(() => campanhaService.listar(), []);
  const config = useAsync(() => kanbanService.configuracao(), []);

  const base = { busca: buscaDebounced, arena, origem, campanhaId, pendencia, arquivamento, periodoDias };
  const { dados, carregando, erro, recarregar } = useAsync(
    () => (visao === 'kanban' ? projetoService.listar(base) : projetoService.listar({ ...base, etapaId, pagina, tamanho: TAMANHO_PAGINA })),
    [visao, buscaDebounced, arena, etapaId, origem, campanhaId, pendencia, arquivamento, periodoDias, pagina],
  );

  // Os filtros ficam na URL: voltar, recarregar ou compartilhar o link mantém o mesmo recorte
  useEffect(() => {
    const p = new URLSearchParams();
    if (visao === 'kanban') p.set('visao', 'kanban');
    const valores: [string, string | number][] = [
      ['q', buscaDebounced.trim()],
      ['arena', arena],
      ['etapa', etapaId],
      ['origem', origem],
      ['campanha', campanhaId],
      ['pendencia', pendencia],
      ['periodo', periodoDias],
      ['arquivamento', arquivamento === 'ATIVOS' ? '' : arquivamento],
    ];
    valores.forEach(([k, v]) => v !== '' && p.set(k, String(v)));
    if (p.toString() !== params.toString()) setParams(p, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visao, buscaDebounced, arena, etapaId, origem, campanhaId, pendencia, periodoDias, arquivamento]);

  const mudarVisao = (v: 'lista' | 'kanban') => {
    const p = new URLSearchParams(params);
    if (v === 'kanban') p.set('visao', 'kanban');
    else p.delete('visao');
    setParams(p, { replace: true });
  };

  const temFiltro = !!(busca || arena || origem || campanhaId || pendencia || periodoDias || arquivamento !== 'ATIVOS' || (visao === 'lista' && etapaId));
  const limpar = () => {
    setBusca('');
    setArena('');
    setPeriodoDias('');
    setEtapaId('');
    setOrigem('');
    setCampanhaId('');
    setPendencia('');
    setArquivamento('ATIVOS');
    setPagina(0);
  };
  const mudar =
    <T,>(fn: (v: T) => void) =>
    (v: T) => {
      fn(v);
      setPagina(0);
    };
  const etapas = (config.dados?.etapas ?? []).filter((e) => e.ativa);

  return (
    <div>
      <PageHeader
        eyebrow="Portfólio"
        titulo="Projetos de inovação"
        descricao="Todo o portfólio, visível para os três perfis. Busque por texto, arena ou etapa e abra os detalhes; as ações dependem do perfil, do vínculo com o projeto e do estado do registro."
        acoes={
          <>
            {temRota('/app/kanban/configuracao') && (
              <Link to="/app/kanban/configuracao" className="btn-ghost">
                <Settings2 className="h-4 w-4" /> Configurar Kanban
              </Link>
            )}
            {usuario && temRota('/app/demandas/nova') && porPerfil('registrarDemanda', usuario).permitido && (
              <Link to="/app/demandas/nova" className="btn-primary">
                <Plus className="h-4 w-4" /> Nova demanda
              </Link>
            )}
          </>
        }
      />

      <div className="card mb-5 flex flex-col gap-3 p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Buscar por título ou descrição…" value={busca} onChange={(e) => mudar(setBusca)(e.target.value)} aria-label="Buscar" />
          </div>
          <div className="flex rounded-lg border border-bb-line-2 p-0.5" role="tablist" aria-label="Modo de visualização">
            {(
              [
                ['lista', List, 'Lista'],
                ['kanban', Columns3, 'Kanban'],
              ] as const
            ).map(([v, Icon, label]) => (
              <button
                key={v}
                role="tab"
                aria-selected={visao === v}
                onClick={() => mudarVisao(v)}
                className={`flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-colors ${visao === v ? 'bg-bb-blue text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {visao === 'lista' && (
            <select className="input h-9 w-auto" value={etapaId} onChange={(e) => mudar(setEtapaId)(Number(e.target.value) || '')} aria-label="Etapa">
              <option value="">Todas as etapas</option>
              {etapas.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nome}
                </option>
              ))}
            </select>
          )}
          <select
            className="input h-9 w-auto"
            value={origem}
            onChange={(e) => {
              mudar(setOrigem)(e.target.value as OrigemDemanda | '');
              if (e.target.value !== 'INDUZIDA') setCampanhaId('');
            }}
            aria-label="Origem"
          >
            <option value="">Todas as origens</option>
            {(['ESPONTANEA', 'INDUZIDA'] as const).map((o) => (
              <option key={o} value={o}>
                {ORIGEM_LABEL[o]}
              </option>
            ))}
          </select>
          {origem === 'INDUZIDA' && (
            <select className="input h-9 w-auto max-w-[260px]" value={campanhaId} onChange={(e) => mudar(setCampanhaId)(Number(e.target.value) || '')} aria-label="Ação de mobilização">
              <option value="">Todas as ações de mobilização</option>
              {(campanhas.dados ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {TIPO_CAMPANHA_LABEL[c.tipo]} · {c.titulo}
                </option>
              ))}
            </select>
          )}
          <select className="input h-9 w-auto" value={arena} onChange={(e) => mudar(setArena)(e.target.value as ArenaTipo | '')} aria-label="Arena">
            <option value="">Todas as arenas</option>
            {ARENAS.map((a) => (
              <option key={a} value={a}>
                {ARENA_LABEL[a]}
              </option>
            ))}
          </select>
          <select className="input h-9 w-auto" value={pendencia} onChange={(e) => mudar(setPendencia)(e.target.value as EstadoTarefa | '')} aria-label="Pendência">
            <option value="">Qualquer pendência</option>
            {TAREFAS.map((t) => (
              <option key={t} value={t}>
                {TAREFA_LABEL[t]}
              </option>
            ))}
          </select>
          <select className="input h-9 w-auto" value={periodoDias} onChange={(e) => mudar(setPeriodoDias)(Number(e.target.value) || '')} aria-label="Período de registro">
            {PERIODOS_REGISTRO.map((p) => (
              <option key={p.t} value={p.v}>
                {p.t}
              </option>
            ))}
          </select>
          <select className="input h-9 w-auto" value={arquivamento} onChange={(e) => mudar(setArquivamento)(e.target.value as FiltroArquivamento)} aria-label="Arquivamento">
            <option value="ATIVOS">Projetos ativos</option>
            <option value="ARQUIVADOS">Arquivados</option>
            <option value="TODOS">Ativos e arquivados</option>
          </select>
          {temFiltro && (
            <button className="btn-ghost h-9" onClick={limpar}>
              <X className="h-4 w-4" /> Limpar
            </button>
          )}
        </div>
        {dados && (
          <p className="px-1 text-xs text-bb-muted">
            {dados.total} projeto{dados.total !== 1 && 's'}
            {temFiltro && ' com os filtros aplicados'}
          </p>
        )}
      </div>

      {erro && <Erro texto={erro} onTentar={recarregar} />}

      {visao === 'lista' ? (
        <Lista projetos={dados?.itens} total={dados?.total ?? 0} pagina={pagina} setPagina={setPagina} carregando={carregando} limpar={temFiltro ? limpar : undefined} />
      ) : (
        <Kanban projetos={dados?.itens} etapas={etapas} carregando={(carregando && !dados) || !config.dados} />
      )}
    </div>
  );
}

function Lista({ projetos, total, pagina, setPagina, carregando, limpar }: { projetos?: Projeto[]; total: number; pagina: number; setPagina: (n: number) => void; carregando: boolean; limpar?: () => void }) {
  const navigate = useNavigate();
  if (!projetos) return <Skeleton className="h-96" />;
  if (!projetos.length) return <Vazio titulo="Nenhum projeto encontrado" texto="Ajuste a busca ou os filtros." acao={limpar && <button className="btn-secondary" onClick={limpar}>Limpar filtros</button>} />;
  const paginas = Math.ceil(total / TAMANHO_PAGINA);

  return (
    <div className={`card overflow-hidden transition-opacity ${carregando ? 'opacity-60' : ''}`}>
      <div className="scroll-fino overflow-x-auto">
        <table className="w-full min-w-[1120px] text-sm">
          <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-bb-muted">
            <tr>
              <th className="px-5 py-3">Projeto</th>
              <th className="px-3 py-3">Arena</th>
              <th className="px-3 py-3">Etapa</th>
              <th className="px-3 py-3">Pendências</th>
              <th className="px-3 py-3">Origem</th>
              <th className="w-32 px-3 py-3">TRL</th>
              <th className="px-3 py-3">Responsáveis</th>
              <th className="px-5 py-3 text-right">Atualizado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bb-line">
            {projetos.map((p) => (
              <tr key={p.id} className="cursor-pointer transition-colors hover:bg-bb-blue-light/40" onClick={() => navigate(`/app/projetos/${p.id}`)}>
                <td className="max-w-[300px] px-5 py-3.5">
                  <Link to={`/app/projetos/${p.id}`} className="font-bold text-bb-slate hover:text-bb-blue" onClick={(e) => e.stopPropagation()}>
                    {p.titulo}
                  </Link>
                  {p.arquivado && <Selo classe="ml-2 border-slate-300 bg-slate-100 text-slate-600">Arquivado</Selo>}
                  <p className="truncate text-xs text-bb-muted">
                    {areaSigla(p.areaDemandanteId)} · {p.descricaoDor}
                  </p>
                </td>
                <td className="px-3 py-3.5">
                  <ArenaBadge arena={p.arena} />
                </td>
                <td className="px-3 py-3.5">
                  <EtapaBadge etapa={p.etapa} />
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex flex-col items-start gap-1">
                    {p.pendencias.length ? p.pendencias.map((t) => <TarefaBadge key={t} tarefa={t} />) : <span className="text-xs text-slate-400">—</span>}
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  <OrigemBadge origem={p.origem} campanha={p.campanha} />
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="w-4 font-bold">{p.trlAtual}</span>
                    <TrlMeter trl={p.trlAtual} className="flex-1" />
                  </div>
                </td>
                <td className="px-3 py-3.5 text-xs text-slate-600">
                  <span className="block">{p.demandante?.nome ?? <span className="italic text-amber-700">Sem Demandante</span>}</span>
                  <span className="block text-bb-muted">{p.analistaResponsavel?.nome ?? <span className="italic text-slate-400">Sem analista</span>}</span>
                </td>
                <td className="px-5 py-3.5 text-right text-bb-muted">{formatarData(p.atualizadoEm)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-bb-line px-5 py-3 text-sm">
        <span className="text-bb-muted">
          Página {pagina + 1} de {Math.max(paginas, 1)}
        </span>
        <div className="flex gap-1">
          <button className="btn-secondary btn-sm" disabled={pagina === 0} onClick={() => setPagina(pagina - 1)} aria-label="Página anterior">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="btn-secondary btn-sm" disabled={pagina + 1 >= paginas} onClick={() => setPagina(pagina + 1)} aria-label="Próxima página">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Kanban de consulta: colunas vêm da configuração. A movimentação (direta ou pedido de avanço) acontece
// no detalhe do projeto, onde a tela confere perfil, percurso e pedidos pendentes.
function Kanban({ projetos, etapas, carregando }: { projetos?: Projeto[]; etapas: EtapaKanban[]; carregando: boolean }) {
  if (carregando || !projetos)
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Skeleton key={s} className="h-96" />
        ))}
      </div>
    );
  return (
    <div className="scroll-fino -mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${etapas.length}, minmax(240px, 1fr))` }}>
        {etapas.map((etapa) => {
          const itens = projetos.filter((p) => p.etapa.id === etapa.id);
          return (
            <section key={etapa.id} className="flex flex-col rounded-card bg-slate-100/70 p-2.5" aria-label={etapa.nome}>
              <header className="mb-1 flex items-center gap-2 px-1">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: etapa.cor }} />
                <h2 className="text-xs font-bold uppercase tracking-wider text-bb-slate">{etapa.nome}</h2>
                <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-bold text-bb-muted">{itens.length}</span>
              </header>
              <p className="mb-3 px-1 text-[11px] leading-snug text-bb-muted">{etapa.descricao}</p>
              <div className="flex flex-1 flex-col gap-2.5">
                {itens.length === 0 && <p className="rounded-lg border border-dashed border-slate-300 py-8 text-center text-xs text-bb-muted">Vazio</p>}
                {itens.map((p) => (
                  <CartaoKanban key={p.id} p={p} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function CartaoKanban({ p }: { p: Projeto }) {
  return (
    <Link to={`/app/projetos/${p.id}`} className="group block rounded-xl border border-bb-line bg-white p-3 shadow-card transition hover:-translate-y-0.5 hover:border-bb-blue/40 hover:shadow-hover">
      <div className="flex flex-wrap items-center gap-1">
        <OrigemBadge origem={p.origem} campanha={p.campanha} />
        {p.arquivado && <Selo classe="border-slate-300 bg-slate-100 text-slate-600">Arquivado</Selo>}
        <span className="ml-auto text-[11px] font-bold text-bb-blue">TRL {p.trlAtual}</span>
      </div>
      <p className="mt-2 text-sm font-bold leading-snug group-hover:text-bb-blue">{p.titulo}</p>
      {p.pendencias.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {p.pendencias.map((t) => (
            <TarefaBadge key={t} tarefa={t} />
          ))}
        </div>
      )}
      <TrlMeter trl={p.trlAtual} className="mt-2.5" />
      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-bb-muted">
        <UserRound className="h-3.5 w-3.5" />
        <span className="truncate">{p.analistaResponsavel?.nome ?? 'Sem analista'}</span>
        <span className="ml-auto font-semibold">{areaSigla(p.areaDemandanteId)}</span>
      </div>
      <div className="mt-2">
        <ArenaBadge arena={p.arena} />
      </div>
    </Link>
  );
}
