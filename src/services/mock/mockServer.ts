// Simula as regras de negócio da Fase 3 até o back-end expor as rotas.
// Persistido no localStorage para que um perfil continue o trabalho do outro ao trocar de usuário.
// Cada operação confere de novo as condições da matriz (utils/permissoes.ts), como faria o back-end.
import { ApiError } from '@/types/api';
import type {
  AlteracaoCampo,
  AnaliseIaRequest,
  AnaliseIaResponse,
  ArquivamentoRequest,
  AvaliacaoTrlRequest,
  Campanha,
  CancelamentoRequest,
  ConfiguracaoKanban,
  ConsultaEspecialista,
  ConsultaRequest,
  Correcao,
  CorrecaoRequest,
  CriarProjetoRequest,
  DecisaoRequest,
  EdicaoEtapaRequest,
  EdicaoProjetoRequest,
  EdicaoTransicaoRequest,
  EntregaRequest,
  EstadoTarefa,
  EtapaResumo,
  Evidencia,
  FiltroDashboard,
  FiltroPortfolio,
  Interacao,
  MetricasDashboard,
  MinhaFila,
  MovimentacaoRequest,
  Notificacao,
  NovaEtapaRequest,
  NovaTransicaoRequest,
  Pagina,
  Parecer,
  ParecerRequest,
  PerfilUsuario,
  Projeto,
  ProjetoDetalhe,
  PropostaConfiguracao,
  PropostaRequest,
  QualificacaoRequest,
  Recomendacao,
  RecomendacaoRequest,
  SolicitacaoAcessoRequest,
  SolicitacaoAvancoRequest,
  StatusGovernanca,
  StatusRecomendacao,
  Usuario,
  UsuarioResumo,
  ValidacaoRequest,
} from '@/types/domain';
import { ARENA_LABEL, ARENAS, areaNome, podeResponderConsulta } from '@/utils/constants';
import { formatarMoedaBRL } from '@/utils/formatters';
import { modoMovimentacao, noProjeto, podeCancelar, porPerfil, type AcaoId } from '@/utils/permissoes';

import { USUARIO_KEY } from '../api';
import { criarSeed, SENHA_DEMO, type MockDb, type ProjetoDb } from './seed';

const DB_KEY = '@SIGES_PIN:mockdb:v6';

function carregar(): MockDb {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw) as MockDb;
  } catch {
    // armazenamento indisponível: segue em memória
  }
  return criarSeed();
}

let db = carregar();

function salvar() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    // ignora
  }
}

export function resetarMock() {
  db = criarSeed();
  salvar();
}

const espera = (ms = 300) => new Promise((r) => setTimeout(r, ms + Math.random() * 200));
const agora = () => new Date().toISOString();
const novoId = () => ++db.seq;
const resumo = (u: Usuario): UsuarioResumo => ({ id: u.id, nome: u.nome });
const usuarioPorId = (id: number | null) => (id == null ? null : db.usuarios.find((x) => x.id === id) ?? null);

// ---------------- Sessão e erros ----------------

function usuarioAtual(): Usuario {
  try {
    const raw = localStorage.getItem(USUARIO_KEY);
    if (raw) {
      const u = JSON.parse(raw) as Usuario;
      const real = db.usuarios.find((x) => x.id === u.id);
      if (real?.ativo) return real;
    }
  } catch {
    // ignora
  }
  throw new ApiError(401, 'NAO_AUTENTICADO', 'Sessão expirada. Entre novamente.');
}

const negar = (msg: string) => new ApiError(403, 'ACESSO_NEGADO', msg);
const invalido = (msg: string, detalhes?: Record<string, string>) => new ApiError(422, 'VALIDACAO_FALHOU', msg, detalhes);
const naoEncontrado = (msg: string) => new ApiError(404, 'NAO_ENCONTRADO', msg);
const conflito = (msg = 'O registro foi alterado por outra pessoa. Recarregue os dados antes de tentar novamente.') => new ApiError(409, 'CONFLITO_ATUALIZACAO', msg);
const conflitoVersao = () => new ApiError(409, 'CONFLITO_VERSAO', 'O registro mudou desde que o formulário foi aberto. Revise a versão mais recente antes de salvar.');

// Mesma matriz usada na interface (utils/permissoes.ts): o "back-end" confere de novo
function exigir(acao: AcaoId, p?: ProjetoDb) {
  const u = usuarioAtual();
  const perm = p ? noProjeto(acao, u, enriquecer(p), { solicitacaoPendente: temSolicitacaoPendente(p.id) }) : porPerfil(acao, u);
  if (!perm.permitido) throw negar(perm.motivo ?? 'Sem permissão.');
  return u;
}

function projetoOu404(id: number) {
  const p = db.projetos.find((x) => x.id === id);
  if (!p) throw naoEncontrado('Projeto não encontrado.');
  return p;
}

const texto = (v: string | null | undefined) => (v ?? '').trim();
const obrigatorio = (v: string | null | undefined, max?: number) => texto(v).length > 0 && (!max || texto(v).length <= max);
const idPositivo = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n > 0;

function etapaResumo(id: number): EtapaResumo {
  const e = db.etapas.find((x) => x.id === id);
  return e ? { id: e.id, nome: e.nome, cor: e.cor, terminal: e.terminal } : { id, nome: `Etapa #${id}`, cor: '#94A3B8', terminal: false };
}

const temSolicitacaoPendente = (projetoId: number) => db.solicitacoes.some((s) => s.projetoId === projetoId && s.status === 'PENDENTE');

function pendencias(p: ProjetoDb): EstadoTarefa[] {
  const r: EstadoTarefa[] = [];
  const terminal = etapaResumo(p.etapaId).terminal;
  // Aguarda triagem enquanto não há qualificação, mesmo que já exista um Analista responsável
  if (!p.arquivado && !terminal && !db.qualificacoes.some((q) => q.projetoId === p.id)) r.push('AGUARDANDO_TRIAGEM');
  if (db.consultas.some((c) => c.projetoId === p.id && c.status === 'PENDENTE')) r.push('AGUARDANDO_PARECER');
  if (temSolicitacaoPendente(p.id)) r.push('AGUARDANDO_GOVERNANCA');
  if (db.entregas.some((e) => e.projetoId === p.id && !e.validacoes.length)) r.push('AGUARDANDO_VALIDACAO');
  return r;
}

function enriquecer(p: ProjetoDb): Projeto {
  const c = db.campanhas.find((x) => x.id === p.campanhaId);
  const dem = usuarioPorId(p.demandanteId);
  const ana = usuarioPorId(p.analistaId);
  return {
    id: p.id,
    titulo: p.titulo,
    descricaoDor: p.descricaoDor,
    origem: p.origem,
    campanha: c ? { id: c.id, titulo: c.titulo, tipo: c.tipo } : null,
    areaDemandanteId: p.areaDemandanteId,
    areaDemandanteNome: areaNome(p.areaDemandanteId),
    demandante: dem ? resumo(dem) : null,
    analistaResponsavel: ana ? resumo(ana) : null,
    arena: p.arena,
    hipoteseSolucao: p.hipoteseSolucao,
    potencialLeiDoBem: p.potencialLeiDoBem,
    dispendioEstimado: p.dispendioEstimado,
    etapa: etapaResumo(p.etapaId),
    trlAtual: p.trlAtual,
    pendencias: pendencias(p),
    arquivado: p.arquivado,
    motivoArquivamento: p.motivoArquivamento,
    arquivadoEm: p.arquivadoEm,
    versao: p.versao,
    criadoEm: p.criadoEm,
    atualizadoEm: p.atualizadoEm,
  };
}

