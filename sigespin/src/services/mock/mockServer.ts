// Simula as regras de negócio (revisão 2) até o back-end expor as rotas.
// Persistido no localStorage para que as ações sobrevivam ao recarregar a página.
import { ApiError } from '@/types/api';
import type {
  AnaliseIaRequest,
  AnaliseIaResponse,
  ArenaTipo,
  Campanha,
  CampanhaRequest,
  ConsultaEspecialista,
  ConsultaRequest,
  CriarProjetoRequest,
  DecisaoRequest,
  Entrega,
  EntregaRequest,
  EtapaJornada,
  Evidencia,
  FiltroPortfolio,
  Interacao,
  MarcoRequest,
  MaturidadeRequest,
  MetricasDashboard,
  Pagina,
  PautaGovernanca,
  PautaRequest,
  Projeto,
  ProjetoDetalhe,
  QualificacaoRequest,
  RespostaConsultaRequest,
  Usuario,
  UsuarioResumo,
  ValidacaoEntregaRequest,
} from '@/types/domain';
import { ARENAS, ETAPA_LABEL, podeResponderConsulta, ETAPAS_ENCERRADAS, ETAPAS_TERMINAIS, TODAS_ETAPAS, areaNome } from '@/utils/constants';

import { USUARIO_KEY } from '../api';
import { criarSeed, SENHA_DEMO, type MockDb, type ProjetoDb } from './seed';

const DB_KEY = '@SIGES_PIN:mockdb:v3';

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

// ---------------- Sessão e permissões ----------------

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

const negar = (msg = 'Seu perfil não tem permissão para esta ação.') => new ApiError(403, 'ACESSO_NEGADO', msg);
const invalido = (msg: string, detalhes?: Record<string, string>) => new ApiError(422, 'VALIDACAO_FALHOU', msg, detalhes);
const transicao = (msg: string) => new ApiError(422, 'TRANSICAO_INVALIDA', msg);

function exigirPerfil(...perfis: Usuario['perfil'][]) {
  const u = usuarioAtual();
  if (!perfis.includes(u.perfil)) throw negar();
  return u;
}

function exigirAlcada() {
  const u = usuarioAtual();
  if (!u.alcadaGovernanca) throw negar('Esta decisão exige alçada de governança.');
  return u;
}

const veFinanceiro = (u: Usuario) => u.perfil === 'ANALISTA' || u.alcadaGovernanca;

function projetoOu404(id: number) {
  const p = db.projetos.find((x) => x.id === id);
  if (!p) throw new ApiError(404, 'NAO_ENCONTRADO', 'Projeto não encontrado.');
  return p;
}

// Acrescenta os campos calculados e protege o financeiro
function enriquecer(p: ProjetoDb): Projeto {
  const u = usuarioAtual();
  return {
    ...p,
    dispendioEstimado: veFinanceiro(u) ? p.dispendioEstimado : null,
    areaDemandanteNome: areaNome(p.areaDemandanteId),
    pautaPendente: db.pautas.some((x) => x.projetoId === p.id && x.status === 'PENDENTE'),
    entregasAguardandoValidacao: db.entregas.filter((e) => e.projetoId === p.id && e.status === 'AGUARDANDO_VALIDACAO').length,
  };
}

function mudarEtapa(p: ProjetoDb, nova: EtapaJornada, u: Usuario, motivo: string) {
  if (p.etapa === nova) return;
  db.historico.push({ id: novoId(), projetoId: p.id, usuario: resumo(u), tipoMudanca: 'ETAPA', valorAnterior: p.etapa, valorNovo: nova, motivo, dataMudanca: agora() });
  p.etapa = nova;
  p.atualizadoEm = agora();
}

function mudarTrl(p: ProjetoDb, novo: number, u: Usuario, motivo: string) {
  if (p.trlAtual === novo) return;
  db.historico.push({ id: novoId(), projetoId: p.id, usuario: resumo(u), tipoMudanca: 'TRL', valorAnterior: String(p.trlAtual), valorNovo: String(novo), motivo, dataMudanca: agora() });
  p.trlAtual = novo;
  p.atualizadoEm = agora();
}

// Ações do ciclo de vida ficam com o analista responsável pela demanda.
// O analista gestor (com alçada) pode atuar em qualquer projeto do portfólio.
function exigirResponsavel(p: ProjetoDb, u: Usuario) {
  if (p.analistaResponsavel && p.analistaResponsavel.id !== u.id && !u.alcadaGovernanca)
    throw negar(`Esta demanda está com ${p.analistaResponsavel.nome}. Somente o analista responsável pode registrar esta ação.`);
}

