// Dados de demonstração do modo mock (revisão 2). Senha de todos os usuários de teste: sigespin123
import type {
  AvaliacaoRadar,
  Campanha,
  ConsultaEspecialista,
  Decisao,
  Entrega,
  Evidencia,
  HistoricoTransicao,
  Interacao,
  PautaGovernanca,
  Projeto,
  Qualificacao,
  RegistroMaturidade,
  Usuario,
} from '@/types/domain';

export const SENHA_DEMO = 'sigespin123';

// Campos calculados (pautaPendente, entregasAguardandoValidacao, areaDemandanteNome) não são guardados
export type ProjetoDb = Omit<Projeto, 'pautaPendente' | 'entregasAguardandoValidacao' | 'areaDemandanteNome'>;

export interface MockDb {
  usuarios: Usuario[];
  campanhas: Campanha[];
  projetos: ProjetoDb[];
  qualificacoes: Qualificacao[];
  consultas: ConsultaEspecialista[];
  maturidade: RegistroMaturidade[];
  radar: AvaliacaoRadar[];
  entregas: Entrega[];
  pautas: PautaGovernanca[];
  decisoes: Decisao[];
  evidencias: Evidencia[];
  historico: HistoricoTransicao[];
  interacoes: Interacao[];
  pedidosAcesso: { nome: string; email: string; areaId: number; perfil: string; criadoEm: string }[];
  seq: number;
}

const d = (diasAtras: number, hora = 10) => {
  const dt = new Date('2026-10-16T12:00:00-03:00');
  dt.setDate(dt.getDate() - diasAtras);
  dt.setHours(hora, 0, 0, 0);
  return dt.toISOString();
};

export const USUARIOS: Usuario[] = [
  { id: 1, nome: 'Mariana Costa', email: 'demandante@bbts.com.br', perfil: 'DEMANDANTE', ativo: true, alcadaGovernanca: false },
  { id: 2, nome: 'Rafael Lima', email: 'analista@bbts.com.br', perfil: 'ANALISTA', ativo: true, alcadaGovernanca: false },
  { id: 3, nome: 'Helena Duarte', email: 'governanca@bbts.com.br', perfil: 'ESPECIALISTA', ativo: true, areaTecnica: 'Estratégia e portfólio', alcadaGovernanca: true },
  { id: 4, nome: 'Paulo Mendes', email: 'gestor@bbts.com.br', perfil: 'ANALISTA', ativo: true, alcadaGovernanca: true },
  { id: 5, nome: 'Carla Nunes', email: 'carla.nunes@bbts.com.br', perfil: 'ANALISTA', ativo: true, alcadaGovernanca: false },
  { id: 6, nome: 'Bruno Alves', email: 'bruno.alves@bbts.com.br', perfil: 'DEMANDANTE', ativo: true, alcadaGovernanca: false },
  { id: 7, nome: 'Fernanda Rocha', email: 'especialista@bbts.com.br', perfil: 'ESPECIALISTA', ativo: true, areaTecnica: 'Segurança da informação', alcadaGovernanca: false },
  { id: 8, nome: 'João Prado', email: 'joao.prado@bbts.com.br', perfil: 'ESPECIALISTA', ativo: true, areaTecnica: 'Dados e IA', alcadaGovernanca: false },
  { id: 9, nome: 'Usuário Inativo', email: 'inativo@bbts.com.br', perfil: 'DEMANDANTE', ativo: false, alcadaGovernanca: false },
];

const u = (id: number) => {
  const x = USUARIOS.find((y) => y.id === id)!;
  return { id: x.id, nome: x.nome };
};

