// Modelo de domínio do front-end — revisão 2 (16/10/2026).
// Ajustado ao retorno da área de inovação: duas origens de demanda, 3 perfis,
// triagem/qualificação pelo Analista, pareceres de Especialistas, TRL como indicador
// atualizado por evidências e Kanban com os marcos reais da jornada.
// Ver docs/RELATORIO_MUDANCAS.md. Os DTOs finais ainda serão alinhados com o back-end.

// ---------------- Perfis ----------------

// Executivo foi absorvido pelo Analista (visão de gestão do portfólio).
// "Comitê" deixou de ser perfil: é um Especialista (ou Analista gestor) com alçada de governança.
export type PerfilUsuario = 'DEMANDANTE' | 'ANALISTA' | 'ESPECIALISTA';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  areaTecnica?: string | null; // área de conhecimento do Especialista
  alcadaGovernanca: boolean; // pode priorizar/decidir nas instâncias de governança
}

export interface UsuarioResumo {
  id: number;
  nome: string;
}

// ---------------- Entrada da demanda ----------------

export type OrigemDemanda = 'ESPONTANEA' | 'INDUZIDA';
export type NaturezaDemanda = 'PROBLEMA' | 'NECESSIDADE' | 'OPORTUNIDADE';
export type TipoCampanha = 'CAMPANHA' | 'DESAFIO' | 'HACKATHON' | 'RESIDENCIA';
export type StatusCampanha = 'ABERTA' | 'ENCERRADA';

export interface Campanha {
  id: number;
  titulo: string;
  tipo: TipoCampanha;
  descricao: string;
  tema: string;
  inicio: string;
  fim: string;
  status: StatusCampanha;
  criadaPor: UsuarioResumo;
  totalDemandas?: number;
}

export interface CampanhaResumo {
  id: number;
  titulo: string;
  tipo: TipoCampanha;
}

// ---------------- Jornada (Kanban) ----------------

export type ArenaTipo = 'EFICIENCIA_OPERACIONAL' | 'NEGOCIOS_DIGITAIS' | 'SEGURANCA_INTEGRADA' | 'A_DEFINIR';

// Marcos reais da jornada. Substitui IDEACAO/POC/MVP/CONCLUIDO/DESCONTINUADO.
export type EtapaJornada =
  | 'BACKLOG' // registrada, aguardando triagem
  | 'QUALIFICACAO' // triagem/qualificação pelo Analista (e pareceres)
  | 'GOVERNANCA' // aguardando priorização/decisão
  | 'EXPERIMENTACAO' // ciclo de experimentação (PoC)
  | 'MVP' // desenvolvimento de MVP/piloto, validado pelo demandante
  | 'CONCLUIDO'
  | 'ARQUIVADO' // não seguiu após a triagem
  | 'DESCONTINUADO'; // interrompido por decisão de governança

export type TipoLeituraRadar = 'INICIAL' | 'ATUAL';
export type TipoMudanca = 'ETAPA' | 'TRL' | 'HIPOTESE';

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

export interface Evidencia {
  id: number;
  projetoId: number;
  nomeArquivo: string;
  tipoArquivo: string;
  tamanhoBytes?: number;
  dataUpload: string;
  enviadaPor: UsuarioResumo;
  // Vínculo opcional ao registro que a evidência fundamenta
  vinculo: { tipo: 'MATURIDADE' | 'ENTREGA' | 'GERAL'; id: number | null };
}

// ---------------- Triagem e qualificação ----------------

export type RecomendacaoQualificacao = 'ENCAMINHAR_GOVERNANCA' | 'INICIAR_EXPERIMENTACAO' | 'DEVOLVER_DEMANDANTE' | 'ARQUIVAR';

export interface Qualificacao {
  id: number;
  projetoId: number;
  analista: UsuarioResumo;
  // Notas de 1 a 5
  aderenciaTese: number;
  relevancia: number;
  grauInovacao: number;
  viabilidade: number;
  trlAvaliado: number;
  parecer: string;
  recomendacao: RecomendacaoQualificacao;
  criadaEm: string;
}

export type StatusConsulta = 'PENDENTE' | 'RESPONDIDA';
export type RecomendacaoParecer = 'FAVORAVEL' | 'FAVORAVEL_COM_RESSALVAS' | 'DESFAVORAVEL';

export interface ConsultaEspecialista {
  id: number;
  projetoId: number;
  projetoTitulo?: string;
  solicitante: UsuarioResumo;
  // null = consulta aberta para a área técnica; quem responder assume
  especialista: UsuarioResumo | null;
  areaTecnica: string;
  pergunta: string;
  status: StatusConsulta;
  parecer: string | null;
  recomendacao: RecomendacaoParecer | null;
  trlSugerido: number | null;
  criadaEm: string;
  respondidaEm: string | null;
}

// ---------------- Maturidade ----------------

// TRL é indicador: atualizado pelo Analista a partir de evidências, sem pedido de aprovação
export interface RegistroMaturidade {
  id: number;
  projetoId: number;
  responsavel: UsuarioResumo;
  trlAnterior: number;
  trlNovo: number;
  justificativa: string;
  evidencias: Evidencia[];
  radarId: number | null;
  criadoEm: string;
}

// ---------------- Entregas validadas pelo demandante ----------------

export type StatusEntrega = 'AGUARDANDO_VALIDACAO' | 'VALIDADA' | 'AJUSTES_SOLICITADOS';