function exigirAtivo(p: ProjetoDb) {
  if (ETAPAS_TERMINAIS.includes(p.etapa)) throw transicao('O projeto está em um estado final.');
}

function salvarArquivos(projetoId: number, arquivos: File[], u: Usuario, vinculo: Evidencia['vinculo']): Evidencia[] {
  const evs = arquivos.map((f) => ({
    id: novoId(),
    projetoId,
    nomeArquivo: f.name,
    tipoArquivo: f.type || 'application/octet-stream',
    tamanhoBytes: f.size,
    dataUpload: agora(),
    enviadaPor: resumo(u),
    vinculo,
  }));
  db.evidencias.push(...evs);
  return evs;
}

// ---------------- Autenticação ----------------

export async function login(email: string, senha: string) {
  await espera(450);
  const u = db.usuarios.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  if (!u || senha !== SENHA_DEMO) throw new ApiError(401, 'CREDENCIAIS_INVALIDAS', 'E-mail ou senha incorretos.');
  if (!u.ativo) throw new ApiError(403, 'USUARIO_INATIVO', 'Este usuário está inativo. Procure o administrador.');
  return { token: `mock.${u.id}.${Date.now()}`, usuario: u };
}

export async function solicitarAcesso(dados: { nome: string; email: string; areaId: number; perfil: string }) {
  await espera(500);
  if (db.usuarios.some((x) => x.email.toLowerCase() === dados.email.toLowerCase()))
    throw new ApiError(409, 'EMAIL_JA_CADASTRADO', 'Já existe um usuário com este e-mail.');
  db.pedidosAcesso.push({ ...dados, criadoEm: agora() });
  salvar();
}

export async function listarEspecialistas(): Promise<Usuario[]> {
  usuarioAtual();
  await espera(150);
  return db.usuarios.filter((x) => x.perfil === 'ESPECIALISTA' && x.ativo);
}

// ---------------- IA ----------------

export async function analisarDemanda(req: AnaliseIaRequest): Promise<AnaliseIaResponse> {
  exigirPerfil('DEMANDANTE');
  await espera(1300);
  const texto = `${req.titulo} ${req.descricaoDor}`.toLowerCase();
  // Simula indisponibilidade para demonstrar a degradação suave
  if (texto.includes('#offline')) throw new ApiError(503, 'IA_INDISPONIVEL', 'O serviço de IA está indisponível no momento.');

  let arena: ArenaTipo = 'A_DEFINIR';
  if (/fraude|segur|golpe|ataque|invas|risco/.test(texto)) arena = 'SEGURANCA_INTEGRADA';
  else if (/cliente|digital|canal|app|venda|produto|receita/.test(texto)) arena = 'NEGOCIOS_DIGITAIS';
  else if (/manual|tempo|custo|retrabalho|processo|automat|eficien|energia/.test(texto)) arena = 'EFICIENCIA_OPERACIONAL';

  const hipoteses: Record<ArenaTipo, string> = {
    EFICIENCIA_OPERACIONAL: 'Automatizar as etapas repetitivas com IA e regras de negócio, mantendo revisão humana nos casos de exceção.',
    NEGOCIOS_DIGITAIS: 'Criar uma jornada digital de autoatendimento integrada aos sistemas existentes, medindo conversão e satisfação.',
    SEGURANCA_INTEGRADA: 'Aplicar detecção de anomalias em tempo real com score de risco e resposta automatizada, sob supervisão do time de segurança.',
    A_DEFINIR: 'Mapear o processo atual com a área demandante para definir a hipótese de solução mais adequada.',
  };

  return {
    arena,
    hipoteseSolucao: hipoteses[arena],
    trlInicial: arena === 'A_DEFINIR' ? 1 : 2,
    potencialLeiDoBem: arena !== 'A_DEFINIR',
    radar: { negocio: arena === 'A_DEFINIR' ? 1.5 : 2.5, produto: 1.5, time: 2, receita: arena === 'NEGOCIOS_DIGITAIS' ? 2 : 1 },
    observacoes: 'Sugestões geradas a partir do título e da descrição. Revise antes de confirmar; a triagem será feita pelo Analista.',
  };
}

// ---------------- Campanhas ----------------