const CAMPANHAS: Campanha[] = [
  {
    id: 1,
    titulo: 'Desafio Agências do Futuro',
    tipo: 'DESAFIO',
    descricao: 'Como tornar o atendimento presencial mais eficiente e conectado aos canais digitais?',
    tema: 'Atendimento e agências',
    inicio: d(30),
    fim: d(-30),
    status: 'ABERTA',
    criadaPor: u(2),
  },
  {
    id: 2,
    titulo: 'Hackathon IA Responsável 2026',
    tipo: 'HACKATHON',
    descricao: 'Soluções com IA aplicadas a segurança e prevenção a fraudes, com uso responsável de dados.',
    tema: 'IA e segurança',
    inicio: d(190),
    fim: d(176),
    status: 'ENCERRADA',
    criadaPor: u(4),
  },
  {
    id: 3,
    titulo: 'Residência TakeOff · Squad 36',
    tipo: 'RESIDENCIA',
    descricao: 'Problemas reais das áreas da BBTS trabalhados pelos residentes de tecnologia.',
    tema: 'Residência tecnológica',
    inicio: d(60),
    fim: d(-90),
    status: 'ABERTA',
    criadaPor: u(2),
  },
  {
    id: 4,
    titulo: 'Campanha Eficiência 2026',
    tipo: 'CAMPANHA',
    descricao: 'Mobilização para captar ideias de redução de custo operacional e consumo de recursos.',
    tema: 'Eficiência operacional',
    inicio: d(320),
    fim: d(-60),
    status: 'ABERTA',
    criadaPor: u(4),
  },
];

const camp = (id: number) => {
  const c = CAMPANHAS.find((x) => x.id === id)!;
  return { id: c.id, titulo: c.titulo, tipo: c.tipo };
};

type P = ProjetoDb;
const base = { aguardandoComplemento: false };