// Evidências selecionadas: devem existir, pertencer ao mesmo projeto e aparecer uma única vez
function evidenciasDoProjeto(projetoId: number, ids: number[], { obrigatoria }: { obrigatoria: boolean }): Evidencia[] {
  if (!Array.isArray(ids)) throw invalido('Informe a lista de evidências.');
  if (obrigatoria && !ids.length) throw invalido('Selecione ao menos uma evidência do projeto.', { evidenciaIds: 'Obrigatório.' });
  if (new Set(ids).size !== ids.length) throw invalido('Cada evidência só pode aparecer uma vez no registro.', { evidenciaIds: 'Evidência repetida.' });
  return ids.map((id) => {
    const e = db.evidencias.find((x) => x.id === id);
    if (!e) throw invalido(`A evidência #${id} não existe.`, { evidenciaIds: 'Evidência inexistente.' });
    if (e.projetoId !== projetoId) throw invalido(`A evidência ${e.nomeArquivo} pertence a outro projeto e foi recusada.`, { evidenciaIds: 'Evidência de outro projeto.' });
    return e;
  });
}

function registrarHistorico(p: ProjetoDb, u: Usuario, tipo: 'ETAPA' | 'TRL', de: string, para: string, motivo: string, solicitacaoId: number | null = null) {
  db.historico.push({ id: novoId(), projetoId: p.id, usuario: resumo(u), tipoMudanca: tipo, valorAnterior: de, valorNovo: para, motivo, solicitacaoId, dataMudanca: agora() });
  p.atualizadoEm = agora();
}

// Movimentações realizadas pelo Especialista geram notificação global
function notificarMovimentacao(p: ProjetoDb, u: Usuario, de: string, para: string, aprovacao: boolean) {
  if (u.perfil !== 'ESPECIALISTA') return;
  const mensagem = aprovacao ? `${u.nome} aprovou o avanço de ${de} para ${para}.` : `${u.nome} moveu o projeto de ${de} para ${para}.`;
  db.notificacoes.push({ id: novoId(), mensagem, projetoId: p.id, projetoTitulo: p.titulo, autor: resumo(u), criadaEm: agora() });
}

const comTitulo = <T extends { projetoId: number }>(x: T): T & { projetoTitulo?: string } => ({
  ...x,
  projetoTitulo: db.projetos.find((p) => p.id === x.projetoId)?.titulo,
});

const comQuestao = (p: Parecer): Parecer => ({ ...comTitulo(p), questao: p.consultaId ? db.consultas.find((c) => c.id === p.consultaId)?.questao ?? null : null });

// ---------------- Autenticação e usuários ----------------

export async function login(email: string, senha: string) {
  await espera(450);
  const u = db.usuarios.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  if (!u || senha !== SENHA_DEMO) throw new ApiError(401, 'CREDENCIAIS_INVALIDAS', 'E-mail ou senha incorretos.');
  if (!u.ativo) throw new ApiError(403, 'USUARIO_INATIVO', 'Este usuário está inativo. Procure o administrador.');
  return { token: `mock.${u.id}.${Date.now()}`, usuario: u };
}

// Pedido de acesso: o protótipo só valida o e-mail; quem aprova e define o perfil é a administração
export async function solicitarAcesso(dados: SolicitacaoAcessoRequest) {
  await espera(500);
  if (db.usuarios.some((x) => x.email.toLowerCase() === dados.email.trim().toLowerCase()))
    throw new ApiError(409, 'EMAIL_JA_CADASTRADO', 'Já existe um usuário com este e-mail. Use “Entrar”.');
}

export async function listarUsuarios(perfil?: PerfilUsuario): Promise<Usuario[]> {
  usuarioAtual();
  await espera(150);
  return db.usuarios.filter((x) => x.ativo && (!perfil || x.perfil === perfil));
}

// ---------------- IA (simulada) ----------------

export async function analisarDemanda(req: AnaliseIaRequest): Promise<AnaliseIaResponse> {
  usuarioAtual();
  await espera(1100);
  const t = `${req.titulo} ${req.descricaoDor}`.toLowerCase();
  if (t.includes('#offline')) throw new ApiError(503, 'IA_INDISPONIVEL', 'O serviço de IA está indisponível no momento.');
  let hipoteseSolucao = 'Mapear o processo atual com a área demandante para definir a hipótese de solução mais adequada.';
  if (/fraude|segur|golpe|ataque|invas|risco|senha/.test(t)) hipoteseSolucao = 'Aplicar detecção de anomalias em tempo real com score de risco, sob supervisão do time de segurança.';
  else if (/cliente|digital|canal|app|venda|produto|receita/.test(t)) hipoteseSolucao = 'Criar uma jornada digital de autoatendimento integrada aos sistemas existentes, medindo conversão e satisfação.';
  else if (/manual|tempo|custo|retrabalho|processo|automat|eficien|energia|papel/.test(t)) hipoteseSolucao = 'Automatizar as etapas repetitivas com IA e regras de negócio, mantendo revisão humana nos casos de exceção.';
  return { hipoteseSolucao, trlSugerido: 2, observacoes: 'Sugestão simulada a partir do título e da descrição. Revise antes de enviar.' };
}

// ---------------- Ações de mobilização ----------------

export async function listarCampanhas(): Promise<Campanha[]> {
  usuarioAtual();
  await espera(200);
  return [...db.campanhas]
    .sort((a, b) => (a.status === b.status ? b.inicio.localeCompare(a.inicio) : a.status === 'ABERTA' ? -1 : 1))
    .map((c) => ({ ...c, totalDemandas: db.projetos.filter((p) => p.campanhaId === c.id).length }));
}

// ---------------- Configuração do quadro ----------------

export async function obterConfiguracao(): Promise<ConfiguracaoKanban> {
  usuarioAtual();
  await espera(150);
  return { etapas: [...db.etapas].sort((a, b) => a.ordem - b.ordem || a.id - b.id), transicoes: [...db.transicoes] };
}

const etapaInicial = () => db.etapas.find((e) => e.codigo === 'IDEACAO');

function validarNovaEtapa(req: NovaEtapaRequest) {
  const codigo = texto(req.codigo);
  if (!/^[A-Z][A-Z0-9_]*$/.test(codigo) || codigo.length > 255) throw invalido('O código começa com letra maiúscula e usa só letras maiúsculas, dígitos ou sublinhado (até 255).', { codigo: 'Código inválido.' });
  if (db.etapas.some((e) => e.codigo === codigo)) throw invalido('Já existe uma coluna com este código.', { codigo: 'Código em uso.' });
  if (!obrigatorio(req.nome, 255)) throw invalido('Informe o nome da coluna (até 255 caracteres).', { nome: 'Obrigatório.' });
  if (!Number.isInteger(req.ordem) || req.ordem < 0) throw invalido('A ordem deve ser um inteiro maior ou igual a zero.', { ordem: 'Inválida.' });
  if (req.terminal && !['CONCLUSAO', 'DESCONTINUACAO'].includes(req.terminal)) throw invalido('Tipo terminal inválido.');
}

function aplicarNovaEtapa(req: NovaEtapaRequest) {
  db.etapas.push({
    id: novoId(),
    codigo: texto(req.codigo),
    nome: texto(req.nome),
    descricao: texto(req.descricao),
    cor: req.cor || (req.terminal === 'CONCLUSAO' ? '#10B981' : req.terminal === 'DESCONTINUACAO' ? '#F43F5E' : '#8B5CF6'),
    ordem: req.ordem,
    ativa: true,
    tipoTerminal: req.terminal,
    terminal: !!req.terminal,
    versao: 1,
  });
}