const comTotal = (c: Campanha): Campanha => ({ ...c, totalDemandas: db.projetos.filter((p) => p.campanha?.id === c.id).length });

export async function listarCampanhas(): Promise<Campanha[]> {
  usuarioAtual();
  await espera(200);
  return [...db.campanhas].sort((a, b) => (a.status === b.status ? b.inicio.localeCompare(a.inicio) : a.status === 'ABERTA' ? -1 : 1)).map(comTotal);
}

export async function criarCampanha(req: CampanhaRequest): Promise<Campanha> {
  const u = exigirPerfil('ANALISTA');
  await espera(400);
  if (req.titulo.trim().length < 5) throw invalido('Informe o título da campanha.');
  if (!req.inicio || !req.fim || req.fim < req.inicio) throw invalido('Revise o período da campanha.');
  const c: Campanha = { id: novoId(), ...req, titulo: req.titulo.trim(), status: 'ABERTA', criadaPor: resumo(u) };
  db.campanhas.push(c);
  salvar();
  return comTotal(c);
}

export async function encerrarCampanha(id: number) {
  exigirPerfil('ANALISTA');
  await espera(300);
  const c = db.campanhas.find((x) => x.id === id);
  if (!c) throw new ApiError(404, 'NAO_ENCONTRADO', 'Campanha não encontrada.');
  c.status = 'ENCERRADA';
  salvar();
}

// ---------------- Projetos ----------------

export async function criarProjeto(req: CriarProjetoRequest): Promise<Projeto> {
  const u = exigirPerfil('DEMANDANTE');
  await espera(500);
  if (req.descricaoDor.trim().length < 15) throw invalido('Revise os campos destacados.', { descricaoDor: 'Descreva com pelo menos 15 caracteres.' });
  let campanha = null;
  if (req.origem === 'INDUZIDA') {
    const c = db.campanhas.find((x) => x.id === req.campanhaId);
    if (!c) throw invalido('Selecione a campanha de origem.', { campanhaId: 'Obrigatória para demandas induzidas.' });
    if (c.status !== 'ABERTA') throw invalido('Esta campanha já foi encerrada.');
    campanha = { id: c.id, titulo: c.titulo, tipo: c.tipo };
  }
  const id = novoId();
  const p: ProjetoDb = {
    id,
    titulo: req.titulo.trim(),
    descricaoDor: req.descricaoDor.trim(),
    natureza: req.natureza,
    origem: req.origem,
    campanha,
    areaDemandanteId: req.areaDemandanteId,
    demandante: resumo(u),
    analistaResponsavel: null,
    arena: req.arena,
    hipoteseSolucao: req.hipoteseSolucao,
    potencialLeiDoBem: req.potencialLeiDoBem,
    etapa: 'BACKLOG',
    trlAtual: req.trlInicial,
    dispendioEstimado: null,
    aguardandoComplemento: false,
    criadoEm: agora(),
    atualizadoEm: agora(),
  };
  db.projetos.unshift(p);
  db.radar.push({ id: novoId(), projetoId: id, tipoLeitura: 'INICIAL', scoreNegocio: req.radar.negocio, scoreProduto: req.radar.produto, scoreTime: req.radar.time, scoreReceita: req.radar.receita, dataAvaliacao: agora() });
  salvar();
  return enriquecer(p);
}

export async function listarProjetos(f: FiltroPortfolio = {}): Promise<Pagina<Projeto>> {
  usuarioAtual();
  await espera(220);
  const busca = (f.busca ?? '').trim().toLowerCase();
  let itens = db.projetos.filter(
    (p) =>
      (!busca || p.titulo.toLowerCase().includes(busca) || p.descricaoDor.toLowerCase().includes(busca)) &&
      (!f.arena || p.arena === f.arena) &&
      (!f.etapa || p.etapa === f.etapa) &&
      (!f.origem || p.origem === f.origem) &&
      (!f.campanhaId || p.campanha?.id === f.campanhaId),
  );
  itens = [...itens].sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
  const total = itens.length;
  const tamanho = f.tamanho ?? 1000;
  const pagina = f.pagina ?? 0;
  return { itens: itens.slice(pagina * tamanho, pagina * tamanho + tamanho).map(enriquecer), total, pagina, tamanho };
}

const comTitulo = <T extends { projetoId: number }>(x: T): T & { projetoTitulo?: string } => ({
  ...x,
  projetoTitulo: db.projetos.find((p) => p.id === x.projetoId)?.titulo,
});