const PROJETOS: P[] = [
  {
    ...base,
    id: 1,
    titulo: 'Automatizar conferência de documentos',
    descricaoDor: 'A conferência manual de documentos de abertura de conta leva em média 40 minutos por processo e gera retrabalho por erros de digitação.',
    natureza: 'PROBLEMA',
    origem: 'ESPONTANEA',
    campanha: null,
    areaDemandanteId: 1,
    demandante: u(1),
    analistaResponsavel: u(2),
    arena: 'EFICIENCIA_OPERACIONAL',
    hipoteseSolucao: 'OCR com validação por modelo de linguagem e regras de negócio para pré-conferir documentos antes da revisão humana.',
    potencialLeiDoBem: true,
    etapa: 'QUALIFICACAO',
    trlAtual: 2,
    dispendioEstimado: 180000,
    criadoEm: d(20),
    atualizadoEm: d(2),
  },
  {
    ...base,
    id: 2,
    titulo: 'Visão computacional no autoatendimento',
    descricaoDor: 'Fraudes por skimming e adulteração física de terminais de autoatendimento só são identificadas após reclamação do cliente.',
    natureza: 'PROBLEMA',
    origem: 'INDUZIDA',
    campanha: camp(2),
    areaDemandanteId: 3,
    demandante: u(6),
    analistaResponsavel: u(2),
    arena: 'SEGURANCA_INTEGRADA',
    hipoteseSolucao: 'Modelo de visão computacional embarcado no terminal para detectar anomalias físicas e acionar o monitoramento em tempo real.',
    potencialLeiDoBem: true,
    etapa: 'EXPERIMENTACAO',
    trlAtual: 4,
    dispendioEstimado: 450000,
    criadoEm: d(175),
    atualizadoEm: d(3),
  },
  {
    ...base,
    id: 3,
    titulo: 'Plataforma IoT de eficiência energética',
    descricaoDor: 'O consumo de energia das agências não é monitorado de forma contínua, dificultando ações de economia.',
    natureza: 'OPORTUNIDADE',
    origem: 'INDUZIDA',
    campanha: camp(4),
    areaDemandanteId: 1,
    demandante: u(1),
    analistaResponsavel: u(5),
    arena: 'EFICIENCIA_OPERACIONAL',
    hipoteseSolucao: 'Sensores e telemetria preditiva de climatização em agências piloto, com painel de consumo e alertas.',
    potencialLeiDoBem: true,
    etapa: 'MVP',
    trlAtual: 6,
    dispendioEstimado: 720000,
    criadoEm: d(300),
    atualizadoEm: d(1),
  },
  {
    ...base,
    id: 4,
    titulo: 'Assistente de atendimento com IA generativa',
    descricaoDor: 'Atendentes de primeiro nível gastam muito tempo procurando normas internas durante o atendimento.',
    natureza: 'NECESSIDADE',
    origem: 'ESPONTANEA',
    campanha: null,
    areaDemandanteId: 4,
    demandante: u(6),
    analistaResponsavel: u(5),
    arena: 'NEGOCIOS_DIGITAIS',
    hipoteseSolucao: 'Assistente com busca semântica nas normas internas, executado em ambiente controlado e sem dados de clientes.',
    potencialLeiDoBem: true,
    etapa: 'EXPERIMENTACAO',
    trlAtual: 3,
    dispendioEstimado: 260000,
    criadoEm: d(120),
    atualizadoEm: d(5),
  },
  {
    ...base,
    id: 5,
    titulo: 'Tokenização de garantias do agronegócio',
    descricaoDor: 'A formalização e o rastreio de garantias de crédito rural envolvem muitos documentos físicos e pouca rastreabilidade.',
    natureza: 'OPORTUNIDADE',
    origem: 'ESPONTANEA',
    campanha: null,
    areaDemandanteId: 2,
    demandante: u(1),
    analistaResponsavel: u(2),
    arena: 'NEGOCIOS_DIGITAIS',
    hipoteseSolucao: 'Registro das garantias em ledger distribuído com contratos inteligentes integrados ao fluxo de crédito.',
    potencialLeiDoBem: false,
    etapa: 'GOVERNANCA',
    trlAtual: 3,
    dispendioEstimado: 390000,
    criadoEm: d(45),
    atualizadoEm: d(4),
  },
  {
    ...base,
    id: 6,
    titulo: 'Orquestração de agentes para backoffice',
    descricaoDor: 'Tarefas repetitivas de backoffice consomem horas de equipes especializadas todos os dias.',
    natureza: 'PROBLEMA',
    origem: 'INDUZIDA',
    campanha: camp(4),
    areaDemandanteId: 4,
    demandante: u(6),
    analistaResponsavel: u(5),
    arena: 'EFICIENCIA_OPERACIONAL',
    hipoteseSolucao: 'Agentes automatizados para tarefas de primeiro nível, com supervisão humana e trilha de auditoria.',
    potencialLeiDoBem: true,
    etapa: 'CONCLUIDO',
    trlAtual: 8,
    dispendioEstimado: 950000,
    criadoEm: d(310),
    atualizadoEm: d(30),
  },
  {
    ...base,
    id: 7,
    titulo: 'Biometria comportamental em canais digitais',
    descricaoDor: 'Contas invadidas por engenharia social realizam transações antes que o cliente perceba.',
    natureza: 'PROBLEMA',
    origem: 'INDUZIDA',
    campanha: camp(2),
    areaDemandanteId: 3,
    demandante: u(1),
    analistaResponsavel: u(2),
    arena: 'SEGURANCA_INTEGRADA',
    hipoteseSolucao: 'Análise do padrão de digitação e uso do dispositivo para gerar score de risco por sessão.',
    potencialLeiDoBem: true,
    etapa: 'MVP',
    trlAtual: 7,
    dispendioEstimado: 610000,
    criadoEm: d(176),
    atualizadoEm: d(6),
  },
  {
    ...base,
    id: 8,
    titulo: 'Gestão inteligente de numerário',
    descricaoDor: 'Abastecimento de terminais é planejado por histórico simples, gerando excesso ou falta de numerário.',
    natureza: 'OPORTUNIDADE',
    origem: 'ESPONTANEA',
    campanha: null,
    areaDemandanteId: 1,
    demandante: u(6),
    analistaResponsavel: null,
    arena: 'A_DEFINIR',
    hipoteseSolucao: 'Previsão de demanda por terminal com modelos de séries temporais.',
    potencialLeiDoBem: false,
    etapa: 'BACKLOG',
    trlAtual: 1,
    dispendioEstimado: null,
    criadoEm: d(3),
    atualizadoEm: d(3),
  },
  {
    ...base,
    id: 9,
    titulo: 'Onboarding digital de fornecedores',
    descricaoDor: 'O cadastro de fornecedores depende de troca de e-mails e planilhas, levando semanas para concluir.',
    natureza: 'NECESSIDADE',
    origem: 'ESPONTANEA',
    campanha: null,
    areaDemandanteId: 2,
    demandante: u(6),
    analistaResponsavel: u(5),
    arena: 'NEGOCIOS_DIGITAIS',
    hipoteseSolucao: 'Portal de autoatendimento com validação automática de documentos e integração com o ERP.',
    potencialLeiDoBem: false,
    etapa: 'ARQUIVADO',
    trlAtual: 2,
    dispendioEstimado: null,
    criadoEm: d(90),
    atualizadoEm: d(70),
  },
  {
    ...base,
    id: 10,
    titulo: 'Detecção de anomalias em rede corporativa',
    descricaoDor: 'Ataques internos e movimentações laterais demoram a ser identificados no ambiente corporativo.',
    natureza: 'PROBLEMA',
    origem: 'ESPONTANEA',
    campanha: null,
    areaDemandanteId: 3,
    demandante: u(1),
    analistaResponsavel: u(5),
    arena: 'SEGURANCA_INTEGRADA',
    hipoteseSolucao: 'Modelo de detecção de anomalias sobre telemetria de rede com resposta automatizada.',
    potencialLeiDoBem: true,
    etapa: 'EXPERIMENTACAO',
    trlAtual: 5,
    dispendioEstimado: 380000,
    criadoEm: d(150),
    atualizadoEm: d(8),
  },
  {
    ...base,
    id: 11,
    titulo: 'Trilhas de capacitação personalizadas',
    descricaoDor: 'Colaboradores não encontram cursos alinhados às competências exigidas pelas novas tecnologias.',
    natureza: 'NECESSIDADE',
    origem: 'INDUZIDA',
    campanha: camp(3),
    areaDemandanteId: 5,
    demandante: u(1),
    analistaResponsavel: u(2),
    arena: 'EFICIENCIA_OPERACIONAL',
    hipoteseSolucao: 'Recomendação de trilhas com base no mapa de competências e no histórico de cursos.',
    potencialLeiDoBem: false,
    etapa: 'BACKLOG',
    trlAtual: 2,
    dispendioEstimado: null,
    aguardandoComplemento: true,
    criadoEm: d(18),
    atualizadoEm: d(6),
  },
  {
    ...base,
    id: 12,
    titulo: 'Gêmeo digital de agências',
    descricaoDor: 'Reformas e mudanças de layout das agências são planejadas sem simulação do fluxo de clientes.',
    natureza: 'OPORTUNIDADE',
    origem: 'INDUZIDA',
    campanha: camp(1),
    areaDemandanteId: 1,
    demandante: u(6),
    analistaResponsavel: null,
    arena: 'NEGOCIOS_DIGITAIS',
    hipoteseSolucao: 'Modelo 3D com simulação de fluxo para testar layouts antes da obra.',
    potencialLeiDoBem: true,
    etapa: 'BACKLOG',
    trlAtual: 1,
    dispendioEstimado: null,
    criadoEm: d(2),
    atualizadoEm: d(2),
  },
  {
    ...base,
    id: 13,
    titulo: 'Totem de atendimento por voz',
    descricaoDor: 'Clientes com baixa familiaridade digital têm dificuldade em usar os terminais de autoatendimento.',
    natureza: 'NECESSIDADE',
    origem: 'INDUZIDA',
    campanha: camp(1),
    areaDemandanteId: 2,
    demandante: u(1),
    analistaResponsavel: u(5),
    arena: 'NEGOCIOS_DIGITAIS',
    hipoteseSolucao: 'Interface por voz com reconhecimento de fala executado localmente no terminal.',
    potencialLeiDoBem: true,
    etapa: 'DESCONTINUADO',
    trlAtual: 4,
    dispendioEstimado: 210000,
    criadoEm: d(28),
    atualizadoEm: d(10),
  },
];

