import {
  Archive,
  ArrowLeft,
  Ban,
  Check,
  ClipboardList,
  Download,
  FileText,
  Flag,
  Gauge,
  Gavel,
  Hand,
  History,
  MessageSquareWarning,
  MessagesSquare,
  PackageCheck,
  PenLine,
  Shuffle,
  UserRound,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { ArenaBadge, EtapaBadge, Erro, OrigemBadge, Selo, Skeleton, TrlBadge, Vazio } from '@/components/common/ui';
import {
  ConsultaModal,
  DecisaoModal,
  EncaminharModal,
  EntregaModal,
  MarcoModal,
  MaturidadeModal,
  ParecerModal,
  QualificacaoModal,
  TextoModal,
  ValidacaoModal,
} from '@/components/projeto/modais';
import { RadarChart } from '@/components/radar/RadarChart';
import { TrlRegua } from '@/components/trl/TrlRegua';
import { useAsync, useAuth } from '@/hooks';
import { projetoService } from '@/services';
import { mensagemErro } from '@/services/api';
import type { Usuario, AvaliacaoRadar, ConsultaEspecialista, DecisaoTipo, Entrega, Evidencia, PautaGovernanca, ProjetoDetalhe } from '@/types/domain';
import {
  CRITERIOS_QUALIFICACAO,
  DECISAO_LABEL,
  ENTREGA_BADGE,
  ENTREGA_LABEL,
  ETAPA_COR,
  ETAPA_CURTO,
  ETAPA_DESCRICAO,
  ETAPA_LABEL,
  ETAPAS_FLUXO,
  ETAPAS_TERMINAIS,
  NATUREZA_LABEL,
  PERFIL_LABEL,
  podeResponderConsulta,
  RADAR_EIXOS,
  RECOMENDACAO_PARECER_BADGE,
  RECOMENDACAO_PARECER_LABEL,
  RECOMENDACAO_QUALIFICACAO_LABEL,
  TIPO_CAMPANHA_LABEL,
} from '@/utils/constants';
import { formatarData, formatarDataHora, formatarMoedaBRL, formatarScore, formatarTamanho, tempoRelativo } from '@/utils/formatters';

const ABAS = [
  { id: 'geral', label: 'Visão geral' },
  { id: 'participacao', label: 'Participação' },
  { id: 'qualificacao', label: 'Qualificação e pareceres' },
  { id: 'maturidade', label: 'Maturidade' },
  { id: 'entregas', label: 'Entregas' },
  { id: 'governanca', label: 'Governança' },
  { id: 'evidencias', label: 'Evidências' },
  { id: 'historico', label: 'Histórico' },
] as const;
type Aba = (typeof ABAS)[number]['id'];

type ModalAtivo = 'qualificar' | 'consultar' | 'maturidade' | 'entrega' | 'marco' | 'encaminhar' | 'arquivar' | 'complementar' | null;

const scores = (r?: AvaliacaoRadar) => (r ? { negocio: r.scoreNegocio, produto: r.scoreProduto, time: r.scoreTime, receita: r.scoreReceita } : null);

export default function ProjetoDetalhesPage() {
  const { id } = useParams();
  const { usuario, temPerfil, temAlcada, podeVerFinanceiro } = useAuth();
  const [params, setParams] = useSearchParams();
  const aba = (ABAS.find((a) => a.id === params.get('aba'))?.id ?? 'geral') as Aba;
  const { dados: p, erro, recarregar } = useAsync(() => projetoService.obter(Number(id)), [id]);

  const [modal, setModal] = useState<ModalAtivo>(null);
  const [parecer, setParecer] = useState<ConsultaEspecialista | null>(null);
  const [validar, setValidar] = useState<Entrega | null>(null);
  const [decisao, setDecisao] = useState<{ pauta: PautaGovernanca | null; tipo: DecisaoTipo } | null>(null);
  const [assumindo, setAssumindo] = useState(false);

  const irAba = (a: Aba) => {
    const n = new URLSearchParams(params);
    if (a === 'geral') n.delete('aba');
    else n.set('aba', a);
    setParams(n, { replace: true });
  };
  const fechar = () => setModal(null);

  if (erro)
    return (
      <div className="space-y-4">
        <Link to="/app/portfolio" className="btn-ghost -ml-3">
          <ArrowLeft className="h-4 w-4" /> Portfólio
        </Link>
        <Erro texto={erro} onTentar={recarregar} />
      </div>
    );
  if (!p)
    return (
      <div className="space-y-4">
        <Skeleton className="h-44" />
        <Skeleton className="h-12" />
        <Skeleton className="h-80" />
      </div>
    );

  const terminal = ETAPAS_TERMINAIS.includes(p.etapa);
  const analista = temPerfil('ANALISTA');
  // Ações do ciclo: só o analista responsável (ou o analista gestor, com alçada)
  const souResponsavel = analista && (!p.analistaResponsavel || p.analistaResponsavel.id === usuario?.id || temAlcada);
  const conduzidaPorOutro = analista && !souResponsavel;
  const souDemandante = temPerfil('DEMANDANTE') && p.demandante?.id === usuario?.id;
  const pautaPendente = p.pautas.find((x) => x.status === 'PENDENTE') ?? null;
  const minhaConsulta = p.consultas.find((c) => podeResponderConsulta(c, usuario));
  const emCiclo = p.etapa === 'EXPERIMENTACAO' || p.etapa === 'MVP';

  const assumir = async () => {
    setAssumindo(true);
    try {
      await projetoService.assumirTriagem(p.id);
      toast.success('Triagem iniciada.');
      recarregar();
      irAba('qualificacao');
    } catch (e) {
      toast.error(mensagemErro(e));
    } finally {
      setAssumindo(false);
    }
  };

  // Ações disponíveis para quem está vendo, conforme perfil e etapa
  const acoes: ReactNode[] = [];
  if (analista && p.etapa === 'BACKLOG' && !p.aguardandoComplemento)
    acoes.push(
      <button key="assumir" className="btn-primary" onClick={assumir} disabled={assumindo}>
        <Hand className="h-4 w-4" /> Assumir triagem
      </button>,
    );
  if (souResponsavel && p.etapa === 'QUALIFICACAO')
    acoes.push(
      <button key="qualificar" className="btn-primary" onClick={() => setModal('qualificar')}>
        <ClipboardList className="h-4 w-4" /> Qualificar
      </button>,
    );
  if (souResponsavel && emCiclo) {
    acoes.push(
      <button key="entrega" className="btn-primary" onClick={() => setModal('entrega')}>
        <PackageCheck className="h-4 w-4" /> Registrar entrega
      </button>,
    );
    if (!pautaPendente)
      acoes.push(
        <button key="marco" className="btn-secondary" onClick={() => setModal('marco')}>
          <Flag className="h-4 w-4" /> Registrar marco
        </button>,
        <button key="encaminhar" className="btn-secondary" onClick={() => setModal('encaminhar')}>
          <Gavel className="h-4 w-4" /> Encaminhar à governança
        </button>,
      );
  }
  if (souResponsavel && !terminal && p.etapa !== 'BACKLOG')
    acoes.push(
      <button key="maturidade" className="btn-secondary" onClick={() => setModal('maturidade')}>
        <Gauge className="h-4 w-4" /> Atualizar maturidade
      </button>,
    );
  if (souResponsavel && !terminal)
    acoes.push(
      <button key="consultar" className="btn-secondary" onClick={() => setModal('consultar')}>
        <MessagesSquare className="h-4 w-4" /> Consultar especialista
      </button>,
    );
  if (souResponsavel && (p.etapa === 'BACKLOG' || p.etapa === 'QUALIFICACAO'))
    acoes.push(
      <button key="arquivar" className="btn-ghost" onClick={() => setModal('arquivar')}>
        <Archive className="h-4 w-4" /> Arquivar
      </button>,
    );
  if (minhaConsulta)
    acoes.push(
      <button key="parecer" className="btn-primary" onClick={() => setParecer({ ...minhaConsulta, projetoTitulo: p.titulo })}>
        <MessagesSquare className="h-4 w-4" /> Emitir parecer
      </button>,
    );
  if (temAlcada && pautaPendente)
    acoes.push(
      <button key="decidir" className="btn-accent" onClick={() => setDecisao({ pauta: pautaPendente, tipo: 'APROVADO' })}>
        <Gavel className="h-4 w-4" /> Decidir pauta
      </button>,
    );
  if (temAlcada && !terminal && !pautaPendente)
    acoes.push(
      <button key="pivotar" className="btn-secondary" onClick={() => setDecisao({ pauta: null, tipo: 'PIVOTADO' })}>
        <Shuffle className="h-4 w-4" /> Pivotar
      </button>,
      <button key="descontinuar" className="btn border border-rose-200 bg-white text-rose-700 hover:bg-rose-50" onClick={() => setDecisao({ pauta: null, tipo: 'REPROVADO' })}>
        <Ban className="h-4 w-4" /> Descontinuar
      </button>,
    );
  if (souDemandante && p.aguardandoComplemento)
    acoes.push(
      <button key="complementar" className="btn-primary" onClick={() => setModal('complementar')}>
        <PenLine className="h-4 w-4" /> Complementar demanda
      </button>,
    );

  const contagem: Partial<Record<Aba, number>> = {
    qualificacao: p.consultas.filter((c) => c.status === 'PENDENTE').length,
    entregas: p.entregasAguardandoValidacao,
    governanca: pautaPendente ? 1 : 0,
    evidencias: p.evidencias.length,
    participacao: p.interacoes.length,
  };
  const ultimaQualificacao = p.qualificacoes.find((q) => q.recomendacao === 'DEVOLVER_DEMANDANTE');

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
            <OrigemBadge origem={p.origem} campanha={p.campanha} />
            <ArenaBadge arena={p.arena} />
            <TrlBadge trl={p.trlAtual} />
            {p.potencialLeiDoBem && <span className="badge border-transparent bg-bb-yellow text-bb-slate">Lei do Bem</span>}
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">{p.titulo}</h1>
          <p className="mt-1 text-sm text-bb-muted">
            {NATUREZA_LABEL[p.natureza]} · {p.areaDemandanteNome} · registrada em {formatarData(p.criadoEm)} · atualizada {tempoRelativo(p.atualizadoEm)}
          </p>
          {acoes.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{acoes}</div>}
        </div>

        {/* Linha da jornada: marcos reais */}
        <div className="border-t border-bb-line bg-slate-50/60 px-6 py-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {ETAPAS_FLUXO.map((e, i) => {
              const idx = ETAPAS_FLUXO.indexOf(p.etapa);
              const feito = idx >= 0 && i <= idx;
              const atual = e === p.etapa;
              return (
                <div key={e} className="flex min-w-[110px] flex-1 items-center gap-2" title={ETAPA_DESCRICAO[e]}>
                  <span className={`h-2 flex-1 rounded-full ${feito ? '' : 'bg-slate-200'}`} style={feito ? { background: atual ? ETAPA_COR[e] : '#005EEF' } : undefined} />
                  <span className={`whitespace-nowrap text-xs font-bold ${atual ? 'text-bb-slate' : 'text-bb-muted'}`}>{ETAPA_CURTO[e]}</span>
                </div>
              );
            })}
            {(p.etapa === 'ARQUIVADO' || p.etapa === 'DESCONTINUADO') && <EtapaBadge etapa={p.etapa} />}
          </div>
          <p className="mt-2 text-xs text-bb-muted">{ETAPA_DESCRICAO[p.etapa]}</p>
        </div>
      </section>

      {conduzidaPorOutro && !terminal && (
        <div className="mt-4 flex items-center gap-2 rounded-card border border-bb-line bg-white px-4 py-3 text-sm text-slate-600">
          <UserRound className="h-4 w-4 text-bb-muted" />
          Conduzida por <strong className="text-bb-slate">{p.analistaResponsavel?.nome}</strong>. As ações do ciclo ficam com o analista responsável.
        </div>
      )}
      {p.aguardandoComplemento && (
        <div className="mt-4 flex gap-3 rounded-card border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <MessageSquareWarning className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-bold">Devolvida ao demandante para complemento.</p>
            {ultimaQualificacao && <p>{ultimaQualificacao.parecer}</p>}
          </div>
        </div>
      )}
      {pautaPendente && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-card border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
          <Gavel className="h-4 w-4" />
          <span>
            <strong>Na pauta da governança</strong>
            {pautaPendente.etapaProposta ? ` · proposta de avanço para ${ETAPA_LABEL[pautaPendente.etapaProposta]}` : ' · pedido de deliberação'}
          </span>
          <button className="ml-auto font-bold underline" onClick={() => irAba('governanca')}>
            Ver pauta
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
              {!!contagem[a.id] && (
                <span className={`rounded-full px-1.5 text-[10px] font-bold ${aba === a.id ? 'bg-bb-blue text-white' : 'bg-slate-200 text-slate-600'}`}>{contagem[a.id]}</span>
              )}
              <span className={`absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-bb-blue transition-transform duration-300 ${aba === a.id ? 'scale-x-100' : 'scale-x-0'}`} />
            </button>
          ))}
        </div>
      </div>

      <div key={aba} className="page-in mt-5">
        {aba === 'geral' && <VisaoGeral p={p} financeiro={podeVerFinanceiro} />}
        {aba === 'participacao' && <Participacao p={p} podeEscrever={!temPerfil('DEMANDANTE') || souDemandante} usuarioId={usuario?.id} onEnviado={recarregar} />}
        {aba === 'qualificacao' && <QualificacaoAba p={p} usuario={usuario} onResponder={(c) => setParecer({ ...c, projetoTitulo: p.titulo })} />}
        {aba === 'maturidade' && <Maturidade p={p} />}
        {aba === 'entregas' && <Entregas p={p} podeValidar={souDemandante} onValidar={(e) => setValidar({ ...e, projetoTitulo: p.titulo })} />}
        {aba === 'governanca' && <Governanca p={p} podeDecidir={temAlcada} onDecidir={(pt) => setDecisao({ pauta: pt, tipo: 'APROVADO' })} />}
        {aba === 'evidencias' && <Evidencias p={p} />}
        {aba === 'historico' && <Historico p={p} />}
      </div>

      <QualificacaoModal projeto={p} aberto={modal === 'qualificar'} onFechar={fechar} onFeito={recarregar} />
      <ConsultaModal projeto={p} aberto={modal === 'consultar'} onFechar={fechar} onFeito={() => { recarregar(); irAba('qualificacao'); }} />
      <MaturidadeModal projeto={p} aberto={modal === 'maturidade'} onFechar={fechar} onFeito={recarregar} />
      <EntregaModal projeto={p} aberto={modal === 'entrega'} onFechar={fechar} onFeito={() => { recarregar(); irAba('entregas'); }} />
      {emCiclo && <MarcoModal projeto={p} aberto={modal === 'marco'} onFechar={fechar} onFeito={recarregar} />}
      <EncaminharModal projeto={p} aberto={modal === 'encaminhar'} onFechar={fechar} onFeito={recarregar} />
      <TextoModal
        aberto={modal === 'arquivar'}
        titulo="Arquivar demanda"
        descricao="A demanda sai da triagem e fica registrada como arquivada."
        rotulo="Arquivar"
        campo="Motivo"
        perigo
        onFechar={fechar}
        onFeito={recarregar}
        onEnviar={(t) => projetoService.arquivar(p.id, t)}
        sucesso="Demanda arquivada."
      />
      <TextoModal
        aberto={modal === 'complementar'}
        titulo="Complementar demanda"
        descricao="Revise a descrição. A demanda volta para a fila de triagem."
        rotulo="Enviar complemento"
        campo="Descrição atualizada"
        minimo={15}
        inicial={p.descricaoDor}
        onFechar={fechar}
        onFeito={recarregar}
        onEnviar={(t) => projetoService.complementar(p.id, { descricaoDor: t, complemento: '' })}
        sucesso="Complemento enviado. A demanda voltou para a triagem."
        extra={ultimaQualificacao && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{ultimaQualificacao.parecer}</p>}
      />
      <ParecerModal consulta={parecer} onFechar={() => setParecer(null)} onFeito={recarregar} />
      <ValidacaoModal entrega={validar} onFechar={() => setValidar(null)} onFeito={recarregar} />
      <DecisaoModal projeto={decisao ? p : null} pauta={decisao?.pauta ?? null} tipoInicial={decisao?.tipo ?? 'APROVADO'} onFechar={() => setDecisao(null)} onFeito={recarregar} />
    </div>
  );
}