export async function obterProjeto(id: number): Promise<ProjetoDetalhe> {
  usuarioAtual();
  await espera(250);
  const p = projetoOu404(id);
  const desc = <T>(arr: T[], k: keyof T) => [...arr].sort((a, b) => String(b[k]).localeCompare(String(a[k])));
  return {
    ...enriquecer(p),
    qualificacoes: desc(db.qualificacoes.filter((x) => x.projetoId === id), 'criadaEm'),
    consultas: desc(db.consultas.filter((x) => x.projetoId === id), 'criadaEm'),
    registrosMaturidade: desc(db.maturidade.filter((x) => x.projetoId === id), 'criadoEm'),
    avaliacoesRadar: db.radar.filter((r) => r.projetoId === id).sort((a, b) => a.dataAvaliacao.localeCompare(b.dataAvaliacao)),
    entregas: desc(db.entregas.filter((x) => x.projetoId === id), 'registradaEm'),
    pautas: desc(db.pautas.filter((x) => x.projetoId === id), 'criadaEm'),
    decisoes: desc(db.decisoes.filter((x) => x.projetoId === id), 'dataDecisao'),
    evidencias: db.evidencias.filter((e) => e.projetoId === id),
    historicoTransicoes: desc(db.historico.filter((x) => x.projetoId === id), 'dataMudanca'),
    interacoes: db.interacoes.filter((x) => x.projetoId === id).sort((a, b) => a.criadaEm.localeCompare(b.criadaEm)),
  };
}

// Demandante complementa a demanda devolvida na triagem
export async function complementarDemanda(id: number, dados: { descricaoDor: string; complemento: string }) {
  const u = exigirPerfil('DEMANDANTE');
  await espera(400);
  const p = projetoOu404(id);
  if (p.demandante?.id !== u.id) throw negar('Somente o demandante da demanda pode complementá-la.');
  if (!p.aguardandoComplemento) throw transicao('Esta demanda não está aguardando complemento.');
  if (dados.descricaoDor.trim().length < 15) throw invalido('Descreva a demanda com pelo menos 15 caracteres.');
  p.descricaoDor = dados.descricaoDor.trim() + (dados.complemento.trim() ? `\n\nComplemento: ${dados.complemento.trim()}` : '');
  p.aguardandoComplemento = false;
  p.atualizadoEm = agora();
  salvar();
}

// ---------------- Participação ----------------

export async function comentar(projetoId: number, texto: string): Promise<Interacao> {
  const u = usuarioAtual();
  await espera(250);
  const p = projetoOu404(projetoId);
  if (u.perfil === 'DEMANDANTE' && p.demandante?.id !== u.id) throw negar('Somente o demandante dono do problema participa desta conversa.');
  if (texto.trim().length < 2) throw invalido('Escreva a mensagem.');
  const i: Interacao = { id: novoId(), projetoId, autor: resumo(u), perfil: u.perfil, texto: texto.trim(), criadaEm: agora() };
  db.interacoes.push(i);
  p.atualizadoEm = agora();
  salvar();
  return i;
}

// ---------------- Triagem e qualificação (Analista) ----------------

export async function assumirTriagem(id: number) {
  const u = exigirPerfil('ANALISTA');
  await espera(350);
  const p = projetoOu404(id);
  if (p.etapa !== 'BACKLOG') throw transicao('Somente demandas no backlog podem ter a triagem iniciada.');
  if (p.aguardandoComplemento) throw transicao('A demanda aguarda complemento do demandante.');
  p.analistaResponsavel = resumo(u);
  mudarEtapa(p, 'QUALIFICACAO', u, 'Triagem iniciada');
  salvar();
}

