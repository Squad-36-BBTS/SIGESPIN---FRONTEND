// Serviços do front-end (revisão 3). Usam o mock enquanto VITE_USE_MOCK=true e as rotas
// propostas no relatório quando o back-end estiver disponível. Nada aqui confirma que
// endpoints ou permissões já existam: rotas e DTOs ainda serão alinhados com o back-end.
import type {
  AnaliseIaRequest,
  AnaliseIaResponse,
  AvaliacaoTrlRequest,
  Campanha,
  ConfiguracaoKanban,
  ConsultaEspecialista,
  ConsultaRequest,
  CriarProjetoRequest,
  DecisaoRequest,
  EntregaRequest,
  EtapaKanban,
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
  ValidacaoRequest,
} from '@/types/domain';

import { api, USE_MOCK } from './api';
import * as mock from './mock/mockServer';

// Dados + arquivos num único multipart (a sequência de upload ainda será definida)
function multipart(dados: object, arquivos: File[]) {
  const form = new FormData();
  form.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }));
  arquivos.forEach((f) => form.append('arquivos', f));
  return form;
}
const semArquivos = <T extends { arquivos: File[] }>(r: T) => ({ ...r, arquivos: undefined });

export const authService = {
  async login(email: string, senha: string): Promise<{ token: string; usuario: Usuario }> {
    if (USE_MOCK) return mock.login(email, senha);
    return (await api.post('/auth/login', { email, senha })).data;
  },
  async logout(): Promise<void> {
    if (USE_MOCK) return;
    await api.post('/auth/logout').catch(() => undefined);
  },  // Não existe autocadastro: a tela de cadastro envia um pedido de acesso (rota a confirmar com o back-end)
  async solicitarAcesso(dados: SolicitacaoAcessoRequest): Promise<void> {
    if (USE_MOCK) return mock.solicitarAcesso(dados);
    await api.post('/auth/solicitacoes-acesso', dados);
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
    return (await api.get('/acoes-mobilizacao')).data;
  },
};

export const kanbanService = {
  async configuracao(): Promise<ConfiguracaoKanban> {
    if (USE_MOCK) return mock.obterConfiguracao();
    return (await api.get('/kanban/configuracao')).data;
  },
  async salvarEtapa(dados: Pick<EtapaKanban, 'nome' | 'descricao' | 'cor' | 'terminal'> & { id?: number }): Promise<void> {
    if (USE_MOCK) return mock.salvarEtapa(dados);
    if (dados.id) await api.put(`/kanban/etapas/${dados.id}`, dados);
    else await api.post('/kanban/etapas', dados);
  },
  async reordenarEtapa(id: number, direcao: -1 | 1): Promise<void> {
    if (USE_MOCK) return mock.reordenarEtapa(id, direcao);
    await api.post(`/kanban/etapas/${id}/ordem`, { direcao });
  },
  async alternarEtapa(id: number): Promise<void> {
    if (USE_MOCK) return mock.alternarEtapa(id);
    await api.post(`/kanban/etapas/${id}/ativacao`);
  },
  async excluirEtapa(id: number): Promise<void> {
    if (USE_MOCK) return mock.excluirEtapa(id);
    await api.delete(`/kanban/etapas/${id}`);
  },
  async salvarTransicao(dados: Pick<TransicaoKanban, 'origemId' | 'destinoId' | 'exigeGovernanca'>): Promise<void> {
    if (USE_MOCK) return mock.salvarTransicao(dados);
    await api.post('/kanban/transicoes', dados);
  },
  async atualizarTransicao(id: number, dados: Partial<Pick<TransicaoKanban, 'exigeGovernanca' | 'ativa'>>): Promise<void> {
    if (USE_MOCK) return mock.atualizarTransicao(id, dados);
    await api.patch(`/kanban/transicoes/${id}`, dados);
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
    await api.post(`/projetos/${id}/avaliacoes-trl`, multipart(semArquivos(req), req.arquivos));
  },
  async movimentar(id: number, req: MovimentacaoRequest): Promise<{ resultado: 'MOVIDO' | 'SOLICITADO'; destino: string }> {
    if (USE_MOCK) return mock.movimentar(id, req);
    return (await api.post(`/projetos/${id}/movimentacoes`, multipart(semArquivos(req), req.arquivos))).data;
  },
};

export const parecerService = {
  async consultar(projetoId: number, req: ConsultaRequest): Promise<ConsultaEspecialista> {
    if (USE_MOCK) return mock.consultarEspecialista(projetoId, req);
    return (await api.post(`/projetos/${projetoId}/consultas`, req)).data;
  },
  async responder(id: number, req: ParecerRequest): Promise<void> {
    if (USE_MOCK) return mock.responderConsulta(id, req);
    await api.post(`/consultas/${id}/parecer`, multipart(semArquivos(req), req.arquivos));
  },
};

export const governancaService = {
  async decidir(solicitacaoId: number, req: DecisaoRequest): Promise<void> {
    if (USE_MOCK) return mock.decidirSolicitacao(solicitacaoId, req);
    await api.post(`/solicitacoes-transicao/${solicitacaoId}/decisao`, req);
  },
};

export const entregaService = {
  async registrar(projetoId: number, req: EntregaRequest): Promise<void> {
    if (USE_MOCK) return mock.registrarEntrega(projetoId, req);
    await api.post(`/projetos/${projetoId}/entregas`, multipart(semArquivos(req), req.arquivos));
  },
  async validar(id: number, req: ValidacaoRequest): Promise<void> {
    if (USE_MOCK) return mock.validarEntrega(id, req);
    await api.post(`/entregas/${id}/validacao`, req);
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
