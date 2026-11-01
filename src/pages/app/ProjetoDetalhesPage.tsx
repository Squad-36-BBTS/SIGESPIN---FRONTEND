// Tela compartilhada: vai em todos os zips, mas só o responsável altera. Responsável: Zip 4 · Especialista · Dados e IA.
import { ArrowLeft, ArrowRight, Check, Download, FileText, Gavel, History, MessagesSquare, UserRound } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { ArenaBadge, BotaoAcao, EtapaBadge, Erro, OrigemBadge, Selo, Skeleton, TarefaBadge, TrlBadge, Vazio } from '@/components/common/ui';
import { RadarChart } from '@/components/radar/RadarChart';
import { TrlRegua } from '@/components/trl/TrlRegua';
import { ACOES_PROJETO, temAcao } from '@/fluxos/projeto';
import type { CtxProjeto } from '@/fluxos/tipos';
import { useAsync, useAuth } from '@/hooks';
import { projetoService } from '@/services';
import { mensagemErro } from '@/services/api';
import type { AvaliacaoRadar, Evidencia, ProjetoDetalhe, Usuario } from '@/types/domain';
import {
  CRITERIOS_QUALIFICACAO,
  NATUREZA_LABEL,
  PERFIL_LABEL,
  RADAR_EIXOS,
  SOLICITACAO_BADGE,
  SOLICITACAO_LABEL,
  TAREFA_RESPONSAVEL,
  TIPO_CAMPANHA_LABEL,
  VALIDACAO_BADGE,
  VALIDACAO_LABEL,
  podeResponderConsulta,
} from '@/utils/constants';
import { formatarData, formatarDataHora, formatarScore, formatarTamanho, iniciais, tempoRelativo } from '@/utils/formatters';
import { noProjeto } from '@/utils/permissoes';

const ABAS = [
  { id: 'geral', label: 'Visão geral' },
  { id: 'participacao', label: 'Participação' },
  { id: 'qualificacao', label: 'Qualificação e pareceres' },
  { id: 'maturidade', label: 'Maturidade (TRL)' },
  { id: 'kanban', label: 'Kanban' },
  { id: 'entregas', label: 'Entregas' },
  { id: 'evidencias', label: 'Evidências' },
  { id: 'historico', label: 'Histórico' },
] as const;
type Aba = (typeof ABAS)[number]['id'];

const scores = (r?: AvaliacaoRadar) => (r ? { negocio: r.scoreNegocio, produto: r.scoreProduto, time: r.scoreTime, receita: r.scoreReceita } : null);