export async function registrarQualificacao(id: number, req: QualificacaoRequest) {
  const u = exigirPerfil('ANALISTA');
  await espera(500);
  const p = projetoOu404(id);
  exigirResponsavel(p, u);
  if (p.etapa !== 'QUALIFICACAO') throw transicao('A demanda precisa estar em qualificação.');
  const notas = [req.aderenciaTese, req.relevancia, req.grauInovacao, req.viabilidade];
  if (notas.some((n) => !Number.isInteger(n) || n < 1 || n > 5)) throw invalido('Avalie todos os critérios de 1 a 5.');
  if (req.parecer.trim().length < 20) throw invalido('Escreva o parecer da qualificação (mínimo de 20 caracteres).');

  db.qualificacoes.push({ id: novoId(), projetoId: id, analista: resumo(u), ...req, parecer: req.parecer.trim(), criadaEm: agora() });
  p.analistaResponsavel ??= resumo(u);
  mudarTrl(p, req.trlAvaliado, u, 'Avaliado na qualificação');
  if (req.dispendioEstimado !== undefined) p.dispendioEstimado = req.dispendioEstimado;

  switch (req.recomendacao) {
    case 'ENCAMINHAR_GOVERNANCA':
      mudarEtapa(p, 'GOVERNANCA', u, 'Encaminhada à governança');
      db.pautas.push({ id: novoId(), projetoId: id, encaminhadaPor: resumo(u), motivo: req.parecer.trim(), etapaAtual: 'GOVERNANCA', etapaProposta: 'EXPERIMENTACAO', status: 'PENDENTE', decisaoId: null, criadaEm: agora() });
      break;
    case 'INICIAR_EXPERIMENTACAO':
      mudarEtapa(p, 'EXPERIMENTACAO', u, 'Qualificação dentro da alçada da equipe');
      break;
    case 'DEVOLVER_DEMANDANTE':
      p.aguardandoComplemento = true;
      mudarEtapa(p, 'BACKLOG', u, 'Devolvida ao demandante para complemento');
      break;
    case 'ARQUIVAR':
      mudarEtapa(p, 'ARQUIVADO', u, 'Arquivada na qualificação');
      break;
  }
  salvar();
}

export async function arquivar(id: number, motivo: string) {
  const u = exigirPerfil('ANALISTA');
  await espera(300);
  const p = projetoOu404(id);
  exigirResponsavel(p, u);
  if (!['BACKLOG', 'QUALIFICACAO'].includes(p.etapa)) throw transicao('Só é possível arquivar demandas no backlog ou em qualificação.');
  if (motivo.trim().length < 10) throw invalido('Informe o motivo do arquivamento.');
  mudarEtapa(p, 'ARQUIVADO', u, motivo.trim());
  salvar();
}

// ---------------- Pareceres de especialistas ----------------

export async function consultarEspecialista(projetoId: number, req: ConsultaRequest): Promise<ConsultaEspecialista> {
  const u = exigirPerfil('ANALISTA');
  await espera(400);
  const p = projetoOu404(projetoId);
  exigirResponsavel(p, u);
  exigirAtivo(p);
  const daArea = db.usuarios.filter((x) => x.perfil === 'ESPECIALISTA' && x.ativo && x.areaTecnica === req.areaTecnica);
  if (!daArea.length) throw invalido('Selecione uma área técnica com especialistas cadastrados.');
  const esp = req.especialistaId ? daArea.find((x) => x.id === req.especialistaId) : null;
  if (req.especialistaId && !esp) throw invalido('O especialista escolhido não pertence a esta área.');
  if (req.pergunta.trim().length < 15) throw invalido('Descreva o que precisa ser avaliado.');
  const c: ConsultaEspecialista = {
    id: novoId(),
    projetoId,
    solicitante: resumo(u),
    especialista: esp ? resumo(esp) : null,
    areaTecnica: req.areaTecnica,
    pergunta: req.pergunta.trim(),
    status: 'PENDENTE',
    parecer: null,
    recomendacao: null,
    trlSugerido: null,
    criadaEm: agora(),
    respondidaEm: null,
  };
  db.consultas.push(c);
  salvar();
  return c;
}

export async function listarMinhasConsultas(): Promise<ConsultaEspecialista[]> {
  const u = exigirPerfil('ESPECIALISTA');
  await espera(220);
  return db.consultas
    .filter((c) => (c.especialista ? c.especialista.id === u.id : c.areaTecnica === u.areaTecnica))
    .sort((a, b) => (a.status === b.status ? b.criadaEm.localeCompare(a.criadaEm) : a.status === 'PENDENTE' ? -1 : 1))
    .map(comTitulo);
}

export async function responderConsulta(id: number, req: RespostaConsultaRequest) {
  const u = exigirPerfil('ESPECIALISTA');
  await espera(450);
  const c = db.consultas.find((x) => x.id === id);
  if (!c) throw new ApiError(404, 'NAO_ENCONTRADO', 'Consulta não encontrada.');
  if (!podeResponderConsulta(c, u)) throw negar('Esta consulta foi direcionada a outro especialista ou área.');
  if (c.status !== 'PENDENTE') throw new ApiError(409, 'CONSULTA_RESPONDIDA', 'Esta consulta já foi respondida.');
  if (req.parecer.trim().length < 20) throw invalido('Escreva o parecer técnico (mínimo de 20 caracteres).');
  Object.assign(c, { especialista: resumo(u), parecer: req.parecer.trim(), recomendacao: req.recomendacao, trlSugerido: req.trlSugerido, status: 'RESPONDIDA', respondidaEm: agora() });
  salvar();
}