function radar(id: number, projetoId: number, tipo: 'INICIAL' | 'ATUAL', n: number, p: number, t: number, r: number, dias: number): AvaliacaoRadar {
  return { id, projetoId, tipoLeitura: tipo, scoreNegocio: n, scoreProduto: p, scoreTime: t, scoreReceita: r, dataAvaliacao: d(dias) };
}

const RADAR: AvaliacaoRadar[] = [
  radar(1, 1, 'INICIAL', 2.5, 1.5, 2.0, 1.0, 20),
  radar(2, 2, 'INICIAL', 2.0, 1.5, 2.0, 1.0, 175),
  radar(3, 2, 'ATUAL', 3.0, 2.5, 3.0, 1.5, 30),
  radar(4, 3, 'INICIAL', 2.0, 2.0, 1.5, 1.5, 300),
  radar(5, 3, 'ATUAL', 3.0, 3.0, 2.5, 2.0, 120),
  radar(6, 3, 'ATUAL', 3.5, 3.25, 3.0, 2.75, 15),
  radar(7, 4, 'INICIAL', 3.0, 2.0, 2.5, 1.5, 120),
  radar(8, 5, 'INICIAL', 2.5, 1.0, 1.5, 2.0, 45),
  radar(9, 6, 'INICIAL', 2.5, 2.0, 2.0, 1.5, 310),
  radar(10, 6, 'ATUAL', 3.75, 3.5, 3.5, 3.25, 35),
  radar(11, 7, 'INICIAL', 3.0, 1.5, 2.0, 1.5, 176),
  radar(12, 7, 'ATUAL', 3.5, 3.0, 3.0, 2.5, 10),
  radar(13, 8, 'INICIAL', 1.5, 1.0, 1.0, 1.0, 3),
  radar(14, 9, 'INICIAL', 2.0, 1.5, 1.5, 1.0, 90),
  radar(15, 10, 'INICIAL', 2.5, 2.0, 2.5, 1.0, 150),
  radar(16, 10, 'ATUAL', 3.0, 2.75, 3.0, 1.5, 20),
  radar(17, 11, 'INICIAL', 2.0, 1.5, 2.0, 0.5, 18),
  radar(18, 12, 'INICIAL', 2.0, 1.5, 2.0, 1.5, 2),
  radar(19, 13, 'INICIAL', 2.5, 2.0, 1.5, 1.0, 28),
];

