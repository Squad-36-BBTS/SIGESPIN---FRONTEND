// Modelo de domínio do front-end — Fase 3.
// Segue o "Guia de regras de negócio para o protótipo" (regras da Fase 3 do back-end):
// 3 perfis, qualificação textual, consulta dirigida a um Especialista, parecer independente ou em resposta,
// TRL como indicador, Kanban configurável com percursos livres ou governados, propostas de configuração,
// entregas com várias validações, correções, recomendações, notificações e gestão do projeto.
// Ver docs/FASE3_MUDANCAS.md. Os DTOs seguem os nomes de campo do guia.

// ---------------- Perfis ----------------

export type PerfilUsuario = 'DEMANDANTE' | 'ANALISTA' | 'ESPECIALISTA';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  areaTecnica?: string | null; // área de conhecimento do Especialista
}

export interface UsuarioResumo {
  id: number;
  nome: string;
}

// ---------------- Entrada da demanda ----------------

export type OrigemDemanda = 'ESPONTANEA' | 'INDUZIDA';
export type TipoCampanha = 'CAMPANHA' | 'DESAFIO' | 'HACKATHON' | 'RESIDENCIA' | 'OUTRA';
export type StatusCampanha = 'ABERTA' | 'ENCERRADA';

// Ação de mobilização (campanha, desafio, hackathon, residência ou semelhante)
export interface Campanha {
  id: number;
  titulo: string;
  tipo: TipoCampanha;
  descricao: string;
  tema: string;
  inicio: string;
  fim: string;
  status: StatusCampanha;
  totalDemandas?: number;
}

export interface CampanhaResumo {
  id: number;
  titulo: string;
  tipo: TipoCampanha;
}

export type ArenaTipo = 'EFICIENCIA_OPERACIONAL' | 'NEGOCIOS_DIGITAIS' | 'SEGURANCA_INTEGRADA' | 'A_DEFINIR';

// ---------------- Kanban configurável ----------------

// Colunas terminais: Concluído (CONCLUSAO) e Descontinuado (DESCONTINUACAO) não têm saída
export type TipoTerminal = 'CONCLUSAO' | 'DESCONTINUACAO';

export interface EtapaKanban {
  id: number;
  codigo: string; // único, fixo depois de criado
  nome: string;
  descricao: string;
  ordem: number;
  cor: string;
  ativa: boolean;
  tipoTerminal: TipoTerminal | null; // fixo depois de criado
  terminal: boolean;
  versao: number;
}

export type EtapaResumo = Pick<EtapaKanban, 'id' | 'nome' | 'cor' | 'terminal'>;

// Percurso entre duas colunas. Governado = exige pedido de avanço e decisão do Especialista
export interface TransicaoKanban {
  id: number;
  origemId: number;
  destinoId: number;
  exigeGovernanca: boolean;
  ativa: boolean;
  versao: number;
}

export interface ConfiguracaoKanban {
  etapas: EtapaKanban[];
  transicoes: TransicaoKanban[];
}

// Estados de tarefa: pendências do projeto. NÃO são etapas do Kanban.
export type EstadoTarefa = 'AGUARDANDO_TRIAGEM' | 'AGUARDANDO_PARECER' | 'AGUARDANDO_GOVERNANCA' | 'AGUARDANDO_VALIDACAO';

// Ciclo de vida comum aos pedidos de avanço e às propostas de configuração
export type StatusGovernanca = 'PENDENTE' | 'APROVADA' | 'REJEITADA' | 'CANCELADA';

// ---------------- Registros ----------------

export type EstadoEnvio = 'ENVIADO';

export interface Evidencia {
  id: number;
  projetoId: number;
  nomeArquivo: string;
  tipoArquivo: string;
  tamanhoBytes?: number;
  dataUpload: string;
  enviadaPor: UsuarioResumo;
  estadoEnvio: EstadoEnvio;
  descricao?: string;
}

// Qualificação do Analista: todos os critérios são textos obrigatórios. Novas qualificações preservam as anteriores.
// A qualificação não altera a etapa nem o TRL.
export interface Qualificacao {
  id: number;
  projetoId: number;
  analista: UsuarioResumo;
  aderenciaTese: string;
  relevancia: string;
  grauInovacao: string;
  viabilidade: string;
  maturidadeTecnologica: string;
  fundamentacao: string;
  conclusao: string;
  criadaEm: string;
}

export type StatusConsulta = 'PENDENTE' | 'RESPONDIDA';