export default function ProjetoDetalhesPage() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const [params, setParams] = useSearchParams();
  const aba = (ABAS.find((a) => a.id === params.get('aba'))?.id ?? 'geral') as Aba;
  const { dados: p, erro, recarregar } = useAsync(() => projetoService.obter(Number(id)), [id]);

  // Formulário aberto: id da ação do fluxo + o dado que ela recebe (consulta, entrega, solicitação…)
  const [aberta, setAberta] = useState<{ id: string; alvo?: unknown } | null>(null);
  const abrir = (id: string, alvo?: unknown) => setAberta({ id, alvo });

  const irAba = (a: Aba) => {
    const n = new URLSearchParams(params);
    if (a === 'geral') n.delete('aba');
    else n.set('aba', a);
    setParams(n, { replace: true });
  };
  const fechar = () => setAberta(null);

  if (erro)
    return (
      <div className="space-y-4">
        <Link to="/app/portfolio" className="btn-ghost -ml-3">
          <ArrowLeft className="h-4 w-4" /> Portfólio
        </Link>
        <Erro texto={erro} onTentar={recarregar} />
      </div>
    );
  if (!p || !usuario)
    return (
      <div className="space-y-4">
        <Skeleton className="h-44" />
        <Skeleton className="h-12" />
        <Skeleton className="h-80" />
      </div>
    );

  const pendente = p.solicitacoes.find((s) => s.status === 'PENDENTE') ?? null;
  const ctx: CtxProjeto = { p, usuario, pendente, irAba: (a) => irAba(a as Aba) };

  // Barra "Suas ações": cada fluxo instalado (fluxos/<fluxo>/projeto.tsx) entrega as ações do seu perfil
  const acoes = ACOES_PROJETO.flatMap((a) => {
    const b = a.botao?.(ctx);
    return b ? [{ id: a.id, ...b }] : [];
  });

  const contagem: Partial<Record<Aba, number>> = {
    participacao: p.interacoes.length,
    qualificacao: p.consultas.filter((c) => c.status === 'PENDENTE').length,
    kanban: pendente ? 1 : 0,
    entregas: p.entregas.filter((e) => !e.validacao).length,
    evidencias: p.evidencias.length,
  };

  return (
    <div>
      <Link to="/app/portfolio" className="btn-ghost -ml-3 mb-3">
        <ArrowLeft className="h-4 w-4" /> Portfólio
      </Link>

      <section className="card overflow-hidden">
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-bb-muted">PIN-{String(p.id).padStart(4, '0')}</span>
            <EtapaBadge etapa={p.etapa} />
            <TrlBadge trl={p.trlAtual} />
            <OrigemBadge origem={p.origem} campanha={p.campanha} />
            <ArenaBadge arena={p.arena} />
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">{p.titulo}</h1>
          <p className="mt-1 text-sm text-bb-muted">
            {NATUREZA_LABEL[p.natureza]} · {p.areaDemandanteNome} · registrada em {formatarData(p.criadoEm)} · atualizada {tempoRelativo(p.atualizadoEm)}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <span>
              <span className="text-bb-muted">Demandante:</span> <strong>{p.demandante?.nome ?? 'Não informado'}</strong>
            </span>
            <span>
              <span className="text-bb-muted">Analista:</span> <strong>{p.analistaResponsavel?.nome ?? 'Aguardando triagem'}</strong>
            </span>
          </div>
          {p.pendencias.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-dashed border-bb-line pt-3">
              <span className="text-xs font-semibold text-bb-muted">Pendências:</span>
              {p.pendencias.map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <TarefaBadge tarefa={t} />
                  <span className="text-[11px] text-bb-muted">com {PERFIL_LABEL[TAREFA_RESPONSAVEL[t]]}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {acoes.length > 0 && (
          <div className="border-t border-bb-line bg-slate-50/60 px-6 py-4">
            <p className="eyebrow mb-2">Suas ações · {PERFIL_LABEL[usuario.perfil]}</p>
            <div className="flex flex-wrap items-start gap-2">
              {acoes.map((a) => (
                <BotaoAcao key={a.id} permissao={a.perm} onClick={a.aoClicar ?? (() => abrir(a.id, a.alvo))} icon={a.icon} variante={a.primaria ? 'primario' : 'secundario'}>
                  {a.rotulo}
                </BotaoAcao>
              ))}
            </div>
          </div>
        )}
      </section>

      {pendente && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-card border border-dashed border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <Gavel className="h-4 w-4" />
          <span>
            <strong>Aguardando governança:</strong> {pendente.origem.nome} → {pendente.destino.nome}. O projeto segue em {p.etapa.nome} até a decisão de um Especialista.
          </span>
          <button className="ml-auto font-bold underline" onClick={() => irAba('kanban')}>
            Ver solicitação
          </button>
        </div>
      )}

      <div className="scroll-fino mt-5 overflow-x-auto border-b border-bb-line">
        <div className="flex min-w-max gap-1" role="tablist">
          {ABAS.map((a) => (
            <button
              key={a.id}
              role="tab"
              aria-selected={aba === a.id}
              onClick={() => irAba(a.id)}
              className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-semibold transition-colors ${aba === a.id ? 'text-bb-blue' : 'text-bb-muted hover:text-bb-slate'}`}
            >
              {a.label}
              {!!contagem[a.id] && <span className={`rounded-full px-1.5 text-[10px] font-bold ${aba === a.id ? 'bg-bb-blue text-white' : 'bg-slate-200 text-slate-600'}`}>{contagem[a.id]}</span>}
              <span className={`absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-bb-blue transition-transform duration-300 ${aba === a.id ? 'scale-x-100' : 'scale-x-0'}`} />
            </button>
          ))}
        </div>
      </div>

      <div key={aba} className="page-in mt-5">
        {aba === 'geral' && <VisaoGeral p={p} />}
        {aba === 'participacao' && <Participacao p={p} usuario={usuario} onEnviado={recarregar} />}
        {aba === 'qualificacao' && <QualificacaoAba p={p} usuario={usuario} onResponder={(c) => abrir('emitirParecer', c)} />}
        {aba === 'maturidade' && <Maturidade p={p} />}
        {aba === 'kanban' && <KanbanAba p={p} usuario={usuario} onDecidir={(s, d) => abrir('decidirTransicao', { s, d })} />}
        {aba === 'entregas' && <Entregas p={p} usuario={usuario} onValidar={(e) => abrir('validarEntrega', e)} />}
        {aba === 'evidencias' && <Evidencias p={p} />}
        {aba === 'historico' && <Historico p={p} />}
      </div>

      {ACOES_PROJETO.map(
        (a) => a.Modal && <a.Modal key={a.id} projeto={p} aberto={aberta?.id === a.id} alvo={aberta?.id === a.id ? aberta.alvo ?? null : null} onFechar={fechar} onFeito={recarregar} />,
      )}
    </div>
  );
}

function Autoria({ quem, quando }: { quem: string; quando: string | null }) {
  return (
    <span className="text-xs text-bb-muted">
      {quem} · {formatarDataHora(quando)}
    </span>
  );
}

function VisaoGeral({ p }: { p: ProjetoDetalhe }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="card space-y-5 p-6 lg:col-span-2">
        <div>
          <h2 className="eyebrow">{NATUREZA_LABEL[p.natureza]}</h2>
          <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-700">{p.descricaoDor}</p>
        </div>
        {p.contexto && (
          <div>
            <h2 className="eyebrow">Contexto relevante</h2>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-700">{p.contexto}</p>
          </div>
        )}
        <div className="h-px bg-bb-line" />
        <div>
          <h2 className="eyebrow">Hipótese de solução</h2>
          <p className="mt-2 leading-relaxed text-slate-700">{p.hipoteseSolucao}</p>
        </div>
      </div>
      <dl className="card space-y-4 p-6 text-sm">
        <Info label="Origem">
          <OrigemBadge origem={p.origem} campanha={p.campanha} />
          {p.campanha && (
            <p className="mt-1 text-slate-600">
              {TIPO_CAMPANHA_LABEL[p.campanha.tipo]} · {p.campanha.titulo}
            </p>
          )}
        </Info>
        <Info label="Etapa">
          <EtapaBadge etapa={p.etapa} />
        </Info>
        <Info label="TRL atual">TRL {p.trlAtual}</Info>
        <Info label="Demandante (dono do problema)">{p.demandante?.nome ?? <span className="italic text-slate-400">Não informado</span>}</Info>
        <Info label="Analista">{p.analistaResponsavel?.nome ?? <span className="italic text-slate-400">Aguardando triagem</span>}</Info>
        <Info label="Lei do Bem">{p.potencialLeiDoBem ? 'Com potencial' : 'Sem potencial identificado'}</Info>
      </dl>
    </div>
  );
}

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

const COR_PERFIL: Record<Usuario['perfil'], string> = {
  DEMANDANTE: 'bg-bb-yellow text-bb-slate',
  ANALISTA: 'bg-bb-blue text-white',
  ESPECIALISTA: 'bg-teal-600 text-white',
};

// Conversa do projeto: o demandante responde dúvidas e adiciona contexto durante a evolução
function Participacao({ p, usuario, onEnviado }: { p: ProjetoDetalhe; usuario: Usuario; onEnviado: () => void }) {
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const perm = noProjeto('comentar', usuario, p);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    setEnviando(true);
    try {
      await projetoService.comentar(p.id, texto);
      setTexto('');
      onEnviado();
    } catch (er) {
      toast.error(mensagemErro(er));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="card mx-auto max-w-3xl p-6">
      <h2 className="font-bold">Participação na jornada</h2>
      <p className="text-xs text-bb-muted">Dúvidas, respostas e contexto adicional entre o demandante, o analista e os especialistas.</p>
      {p.interacoes.length === 0 ? (
        <p className="py-8 text-center text-sm text-bb-muted">Nenhuma mensagem ainda.</p>
      ) : (
        <ol className="mt-5 space-y-4">
          {p.interacoes.map((i) => {
            const meu = i.autor.id === usuario.id;
            return (
              <li key={i.id} className={`flex gap-3 ${meu ? 'flex-row-reverse' : ''}`}>
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-bold ${COR_PERFIL[i.perfil]}`} aria-hidden="true">
                  {iniciais(i.autor.nome)}
                </span>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${meu ? 'bg-bb-blue-light' : 'bg-slate-50'}`}>
                  <p className="text-xs font-bold">
                    {i.autor.nome} <span className="font-normal text-bb-muted">· {PERFIL_LABEL[i.perfil]} · {formatarDataHora(i.criadaEm)}</span>
                  </p>
                  <p className="mt-1 whitespace-pre-line text-slate-700">{i.texto}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      {perm.permitido ? (
        <form onSubmit={enviar} className="mt-6 flex gap-2 border-t border-bb-line pt-4">
          <textarea rows={2} className="input flex-1" placeholder="Escreva uma mensagem…" value={texto} onChange={(e) => setTexto(e.target.value)} aria-label="Mensagem" />
          <button type="submit" className="btn-primary self-end" disabled={enviando || !texto.trim()}>
            Enviar
          </button>
        </form>
      ) : (
        <p className="mt-6 border-t border-bb-line pt-4 text-xs text-bb-muted">{perm.motivo}</p>
      )}
    </div>
  );
}

function QualificacaoAba({ p, usuario, onResponder }: { p: ProjetoDetalhe; usuario: Usuario; onResponder: (c: ProjetoDetalhe['consultas'][number]) => void }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-4">
        {p.qualificacoes.length === 0 ? (
          <Vazio titulo="Aguardando triagem" texto="O Analista registra a qualificação com aderência à Tese, relevância, grau de inovação, viabilidade, maturidade e conclusão." />
        ) : (
          p.qualificacoes.map((q, i) => (
            <article key={q.id} className="card p-6">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold">Qualificação</h2>
                {i === 0 ? <Selo classe="border-blue-200 bg-bb-blue-light text-bb-blue">Mais recente</Selo> : <Selo classe="border-slate-200 bg-slate-50 text-slate-500">Anterior</Selo>}
                <span className="ml-auto">
                  <Autoria quem={q.analista.nome} quando={q.criadaEm} />
                </span>
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                {CRITERIOS_QUALIFICACAO.map((c) => (
                  <div key={c.chave}>
                    <dt className="font-semibold text-bb-muted">{c.label}</dt>
                    <dd className="text-slate-700">{q[c.chave]}</dd>
                  </div>
                ))}
                <div>
                  <dt className="font-semibold text-bb-muted">Maturidade avaliada</dt>
                  <dd>TRL {q.trlAvaliado}</dd>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <dt className="font-semibold text-bb-muted">Fundamentação e conclusão</dt>
                  <dd className="text-slate-800">{q.conclusao}</dd>
                </div>
              </dl>
            </article>
          ))
        )}
      </div>

      <div className="card h-fit p-6">
        <h2 className="flex items-center gap-2 font-bold">
          <MessagesSquare className="h-4 w-4 text-bb-blue" /> Consultas e pareceres
        </h2>
        <p className="text-xs text-bb-muted">O parecer técnico subsidia a análise; não é uma decisão de governança.</p>
        {p.consultas.length === 0 ? (
          <p className="py-8 text-center text-sm text-bb-muted">Nenhuma consulta.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {p.consultas.map((c) => (
              <li key={c.id} className="rounded-xl border border-bb-line p-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{c.areaTecnica}</span>
                  {c.status === 'PENDENTE' ? <TarefaBadge tarefa="AGUARDANDO_PARECER" /> : <Selo classe="border-emerald-200 bg-emerald-50 text-emerald-700">Respondida</Selo>}
                </div>
                <p className="mt-1 text-xs text-bb-muted">
                  {c.solicitante.nome} → {c.especialista?.nome ?? `qualquer especialista de ${c.areaTecnica}`} · {formatarDataHora(c.criadaEm)}
                </p>
                <p className="mt-2 italic text-slate-600">“{c.pergunta}”</p>
                {c.status === 'RESPONDIDA' && (
                  <div className="mt-3 space-y-2 rounded-lg bg-teal-50/60 p-3">
                    <p>
                      <span className="font-semibold text-teal-900">Fundamentação:</span> {c.fundamentacao}
                    </p>
                    <p>
                      <span className="font-semibold text-teal-900">Conclusão:</span> {c.conclusao}
                    </p>
                    <ListaArquivos evs={c.evidencias} />
                    <Autoria quem={c.especialista?.nome ?? ''} quando={c.respondidaEm} />
                  </div>
                )}
                {podeResponderConsulta(c, usuario) && temAcao('emitirParecer') && (
                  <button className="btn-primary btn-sm mt-3" onClick={() => onResponder(c)}>
                    Emitir parecer
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Maturidade({ p }: { p: ProjetoDetalhe }) {
  const inicial = p.avaliacoesRadar.find((r) => r.tipoLeitura === 'INICIAL');
  const atual = p.avaliacoesRadar.filter((r) => r.tipoLeitura === 'ATUAL').sort((a, b) => b.dataAvaliacao.localeCompare(a.dataAvaliacao))[0];
  const sI = scores(inicial);
  const sA = scores(atual);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="card p-6">
          <h2 className="font-bold">Régua de prontidão tecnológica</h2>
          <p className="mb-5 text-xs text-bb-muted">O TRL é um indicador: sobe ou desce conforme as avaliações registradas com evidências.</p>
          <TrlRegua atual={p.trlAtual} />
        </div>
        <div className="card p-6">
          <h2 className="font-bold">Radar 4D</h2>
          <p className="text-xs text-bb-muted">{atual ? `Inicial × atual (${formatarData(atual.dataAvaliacao)})` : 'Somente a leitura inicial'}</p>
          {sI || sA ? (
            <>
              <RadarChart inicial={sI} atual={sA ?? null} altura={230} />
              <table className="mt-3 w-full text-sm">
                <tbody className="divide-y divide-bb-line">
                  {(['negocio', 'produto', 'time', 'receita'] as const).map((k, i) => (
                    <tr key={k}>
                      <td className="py-1.5 font-semibold">{RADAR_EIXOS[i]}</td>
                      <td className="py-1.5 text-right tabular-nums text-bb-muted">{sI ? formatarScore(sI[k]) : '—'}</td>
                      <td className="py-1.5 text-right font-bold tabular-nums">{sA ? formatarScore(sA[k]) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p className="py-10 text-center text-sm text-bb-muted">Sem avaliações de radar.</p>
          )}
        </div>
      </div>
      <div className="card p-6">
        <h2 className="font-bold">Avaliações de TRL (cronológico)</h2>
        {p.avaliacoesTrl.length === 0 ? (
          <p className="py-6 text-center text-sm text-bb-muted">Nenhuma avaliação desde o registro (TRL inicial {p.trlAtual}).</p>
        ) : (
          <ol className="mt-4 space-y-3">
            {p.avaliacoesTrl.map((m) => {
              const reducao = m.trlNovo < m.trlAnterior;
              return (
                <li key={m.id} className={`rounded-xl border p-4 text-sm ${reducao ? 'border-amber-300 bg-amber-50/50' : 'border-bb-line'}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">
                      TRL {m.trlAnterior} → <span className={reducao ? 'text-amber-700' : 'text-bb-blue'}>TRL {m.trlNovo}</span>
                    </span>
                    {reducao && <Selo classe="border-amber-300 bg-amber-100 text-amber-900">Redução</Selo>}
                    {m.trlNovo === m.trlAnterior && <Selo classe="border-slate-200 bg-slate-50 text-slate-500">Mantido</Selo>}
                    {m.radarId && <Selo classe="border-slate-200 bg-slate-50 text-slate-600">+ leitura do radar</Selo>}
                    <span className="ml-auto">
                      <Autoria quem={m.responsavel.nome} quando={m.criadaEm} />
                    </span>
                  </div>
                  <p className="mt-2 text-slate-700">{m.justificativa}</p>
                  <ListaArquivos evs={m.evidencias} />
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}

function KanbanAba({ p, usuario, onDecidir }: { p: ProjetoDetalhe; usuario: Usuario; onDecidir: (s: ProjetoDetalhe['solicitacoes'][number], d: 'APROVADA' | 'REJEITADA') => void }) {
  const podeDecidir = temAcao('decidirTransicao') && noProjeto('decidirTransicao', usuario, p).permitido;
  const movs = p.historicoTransicoes.filter((h) => h.tipoMudanca === 'ETAPA');
  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-3">
        <div className="card p-5">
          <h2 className="font-bold">Transições disponíveis a partir de {p.etapa.nome}</h2>
          {p.transicoesDisponiveis.length === 0 ? (
            <p className="mt-2 text-sm text-bb-muted">{p.etapa.terminal ? 'Etapa final: não há transições de saída.' : 'Nenhuma transição ativa na configuração do Kanban.'}</p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-2">
              {p.transicoesDisponiveis.map((t) => (
                <li key={t.id} className="flex items-center gap-2 rounded-lg border border-bb-line px-3 py-2 text-sm">
                  {p.etapa.nome} <ArrowRight className="h-3.5 w-3.5 text-bb-muted" /> <strong>{t.destino.nome}</strong>
                  <span className={`text-xs font-semibold ${t.exigeGovernanca ? 'text-amber-700' : 'text-emerald-700'}`}>{t.exigeGovernanca ? 'com governança' : 'sem governança'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <h2 className="pt-2 font-bold">Solicitações de transição</h2>
        {p.solicitacoes.length === 0 ? (
          <Vazio titulo="Nenhuma solicitação" texto="Transições que exigem governança aparecem aqui até a decisão do Especialista." />
        ) : (
          p.solicitacoes.map((s) => (
            <article key={s.id} className={`card p-5 ${s.status === 'PENDENTE' ? 'border-l-4 border-l-amber-400' : ''}`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold">
                  {s.origem.nome} → {s.destino.nome}
                </span>
                <Selo classe={SOLICITACAO_BADGE[s.status]}>{SOLICITACAO_LABEL[s.status]}</Selo>
                <span className="ml-auto">
                  <Autoria quem={s.solicitante.nome} quando={s.criadaEm} />
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{s.justificativa}</p>
              <ListaArquivos evs={s.evidencias} />
              {s.status !== 'PENDENTE' && (
                <div className={`mt-3 rounded-lg p-3 text-sm ${s.status === 'APROVADA' ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
                  <p className="text-xs font-bold">
                    {s.status === 'APROVADA' ? 'Aprovada' : 'Rejeitada'} por {s.decisor?.nome} (Especialista) · {formatarDataHora(s.decididaEm)}
                  </p>
                  <p className="mt-1">{s.justificativaDecisao}</p>
                  {s.status === 'REJEITADA' && <p className="mt-1 text-xs">O projeto permaneceu em {s.origem.nome}.</p>}
                </div>
              )}
              {s.status === 'PENDENTE' && podeDecidir && (
                <div className="mt-4 flex justify-end gap-2 border-t border-bb-line pt-4">
                  <button className="btn-sm btn border border-rose-200 bg-white text-rose-700 hover:bg-rose-50" onClick={() => onDecidir(s, 'REJEITADA')}>
                    Rejeitar
                  </button>
                  <button className="btn-primary btn-sm" onClick={() => onDecidir(s, 'APROVADA')}>
                    Aprovar
                  </button>
                </div>
              )}
            </article>
          ))
        )}
      </div>
      <div className="card h-fit p-6">
        <h2 className="font-bold">Movimentações realizadas</h2>
        {movs.length === 0 ? (
          <p className="py-6 text-center text-sm text-bb-muted">O projeto ainda está na etapa inicial.</p>
        ) : (
          <ol className="mt-4 space-y-3 text-sm">
            {movs.map((h) => (
              <li key={h.id}>
                <p className="font-semibold">
                  {h.valorAnterior} → {h.valorNovo}
                </p>
                <p className="text-xs text-bb-muted">
                  {h.usuario.nome} · {formatarDataHora(h.dataMudanca)} · {h.solicitacaoId ? `solicitação #${h.solicitacaoId}` : 'sem governança'}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function ListaArquivos({ evs }: { evs: Evidencia[] }) {
  if (!evs.length) return null;
  return (
    <ul className="mt-2 flex flex-wrap gap-2">
      {evs.map((e) => (
        <li key={e.id} className="flex items-center gap-1.5 rounded-lg border border-bb-line bg-white px-2.5 py-1.5 text-xs">
          <FileText className="h-3.5 w-3.5 text-bb-blue" />
          <span className="max-w-[220px] truncate font-semibold">{e.nomeArquivo}</span>
          <span className="text-bb-muted">{formatarTamanho(e.tamanhoBytes)}</span>
        </li>
      ))}
    </ul>
  );
}

function Entregas({ p, usuario, onValidar }: { p: ProjetoDetalhe; usuario: Usuario; onValidar: (e: ProjetoDetalhe['entregas'][number]) => void }) {
  const podeValidar = temAcao('validarEntrega') && noProjeto('validarEntrega', usuario, p).permitido;
  if (p.entregas.length === 0) return <Vazio titulo="Nenhuma entrega publicada" texto="O Analista publica entregas e MVPs para validação do demandante." />;
  return (
    <div className="space-y-3">
      <p className="text-xs text-bb-muted">A validação do demandante fica registrada aqui e não altera o TRL nem a etapa do Kanban.</p>
      {p.entregas.map((e) => (
        <article key={e.id} className={`card p-5 ${!e.validacao ? 'border-l-4 border-l-bb-blue' : ''}`}>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold">{e.titulo}</h3>
            {e.ehMvp && <Selo classe="border-indigo-200 bg-indigo-50 text-indigo-800">MVP</Selo>}
            {e.validacao ? <Selo classe={VALIDACAO_BADGE[e.validacao.resultado]}>{VALIDACAO_LABEL[e.validacao.resultado]}</Selo> : <TarefaBadge tarefa="AGUARDANDO_VALIDACAO" />}
            <span className="ml-auto">
              <Autoria quem={e.registradaPor.nome} quando={e.registradaEm} />
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-700">{e.descricao}</p>
          <ListaArquivos evs={e.evidencias} />
          {e.validacao && (
            <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
              <p className="text-xs font-bold">
                Validação de {e.validacao.por.nome} (demandante) · {formatarDataHora(e.validacao.em)}
              </p>
              <p className="mt-1 text-slate-700">{e.validacao.observacoes}</p>
            </div>
          )}
          {!e.validacao && podeValidar && (
            <div className="mt-4 flex justify-end border-t border-bb-line pt-4">
              <button className="btn-primary btn-sm" onClick={() => onValidar(e)}>
                <Check className="h-3.5 w-3.5" /> Validar
              </button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

const VINCULO_LABEL: Record<Evidencia['vinculo']['tipo'], string> = {
  TRL: 'Avaliação TRL',
  PARECER: 'Parecer técnico',
  SOLICITACAO: 'Solicitação de transição',
  ENTREGA: 'Entrega',
  GERAL: 'Movimentação / geral',
};

function Evidencias({ p }: { p: ProjetoDetalhe }) {
  if (!p.evidencias.length) return <Vazio titulo="Nenhuma evidência" texto="Evidências são anexadas em avaliações de TRL, pareceres, solicitações e entregas." />;
  return (
    <div className="card overflow-hidden">
      <div className="scroll-fino overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-bb-muted">
            <tr>
              <th className="px-5 py-3">Arquivo</th>
              <th className="px-3 py-3">Tipo</th>
              <th className="px-3 py-3">Registro</th>
              <th className="px-3 py-3">Autor e data</th>
              <th className="px-3 py-3">Envio</th>
              <th className="px-5 py-3 text-right">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bb-line">
            {p.evidencias.map((e) => (
              <tr key={e.id}>
                <td className="px-5 py-3">
                  <span className="flex items-center gap-2 font-semibold">
                    <FileText className="h-4 w-4 text-bb-blue" /> {e.nomeArquivo}
                  </span>
                  <span className="text-xs text-bb-muted">{formatarTamanho(e.tamanhoBytes)}</span>
                </td>
                <td className="px-3 py-3 text-xs text-bb-muted">{e.nomeArquivo.split('.').pop()?.toUpperCase()}</td>
                <td className="px-3 py-3">{VINCULO_LABEL[e.vinculo.tipo]}</td>
                <td className="px-3 py-3 text-xs">
                  {e.enviadaPor.nome}
                  <br />
                  <span className="text-bb-muted">{formatarDataHora(e.dataUpload)}</span>
                </td>
                <td className="px-3 py-3">
                  <Selo classe="border-emerald-200 bg-emerald-50 text-emerald-700">Enviado</Selo>
                </td>
                <td className="px-5 py-3 text-right">
                  {/* O link de download será fornecido pela API; o caminho do storage não é público */}
                  <button className="btn-ghost btn-sm" disabled title="Download disponível após a integração com a API">
                    <Download className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Historico({ p }: { p: ProjetoDetalhe }) {
  // Linha do tempo única com todos os registros (somente consulta)
  const eventos: { quando: string; titulo: string; detalhe?: string; quem: string }[] = [
    { quando: p.criadoEm, titulo: 'Demanda registrada', quem: p.demandante?.nome ?? '—', detalhe: `Origem ${p.origem === 'INDUZIDA' ? 'induzida' : 'espontânea'}` },
    ...p.qualificacoes.map((q) => ({ quando: q.criadaEm, titulo: 'Qualificação registrada', quem: q.analista.nome, detalhe: q.conclusao })),
    ...p.consultas.map((c) => ({ quando: c.criadaEm, titulo: `Consulta a ${c.areaTecnica}`, quem: c.solicitante.nome, detalhe: c.pergunta })),
    ...p.consultas.filter((c) => c.respondidaEm).map((c) => ({ quando: c.respondidaEm!, titulo: 'Parecer técnico emitido', quem: c.especialista?.nome ?? '—', detalhe: c.conclusao ?? undefined })),
    ...p.avaliacoesTrl.map((a) => ({ quando: a.criadaEm, titulo: `Avaliação TRL: ${a.trlAnterior} → ${a.trlNovo}`, quem: a.responsavel.nome, detalhe: a.justificativa })),
    ...p.solicitacoes.map((s) => ({ quando: s.criadaEm, titulo: `Solicitação: ${s.origem.nome} → ${s.destino.nome}`, quem: s.solicitante.nome, detalhe: s.justificativa })),
    ...p.solicitacoes.filter((s) => s.decididaEm).map((s) => ({ quando: s.decididaEm!, titulo: `Governança: ${s.status === 'APROVADA' ? 'aprovada' : 'rejeitada'}`, quem: s.decisor?.nome ?? '—', detalhe: s.justificativaDecisao ?? undefined })),
    ...p.historicoTransicoes.filter((h) => h.tipoMudanca === 'ETAPA').map((h) => ({ quando: h.dataMudanca, titulo: `Movimentação: ${h.valorAnterior} → ${h.valorNovo}`, quem: h.usuario.nome, detalhe: h.motivo ?? undefined })),
    ...p.entregas.map((e) => ({ quando: e.registradaEm, titulo: `${e.ehMvp ? 'MVP' : 'Entrega'} publicada: ${e.titulo}`, quem: e.registradaPor.nome })),
    ...p.entregas.filter((e) => e.validacao).map((e) => ({ quando: e.validacao!.em, titulo: `Validação: ${VALIDACAO_LABEL[e.validacao!.resultado]}`, quem: e.validacao!.por.nome, detalhe: e.validacao!.observacoes })),
  ].sort((a, b) => b.quando.localeCompare(a.quando));

  return (
    <div className="card p-6">
      <h2 className="flex items-center gap-2 font-bold">
        <History className="h-4 w-4 text-bb-blue" /> Histórico do projeto
      </h2>
      <p className="text-xs text-bb-muted">Registros com autoria e data. Somente consulta: nenhum registro histórico é apagado.</p>
      <ol className="relative mt-6 space-y-5 border-l-2 border-bb-line pl-6">
        {eventos.map((ev, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-white bg-bb-blue ring-2 ring-bb-blue/20" />
            <p className="text-sm font-bold">{ev.titulo}</p>
            {ev.detalhe && <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">{ev.detalhe}</p>}
            <p className="mt-0.5 flex items-center gap-1 text-xs text-bb-muted">
              <UserRound className="h-3 w-3" /> {ev.quem} · {formatarDataHora(ev.quando)}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
