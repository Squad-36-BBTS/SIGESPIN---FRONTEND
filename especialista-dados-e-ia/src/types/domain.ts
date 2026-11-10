// Modelo de domínio do front-end — revisão 3 (23/10/2026).
// Segue o guia "Fluxo de usuário para protótipo do Front-end", baseado em DOCUMENTACAO_FASE1_DOMINIO.md:
// 3 perfis, origem espontânea/induzida, qualificação textual, parecer técnico, TRL como indicador
// e Kanban configurável em que cada transição indica se exige governança (decidida pelo Especialista).
// Ver docs/RELATORIO_MUDANCAS.md. Os DTOs finais ainda serão alinhados com o back-end.

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
export type NaturezaDemanda = 'PROBLEMA' | 'NECESSIDADE' | 'OPORTUNIDADE';
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

export interface EtapaKanban {
  id: number;
  nome: string;
  descricao: string;
  ordem: number;
  cor: string;
  ativa: boolean;
  terminal: boolean; // Concluído e Descontinuado não têm saída
}

export type EtapaResumo = Pick<EtapaKanban, 'id' | 'nome' | 'cor' | 'terminal'>;

export interface TransicaoKanban {
  id: number;
  origemId: number;
  destinoId: number;
  exigeGovernanca: boolean;
  ativa: boolean;
}

export interface ConfiguracaoKanban {
  etapas: EtapaKanban[];
  transicoes: TransicaoKanban[];
}

// Estados de tarefa: pendências do projeto. NÃO são etapas do Kanban.
export type EstadoTarefa = 'AGUARDANDO_TRIAGEM' | 'AGUARDANDO_PARECER' | 'AGUARDANDO_GOVERNANCA' | 'AGUARDANDO_VALIDACAO';

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
  // Registro que a evidência fundamenta
  vinculo: { tipo: 'TRL' | 'PARECER' | 'SOLICITACAO' | 'ENTREGA' | 'GERAL'; id: number | null };
}

// Qualificação generalista do Analista, com critérios em texto. Novas qualificações preservam as anteriores.
export interface Qualificacao {
  id: number;
  projetoId: number;
  analista: UsuarioResumo;
  aderenciaTese: string;
  relevancia: string;
  grauInovacao: string;
  viabilidade: string;
  trlAvaliado: number;
  conclusao: string;
  criadaEm: string;
}

export type StatusConsulta = 'PENDENTE' | 'RESPONDIDA';

export interface ConsultaEspecialista {
  id: number;
  projetoId: number;
  projetoTitulo?: string;
  solicitante: UsuarioResumo;
  // null = aberta para a área técnica; quem responder assume
  especialista: UsuarioResumo | null;
  areaTecnica: string;
  pergunta: string;
  status: StatusConsulta;
  fundamentacao: string | null;
  conclusao: string | null;
  evidencias: Evidencia[];
  criadaEm: string;
  respondidaEm: string | null;
}

// TRL é indicador (1–9): pode subir ou descer, sempre com fundamentação e evidências
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

// Solicitação de transição que exige governança; o projeto só muda se aprovada
export type StatusSolicitacao = 'PENDENTE' | 'APROVADA' | 'REJEITADA';

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
  status: StatusSolicitacao;
  decisor: UsuarioResumo | null;
  justificativaDecisao: string | null;
  decididaEm: string | null;
  criadaEm: string;
}

// Entrega/MVP publicada pelo Analista e validada pelo Demandante.
// A validação não altera TRL nem etapa do Kanban.
export type ResultadoValidacao = 'VALIDADA' | 'VALIDADA_COM_RESSALVAS' | 'NAO_VALIDADA';

