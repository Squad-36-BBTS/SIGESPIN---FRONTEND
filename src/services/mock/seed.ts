// Dados de demonstração do modo mock (revisão 3). Senha de todos os usuários de teste: sigespin123
import type {
  AvaliacaoRadar,
  AvaliacaoTrl,
  Campanha,
  ConsultaEspecialista,
  Entrega,
  EtapaKanban,
  Evidencia,
  HistoricoTransicao,
  Interacao,
  Qualificacao,
  SolicitacaoTransicao,
  TransicaoKanban,
  Usuario,
} from '@/types/domain';

export const SENHA_DEMO = 'sigespin123';

// Projeto como fica guardado: etapa por id; pendências e nomes são calculados
export interface ProjetoDb {
  id: number;
  titulo: string;
  descricaoDor: string;
  contexto: string;
  natureza: 'PROBLEMA' | 'NECESSIDADE' | 'OPORTUNIDADE';
  origem: 'ESPONTANEA' | 'INDUZIDA';
  campanhaId: number | null;
  areaDemandanteId: number;
  demandanteId: number | null;
  analistaId: number | null;
  arena: 'EFICIENCIA_OPERACIONAL' | 'NEGOCIOS_DIGITAIS' | 'SEGURANCA_INTEGRADA' | 'A_DEFINIR';
  hipoteseSolucao: string;
  potencialLeiDoBem: boolean;
  etapaId: number;
  trlAtual: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface MockDb {
  usuarios: Usuario[];
  campanhas: Campanha[];
  etapas: EtapaKanban[];
  transicoes: TransicaoKanban[];
  projetos: ProjetoDb[];
  qualificacoes: Qualificacao[];
  consultas: ConsultaEspecialista[];
  avaliacoesTrl: AvaliacaoTrl[];
  radar: AvaliacaoRadar[];
  solicitacoes: SolicitacaoTransicao[];
  entregas: Entrega[];
  evidencias: Evidencia[];
  historico: HistoricoTransicao[];
  interacoes: Interacao[];
  seq: number;
}

const d = (diasAtras: number, hora = 10) => {
  const dt = new Date('2026-10-23T12:00:00-03:00');
  dt.setDate(dt.getDate() - diasAtras);
  dt.setHours(hora, 0, 0, 0);
  return dt.toISOString();
};

export const USUARIOS: Usuario[] = [
  { id: 1, nome: 'Mariana Costa', email: 'demandante@bbts.com.br', perfil: 'DEMANDANTE', ativo: true },
  { id: 2, nome: 'Rafael Lima', email: 'analista@bbts.com.br', perfil: 'ANALISTA', ativo: true },
  { id: 3, nome: 'Helena Duarte', email: 'helena.duarte@bbts.com.br', perfil: 'ESPECIALISTA', ativo: true, areaTecnica: 'Estratégia e portfólio' },
  { id: 5, nome: 'Carla Nunes', email: 'carla.nunes@bbts.com.br', perfil: 'ANALISTA', ativo: true },
  { id: 6, nome: 'Bruno Alves', email: 'bruno.alves@bbts.com.br', perfil: 'DEMANDANTE', ativo: true },
  { id: 7, nome: 'Fernanda Rocha', email: 'especialista@bbts.com.br', perfil: 'ESPECIALISTA', ativo: true, areaTecnica: 'Segurança da informação' },
  { id: 8, nome: 'João Prado', email: 'joao.prado@bbts.com.br', perfil: 'ESPECIALISTA', ativo: true, areaTecnica: 'Dados e IA' },
  { id: 9, nome: 'Usuário Inativo', email: 'inativo@bbts.com.br', perfil: 'DEMANDANTE', ativo: false },
];

export const u = (id: number) => {
  const x = USUARIOS.find((y) => y.id === id)!;
  return { id: x.id, nome: x.nome };
};

// Configuração inicial do Kanban (guia, seção 1)
const ETAPAS: EtapaKanban[] = [
  { id: 1, nome: 'Ideação', descricao: 'Demanda registrada, em triagem e qualificação.', ordem: 1, cor: '#F59E0B', ativa: true, terminal: false },
  { id: 2, nome: 'POC', descricao: 'Prova de conceito em andamento.', ordem: 2, cor: '#0EA5E9', ativa: true, terminal: false },
  { id: 3, nome: 'MVP', descricao: 'Produto mínimo viável ou piloto.', ordem: 3, cor: '#6366F1', ativa: true, terminal: false },
  { id: 4, nome: 'Concluído', descricao: 'Jornada encerrada com resultado.', ordem: 4, cor: '#10B981', ativa: true, terminal: true },
  { id: 5, nome: 'Descontinuado', descricao: 'Iniciativa interrompida.', ordem: 5, cor: '#F43F5E', ativa: true, terminal: true },
];

// Na configuração inicial, todas as transições previstas exigem governança
const TRANSICOES: TransicaoKanban[] = [
  { id: 1, origemId: 1, destinoId: 2, exigeGovernanca: true, ativa: true },
  { id: 2, origemId: 2, destinoId: 3, exigeGovernanca: true, ativa: true },
  { id: 3, origemId: 3, destinoId: 4, exigeGovernanca: true, ativa: true },
  { id: 4, origemId: 1, destinoId: 5, exigeGovernanca: true, ativa: true },
  { id: 5, origemId: 2, destinoId: 5, exigeGovernanca: true, ativa: true },
  { id: 6, origemId: 3, destinoId: 5, exigeGovernanca: true, ativa: true },
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

const P = (x: Omit<ProjetoDb, 'contexto'> & { contexto?: string }): ProjetoDb => ({ contexto: '', ...x });

const PROJETOS: ProjetoDb[] = [
  P({ id: 1, titulo: 'Automatizar conferência de documentos', descricaoDor: 'A conferência manual de documentos de abertura de conta leva em média 40 minutos por processo e gera retrabalho por erros de digitação.', contexto: 'Cerca de 12 mil processos por mês nas agências da DIOPE.', natureza: 'PROBLEMA', origem: 'ESPONTANEA', campanhaId: null, areaDemandanteId: 1, demandanteId: 1, analistaId: 2, arena: 'EFICIENCIA_OPERACIONAL', hipoteseSolucao: 'OCR com validação por modelo de linguagem e regras de negócio para pré-conferir documentos antes da revisão humana.', potencialLeiDoBem: true, etapaId: 1, trlAtual: 2, criadoEm: d(20), atualizadoEm: d(2) }),
  P({ id: 2, titulo: 'Visão computacional no autoatendimento', descricaoDor: 'Fraudes por skimming e adulteração física de terminais só são identificadas após reclamação do cliente.', natureza: 'PROBLEMA', origem: 'INDUZIDA', campanhaId: 2, areaDemandanteId: 3, demandanteId: 6, analistaId: 2, arena: 'SEGURANCA_INTEGRADA', hipoteseSolucao: 'Modelo de visão computacional embarcado no terminal para detectar anomalias físicas em tempo real.', potencialLeiDoBem: true, etapaId: 2, trlAtual: 4, criadoEm: d(175), atualizadoEm: d(3) }),
  P({ id: 3, titulo: 'Plataforma IoT de eficiência energética', descricaoDor: 'O consumo de energia das agências não é monitorado de forma contínua, dificultando ações de economia.', natureza: 'OPORTUNIDADE', origem: 'INDUZIDA', campanhaId: 4, areaDemandanteId: 1, demandanteId: 1, analistaId: 5, arena: 'EFICIENCIA_OPERACIONAL', hipoteseSolucao: 'Sensores e telemetria preditiva de climatização em agências piloto, com painel de consumo e alertas.', potencialLeiDoBem: true, etapaId: 3, trlAtual: 6, criadoEm: d(300), atualizadoEm: d(1) }),
  P({ id: 4, titulo: 'Assistente de atendimento com IA generativa', descricaoDor: 'Atendentes de primeiro nível gastam muito tempo procurando normas internas durante o atendimento.', natureza: 'NECESSIDADE', origem: 'ESPONTANEA', campanhaId: null, areaDemandanteId: 4, demandanteId: 6, analistaId: 5, arena: 'NEGOCIOS_DIGITAIS', hipoteseSolucao: 'Assistente com busca semântica nas normas internas, sem dados de clientes.', potencialLeiDoBem: true, etapaId: 2, trlAtual: 3, criadoEm: d(120), atualizadoEm: d(5) }),
  P({ id: 5, titulo: 'Tokenização de garantias do agronegócio', descricaoDor: 'A formalização e o rastreio de garantias de crédito rural envolvem muitos documentos físicos e pouca rastreabilidade.', natureza: 'OPORTUNIDADE', origem: 'ESPONTANEA', campanhaId: null, areaDemandanteId: 2, demandanteId: 1, analistaId: 2, arena: 'NEGOCIOS_DIGITAIS', hipoteseSolucao: 'Registro das garantias em ledger distribuído com contratos inteligentes integrados ao fluxo de crédito.', potencialLeiDoBem: false, etapaId: 1, trlAtual: 3, criadoEm: d(45), atualizadoEm: d(4) }),
  P({ id: 6, titulo: 'Orquestração de agentes para backoffice', descricaoDor: 'Tarefas repetitivas de backoffice consomem horas de equipes especializadas todos os dias.', natureza: 'PROBLEMA', origem: 'INDUZIDA', campanhaId: 4, areaDemandanteId: 4, demandanteId: 6, analistaId: 5, arena: 'EFICIENCIA_OPERACIONAL', hipoteseSolucao: 'Agentes automatizados para tarefas de primeiro nível, com supervisão humana e trilha de auditoria.', potencialLeiDoBem: true, etapaId: 4, trlAtual: 8, criadoEm: d(310), atualizadoEm: d(30) }),
  P({ id: 7, titulo: 'Biometria comportamental em canais digitais', descricaoDor: 'Contas invadidas por engenharia social realizam transações antes que o cliente perceba.', natureza: 'PROBLEMA', origem: 'INDUZIDA', campanhaId: 2, areaDemandanteId: 3, demandanteId: 1, analistaId: 2, arena: 'SEGURANCA_INTEGRADA', hipoteseSolucao: 'Análise do padrão de digitação e uso do dispositivo para gerar score de risco por sessão.', potencialLeiDoBem: true, etapaId: 3, trlAtual: 7, criadoEm: d(176), atualizadoEm: d(6) }),
  P({ id: 8, titulo: 'Gestão inteligente de numerário', descricaoDor: 'Abastecimento de terminais é planejado por histórico simples, gerando excesso ou falta de numerário.', natureza: 'OPORTUNIDADE', origem: 'ESPONTANEA', campanhaId: null, areaDemandanteId: 1, demandanteId: 6, analistaId: null, arena: 'A_DEFINIR', hipoteseSolucao: 'Previsão de demanda por terminal com modelos de séries temporais.', potencialLeiDoBem: false, etapaId: 1, trlAtual: 1, criadoEm: d(3), atualizadoEm: d(3) }),
  P({ id: 9, titulo: 'Onboarding digital de fornecedores', descricaoDor: 'O cadastro de fornecedores depende de troca de e-mails e planilhas, levando semanas para concluir.', natureza: 'NECESSIDADE', origem: 'ESPONTANEA', campanhaId: null, areaDemandanteId: 2, demandanteId: 6, analistaId: 5, arena: 'NEGOCIOS_DIGITAIS', hipoteseSolucao: 'Portal de autoatendimento com validação automática de documentos.', potencialLeiDoBem: false, etapaId: 5, trlAtual: 2, criadoEm: d(90), atualizadoEm: d(70) }),
  P({ id: 10, titulo: 'Detecção de anomalias em rede corporativa', descricaoDor: 'Ataques internos e movimentações laterais demoram a ser identificados no ambiente corporativo.', natureza: 'PROBLEMA', origem: 'ESPONTANEA', campanhaId: null, areaDemandanteId: 3, demandanteId: 1, analistaId: 5, arena: 'SEGURANCA_INTEGRADA', hipoteseSolucao: 'Modelo de detecção de anomalias sobre telemetria de rede com resposta automatizada.', potencialLeiDoBem: true, etapaId: 2, trlAtual: 5, criadoEm: d(150), atualizadoEm: d(8) }),
  P({ id: 11, titulo: 'Trilhas de capacitação personalizadas', descricaoDor: 'Colaboradores não encontram cursos alinhados às competências exigidas pelas novas tecnologias.', natureza: 'NECESSIDADE', origem: 'INDUZIDA', campanhaId: 3, areaDemandanteId: 5, demandanteId: 1, analistaId: null, arena: 'EFICIENCIA_OPERACIONAL', hipoteseSolucao: 'Recomendação de trilhas com base no mapa de competências e no histórico de cursos.', potencialLeiDoBem: false, etapaId: 1, trlAtual: 2, criadoEm: d(6), atualizadoEm: d(6) }),
  P({ id: 12, titulo: 'Gêmeo digital de agências', descricaoDor: 'Reformas e mudanças de layout das agências são planejadas sem simulação do fluxo de clientes.', natureza: 'OPORTUNIDADE', origem: 'INDUZIDA', campanhaId: 1, areaDemandanteId: 1, demandanteId: 6, analistaId: null, arena: 'NEGOCIOS_DIGITAIS', hipoteseSolucao: 'Modelo 3D com simulação de fluxo para testar layouts antes da obra.', potencialLeiDoBem: true, etapaId: 1, trlAtual: 1, criadoEm: d(2), atualizadoEm: d(2) }),
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
  radar(12, 8, 'INICIAL', 1.5, 1.0, 1.0, 1.0, 3),
  radar(13, 9, 'INICIAL', 2.0, 1.5, 1.5, 1.0, 90),
  radar(14, 10, 'INICIAL', 2.5, 2.0, 2.5, 1.0, 150),
  radar(15, 11, 'INICIAL', 2.0, 1.5, 2.0, 0.5, 6),
  radar(16, 12, 'INICIAL', 2.0, 1.5, 2.0, 1.5, 2),
];

const PDF = 'application/pdf';
const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const ev = (id: number, projetoId: number, nome: string, tipo: string, tam: number, dias: number, por: number, vinculo: Evidencia['vinculo']): Evidencia => ({
  id,
  projetoId,
  nomeArquivo: nome,
  tipoArquivo: tipo,
  tamanhoBytes: tam,
  dataUpload: d(dias),
  enviadaPor: u(por),
  estadoEnvio: 'ENVIADO',
  vinculo,
});

const EVIDENCIAS: Evidencia[] = [
  ev(1, 2, 'Relatorio_Testes_Bancada_TRL4.pdf', PDF, 4400000, 40, 2, { tipo: 'TRL', id: 1 }),
  ev(2, 2, 'Plano_Piloto_25_Agencias.pdf', PDF, 1200000, 3, 2, { tipo: 'SOLICITACAO', id: 1 }),
  ev(3, 7, 'Metricas_Piloto_Biometria.pdf', PDF, 2800000, 10, 2, { tipo: 'TRL', id: 2 }),
  ev(4, 3, 'Consumo_Agencias_Piloto.xlsx', XLSX, 640000, 1, 5, { tipo: 'ENTREGA', id: 1 }),
  ev(5, 7, 'Painel_Score_Risco_v1.pdf', PDF, 1500000, 12, 2, { tipo: 'ENTREGA', id: 2 }),
  ev(6, 1, 'Fluxo_Atual_Conferencia.pdf', PDF, 900000, 19, 1, { tipo: 'GERAL', id: null }),
  ev(7, 5, 'Analise_Viabilidade_Ledger.pdf', PDF, 2100000, 4, 2, { tipo: 'SOLICITACAO', id: 2 }),
  ev(8, 10, 'Relatorio_Sandbox_Rede.pdf', PDF, 3200000, 20, 5, { tipo: 'SOLICITACAO', id: 3 }),
  ev(9, 2, 'Analise_Superficie_Ataque.pdf', PDF, 760000, 42, 7, { tipo: 'PARECER', id: 2 }),
];

const AVALIACOES_TRL: AvaliacaoTrl[] = [
  { id: 1, projetoId: 2, responsavel: u(2), trlAnterior: 3, trlNovo: 4, justificativa: 'Componentes integrados e testados em bancada com 98,4% de acurácia.', evidencias: [], radarId: 3, criadaEm: d(40) },
  { id: 2, projetoId: 7, responsavel: u(2), trlAnterior: 6, trlNovo: 7, justificativa: 'Piloto com 50 mil sessões avaliadas e redução de 31% nas fraudes confirmadas.', evidencias: [], radarId: 11, criadaEm: d(10) },
];

const QUALIFICACOES: Qualificacao[] = [
  { id: 1, projetoId: 1, analista: u(2), aderenciaTese: 'Alinhada à arena de eficiência operacional.', relevancia: 'Alta: 12 mil processos por mês com retrabalho recorrente.', grauInovacao: 'Incremental na tecnologia, relevante no processo.', viabilidade: 'Depende de avaliação técnica do uso de LLM com documentos de clientes.', trlAvaliado: 2, conclusao: 'Qualificada, com consulta pendente a Dados e IA antes de propor a POC.', criadaEm: d(4) },
  { id: 2, projetoId: 5, analista: u(2), aderenciaTese: 'Aderente a negócios digitais e ao agronegócio.', relevancia: 'Média-alta: reduz risco e custo de formalização.', grauInovacao: 'Alto para o contexto da BBTS.', viabilidade: 'Requer integração com o fluxo de crédito e custódia de chaves.', trlAvaliado: 3, conclusao: 'Recomendo POC controlada. Solicitada transição para POC.', criadaEm: d(5) },
  { id: 3, projetoId: 2, analista: u(2), aderenciaTese: 'Total: segurança integrada.', relevancia: 'Crítica: fraudes em terminais.', grauInovacao: 'Alto.', viabilidade: 'Boa, com modelo embarcado no terminal existente.', trlAvaliado: 3, conclusao: 'Seguir para POC.', criadaEm: d(160) },
];

const CONSULTAS: ConsultaEspecialista[] = [
  { id: 1, projetoId: 1, solicitante: u(2), especialista: null, areaTecnica: 'Dados e IA', pergunta: 'O uso de LLM para validar documentos atende às diretrizes de IA responsável? Qual a maturidade real do OCR proposto?', status: 'PENDENTE', fundamentacao: null, conclusao: null, evidencias: [], criadaEm: d(2), respondidaEm: null },
  { id: 2, projetoId: 2, solicitante: u(2), especialista: u(7), areaTecnica: 'Segurança da informação', pergunta: 'O modelo embarcado no terminal cria novos vetores de ataque?', status: 'RESPONDIDA', fundamentacao: 'O modelo roda isolado, sem acesso à rede de transações; o canal de atualização já é assinado.', conclusao: 'Sem novos vetores relevantes, desde que o modelo seja assinado e atualizado pelo canal seguro existente.', evidencias: [], criadaEm: d(45), respondidaEm: d(42) },
  { id: 3, projetoId: 5, solicitante: u(2), especialista: u(7), areaTecnica: 'Segurança da informação', pergunta: 'Quais riscos de custódia de chaves no uso de ledger distribuído para garantias?', status: 'PENDENTE', fundamentacao: null, conclusao: null, evidencias: [], criadaEm: d(3), respondidaEm: null },
];

const SOLICITACOES: SolicitacaoTransicao[] = [
  { id: 1, projetoId: 2, transicaoId: 2, origem: er(2), destino: er(3), solicitante: u(2), justificativa: 'POC concluída com 98,4% de acurácia em bancada. Proposta de piloto em 25 agências.', evidencias: [], status: 'PENDENTE', decisor: null, justificativaDecisao: null, decididaEm: null, criadaEm: d(3) },
  { id: 2, projetoId: 5, transicaoId: 1, origem: er(1), destino: er(2), solicitante: u(2), justificativa: 'Qualificação concluída. Proposta de POC controlada com duas cooperativas parceiras.', evidencias: [], status: 'PENDENTE', decisor: null, justificativaDecisao: null, decididaEm: null, criadaEm: d(4) },
  { id: 3, projetoId: 10, transicaoId: 2, origem: er(2), destino: er(3), solicitante: u(5), justificativa: 'Testes em sandbox concluídos com telemetria real anonimizada.', evidencias: [], status: 'REJEITADA', decisor: u(7), justificativaDecisao: 'Os testes ainda não foram feitos em rede segregada de produção. Reapresentar após esse teste.', decididaEm: d(7), criadaEm: d(9) },
  { id: 4, projetoId: 9, transicaoId: 4, origem: er(1), destino: er(5), solicitante: u(5), justificativa: 'Solução equivalente já contratada pela área de compras.', evidencias: [], status: 'APROVADA', decisor: u(3), justificativaDecisao: 'Evita sobreposição com contrato vigente.', decididaEm: d(70), criadaEm: d(72) },
  { id: 5, projetoId: 2, transicaoId: 1, origem: er(1), destino: er(2), solicitante: u(2), justificativa: 'Vencedora do hackathon; qualificação favorável.', evidencias: [], status: 'APROVADA', decisor: u(3), justificativaDecisao: 'Prioridade alta para segurança.', decididaEm: d(155), criadaEm: d(158) },
];

const ENTREGAS: Entrega[] = [
  { id: 1, projetoId: 3, titulo: 'Painel de consumo das 10 agências piloto', descricao: 'Painel com consumo por agência, alertas de climatização e relatório mensal de economia.', ehMvp: true, registradaPor: u(5), registradaEm: d(1), evidencias: [], validacao: null },
  { id: 2, projetoId: 7, titulo: 'Score de risco por sessão no app', descricao: 'Score exibido para a equipe antifraude com explicação dos fatores de risco.', ehMvp: true, registradaPor: u(2), registradaEm: d(12), evidencias: [], validacao: { resultado: 'VALIDADA_COM_RESSALVAS', observacoes: 'Atende ao problema. Falta incluir o horário da sessão entre os fatores.', por: u(1), em: d(9) } },
  { id: 3, projetoId: 6, titulo: 'Agentes em produção para tarefas N1', descricao: 'Agentes operando três rotinas de backoffice com supervisão humana.', ehMvp: true, registradaPor: u(5), registradaEm: d(33), evidencias: [], validacao: { resultado: 'VALIDADA', observacoes: 'Redução de 60% no tempo das rotinas.', por: u(6), em: d(31) } },
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
  h(1, 2, 3, 'ETAPA', 'Ideação', 'POC', 155, 'Solicitação aprovada', 5),
  h(2, 2, 2, 'TRL', '3', '4', 40, 'Avaliação de TRL'),
  h(3, 7, 2, 'TRL', '6', '7', 10, 'Avaliação de TRL'),
  h(4, 9, 3, 'ETAPA', 'Ideação', 'Descontinuado', 70, 'Solicitação aprovada', 4),
];

const INTERACOES: Interacao[] = [
  { id: 1, projetoId: 1, autor: u(2), perfil: 'ANALISTA', texto: 'Mariana, você consegue estimar quantos processos de abertura de conta passam pela conferência por mês?', criadaEm: d(3, 9) },
  { id: 2, projetoId: 1, autor: u(1), perfil: 'DEMANDANTE', texto: 'Cerca de 12 mil processos por mês, concentrados nas agências da DIOPE. Posso enviar a planilha do último trimestre.', criadaEm: d(3, 14) },
  { id: 3, projetoId: 3, autor: u(5), perfil: 'ANALISTA', texto: 'O painel das 10 agências piloto está disponível. Pedimos a sua validação na aba Entregas.', criadaEm: d(1, 11) },
];

export function criarSeed(): MockDb {
  const db: MockDb = structuredClone({
    usuarios: USUARIOS,
    campanhas: CAMPANHAS,
    etapas: ETAPAS,
    transicoes: TRANSICOES,
    projetos: PROJETOS,
    qualificacoes: QUALIFICACOES,
    consultas: CONSULTAS,
    avaliacoesTrl: AVALIACOES_TRL,
    radar: RADAR,
    solicitacoes: SOLICITACOES,
    entregas: ENTREGAS,
    evidencias: EVIDENCIAS,
    historico: HISTORICO,
    interacoes: INTERACOES,
    seq: 1000,
  });
  // Liga as evidências aos registros que elas fundamentam
  const de = (tipo: Evidencia['vinculo']['tipo'], id: number) => db.evidencias.filter((e) => e.vinculo.tipo === tipo && e.vinculo.id === id);
  for (const a of db.avaliacoesTrl) a.evidencias = de('TRL', a.id);
  for (const s of db.solicitacoes) s.evidencias = de('SOLICITACAO', s.id);
  for (const en of db.entregas) en.evidencias = de('ENTREGA', en.id);
  for (const c of db.consultas) c.evidencias = de('PARECER', c.id);
  return db;
}