const ev = (id: number, projetoId: number, nome: string, tipo: string, tam: number, dias: number, por: number, vinculo: Evidencia['vinculo']): Evidencia => ({
  id,
  projetoId,
  nomeArquivo: nome,
  tipoArquivo: tipo,
  tamanhoBytes: tam,
  dataUpload: d(dias),
  enviadaPor: u(por),
  vinculo,
});
const PDF = 'application/pdf';
const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const EVIDENCIAS: Evidencia[] = [
  ev(1, 2, 'Relatorio_Testes_Bancada_TRL4.pdf', PDF, 4400000, 40, 2, { tipo: 'MATURIDADE', id: 1 }),
  ev(2, 2, 'Parecer_Ciberseguranca_DISEG.pdf', PDF, 870000, 50, 2, { tipo: 'GERAL', id: null }),
  ev(3, 7, 'Metricas_Piloto_Biometria.pdf', PDF, 2800000, 10, 2, { tipo: 'MATURIDADE', id: 2 }),
  ev(4, 3, 'Consumo_Agencias_Piloto.xlsx', XLSX, 640000, 1, 5, { tipo: 'ENTREGA', id: 1 }),
  ev(5, 7, 'Painel_Score_Risco_v1.pdf', PDF, 1500000, 12, 2, { tipo: 'ENTREGA', id: 2 }),
  ev(6, 6, 'Relatorio_Final_Agentes.pdf', PDF, 3100000, 32, 5, { tipo: 'ENTREGA', id: 3 }),
  ev(7, 1, 'Fluxo_Atual_Conferencia.pdf', PDF, 900000, 19, 1, { tipo: 'GERAL', id: null }),
  ev(8, 10, 'Relatorio_Sandbox_Rede.pdf', PDF, 3200000, 20, 5, { tipo: 'MATURIDADE', id: 3 }),
];