function validarNovaTransicao(req: NovaTransicaoRequest) {
  if (!idPositivo(req.origemId) || !idPositivo(req.destinoId)) throw invalido('Escolha a origem e o destino.');
  const o = db.etapas.find((e) => e.id === req.origemId);
  const d = db.etapas.find((e) => e.id === req.destinoId);
  if (!o || !d) throw invalido('Origem e destino devem existir.');
  if (!o.ativa || !d.ativa) throw invalido('Origem e destino devem ser colunas ativas.');
  if (o.id === d.id) throw invalido('Origem e destino devem ser diferentes.');
  if (o.terminal) throw invalido('Uma coluna terminal não admite saída.');
  if (db.transicoes.some((t) => t.origemId === o.id && t.destinoId === d.id)) throw invalido('Já existe um percurso com esta origem e este destino.');
  if (typeof req.exigeGovernanca !== 'boolean') throw invalido('Informe se o percurso exige governança.');
}

function aplicarNovaTransicao(req: NovaTransicaoRequest) {
  db.transicoes.push({ id: novoId(), origemId: req.origemId, destinoId: req.destinoId, exigeGovernanca: req.exigeGovernanca, ativa: true, versao: 1 });
}

export async function criarEtapa(req: NovaEtapaRequest) {
  exigir('configurarQuadro');
  await espera(250);
  validarNovaEtapa(req);
  aplicarNovaEtapa(req);
  salvar();
}

export async function editarEtapa(id: number, req: EdicaoEtapaRequest) {
  exigir('configurarQuadro');
  await espera(250);
  const e = db.etapas.find((x) => x.id === id);
  if (!e) throw naoEncontrado('Coluna não encontrada.');
  if (req.versao !== e.versao) throw conflitoVersao();
  if (!obrigatorio(req.nome, 255)) throw invalido('Informe o nome da coluna (até 255 caracteres).');
  if (!Number.isInteger(req.ordem) || req.ordem < 0) throw invalido('A ordem deve ser um inteiro maior ou igual a zero.');
  if (e.ativa && !req.ativa) {
    if (e.codigo === 'IDEACAO') throw invalido('A coluna inicial não pode ser desativada.');
    if (db.projetos.some((p) => p.etapaId === id)) throw invalido('A coluna está ocupada por projetos e não pode ser desativada.');
    if (db.transicoes.some((t) => t.ativa && (t.origemId === id || t.destinoId === id))) throw invalido('A coluna é referenciada por percurso ativo. Desative o percurso antes.');
  }
  Object.assign(e, { nome: texto(req.nome), ordem: req.ordem, ativa: req.ativa, versao: e.versao + 1 });
  if (req.descricao !== undefined) e.descricao = texto(req.descricao);
  if (req.cor) e.cor = req.cor;
  salvar();
}

export async function criarTransicao(req: NovaTransicaoRequest) {
  exigir('configurarQuadro');
  await espera(200);
  validarNovaTransicao(req);
  aplicarNovaTransicao(req);
  salvar();
}

export async function editarTransicao(id: number, req: EdicaoTransicaoRequest) {
  exigir('configurarQuadro');
  await espera(200);
  const t = db.transicoes.find((x) => x.id === id);
  if (!t) throw naoEncontrado('Percurso não encontrado.');
  if (req.versao !== t.versao) throw conflitoVersao();
  if (db.solicitacoes.some((s) => s.transicaoId === id && s.status === 'PENDENTE')) throw invalido('Há pedido de avanço pendente neste percurso. Alterações ficam bloqueadas até o encerramento.');
  if (!t.ativa && req.ativa) {
    const o = db.etapas.find((e) => e.id === t.origemId);
    const d = db.etapas.find((e) => e.id === t.destinoId);
    if (!o?.ativa || !d?.ativa || o.terminal) throw invalido('Para reativar, origem e destino devem estar ativos e a origem não pode ser terminal.');
  }
  Object.assign(t, { exigeGovernanca: req.exigeGovernanca, ativa: req.ativa, versao: t.versao + 1 });
  salvar();
}

// ---------------- Propostas de configuração ----------------

export async function listarPropostas(status?: StatusGovernanca | ''): Promise<PropostaConfiguracao[]> {
  usuarioAtual();
  await espera(200);
  return db.propostas.filter((p) => !status || p.status === status).sort((a, b) => b.criadaEm.localeCompare(a.criadaEm));
}

export async function proporConfiguracao(req: PropostaRequest): Promise<PropostaConfiguracao> {
  const u = exigir('proporConfiguracao');
  await espera(350);
  if (!obrigatorio(req.justificativa)) throw invalido('A justificativa é obrigatória.', { justificativa: 'Obrigatória.' });
  if (req.tipo === 'COLUNA') validarNovaEtapa(req.proposta);
  else validarNovaTransicao(req.proposta);
  const p = { ...req, justificativa: texto(req.justificativa), id: novoId(), autor: resumo(u), status: 'PENDENTE', encerradaPor: null, justificativaEncerramento: null, encerradaEm: null, criadaEm: agora() } as PropostaConfiguracao;
  db.propostas.push(p);
  salvar();
  return p;
}

function propostaPendente(id: number) {
  const p = db.propostas.find((x) => x.id === id);
  if (!p) throw naoEncontrado('Proposta não encontrada.');
  if (p.status !== 'PENDENTE') throw conflito('Esta proposta já foi encerrada. Recarregue os dados.');
  return p;
}

// A aprovação aplica a configuração depois de revalidá-la; rejeição e cancelamento preservam a proposta
export async function decidirProposta(id: number, req: DecisaoRequest) {
  const u = exigir('decidirProposta');
  await espera(400);
  const p = propostaPendente(id);
  if (!obrigatorio(req.justificativa)) throw invalido('A justificativa da decisão é obrigatória.');
  if (req.decisao === 'APROVAR') {
    try {
      if (p.tipo === 'COLUNA') validarNovaEtapa(p.proposta);
      else validarNovaTransicao(p.proposta);
    } catch (e) {
      throw invalido(`A configuração mudou desde a proposta e ela não pode mais ser aplicada: ${(e as Error).message} Rejeite ou cancele o pedido.`);
    }
    if (p.tipo === 'COLUNA') aplicarNovaEtapa(p.proposta);
    else aplicarNovaTransicao(p.proposta);
  }
  Object.assign(p, { status: req.decisao === 'APROVAR' ? 'APROVADA' : 'REJEITADA', encerradaPor: resumo(u), justificativaEncerramento: texto(req.justificativa), encerradaEm: agora() });
  salvar();
}

export async function cancelarProposta(id: number, req: CancelamentoRequest) {
  const u = usuarioAtual();
  await espera(300);
  const p = propostaPendente(id);
  const perm = podeCancelar('cancelarProposta', u, { status: p.status, solicitanteId: p.autor.id });
  if (!perm.permitido) throw negar(perm.motivo ?? 'Sem permissão.');
  if (!obrigatorio(req.justificativa)) throw invalido('A justificativa do cancelamento é obrigatória.');
  Object.assign(p, { status: 'CANCELADA', encerradaPor: resumo(u), justificativaEncerramento: texto(req.justificativa), encerradaEm: agora() });
  salvar();
}

// ---------------- Projetos ----------------

