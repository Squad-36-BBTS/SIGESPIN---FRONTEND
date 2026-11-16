import { ArrowDown, ArrowRight, ArrowUp, Gavel, Lock, Pencil, Plus, Power, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Campo, Erro, Modal, PageHeader, Selo, SeloDiscussao, Skeleton, Spinner } from '@/components/common/ui';
import { useAsync } from '@/hooks';
import { kanbanService, projetoService } from '@/services';
import { mensagemErro } from '@/services/api';
import type { EtapaKanban } from '@/types/domain';
import { CORES_ETAPA } from '@/utils/constants';

// Configuração do Kanban: etapas e transições, com exigência de governança por transição.
// Quem pode configurar ainda está "a definir" (guia, seção 7): a tela abre em modo consulta e a
// edição só é liberada como simulação para discussão com o cliente.
export default function KanbanConfigPage() {
  const config = useAsync(() => kanbanService.configuracao(), []);
  const projetos = useAsync(() => projetoService.listar(), []);
  const [simular, setSimular] = useState(false);
  const [editando, setEditando] = useState<Partial<EtapaKanban> | null>(null);
  const [nova, setNova] = useState({ origemId: 0, destinoId: 0, exigeGovernanca: true });
  const [ocupado, setOcupado] = useState(false);

  const recarregar = () => {
    config.recarregar();
    projetos.recarregar();
  };
  const executar = async (fn: () => Promise<void>, ok?: string) => {
    setOcupado(true);
    try {
      await fn();
      if (ok) toast.success(ok);
      recarregar();
    } catch (e) {
      toast.error(mensagemErro(e));
    } finally {
      setOcupado(false);
    }
  };

  const etapas = config.dados?.etapas ?? [];
  const transicoes = config.dados?.transicoes ?? [];
  const nome = (id: number) => etapas.find((e) => e.id === id)?.nome ?? `#${id}`;
  const emUso = (id: number) => (projetos.dados?.itens ?? []).filter((p) => p.etapa.id === id).length;

  return (
    <div>
      <PageHeader
        eyebrow="Kanban"
        titulo="Configurar etapas e transições"
        descricao="Etapas representam a jornada real. Cada transição indica se exige governança. Etapas em uso não podem ser removidas."
        acoes={
          <button className={simular ? 'btn-secondary' : 'btn-primary'} onClick={() => setSimular((v) => !v)}>
            {simular ? <Lock className="h-4 w-4" /> : <Pencil className="h-4 w-4" />} {simular ? 'Voltar ao modo consulta' : 'Simular edição'}
          </button>
        }
      />

      <div className={`mb-5 flex flex-wrap items-center gap-3 rounded-card border border-dashed px-4 py-3 text-sm ${simular ? 'border-purple-300 bg-purple-50 text-purple-900' : 'border-bb-line-2 bg-white text-slate-600'}`}>
        <SeloDiscussao texto="Permissão a definir" />
        {simular
          ? 'Edição liberada apenas como simulação para discussão. Quem poderá configurar o Kanban ainda será decidido com o cliente.'
          : 'Modo consulta. Quem poderá configurar o Kanban (Analista, Especialista ou ambos) ainda será decidido com o cliente.'}
      </div>

      {config.erro && <Erro texto={config.erro} onTentar={config.recarregar} />}
      {!config.dados ? (
        <Skeleton className="h-96" />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">
          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Etapas (ordem das colunas)</h2>
              {simular && (
                <button className="btn-secondary btn-sm" onClick={() => setEditando({ nome: '', descricao: '', cor: CORES_ETAPA[5], terminal: false })}>
                  <Plus className="h-3.5 w-3.5" /> Nova etapa
                </button>
              )}
            </div>
            <ul className="mt-4 space-y-2">
              {etapas.map((e, i) => {
                const uso = emUso(e.id);
                return (
                  <li key={e.id} className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${e.ativa ? 'border-bb-line' : 'border-dashed border-bb-line-2 bg-slate-50 opacity-70'}`}>
                    <span className="h-8 w-2 rounded-full" style={{ background: e.cor }} />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 font-bold">
                        {e.nome}
                        {e.terminal && <Selo classe="border-slate-200 bg-slate-100 text-slate-600">Final</Selo>}
                        {!e.ativa && <Selo classe="border-slate-200 bg-white text-slate-500">Inativa</Selo>}
                      </p>
                      <p className="text-xs text-bb-muted">
                        {e.descricao || 'Sem descrição'} · {uso} projeto{uso !== 1 && 's'}
                      </p>
                    </div>
                    {simular && (
                      <div className="flex gap-1">
                        <button className="btn-ghost h-8 w-8 px-0" aria-label={`Subir ${e.nome}`} disabled={ocupado || i === 0} onClick={() => executar(() => kanbanService.reordenarEtapa(e.id, -1))}>
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button className="btn-ghost h-8 w-8 px-0" aria-label={`Descer ${e.nome}`} disabled={ocupado || i === etapas.length - 1} onClick={() => executar(() => kanbanService.reordenarEtapa(e.id, 1))}>
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button className="btn-ghost h-8 w-8 px-0" aria-label={`Editar ${e.nome}`} onClick={() => setEditando(e)}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          className="btn-ghost h-8 w-8 px-0"
                          aria-label={e.ativa ? `Inativar ${e.nome}` : `Ativar ${e.nome}`}
                          title={e.ativa && uso ? 'Em uso: não pode ser inativada' : e.ativa ? 'Inativar' : 'Ativar'}
                          disabled={ocupado || (e.ativa && uso > 0)}
                          onClick={() => executar(() => kanbanService.alternarEtapa(e.id), e.ativa ? 'Etapa inativada.' : 'Etapa ativada.')}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button
                          className="btn-ghost h-8 w-8 px-0 hover:text-rose-600"
                          aria-label={`Remover ${e.nome}`}
                          title={uso ? 'Em uso: não pode ser removida' : 'Remover'}
                          disabled={ocupado || uso > 0}
                          onClick={() => executar(() => kanbanService.excluirEtapa(e.id), 'Etapa removida.')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="card p-5">
            <h2 className="font-bold">Transições permitidas</h2>
            <p className="text-xs text-bb-muted">Com governança, o Analista cria uma solicitação e um Especialista decide. Sem governança, o Analista movimenta com justificativa.</p>
            <ul className="mt-4 space-y-2">
              {transicoes.map((t) => (
                <li key={t.id} className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 text-sm ${t.ativa ? 'border-bb-line' : 'border-dashed border-bb-line-2 bg-slate-50 opacity-70'}`}>
                  <span className="flex flex-1 items-center gap-1.5 font-semibold">
                    {nome(t.origemId)} <ArrowRight className="h-3.5 w-3.5 text-bb-muted" /> {nome(t.destinoId)}
                  </span>
                  <label className={`flex items-center gap-1.5 text-xs font-semibold ${t.exigeGovernanca ? 'text-amber-700' : 'text-emerald-700'}`}>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-amber-600"
                      checked={t.exigeGovernanca}
                      disabled={!simular || ocupado}
                      onChange={(e) => executar(() => kanbanService.atualizarTransicao(t.id, { exigeGovernanca: e.target.checked }))}
                    />
                    <Gavel className="h-3.5 w-3.5" /> Exige governança
                  </label>
                  {simular && (
                    <button className="btn-ghost btn-sm" disabled={ocupado} onClick={() => executar(() => kanbanService.atualizarTransicao(t.id, { ativa: !t.ativa }))}>
                      {t.ativa ? 'Inativar' : 'Ativar'}
                    </button>
                  )}
                  {!t.ativa && <Selo classe="border-slate-200 bg-white text-slate-500">Inativa</Selo>}
                </li>
              ))}
            </ul>
            {simular && (
              <div className="mt-5 grid gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-[1fr_1fr_auto]">
                <select className="input" value={nova.origemId} onChange={(e) => setNova({ ...nova, origemId: Number(e.target.value) })} aria-label="Origem">
                  <option value={0}>De…</option>
                  {etapas.filter((e) => e.ativa && !e.terminal).map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nome}
                    </option>
                  ))}
                </select>
                <select className="input" value={nova.destinoId} onChange={(e) => setNova({ ...nova, destinoId: Number(e.target.value) })} aria-label="Destino">
                  <option value={0}>Para…</option>
                  {etapas.filter((e) => e.ativa && e.id !== nova.origemId).map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nome}
                    </option>
                  ))}
                </select>
                <button
                  className="btn-primary"
                  disabled={ocupado || !nova.origemId || !nova.destinoId}
                  onClick={() => executar(() => kanbanService.salvarTransicao(nova), 'Transição adicionada.').then(() => setNova({ origemId: 0, destinoId: 0, exigeGovernanca: true }))}
                >
                  <Plus className="h-4 w-4" /> Adicionar
                </button>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 sm:col-span-3">
                  <input type="checkbox" className="h-4 w-4 accent-amber-600" checked={nova.exigeGovernanca} onChange={(e) => setNova({ ...nova, exigeGovernanca: e.target.checked })} />
                  A nova transição exige governança
                </label>
              </div>
            )}
          </section>
        </div>
      )}

      <EtapaModal etapa={editando} onFechar={() => setEditando(null)} onSalvo={recarregar} />
    </div>
  );
}