const COR_PERFIL: Record<Usuario['perfil'], string> = {
  DEMANDANTE: 'bg-bb-yellow text-bb-slate',
  ANALISTA: 'bg-bb-blue text-white',
  ESPECIALISTA: 'bg-teal-600 text-white',
};

// Conversa do projeto: o demandante, dono do problema, segue participando do ciclo
function Participacao({ p, podeEscrever, usuarioId, onEnviado }: { p: ProjetoDetalhe; podeEscrever: boolean; usuarioId?: number; onEnviado: () => void }) {
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);

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
      <p className="text-xs text-bb-muted">Conversa entre o demandante, o analista e os especialistas. Dúvidas, contexto e retornos ficam registrados aqui.</p>
      {p.interacoes.length === 0 ? (
        <p className="py-8 text-center text-sm text-bb-muted">Nenhuma mensagem ainda.</p>
      ) : (
        <ol className="mt-5 space-y-4">
          {p.interacoes.map((i) => {
            const meu = i.autor.id === usuarioId;
            return (
              <li key={i.id} className={`flex gap-3 ${meu ? 'flex-row-reverse text-right' : ''}`}>
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-bold ${COR_PERFIL[i.perfil]}`}>
                  {i.autor.nome.split(' ').map((x) => x[0]).slice(0, 2).join('')}
                </span>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${meu ? 'bg-bb-blue-light' : 'bg-slate-50'}`}>
                  <p className="text-xs font-bold">
                    {i.autor.nome} <span className="font-normal text-bb-muted">· {PERFIL_LABEL[i.perfil]} · {tempoRelativo(i.criadaEm)}</span>
                  </p>
                  <p className="mt-1 whitespace-pre-line text-left text-slate-700">{i.texto}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      {podeEscrever ? (
        <form onSubmit={enviar} className="mt-6 flex gap-2 border-t border-bb-line pt-4">
          <textarea
            rows={2}
            className="input flex-1"
            placeholder="Escreva uma mensagem…"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            aria-label="Mensagem"
          />
          <button type="submit" className="btn-primary self-end" disabled={enviando || !texto.trim()}>
            Enviar
          </button>
        </form>
      ) : (
        <p className="mt-6 border-t border-bb-line pt-4 text-xs text-bb-muted">Somente o demandante desta demanda e a equipe participam da conversa.</p>
      )}
    </div>
  );
}

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}

function Pessoa({ nome, vazio }: { nome?: string; vazio: string }) {
  return nome ? (
    <span className="inline-flex items-center gap-1.5 font-semibold">
      <UserRound className="h-4 w-4 text-bb-muted" />
      {nome}
    </span>
  ) : (
    <span className="italic text-slate-400">{vazio}</span>
  );
}

function VisaoGeral({ p, financeiro }: { p: ProjetoDetalhe; financeiro: boolean }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="card space-y-5 p-6 lg:col-span-2">
        <div>
          <h2 className="eyebrow">Descrição da demanda</h2>
          <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-700">{p.descricaoDor}</p>
        </div>
        <div className="h-px bg-bb-line" />
        <div>
          <h2 className="eyebrow">Hipótese de solução</h2>
          <p className="mt-2 leading-relaxed text-slate-700">{p.hipoteseSolucao}</p>
        </div>
        {p.campanha && (
          <>
            <div className="h-px bg-bb-line" />
            <div>
              <h2 className="eyebrow">Campanha de origem</h2>
              <p className="mt-2">
                <span className="font-semibold">{TIPO_CAMPANHA_LABEL[p.campanha.tipo]}</span> · {p.campanha.titulo}
              </p>
            </div>
          </>
        )}
      </div>
      <dl className="card space-y-4 p-6">
        <Info label="Demandante (dono do problema)">
          <Pessoa nome={p.demandante?.nome} vazio="Não informado" />
        </Info>
        <Info label="Analista de inovação">
          <Pessoa nome={p.analistaResponsavel?.nome} vazio="Aguardando triagem" />
        </Info>
        <Info label="Etapa">{ETAPA_LABEL[p.etapa]}</Info>
        <Info label="Lei do Bem">{p.potencialLeiDoBem ? 'Com potencial' : 'Sem potencial identificado'}</Info>
        {financeiro && (
          <Info label="Dispêndio estimado">
            <span className="text-lg font-bold">{formatarMoedaBRL(p.dispendioEstimado)}</span>
            {p.dispendioEstimado == null && <span className="block text-xs text-bb-muted">Definido na qualificação</span>}
          </Info>
        )}
      </dl>
    </div>
  );
}

function QualificacaoAba({ p, usuario, onResponder }: { p: ProjetoDetalhe; usuario: Usuario | null; onResponder: (c: ConsultaEspecialista) => void }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-4">
        {p.qualificacoes.length === 0 ? (
          <Vazio titulo="Ainda não qualificada" texto="O Analista avalia aderência à Tese, relevância, grau de inovação, viabilidade e TRL." />
        ) : (
          p.qualificacoes.map((q) => {
            const media = (q.aderenciaTese + q.relevancia + q.grauInovacao + q.viabilidade) / 4;
            return (
              <article key={q.id} className="card p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold">Qualificação</h2>
                  <Selo classe="border-blue-200 bg-bb-blue-light text-bb-blue">{RECOMENDACAO_QUALIFICACAO_LABEL[q.recomendacao]}</Selo>
                  <span className="ml-auto text-xs text-bb-muted">
                    {q.analista.nome} · {formatarData(q.criadaEm)}
                  </span>
                </div>
                <div className="mt-4 space-y-2.5">
                  {CRITERIOS_QUALIFICACAO.map((c) => (
                    <div key={c.chave} className="flex items-center gap-3 text-sm">
                      <span className="w-48 shrink-0 text-slate-600">{c.label}</span>
                      <div className="flex flex-1 gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <span key={n} className={`h-2 flex-1 rounded-full ${n <= q[c.chave] ? 'bg-bb-blue' : 'bg-slate-200'}`} />
                        ))}
                      </div>
                      <span className="w-6 text-right font-bold">{q[c.chave]}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t border-bb-line pt-2.5 text-sm">
                    <span className="text-slate-600">
                      Média <strong className="text-bb-slate">{media.toFixed(1).replace('.', ',')}</strong> · TRL avaliado <strong className="text-bb-slate">{q.trlAvaliado}</strong>
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-700">{q.parecer}</p>
              </article>
            );
          })
        )}
      </div>

      <div className="card h-fit p-6">
        <h2 className="flex items-center gap-2 font-bold">
          <MessagesSquare className="h-4 w-4 text-bb-blue" /> Pareceres de especialistas
        </h2>
        <p className="text-xs text-bb-muted">Conhecimento técnico que subsidia a qualificação e a governança.</p>
        {p.consultas.length === 0 ? (
          <p className="py-8 text-center text-sm text-bb-muted">Nenhuma consulta.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {p.consultas.map((c) => (
              <li key={c.id} className="rounded-xl border border-bb-line p-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{c.areaTecnica}</span>
                  {c.recomendacao ? (
                    <Selo classe={RECOMENDACAO_PARECER_BADGE[c.recomendacao]}>{RECOMENDACAO_PARECER_LABEL[c.recomendacao]}</Selo>
                  ) : (
                    <Selo classe="border-amber-200 bg-amber-50 text-amber-800">Aguardando</Selo>
                  )}
                </div>
                <p className="mt-1 text-xs text-bb-muted">
                  {c.solicitante.nome} → {c.especialista?.nome ?? `qualquer especialista de ${c.areaTecnica}`} · {tempoRelativo(c.criadaEm)}
                </p>
                <p className="mt-2 italic text-slate-600">“{c.pergunta}”</p>
                {c.parecer && <p className="mt-2 text-slate-800">{c.parecer}</p>}
                {c.trlSugerido && <p className="mt-1 text-xs font-semibold text-bb-blue">TRL sugerido: {c.trlSugerido}</p>}
                {podeResponderConsulta(c, usuario) && (
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
  // Pode haver vários registros ATUAL: usa o mais recente
  const atual = p.avaliacoesRadar.filter((r) => r.tipoLeitura === 'ATUAL').sort((a, b) => b.dataAvaliacao.localeCompare(a.dataAvaliacao))[0];
  const sI = scores(inicial);
  const sA = scores(atual);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="card p-6">
          <h2 className="font-bold">Régua de prontidão tecnológica</h2>
          <p className="mb-5 text-xs text-bb-muted">O TRL é um indicador, atualizado pelo Analista a partir das evidências e resultados produzidos.</p>
          <TrlRegua atual={p.trlAtual} />
        </div>
        <div className="card p-6">
          <h2 className="font-bold">Radar 4D</h2>
          <p className="text-xs text-bb-muted">{atual ? `Inicial × atual (${formatarData(atual.dataAvaliacao)})` : 'Somente a leitura inicial até o momento'}</p>
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
        <h2 className="font-bold">Atualizações de maturidade</h2>
        {p.registrosMaturidade.length === 0 ? (
          <p className="py-6 text-center text-sm text-bb-muted">Nenhuma atualização desde o cadastro.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {p.registrosMaturidade.map((m) => (
              <li key={m.id} className="rounded-xl border border-bb-line p-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">
                    TRL {m.trlAnterior} → <span className="text-bb-blue">TRL {m.trlNovo}</span>
                  </span>
                  {m.radarId && <Selo classe="border-slate-200 bg-slate-50 text-slate-600">+ leitura do radar</Selo>}
                  <span className="ml-auto text-xs text-bb-muted">
                    {m.responsavel.nome} · {formatarDataHora(m.criadoEm)}
                  </span>
                </div>
                <p className="mt-2 text-slate-700">{m.justificativa}</p>
                <ListaArquivos evs={m.evidencias} />
              </li>
            ))}
          </ul>
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
        <li key={e.id} className="flex items-center gap-1.5 rounded-lg border border-bb-line bg-slate-50 px-2.5 py-1.5 text-xs">
          <FileText className="h-3.5 w-3.5 text-bb-blue" />
          <span className="max-w-[220px] truncate font-semibold">{e.nomeArquivo}</span>
          <span className="text-bb-muted">{formatarTamanho(e.tamanhoBytes)}</span>
        </li>
      ))}
    </ul>
  );
}

function Entregas({ p, podeValidar, onValidar }: { p: ProjetoDetalhe; podeValidar: boolean; onValidar: (e: Entrega) => void }) {
  if (p.entregas.length === 0)
    return <Vazio titulo="Nenhuma entrega registrada" texto="Durante a experimentação e o MVP, o Analista registra as entregas e o demandante valida se elas resolvem o problema." />;
  return (
    <div className="space-y-3">
      {p.entregas.map((e) => (
        <article key={e.id} className={`card p-5 ${e.status === 'AGUARDANDO_VALIDACAO' ? 'border-l-4 border-l-bb-yellow' : ''}`}>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold">{e.titulo}</h3>
            <Selo classe="border-slate-200 bg-white text-slate-600">{ETAPA_CURTO[e.etapa]}</Selo>
            <Selo classe={ENTREGA_BADGE[e.status]}>{ENTREGA_LABEL[e.status]}</Selo>
            <span className="ml-auto text-xs text-bb-muted">
              {e.registradaPor.nome} · {formatarDataHora(e.registradaEm)}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-700">{e.descricao}</p>
          <ListaArquivos evs={e.evidencias} />
          {e.comentarioValidacao && (
            <div className={`mt-3 rounded-lg p-3 text-sm ${e.status === 'VALIDADA' ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
              <p className="text-xs font-bold">
                {e.validadaPor?.nome} (demandante) · {formatarDataHora(e.validadaEm)}
              </p>
              <p className="mt-1">{e.comentarioValidacao}</p>
            </div>
          )}
          {podeValidar && e.status === 'AGUARDANDO_VALIDACAO' && (
            <div className="mt-4 flex justify-end border-t border-bb-line pt-4">
              <button className="btn-primary btn-sm" onClick={() => onValidar(e)}>
                <Check className="h-3.5 w-3.5" /> Validar entrega
              </button>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

function Governanca({ p, podeDecidir, onDecidir }: { p: ProjetoDetalhe; podeDecidir: boolean; onDecidir: (pt: PautaGovernanca) => void }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card p-6">
        <h2 className="font-bold">Pautas</h2>
        <p className="text-xs text-bb-muted">Itens levados à instância de governança para priorização ou decisão.</p>
        {p.pautas.length === 0 ? (
          <p className="py-8 text-center text-sm text-bb-muted">Nenhuma pauta. Marcos dentro da alçada da equipe não passam por aqui.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {p.pautas.map((pt) => (
              <li key={pt.id} className={`rounded-xl border p-4 text-sm ${pt.status === 'PENDENTE' ? 'border-yellow-300 bg-yellow-50/50' : 'border-bb-line'}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <Selo classe={pt.status === 'PENDENTE' ? 'border-yellow-300 bg-yellow-100 text-yellow-900' : 'border-slate-200 bg-slate-100 text-slate-600'}>
                    {pt.status === 'PENDENTE' ? 'Pendente' : 'Decidida'}
                  </Selo>
                  <span className="font-semibold">
                    {ETAPA_CURTO[pt.etapaAtual]}
                    {pt.etapaProposta ? ` → ${ETAPA_CURTO[pt.etapaProposta]}` : ' · deliberação'}
                  </span>
                  <span className="ml-auto text-xs text-bb-muted">
                    {pt.encaminhadaPor.nome} · {formatarData(pt.criadaEm)}
                  </span>
                </div>
                <p className="mt-2 text-slate-700">{pt.motivo}</p>
                {pt.status === 'PENDENTE' && podeDecidir && (
                  <button className="btn-accent btn-sm mt-3" onClick={() => onDecidir(pt)}>
                    <Gavel className="h-3.5 w-3.5" /> Decidir
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="card p-6">
        <h2 className="font-bold">Decisões</h2>
        {p.decisoes.length === 0 ? (
          <p className="py-8 text-center text-sm text-bb-muted">Nenhuma decisão registrada.</p>
        ) : (
          <ol className="mt-4 space-y-4">
            {p.decisoes.map((d) => (
              <li key={d.id} className="flex gap-3">
                <span
                  className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                    d.decisao === 'PIVOTADO' ? 'bg-indigo-50 text-indigo-700' : d.decisao === 'REPROVADO' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {d.decisao === 'PIVOTADO' ? <Shuffle className="h-4 w-4" /> : d.decisao === 'REPROVADO' ? <Ban className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                </span>
                <div className="text-sm">
                  <p className="font-bold">
                    {DECISAO_LABEL[d.decisao]} <span className="font-normal text-bb-muted">por {d.responsavel.nome} · {formatarDataHora(d.dataDecisao)}</span>
                  </p>
                  <p className="mt-1 text-slate-600">{d.justificativa}</p>
                  {d.novaHipotese && <p className="mt-1 text-indigo-800">Nova hipótese: {d.novaHipotese}</p>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function Evidencias({ p }: { p: ProjetoDetalhe }) {
  const grupos = [
    { t: 'Atualizações de maturidade', evs: p.evidencias.filter((e) => e.vinculo.tipo === 'MATURIDADE') },
    { t: 'Entregas', evs: p.evidencias.filter((e) => e.vinculo.tipo === 'ENTREGA') },
    { t: 'Anexos gerais', evs: p.evidencias.filter((e) => e.vinculo.tipo === 'GERAL') },
  ];
  if (!p.evidencias.length) return <Vazio titulo="Nenhuma evidência" texto="Evidências são anexadas nas atualizações de maturidade e nas entregas." />;
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {grupos.map((g) => (
        <div key={g.t} className="card p-5">
          <h2 className="font-bold">
            {g.t} <span className="text-bb-muted">({g.evs.length})</span>
          </h2>
          {g.evs.length === 0 ? (
            <p className="py-6 text-center text-sm text-bb-muted">Nenhum arquivo.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {g.evs.map((e) => (
                <li key={e.id} className="flex items-center gap-3 rounded-lg border border-bb-line px-3 py-2.5 text-sm">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-bb-blue-light text-bb-blue">
                    <FileText className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{e.nomeArquivo}</span>
                    <span className="block text-xs text-bb-muted">
                      {e.enviadaPor.nome} · {formatarTamanho(e.tamanhoBytes)} · {formatarData(e.dataUpload)}
                    </span>
                  </span>
                  {/* O link de download será fornecido pela API; o caminho do storage não é público */}
                  <button className="btn-ghost btn-sm" disabled title="Download disponível após a integração com a API">
                    <Download className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function Historico({ p }: { p: ProjetoDetalhe }) {
  const valor = (tipo: string, v: string) => (tipo === 'ETAPA' ? ETAPA_LABEL[v as keyof typeof ETAPA_LABEL] ?? v : tipo === 'TRL' ? `TRL ${v}` : v);
  const titulo = { ETAPA: 'Etapa alterada', TRL: 'TRL atualizado', HIPOTESE: 'Hipótese pivotada' } as const;
  return (
    <div className="card p-6">
      <h2 className="flex items-center gap-2 font-bold">
        <History className="h-4 w-4 text-bb-blue" /> Trilha de auditoria
      </h2>
      <p className="text-xs text-bb-muted">Mudanças efetivamente realizadas no projeto. Somente consulta.</p>
      {p.historicoTransicoes.length === 0 ? (
        <p className="py-8 text-center text-sm text-bb-muted">Nenhuma mudança registrada desde o cadastro.</p>
      ) : (
        <ol className="relative mt-6 space-y-6 border-l-2 border-bb-line pl-6">
          {p.historicoTransicoes.map((h) => (
            <li key={h.id} className="relative">
              <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-white bg-bb-blue ring-2 ring-bb-blue/20" />
              <p className="text-sm font-bold">
                {titulo[h.tipoMudanca]}
                {h.tipoMudanca !== 'HIPOTESE' && (
                  <span className="font-normal">
                    {' '}
                    de <strong>{valor(h.tipoMudanca, h.valorAnterior)}</strong> para <strong className="text-bb-blue">{valor(h.tipoMudanca, h.valorNovo)}</strong>
                  </span>
                )}
              </p>
              {h.tipoMudanca === 'HIPOTESE' && <p className="mt-1 text-sm text-slate-600">“{h.valorNovo}”</p>}
              <p className="mt-0.5 text-xs text-bb-muted">
                {h.usuario.nome} · {formatarDataHora(h.dataMudanca)}
                {h.motivo && ` · ${h.motivo}`}
              </p>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-6 border-t border-bb-line pt-4 text-xs text-bb-muted">Demanda registrada em {formatarDataHora(p.criadoEm)}.</p>
    </div>
  );
}