export async function criarProjeto(req: CriarProjetoRequest): Promise<Projeto> {
  const u = exigir('registrarDemanda');
  await espera(500);
  const erros: Record<string, string> = {};
  if (!obrigatorio(req.titulo)) erros.titulo = 'Informe o título.';
  else if (texto(req.titulo).length > 255) erros.titulo = 'Use até 255 caracteres.';
  if (!obrigatorio(req.descricaoDor)) erros.descricaoDor = 'Descreva a dor.';
  if (!idPositivo(req.areaDemandanteId)) erros.areaDemandanteId = 'Selecione a área demandante.';
  if (!['ESPONTANEA', 'INDUZIDA'].includes(req.origem)) erros.origem = 'Informe a origem.';
  if (!Number.isInteger(req.trlInicialDeclarado) || req.trlInicialDeclarado < 1 || req.trlInicialDeclarado > 9) erros.trlInicialDeclarado = 'O TRL é um inteiro de 1 a 9.';
  if (req.origem === 'INDUZIDA' && !(idPositivo(req.acaoMobilizacaoId) && db.campanhas.some((c) => c.id === req.acaoMobilizacaoId))) erros.acaoMobilizacaoId = 'Informe uma ação de mobilização existente.';
  if (Object.keys(erros).length) throw invalido('Revise os campos destacados.', erros);

  let recomendacao: Recomendacao | undefined;
  if (req.recomendacaoId) {
    recomendacao = db.recomendacoes.find((r) => r.id === req.recomendacaoId);
    if (!recomendacao) throw naoEncontrado('Recomendação não encontrada.');
    if (recomendacao.destinatario.id !== u.id) throw negar('Somente o destinatário converte a recomendação.');
    if (recomendacao.status !== 'PENDENTE') throw conflito('Esta recomendação já foi encerrada.');
    if (req.origem !== 'ESPONTANEA') throw invalido('A conversão de uma recomendação gera uma demanda espontânea.');
  }

  const inicial = etapaInicial();
  if (!inicial?.ativa) throw invalido('A coluna inicial (Ideação) não está ativa no Kanban.');
  const id = novoId();
  const p: ProjetoDb = {
    id,
    titulo: texto(req.titulo),
    descricaoDor: texto(req.descricaoDor),
    origem: req.origem,
    campanhaId: req.origem === 'INDUZIDA' ? req.acaoMobilizacaoId : null,
    areaDemandanteId: req.areaDemandanteId,
    demandanteId: u.id,
    analistaId: null,
    arena: 'A_DEFINIR',
    hipoteseSolucao: texto(req.hipoteseSolucao) || null,
    potencialLeiDoBem: null,
    dispendioEstimado: null,
    etapaId: inicial.id,
    trlAtual: req.trlInicialDeclarado,
    arquivado: false,
    motivoArquivamento: null,
    arquivadoEm: null,
    versao: 1,
    recomendacaoId: recomendacao?.id ?? null,
    criadoEm: agora(),
    atualizadoEm: agora(),
  };
  db.projetos.unshift(p);
  if (recomendacao) Object.assign(recomendacao, { status: 'CONVERTIDA', projeto: { id, titulo: p.titulo }, encerradaEm: agora() });
  salvar();
  return enriquecer(p);
}

export async function listarProjetos(f: FiltroPortfolio = {}): Promise<Pagina<Projeto>> {
  usuarioAtual();
  await espera(200);
  const busca = (f.busca ?? '').trim().toLowerCase();
  const arquivamento = f.arquivamento ?? 'ATIVOS';
  const limite = f.periodoDias ? Date.now() - Number(f.periodoDias) * 86400000 : 0;
  let itens = db.projetos
    .filter(
      (p) =>
        (!busca || p.titulo.toLowerCase().includes(busca) || p.descricaoDor.toLowerCase().includes(busca)) &&
        (!f.arena || p.arena === f.arena) &&
        (!f.etapaId || p.etapaId === f.etapaId) &&
        (!f.origem || p.origem === f.origem) &&
        (!f.campanhaId || p.campanhaId === f.campanhaId) &&
        new Date(p.criadoEm).getTime() >= limite &&
        (arquivamento === 'TODOS' || p.arquivado === (arquivamento === 'ARQUIVADOS')),
    )
    .map(enriquecer);
  if (f.pendencia) itens = itens.filter((p) => p.pendencias.includes(f.pendencia as EstadoTarefa));
  itens.sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
  const total = itens.length;
  const tamanho = f.tamanho ?? 1000;
  const pagina = f.pagina ?? 0;
  return { itens: itens.slice(pagina * tamanho, pagina * tamanho + tamanho), total, pagina, tamanho };
}

export async function obterProjeto(id: number): Promise<ProjetoDetalhe> {
  usuarioAtual();
  await espera(250);
  const p = projetoOu404(id);
  const desc = <T>(arr: T[], k: keyof T) => [...arr].sort((a, b) => String(b[k]).localeCompare(String(a[k])));
  const rec = p.recomendacaoId ? db.recomendacoes.find((r) => r.id === p.recomendacaoId) : null;
  return {
    ...enriquecer(p),
    recomendacao: rec ? { id: rec.id, titulo: rec.titulo } : null,
    qualificacoes: desc(db.qualificacoes.filter((x) => x.projetoId === id), 'criadaEm'),
    consultas: desc(db.consultas.filter((x) => x.projetoId === id), 'criadaEm'),
    pareceres: desc(db.pareceres.filter((x) => x.projetoId === id), 'criadoEm').map(comQuestao),
    avaliacoesTrl: desc(db.avaliacoesTrl.filter((x) => x.projetoId === id), 'criadaEm'),
    avaliacoesRadar: db.radar.filter((r) => r.projetoId === id).sort((a, b) => a.dataAvaliacao.localeCompare(b.dataAvaliacao)),
    solicitacoes: desc(db.solicitacoes.filter((x) => x.projetoId === id), 'criadaEm'),
    entregas: desc(db.entregas.filter((x) => x.projetoId === id), 'registradaEm'),
    correcoes: desc(db.correcoes.filter((x) => x.projetoId === id), 'criadaEm'),
    evidencias: db.evidencias.filter((e) => e.projetoId === id),
    historicoTransicoes: desc(db.historico.filter((x) => x.projetoId === id), 'dataMudanca'),
    historicoGestao: desc(db.historicoGestao.filter((x) => x.projetoId === id), 'data'),
    interacoes: db.interacoes.filter((x) => x.projetoId === id).sort((a, b) => a.criadaEm.localeCompare(b.criadaEm)),
    transicoesDisponiveis: db.transicoes
      .filter((t) => t.ativa && t.origemId === p.etapaId && db.etapas.find((e) => e.id === t.origemId)?.ativa && db.etapas.find((e) => e.id === t.destinoId)?.ativa)
      .map((t) => ({ ...t, destino: etapaResumo(t.destinoId) })),
  };
}

export async function comentar(projetoId: number, mensagem: string): Promise<Interacao> {
  const p = projetoOu404(projetoId);
  const u = exigir('comentar', p);
  await espera(250);
  if (texto(mensagem).length < 2) throw invalido('Escreva a mensagem.');
  const i: Interacao = { id: novoId(), projetoId, autor: resumo(u), perfil: u.perfil, texto: texto(mensagem), criadaEm: agora() };
  db.interacoes.push(i);
  p.atualizadoEm = agora();
  salvar();
  return i;
}

// ---------------- Gestão do projeto (Especialista) ----------------