function EtapaModal({ etapa, onFechar, onSalvo }: { etapa: Partial<EtapaKanban> | null; onFechar: () => void; onSalvo: () => void }) {
  const [form, setForm] = useState({ nome: '', descricao: '', cor: CORES_ETAPA[0], terminal: false });
  const [enviando, setEnviando] = useState(false);
  const [ultima, setUltima] = useState<Partial<EtapaKanban> | null>(null);

  if (etapa !== ultima) {
    setUltima(etapa);
    if (etapa) setForm({ nome: etapa.nome ?? '', descricao: etapa.descricao ?? '', cor: etapa.cor ?? CORES_ETAPA[0], terminal: !!etapa.terminal });
  }
  if (!etapa) return null;

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await kanbanService.salvarEtapa({ ...form, id: etapa.id });
      toast.success(etapa.id ? 'Etapa atualizada.' : 'Etapa criada no fim do Kanban.');
      onSalvo();
      onFechar();
    } catch (er) {
      toast.error(mensagemErro(er));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal
      aberto
      onFechar={onFechar}
      titulo={etapa.id ? 'Editar etapa' : 'Nova etapa'}
      rodape={
        <>
          <button className="btn-ghost" onClick={onFechar} disabled={enviando}>
            Cancelar
          </button>
          <button type="submit" form="form-etapa" className="btn-primary" disabled={enviando}>
            {enviando && <Spinner />} Salvar
          </button>
        </>
      }
    >
      <form id="form-etapa" onSubmit={salvar} className="space-y-4">
        <Campo label="Nome" htmlFor="et-nome">
          <input id="et-nome" className="input" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        </Campo>
        <Campo label="Descrição" htmlFor="et-desc">
          <input id="et-desc" className="input" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
        </Campo>
        <fieldset>
          <legend className="label">Cor</legend>
          <div className="flex flex-wrap gap-2">
            {CORES_ETAPA.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, cor: c })}
                className={`h-8 w-8 rounded-full ring-offset-2 transition ${form.cor === c ? 'ring-2 ring-bb-slate' : ''}`}
                style={{ background: c }}
                aria-label={`Cor ${c}`}
                aria-pressed={form.cor === c}
              />
            ))}
          </div>
        </fieldset>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" className="h-4 w-4 accent-bb-blue" checked={form.terminal} onChange={(e) => setForm({ ...form, terminal: e.target.checked })} />
          Etapa final (sem transições de saída, como Concluído e Descontinuado)
        </label>
      </form>
    </Modal>
  );
}
