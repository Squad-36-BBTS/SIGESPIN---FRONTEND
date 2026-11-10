// Simula as regras de negócio (revisão 3) até o back-end expor as rotas.
// Persistido no localStorage para que as ações sobrevivam ao recarregar a página.
// Para simular falha de upload, anexe um arquivo com "#falha" no nome.
import { ApiError } from '@/types/api';
import type {
  AnaliseIaRequest,
  AnaliseIaResponse,
  ArenaTipo,
  AvaliacaoTrlRequest,
  Campanha,
  ConfiguracaoKanban,
  ConsultaEspecialista,
  ConsultaRequest,
  CriarProjetoRequest,
  DecisaoRequest,
  EntregaRequest,
  EstadoTarefa,
  EtapaKanban,
  EtapaResumo,
  Evidencia,
  FiltroDashboard,
  FiltroPortfolio,
  Interacao,
  MetricasDashboard,
  MinhaFila,
  MovimentacaoRequest,
  Pagina,
  ParecerRequest,
  Projeto,
  ProjetoDetalhe,
  QualificacaoRequest,
  SolicitacaoAcessoRequest,
  TransicaoKanban,
  Usuario,
  UsuarioResumo,
  ValidacaoRequest,
} from '@/types/domain';
import { ARENAS, areaNome, podeResponderConsulta } from '@/utils/constants';
import { noProjeto, porPerfil, type AcaoId } from '@/utils/permissoes';

import { USUARIO_KEY } from '../api';
import { criarSeed, SENHA_DEMO, type MockDb, type ProjetoDb } from './seed';

const DB_KEY = '@SIGES_PIN:mockdb:v4';

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

const negar = (msg: string) => new ApiError(403, 'ACESSO_NEGADO', msg);
const invalido = (msg: string, detalhes?: Record<string, string>) => new ApiError(422, 'VALIDACAO_FALHOU', msg, detalhes);
const conflito = (msg = 'O projeto foi alterado por outra pessoa. Recarregue os dados antes de tentar novamente.') =>
  new ApiError(409, 'CONFLITO_ATUALIZACAO', msg);

// Mesma matriz usada na interface (utils/permissoes.ts): o "back-end" confere de novo
function exigir(acao: AcaoId, p?: ProjetoDb) {
  const u = usuarioAtual();
  const perm = p ? noProjeto(acao, u, enriquecer(p), { solicitacaoPendente: temSolicitacaoPendente(p.id) }) : porPerfil(acao, u);
  if (!perm.permitido) throw negar(perm.motivo ?? 'Sem permissão.');
  return u;
}

function projetoOu404(id: number) {
  const p = db.projetos.find((x) => x.id === id);
  if (!p) throw new ApiError(404, 'NAO_ENCONTRADO', 'Projeto não encontrado.');
  return p;
}

function etapaResumo(id: number): EtapaResumo {
  const e = db.etapas.find((x) => x.id === id);
  return e ? { id: e.id, nome: e.nome, cor: e.cor, terminal: e.terminal } : { id, nome: `Etapa #${id}`, cor: '#94A3B8', terminal: false };
}

const temSolicitacaoPendente = (projetoId: number) => db.solicitacoes.some((s) => s.projetoId === projetoId && s.status === 'PENDENTE');

function pendencias(p: ProjetoDb): EstadoTarefa[] {
  const r: EstadoTarefa[] = [];
  const terminal = etapaResumo(p.etapaId).terminal;
  // Aguarda triagem enquanto nenhum Analista conduz a iniciativa (a primeira qualificação define quem conduz)
  if (!terminal && !p.analistaId && !db.qualificacoes.some((q) => q.projetoId === p.id)) r.push('AGUARDANDO_TRIAGEM');
  if (db.consultas.some((c) => c.projetoId === p.id && c.status === 'PENDENTE')) r.push('AGUARDANDO_PARECER');
  if (temSolicitacaoPendente(p.id)) r.push('AGUARDANDO_GOVERNANCA');
  if (db.entregas.some((e) => e.projetoId === p.id && !e.validacao)) r.push('AGUARDANDO_VALIDACAO');
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
    contexto: p.contexto,
    natureza: p.natureza,
    origem: p.origem,
    campanha: c ? { id: c.id, titulo: c.titulo, tipo: c.tipo } : null,
    areaDemandanteId: p.areaDemandanteId,
    areaDemandanteNome: areaNome(p.areaDemandanteId),
    demandante: dem ? resumo(dem) : null,
    analistaResponsavel: ana ? resumo(ana) : null,
    arena: p.arena,
    hipoteseSolucao: p.hipoteseSolucao,
    potencialLeiDoBem: p.potencialLeiDoBem,
    etapa: etapaResumo(p.etapaId),
    trlAtual: p.trlAtual,
    pendencias: pendencias(p),
    criadoEm: p.criadoEm,
    atualizadoEm: p.atualizadoEm,
  };
}