const simNao = (v: boolean | null) => (v == null ? '—' : v ? 'Sim' : 'Não');
const nomeUsuario = (id: number | null) => usuarioPorId(id)?.nome ?? '—';

export async function editarProjeto(id: number, req: EdicaoProjetoRequest) {
  const p = projetoOu404(id);
  const u = exigir('gerirProjeto', p);
  await espera(450);
  if (req.versao !== p.versao) throw conflitoVersao();
  if (!obrigatorio(req.justificativa)) throw invalido('A justificativa é obrigatória.', { justificativa: 'Obrigatória.' });
  const d = req.dados;
  const erros: Record<string, string> = {};
  if (!obrigatorio(d.titulo, 255)) erros.titulo = 'Informe o título (até 255 caracteres).';
  if (!obrigatorio(d.descricaoDor)) erros.descricaoDor = 'Descreva a dor.';
  if (!idPositivo(d.areaDemandanteId)) erros.areaDemandanteId = 'Selecione a área.';
  if (!ARENAS.includes(d.arena)) erros.arena = 'Selecione a arena.';
  if (d.dispendioEstimado != null && (d.dispendioEstimado < 0 || !/^\d{1,10}(\.\d{1,2})?$/.test(String(d.dispendioEstimado))))
    erros.dispendioEstimado = 'Use um valor não negativo com até 10 dígitos inteiros e 2 decimais.';
  const dem = usuarioPorId(d.demandanteId);
  if (!dem || !dem.ativo || dem.perfil !== 'DEMANDANTE') erros.demandanteId = 'Escolha um Demandante ativo.';
  if (d.analistaResponsavelId != null) {
    const ana = usuarioPorId(d.analistaResponsavelId);
    if (!ana || !ana.ativo || ana.perfil !== 'ANALISTA') erros.analistaResponsavelId = 'Escolha um Analista ativo.';
  }
  if (Object.keys(erros).length) throw invalido('Revise os campos destacados.', erros);

  const novo = {
    titulo: texto(d.titulo),
    descricaoDor: texto(d.descricaoDor),
    areaDemandanteId: d.areaDemandanteId,
    hipoteseSolucao: texto(d.hipoteseSolucao) || null,
    arena: d.arena,
    potencialLeiDoBem: d.potencialLeiDoBem,
    dispendioEstimado: d.dispendioEstimado,
    demandanteId: d.demandanteId,
    analistaId: d.analistaResponsavelId,
  };
  const campos: [string, string, string][] = [
    ['Título', p.titulo, novo.titulo],
    ['Descrição da dor', p.descricaoDor, novo.descricaoDor],
    ['Área demandante', areaNome(p.areaDemandanteId), areaNome(novo.areaDemandanteId)],
    ['Hipótese de solução', p.hipoteseSolucao ?? '—', novo.hipoteseSolucao ?? '—'],
    ['Arena', ARENA_LABEL[p.arena], ARENA_LABEL[novo.arena]],
    ['Potencial de Lei do Bem', simNao(p.potencialLeiDoBem), simNao(novo.potencialLeiDoBem)],
    ['Dispêndio estimado', formatarMoedaBRL(p.dispendioEstimado), formatarMoedaBRL(novo.dispendioEstimado)],
    ['Demandante', nomeUsuario(p.demandanteId), nomeUsuario(novo.demandanteId)],
    ['Analista responsável', nomeUsuario(p.analistaId), nomeUsuario(novo.analistaId)],
  ];
  const alteracoes: AlteracaoCampo[] = campos.filter(([, a, b]) => a !== b).map(([campo, anterior, atual]) => ({ campo, anterior, atual }));
  if (!alteracoes.length) throw invalido('Nenhum dado foi alterado.');
  Object.assign(p, novo, { versao: p.versao + 1, atualizadoEm: agora() });
  db.historicoGestao.push({ id: novoId(), projetoId: id, tipo: 'CADASTRO', usuario: resumo(u), justificativa: texto(req.justificativa), alteracoes, data: agora() });
  salvar();
}

export async function alterarArquivamento(id: number, req: ArquivamentoRequest) {
  const p = projetoOu404(id);
  const u = exigir('gerirProjeto', p);
  await espera(400);
  if (req.versao !== p.versao) throw conflitoVersao();
  if (req.arquivado === p.arquivado) throw invalido(p.arquivado ? 'O projeto já está arquivado.' : 'O projeto já está ativo.');
  if (!obrigatorio(req.justificativa)) throw invalido('A justificativa é obrigatória.');
  if (req.arquivado && temSolicitacaoPendente(id)) throw invalido('Há pedido de avanço pendente. Decida ou cancele o pedido antes de arquivar.');
  Object.assign(p, {
    arquivado: req.arquivado,
    motivoArquivamento: req.arquivado ? texto(req.justificativa) : null,
    arquivadoEm: req.arquivado ? agora() : null,
    versao: p.versao + 1,
    atualizadoEm: agora(),
  });
  db.historicoGestao.push({
    id: novoId(),
    projetoId: id,
    tipo: req.arquivado ? 'ARQUIVAMENTO' : 'REATIVACAO',
    usuario: resumo(u),
    justificativa: texto(req.justificativa),
    alteracoes: [{ campo: 'Arquivado', anterior: req.arquivado ? 'Não' : 'Sim', atual: req.arquivado ? 'Sim' : 'Não' }],
    data: agora(),
  });
  salvar();
}

// ---------------- Qualificação ----------------

export async function registrarQualificacao(id: number, req: QualificacaoRequest) {
  const p = projetoOu404(id);
  const u = exigir('qualificar', p);
  await espera(450);
  const campos = ['aderenciaTese', 'relevancia', 'grauInovacao', 'viabilidade', 'maturidadeTecnologica', 'fundamentacao', 'conclusao'] as const;
  const erros = Object.fromEntries(campos.filter((c) => !obrigatorio(req[c])).map((c) => [c, 'Obrigatório.']));
  if (Object.keys(erros).length) throw invalido('Todos os campos da qualificação são obrigatórios.', erros);
  db.qualificacoes.push({
    id: novoId(),
    projetoId: id,
    analista: resumo(u),
    aderenciaTese: texto(req.aderenciaTese),
    relevancia: texto(req.relevancia),
    grauInovacao: texto(req.grauInovacao),
    viabilidade: texto(req.viabilidade),
    maturidadeTecnologica: texto(req.maturidadeTecnologica),
    fundamentacao: texto(req.fundamentacao),
    conclusao: texto(req.conclusao),
    criadaEm: agora(),
  });
  // A qualificação não altera a etapa nem o TRL. Sem responsável, quem qualifica passa a conduzir.
  p.analistaId ??= u.id;
  p.atualizadoEm = agora();
  salvar();
}

// ---------------- Consulta e parecer ----------------

export async function consultarEspecialista(projetoId: number, req: ConsultaRequest): Promise<ConsultaEspecialista> {
  const p = projetoOu404(projetoId);
  const u = exigir('consultarEspecialista', p);
  await espera(400);
  if (!idPositivo(req.especialistaId)) throw invalido('Escolha o Especialista.', { especialistaId: 'Obrigatório.' });
  const esp = usuarioPorId(req.especialistaId);
  if (!esp || !esp.ativo || esp.perfil !== 'ESPECIALISTA') throw invalido('O destinatário precisa ser um Especialista ativo.', { especialistaId: 'Destinatário inválido.' });
  if (!obrigatorio(req.questao)) throw invalido('Escreva a questão.', { questao: 'Obrigatória.' });
  const c: ConsultaEspecialista = {
    id: novoId(),
    projetoId,
    solicitante: resumo(u),
    especialista: resumo(esp),
    areaTecnica: esp.areaTecnica ?? null,
    questao: texto(req.questao),
    status: 'PENDENTE',
    parecerId: null,
    criadaEm: agora(),
    respondidaEm: null,
  };
  db.consultas.push(c);
  p.atualizadoEm = agora();
  salvar();
  return c;
}