const MATURIDADE: RegistroMaturidade[] = [
  { id: 1, projetoId: 2, responsavel: u(2), trlAnterior: 3, trlNovo: 4, justificativa: 'Componentes integrados e testados em bancada com 98,4% de acurácia.', evidencias: [], radarId: 3, criadoEm: d(40) },
  { id: 2, projetoId: 7, responsavel: u(2), trlAnterior: 6, trlNovo: 7, justificativa: 'Piloto com 50 mil sessões avaliadas e redução de 31% nas fraudes confirmadas.', evidencias: [], radarId: 12, criadoEm: d(10) },
  { id: 3, projetoId: 10, responsavel: u(5), trlAnterior: 4, trlNovo: 5, justificativa: 'Testes em sandbox com telemetria real anonimizada.', evidencias: [], radarId: 16, criadoEm: d(20) },
];

const QUALIFICACOES: Qualificacao[] = [
  { id: 1, projetoId: 5, analista: u(2), aderenciaTese: 4, relevancia: 4, grauInovacao: 5, viabilidade: 3, trlAvaliado: 3, parecer: 'Alto potencial, mas exige integração com o fluxo de crédito e investimento relevante. Precisa de priorização.', recomendacao: 'ENCAMINHAR_GOVERNANCA', criadaEm: d(4) },
  { id: 2, projetoId: 4, analista: u(5), aderenciaTese: 4, relevancia: 4, grauInovacao: 3, viabilidade: 5, trlAvaliado: 3, parecer: 'Baixo custo e risco controlado, sem dados de clientes. Pode seguir para experimentação na alçada da equipe.', recomendacao: 'INICIAR_EXPERIMENTACAO', criadaEm: d(100) },
  { id: 3, projetoId: 9, analista: u(5), aderenciaTese: 2, relevancia: 3, grauInovacao: 1, viabilidade: 4, trlAvaliado: 2, parecer: 'Solução de mercado já contratada pela área de compras. Sem grau de inovação.', recomendacao: 'ARQUIVAR', criadaEm: d(70) },
  { id: 4, projetoId: 11, analista: u(2), aderenciaTese: 3, relevancia: 3, grauInovacao: 3, viabilidade: 3, trlAvaliado: 2, parecer: 'Falta indicar quais competências são prioritárias e o volume de colaboradores impactados.', recomendacao: 'DEVOLVER_DEMANDANTE', criadaEm: d(6) },
  { id: 5, projetoId: 2, analista: u(2), aderenciaTese: 5, relevancia: 5, grauInovacao: 4, viabilidade: 3, trlAvaliado: 3, parecer: 'Problema crítico de segurança, solução vencedora do hackathon. Encaminhar para priorização.', recomendacao: 'ENCAMINHAR_GOVERNANCA', criadaEm: d(160) },
];

const CONSULTAS: ConsultaEspecialista[] = [
  { id: 1, projetoId: 1, solicitante: u(2), especialista: u(8), areaTecnica: 'Dados e IA', pergunta: 'O uso de LLM para validar documentos atende às diretrizes de IA responsável? Qual a maturidade real do OCR proposto?', status: 'PENDENTE', parecer: null, recomendacao: null, trlSugerido: null, criadaEm: d(2), respondidaEm: null },
  { id: 2, projetoId: 2, solicitante: u(2), especialista: u(7), areaTecnica: 'Segurança da informação', pergunta: 'O modelo embarcado no terminal cria novos vetores de ataque?', status: 'RESPONDIDA', parecer: 'Sem novos vetores relevantes, desde que o modelo seja assinado e atualizado pelo canal seguro existente.', recomendacao: 'FAVORAVEL_COM_RESSALVAS', trlSugerido: 4, criadaEm: d(45), respondidaEm: d(42) },
  { id: 3, projetoId: 5, solicitante: u(2), especialista: null, areaTecnica: 'Segurança da informação', pergunta: 'Quais riscos de custódia de chaves no uso de ledger distribuído para garantias?', status: 'PENDENTE', parecer: null, recomendacao: null, trlSugerido: null, criadaEm: d(3), respondidaEm: null },
];

