// Dados de demonstração do modo mock (Fase 3). Senha de todos os usuários de teste: sigespin123
// Guia, seção 4: dois Demandantes, um Analista e dois Especialistas; projetos em Ideação, POC e etapa
// terminal; um projeto arquivado; um projeto legado sem Demandante; uma recomendação e um pedido de
// governança pendentes; percursos iniciais governados e um percurso livre para a movimentação direta do Analista.
import type {
  AvaliacaoRadar,
  AvaliacaoTrl,
  Campanha,
  ConsultaEspecialista,
  Correcao,
  Entrega,
  EtapaKanban,
  Evidencia,
  HistoricoGestao,
  HistoricoTransicao,
  Interacao,
  Notificacao,
  Parecer,
  PropostaConfiguracao,
  Qualificacao,
  Recomendacao,
  SolicitacaoTransicao,
  TransicaoKanban,
  Usuario,
} from '@/types/domain';

export const SENHA_DEMO = 'sigespin123';

// Projeto como fica guardado: etapa e pessoas por id; pendências e nomes são calculados
export interface ProjetoDb {
  id: number;
  titulo: string;
  descricaoDor: string;
  origem: 'ESPONTANEA' | 'INDUZIDA';
  campanhaId: number | null;
  areaDemandanteId: number;
  demandanteId: number | null;
  analistaId: number | null;
  arena: 'EFICIENCIA_OPERACIONAL' | 'NEGOCIOS_DIGITAIS' | 'SEGURANCA_INTEGRADA' | 'A_DEFINIR';
  hipoteseSolucao: string | null;
  potencialLeiDoBem: boolean | null;
  dispendioEstimado: number | null;
  etapaId: number;
  trlAtual: number;
  arquivado: boolean;
  motivoArquivamento: string | null;
  arquivadoEm: string | null;
  versao: number;
  recomendacaoId: number | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface MockDb {
  usuarios: Usuario[];
  campanhas: Campanha[];
  etapas: EtapaKanban[];
  transicoes: TransicaoKanban[];
  propostas: PropostaConfiguracao[];
  projetos: ProjetoDb[];
  qualificacoes: Qualificacao[];
  consultas: ConsultaEspecialista[];
  pareceres: Parecer[];
  avaliacoesTrl: AvaliacaoTrl[];
  radar: AvaliacaoRadar[];
  solicitacoes: SolicitacaoTransicao[];
  entregas: Entrega[];
  correcoes: Correcao[];
  evidencias: Evidencia[];
  historico: HistoricoTransicao[];
  historicoGestao: HistoricoGestao[];
  interacoes: Interacao[];
  recomendacoes: Recomendacao[];
  notificacoes: Notificacao[];
  seq: number;
}

const d = (diasAtras: number, hora = 10) => {
  const dt = new Date('2026-11-13T12:00:00-03:00');
  dt.setDate(dt.getDate() - diasAtras);
  dt.setHours(hora, 0, 0, 0);
  return dt.toISOString();
};

export const USUARIOS: Usuario[] = [
  { id: 1, nome: 'Mariana Costa', email: 'demandante@bbts.com.br', perfil: 'DEMANDANTE', ativo: true },
  { id: 6, nome: 'Bruno Alves', email: 'bruno.alves@bbts.com.br', perfil: 'DEMANDANTE', ativo: true },
  { id: 2, nome: 'Rafael Lima', email: 'analista@bbts.com.br', perfil: 'ANALISTA', ativo: true },
  { id: 7, nome: 'Fernanda Rocha', email: 'especialista@bbts.com.br', perfil: 'ESPECIALISTA', ativo: true, areaTecnica: 'Segurança da informação' },
  { id: 8, nome: 'João Prado', email: 'joao.prado@bbts.com.br', perfil: 'ESPECIALISTA', ativo: true, areaTecnica: 'Dados e IA' },
  { id: 9, nome: 'Usuário Inativo', email: 'inativo@bbts.com.br', perfil: 'DEMANDANTE', ativo: false },
];

// Usuários do seletor de acesso simulado, na ordem do guia
export const USUARIOS_SELETOR = [1, 6, 2, 7, 8];

export const u = (id: number) => {
  const x = USUARIOS.find((y) => y.id === id)!;
  return { id: x.id, nome: x.nome };
};

// Colunas iniciais (guia, seção 3): Concluído e Descontinuado são terminais
const ETAPAS: EtapaKanban[] = [
  { id: 1, codigo: 'IDEACAO', nome: 'Ideação', descricao: 'Demanda registrada, em triagem e qualificação.', ordem: 10, cor: '#F59E0B', ativa: true, tipoTerminal: null, terminal: false, versao: 1 },
  { id: 2, codigo: 'POC', nome: 'POC', descricao: 'Prova de conceito em andamento.', ordem: 20, cor: '#0EA5E9', ativa: true, tipoTerminal: null, terminal: false, versao: 1 },
  { id: 3, codigo: 'MVP', nome: 'MVP', descricao: 'Produto mínimo viável ou piloto.', ordem: 30, cor: '#6366F1', ativa: true, tipoTerminal: null, terminal: false, versao: 1 },
  { id: 4, codigo: 'CONCLUIDO', nome: 'Concluído', descricao: 'Jornada encerrada com resultado.', ordem: 40, cor: '#10B981', ativa: true, tipoTerminal: 'CONCLUSAO', terminal: true, versao: 1 },
  { id: 5, codigo: 'DESCONTINUADO', nome: 'Descontinuado', descricao: 'Iniciativa interrompida.', ordem: 50, cor: '#F43F5E', ativa: true, tipoTerminal: 'DESCONTINUACAO', terminal: true, versao: 1 },
];

// Percursos iniciais: todos governados. O percurso livre POC → Ideação demonstra a movimentação direta do Analista.
const TRANSICOES: TransicaoKanban[] = [
  { id: 1, origemId: 1, destinoId: 2, exigeGovernanca: true, ativa: true, versao: 1 },
  { id: 2, origemId: 2, destinoId: 3, exigeGovernanca: true, ativa: true, versao: 1 },
  { id: 3, origemId: 3, destinoId: 4, exigeGovernanca: true, ativa: true, versao: 1 },
  { id: 4, origemId: 1, destinoId: 5, exigeGovernanca: true, ativa: true, versao: 1 },
  { id: 5, origemId: 2, destinoId: 5, exigeGovernanca: true, ativa: true, versao: 1 },
  { id: 6, origemId: 3, destinoId: 5, exigeGovernanca: true, ativa: true, versao: 1 },
  { id: 7, origemId: 2, destinoId: 1, exigeGovernanca: false, ativa: true, versao: 1 },
];

const er = (id: number) => {
  const e = ETAPAS.find((x) => x.id === id)!;
  return { id: e.id, nome: e.nome, cor: e.cor, terminal: e.terminal };
};

const CAMPANHAS: Campanha[] = [
  { id: 1, titulo: 'Desafio Agências do Futuro', tipo: 'DESAFIO', descricao: 'Como tornar o atendimento presencial mais eficiente e conectado aos canais digitais?', tema: 'Atendimento e agências', inicio: d(30), fim: d(-30), status: 'ABERTA' },
  { id: 2, titulo: 'Hackathon IA Responsável 2026', tipo: 'HACKATHON', descricao: 'Soluções com IA aplicadas a segurança e prevenção a fraudes, com uso responsável de dados.', tema: 'IA e segurança', inicio: d(190), fim: d(176), status: 'ENCERRADA' },
  { id: 3, titulo: 'Residência TakeOff · Squad 36', tipo: 'RESIDENCIA', descricao: 'Problemas reais das áreas da BBTS trabalhados pelos residentes de tecnologia.', tema: 'Residência tecnológica', inicio: d(60), fim: d(-90), status: 'ABERTA' },
  { id: 4, titulo: 'Campanha Eficiência 2026', tipo: 'CAMPANHA', descricao: 'Mobilização para captar ideias de redução de custo operacional e consumo de recursos.', tema: 'Eficiência operacional', inicio: d(320), fim: d(-60), status: 'ABERTA' },
];

type Base = Omit<ProjetoDb, 'arquivado' | 'motivoArquivamento' | 'arquivadoEm' | 'versao' | 'recomendacaoId' | 'dispendioEstimado'> &
  Partial<Pick<ProjetoDb, 'arquivado' | 'motivoArquivamento' | 'arquivadoEm' | 'versao' | 'recomendacaoId' | 'dispendioEstimado'>>;
const P = (x: Base): ProjetoDb => ({ arquivado: false, motivoArquivamento: null, arquivadoEm: null, versao: 1, recomendacaoId: null, dispendioEstimado: null, ...x });

const PROJETOS: ProjetoDb[] = [
  P({ id: 1, titulo: 'Automatizar conferência de documentos', descricaoDor: 'A conferência manual de documentos de abertura de conta leva em média 40 minutos por processo e gera retrabalho por erros de digitação. São cerca de 12 mil processos por mês nas agências da DIOPE.', origem: 'ESPONTANEA', campanhaId: null, areaDemandanteId: 1, demandanteId: 1, analistaId: 2, arena: 'EFICIENCIA_OPERACIONAL', hipoteseSolucao: 'OCR com validação por modelo de linguagem e regras de negócio para pré-conferir documentos antes da revisão humana.', potencialLeiDoBem: true, dispendioEstimado: 180000, etapaId: 1, trlAtual: 2, criadoEm: d(20), atualizadoEm: d(2) }),
  P({ id: 2, titulo: 'Visão computacional no autoatendimento', descricaoDor: 'Fraudes por skimming e adulteração física de terminais só são identificadas após reclamação do cliente.', origem: 'INDUZIDA', campanhaId: 2, areaDemandanteId: 3, demandanteId: 6, analistaId: 2, arena: 'SEGURANCA_INTEGRADA', hipoteseSolucao: 'Modelo de visão computacional embarcado no terminal para detectar anomalias físicas em tempo real.', potencialLeiDoBem: true, dispendioEstimado: 450000, etapaId: 2, trlAtual: 4, criadoEm: d(175), atualizadoEm: d(3) }),
  P({ id: 3, titulo: 'Plataforma IoT de eficiência energética', descricaoDor: 'O consumo de energia das agências não é monitorado de forma contínua, dificultando ações de economia.', origem: 'INDUZIDA', campanhaId: 4, areaDemandanteId: 1, demandanteId: 1, analistaId: 2, arena: 'EFICIENCIA_OPERACIONAL', hipoteseSolucao: 'Sensores e telemetria preditiva de climatização em agências piloto, com painel de consumo e alertas.', potencialLeiDoBem: true, dispendioEstimado: 320000, etapaId: 3, trlAtual: 6, criadoEm: d(300), atualizadoEm: d(1) }),
  P({ id: 4, titulo: 'Assistente de atendimento com IA generativa', descricaoDor: 'Atendentes de primeiro nível gastam muito tempo procurando normas internas durante o atendimento.', origem: 'ESPONTANEA', campanhaId: null, areaDemandanteId: 4, demandanteId: 6, analistaId: 2, arena: 'NEGOCIOS_DIGITAIS', hipoteseSolucao: 'Assistente com busca semântica nas normas internas, sem dados de clientes.', potencialLeiDoBem: true, etapaId: 2, trlAtual: 3, criadoEm: d(120), atualizadoEm: d(5) }),
  P({ id: 5, titulo: 'Tokenização de garantias do agronegócio', descricaoDor: 'A formalização e o rastreio de garantias de crédito rural envolvem muitos documentos físicos e pouca rastreabilidade.', origem: 'ESPONTANEA', campanhaId: null, areaDemandanteId: 2, demandanteId: 1, analistaId: 2, arena: 'NEGOCIOS_DIGITAIS', hipoteseSolucao: 'Registro das garantias em ledger distribuído com contratos inteligentes integrados ao fluxo de crédito.', potencialLeiDoBem: false, recomendacaoId: 3, etapaId: 1, trlAtual: 3, criadoEm: d(45), atualizadoEm: d(4) }),
  P({ id: 6, titulo: 'Orquestração de agentes para backoffice', descricaoDor: 'Tarefas repetitivas de backoffice consomem horas de equipes especializadas todos os dias.', origem: 'INDUZIDA', campanhaId: 4, areaDemandanteId: 4, demandanteId: 6, analistaId: 2, arena: 'EFICIENCIA_OPERACIONAL', hipoteseSolucao: 'Agentes automatizados para tarefas de primeiro nível, com supervisão humana e trilha de auditoria.', potencialLeiDoBem: true, dispendioEstimado: 610000, etapaId: 4, trlAtual: 8, criadoEm: d(310), atualizadoEm: d(30) }),
  P({ id: 7, titulo: 'Biometria comportamental em canais digitais', descricaoDor: 'Contas invadidas por engenharia social realizam transações antes que o cliente perceba.', origem: 'INDUZIDA', campanhaId: 2, areaDemandanteId: 3, demandanteId: 1, analistaId: 2, arena: 'SEGURANCA_INTEGRADA', hipoteseSolucao: 'Análise do padrão de digitação e uso do dispositivo para gerar score de risco por sessão.', potencialLeiDoBem: true, etapaId: 3, trlAtual: 7, criadoEm: d(176), atualizadoEm: d(6) }),
  // Projeto legado: chegou da migração sem Demandante vinculado
  P({ id: 8, titulo: 'Gestão inteligente de numerário', descricaoDor: 'Abastecimento de terminais é planejado por histórico simples, gerando excesso ou falta de numerário.', origem: 'ESPONTANEA', campanhaId: null, areaDemandanteId: 1, demandanteId: null, analistaId: null, arena: 'A_DEFINIR', hipoteseSolucao: 'Previsão de demanda por terminal com modelos de séries temporais.', potencialLeiDoBem: null, etapaId: 1, trlAtual: 1, criadoEm: d(420), atualizadoEm: d(10) }),
  P({ id: 9, titulo: 'Onboarding digital de fornecedores', descricaoDor: 'O cadastro de fornecedores depende de troca de e-mails e planilhas, levando semanas para concluir.', origem: 'ESPONTANEA', campanhaId: null, areaDemandanteId: 2, demandanteId: 6, analistaId: 2, arena: 'NEGOCIOS_DIGITAIS', hipoteseSolucao: 'Portal de autoatendimento com validação automática de documentos.', potencialLeiDoBem: false, etapaId: 5, trlAtual: 2, arquivado: true, motivoArquivamento: 'Projeto descontinuado: solução equivalente já contratada pela área de compras.', arquivadoEm: d(60), versao: 2, criadoEm: d(90), atualizadoEm: d(60) }),
  P({ id: 10, titulo: 'Detecção de anomalias em rede corporativa', descricaoDor: 'Ataques internos e movimentações laterais demoram a ser identificados no ambiente corporativo.', origem: 'ESPONTANEA', campanhaId: null, areaDemandanteId: 3, demandanteId: 1, analistaId: 2, arena: 'SEGURANCA_INTEGRADA', hipoteseSolucao: 'Modelo de detecção de anomalias sobre telemetria de rede com resposta automatizada.', potencialLeiDoBem: true, etapaId: 2, trlAtual: 5, criadoEm: d(150), atualizadoEm: d(8) }),
  P({ id: 11, titulo: 'Trilhas de capacitação personalizadas', descricaoDor: 'Colaboradores não encontram cursos alinhados às competências exigidas pelas novas tecnologias.', origem: 'INDUZIDA', campanhaId: 3, areaDemandanteId: 5, demandanteId: 1, analistaId: null, arena: 'A_DEFINIR', hipoteseSolucao: 'Recomendação de trilhas com base no mapa de competências e no histórico de cursos.', potencialLeiDoBem: null, etapaId: 1, trlAtual: 2, criadoEm: d(6), atualizadoEm: d(6) }),
  P({ id: 12, titulo: 'Gêmeo digital de agências', descricaoDor: 'Reformas e mudanças de layout das agências são planejadas sem simulação do fluxo de clientes.', origem: 'INDUZIDA', campanhaId: 1, areaDemandanteId: 1, demandanteId: 6, analistaId: null, arena: 'A_DEFINIR', hipoteseSolucao: null, potencialLeiDoBem: null, etapaId: 1, trlAtual: 1, criadoEm: d(2), atualizadoEm: d(2) }),
];

function radar(id: number, projetoId: number, tipo: 'INICIAL' | 'ATUAL', n: number, p: number, t: number, r: number, dias: number): AvaliacaoRadar {
  return { id, projetoId, tipoLeitura: tipo, scoreNegocio: n, scoreProduto: p, scoreTime: t, scoreReceita: r, dataAvaliacao: d(dias) };
}

const RADAR: AvaliacaoRadar[] = [
  radar(1, 1, 'INICIAL', 2.5, 1.5, 2.0, 1.0, 20),
  radar(2, 2, 'INICIAL', 2.0, 1.5, 2.0, 1.0, 175),
  radar(3, 2, 'ATUAL', 3.0, 2.5, 3.0, 1.5, 30),
  radar(4, 3, 'INICIAL', 2.0, 2.0, 1.5, 1.5, 300),
  radar(5, 3, 'ATUAL', 3.5, 3.25, 3.0, 2.75, 15),
  radar(6, 4, 'INICIAL', 3.0, 2.0, 2.5, 1.5, 120),
  radar(7, 5, 'INICIAL', 2.5, 1.0, 1.5, 2.0, 45),
  radar(8, 6, 'INICIAL', 2.5, 2.0, 2.0, 1.5, 310),
  radar(9, 6, 'ATUAL', 3.75, 3.5, 3.5, 3.25, 35),
  radar(10, 7, 'INICIAL', 3.0, 1.5, 2.0, 1.5, 176),
  radar(11, 7, 'ATUAL', 3.5, 3.0, 3.0, 2.5, 10),
  radar(12, 8, 'INICIAL', 1.5, 1.0, 1.0, 1.0, 420),
  radar(13, 9, 'INICIAL', 2.0, 1.5, 1.5, 1.0, 90),
  radar(14, 10, 'INICIAL', 2.5, 2.0, 2.5, 1.0, 150),
  radar(15, 11, 'INICIAL', 2.0, 1.5, 2.0, 0.5, 6),
  radar(16, 12, 'INICIAL', 2.0, 1.5, 2.0, 1.5, 2),
];

const PDF = 'application/pdf';
const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
const ev = (id: number, projetoId: number, nome: string, tipo: string, tam: number, dias: number, por: number, descricao: string): Evidencia => ({
  id,
  projetoId,
  nomeArquivo: nome,
  tipoArquivo: tipo,
  tamanhoBytes: tam,
  dataUpload: d(dias),
  enviadaPor: u(por),
  estadoEnvio: 'ENVIADO',
  descricao,
});

// Evidências fictícias já vinculadas aos projetos, para testar a seleção nos formulários
const EVIDENCIAS: Evidencia[] = [
  ev(1, 2, 'Relatorio_Testes_Bancada_TRL4.pdf', PDF, 4400000, 40, 2, 'Relatório dos testes em bancada'),
  ev(2, 2, 'Plano_Piloto_25_Agencias.pdf', PDF, 1200000, 3, 2, 'Plano do piloto'),
  ev(3, 7, 'Metricas_Piloto_Biometria.pdf', PDF, 2800000, 10, 2, 'Métricas do piloto'),
  ev(4, 3, 'Consumo_Agencias_Piloto.xlsx', XLSX, 640000, 1, 2, 'Planilha de consumo'),
  ev(5, 7, 'Painel_Score_Risco_v1.pdf', PDF, 1500000, 12, 2, 'Apresentação do painel'),
  ev(6, 1, 'Fluxo_Atual_Conferencia.pdf', PDF, 900000, 19, 1, 'Fluxo atual do processo'),
  ev(7, 5, 'Analise_Viabilidade_Ledger.pdf', PDF, 2100000, 4, 2, 'Análise de viabilidade'),
  ev(8, 10, 'Relatorio_Sandbox_Rede.pdf', PDF, 3200000, 20, 2, 'Relatório dos testes em sandbox'),
  ev(9, 2, 'Analise_Superficie_Ataque.pdf', PDF, 760000, 42, 7, 'Análise de superfície de ataque'),
  ev(10, 10, 'Telemetria_Rede_Anonimizada.csv', 'text/csv', 5200000, 15, 2, 'Amostra de telemetria'),
  ev(11, 4, 'Mapeamento_Normas_Internas.pptx', PPTX, 2300000, 25, 2, 'Apresentação do mapeamento'),
  ev(12, 1, 'Amostra_Documentos_Anonimizada.zip', 'application/zip', 8100000, 18, 1, 'Amostra de documentos'),
  ev(13, 8, 'Serie_Historica_Numerario.xlsx', XLSX, 1900000, 400, 2, 'Série histórica de abastecimento'),
  ev(14, 12, 'Apresentacao_Gemeo_Digital.pptx', PPTX, 3600000, 2, 6, 'Apresentação da ideia'),
  ev(15, 3, 'Apresentacao_Resultados_Piloto.pptx', PPTX, 4100000, 14, 2, 'Resultados do piloto'),
  ev(16, 11, 'Mapa_Competencias.xlsx', XLSX, 520000, 6, 1, 'Mapa de competências'),
  ev(17, 6, 'Relatorio_Operacao_Agentes.pdf', PDF, 2600000, 33, 2, 'Relatório de operação'),
  ev(18, 9, 'Comparativo_Contrato_Vigente.pdf', PDF, 880000, 72, 2, 'Comparativo com o contrato vigente'),
];

const evs = (...ids: number[]) => ids.map((id) => EVIDENCIAS.find((e) => e.id === id)!);

const AVALIACOES_TRL: AvaliacaoTrl[] = [
  { id: 1, projetoId: 2, responsavel: u(2), trlAnterior: 3, trlNovo: 4, justificativa: 'Componentes integrados e testados em bancada com 98,4% de acurácia.', evidencias: evs(1), radarId: 3, criadaEm: d(40) },
  { id: 2, projetoId: 7, responsavel: u(2), trlAnterior: 6, trlNovo: 7, justificativa: 'Piloto com 50 mil sessões avaliadas e redução de 31% nas fraudes confirmadas.', evidencias: evs(3), radarId: 11, criadaEm: d(10) },
];

const QUALIFICACOES: Qualificacao[] = [
  {
    id: 1,
    projetoId: 1,
    analista: u(2),
    aderenciaTese: 'Alinhada à arena de eficiência operacional.',
    relevancia: 'Alta: 12 mil processos por mês com retrabalho recorrente.',
    grauInovacao: 'Incremental na tecnologia, relevante no processo.',
    viabilidade: 'Depende de avaliação técnica do uso de LLM com documentos de clientes.',
    maturidadeTecnologica: 'OCR maduro no mercado; a validação por LLM ainda é conceitual na BBTS.',
    fundamentacao: 'Volume alto, dor recorrente e solução tecnicamente plausível com revisão humana.',
    conclusao: 'Qualificada, com consulta pendente a Dados e IA antes de propor a POC.',
    criadaEm: d(4),
  },
  {
    id: 2,
    projetoId: 5,
    analista: u(2),
    aderenciaTese: 'Aderente a negócios digitais e ao agronegócio.',
    relevancia: 'Média-alta: reduz risco e custo de formalização.',
    grauInovacao: 'Alto para o contexto da BBTS.',
    viabilidade: 'Requer integração com o fluxo de crédito e custódia de chaves.',
    maturidadeTecnologica: 'Ledger distribuído testado em outros bancos; integração inédita aqui.',
    fundamentacao: 'Ganho de rastreabilidade relevante; risco técnico concentrado na custódia de chaves.',
    conclusao: 'Recomendo POC controlada. Pedido de avanço para POC aberto.',
    criadaEm: d(5),
  },
  {
    id: 3,
    projetoId: 2,
    analista: u(2),
    aderenciaTese: 'Total: segurança integrada.',
    relevancia: 'Crítica: fraudes em terminais.',
    grauInovacao: 'Alto.',
    viabilidade: 'Boa, com modelo embarcado no terminal existente.',
    maturidadeTecnologica: 'Modelos de visão computacional maduros; embarcado ainda a validar.',
    fundamentacao: 'Vencedora do hackathon, com parceiro técnico já mobilizado.',
    conclusao: 'Seguir para POC.',
    criadaEm: d(160),
  },
];

const CONSULTAS: ConsultaEspecialista[] = [
  { id: 1, projetoId: 1, solicitante: u(2), especialista: u(8), areaTecnica: 'Dados e IA', questao: 'O uso de LLM para validar documentos atende às diretrizes de IA responsável? Qual a maturidade real do OCR proposto?', status: 'PENDENTE', parecerId: null, criadaEm: d(2), respondidaEm: null },
  { id: 2, projetoId: 2, solicitante: u(2), especialista: u(7), areaTecnica: 'Segurança da informação', questao: 'O modelo embarcado no terminal cria novos vetores de ataque?', status: 'RESPONDIDA', parecerId: 1, criadaEm: d(45), respondidaEm: d(42) },
  { id: 3, projetoId: 5, solicitante: u(2), especialista: u(7), areaTecnica: 'Segurança da informação', questao: 'Quais riscos de custódia de chaves no uso de ledger distribuído para garantias?', status: 'PENDENTE', parecerId: null, criadaEm: d(3), respondidaEm: null },
];

const PARECERES: Parecer[] = [
  { id: 1, projetoId: 2, consultaId: 2, especialista: u(7), fundamentacao: 'O modelo roda isolado, sem acesso à rede de transações; o canal de atualização já é assinado.', conclusao: 'Sem novos vetores relevantes, desde que o modelo seja assinado e atualizado pelo canal seguro existente.', evidencias: evs(9), criadoEm: d(42) },
  { id: 2, projetoId: 2, consultaId: null, especialista: u(8), fundamentacao: 'Modelos embarcados tendem a perder acurácia com a troca de iluminação e de modelos de terminal.', conclusao: 'Parecer independente: monitorar a acurácia por terminal e prever retreinamento trimestral.', evidencias: [], criadoEm: d(30) },
];

const encerrada = (por: number, justificativa: string, dias: number) => ({ encerradaPor: u(por), justificativaEncerramento: justificativa, encerradaEm: d(dias) });
const aberta = { encerradaPor: null, justificativaEncerramento: null, encerradaEm: null };

const SOLICITACOES: SolicitacaoTransicao[] = [
  { id: 1, projetoId: 2, transicaoId: 2, origem: er(2), destino: er(3), solicitante: u(2), justificativa: 'POC concluída com 98,4% de acurácia em bancada. Proposta de piloto em 25 agências.', evidencias: evs(2), status: 'PENDENTE', ...aberta, criadaEm: d(3) },
  { id: 2, projetoId: 5, transicaoId: 1, origem: er(1), destino: er(2), solicitante: u(2), justificativa: 'Qualificação concluída. Proposta de POC controlada com duas cooperativas parceiras.', evidencias: evs(7), status: 'PENDENTE', ...aberta, criadaEm: d(4) },
  { id: 3, projetoId: 10, transicaoId: 2, origem: er(2), destino: er(3), solicitante: u(2), justificativa: 'Testes em sandbox concluídos com telemetria real anonimizada.', evidencias: evs(8), status: 'REJEITADA', ...encerrada(7, 'Os testes ainda não foram feitos em rede segregada de produção. Reapresentar após esse teste.', 7), criadaEm: d(9) },
  { id: 4, projetoId: 9, transicaoId: 4, origem: er(1), destino: er(5), solicitante: u(2), justificativa: 'Solução equivalente já contratada pela área de compras.', evidencias: evs(18), status: 'APROVADA', ...encerrada(7, 'Evita sobreposição com contrato vigente.', 70), criadaEm: d(72) },
  { id: 5, projetoId: 2, transicaoId: 1, origem: er(1), destino: er(2), solicitante: u(2), justificativa: 'Vencedora do hackathon; qualificação favorável.', evidencias: [], status: 'APROVADA', ...encerrada(7, 'Prioridade alta para segurança.', 155), criadaEm: d(158) },
  { id: 6, projetoId: 4, transicaoId: 2, origem: er(2), destino: er(3), solicitante: u(2), justificativa: 'Normas mapeadas e protótipo aprovado pela área de atendimento.', evidencias: evs(11), status: 'CANCELADA', ...encerrada(2, 'Piloto adiado pela área demandante; o pedido será reaberto após o orçamento.', 20), criadaEm: d(22) },
];

const ENTREGAS: Entrega[] = [
  { id: 1, projetoId: 3, descricao: 'Painel de consumo das 10 agências piloto, com alertas de climatização e relatório mensal de economia.', registradaPor: u(2), registradaEm: d(1), validacoes: [] },
  {
    id: 2,
    projetoId: 7,
    descricao: 'Score de risco por sessão no app, exibido para a equipe antifraude com explicação dos fatores de risco.',
    registradaPor: u(2),
    registradaEm: d(12),
    validacoes: [{ id: 1, entregaId: 2, resultado: 'VALIDADA_COM_RESSALVAS', observacoes: 'Atende ao problema. Falta incluir o horário da sessão entre os fatores.', por: u(1), em: d(9) }],
  },
  {
    id: 3,
    projetoId: 6,
    descricao: 'Agentes em produção operando três rotinas de backoffice com supervisão humana.',
    registradaPor: u(2),
    registradaEm: d(33),
    validacoes: [{ id: 2, entregaId: 3, resultado: 'VALIDADA', observacoes: 'Redução de 60% no tempo das rotinas.', por: u(6), em: d(31) }],
  },
];

const CORRECOES: Correcao[] = [
  { id: 1, projetoId: 7, descricao: 'Incluir o horário da sessão entre os fatores do score de risco.', referencia: 'Entrega #2 · ressalva da validação', evidencia: evs(5)[0], autor: u(1), criadaEm: d(8) },
];

const h = (id: number, projetoId: number, usuario: number, tipo: HistoricoTransicao['tipoMudanca'], de: string, para: string, dias: number, motivo: string | null, solicitacaoId: number | null = null): HistoricoTransicao => ({
  id,
  projetoId,
  usuario: u(usuario),
  tipoMudanca: tipo,
  valorAnterior: de,
  valorNovo: para,
  motivo,
  solicitacaoId,
  dataMudanca: d(dias),
});

const HISTORICO: HistoricoTransicao[] = [
  h(1, 2, 7, 'ETAPA', 'Ideação', 'POC', 155, 'Pedido de avanço aprovado', 5),
  h(2, 2, 2, 'TRL', '3', '4', 40, 'Avaliação de TRL'),
  h(3, 7, 2, 'TRL', '6', '7', 10, 'Avaliação de TRL'),
  h(4, 9, 7, 'ETAPA', 'Ideação', 'Descontinuado', 70, 'Pedido de avanço aprovado', 4),
];

const HISTORICO_GESTAO: HistoricoGestao[] = [
  { id: 1, projetoId: 9, tipo: 'ARQUIVAMENTO', usuario: u(7), justificativa: 'Projeto descontinuado: solução equivalente já contratada pela área de compras.', alteracoes: [{ campo: 'Arquivado', anterior: 'Não', atual: 'Sim' }], data: d(60) },
];

const INTERACOES: Interacao[] = [
  { id: 1, projetoId: 1, autor: u(2), perfil: 'ANALISTA', texto: 'Mariana, você consegue estimar quantos processos de abertura de conta passam pela conferência por mês?', criadaEm: d(3, 9) },
  { id: 2, projetoId: 1, autor: u(1), perfil: 'DEMANDANTE', texto: 'Cerca de 12 mil processos por mês, concentrados nas agências da DIOPE. Posso enviar a planilha do último trimestre.', criadaEm: d(3, 14) },
  { id: 3, projetoId: 3, autor: u(2), perfil: 'ANALISTA', texto: 'O painel das 10 agências piloto está disponível. Pedimos a sua validação na aba Entregas.', criadaEm: d(1, 11) },
];

const RECOMENDACOES: Recomendacao[] = [
  { id: 1, autor: u(2), autorPerfil: 'ANALISTA', destinatario: u(6), titulo: 'Digitalizar o protocolo de malotes', descricao: 'O protocolo de malotes entre agências ainda é feito em papel. Vale registrar como demanda espontânea para avaliarmos uma solução digital.', status: 'PENDENTE', projeto: null, justificativaEncerramento: null, encerradaEm: null, criadaEm: d(2) },
  { id: 2, autor: u(7), autorPerfil: 'ESPECIALISTA', destinatario: u(1), titulo: 'Cofre de senhas compartilhado nas agências', descricao: 'Senhas de sistemas locais circulam em planilhas. Sugiro registrar a dor para tratarmos com um cofre de senhas.', status: 'RECUSADA', projeto: null, justificativaEncerramento: 'Já existe um projeto corporativo em andamento com a DITEC para este tema.', encerradaEm: d(15), criadaEm: d(18) },
  { id: 3, autor: u(8), autorPerfil: 'ESPECIALISTA', destinatario: u(1), titulo: 'Rastreabilidade de garantias rurais', descricao: 'O rastreio das garantias do crédito rural tem pouca rastreabilidade. Pode virar uma demanda de negócios digitais.', status: 'CONVERTIDA', projeto: { id: 5, titulo: 'Tokenização de garantias do agronegócio' }, justificativaEncerramento: null, encerradaEm: d(45), criadaEm: d(47) },
];

const PROPOSTAS: PropostaConfiguracao[] = [
  { id: 1, tipo: 'COLUNA', proposta: { codigo: 'PILOTO', nome: 'Piloto', ordem: 25, terminal: null, descricao: 'Piloto controlado em unidades selecionadas.' }, justificativa: 'Separar os pilotos controlados das provas de conceito para acompanhar melhor o risco operacional.', autor: u(2), status: 'PENDENTE', ...aberta, criadaEm: d(1) },
];

const NOTIFICACOES: Notificacao[] = [
  { id: 1, mensagem: 'Fernanda Rocha aprovou o avanço de Ideação para POC.', projetoId: 2, projetoTitulo: 'Visão computacional no autoatendimento', autor: u(7), criadaEm: d(155) },
  { id: 2, mensagem: 'Fernanda Rocha aprovou o avanço de Ideação para Descontinuado.', projetoId: 9, projetoTitulo: 'Onboarding digital de fornecedores', autor: u(7), criadaEm: d(70) },
];

export function criarSeed(): MockDb {
  return structuredClone({
    usuarios: USUARIOS,
    campanhas: CAMPANHAS,
    etapas: ETAPAS,
    transicoes: TRANSICOES,
    propostas: PROPOSTAS,
    projetos: PROJETOS,
    qualificacoes: QUALIFICACOES,
    consultas: CONSULTAS,
    pareceres: PARECERES,
    avaliacoesTrl: AVALIACOES_TRL,
    radar: RADAR,
    solicitacoes: SOLICITACOES,
    entregas: ENTREGAS,
    correcoes: CORRECOES,
    evidencias: EVIDENCIAS,
    historico: HISTORICO,
    historicoGestao: HISTORICO_GESTAO,
    interacoes: INTERACOES,
    recomendacoes: RECOMENDACOES,
    notificacoes: NOTIFICACOES,
    seq: 1000,
  });
}