// Parecer independente (sem consulta) ou resposta a uma consulta do projeto dirigida ao autor
export async function emitirParecer(projetoId: number, req: ParecerRequest) {
  const p = projetoOu404(projetoId);
  const u = exigir('emitirParecer', p);
  await espera(450);
  let consulta: ConsultaEspecialista | undefined;
  if (req.consultaId != null) {
    if (!idPositivo(req.consultaId)) throw invalido('Consulta inválida.');
    consulta = db.consultas.find((c) => c.id === req.consultaId && c.projetoId === projetoId);
    if (!consulta) throw invalido('A consulta não pertence a este projeto.');
    if (consulta.status !== 'PENDENTE') throw conflito('Esta consulta já foi respondida.');
    if (!podeResponderConsulta(consulta, u)) throw negar('Esta consulta foi dirigida a outro Especialista.');
  }
  if (!obrigatorio(req.fundamentacao) || !obrigatorio(req.conclusao)) throw invalido('Preencha a fundamentação e a conclusão.');
  const evidencias = evidenciasDoProjeto(projetoId, req.evidenciaIds, { obrigatoria: false });
  const parecer: Parecer = { id: novoId(), projetoId, consultaId: consulta?.id ?? null, especialista: resumo(u), fundamentacao: texto(req.fundamentacao), conclusao: texto(req.conclusao), evidencias, criadoEm: agora() };
  db.pareceres.push(parecer);
  if (consulta) Object.assign(consulta, { status: 'RESPONDIDA', parecerId: parecer.id, respondidaEm: agora() });
  p.atualizadoEm = agora();
  salvar();
}

// ---------------- Avaliação de TRL ----------------

export async function registrarAvaliacaoTrl(projetoId: number, req: AvaliacaoTrlRequest) {
  const p = projetoOu404(projetoId);
  const u = exigir('avaliarTrl', p);
  await espera(500);
  if (!Number.isInteger(req.nivel) || req.nivel < 1 || req.nivel > 9) throw invalido('O nível deve ser um inteiro entre 1 e 9.');
  if (!obrigatorio(req.justificativa)) throw invalido('A justificativa é obrigatória.');
  const evidencias = evidenciasDoProjeto(projetoId, req.evidenciaIds, { obrigatoria: true });
  const id = novoId();
  let radarId: number | null = null;
  if (req.radar) {
    radarId = novoId();
    db.radar.push({ id: radarId, projetoId, tipoLeitura: 'ATUAL', scoreNegocio: req.radar.negocio, scoreProduto: req.radar.produto, scoreTime: req.radar.time, scoreReceita: req.radar.receita, dataAvaliacao: agora() });
  }
  // A avaliação formal e as evidências são registradas junto com a atualização do TRL
  db.avaliacoesTrl.push({ id, projetoId, responsavel: resumo(u), trlAnterior: p.trlAtual, trlNovo: req.nivel, justificativa: texto(req.justificativa), evidencias, radarId, criadaEm: agora() });
  if (req.nivel !== p.trlAtual) registrarHistorico(p, u, 'TRL', String(p.trlAtual), String(req.nivel), req.nivel < p.trlAtual ? 'Avaliação de TRL (redução)' : 'Avaliação de TRL');
  p.trlAtual = req.nivel;
  p.atualizadoEm = agora();
  salvar();
}

// ---------------- Kanban: movimentação e governança ----------------

// Percurso válido: ativo, com origem igual à etapa atual, origem e destino ativos e origem não terminal
function percursoValido(p: ProjetoDb, transicaoId: number) {
  if (!idPositivo(transicaoId)) throw invalido('Escolha o percurso.');
  const t = db.transicoes.find((x) => x.id === transicaoId);
  if (!t || !t.ativa) throw invalido('Este percurso não está ativo na configuração atual do quadro.');
  if (t.origemId !== p.etapaId) throw conflito('O projeto mudou de etapa desde que a tela foi aberta. Recarregue os dados.');
  const o = db.etapas.find((e) => e.id === t.origemId);
  const d = db.etapas.find((e) => e.id === t.destinoId);
  if (!o?.ativa || !d?.ativa) throw invalido('Origem e destino do percurso precisam estar ativos.');
  if (o.terminal) throw invalido(`${o.nome} é terminal e não admite saída.`);
  return t;
}

export async function moverDireto(projetoId: number, req: MovimentacaoRequest): Promise<{ destino: string }> {
  const p = projetoOu404(projetoId);
  const u = exigir('moverDireto', p);
  await espera(450);
  const t = percursoValido(p, req.transicaoId);
  if (modoMovimentacao(u, t) !== 'DIRETO') throw negar('O Analista só movimenta diretamente em percurso livre. Para percurso governado, solicite o avanço.');
  if (!obrigatorio(req.justificativa)) throw invalido('A justificativa é obrigatória.');
  const de = etapaResumo(p.etapaId).nome;
  const destino = etapaResumo(t.destinoId);
  registrarHistorico(p, u, 'ETAPA', de, destino.nome, texto(req.justificativa));
  p.etapaId = t.destinoId;
  notificarMovimentacao(p, u, de, destino.nome, false);
  salvar();
  return { destino: destino.nome };
}

export async function solicitarAvanco(projetoId: number, req: SolicitacaoAvancoRequest) {
  const p = projetoOu404(projetoId);
  const u = exigir('solicitarAvanco', p);
  await espera(450);
  const t = percursoValido(p, req.transicaoId);
  if (!t.exigeGovernanca) throw invalido('O pedido de avanço é aberto apenas para percurso governado. Em percurso livre, mova diretamente.');
  if (!obrigatorio(req.justificativa)) throw invalido('A justificativa é obrigatória.');
  const evidencias = evidenciasDoProjeto(projetoId, req.evidenciaIds, { obrigatoria: true });
  db.solicitacoes.push({
    id: novoId(),
    projetoId,
    transicaoId: t.id,
    origem: etapaResumo(p.etapaId),
    destino: etapaResumo(t.destinoId),
    solicitante: resumo(u),
    justificativa: texto(req.justificativa),
    evidencias,
    status: 'PENDENTE',
    encerradaPor: null,
    justificativaEncerramento: null,
    encerradaEm: null,
    criadaEm: agora(),
  });
  p.atualizadoEm = agora();
  salvar();
}

function solicitacaoPendente(id: number) {
  const s = db.solicitacoes.find((x) => x.id === id);
  if (!s) throw naoEncontrado('Pedido de avanço não encontrado.');
  if (s.status !== 'PENDENTE') throw conflito('Este pedido já foi encerrado por outra pessoa. Recarregue os dados.');
  return s;
}