const ENTREGAS: Entrega[] = [
  { id: 1, projetoId: 3, etapa: 'MVP', titulo: 'Painel de consumo das 10 agências piloto', descricao: 'Painel com consumo por agência, alertas de climatização e relatório mensal de economia.', registradaPor: u(5), registradaEm: d(1), status: 'AGUARDANDO_VALIDACAO', validadaPor: null, comentarioValidacao: null, validadaEm: null, evidencias: [] },
  { id: 2, projetoId: 7, etapa: 'MVP', titulo: 'Score de risco por sessão no app', descricao: 'Score exibido para a equipe antifraude com explicação dos fatores de risco.', registradaPor: u(2), registradaEm: d(12), status: 'VALIDADA', validadaPor: u(1), comentarioValidacao: 'Atende ao problema. A equipe antifraude já usa o score na triagem diária.', validadaEm: d(9), evidencias: [] },
  { id: 3, projetoId: 6, etapa: 'MVP', titulo: 'Agentes em produção para tarefas N1', descricao: 'Agentes operando três rotinas de backoffice com supervisão humana.', registradaPor: u(5), registradaEm: d(33), status: 'VALIDADA', validadaPor: u(6), comentarioValidacao: 'Redução de 60% no tempo das rotinas. Validado.', validadaEm: d(31), evidencias: [] },
];

const PAUTAS: PautaGovernanca[] = [
  { id: 1, projetoId: 5, encaminhadaPor: u(2), motivo: 'Qualificação concluída. Precisa de priorização para iniciar a experimentação.', etapaAtual: 'GOVERNANCA', etapaProposta: 'EXPERIMENTACAO', status: 'PENDENTE', decisaoId: null, criadaEm: d(4) },
  { id: 2, projetoId: 2, encaminhadaPor: u(2), motivo: 'PoC concluída com sucesso em bancada. Proposta de piloto em 25 agências, com investimento adicional.', etapaAtual: 'EXPERIMENTACAO', etapaProposta: 'MVP', status: 'PENDENTE', decisaoId: null, criadaEm: d(3) },
  { id: 3, projetoId: 2, encaminhadaPor: u(2), motivo: 'Qualificação concluída. Encaminhada para priorização.', etapaAtual: 'GOVERNANCA', etapaProposta: 'EXPERIMENTACAO', status: 'DECIDIDA', decisaoId: 1, criadaEm: d(158) },
  { id: 4, projetoId: 13, encaminhadaPor: u(5), motivo: 'Testes iniciais mostraram baixa precisão em ambiente ruidoso.', etapaAtual: 'EXPERIMENTACAO', etapaProposta: null, status: 'DECIDIDA', decisaoId: 3, criadaEm: d(12) },
];

const DECISOES: Decisao[] = [
  { id: 1, projetoId: 2, pautaId: 3, responsavel: u(3), decisao: 'APROVADO', justificativa: 'Prioridade alta para segurança. Aprovada a experimentação.', novaHipotese: null, dataDecisao: d(155) },
  { id: 2, projetoId: 2, pautaId: null, responsavel: u(3), decisao: 'PIVOTADO', justificativa: 'Hardware dedicado inviável em escala.', novaHipotese: 'Modelo embarcado no terminal existente.', dataDecisao: d(90) },
  { id: 3, projetoId: 13, pautaId: 4, responsavel: u(3), decisao: 'REPROVADO', justificativa: 'Precisão insuficiente e custo de hardware acima do previsto. Descontinuado.', novaHipotese: null, dataDecisao: d(10) },
];

const h = (id: number, projetoId: number, usuario: number, tipo: HistoricoTransicao['tipoMudanca'], de: string, para: string, dias: number, motivo: string | null = null): HistoricoTransicao => ({
  id,
  projetoId,
  usuario: u(usuario),
  tipoMudanca: tipo,
  valorAnterior: de,
  valorNovo: para,
  motivo,
  dataMudanca: d(dias),
});