export interface Entrega {
  id: number;
  projetoId: number;
  projetoTitulo?: string;
  etapa: EtapaJornada;
  titulo: string;
  descricao: string;
  registradaPor: UsuarioResumo;
  registradaEm: string;
  status: StatusEntrega;
  validadaPor: UsuarioResumo | null;
  comentarioValidacao: string | null;
  validadaEm: string | null;
  evidencias: Evidencia[];
}

// ---------------- Governança ----------------

export type DecisaoTipo = 'APROVADO' | 'PIVOTADO' | 'REPROVADO';
export type StatusPauta = 'PENDENTE' | 'DECIDIDA';

// Item levado à instância de governança para priorização/decisão
export interface PautaGovernanca {
  id: number;
  projetoId: number;
  projetoTitulo?: string;
  encaminhadaPor: UsuarioResumo;
  motivo: string;
  etapaAtual: EtapaJornada;
  etapaProposta: EtapaJornada | null;
  status: StatusPauta;
  decisaoId: number | null;
  criadaEm: string;
}

export interface Decisao {
  id: number;
  projetoId: number;
  pautaId: number | null;
  responsavel: UsuarioResumo;
  decisao: DecisaoTipo;
  justificativa: string;
  novaHipotese: string | null;
  dataDecisao: string;
}

export interface HistoricoTransicao {
  id: number;
  projetoId: number;
  usuario: UsuarioResumo;
  tipoMudanca: TipoMudanca;
  valorAnterior: string;
  valorNovo: string;
  motivo: string | null;
  dataMudanca: string;
}

// ---------------- Participação ----------------

// Conversa do projeto: o demandante segue participando do ciclo junto com a equipe
export interface Interacao {
  id: number;
  projetoId: number;
  autor: UsuarioResumo;
  perfil: PerfilUsuario;
  texto: string;
  criadaEm: string;
}

// ---------------- Projeto ----------------

export interface Projeto {
  id: number;
  titulo: string;
  descricaoDor: string;
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
  etapa: EtapaJornada;
  trlAtual: number; // 1 a 9
  dispendioEstimado: number | null; // ausente para o Demandante
  aguardandoComplemento: boolean; // devolvida ao demandante na triagem
  pautaPendente: boolean;
  entregasAguardandoValidacao: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ProjetoDetalhe extends Projeto {
  qualificacoes: Qualificacao[];
  consultas: ConsultaEspecialista[];
  registrosMaturidade: RegistroMaturidade[];
  avaliacoesRadar: AvaliacaoRadar[];
  entregas: Entrega[];
  pautas: PautaGovernanca[];
  decisoes: Decisao[];
  evidencias: Evidencia[];
  historicoTransicoes: HistoricoTransicao[];
  interacoes: Interacao[];
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
  origem: OrigemDemanda;
  campanhaId: number | null;
  arena: ArenaTipo;
  hipoteseSolucao: string;
  trlInicial: number;
  potencialLeiDoBem: boolean;
  radar: ScoresRadar;
}

export interface QualificacaoRequest {
  aderenciaTese: number;
  relevancia: number;
  grauInovacao: number;
  viabilidade: number;
  trlAvaliado: number;
  parecer: string;
  recomendacao: RecomendacaoQualificacao;
  dispendioEstimado?: number | null;
}

export interface ConsultaRequest {
  areaTecnica: string;
  especialistaId: number | null; // opcional: direcionar a uma pessoa da área
  pergunta: string;
}

export interface RespostaConsultaRequest {
  parecer: string;
  recomendacao: RecomendacaoParecer;
  trlSugerido: number | null;
}

export interface MaturidadeRequest {
  trlNovo: number;
  justificativa: string;
  radar: ScoresRadar | null;
  arquivos: File[];
}

export interface EntregaRequest {
  titulo: string;
  descricao: string;
  arquivos: File[];
}

export interface ValidacaoEntregaRequest {
  resultado: 'VALIDADA' | 'AJUSTES_SOLICITADOS';
  comentario: string;
}

export interface MarcoRequest {
  etapaNova: EtapaJornada;
  motivo: string;
}

export interface PautaRequest {
  motivo: string;
  etapaProposta: EtapaJornada | null;
}

export interface DecisaoRequest {
  decisao: DecisaoTipo;
  justificativa: string;
  novaHipotese?: string;
}

export interface CampanhaRequest {
  titulo: string;
  tipo: TipoCampanha;
  descricao: string;
  tema: string;
  inicio: string;
  fim: string;
}

export interface FiltroPortfolio {
  busca?: string;
  arena?: ArenaTipo | '';
  etapa?: EtapaJornada | '';
  origem?: OrigemDemanda | '';
  campanhaId?: number | '';
  pagina?: number;
  tamanho?: number;
}

export interface Pagina<T> {
  itens: T[];
  total: number;
  pagina: number;
  tamanho: number;
}

export interface MetricasDashboard {
  totalProjetos: number;
  ativos: number;
  trlMedio: number;
  potencialLeiDoBem: number;
  porArena: Record<ArenaTipo, number>;
  porEtapa: Record<EtapaJornada, number>;
  porOrigem: Record<OrigemDemanda, number>;
  campanhasAbertas: number;
  aguardandoTriagem: number;
  pareceresPendentes: number;
  pautasPendentes: number;
  entregasAguardandoValidacao: number;
  dispendioTotal: number | null;
  radarMedioInicial: ScoresRadar;
  radarMedioAtual: ScoresRadar;
}

export interface AreaDemandante {
  id: number;
  sigla: string;
  nome: string;
}
