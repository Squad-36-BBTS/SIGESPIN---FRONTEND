// Serviços do front-end. Usam o mock enquanto VITE_USE_MOCK=true e as rotas
// propostas no relatório de mudanças quando o back-end estiver disponível.
// Rotas e DTOs ainda serão confirmados com a equipe de back-end.
import type {
  AnaliseIaRequest,
  AnaliseIaResponse,
  Campanha,
  CampanhaRequest,
  ConsultaEspecialista,
  ConsultaRequest,
  CriarProjetoRequest,
  Decisao,
  DecisaoRequest,
  Entrega,
  EntregaRequest,
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
  ValidacaoEntregaRequest,
} from '@/types/domain';

import { api, USE_MOCK } from './api';
import * as mock from './mock/mockServer';

// Envia dados + arquivos num único multipart (sequência de upload ainda a definir)
function multipart(dados: object, arquivos: File[]) {
  const form = new FormData();
  form.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }));
  arquivos.forEach((f) => form.append('arquivos', f));
  return form;
}

export const authService = {
  async login(email: string, senha: string): Promise<{ token: string; usuario: Usuario }> {
    if (USE_MOCK) return mock.login(email, senha);
    return (await api.post('/auth/login', { email, senha })).data;
  },
  async logout(): Promise<void> {
    if (USE_MOCK) return;
    await api.post('/auth/logout').catch(() => undefined);
  },
  // Não existe autocadastro: a tela registra um pedido de acesso
  async solicitarAcesso(dados: { nome: string; email: string; areaId: number; perfil: string; justificativa: string }) {
    if (USE_MOCK) return mock.solicitarAcesso(dados);
    await api.post('/auth/solicitar-acesso', dados);
  },
};

export const usuarioService = {
  async especialistas(): Promise<Usuario[]> {
    if (USE_MOCK) return mock.listarEspecialistas();
    return (await api.get('/usuarios', { params: { perfil: 'ESPECIALISTA' } })).data;
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
    return (await api.get('/campanhas')).data;
  },
  async criar(req: CampanhaRequest): Promise<Campanha> {
    if (USE_MOCK) return mock.criarCampanha(req);
    return (await api.post('/campanhas', req)).data;
  },
  async encerrar(id: number): Promise<void> {
    if (USE_MOCK) return mock.encerrarCampanha(id);
    await api.post(`/campanhas/${id}/encerramento`);
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
  async complementar(id: number, dados: { descricaoDor: string; complemento: string }): Promise<void> {
    if (USE_MOCK) return mock.complementarDemanda(id, dados);
    await api.post(`/projetos/${id}/complemento`, dados);
  },
  async assumirTriagem(id: number): Promise<void> {
    if (USE_MOCK) return mock.assumirTriagem(id);
    await api.post(`/projetos/${id}/triagem`);
  },
  async qualificar(id: number, req: QualificacaoRequest): Promise<void> {
    if (USE_MOCK) return mock.registrarQualificacao(id, req);
    await api.post(`/projetos/${id}/qualificacoes`, req);
  },
  async arquivar(id: number, motivo: string): Promise<void> {
    if (USE_MOCK) return mock.arquivar(id, motivo);
    await api.post(`/projetos/${id}/arquivamento`, { motivo });
  },
  async registrarMaturidade(id: number, req: MaturidadeRequest): Promise<void> {
    if (USE_MOCK) return mock.registrarMaturidade(id, req);
    await api.post(`/projetos/${id}/maturidade`, multipart({ ...req, arquivos: undefined }, req.arquivos));
  },
  async comentar(id: number, texto: string): Promise<Interacao> {
    if (USE_MOCK) return mock.comentar(id, texto);
    return (await api.post(`/projetos/${id}/interacoes`, { texto })).data;
  },
  async avancarMarco(id: number, req: MarcoRequest): Promise<void> {
    if (USE_MOCK) return mock.avancarMarco(id, req);
    await api.post(`/projetos/${id}/marcos`, req);
  },
};

export const parecerService = {
  async consultar(projetoId: number, req: ConsultaRequest): Promise<ConsultaEspecialista> {
    if (USE_MOCK) return mock.consultarEspecialista(projetoId, req);
    return (await api.post(`/projetos/${projetoId}/consultas`, req)).data;
  },
  async minhas(): Promise<ConsultaEspecialista[]> {
    if (USE_MOCK) return mock.listarMinhasConsultas();
    return (await api.get('/consultas/minhas')).data;
  },
  async responder(id: number, req: RespostaConsultaRequest): Promise<void> {
    if (USE_MOCK) return mock.responderConsulta(id, req);
    await api.post(`/consultas/${id}/parecer`, req);
  },
};

export const entregaService = {
  async registrar(projetoId: number, req: EntregaRequest): Promise<void> {
    if (USE_MOCK) return mock.registrarEntrega(projetoId, req);
    await api.post(`/projetos/${projetoId}/entregas`, multipart({ ...req, arquivos: undefined }, req.arquivos));
  },
  async validar(id: number, req: ValidacaoEntregaRequest): Promise<void> {
    if (USE_MOCK) return mock.validarEntrega(id, req);
    await api.post(`/entregas/${id}/validacao`, req);
  },
  async paraValidar(): Promise<Entrega[]> {
    if (USE_MOCK) return mock.entregasParaValidar();
    return (await api.get('/entregas', { params: { status: 'AGUARDANDO_VALIDACAO', minhas: true } })).data;
  },
};

export const governancaService = {
  async pautas(): Promise<PautaGovernanca[]> {
    if (USE_MOCK) return mock.listarPautas();
    return (await api.get('/governanca/pautas', { params: { status: 'PENDENTE' } })).data;
  },
  async decisoesRecentes(): Promise<(Decisao & { projetoTitulo?: string })[]> {
    if (USE_MOCK) return mock.decisoesRecentes();
    return (await api.get('/governanca/decisoes', { params: { tamanho: 8 } })).data;
  },
  async encaminhar(projetoId: number, req: PautaRequest): Promise<void> {
    if (USE_MOCK) return mock.encaminharGovernanca(projetoId, req);
    await api.post(`/projetos/${projetoId}/pautas`, req);
  },
  async decidir(pautaId: number, req: DecisaoRequest): Promise<void> {
    if (USE_MOCK) return mock.decidirPauta(pautaId, req);
    await api.post(`/governanca/pautas/${pautaId}/decisao`, req);
  },
  async deliberar(projetoId: number, req: DecisaoRequest): Promise<void> {
    if (USE_MOCK) return mock.deliberar(projetoId, req);
    await api.post(`/projetos/${projetoId}/deliberacao`, req);
  },
};

export const dashboardService = {
  async metricas(): Promise<MetricasDashboard> {
    if (USE_MOCK) return mock.metricas();
    return (await api.get('/dashboard/metricas')).data;
  },
};
