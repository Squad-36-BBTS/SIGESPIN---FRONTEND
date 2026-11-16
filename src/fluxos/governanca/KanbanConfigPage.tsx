import { ArrowRight, Gavel, Lock, Pencil, Plus, Power } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Campo, Erro, Modal, PageHeader, Selo, Skeleton, Spinner } from '@/components/common/ui';
import { temRota } from '@/fluxos/registro';
import { useAsync, useAuth } from '@/hooks';
import { kanbanService, projetoService } from '@/services';
import { mensagemErro } from '@/services/api';
import type { EtapaKanban, TipoTerminal } from '@/types/domain';
import { CORES_ETAPA, TIPO_TERMINAL_LABEL } from '@/utils/constants';
import { porPerfil } from '@/utils/permissoes';

const CODIGO = /^[A-Z][A-Z0-9_]*$/;

// Configuração do quadro (guia, seção 3). O Especialista cria e edita colunas e percursos diretamente,
// respeitando as restrições de uso e a versão vigente. Os demais perfis consultam; o Analista propõe
// alterações pela tela de propostas.
export default function KanbanConfigPage() {
  const { usuario } = useAuth();
  const config = useAsync(() => kanbanService.configuracao(), []);
  const projetos = useAsync(() => projetoService.listar({ arquivamento: 'TODOS' }), []);
  const [editando, setEditando] = useState<EtapaKanban | 'nova' | null>(null);
  const [nova, setNova] = useState({ origemId: 0, destinoId: 0, exigeGovernanca: true });
  const [ocupado, setOcupado] = useState(false);
  const pode = porPerfil('configurarQuadro', usuario).permitido;

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
      return true;
    } catch (e) {
      toast.error(mensagemErro(e));
      recarregar();
      return false;
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
        titulo="Configuração do quadro"
        descricao="Colunas representam a jornada; percursos dizem para onde cada coluna pode seguir e se exigem governança."
        acoes={
          temRota('/app/propostas') && (
            <Link to="/app/propostas" className="btn-ghost">
              Propostas de configuração
            </Link>
          )
        }
      />

      {!pode && (
        <div className="mb-5 flex flex-wrap items-center gap-2 rounded-card border border-dashed border-bb-line-2 bg-white px-4 py-3 text-sm text-slate-600">
          <Lock className="h-4 w-4" />
          Modo consulta. A configuração direta cabe ao Especialista.
          {usuario?.perfil === 'ANALISTA' && temRota('/app/propostas') && (
            <Link to="/app/propostas" className="font-bold text-bb-blue hover:underline">
              Propor uma coluna ou um percurso
            </Link>
          )}
        </div>
      )}

      {config.erro && <Erro texto={config.erro} onTentar={config.recarregar} />}
      {!config.dados ? (
        <Skeleton className="h-96" />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">
          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Colunas (ordem do quadro)</h2>
              {pode && (
                <button className="btn-secondary btn-sm" onClick={() => setEditando('nova')}>
                  <Plus className="h-3.5 w-3.5" /> Nova coluna
                </button>
              )}
            </div>
            <ul className="mt-4 space-y-2">
              {etapas.map((e) => {
                const uso = emUso(e.id);
                const bloqueio = e.codigo === 'IDEACAO' ? 'Coluna inicial: não pode ser desativada' : uso ? 'Ocupada por projetos: não pode ser desativada' : transicoes.some((t) => t.ativa && (t.origemId === e.id || t.destinoId === e.id)) ? 'Referenciada por percurso ativo' : '';
                return (
                  <li key={e.id} className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${e.ativa ? 'border-bb-line' : 'border-dashed border-bb-line-2 bg-slate-50 opacity-70'}`}>
                    <span className="h-8 w-2 rounded-full" style={{ background: e.cor }} />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 font-bold">
                        {e.nome}
                        <span className="font-mono text-[11px] font-semibold text-bb-muted">{e.codigo}</span>
                        {e.tipoTerminal && <Selo classe="border-slate-200 bg-slate-100 text-slate-600">Terminal · {TIPO_TERMINAL_LABEL[e.tipoTerminal]}</Selo>}
                        {!e.ativa && <Selo classe="border-slate-200 bg-white text-slate-500">Inativa</Selo>}
                      </p>
                      <p className="text-xs text-bb-muted">
                        Ordem {e.ordem} · versão {e.versao} · {uso} projeto{uso !== 1 && 's'}
                        {e.descricao ? ` · ${e.descricao}` : ''}
                      </p>
                    </div>
                    {pode && (
                      <div className="flex gap-1">
                        <button className="btn-ghost h-8 w-8 px-0" aria-label={`Editar ${e.nome}`} onClick={() => setEditando(e)}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          className="btn-ghost h-8 w-8 px-0"
                          aria-label={e.ativa ? `Desativar ${e.nome}` : `Ativar ${e.nome}`}
                          title={e.ativa ? bloqueio || 'Desativar' : 'Ativar'}
                          disabled={ocupado || (e.ativa && !!bloqueio)}
                          onClick={() => executar(() => kanbanService.editarEtapa(e.id, { nome: e.nome, ordem: e.ordem, ativa: !e.ativa, versao: e.versao }), e.ativa ? 'Coluna desativada.' : 'Coluna ativada.')}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="card p-5">
            <h2 className="font-bold">Percursos</h2>
            <p className="text-xs text-bb-muted">Governado: o Analista abre um pedido de avanço e o Especialista decide (ou move diretamente). Livre: Analista e Especialista movem com justificativa.</p>
            <ul className="mt-4 space-y-2">
              {transicoes.map((t) => (
                <li key={t.id} className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 text-sm ${t.ativa ? 'border-bb-line' : 'border-dashed border-bb-line-2 bg-slate-50 opacity-70'}`}>
                  <span className="flex flex-1 items-center gap-1.5 font-semibold">
                    {nome(t.origemId)} <ArrowRight className="h-3.5 w-3.5 text-bb-muted" /> {nome(t.destinoId)}
                    <span className="text-[11px] font-normal text-bb-muted">v{t.versao}</span>
                  </span>
                  <label className={`flex items-center gap-1.5 text-xs font-semibold ${t.exigeGovernanca ? 'text-amber-700' : 'text-emerald-700'}`}>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-amber-600"
                      checked={t.exigeGovernanca}
                      disabled={!pode || ocupado}
                      onChange={(e) => executar(() => kanbanService.editarTransicao(t.id, { exigeGovernanca: e.target.checked, ativa: t.ativa, versao: t.versao }), 'Percurso atualizado.')}
                    />
                    <Gavel className="h-3.5 w-3.5" /> {t.exigeGovernanca ? 'Governado' : 'Livre'}
                  </label>
                  {pode && (
                    <button className="btn-ghost btn-sm" disabled={ocupado} onClick={() => executar(() => kanbanService.editarTransicao(t.id, { exigeGovernanca: t.exigeGovernanca, ativa: !t.ativa, versao: t.versao }), t.ativa ? 'Percurso desativado.' : 'Percurso reativado.')}>
                      {t.ativa ? 'Desativar' : 'Reativar'}
                    </button>
                  )}
                  {!t.ativa && <Selo classe="border-slate-200 bg-white text-slate-500">Inativo</Selo>}
                </li>
              ))}
            </ul>
            {pode && (
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
                  onClick={async () => {
                    if (await executar(() => kanbanService.criarTransicao(nova), 'Percurso criado.')) setNova({ origemId: 0, destinoId: 0, exigeGovernanca: true });
                  }}
                >
                  <Plus className="h-4 w-4" /> Criar
                </button>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 sm:col-span-3">
                  <input type="checkbox" className="h-4 w-4 accent-amber-600" checked={nova.exigeGovernanca} onChange={(e) => setNova({ ...nova, exigeGovernanca: e.target.checked })} />
                  O novo percurso é governado
                </label>
              </div>
            )}
          </section>
        </div>
      )}

      <ColunaModal etapa={editando} etapas={etapas} onFechar={() => setEditando(null)} onSalvo={recarregar} />
    </div>
  );
}

