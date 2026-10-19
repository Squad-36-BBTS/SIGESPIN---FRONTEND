import { ChevronLeft, ChevronRight, Columns3, Gavel, List, Plus, Search, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { ArenaBadge, EtapaBadge, Erro, OrigemBadge, PageHeader, Skeleton, TrlMeter, Vazio } from '@/components/common/ui';
import { useAsync, useAuth, useDebounce } from '@/hooks';
import { campanhaService, projetoService } from '@/services';
import type { ArenaTipo, EtapaJornada, OrigemDemanda, Projeto } from '@/types/domain';
import {
  ARENA_LABEL,
  ARENAS,
  ETAPA_COR,
  ETAPA_CURTO,
  ETAPA_DESCRICAO,
  ETAPA_LABEL,
  ETAPAS_ENCERRADAS,
  ETAPAS_FLUXO,
  ORIGEM_LABEL,
  TIPO_CAMPANHA_LABEL,
  TODAS_ETAPAS,
  areaSigla,
} from '@/utils/constants';
import { formatarData, formatarMoedaBRL } from '@/utils/formatters';

const TAMANHO_PAGINA = 8;

export default function PortfolioPage() {
  const { podeVerFinanceiro, temPerfil } = useAuth();
  const [params, setParams] = useSearchParams();
  const visao = params.get('visao') === 'kanban' ? 'kanban' : 'lista';
  const [busca, setBusca] = useState(params.get('q') ?? '');
  const [arena, setArena] = useState<ArenaTipo | ''>((params.get('arena') as ArenaTipo) ?? '');
  const [etapa, setEtapa] = useState<EtapaJornada | ''>((params.get('etapa') as EtapaJornada) ?? '');
  const [origem, setOrigem] = useState<OrigemDemanda | ''>(params.get('campanha') ? 'INDUZIDA' : '');
  const [campanhaId, setCampanhaId] = useState<number | ''>(Number(params.get('campanha')) || '');
  const [pagina, setPagina] = useState(0);
  const buscaDebounced = useDebounce(busca, 300);
  const campanhas = useAsync(() => campanhaService.listar(), []);

  const base = { busca: buscaDebounced, arena, origem, campanhaId };
  const { dados, carregando, erro, recarregar } = useAsync(
    () => (visao === 'kanban' ? projetoService.listar(base) : projetoService.listar({ ...base, etapa, pagina, tamanho: TAMANHO_PAGINA })),
    [visao, buscaDebounced, arena, etapa, origem, campanhaId, pagina],
  );

  const mudarVisao = (v: 'lista' | 'kanban') => {
    const p = new URLSearchParams(params);
    if (v === 'kanban') p.set('visao', 'kanban');
    else p.delete('visao');
    setParams(p, { replace: true });
  };

  const temFiltro = !!(busca || arena || origem || campanhaId || (visao === 'lista' && etapa));
  const limpar = () => {
    setBusca('');
    setArena('');
    setEtapa('');
    setOrigem('');
    setCampanhaId('');
    setPagina(0);
  };
  const mudar = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v);
    setPagina(0);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Portfólio"
        titulo="Demandas e projetos de inovação"
        descricao="Todo o portfólio, do backlog à conclusão. O Kanban mostra os marcos reais da jornada."
        acoes={
          temPerfil('DEMANDANTE') && (
            <Link to="/app/demandas/nova" className="btn-primary">
              <Plus className="h-4 w-4" /> Nova demanda
            </Link>
          )
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
          <select className="input h-9 w-auto" value={origem} onChange={(e) => { mudar(setOrigem)(e.target.value as OrigemDemanda | ''); if (e.target.value !== 'INDUZIDA') setCampanhaId(''); }} aria-label="Origem">
            <option value="">Todas as origens</option>
            {(['ESPONTANEA', 'INDUZIDA'] as const).map((o) => (
              <option key={o} value={o}>
                {ORIGEM_LABEL[o]}
              </option>
            ))}
          </select>
          {origem === 'INDUZIDA' && (
            <select className="input h-9 w-auto max-w-[260px]" value={campanhaId} onChange={(e) => mudar(setCampanhaId)(Number(e.target.value) || '')} aria-label="Campanha">
              <option value="">Todas as campanhas</option>
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
          {visao === 'lista' && (
            <select className="input h-9 w-auto" value={etapa} onChange={(e) => mudar(setEtapa)(e.target.value as EtapaJornada | '')} aria-label="Etapa">
              <option value="">Todas as etapas</option>
              {TODAS_ETAPAS.map((s) => (
                <option key={s} value={s}>
                  {ETAPA_LABEL[s]}
                </option>
              ))}
            </select>
          )}
          {temFiltro && (
            <button className="btn-ghost h-9" onClick={limpar}>
              <X className="h-4 w-4" /> Limpar
            </button>
          )}
        </div>
      </div>

      {erro && <Erro texto={erro} onTentar={recarregar} />}

      {visao === 'lista' ? (
        <Lista projetos={dados?.itens} total={dados?.total ?? 0} pagina={pagina} setPagina={setPagina} carregando={carregando} financeiro={podeVerFinanceiro} limpar={temFiltro ? limpar : undefined} />
      ) : (
        <Kanban projetos={dados?.itens} carregando={carregando && !dados} />
      )}
    </div>
  );
}

function Lista({
  projetos,
  total,
  pagina,
  setPagina,
  carregando,
  financeiro,
  limpar,
}: {
  projetos?: Projeto[];
  total: number;
  pagina: number;
  setPagina: (n: number) => void;
  carregando: boolean;
  financeiro: boolean;
  limpar?: () => void;
}) {
  const navigate = useNavigate();
  if (!projetos) return <Skeleton className="h-96" />;
  if (!projetos.length)
    return <Vazio titulo="Nenhuma demanda encontrada" texto="Ajuste a busca ou os filtros." acao={limpar && <button className="btn-secondary" onClick={limpar}>Limpar filtros</button>} />;
  const paginas = Math.ceil(total / TAMANHO_PAGINA);

  return (
    <div className={`card overflow-hidden transition-opacity ${carregando ? 'opacity-60' : ''}`}>
      <div className="scroll-fino overflow-x-auto">
        <table className="w-full min-w-[920px] text-sm">
          <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-bb-muted">
            <tr>
              <th className="px-5 py-3">Demanda</th>
              <th className="px-3 py-3">Origem</th>
              <th className="px-3 py-3">Arena</th>
              <th className="px-3 py-3">Etapa</th>
              <th className="w-36 px-3 py-3">TRL</th>
              <th className="px-3 py-3">Analista</th>
              {financeiro && <th className="px-3 py-3 text-right">Dispêndio</th>}
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
                  <p className="truncate text-xs text-bb-muted">
                    {areaSigla(p.areaDemandanteId)} · {p.descricaoDor}
                  </p>
                </td>
                <td className="px-3 py-3.5">
                  <OrigemBadge origem={p.origem} campanha={p.campanha} />
                </td>
                <td className="px-3 py-3.5">
                  <ArenaBadge arena={p.arena} />
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-1">
                    <EtapaBadge etapa={p.etapa} />
                    {p.pautaPendente && <Gavel className="h-3.5 w-3.5 text-yellow-700" aria-label="Na pauta da governança" />}
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="w-4 font-bold">{p.trlAtual}</span>
                    <TrlMeter trl={p.trlAtual} className="flex-1" />
                  </div>
                </td>
                <td className="px-3 py-3.5 text-slate-600">{p.analistaResponsavel?.nome ?? <span className="italic text-slate-400">Aguardando triagem</span>}</td>
                {financeiro && <td className="px-3 py-3.5 text-right font-semibold tabular-nums">{formatarMoedaBRL(p.dispendioEstimado)}</td>}
                <td className="px-5 py-3.5 text-right text-bb-muted">{formatarData(p.atualizadoEm)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-bb-line px-5 py-3 text-sm">
        <span className="text-bb-muted">
          {total} demanda{total !== 1 && 's'} · página {pagina + 1} de {Math.max(paginas, 1)}
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

// Kanban de consulta com os marcos reais da jornada. Mudanças acontecem pelas ações do projeto.
function Kanban({ projetos, carregando }: { projetos?: Projeto[]; carregando: boolean }) {
  const [verEncerrados, setVerEncerrados] = useState(false);
  if (carregando || !projetos)
    return (
      <div className="grid grid-cols-3 gap-4 xl:grid-cols-6">
        {ETAPAS_FLUXO.map((s) => (
          <Skeleton key={s} className="h-96" />
        ))}
      </div>
    );
  const encerrados = projetos.filter((p) => ETAPAS_ENCERRADAS.includes(p.etapa));

  return (
    <div className="space-y-4">
      <div className="scroll-fino -mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        <div className="grid min-w-[1320px] grid-cols-6 gap-3">
          {ETAPAS_FLUXO.map((etapa, i) => {
            const itens = projetos.filter((p) => p.etapa === etapa);
            return (
              <section key={etapa} className="flex flex-col rounded-card bg-slate-100/70 p-2.5" aria-label={ETAPA_LABEL[etapa]}>
                <header className="mb-1 flex items-center gap-2 px-1">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: ETAPA_COR[etapa] }} />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-bb-slate">
                    {i + 1}. {ETAPA_CURTO[etapa]}
                  </h2>
                  <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-bold text-bb-muted">{itens.length}</span>
                </header>
                <p className="mb-3 px-1 text-[11px] leading-snug text-bb-muted">{ETAPA_DESCRICAO[etapa]}</p>
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

      {encerrados.length > 0 && (
        <div className="card p-4">
          <button className="flex w-full items-center gap-2 text-left text-sm font-bold" onClick={() => setVerEncerrados((v) => !v)} aria-expanded={verEncerrados}>
            Arquivados e descontinuados ({encerrados.length})
            <ChevronRight className={`ml-auto h-4 w-4 transition-transform ${verEncerrados ? 'rotate-90' : ''}`} />
          </button>
          {verEncerrados && (
            <div className="fade-in mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {encerrados.map((p) => (
                <CartaoKanban key={p.id} p={p} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CartaoKanban({ p }: { p: Projeto }) {
  return (
    <Link to={`/app/projetos/${p.id}`} className="group block rounded-xl border border-bb-line bg-white p-3 shadow-card transition hover:-translate-y-0.5 hover:border-bb-blue/40 hover:shadow-hover">
      <div className="flex flex-wrap items-center gap-1">
        <OrigemBadge origem={p.origem} campanha={p.campanha} />
        {ETAPAS_ENCERRADAS.includes(p.etapa) && <EtapaBadge etapa={p.etapa} />}
        <span className="ml-auto text-[11px] font-bold text-bb-blue">TRL {p.trlAtual}</span>
      </div>
      <p className="mt-2 text-sm font-bold leading-snug group-hover:text-bb-blue">{p.titulo}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {p.pautaPendente && <span className="badge border-yellow-300 bg-yellow-50 text-yellow-900">Na pauta</span>}
        {p.aguardandoComplemento && <span className="badge border-amber-200 bg-amber-50 text-amber-800">Complemento</span>}
        {p.entregasAguardandoValidacao > 0 && <span className="badge border-transparent bg-bb-yellow text-bb-slate">Validação</span>}
      </div>
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