const EXTENSOES = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'json', 'csv', 'zip', 'txt'];

// Envio de arquivos (simulado). Tudo ou nada: se um falhar, nenhum registro é criado.
function enviarArquivos(projetoId: number, arquivos: File[], u: Usuario, vinculo: Evidencia['vinculo']): Evidencia[] {
  for (const f of arquivos) {
    const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
    if (!EXTENSOES.includes(ext)) throw new ApiError(422, 'TIPO_INVALIDO', `O formato de ${f.name} não é aceito.`, { arquivo: f.name });
    if (f.size > 10 * 1024 * 1024) throw new ApiError(422, 'TAMANHO_INVALIDO', `${f.name} passa de 10 MB.`, { arquivo: f.name });
    if (f.name.includes('#falha')) throw new ApiError(502, 'UPLOAD_FALHOU', `Falha ao enviar ${f.name}. Nada foi registrado; tente de novo.`, { arquivo: f.name });
  }
  const evs: Evidencia[] = arquivos.map((f) => ({
    id: novoId(),
    projetoId,
    nomeArquivo: f.name,
    tipoArquivo: f.type || 'application/octet-stream',
    tamanhoBytes: f.size,
    dataUpload: agora(),
    enviadaPor: resumo(u),
    estadoEnvio: 'ENVIADO',
    vinculo,
  }));
  db.evidencias.push(...evs);
  return evs;
}

function registrarHistorico(p: ProjetoDb, u: Usuario, tipo: 'ETAPA' | 'TRL', de: string, para: string, motivo: string, solicitacaoId: number | null = null) {
  db.historico.push({ id: novoId(), projetoId: p.id, usuario: resumo(u), tipoMudanca: tipo, valorAnterior: de, valorNovo: para, motivo, solicitacaoId, dataMudanca: agora() });
  p.atualizadoEm = agora();
}

const comTitulo = <T extends { projetoId: number }>(x: T): T & { projetoTitulo?: string } => ({
  ...x,
  projetoTitulo: db.projetos.find((p) => p.id === x.projetoId)?.titulo,
});

// ---------------- Autenticação ----------------

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

export async function listarEspecialistas(): Promise<Usuario[]> {
  usuarioAtual();
  await espera(150);
  return db.usuarios.filter((x) => x.perfil === 'ESPECIALISTA' && x.ativo);
}

// ---------------- IA (simulada) ----------------

export async function analisarDemanda(req: AnaliseIaRequest): Promise<AnaliseIaResponse> {
  usuarioAtual();
  await espera(1300);
  const texto = `${req.titulo} ${req.descricaoDor}`.toLowerCase();
  if (texto.includes('#offline')) throw new ApiError(503, 'IA_INDISPONIVEL', 'O serviço de IA está indisponível no momento.');

  let arena: ArenaTipo = 'A_DEFINIR';
  if (/fraude|segur|golpe|ataque|invas|risco/.test(texto)) arena = 'SEGURANCA_INTEGRADA';
  else if (/cliente|digital|canal|app|venda|produto|receita/.test(texto)) arena = 'NEGOCIOS_DIGITAIS';
  else if (/manual|tempo|custo|retrabalho|processo|automat|eficien|energia/.test(texto)) arena = 'EFICIENCIA_OPERACIONAL';

  const hipoteses: Record<ArenaTipo, string> = {
    EFICIENCIA_OPERACIONAL: 'Automatizar as etapas repetitivas com IA e regras de negócio, mantendo revisão humana nos casos de exceção.',
    NEGOCIOS_DIGITAIS: 'Criar uma jornada digital de autoatendimento integrada aos sistemas existentes, medindo conversão e satisfação.',
    SEGURANCA_INTEGRADA: 'Aplicar detecção de anomalias em tempo real com score de risco, sob supervisão do time de segurança.',
    A_DEFINIR: 'Mapear o processo atual com a área demandante para definir a hipótese de solução mais adequada.',
  };

  return {
    arena,
    hipoteseSolucao: hipoteses[arena],
    trlInicial: arena === 'A_DEFINIR' ? 1 : 2,
    potencialLeiDoBem: arena !== 'A_DEFINIR',
    radar: { negocio: arena === 'A_DEFINIR' ? 1.5 : 2.5, produto: 1.5, time: 2, receita: arena === 'NEGOCIOS_DIGITAIS' ? 2 : 1 },
    observacoes: 'Sugestões simuladas a partir do título e da descrição. Revise e edite antes de enviar.',
  };
}