// Consulta do Analista dirigida a um Especialista ativo. Pode ser aberta antes da qualificação.
export interface ConsultaEspecialista {
  id: number;
  projetoId: number;
  projetoTitulo?: string;
  solicitante: UsuarioResumo;
  especialista: UsuarioResumo;
  areaTecnica: string | null;
  questao: string;
  status: StatusConsulta;
  parecerId: number | null;
  criadaEm: string;
  respondidaEm: string | null;
}

// Parecer técnico: independente (consultaId null) ou em resposta a uma consulta dirigida ao autor
export interface Parecer {
  id: number;
  projetoId: number;
  projetoTitulo?: string;
  consultaId: number | null;
  questao?: string | null;
  especialista: UsuarioResumo;
  fundamentacao: string;
  conclusao: string;
  evidencias: Evidencia[];
  criadoEm: string;
}

// TRL é indicador (1–9): pode subir, cair ou se manter, sempre com justificativa e evidências do projeto
export interface AvaliacaoTrl {
  id: number;
  projetoId: number;
  responsavel: UsuarioResumo;
  trlAnterior: number;
  trlNovo: number;
  justificativa: string;
  evidencias: Evidencia[];
  radarId: number | null;
  criadaEm: string;
}

export type TipoLeituraRadar = 'INICIAL' | 'ATUAL';

export interface ScoresRadar {
  negocio: number; // 0.00 a 4.00
  produto: number;
  time: number;
  receita: number;
}

export interface AvaliacaoRadar {
  id: number;
  projetoId: number;
  tipoLeitura: TipoLeituraRadar;
  scoreNegocio: number;
  scoreProduto: number;
  scoreTime: number;
  scoreReceita: number;
  dataAvaliacao: string;
}

// Pedido de avanço por um percurso governado. O cartão fica na origem enquanto estiver PENDENTE.
export interface SolicitacaoTransicao {
  id: number;
  projetoId: number;
  projetoTitulo?: string;
  transicaoId: number;
  origem: EtapaResumo;
  destino: EtapaResumo;
  solicitante: UsuarioResumo;
  justificativa: string;
  evidencias: Evidencia[];
  status: StatusGovernanca;
  // Dados de encerramento: decisão (aprovar ou rejeitar) ou cancelamento
  encerradaPor: UsuarioResumo | null;
  justificativaEncerramento: string | null;
  encerradaEm: string | null;
  criadaEm: string;
}

// Entrega submetida pelo Analista ou pelo Especialista e validada pelo Demandante responsável.
// Cada manifestação gera um novo registro; as anteriores são preservadas.
export type ResultadoValidacao = 'VALIDADA' | 'VALIDADA_COM_RESSALVAS' | 'NAO_VALIDADA';

export interface Validacao {
  id: number;
  entregaId: number;
  resultado: ResultadoValidacao;
  observacoes: string;
  por: UsuarioResumo;
  em: string;
}

export interface Entrega {
  id: number;
  projetoId: number;
  projetoTitulo?: string;
  descricao: string;
  registradaPor: UsuarioResumo;
  registradaEm: string;
  validacoes: Validacao[]; // da mais recente para a mais antiga
}

// Correção registrada pelo Demandante responsável
export interface Correcao {
  id: number;
  projetoId: number;
  descricao: string;
  referencia: string | null;
  evidencia: Evidencia | null;
  autor: UsuarioResumo;
  criadaEm: string;
}

// Conversa do projeto: o demandante responde dúvidas e adiciona contexto
export interface Interacao {
  id: number;
  projetoId: number;
  autor: UsuarioResumo;
  perfil: PerfilUsuario;
  texto: string;
  criadaEm: string;
}

export type TipoMudanca = 'ETAPA' | 'TRL';

export interface HistoricoTransicao {
  id: number;
  projetoId: number;
  usuario: UsuarioResumo;
  tipoMudanca: TipoMudanca;
  valorAnterior: string;
  valorNovo: string;
  motivo: string | null;
  solicitacaoId: number | null;
  dataMudanca: string;
}

// Histórico de gestão: alteração cadastral, arquivamento e reativação, com valores anteriores e atuais
export type TipoGestao = 'CADASTRO' | 'ARQUIVAMENTO' | 'REATIVACAO';

export interface AlteracaoCampo {
  campo: string;
  anterior: string;
  atual: string;
}

export interface HistoricoGestao {
  id: number;
  projetoId: number;
  tipo: TipoGestao;
  usuario: UsuarioResumo;
  justificativa: string;
  alteracoes: AlteracaoCampo[];
  data: string;
}

