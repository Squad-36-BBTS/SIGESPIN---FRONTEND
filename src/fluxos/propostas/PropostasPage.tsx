import { ArrowRight, Columns3, GitBranch, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { BotaoAcao, Erro, PageHeader, Selo, Skeleton, Vazio } from '@/components/common/ui';
import { useAsync, useAuth } from '@/hooks';
import { kanbanService, propostaService } from '@/services';
import type { PropostaConfiguracao, StatusGovernanca, TipoProposta } from '@/types/domain';
import { GOVERNANCA_BADGE, GOVERNANCA_LABEL, STATUS_GOVERNANCA, TIPO_PROPOSTA_LABEL, TIPO_TERMINAL_LABEL } from '@/utils/constants';
import { formatarDataHora } from '@/utils/formatters';
import { podeCancelar, porPerfil } from '@/utils/permissoes';

import { EncerrarPropostaModal, type Encerramento } from './EncerrarPropostaModal';
import { ProporModal } from './ProporModal';

// Propostas de configuração do quadro (guia, seção 3): o Analista propõe coluna ou percurso; o Especialista
// aprova (aplica depois de revalidar) ou rejeita; o Analista cancela só o próprio pedido e o Especialista
// também pode cancelar. A listagem filtra por status e diferencia COLUNA de TRANSICAO.
export default function PropostasPage() {
  const { usuario } = useAuth();
  const [params] = useSearchParams();
  const [status, setStatus] = useState<StatusGovernanca | ''>((params.get('status') as StatusGovernanca) ?? '');
  const [tipo, setTipo] = useState<TipoProposta | ''>('');
  const [propor, setPropor] = useState(false);
  const [encerrar, setEncerrar] = useState<{ p: PropostaConfiguracao; acao: Encerramento } | null>(null);
  const lista = useAsync(() => propostaService.listar(status), [status]);
  const config = useAsync(() => kanbanService.configuracao(), []);
  if (!usuario) return null;

  const etapas = config.dados?.etapas ?? [];
  const nome = (id: number) => etapas.find((e) => e.id === id)?.nome ?? `#${id}`;
  const descrever = (p: PropostaConfiguracao) =>
    p.tipo === 'COLUNA' ? `Coluna ${p.proposta.nome} (${p.proposta.codigo})` : `Percurso ${nome(p.proposta.origemId)} → ${nome(p.proposta.destinoId)}`;
  const recarregar = () => {
    lista.recarregar();
    config.recarregar();
  };
  const itens = (lista.dados ?? []).filter((p) => !tipo || p.tipo === tipo);
  const podeDecidir = porPerfil('decidirProposta', usuario).permitido;

  return (
    <div>
      <PageHeader
        eyebrow="Kanban"
        titulo="Propostas de configuração"
        descricao="Alterações no quadro propostas pelo Analista e decididas pelo Especialista. Rejeição e cancelamento preservam a proposta sem aplicar a alteração."
        acoes={
          porPerfil('proporConfiguracao', usuario).permitido && (
            <BotaoAcao permissao={porPerfil('proporConfiguracao', usuario)} onClick={() => setPropor(true)} icon={<Plus className="h-4 w-4" />} variante="primario">
              Propor alteração
            </BotaoAcao>
          )
        }
      />

      <div className="card mb-5 flex flex-wrap items-center gap-2 p-3">
        <select className="input h-9 w-auto" value={status} onChange={(e) => setStatus(e.target.value as StatusGovernanca | '')} aria-label="Status">
          <option value="">Todos os status</option>
          {STATUS_GOVERNANCA.map((s) => (
            <option key={s} value={s}>
              {GOVERNANCA_LABEL[s]}
            </option>
          ))}
        </select>
        <select className="input h-9 w-auto" value={tipo} onChange={(e) => setTipo(e.target.value as TipoProposta | '')} aria-label="Tipo">
          <option value="">Colunas e percursos</option>
          <option value="COLUNA">{TIPO_PROPOSTA_LABEL.COLUNA}</option>
          <option value="TRANSICAO">{TIPO_PROPOSTA_LABEL.TRANSICAO}</option>
        </select>
        {(status || tipo) && (
          <button
            className="btn-ghost h-9"
            onClick={() => {
              setStatus('');
              setTipo('');
            }}
          >
            <X className="h-4 w-4" /> Limpar
          </button>
        )}
      </div>

      {lista.erro && <Erro texto={lista.erro} onTentar={lista.recarregar} />}
      {!lista.dados ? (
        <Skeleton className="h-64" />
      ) : itens.length === 0 ? (
        <Vazio titulo="Nenhuma proposta" texto={status || tipo ? 'Nenhuma proposta com estes filtros.' : 'As propostas de coluna ou percurso aparecem aqui.'} />
      ) : (
        <div className="space-y-3">
          {itens.map((p) => {
            const cancelar = podeCancelar('cancelarProposta', usuario, { status: p.status, solicitanteId: p.autor.id });
            const Icone = p.tipo === 'COLUNA' ? Columns3 : GitBranch;
            return (
              <article key={p.id} className={`card p-5 ${p.status === 'PENDENTE' ? 'border-l-4 border-l-amber-400' : ''}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <Icone className="h-4 w-4 text-bb-blue" />
                  <h2 className="font-bold">{descrever(p)}</h2>
                  <Selo classe="border-slate-200 bg-slate-50 text-slate-600">{p.tipo}</Selo>
                  <Selo classe={GOVERNANCA_BADGE[p.status]}>{GOVERNANCA_LABEL[p.status]}</Selo>
                  <span className="ml-auto text-xs text-bb-muted">
                    {p.autor.nome} · {formatarDataHora(p.criadaEm)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-bb-muted">
                  {p.tipo === 'COLUNA' ? (
                    <>
                      Ordem {p.proposta.ordem} · {p.proposta.terminal ? `terminal (${TIPO_TERMINAL_LABEL[p.proposta.terminal]})` : 'não terminal'}
                      {p.proposta.descricao ? ` · ${p.proposta.descricao}` : ''}
                    </>
                  ) : (
                    <>
                      {nome(p.proposta.origemId)} <ArrowRight className="inline h-3 w-3" /> {nome(p.proposta.destinoId)} · {p.proposta.exigeGovernanca ? 'governado' : 'livre'}
                    </>
                  )}
                </p>
                <p className="mt-2 text-sm text-slate-700">{p.justificativa}</p>
                {p.status !== 'PENDENTE' && (
                  <div className={`mt-3 rounded-lg p-3 text-sm ${p.status === 'APROVADA' ? 'bg-emerald-50 text-emerald-900' : 'bg-slate-50 text-slate-700'}`}>
                    <p className="text-xs font-bold">
                      {GOVERNANCA_LABEL[p.status]} por {p.encerradaPor?.nome} · {formatarDataHora(p.encerradaEm)}
                    </p>
                    <p className="mt-1">{p.justificativaEncerramento}</p>
                  </div>
                )}
                {p.status === 'PENDENTE' && (podeDecidir || cancelar.permitido) && (
                  <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-bb-line pt-4">
                    {cancelar.permitido && (
                      <button className="btn-ghost btn-sm" onClick={() => setEncerrar({ p, acao: 'CANCELAR' })}>
                        Cancelar pedido
                      </button>
                    )}
                    {podeDecidir && (
                      <>
                        <button className="btn-sm btn border border-rose-200 bg-white text-rose-700 hover:bg-rose-50" onClick={() => setEncerrar({ p, acao: 'REJEITAR' })}>
                          Rejeitar
                        </button>
                        <button className="btn-primary btn-sm" onClick={() => setEncerrar({ p, acao: 'APROVAR' })}>
                          Aprovar
                        </button>
                      </>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <ProporModal aberto={propor} etapas={etapas} onFechar={() => setPropor(false)} onFeito={recarregar} />
      <EncerrarPropostaModal alvo={encerrar} descricao={encerrar ? descrever(encerrar.p) : ''} onFechar={() => setEncerrar(null)} onFeito={recarregar} />
    </div>
  );
}