// ---------------- Ações de mobilização ----------------

export async function listarCampanhas(): Promise<Campanha[]> {
  usuarioAtual();
  await espera(200);
  return [...db.campanhas]
    .sort((a, b) => (a.status === b.status ? b.inicio.localeCompare(a.inicio) : a.status === 'ABERTA' ? -1 : 1))
    .map((c) => ({ ...c, totalDemandas: db.projetos.filter((p) => p.campanhaId === c.id).length }));
}

// ---------------- Configuração do Kanban ----------------

export async function obterConfiguracao(): Promise<ConfiguracaoKanban> {
  usuarioAtual();
  await espera(150);
  return { etapas: [...db.etapas].sort((a, b) => a.ordem - b.ordem), transicoes: [...db.transicoes] };
}

const emUso = (etapaId: number) => db.projetos.some((p) => p.etapaId === etapaId) || db.solicitacoes.some((s) => s.status === 'PENDENTE' && (s.origem.id === etapaId || s.destino.id === etapaId));

// Quem configura ainda está "a definir": o protótipo permite editar, sem tratar isso como regra
export async function salvarEtapa(dados: Pick<EtapaKanban, 'nome' | 'descricao' | 'cor' | 'terminal'> & { id?: number }) {
  usuarioAtual();
  await espera(250);
  if (dados.nome.trim().length < 2) throw invalido('Informe o nome da etapa.');
  if (db.etapas.some((e) => e.id !== dados.id && e.nome.toLowerCase() === dados.nome.trim().toLowerCase())) throw invalido('Já existe uma etapa com este nome.');
  if (dados.id) {
    const e = db.etapas.find((x) => x.id === dados.id);
    if (!e) throw new ApiError(404, 'NAO_ENCONTRADO', 'Etapa não encontrada.');
    if (e.terminal !== dados.terminal && emUso(e.id) && !dados.terminal && db.transicoes.some((t) => t.origemId === e.id))
      throw invalido('Revise as transições antes de mudar esta etapa.');
    Object.assign(e, { nome: dados.nome.trim(), descricao: dados.descricao.trim(), cor: dados.cor, terminal: dados.terminal });
  } else {
    const ordem = Math.max(0, ...db.etapas.map((e) => e.ordem)) + 1;
    db.etapas.push({ id: novoId(), nome: dados.nome.trim(), descricao: dados.descricao.trim(), cor: dados.cor, terminal: dados.terminal, ativa: true, ordem });
  }
  salvar();
}

export async function reordenarEtapa(id: number, direcao: -1 | 1) {
  usuarioAtual();
  await espera(120);
  const lista = [...db.etapas].sort((a, b) => a.ordem - b.ordem);
  const i = lista.findIndex((e) => e.id === id);
  const j = i + direcao;
  if (i < 0 || j < 0 || j >= lista.length) return;
  [lista[i].ordem, lista[j].ordem] = [lista[j].ordem, lista[i].ordem];
  salvar();
}

