import { ArrowRight, Lightbulb, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { BotaoAcao, Erro, PageHeader, Selo, Skeleton, Vazio } from '@/components/common/ui';
import { temRota } from '@/fluxos/registro';
import { useAsync, useAuth } from '@/hooks';
import { recomendacaoService } from '@/services';
import type { Recomendacao, StatusRecomendacao } from '@/types/domain';
import { PERFIL_LABEL, RECOMENDACAO_BADGE, RECOMENDACAO_LABEL } from '@/utils/constants';
import { formatarDataHora } from '@/utils/formatters';
import { porPerfil } from '@/utils/permissoes';

import { RecomendarModal } from './RecomendarModal';
import { RecusarModal } from './RecusarModal';

const STATUS: StatusRecomendacao[] = ['PENDENTE', 'CONVERTIDA', 'RECUSADA'];

// Recomendações (guia, seção 3): Analista e Especialista recomendam a um Demandante ativo; o destinatário
// converte em uma única demanda espontânea ou recusa com justificativa. O Especialista tem visão de gestão;
// os demais veem as recomendações de que participam.
export default function RecomendacoesPage() {
  const { usuario } = useAuth();
  const [status, setStatus] = useState<StatusRecomendacao | ''>('');
  const [novo, setNovo] = useState(false);
  const [recusar, setRecusar] = useState<Recomendacao | null>(null);
  const { dados, erro, recarregar } = useAsync(() => recomendacaoService.listar(status), [status]);
  if (!usuario) return null;

  const visao =
    usuario.perfil === 'ESPECIALISTA' ? 'Visão de gestão: todas as recomendações do portfólio.' : usuario.perfil === 'ANALISTA' ? 'Recomendações que você enviou.' : 'Recomendações destinadas a você.';

  return (
    <div>
      <PageHeader
        eyebrow="Áreas adicionais"
        titulo="Recomendações"
        descricao={`Sugestões de demanda para Demandantes. ${visao}`}
        acoes={
          porPerfil('recomendarDemanda', usuario).permitido && (
            <BotaoAcao permissao={porPerfil('recomendarDemanda', usuario)} onClick={() => setNovo(true)} icon={<Plus className="h-4 w-4" />} variante="primario">
              Recomendar demanda
            </BotaoAcao>
          )
        }
      />

      <div className="card mb-5 flex flex-wrap items-center gap-2 p-3">
        <select className="input h-9 w-auto" value={status} onChange={(e) => setStatus(e.target.value as StatusRecomendacao | '')} aria-label="Status">
          <option value="">Todos os status</option>
          {STATUS.map((s) => (
            <option key={s} value={s}>
              {RECOMENDACAO_LABEL[s]}
            </option>
          ))}
        </select>
        {status && (
          <button className="btn-ghost h-9" onClick={() => setStatus('')}>
            <X className="h-4 w-4" /> Limpar
          </button>
        )}
        {dados && <span className="ml-auto px-1 text-xs text-bb-muted">{dados.length} recomendação(ões)</span>}
      </div>

      {erro && <Erro texto={erro} onTentar={recarregar} />}
      {!dados ? (
        <Skeleton className="h-64" />
      ) : dados.length === 0 ? (
        <Vazio titulo="Nenhuma recomendação" texto={status ? 'Nenhuma recomendação com este status.' : 'Quando houver recomendações que você pode ver, elas aparecem aqui.'} />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {dados.map((r) => {
            const souDestinatario = r.destinatario.id === usuario.id;
            const podeResponder = souDestinatario && r.status === 'PENDENTE' && porPerfil('responderRecomendacao', usuario).permitido;
            return (
              <article key={r.id} className={`card p-5 ${r.status === 'PENDENTE' ? 'border-l-4 border-l-amber-400' : ''}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                  <h2 className="font-bold">{r.titulo}</h2>
                  <Selo classe={RECOMENDACAO_BADGE[r.status]}>{RECOMENDACAO_LABEL[r.status]}</Selo>
                </div>
                <p className="mt-1 text-xs text-bb-muted">
                  {r.autor.nome} ({PERFIL_LABEL[r.autorPerfil]}) <ArrowRight className="inline h-3 w-3" /> {r.destinatario.nome} · {formatarDataHora(r.criadaEm)}
                </p>
                <p className="mt-3 whitespace-pre-line text-sm text-slate-700">{r.descricao}</p>
                {r.status === 'CONVERTIDA' && r.projeto && (
                  <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
                    Convertida em {formatarDataHora(r.encerradaEm)}:{' '}
                    <Link to={`/app/projetos/${r.projeto.id}`} className="font-bold underline">
                      {r.projeto.titulo}
                    </Link>
                  </p>
                )}
                {r.status === 'RECUSADA' && (
                  <div className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-900">
                    <p className="text-xs font-bold">Recusada em {formatarDataHora(r.encerradaEm)}</p>
                    <p className="mt-1">{r.justificativaEncerramento}</p>
                  </div>
                )}
                {podeResponder && (
                  <div className="mt-4 flex justify-end gap-2 border-t border-bb-line pt-4">
                    <button className="btn-sm btn border border-rose-200 bg-white text-rose-700 hover:bg-rose-50" onClick={() => setRecusar(r)}>
                      Recusar
                    </button>
                    {temRota('/app/demandas/nova') && (
                      <Link to={`/app/demandas/nova?recomendacao=${r.id}`} className="btn-primary btn-sm">
                        Converter em demanda
                      </Link>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <RecomendarModal aberto={novo} onFechar={() => setNovo(false)} onFeito={recarregar} />
      <RecusarModal recomendacao={recusar} onFechar={() => setRecusar(null)} onFeito={recarregar} />
    </div>
  );
}