// Ao aprovar, o percurso é revalidado e a etapa muda. Rejeitar encerra o pedido sem mover o projeto.
export async function decidirSolicitacao(id: number, req: DecisaoRequest) {
  const u = exigir('decidirAvanco');
  await espera(500);
  const s = solicitacaoPendente(id);
  if (!obrigatorio(req.justificativa)) throw invalido('A justificativa da decisão é obrigatória.');
  const p = projetoOu404(s.projetoId);
  if (req.decisao === 'APROVAR') {
    try {
      percursoValido(p, s.transicaoId);
    } catch (e) {
      throw new ApiError(422, 'CONFIGURACAO_DIVERGENTE', `A configuração divergiu desde o pedido: ${(e as Error).message} Rejeite ou cancele o pedido para encerrá-lo.`);
    }
    registrarHistorico(p, u, 'ETAPA', s.origem.nome, s.destino.nome, 'Pedido de avanço aprovado', s.id);
    p.etapaId = s.destino.id;
    notificarMovimentacao(p, u, s.origem.nome, s.destino.nome, true);
  }
  Object.assign(s, { status: req.decisao === 'APROVAR' ? 'APROVADA' : 'REJEITADA', encerradaPor: resumo(u), justificativaEncerramento: texto(req.justificativa), encerradaEm: agora() });
  p.atualizadoEm = agora();
  salvar();
}

export async function cancelarSolicitacao(id: number, req: CancelamentoRequest) {
  const u = usuarioAtual();
  await espera(350);
  const s = solicitacaoPendente(id);
  const perm = podeCancelar('cancelarAvanco', u, { status: s.status, solicitanteId: s.solicitante.id });
  if (!perm.permitido) throw negar(perm.motivo ?? 'Sem permissão.');
  if (!obrigatorio(req.justificativa)) throw invalido('A justificativa do cancelamento é obrigatória.');
  Object.assign(s, { status: 'CANCELADA', encerradaPor: resumo(u), justificativaEncerramento: texto(req.justificativa), encerradaEm: agora() });
  projetoOu404(s.projetoId).atualizadoEm = agora();
  salvar();
}

// ---------------- Entregas, validações e correções ----------------

export async function registrarEntrega(projetoId: number, req: EntregaRequest) {
  const p = projetoOu404(projetoId);
  const u = exigir('submeterEntrega', p);
  await espera(400);
  if (!obrigatorio(req.descricao)) throw invalido('Descreva a entrega.', { descricao: 'Obrigatória.' });
  db.entregas.push({ id: novoId(), projetoId, descricao: texto(req.descricao), registradaPor: resumo(u), registradaEm: agora(), validacoes: [] });
  p.atualizadoEm = agora();
  salvar();
}

// Cada manifestação do Demandante responsável gera um novo registro; as anteriores são preservadas
export async function validarEntrega(id: number, req: ValidacaoRequest) {
  const e = db.entregas.find((x) => x.id === id);
  if (!e) throw naoEncontrado('Entrega não encontrada.');
  const p = projetoOu404(e.projetoId);
  const u = exigir('validarEntrega', p);
  await espera(400);
  if (!['VALIDADA', 'VALIDADA_COM_RESSALVAS', 'NAO_VALIDADA'].includes(req.resultado)) throw invalido('Escolha o resultado.');
  if (!obrigatorio(req.observacoes)) throw invalido('As observações são obrigatórias.');
  e.validacoes.unshift({ id: novoId(), entregaId: e.id, resultado: req.resultado, observacoes: texto(req.observacoes), por: resumo(u), em: agora() });
  p.atualizadoEm = agora();
  salvar();
}

export async function registrarCorrecao(projetoId: number, req: CorrecaoRequest) {
  const p = projetoOu404(projetoId);
  const u = exigir('registrarCorrecao', p);
  await espera(400);
  if (!obrigatorio(req.descricao)) throw invalido('Descreva a correção.', { descricao: 'Obrigatória.' });
  if (texto(req.referencia).length > 500) throw invalido('A referência tem no máximo 500 caracteres.', { referencia: 'Até 500 caracteres.' });
  if (req.evidenciaId != null && !idPositivo(req.evidenciaId)) throw invalido('Evidência inválida.');
  const [evidencia] = req.evidenciaId != null ? evidenciasDoProjeto(projetoId, [req.evidenciaId], { obrigatoria: false }) : [null];
  const c: Correcao = { id: novoId(), projetoId, descricao: texto(req.descricao), referencia: texto(req.referencia) || null, evidencia, autor: resumo(u), criadaEm: agora() };
  db.correcoes.push(c);
  p.atualizadoEm = agora();
  salvar();
}

// ---------------- Evidências (envio simulado) ----------------

const FORMATOS_EVIDENCIA = ['jpg', 'jpeg', 'pdf', 'doc', 'docx'];
const MIME_EVIDENCIA: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

// Tudo ou nada: se um arquivo for recusado, nenhum é registrado. Só os metadados ficam no navegador.
export async function anexarEvidencias(projetoId: number, arquivos: File[], descricao: string): Promise<Evidencia[]> {
  const p = projetoOu404(projetoId);
  const u = exigir('anexarEvidencia', p);
  await espera(500);
  if (!arquivos.length) throw invalido('Escolha ao menos um arquivo.');
  for (const f of arquivos) {
    const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
    if (!FORMATOS_EVIDENCIA.includes(ext)) throw new ApiError(422, 'TIPO_INVALIDO', `${f.name} foi recusado: use JPEG/JPG, PDF ou Word (DOC/DOCX).`, { arquivo: f.name });
    if (f.size > 10 * 1024 * 1024) throw new ApiError(422, 'TAMANHO_INVALIDO', `${f.name} foi recusado: o limite é 10 MB por arquivo.`, { arquivo: f.name });
  }
  const novas: Evidencia[] = arquivos.map((f) => ({
    id: novoId(),
    projetoId,
    nomeArquivo: f.name,
    tipoArquivo: MIME_EVIDENCIA[f.name.split('.').pop()?.toLowerCase() ?? ''] ?? f.type,
    tamanhoBytes: f.size,
    dataUpload: agora(),
    enviadaPor: resumo(u),
    estadoEnvio: 'ENVIADO',
    descricao: texto(descricao) || undefined,
  }));
  db.evidencias.push(...novas);
  p.atualizadoEm = agora();
  salvar();
  return novas;
}

// ---------------- Recomendações ----------------

// O Especialista tem visão de gestão; os demais veem as recomendações de que participam
export async function listarRecomendacoes(status?: StatusRecomendacao | ''): Promise<Recomendacao[]> {
  const u = usuarioAtual();
  await espera(200);
  return db.recomendacoes
    .filter((r) => (u.perfil === 'ESPECIALISTA' || r.autor.id === u.id || r.destinatario.id === u.id) && (!status || r.status === status))
    .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm));
}

export async function obterRecomendacao(id: number): Promise<Recomendacao> {
  const u = usuarioAtual();
  await espera(150);
  const r = db.recomendacoes.find((x) => x.id === id);
  if (!r || (u.perfil !== 'ESPECIALISTA' && r.autor.id !== u.id && r.destinatario.id !== u.id)) throw naoEncontrado('Recomendação não encontrada.');
  return r;
}

export async function criarRecomendacao(req: RecomendacaoRequest): Promise<Recomendacao> {
  const u = exigir('recomendarDemanda');
  await espera(350);
  const dest = usuarioPorId(req.destinatarioId);
  if (!idPositivo(req.destinatarioId) || !dest || !dest.ativo || dest.perfil !== 'DEMANDANTE') throw invalido('O destinatário precisa ser um Demandante ativo.', { destinatarioId: 'Destinatário inválido.' });
  const erros: Record<string, string> = {};
  if (!obrigatorio(req.titulo, 255)) erros.titulo = 'Informe o título (até 255 caracteres).';
  if (!obrigatorio(req.descricao)) erros.descricao = 'Descreva a recomendação.';
  if (Object.keys(erros).length) throw invalido('Revise os campos destacados.', erros);
  const r: Recomendacao = { id: novoId(), autor: resumo(u), autorPerfil: u.perfil, destinatario: resumo(dest), titulo: texto(req.titulo), descricao: texto(req.descricao), status: 'PENDENTE', projeto: null, justificativaEncerramento: null, encerradaEm: null, criadaEm: agora() };
  db.recomendacoes.push(r);
  salvar();
  return r;
}