export async function alternarEtapa(id: number) {
  usuarioAtual();
  await espera(200);
  const e = db.etapas.find((x) => x.id === id);
  if (!e) throw new ApiError(404, 'NAO_ENCONTRADO', 'Etapa não encontrada.');
  if (e.ativa && emUso(id)) throw invalido('Esta etapa está em uso por projetos ou solicitações e não pode ser inativada.');
  e.ativa = !e.ativa;
  salvar();
}

export async function excluirEtapa(id: number) {
  usuarioAtual();
  await espera(200);
  if (emUso(id) || db.historico.some((h) => h.tipoMudanca === 'ETAPA' && (h.valorAnterior === etapaResumo(id).nome || h.valorNovo === etapaResumo(id).nome)))
    throw invalido('Esta etapa já foi usada e não pode ser removida. Inative-a, se não estiver em uso.');
  db.etapas = db.etapas.filter((e) => e.id !== id);
  db.transicoes = db.transicoes.filter((t) => t.origemId !== id && t.destinoId !== id);
  salvar();
}

export async function salvarTransicao(dados: Pick<TransicaoKanban, 'origemId' | 'destinoId' | 'exigeGovernanca'>) {
  usuarioAtual();
  await espera(200);
  if (dados.origemId === dados.destinoId) throw invalido('Origem e destino devem ser diferentes.');
  if (etapaResumo(dados.origemId).terminal) throw invalido('Etapas finais não têm transições de saída.');
  if (db.transicoes.some((t) => t.origemId === dados.origemId && t.destinoId === dados.destinoId)) throw invalido('Esta transição já existe.');
  db.transicoes.push({ id: novoId(), ...dados, ativa: true });
  salvar();
}

export async function atualizarTransicao(id: number, dados: Partial<Pick<TransicaoKanban, 'exigeGovernanca' | 'ativa'>>) {
  usuarioAtual();
  await espera(150);
  const t = db.transicoes.find((x) => x.id === id);
  if (!t) throw new ApiError(404, 'NAO_ENCONTRADO', 'Transição não encontrada.');
  if (dados.ativa === false && db.solicitacoes.some((s) => s.transicaoId === id && s.status === 'PENDENTE'))
    throw invalido('Há solicitação pendente usando esta transição.');
  Object.assign(t, dados);
  salvar();
}

// ---------------- Projetos ----------------