// ---------------- Maturidade (TRL por evidências) ----------------

export async function registrarMaturidade(projetoId: number, req: MaturidadeRequest) {
  const u = exigirPerfil('ANALISTA');
  await espera(550);
  const p = projetoOu404(projetoId);
  exigirResponsavel(p, u);
  exigirAtivo(p);
  if (p.etapa === 'BACKLOG') throw transicao('Inicie a triagem antes de atualizar a maturidade.');
  if (!Number.isInteger(req.trlNovo) || req.trlNovo < 1 || req.trlNovo > 9) throw invalido('O TRL deve ser um inteiro entre 1 e 9.');
  if (req.trlNovo === p.trlAtual && !req.radar) throw invalido('Informe um TRL diferente do atual ou uma nova leitura do radar.');
  if (req.justificativa.trim().length < 20) throw invalido('Descreva os resultados que fundamentam a atualização.');
  if (!req.arquivos.length) throw invalido('Anexe ao menos uma evidência.');

  const id = novoId();
  let radarId: number | null = null;
  if (req.radar) {
    radarId = novoId();
    db.radar.push({ id: radarId, projetoId, tipoLeitura: 'ATUAL', scoreNegocio: req.radar.negocio, scoreProduto: req.radar.produto, scoreTime: req.radar.time, scoreReceita: req.radar.receita, dataAvaliacao: agora() });
  }
  const evidencias = salvarArquivos(projetoId, req.arquivos, u, { tipo: 'MATURIDADE', id });
  db.maturidade.push({ id, projetoId, responsavel: resumo(u), trlAnterior: p.trlAtual, trlNovo: req.trlNovo, justificativa: req.justificativa.trim(), evidencias, radarId, criadoEm: agora() });
  mudarTrl(p, req.trlNovo, u, 'Atualização de maturidade');
  p.atualizadoEm = agora();
  salvar();
}

// ---------------- Entregas e validação do demandante ----------------

export async function registrarEntrega(projetoId: number, req: EntregaRequest) {
  const u = exigirPerfil('ANALISTA');
  await espera(450);
  const p = projetoOu404(projetoId);
  exigirResponsavel(p, u);
  if (!['EXPERIMENTACAO', 'MVP'].includes(p.etapa)) throw transicao('Entregas são registradas durante a experimentação ou o MVP.');
  if (req.titulo.trim().length < 5 || req.descricao.trim().length < 15) throw invalido('Descreva a entrega.');
  const id = novoId();
  const evidencias = salvarArquivos(projetoId, req.arquivos, u, { tipo: 'ENTREGA', id });
  db.entregas.push({ id, projetoId, etapa: p.etapa, titulo: req.titulo.trim(), descricao: req.descricao.trim(), registradaPor: resumo(u), registradaEm: agora(), status: 'AGUARDANDO_VALIDACAO', validadaPor: null, comentarioValidacao: null, validadaEm: null, evidencias });
  p.atualizadoEm = agora();
  salvar();
}

export async function validarEntrega(id: number, req: ValidacaoEntregaRequest) {
  const u = exigirPerfil('DEMANDANTE');
  await espera(400);
  const e = db.entregas.find((x) => x.id === id);
  if (!e) throw new ApiError(404, 'NAO_ENCONTRADO', 'Entrega não encontrada.');
  const p = projetoOu404(e.projetoId);
  if (p.demandante?.id !== u.id) throw negar('Somente o demandante dono do problema valida as entregas.');
  if (e.status !== 'AGUARDANDO_VALIDACAO') throw new ApiError(409, 'ENTREGA_VALIDADA', 'Esta entrega já foi avaliada.');
  if (req.comentario.trim().length < 10) throw invalido('Comente a validação.');
  Object.assign(e, { status: req.resultado, validadaPor: resumo(u), comentarioValidacao: req.comentario.trim(), validadaEm: agora() });
  p.atualizadoEm = agora();
  salvar();
}