// ---------------- Projeto ----------------

export interface Projeto {
  id: number;
  titulo: string;
  descricaoDor: string;
  origem: OrigemDemanda;
  campanha: CampanhaResumo | null; // obrigatória quando origem = INDUZIDA
  areaDemandanteId: number;
  areaDemandanteNome?: string;
  demandante: UsuarioResumo | null; // projetos legados podem chegar sem Demandante
  analistaResponsavel: UsuarioResumo | null;
  arena: ArenaTipo;
  hipoteseSolucao: string | null;
  potencialLeiDoBem: boolean | null;
  dispendioEstimado: number | null;
  etapa: EtapaResumo;
  trlAtual: number; // 1 a 9
  pendencias: EstadoTarefa[];
  arquivado: boolean;
  motivoArquivamento: string | null;
  arquivadoEm: string | null;
  versao: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ProjetoDetalhe extends Projeto {
  recomendacao: { id: number; titulo: string } | null; // recomendação convertida nesta demanda
  qualificacoes: Qualificacao[];
  consultas: ConsultaEspecialista[];
  pareceres: Parecer[];
  avaliacoesTrl: AvaliacaoTrl[];
  avaliacoesRadar: AvaliacaoRadar[];
  solicitacoes: SolicitacaoTransicao[];
  entregas: Entrega[];
  correcoes: Correcao[];
  evidencias: Evidencia[];
  historicoTransicoes: HistoricoTransicao[];
  historicoGestao: HistoricoGestao[];
  interacoes: Interacao[];
  transicoesDisponiveis: (TransicaoKanban & { destino: EtapaResumo })[];
}

// ---------------- Configuração do quadro: propostas ----------------

export interface NovaEtapaRequest {
  codigo: string;
  nome: string;
  ordem: number;
  terminal: TipoTerminal | null;
  descricao?: string;
  cor?: string;
}

export interface EdicaoEtapaRequest {
  nome: string;
  ordem: number;
  ativa: boolean;
  versao: number;
  descricao?: string;
  cor?: string;
}

export interface NovaTransicaoRequest {
  origemId: number;
  destinoId: number;
  exigeGovernanca: boolean;
}

export interface EdicaoTransicaoRequest {
  exigeGovernanca: boolean;
  ativa: boolean;
  versao: number;
}

export type TipoProposta = 'COLUNA' | 'TRANSICAO';

export type PropostaRequest =
  | { tipo: 'COLUNA'; proposta: NovaEtapaRequest; justificativa: string }
  | { tipo: 'TRANSICAO'; proposta: NovaTransicaoRequest; justificativa: string };

export type PropostaConfiguracao = PropostaRequest & {
  id: number;
  autor: UsuarioResumo;
  status: StatusGovernanca;
  encerradaPor: UsuarioResumo | null;
  justificativaEncerramento: string | null;
  encerradaEm: string | null;
  criadaEm: string;
};

// ---------------- Recomendações e notificações ----------------

export type StatusRecomendacao = 'PENDENTE' | 'CONVERTIDA' | 'RECUSADA';

export interface Recomendacao {
  id: number;
  autor: UsuarioResumo;
  autorPerfil: PerfilUsuario;
  destinatario: UsuarioResumo;
  titulo: string;
  descricao: string;
  status: StatusRecomendacao;
  projeto: { id: number; titulo: string } | null; // convertidas
  justificativaEncerramento: string | null; // recusadas
  encerradaEm: string | null;
  criadaEm: string;
}

// Movimentações realizadas pelo Especialista geram notificação global
export interface Notificacao {
  id: number;
  mensagem: string;
  projetoId: number;
  projetoTitulo: string;
  autor: UsuarioResumo;
  criadaEm: string;
}

// ---------------- DTOs de entrada ----------------

export interface AnaliseIaRequest {
  titulo: string;
  descricaoDor: string;
}

export interface AnaliseIaResponse {
  hipoteseSolucao: string;
  trlSugerido: number;
  observacoes?: string;
}

export interface CriarProjetoRequest {
  titulo: string;
  descricaoDor: string;
  areaDemandanteId: number;
  origem: OrigemDemanda;
  acaoMobilizacaoId: number | null; // obrigatória e positiva quando INDUZIDA
  trlInicialDeclarado: number;
  hipoteseSolucao: string | null;
  recomendacaoId?: number | null; // conversão de uma recomendação
}

export interface QualificacaoRequest {
  aderenciaTese: string;
  relevancia: string;
  grauInovacao: string;
  viabilidade: string;
  maturidadeTecnologica: string;
  fundamentacao: string;
  conclusao: string;
}

export interface ConsultaRequest {
  especialistaId: number;
  questao: string;
}

export interface ParecerRequest {
  consultaId: number | null;
  fundamentacao: string;
  conclusao: string;
  evidenciaIds: number[]; // obrigatório como lista; pode ficar vazia
}

export interface AvaliacaoTrlRequest {
  nivel: number;
  justificativa: string;
  evidenciaIds: number[]; // ao menos uma
  radar: ScoresRadar | null;
}

export interface MovimentacaoRequest {
  transicaoId: number;
  justificativa: string;
}

export interface SolicitacaoAvancoRequest {
  transicaoId: number;
  justificativa: string;
  evidenciaIds: number[]; // não vazio
}

export interface DecisaoRequest {
  decisao: 'APROVAR' | 'REJEITAR';
  justificativa: string;
}

export interface CancelamentoRequest {
  justificativa: string;
}

export interface EntregaRequest {
  descricao: string;
}

export interface ValidacaoRequest {
  resultado: ResultadoValidacao;
  observacoes: string;
}

export interface CorrecaoRequest {
  descricao: string;
  referencia: string | null; // até 500 caracteres
  evidenciaId: number | null;
}

export interface RecomendacaoRequest {
  destinatarioId: number;
  titulo: string;
  descricao: string;
}

export interface DadosProjeto {
  titulo: string;
  descricaoDor: string;
  areaDemandanteId: number;
  hipoteseSolucao: string | null;
  arena: ArenaTipo;
  potencialLeiDoBem: boolean | null;
  dispendioEstimado: number | null; // até 10 dígitos inteiros e 2 decimais
  demandanteId: number;
  analistaResponsavelId: number | null;
}

export interface EdicaoProjetoRequest {
  dados: DadosProjeto;
  versao: number;
  justificativa: string;
}

export interface ArquivamentoRequest {
  arquivado: boolean;
  versao: number;
  justificativa: string;
}

// Pedido de acesso (tela de cadastro): a administração analisa e define o perfil
export interface SolicitacaoAcessoRequest {
  nome: string;
  email: string;
  areaId: number;
  perfil: PerfilUsuario;
  justificativa: string;
}

export type FiltroArquivamento = 'ATIVOS' | 'ARQUIVADOS' | 'TODOS';

export interface FiltroPortfolio {
  busca?: string;
  arena?: ArenaTipo | '';
  etapaId?: number | '';
  origem?: OrigemDemanda | '';
  campanhaId?: number | '';
  pendencia?: EstadoTarefa | '';
  arquivamento?: FiltroArquivamento; // padrão: ATIVOS
  periodoDias?: number | ''; // pela data de registro, como no dashboard
  pagina?: number;
  tamanho?: number;
}

export interface Pagina<T> {
  itens: T[];
  total: number;
  pagina: number;
  tamanho: number;
}

export interface FiltroDashboard {
  periodoDias?: number | ''; // pela data de registro
  etapaId?: number | '';
  origem?: OrigemDemanda | '';
}

export interface MetricasDashboard {
  totalProjetos: number;
  arquivados: number;
  trlMedio: number;
  porEtapa: { etapa: EtapaResumo; total: number }[];
  porOrigem: Record<OrigemDemanda, number>;
  porArena: Record<ArenaTipo, number>;
  pendencias: Record<EstadoTarefa, number>;
  radarMedioInicial: ScoresRadar;
  radarMedioAtual: ScoresRadar;
}

// Fila do usuário atual
export interface MinhaFila {
  triagem: Projeto[]; // Analista
  consultasPendentes: ConsultaEspecialista[]; // Especialista: dirigidas a ele
  solicitacoesPendentes: SolicitacaoTransicao[]; // Especialista decide; Analista acompanha os seus
  solicitacoesEncerradas: SolicitacaoTransicao[]; // Analista: retorno de decisões e cancelamentos
  pareceresRecebidos: Parecer[]; // Analista: respostas às suas consultas
  propostasPendentes: PropostaConfiguracao[]; // Especialista decide; Analista acompanha as suas
  entregasParaValidar: Entrega[]; // Demandante responsável
  entregasValidadas: Entrega[]; // Analista: retorno das validações
  minhasDemandas: Projeto[]; // Demandante
  recomendacoesPendentes: Recomendacao[]; // Demandante destinatário
}

export interface AreaDemandante {
  id: number;
  sigla: string;
  nome: string;
}