export async function criarProjeto(req: CriarProjetoRequest): Promise<Projeto> {
  const u = exigir('registrarDemanda');
  await espera(500);
  if (req.titulo.trim().length < 5) throw invalido('Revise os campos destacados.', { titulo: 'Informe um título.' });
  if (req.descricaoDor.trim().length < 15) throw invalido('Revise os campos destacados.', { descricaoDor: 'Descreva com pelo menos 15 caracteres.' });
  if (req.origem === 'INDUZIDA') {
    const c = db.campanhas.find((x) => x.id === req.campanhaId);
    if (!c) throw invalido('Selecione a ação de mobilização.', { campanhaId: 'Obrigatória para demandas induzidas.' });
    if (c.status !== 'ABERTA') throw invalido('Esta ação de mobilização já foi encerrada.');
  }
  const inicial = [...db.etapas].filter((e) => e.ativa && !e.terminal).sort((a, b) => a.ordem - b.ordem)[0];
  if (!inicial) throw invalido('Não há etapa inicial ativa configurada no Kanban.');
  const id = novoId();
  const p: ProjetoDb = {
    id,
    titulo: req.titulo.trim(),
    descricaoDor: req.descricaoDor.trim(),
    contexto: req.contexto.trim(),
    natureza: req.natureza,
    origem: req.origem,
    campanhaId: req.origem === 'INDUZIDA' ? req.campanhaId : null,
    areaDemandanteId: req.areaDemandanteId,
    demandanteId: u.id,
    analistaId: null,
    arena: req.arena,
    hipoteseSolucao: req.hipoteseSolucao,
    potencialLeiDoBem: req.potencialLeiDoBem,
    etapaId: inicial.id,
    trlAtual: req.trlInicial,
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
  await espera(200);
  const busca = (f.busca ?? '').trim().toLowerCase();
  let itens = db.projetos
    .filter(
      (p) =>
        (!busca || p.titulo.toLowerCase().includes(busca) || p.descricaoDor.toLowerCase().includes(busca)) &&
        (!f.arena || p.arena === f.arena) &&
        (!f.etapaId || p.etapaId === f.etapaId) &&
        (!f.origem || p.origem === f.origem) &&
        (!f.campanhaId || p.campanhaId === f.campanhaId),
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
  return {
    ...enriquecer(p),
    qualificacoes: desc(db.qualificacoes.filter((x) => x.projetoId === id), 'criadaEm'),
    consultas: desc(db.consultas.filter((x) => x.projetoId === id), 'criadaEm'),
    avaliacoesTrl: desc(db.avaliacoesTrl.filter((x) => x.projetoId === id), 'criadaEm'),
    avaliacoesRadar: db.radar.filter((r) => r.projetoId === id).sort((a, b) => a.dataAvaliacao.localeCompare(b.dataAvaliacao)),
    solicitacoes: desc(db.solicitacoes.filter((x) => x.projetoId === id), 'criadaEm'),
    entregas: desc(db.entregas.filter((x) => x.projetoId === id), 'registradaEm'),
    evidencias: db.evidencias.filter((e) => e.projetoId === id),
    historicoTransicoes: desc(db.historico.filter((x) => x.projetoId === id), 'dataMudanca'),
    interacoes: db.interacoes.filter((x) => x.projetoId === id).sort((a, b) => a.criadaEm.localeCompare(b.criadaEm)),
    transicoesDisponiveis: db.transicoes
      .filter((t) => t.ativa && t.origemId === p.etapaId && db.etapas.find((e) => e.id === t.destinoId)?.ativa)
      .map((t) => ({ ...t, destino: etapaResumo(t.destinoId) })),
  };
}

export async function comentar(projetoId: number, texto: string): Promise<Interacao> {
  const p = projetoOu404(projetoId);
  const u = exigir('comentar', p);
  await espera(250);
  if (texto.trim().length < 2) throw invalido('Escreva a mensagem.');
  const i: Interacao = { id: novoId(), projetoId, autor: resumo(u), perfil: u.perfil, texto: texto.trim(), criadaEm: agora() };
  db.interacoes.push(i);
  p.atualizadoEm = agora();
  salvar();
  return i;
}

// ---------------- Qualificação ----------------

export async function registrarQualificacao(id: number, req: QualificacaoRequest) {
  const p = projetoOu404(id);
  const u = exigir('qualificar', p);
  await espera(450);
  const textos = [req.aderenciaTese, req.relevancia, req.grauInovacao, req.viabilidade];
  if (textos.some((t) => t.trim().length < 5)) throw invalido('Preencha os quatro critérios.');
  if (req.conclusao.trim().length < 20) throw invalido('Escreva a fundamentação e a conclusão (mínimo de 20 caracteres).');
  db.qualificacoes.push({
    id: novoId(),
    projetoId: id,
    analista: resumo(u),
    aderenciaTese: req.aderenciaTese.trim(),
    relevancia: req.relevancia.trim(),
    grauInovacao: req.grauInovacao.trim(),
    viabilidade: req.viabilidade.trim(),
    trlAvaliado: req.trlAvaliado,
    conclusao: req.conclusao.trim(),
    criadaEm: agora(),
  });
  // A primeira qualificação define o analista que conduz a iniciativa
  p.analistaId ??= u.id;
  p.atualizadoEm = agora();
  salvar();
}

// ---------------- Consulta e parecer ----------------

export async function consultarEspecialista(projetoId: number, req: ConsultaRequest): Promise<ConsultaEspecialista> {
  const p = projetoOu404(projetoId);
  const u = exigir('consultarEspecialista', p);
  await espera(400);
  const daArea = db.usuarios.filter((x) => x.perfil === 'ESPECIALISTA' && x.ativo && x.areaTecnica === req.areaTecnica);
  if (!daArea.length) throw invalido('Selecione uma área técnica com especialistas cadastrados.');
  const esp = req.especialistaId ? daArea.find((x) => x.id === req.especialistaId) : null;
  if (req.especialistaId && !esp) throw invalido('O especialista escolhido não pertence a esta área.');
  if (req.pergunta.trim().length < 15) throw invalido('Escreva uma pergunta dirigida (mínimo de 15 caracteres).');
  const c: ConsultaEspecialista = {
    id: novoId(),
    projetoId,
    solicitante: resumo(u),
    especialista: esp ? resumo(esp) : null,
    areaTecnica: req.areaTecnica,
    pergunta: req.pergunta.trim(),
    status: 'PENDENTE',
    fundamentacao: null,
    conclusao: null,
    evidencias: [],
    criadaEm: agora(),
    respondidaEm: null,
  };
  db.consultas.push(c);
  p.atualizadoEm = agora();
  salvar();
  return c;
}

export async function responderConsulta(id: number, req: ParecerRequest) {
  const u = exigir('emitirParecer');
  await espera(450);
  const c = db.consultas.find((x) => x.id === id);
  if (!c) throw new ApiError(404, 'NAO_ENCONTRADO', 'Consulta não encontrada.');
  if (c.status !== 'PENDENTE') throw new ApiError(409, 'CONSULTA_RESPONDIDA', 'Esta consulta já foi respondida por outra pessoa.');
  if (!podeResponderConsulta(c, u)) throw negar('Esta consulta foi direcionada a outro especialista ou área.');
  if (req.fundamentacao.trim().length < 20 || req.conclusao.trim().length < 10) throw invalido('Preencha a fundamentação e a conclusão.');
  const evidencias = enviarArquivos(c.projetoId, req.arquivos, u, { tipo: 'PARECER', id: c.id });
  Object.assign(c, { especialista: resumo(u), fundamentacao: req.fundamentacao.trim(), conclusao: req.conclusao.trim(), evidencias, status: 'RESPONDIDA', respondidaEm: agora() });
  projetoOu404(c.projetoId).atualizadoEm = agora();
  salvar();
}

// ---------------- Avaliação de TRL ----------------

export async function registrarAvaliacaoTrl(projetoId: number, req: AvaliacaoTrlRequest) {
  const p = projetoOu404(projetoId);
  const u = exigir('avaliarTrl', p);
  await espera(500);
  if (!Number.isInteger(req.trlNovo) || req.trlNovo < 1 || req.trlNovo > 9) throw invalido('O TRL deve ser um inteiro entre 1 e 9.');
  const reducao = req.trlNovo < p.trlAtual;
  if (req.justificativa.trim().length < (reducao ? 40 : 20))
    throw invalido(reducao ? 'Uma redução de TRL exige fundamentação detalhada (mínimo de 40 caracteres).' : 'Descreva os resultados que fundamentam a avaliação.');
  if (!req.arquivos.length) throw invalido('Anexe ao menos uma evidência pertinente.');
  const id = novoId();
  const evidencias = enviarArquivos(projetoId, req.arquivos, u, { tipo: 'TRL', id });
  let radarId: number | null = null;
  if (req.radar) {
    radarId = novoId();
    db.radar.push({ id: radarId, projetoId, tipoLeitura: 'ATUAL', scoreNegocio: req.radar.negocio, scoreProduto: req.radar.produto, scoreTime: req.radar.time, scoreReceita: req.radar.receita, dataAvaliacao: agora() });
  }
  db.avaliacoesTrl.push({ id, projetoId, responsavel: resumo(u), trlAnterior: p.trlAtual, trlNovo: req.trlNovo, justificativa: req.justificativa.trim(), evidencias, radarId, criadaEm: agora() });
  if (req.trlNovo !== p.trlAtual) registrarHistorico(p, u, 'TRL', String(p.trlAtual), String(req.trlNovo), reducao ? 'Avaliação de TRL (redução)' : 'Avaliação de TRL');
  p.trlAtual = req.trlNovo;
  p.atualizadoEm = agora();
  salvar();
}

// ---------------- Movimentação do Kanban ----------------

// Sem governança: move na hora. Com governança: cria solicitação e o projeto fica na etapa atual.
export async function movimentar(projetoId: number, req: MovimentacaoRequest): Promise<{ resultado: 'MOVIDO' | 'SOLICITADO'; destino: string }> {
  const p = projetoOu404(projetoId);
  const t = db.transicoes.find((x) => x.id === req.transicaoId && x.ativa);
  if (!t) throw invalido('Esta transição não está disponível na configuração atual do Kanban.');
  if (t.origemId !== p.etapaId) throw conflito();
  const u = exigir(t.exigeGovernanca ? 'solicitarTransicao' : 'moverSemGovernanca', p);
  await espera(450);
  if (req.justificativa.trim().length < 15) throw invalido('Escreva a justificativa (mínimo de 15 caracteres).');
  const destino = etapaResumo(t.destinoId);
  if (t.exigeGovernanca) {
    if (!req.arquivos.length) throw invalido('Anexe as evidências que fundamentam a solicitação.');
    const id = novoId();
    const evidencias = enviarArquivos(projetoId, req.arquivos, u, { tipo: 'SOLICITACAO', id });
    db.solicitacoes.push({ id, projetoId, transicaoId: t.id, origem: etapaResumo(p.etapaId), destino, solicitante: resumo(u), justificativa: req.justificativa.trim(), evidencias, status: 'PENDENTE', decisor: null, justificativaDecisao: null, decididaEm: null, criadaEm: agora() });
    p.atualizadoEm = agora();
    salvar();
    return { resultado: 'SOLICITADO', destino: destino.nome };
  }
  enviarArquivos(projetoId, req.arquivos, u, { tipo: 'GERAL', id: null });
  registrarHistorico(p, u, 'ETAPA', etapaResumo(p.etapaId).nome, destino.nome, req.justificativa.trim());
  p.etapaId = t.destinoId;
  salvar();
  return { resultado: 'MOVIDO', destino: destino.nome };
}

export async function decidirSolicitacao(id: number, req: DecisaoRequest) {
  const u = exigir('decidirTransicao');
  await espera(500);
  const s = db.solicitacoes.find((x) => x.id === id);
  if (!s) throw new ApiError(404, 'NAO_ENCONTRADO', 'Solicitação não encontrada.');
  if (s.status !== 'PENDENTE') throw conflito('Esta solicitação já foi decidida por outra pessoa. Recarregue os dados.');
  if (req.justificativa.trim().length < 10) throw invalido('A justificativa da decisão é obrigatória.');
  const p = projetoOu404(s.projetoId);
  if (req.decisao === 'APROVADA') {
    if (p.etapaId !== s.origem.id) throw conflito();
    registrarHistorico(p, u, 'ETAPA', s.origem.nome, s.destino.nome, 'Solicitação aprovada', s.id);
    p.etapaId = s.destino.id;
  }
  Object.assign(s, { status: req.decisao, decisor: resumo(u), justificativaDecisao: req.justificativa.trim(), decididaEm: agora() });
  p.atualizadoEm = agora();
  salvar();
}

// ---------------- Entregas e validação ----------------

export async function registrarEntrega(projetoId: number, req: EntregaRequest) {
  const p = projetoOu404(projetoId);
  const u = exigir('submeterEntrega', p);
  await espera(450);
  if (req.titulo.trim().length < 5 || req.descricao.trim().length < 15) throw invalido('Informe o título e descreva a entrega.');
  const id = novoId();
  const evidencias = enviarArquivos(projetoId, req.arquivos, u, { tipo: 'ENTREGA', id });
  db.entregas.push({ id, projetoId, titulo: req.titulo.trim(), descricao: req.descricao.trim(), ehMvp: req.ehMvp, registradaPor: resumo(u), registradaEm: agora(), evidencias, validacao: null });
  p.atualizadoEm = agora();
  salvar();
}

// A validação não muda o TRL nem a etapa do Kanban
export async function validarEntrega(id: number, req: ValidacaoRequest) {
  const e = db.entregas.find((x) => x.id === id);
  if (!e) throw new ApiError(404, 'NAO_ENCONTRADO', 'Entrega não encontrada.');
  const p = projetoOu404(e.projetoId);
  const u = exigir('validarEntrega', p);
  await espera(400);
  if (e.validacao) throw conflito('Esta entrega já foi validada. Recarregue os dados.');
  if (req.observacoes.trim().length < (req.resultado === 'VALIDADA' ? 5 : 15))
    throw invalido(req.resultado === 'VALIDADA' ? 'Escreva as observações.' : 'Explique as ressalvas ou o motivo de não validar.');
  e.validacao = { resultado: req.resultado, observacoes: req.observacoes.trim(), por: resumo(u), em: agora() };
  p.atualizadoEm = agora();
  salvar();
}

// ---------------- Minha fila e dashboard ----------------

export async function minhaFila(): Promise<MinhaFila> {
  const u = usuarioAtual();
  await espera(250);
  const projetos = db.projetos.map(enriquecer);
  const recentes = (iso: string | null) => !!iso && Date.now() - new Date(iso).getTime() < 30 * 86400000;
  const meusProjetos = new Set(db.projetos.filter((p) => p.analistaId === u.id).map((p) => p.id));
  const doDemandante = new Set(db.projetos.filter((p) => p.demandanteId === u.id).map((p) => p.id));
  return {
    triagem: u.perfil === 'ANALISTA' ? projetos.filter((p) => p.pendencias.includes('AGUARDANDO_TRIAGEM')) : [],
    consultasPendentes: u.perfil === 'ESPECIALISTA' ? db.consultas.filter((c) => podeResponderConsulta(c, u)).map(comTitulo) : [],
    solicitacoesPendentes:
      u.perfil === 'ESPECIALISTA'
        ? db.solicitacoes.filter((s) => s.status === 'PENDENTE').sort((a, b) => a.criadaEm.localeCompare(b.criadaEm)).map(comTitulo)
        : u.perfil === 'ANALISTA'
          ? db.solicitacoes.filter((s) => s.status === 'PENDENTE' && s.solicitante.id === u.id).map(comTitulo)
          : [],
    solicitacoesDecididas: u.perfil === 'ANALISTA' ? db.solicitacoes.filter((s) => s.solicitante.id === u.id && s.status !== 'PENDENTE' && recentes(s.decididaEm)).map(comTitulo) : [],
    pareceresRecebidos: u.perfil === 'ANALISTA' ? db.consultas.filter((c) => c.solicitante.id === u.id && c.status === 'RESPONDIDA' && recentes(c.respondidaEm)).map(comTitulo) : [],
    entregasParaValidar: u.perfil === 'DEMANDANTE' ? db.entregas.filter((e) => doDemandante.has(e.projetoId) && !e.validacao).map(comTitulo) : [],
    entregasValidadas: u.perfil === 'ANALISTA' ? db.entregas.filter((e) => meusProjetos.has(e.projetoId) && e.validacao && recentes(e.validacao.em)).map(comTitulo) : [],
    minhasDemandas: u.perfil === 'DEMANDANTE' ? projetos.filter((p) => p.demandante?.id === u.id) : [],
  };
}

export async function metricas(f: FiltroDashboard = {}): Promise<MetricasDashboard> {
  usuarioAtual();
  await espera(250);
  const limite = f.periodoDias ? Date.now() - Number(f.periodoDias) * 86400000 : 0;
  const ps = db.projetos.filter(
    (p) => new Date(p.criadoEm).getTime() >= limite && (!f.etapaId || p.etapaId === f.etapaId) && (!f.origem || p.origem === f.origem),
  );
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
    trlMedio: media(ps.map((p) => p.trlAtual)),
    porEtapa: [...db.etapas].filter((e) => e.ativa).sort((a, b) => a.ordem - b.ordem).map((e) => ({ etapa: etapaResumo(e.id), total: ps.filter((p) => p.etapaId === e.id).length })),
    porOrigem: { ESPONTANEA: ps.filter((p) => p.origem === 'ESPONTANEA').length, INDUZIDA: ps.filter((p) => p.origem === 'INDUZIDA').length },
    porArena: Object.fromEntries(ARENAS.map((a) => [a, ps.filter((p) => p.arena === a).length])) as MetricasDashboard['porArena'],
    pendencias: { AGUARDANDO_TRIAGEM: conta('AGUARDANDO_TRIAGEM'), AGUARDANDO_PARECER: conta('AGUARDANDO_PARECER'), AGUARDANDO_GOVERNANCA: conta('AGUARDANDO_GOVERNANCA'), AGUARDANDO_VALIDACAO: conta('AGUARDANDO_VALIDACAO') },
    radarMedioInicial: radarMedio(iniciais),
    radarMedioAtual: radarMedio(atuais),
  };
}
