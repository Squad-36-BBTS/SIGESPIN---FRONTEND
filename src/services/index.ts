// Serviços do front-end (Fase 3). Usam o mock enquanto VITE_USE_MOCK=true e as rotas propostas
// quando o back-end estiver disponível. Os DTOs seguem os nomes de campo do guia da Fase 3;
// os caminhos das rotas ainda serão confirmados com o back-end.
import type {
  AnaliseIaRequest,
  AnaliseIaResponse,
  ArquivamentoRequest,
  AvaliacaoTrlRequest,
  Campanha,
  CancelamentoRequest,
  ConfiguracaoKanban,
  ConsultaEspecialista,
  ConsultaRequest,
  CorrecaoRequest,
  CriarProjetoRequest,
  DecisaoRequest,
  EdicaoEtapaRequest,
  EdicaoProjetoRequest,
  EdicaoTransicaoRequest,
  EntregaRequest,
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
  ValidacaoRequest,
} from '@/types/domain';

import { api, USE_MOCK } from './api';
import * as mock from './mock/mockServer';

export const authService = {
  async login(email: string, senha: string): Promise<{ token: string; usuario: Usuario }> {
    if (USE_MOCK) return mock.login(email, senha);
    return (await api.post('/auth/login', { email, senha })).data;
  },
  async logout(): Promise<void> {
    if (USE_MOCK) return;
    await api.post('/auth/logout').catch(() => undefined);
  },
  // Não existe autocadastro: a tela de cadastro envia um pedido de acesso (rota a confirmar com o back-end)
  async solicitarAcesso(dados: SolicitacaoAcessoRequest): Promise<void> {
    if (USE_MOCK) return mock.solicitarAcesso(dados);
    await api.post('/auth/solicitacoes-acesso', dados);
  },
};

export const usuarioService = {
  async listar(perfil?: PerfilUsuario): Promise<Usuario[]> {
    if (USE_MOCK) return mock.listarUsuarios(perfil);
    return (await api.get('/usuarios', { params: { perfil, ativo: true } })).data;
  },
};

export const iaService = {
  async analisarDemanda(req: AnaliseIaRequest): Promise<AnaliseIaResponse> {
    if (USE_MOCK) return mock.analisarDemanda(req);
    return (await api.post('/ia/analisar-demanda', req, { timeout: 30000 })).data;
  },
};

export const campanhaService = {
  async listar(): Promise<Campanha[]> {
    if (USE_MOCK) return mock.listarCampanhas();
    return (await api.get('/acoes-mobilizacao')).data;
  },
};

export const kanbanService = {
  async configuracao(): Promise<ConfiguracaoKanban> {
    if (USE_MOCK) return mock.obterConfiguracao();
    return (await api.get('/kanban/configuracao')).data;
  },
  async criarEtapa(req: NovaEtapaRequest): Promise<void> {
    if (USE_MOCK) return mock.criarEtapa(req);
    await api.post('/kanban/etapas', req);
  },
  async editarEtapa(id: number, req: EdicaoEtapaRequest): Promise<void> {
    if (USE_MOCK) return mock.editarEtapa(id, req);
    await api.put(`/kanban/etapas/${id}`, req);
  },
  async criarTransicao(req: NovaTransicaoRequest): Promise<void> {
    if (USE_MOCK) return mock.criarTransicao(req);
    await api.post('/kanban/transicoes', req);
  },
  async editarTransicao(id: number, req: EdicaoTransicaoRequest): Promise<void> {
    if (USE_MOCK) return mock.editarTransicao(id, req);
    await api.put(`/kanban/transicoes/${id}`, req);
  },
};

export const propostaService = {
  async listar(status: StatusGovernanca | '' = ''): Promise<PropostaConfiguracao[]> {
    if (USE_MOCK) return mock.listarPropostas(status);
    return (await api.get('/kanban/propostas', { params: { status: status || undefined } })).data;
  },
  async propor(req: PropostaRequest): Promise<PropostaConfiguracao> {
    if (USE_MOCK) return mock.proporConfiguracao(req);
    return (await api.post('/kanban/propostas', req)).data;
  },
  async decidir(id: number, req: DecisaoRequest): Promise<void> {
    if (USE_MOCK) return mock.decidirProposta(id, req);
    await api.post(`/kanban/propostas/${id}/decisao`, req);
  },
  async cancelar(id: number, req: CancelamentoRequest): Promise<void> {
    if (USE_MOCK) return mock.cancelarProposta(id, req);
    await api.post(`/kanban/propostas/${id}/cancelamento`, req);
  },
};