export async function recusarRecomendacao(id: number, req: CancelamentoRequest) {
  const u = exigir('responderRecomendacao');
  await espera(350);
  const r = db.recomendacoes.find((x) => x.id === id);
  if (!r) throw naoEncontrado('Recomendação não encontrada.');
  if (r.destinatario.id !== u.id) throw negar('Somente o destinatário responde a recomendação.');
  if (r.status !== 'PENDENTE') throw conflito('Esta recomendação já foi encerrada.');
  if (!obrigatorio(req.justificativa)) throw invalido('A recusa exige justificativa.');
  Object.assign(r, { status: 'RECUSADA', justificativaEncerramento: texto(req.justificativa), encerradaEm: agora() });
  salvar();
}

// ---------------- Notificações ----------------

export async function listarNotificacoes(): Promise<Notificacao[]> {
  usuarioAtual();
  await espera(150);
  return [...db.notificacoes].sort((a, b) => b.criadaEm.localeCompare(a.criadaEm));
}

// ---------------- Minha fila e dashboard ----------------

export async function minhaFila(): Promise<MinhaFila> {
  const u = usuarioAtual();
  await espera(250);
  const projetos = db.projetos.map(enriquecer);
  const recentes = (iso: string | null) => !!iso && Date.now() - new Date(iso).getTime() < 30 * 86400000;
  const ativos = new Set(db.projetos.filter((p) => !p.arquivado).map((p) => p.id));
  const doDemandante = new Set(db.projetos.filter((p) => p.demandanteId === u.id && !p.arquivado).map((p) => p.id));
  const minhasConsultas = new Set(db.consultas.filter((c) => c.solicitante.id === u.id).map((c) => c.id));
  const doAnalista = new Set(db.projetos.filter((p) => p.analistaId === u.id).map((p) => p.id));
  const porData = <T extends { criadaEm: string }>(a: T, b: T) => a.criadaEm.localeCompare(b.criadaEm);
  return {
    triagem: u.perfil === 'ANALISTA' ? projetos.filter((p) => p.pendencias.includes('AGUARDANDO_TRIAGEM')) : [],
    consultasPendentes: u.perfil === 'ESPECIALISTA' ? db.consultas.filter((c) => ativos.has(c.projetoId) && podeResponderConsulta(c, u)).map(comTitulo) : [],
    solicitacoesPendentes:
      u.perfil === 'ESPECIALISTA'
        ? db.solicitacoes.filter((s) => s.status === 'PENDENTE').sort(porData).map(comTitulo)
        : u.perfil === 'ANALISTA'
          ? db.solicitacoes.filter((s) => s.status === 'PENDENTE' && s.solicitante.id === u.id).map(comTitulo)
          : [],
    solicitacoesEncerradas: u.perfil === 'ANALISTA' ? db.solicitacoes.filter((s) => s.solicitante.id === u.id && s.status !== 'PENDENTE' && recentes(s.encerradaEm)).map(comTitulo) : [],
    pareceresRecebidos: u.perfil === 'ANALISTA' ? db.pareceres.filter((p) => p.consultaId && minhasConsultas.has(p.consultaId) && recentes(p.criadoEm)).map(comQuestao) : [],
    propostasPendentes:
      u.perfil === 'ESPECIALISTA'
        ? db.propostas.filter((p) => p.status === 'PENDENTE').sort(porData)
        : u.perfil === 'ANALISTA'
          ? db.propostas.filter((p) => p.status === 'PENDENTE' && p.autor.id === u.id)
          : [],
    entregasParaValidar: u.perfil === 'DEMANDANTE' ? db.entregas.filter((e) => doDemandante.has(e.projetoId) && !e.validacoes.length).map(comTitulo) : [],
    entregasValidadas: u.perfil === 'ANALISTA' ? db.entregas.filter((e) => doAnalista.has(e.projetoId) && e.validacoes.length && recentes(e.validacoes[0].em)).map(comTitulo) : [],
    minhasDemandas: u.perfil === 'DEMANDANTE' ? projetos.filter((p) => p.demandante?.id === u.id) : [],
    recomendacoesPendentes: u.perfil === 'DEMANDANTE' ? db.recomendacoes.filter((r) => r.destinatario.id === u.id && r.status === 'PENDENTE') : [],
  };
}

export async function metricas(f: FiltroDashboard = {}): Promise<MetricasDashboard> {
  usuarioAtual();
  await espera(250);
  const limite = f.periodoDias ? Date.now() - Number(f.periodoDias) * 86400000 : 0;
  const filtrados = db.projetos.filter(
    (p) => new Date(p.criadoEm).getTime() >= limite && (!f.etapaId || p.etapaId === f.etapaId) && (!f.origem || p.origem === f.origem),
  );
  // Indicadores do portfólio ativo; arquivados aparecem só na contagem própria
  const ps = filtrados.filter((p) => !p.arquivado);
  const media = (v: number[]) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0);
  const ids = new Set(ps.map((p) => p.id));
  const iniciais = db.radar.filter((r) => r.tipoLeitura === 'INICIAL' && ids.has(r.projetoId));
  const atuais = ps
    .map((p) => {
      const rs = db.radar.filter((r) => r.projetoId === p.id).sort((a, b) => b.dataAvaliacao.localeCompare(a.dataAvaliacao));
      return rs.find((r) => r.tipoLeitura === 'ATUAL') ?? rs[0];
    })
    .filter(Boolean);
  const radarMedio = (rs: typeof iniciais) => ({
    negocio: media(rs.map((r) => r.scoreNegocio)),
    produto: media(rs.map((r) => r.scoreProduto)),
    time: media(rs.map((r) => r.scoreTime)),
    receita: media(rs.map((r) => r.scoreReceita)),
  });
  const enr = ps.map(enriquecer);
  const conta = (t: EstadoTarefa) => enr.filter((p) => p.pendencias.includes(t)).length;
  return {
    totalProjetos: ps.length,
    arquivados: filtrados.length - ps.length,
    trlMedio: media(ps.map((p) => p.trlAtual)),
    porEtapa: [...db.etapas].filter((e) => e.ativa).sort((a, b) => a.ordem - b.ordem).map((e) => ({ etapa: etapaResumo(e.id), total: ps.filter((p) => p.etapaId === e.id).length })),
    porOrigem: { ESPONTANEA: ps.filter((p) => p.origem === 'ESPONTANEA').length, INDUZIDA: ps.filter((p) => p.origem === 'INDUZIDA').length },
    porArena: Object.fromEntries(ARENAS.map((a) => [a, ps.filter((p) => p.arena === a).length])) as MetricasDashboard['porArena'],
    pendencias: { AGUARDANDO_TRIAGEM: conta('AGUARDANDO_TRIAGEM'), AGUARDANDO_PARECER: conta('AGUARDANDO_PARECER'), AGUARDANDO_GOVERNANCA: conta('AGUARDANDO_GOVERNANCA'), AGUARDANDO_VALIDACAO: conta('AGUARDANDO_VALIDACAO') },
    radarMedioInicial: radarMedio(iniciais),
    radarMedioAtual: radarMedio(atuais),
  };
}