export async function entregasParaValidar(): Promise<Entrega[]> {
  const u = exigirPerfil('DEMANDANTE');
  await espera(200);
  const meus = new Set(db.projetos.filter((p) => p.demandante?.id === u.id).map((p) => p.id));
  return db.entregas.filter((e) => meus.has(e.projetoId) && e.status === 'AGUARDANDO_VALIDACAO').map(comTitulo);
}

// ---------------- Marcos da jornada ----------------

// O Analista registra os marcos operacionais. Decisões de priorização ficam com a governança.
export async function avancarMarco(projetoId: number, req: MarcoRequest) {
  const u = exigirPerfil('ANALISTA');
  await espera(400);
  const p = projetoOu404(projetoId);
  exigirResponsavel(p, u);
  if (db.pautas.some((x) => x.projetoId === projetoId && x.status === 'PENDENTE')) throw transicao('Há uma pauta pendente na governança para este projeto.');
  if (req.motivo.trim().length < 10) throw invalido('Descreva o marco atingido.');
  const permitido = (p.etapa === 'EXPERIMENTACAO' && req.etapaNova === 'MVP') || (p.etapa === 'MVP' && req.etapaNova === 'CONCLUIDO');
  if (!permitido) throw transicao(`Não é possível ir de ${ETAPA_LABEL[p.etapa]} para ${ETAPA_LABEL[req.etapaNova]}.`);
  if (req.etapaNova === 'CONCLUIDO' && !db.entregas.some((e) => e.projetoId === projetoId && e.etapa === 'MVP' && e.status === 'VALIDADA'))
    throw transicao('Para concluir, o demandante precisa validar ao menos uma entrega do MVP.');
  mudarEtapa(p, req.etapaNova, u, req.motivo.trim());
  salvar();
}

export async function encaminharGovernanca(projetoId: number, req: PautaRequest) {
  const u = exigirPerfil('ANALISTA');
  await espera(400);
  const p = projetoOu404(projetoId);
  exigirResponsavel(p, u);
  exigirAtivo(p);
  if (!['EXPERIMENTACAO', 'MVP'].includes(p.etapa)) throw transicao('Use a qualificação para encaminhar demandas novas à governança.');
  if (db.pautas.some((x) => x.projetoId === projetoId && x.status === 'PENDENTE')) throw new ApiError(409, 'PAUTA_PENDENTE', 'Já existe uma pauta pendente para este projeto.');
  if (req.motivo.trim().length < 15) throw invalido('Explique o que precisa ser decidido.');
  db.pautas.push({ id: novoId(), projetoId, encaminhadaPor: resumo(u), motivo: req.motivo.trim(), etapaAtual: p.etapa, etapaProposta: req.etapaProposta, status: 'PENDENTE', decisaoId: null, criadaEm: agora() });
  salvar();
}

// ---------------- Governança ----------------

export async function listarPautas(): Promise<PautaGovernanca[]> {
  usuarioAtual();
  await espera(220);
  return db.pautas.filter((x) => x.status === 'PENDENTE').sort((a, b) => a.criadaEm.localeCompare(b.criadaEm)).map(comTitulo);
}

export async function decisoesRecentes() {
  usuarioAtual();
  await espera(150);
  return [...db.decisoes].sort((a, b) => b.dataDecisao.localeCompare(a.dataDecisao)).slice(0, 8).map(comTitulo);
}

function aplicarDecisao(p: ProjetoDb, u: Usuario, req: DecisaoRequest, pauta: PautaGovernanca | null) {
  if (req.justificativa.trim().length < 10) throw invalido('A justificativa é obrigatória.');
  if (req.decisao === 'PIVOTADO' && (req.novaHipotese?.trim().length ?? 0) < 10) throw invalido('Descreva a nova hipótese de solução.');
  const decisaoId = novoId();

  if (req.decisao === 'APROVADO') {
    if (pauta?.etapaProposta) mudarEtapa(p, pauta.etapaProposta, u, 'Decisão de governança');
  } else if (req.decisao === 'PIVOTADO') {
    db.historico.push({ id: novoId(), projetoId: p.id, usuario: resumo(u), tipoMudanca: 'HIPOTESE', valorAnterior: p.hipoteseSolucao, valorNovo: req.novaHipotese!.trim(), motivo: 'Pivotamento', dataMudanca: agora() });
    p.hipoteseSolucao = req.novaHipotese!.trim();
    // Pivotar na priorização inicial devolve a demanda para requalificação; nas demais etapas, mantém a etapa
    if (p.etapa === 'GOVERNANCA') mudarEtapa(p, 'QUALIFICACAO', u, 'Pivotada para requalificação');
  } else {
    mudarEtapa(p, 'DESCONTINUADO', u, 'Decisão de governança');
  }

  db.decisoes.push({ id: decisaoId, projetoId: p.id, pautaId: pauta?.id ?? null, responsavel: resumo(u), decisao: req.decisao, justificativa: req.justificativa.trim(), novaHipotese: req.novaHipotese?.trim() || null, dataDecisao: agora() });
  // Qualquer pauta pendente do projeto é encerrada pela decisão
  for (const x of db.pautas.filter((x) => x.projetoId === p.id && x.status === 'PENDENTE')) {
    x.status = 'DECIDIDA';
    x.decisaoId = decisaoId;
  }
  p.atualizadoEm = agora();
}