export const projetoService = {
  async listar(filtro: FiltroPortfolio = {}): Promise<Pagina<Projeto>> {
    if (USE_MOCK) return mock.listarProjetos(filtro);
    return (await api.get('/projetos', { params: filtro })).data;
  },
  async obter(id: number): Promise<ProjetoDetalhe> {
    if (USE_MOCK) return mock.obterProjeto(id);
    return (await api.get(`/projetos/${id}`)).data;
  },
  async criar(req: CriarProjetoRequest): Promise<Projeto> {
    if (USE_MOCK) return mock.criarProjeto(req);
    return (await api.post('/projetos', req)).data;
  },
  async comentar(id: number, texto: string): Promise<Interacao> {
    if (USE_MOCK) return mock.comentar(id, texto);
    return (await api.post(`/projetos/${id}/interacoes`, { texto })).data;
  },
  async qualificar(id: number, req: QualificacaoRequest): Promise<void> {
    if (USE_MOCK) return mock.registrarQualificacao(id, req);
    await api.post(`/projetos/${id}/qualificacoes`, req);
  },
  async avaliarTrl(id: number, req: AvaliacaoTrlRequest): Promise<void> {
    if (USE_MOCK) return mock.registrarAvaliacaoTrl(id, req);
    await api.post(`/projetos/${id}/avaliacoes-trl`, req);
  },
  async moverDireto(id: number, req: MovimentacaoRequest): Promise<{ destino: string }> {
    if (USE_MOCK) return mock.moverDireto(id, req);
    return (await api.post(`/projetos/${id}/movimentacoes`, req)).data;
  },
  async solicitarAvanco(id: number, req: SolicitacaoAvancoRequest): Promise<void> {
    if (USE_MOCK) return mock.solicitarAvanco(id, req);
    await api.post(`/projetos/${id}/solicitacoes-avanco`, req);
  },
  async editar(id: number, req: EdicaoProjetoRequest): Promise<void> {
    if (USE_MOCK) return mock.editarProjeto(id, req);
    await api.put(`/projetos/${id}`, req);
  },
  async alterarArquivamento(id: number, req: ArquivamentoRequest): Promise<void> {
    if (USE_MOCK) return mock.alterarArquivamento(id, req);
    await api.put(`/projetos/${id}/arquivamento`, req);
  },
};

export const parecerService = {
  async consultar(projetoId: number, req: ConsultaRequest): Promise<ConsultaEspecialista> {
    if (USE_MOCK) return mock.consultarEspecialista(projetoId, req);
    return (await api.post(`/projetos/${projetoId}/consultas`, req)).data;
  },
  async emitir(projetoId: number, req: ParecerRequest): Promise<void> {
    if (USE_MOCK) return mock.emitirParecer(projetoId, req);
    await api.post(`/projetos/${projetoId}/pareceres`, req);
  },
};

export const governancaService = {
  async decidir(solicitacaoId: number, req: DecisaoRequest): Promise<void> {
    if (USE_MOCK) return mock.decidirSolicitacao(solicitacaoId, req);
    await api.post(`/solicitacoes-avanco/${solicitacaoId}/decisao`, req);
  },
  async cancelar(solicitacaoId: number, req: CancelamentoRequest): Promise<void> {
    if (USE_MOCK) return mock.cancelarSolicitacao(solicitacaoId, req);
    await api.post(`/solicitacoes-avanco/${solicitacaoId}/cancelamento`, req);
  },
};

export const entregaService = {
  async registrar(projetoId: number, req: EntregaRequest): Promise<void> {
    if (USE_MOCK) return mock.registrarEntrega(projetoId, req);
    await api.post(`/projetos/${projetoId}/entregas`, req);
  },
  async validar(id: number, req: ValidacaoRequest): Promise<void> {
    if (USE_MOCK) return mock.validarEntrega(id, req);
    await api.post(`/entregas/${id}/validacoes`, req);
  },
  async registrarCorrecao(projetoId: number, req: CorrecaoRequest): Promise<void> {
    if (USE_MOCK) return mock.registrarCorrecao(projetoId, req);
    await api.post(`/projetos/${projetoId}/correcoes`, req);
  },
};

export const evidenciaService = {
  // Envio simulado no protótipo; com o back-end, vai como multipart (arquivos + descrição)
  async anexar(projetoId: number, arquivos: File[], descricao: string): Promise<Evidencia[]> {
    if (USE_MOCK) return mock.anexarEvidencias(projetoId, arquivos, descricao);
    const form = new FormData();
    arquivos.forEach((f) => form.append('arquivos', f));
    form.append('descricao', descricao);
    return (await api.post(`/projetos/${projetoId}/evidencias`, form)).data;
  },
};

export const recomendacaoService = {
  async listar(status: StatusRecomendacao | '' = ''): Promise<Recomendacao[]> {
    if (USE_MOCK) return mock.listarRecomendacoes(status);
    return (await api.get('/recomendacoes', { params: { status: status || undefined } })).data;
  },
  async obter(id: number): Promise<Recomendacao> {
    if (USE_MOCK) return mock.obterRecomendacao(id);
    return (await api.get(`/recomendacoes/${id}`)).data;
  },
  async criar(req: RecomendacaoRequest): Promise<Recomendacao> {
    if (USE_MOCK) return mock.criarRecomendacao(req);
    return (await api.post('/recomendacoes', req)).data;
  },
  // A conversão é o cadastro de uma demanda espontânea com recomendacaoId (projetoService.criar)
  async recusar(id: number, req: CancelamentoRequest): Promise<void> {
    if (USE_MOCK) return mock.recusarRecomendacao(id, req);
    await api.post(`/recomendacoes/${id}/recusa`, req);
  },
};

export const notificacaoService = {
  async listar(): Promise<Notificacao[]> {
    if (USE_MOCK) return mock.listarNotificacoes();
    return (await api.get('/notificacoes')).data;
  },
};

export const filaService = {
  async minha(): Promise<MinhaFila> {
    if (USE_MOCK) return mock.minhaFila();
    return (await api.get('/minha-fila')).data;
  },
};

export const dashboardService = {
  async metricas(f: FiltroDashboard = {}): Promise<MetricasDashboard> {
    if (USE_MOCK) return mock.metricas(f);
    return (await api.get('/dashboard/metricas', { params: f })).data;
  },
};