// Criar: código, nome, ordem e tipo terminal. Editar: nome, ordem e ativa (código e tipo terminal ficam fixos).
function ColunaModal({ etapa, etapas, onFechar, onSalvo }: { etapa: EtapaKanban | 'nova' | null; etapas: EtapaKanban[]; onFechar: () => void; onSalvo: () => void }) {
  const [form, setForm] = useState({ codigo: '', nome: '', ordem: 0, terminal: '' as TipoTerminal | '', descricao: '', cor: CORES_ETAPA[5] });
  const [erros, setErros] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [ultima, setUltima] = useState<EtapaKanban | 'nova' | null>(null);

  if (etapa !== ultima) {
    setUltima(etapa);
    setErros({});
    if (etapa === 'nova') setForm({ codigo: '', nome: '', ordem: Math.max(0, ...etapas.map((e) => e.ordem)) + 10, terminal: '', descricao: '', cor: CORES_ETAPA[5] });
    else if (etapa) setForm({ codigo: etapa.codigo, nome: etapa.nome, ordem: etapa.ordem, terminal: etapa.tipoTerminal ?? '', descricao: etapa.descricao, cor: etapa.cor });
  }
  if (!etapa) return null;
  const criando = etapa === 'nova';

  const salvar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (criando && (!CODIGO.test(form.codigo) || form.codigo.length > 255)) e.codigo = 'Comece com letra maiúscula e use só letras maiúsculas, dígitos ou sublinhado.';
    if (!form.nome.trim() || form.nome.trim().length > 255) e.nome = 'Informe o nome (até 255 caracteres).';
    if (!Number.isInteger(form.ordem) || form.ordem < 0) e.ordem = 'Use um inteiro maior ou igual a zero.';
    setErros(e);
    if (Object.keys(e).length) return;
    setEnviando(true);
    try {
      if (criando) await kanbanService.criarEtapa({ codigo: form.codigo, nome: form.nome, ordem: form.ordem, terminal: form.terminal || null, descricao: form.descricao, cor: form.cor });
      else await kanbanService.editarEtapa(etapa.id, { nome: form.nome, ordem: form.ordem, ativa: etapa.ativa, versao: etapa.versao, descricao: form.descricao, cor: form.cor });
      toast.success(criando ? 'Coluna criada.' : 'Coluna atualizada.');
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
      titulo={criando ? 'Nova coluna' : `Editar coluna · versão ${etapa.versao}`}
      rodape={
        <>
          <button className="btn-ghost" onClick={onFechar} disabled={enviando}>
            Cancelar
          </button>
          <button type="submit" form="form-coluna" className="btn-primary" disabled={enviando}>
            {enviando && <Spinner />} Salvar
          </button>
        </>
      }
    >
      <form id="form-coluna" onSubmit={salvar} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Código" erro={erros.codigo} dica={criando ? 'Único. Não muda depois de criado.' : 'Fixo depois da criação.'} htmlFor="col-cod">
            <input id="col-cod" className="input font-mono uppercase" value={form.codigo} disabled={!criando} onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase().replace(/\s/g, '_') })} />
          </Campo>
          <Campo label="Nome" erro={erros.nome} htmlFor="col-nome">
            <input id="col-nome" className="input" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </Campo>
          <Campo label="Ordem" erro={erros.ordem} dica="Inteiro maior ou igual a zero; define a posição da coluna." htmlFor="col-ordem">
            <input id="col-ordem" type="number" min={0} step={1} className="input" value={form.ordem} onChange={(e) => setForm({ ...form, ordem: Number(e.target.value) })} />
          </Campo>
          <Campo label="Tipo terminal" dica={criando ? 'Colunas terminais não admitem saída.' : 'Fixo depois da criação.'} htmlFor="col-term">
            <select id="col-term" className="input" value={form.terminal} disabled={!criando} onChange={(e) => setForm({ ...form, terminal: e.target.value as TipoTerminal | '' })}>
              <option value="">Não é terminal</option>
              <option value="CONCLUSAO">{TIPO_TERMINAL_LABEL.CONCLUSAO}</option>
              <option value="DESCONTINUACAO">{TIPO_TERMINAL_LABEL.DESCONTINUACAO}</option>
            </select>
          </Campo>
        </div>
        <Campo label="Descrição (opcional)" htmlFor="col-desc">
          <input id="col-desc" className="input" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
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
      </form>
    </Modal>
  );
}