export interface Entrega {
  id: number;
  projetoId: number;
  projetoTitulo?: string;
  titulo: string;
  descricao: string;
  ehMvp: boolean;
  registradaPor: UsuarioResumo;
  registradaEm: string;
  evidencias: Evidencia[];
  validacao: { resultado: ResultadoValidacao; observacoes: string; por: UsuarioResumo; em: string } | null;
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

// ---------------- Projeto ----------------

export interface Projeto {
  id: number;
  titulo: string;
  descricaoDor: string;
  contexto: string;
  natureza: NaturezaDemanda;
  origem: OrigemDemanda;
  campanha: CampanhaResumo | null; // obrigatória quando origem = INDUZIDA
  areaDemandanteId: number;
  areaDemandanteNome?: string;
  demandante: UsuarioResumo | null;
  analistaResponsavel: UsuarioResumo | null;
  arena: ArenaTipo;
  hipoteseSolucao: string;
  potencialLeiDoBem: boolean;
  etapa: EtapaResumo;
  trlAtual: number; // 1 a 9
  // dispendioEstimado existe no domínio, mas a política de exibição não foi definida:
  // o protótipo não recebe nem exibe esse dado em telas compartilhadas.
  pendencias: EstadoTarefa[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface ProjetoDetalhe extends Projeto {
  qualificacoes: Qualificacao[];
  consultas: ConsultaEspecialista[];
  avaliacoesTrl: AvaliacaoTrl[];
  avaliacoesRadar: AvaliacaoRadar[];
  solicitacoes: SolicitacaoTransicao[];
  entregas: Entrega[];
  evidencias: Evidencia[];
  historicoTransicoes: HistoricoTransicao[];
  interacoes: Interacao[];
  transicoesDisponiveis: (TransicaoKanban & { destino: EtapaResumo })[];
}

// ---------------- DTOs de entrada (propostos) ----------------

export interface AnaliseIaRequest {
  titulo: string;
  areaDemandanteId: number;
  descricaoDor: string;
  natureza: NaturezaDemanda;
}

export interface AnaliseIaResponse {
  arena: ArenaTipo;
  hipoteseSolucao: string;
  trlInicial: number;
  potencialLeiDoBem: boolean;
  radar: ScoresRadar;
  observacoes?: string;
}

export interface CriarProjetoRequest extends AnaliseIaRequest {
  contexto: string;
  origem: OrigemDemanda;
  campanhaId: number | null;
  arena: ArenaTipo;
  hipoteseSolucao: string;
  trlInicial: number;
  potencialLeiDoBem: boolean;
  radar: ScoresRadar;
}

export interface QualificacaoRequest {
  aderenciaTese: string;
  relevancia: string;
  grauInovacao: string;
  viabilidade: string;
  trlAvaliado: number;
  conclusao: string;
}

export interface ConsultaRequest {
  areaTecnica: string;
  especialistaId: number | null;
  pergunta: string;
}

export interface ParecerRequest {
  fundamentacao: string;
  conclusao: string;
  arquivos: File[];
}

export interface AvaliacaoTrlRequest {
  trlNovo: number;
  justificativa: string;
  radar: ScoresRadar | null;
  arquivos: File[];
}

export interface MovimentacaoRequest {
  transicaoId: number;
  justificativa: string;
  arquivos: File[];
}

export interface DecisaoRequest {
  decisao: 'APROVADA' | 'REJEITADA';
  justificativa: string;
}

export interface EntregaRequest {
  titulo: string;
  descricao: string;
  ehMvp: boolean;
  arquivos: File[];
}

// Pedido de acesso (tela de cadastro): a administração analisa e define o perfil
export interface SolicitacaoAcessoRequest {
  nome: string;
  email: string;
  areaId: number;
  perfil: PerfilUsuario;
  justificativa: string;
}

export interface ValidacaoRequest {
  resultado: ResultadoValidacao;
  observacoes: string;
}

export interface FiltroPortfolio {
  busca?: string;
  arena?: ArenaTipo | '';
  etapaId?: number | '';
  origem?: OrigemDemanda | '';
  campanhaId?: number | '';
  pendencia?: EstadoTarefa | '';
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
  consultasPendentes: ConsultaEspecialista[]; // Especialista
  solicitacoesPendentes: SolicitacaoTransicao[]; // Especialista decide; Analista acompanha as suas
  solicitacoesDecididas: SolicitacaoTransicao[]; // Analista: retorno das decisões
  pareceresRecebidos: ConsultaEspecialista[]; // Analista: respostas recentes
  entregasParaValidar: Entrega[]; // Demandante
  entregasValidadas: Entrega[]; // Analista: retorno das validações
  minhasDemandas: Projeto[]; // Demandante
}

export interface AreaDemandante {
  id: number;
  sigla: string;
  nome: string;
}