const HISTORICO: HistoricoTransicao[] = [
  h(1, 1, 2, 'ETAPA', 'BACKLOG', 'QUALIFICACAO', 18, 'Triagem iniciada'),
  h(2, 2, 2, 'ETAPA', 'QUALIFICACAO', 'GOVERNANCA', 160, 'Encaminhada à governança'),
  h(3, 2, 3, 'ETAPA', 'GOVERNANCA', 'EXPERIMENTACAO', 155, 'Decisão de governança'),
  h(4, 2, 3, 'HIPOTESE', 'Câmeras dedicadas instaladas em cada terminal.', 'Modelo embarcado no terminal existente.', 90, 'Pivotamento'),
  h(5, 2, 2, 'TRL', '3', '4', 40, 'Atualização de maturidade'),
  h(6, 7, 2, 'TRL', '6', '7', 10, 'Atualização de maturidade'),
  h(7, 5, 2, 'ETAPA', 'QUALIFICACAO', 'GOVERNANCA', 4, 'Encaminhada à governança'),
  h(8, 4, 5, 'ETAPA', 'QUALIFICACAO', 'EXPERIMENTACAO', 100, 'Qualificação dentro da alçada da equipe'),
  h(9, 9, 5, 'ETAPA', 'QUALIFICACAO', 'ARQUIVADO', 70, 'Arquivada na qualificação'),
  h(10, 11, 2, 'ETAPA', 'QUALIFICACAO', 'BACKLOG', 6, 'Devolvida ao demandante para complemento'),
  h(11, 13, 3, 'ETAPA', 'EXPERIMENTACAO', 'DESCONTINUADO', 10, 'Decisão de governança'),
  h(12, 6, 5, 'ETAPA', 'MVP', 'CONCLUIDO', 30, 'Entrega validada pelo demandante'),
  h(13, 10, 5, 'TRL', '4', '5', 20, 'Atualização de maturidade'),
];

const it = (id: number, projetoId: number, autor: number, texto: string, dias: number, hora = 10): Interacao => ({
  id,
  projetoId,
  autor: u(autor),
  perfil: USUARIOS.find((x) => x.id === autor)!.perfil,
  texto,
  criadaEm: d(dias, hora),
});

const INTERACOES: Interacao[] = [
  it(1, 1, 2, 'Mariana, você consegue estimar quantos processos de abertura de conta passam pela conferência por mês?', 3, 9),
  it(2, 1, 1, 'Cerca de 12 mil processos por mês, concentrados nas agências da DIOPE. Posso enviar a planilha do último trimestre.', 3, 14),
  it(3, 3, 5, 'O painel das 10 agências piloto está disponível. Pedimos a sua validação na aba Entregas.', 1, 11),
  it(4, 7, 1, 'A equipe antifraude pediu para incluir o horário da sessão entre os fatores de risco.', 11, 15),
  it(5, 7, 2, 'Incluído na versão atual do score. Obrigado pelo retorno!', 10, 9),
];

export function criarSeed(): MockDb {
  const db: MockDb = structuredClone({
    usuarios: USUARIOS,
    campanhas: CAMPANHAS,
    projetos: PROJETOS,
    qualificacoes: QUALIFICACOES,
    consultas: CONSULTAS,
    maturidade: MATURIDADE,
    radar: RADAR,
    entregas: ENTREGAS,
    pautas: PAUTAS,
    decisoes: DECISOES,
    evidencias: EVIDENCIAS,
    historico: HISTORICO,
    interacoes: INTERACOES,
    pedidosAcesso: [],
    seq: 1000,
  });
  // Liga as evidências aos registros que elas fundamentam
  for (const m of db.maturidade) m.evidencias = db.evidencias.filter((e) => e.vinculo.tipo === 'MATURIDADE' && e.vinculo.id === m.id);
  for (const en of db.entregas) en.evidencias = db.evidencias.filter((e) => e.vinculo.tipo === 'ENTREGA' && e.vinculo.id === en.id);
  return db;
}