export async function decidirPauta(pautaId: number, req: DecisaoRequest) {
  const u = exigirAlcada();
  await espera(500);
  const pauta = db.pautas.find((x) => x.id === pautaId);
  if (!pauta) throw new ApiError(404, 'NAO_ENCONTRADO', 'Pauta não encontrada.');
  if (pauta.status !== 'PENDENTE') throw new ApiError(409, 'PAUTA_DECIDIDA', 'Esta pauta já foi decidida por outra pessoa.');
  const p = projetoOu404(pauta.projetoId);
  if (p.etapa !== pauta.etapaAtual) throw new ApiError(409, 'CONFLITO_ATUALIZACAO', 'O projeto mudou desde o encaminhamento. Recarregue e avalie novamente.');
  aplicarDecisao(p, u, req, pauta);
  salvar();
}

// Pivotar ou descontinuar a qualquer momento, sem pauta prévia
export async function deliberar(projetoId: number, req: DecisaoRequest) {
  const u = exigirAlcada();
  await espera(450);
  const p = projetoOu404(projetoId);
  exigirAtivo(p);
  if (req.decisao === 'APROVADO') throw invalido('Aprovações são feitas sobre uma pauta encaminhada.');
  aplicarDecisao(p, u, req, null);
  salvar();
}

// ---------------- Dashboard ----------------

export async function metricas(): Promise<MetricasDashboard> {
  const u = usuarioAtual();
  await espera(250);
  const ps = db.projetos;
  const porArena = Object.fromEntries(ARENAS.map((a) => [a, ps.filter((p) => p.arena === a).length])) as MetricasDashboard['porArena'];
  const porEtapa = Object.fromEntries(TODAS_ETAPAS.map((s) => [s, ps.filter((p) => p.etapa === s).length])) as MetricasDashboard['porEtapa'];
  const media = (vals: number[]) => (vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0);
  const vivos = ps.filter((p) => !ETAPAS_ENCERRADAS.includes(p.etapa));
  const iniciais = db.radar.filter((r) => r.tipoLeitura === 'INICIAL');
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
  const comValor = vivos.filter((p) => p.dispendioEstimado != null);

  return {
    totalProjetos: ps.length,
    ativos: ps.filter((p) => !ETAPAS_TERMINAIS.includes(p.etapa)).length,
    trlMedio: media(vivos.map((p) => p.trlAtual)),
    potencialLeiDoBem: ps.filter((p) => p.potencialLeiDoBem).length,
    porArena,
    porEtapa,
    porOrigem: { ESPONTANEA: ps.filter((p) => p.origem === 'ESPONTANEA').length, INDUZIDA: ps.filter((p) => p.origem === 'INDUZIDA').length },
    campanhasAbertas: db.campanhas.filter((c) => c.status === 'ABERTA').length,
    aguardandoTriagem: ps.filter((p) => p.etapa === 'BACKLOG' && !p.aguardandoComplemento).length,
    pareceresPendentes: db.consultas.filter((c) => c.status === 'PENDENTE').length,
    pautasPendentes: db.pautas.filter((x) => x.status === 'PENDENTE').length,
    entregasAguardandoValidacao: db.entregas.filter((e) => e.status === 'AGUARDANDO_VALIDACAO').length,
    dispendioTotal: veFinanceiro(u) && comValor.length ? comValor.reduce((a, p) => a + (p.dispendioEstimado ?? 0), 0) : null,
    radarMedioInicial: radarMedio(iniciais),
    radarMedioAtual: radarMedio(atuais),
  };
}
