import type {
  AreaDemandante,
  ArenaTipo,
  EstadoTarefa,
  OrigemDemanda,
  PerfilUsuario,
  ResultadoValidacao,
  StatusGovernanca,
  StatusRecomendacao,
  TipoCampanha,
  TipoGestao,
  TipoProposta,
  TipoTerminal,
  Usuario,
} from '@/types/domain';

export const PERFIL_LABEL: Record<PerfilUsuario, string> = {
  DEMANDANTE: 'Demandante',
  ANALISTA: 'Analista',
  ESPECIALISTA: 'Especialista',
};

export const PERFIL_DESCRICAO: Record<PerfilUsuario, string> = {
  DEMANDANTE: 'Cadastra demandas, acompanha o portfólio, registra correções e valida entregas quando é o responsável pelo projeto. Responde a recomendações destinadas a ele.',
  ANALISTA: 'Qualifica demandas, encaminha consultas, registra TRL, movimenta em percurso livre, solicita governança, submete entregas, recomenda demandas e propõe alterações no quadro.',
  ESPECIALISTA: 'Emite parecer, registra TRL, movimenta projetos (inclusive percursos governados, com justificativa e notificação para todos), decide pedidos, submete entregas, recomenda demandas, administra o quadro e atualiza ou arquiva projetos.',
};

export function rotuloUsuario(u: Pick<Usuario, 'perfil' | 'areaTecnica'>): string {
  return u.perfil === 'ESPECIALISTA' && u.areaTecnica ? `Especialista · ${u.areaTecnica}` : PERFIL_LABEL[u.perfil];
}

// A consulta é dirigida a um Especialista; só ele responde, enquanto estiver pendente
export function podeResponderConsulta(c: { especialista: { id: number }; status: string }, u: Pick<Usuario, 'id' | 'perfil'> | null | undefined): boolean {
  return !!u && u.perfil === 'ESPECIALISTA' && c.status === 'PENDENTE' && c.especialista.id === u.id;
}

export const ORIGEM_LABEL: Record<OrigemDemanda, string> = {
  ESPONTANEA: 'Espontânea',
  INDUZIDA: 'Induzida',
};

export const ORIGEM_DESCRICAO: Record<OrigemDemanda, string> = {
  ESPONTANEA: 'Um problema, necessidade ou oportunidade registrado a qualquer momento.',
  INDUZIDA: 'Resposta a uma campanha, desafio, hackathon, residência ou ação semelhante.',
};

export const TIPO_CAMPANHA_LABEL: Record<TipoCampanha, string> = {
  CAMPANHA: 'Campanha',
  DESAFIO: 'Desafio',
  HACKATHON: 'Hackathon',
  RESIDENCIA: 'Residência',
  OUTRA: 'Ação de mobilização',
};

export const ARENA_LABEL: Record<ArenaTipo, string> = {
  EFICIENCIA_OPERACIONAL: 'Eficiência operacional',
  NEGOCIOS_DIGITAIS: 'Negócios digitais',
  SEGURANCA_INTEGRADA: 'Segurança integrada',
  A_DEFINIR: 'A definir',
};

export const ARENA_BADGE: Record<ArenaTipo, string> = {
  EFICIENCIA_OPERACIONAL: 'bg-blue-50 text-blue-800 border-blue-200',
  NEGOCIOS_DIGITAIS: 'bg-purple-50 text-purple-800 border-purple-200',
  SEGURANCA_INTEGRADA: 'bg-teal-50 text-teal-800 border-teal-200',
  A_DEFINIR: 'bg-slate-50 text-slate-600 border-dashed border-slate-300',
};

export const ARENA_COR: Record<ArenaTipo, string> = {
  EFICIENCIA_OPERACIONAL: '#005EEF',
  NEGOCIOS_DIGITAIS: '#7C3AED',
  SEGURANCA_INTEGRADA: '#0D9488',
  A_DEFINIR: '#94A3B8',
};

export const ARENAS: ArenaTipo[] = ['EFICIENCIA_OPERACIONAL', 'NEGOCIOS_DIGITAIS', 'SEGURANCA_INTEGRADA', 'A_DEFINIR'];

// Recorte por data de registro, igual no dashboard e no portfólio
export const PERIODOS_REGISTRO = [
  { v: '', t: 'Todo o período' },
  { v: 30, t: 'Últimos 30 dias' },
  { v: 90, t: 'Últimos 90 dias' },
  { v: 365, t: 'Últimos 12 meses' },
] as const;

// Paleta oferecida na configuração do Kanban
export const CORES_ETAPA = ['#F59E0B', '#0EA5E9', '#6366F1', '#10B981', '#F43F5E', '#8B5CF6', '#14B8A6', '#64748B'];

// ---------------- Estados de tarefa (não são etapas do Kanban) ----------------

export const TAREFA_LABEL: Record<EstadoTarefa, string> = {
  AGUARDANDO_TRIAGEM: 'Aguardando triagem',
  AGUARDANDO_PARECER: 'Aguardando parecer',
  AGUARDANDO_GOVERNANCA: 'Aguardando governança',
  AGUARDANDO_VALIDACAO: 'Aguardando validação',
};

export const TAREFA_RESPONSAVEL: Record<EstadoTarefa, PerfilUsuario> = {
  AGUARDANDO_TRIAGEM: 'ANALISTA',
  AGUARDANDO_PARECER: 'ESPECIALISTA',
  AGUARDANDO_GOVERNANCA: 'ESPECIALISTA',
  AGUARDANDO_VALIDACAO: 'DEMANDANTE',
};

export const TAREFAS: EstadoTarefa[] = ['AGUARDANDO_TRIAGEM', 'AGUARDANDO_PARECER', 'AGUARDANDO_GOVERNANCA', 'AGUARDANDO_VALIDACAO'];

// Pedidos de avanço e propostas de configuração
export const GOVERNANCA_LABEL: Record<StatusGovernanca, string> = {
  PENDENTE: 'Pendente',
  APROVADA: 'Aprovada',
  REJEITADA: 'Rejeitada',
  CANCELADA: 'Cancelada',
};

export const GOVERNANCA_BADGE: Record<StatusGovernanca, string> = {
  PENDENTE: 'bg-amber-50 text-amber-800 border-amber-300 border-dashed',
  APROVADA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJEITADA: 'bg-rose-50 text-rose-700 border-rose-200',
  CANCELADA: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const STATUS_GOVERNANCA: StatusGovernanca[] = ['PENDENTE', 'APROVADA', 'REJEITADA', 'CANCELADA'];

export const TIPO_PROPOSTA_LABEL: Record<TipoProposta, string> = {
  COLUNA: 'Coluna',
  TRANSICAO: 'Percurso',
};

export const TIPO_TERMINAL_LABEL: Record<TipoTerminal, string> = {
  CONCLUSAO: 'Conclusão',
  DESCONTINUACAO: 'Descontinuação',
};

export const RECOMENDACAO_LABEL: Record<StatusRecomendacao, string> = {
  PENDENTE: 'Pendente',
  CONVERTIDA: 'Convertida',
  RECUSADA: 'Recusada',
};

export const RECOMENDACAO_BADGE: Record<StatusRecomendacao, string> = {
  PENDENTE: 'bg-amber-50 text-amber-800 border-amber-300 border-dashed',
  CONVERTIDA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  RECUSADA: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const TIPO_GESTAO_LABEL: Record<TipoGestao, string> = {
  CADASTRO: 'Alteração cadastral',
  ARQUIVAMENTO: 'Arquivamento',
  REATIVACAO: 'Reativação',
};

export const VALIDACAO_LABEL: Record<ResultadoValidacao, string> = {
  VALIDADA: 'Validada',
  VALIDADA_COM_RESSALVAS: 'Validada com ressalvas',
  NAO_VALIDADA: 'Não validada',
};

export const VALIDACAO_BADGE: Record<ResultadoValidacao, string> = {
  VALIDADA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  VALIDADA_COM_RESSALVAS: 'bg-amber-50 text-amber-800 border-amber-200',
  NAO_VALIDADA: 'bg-rose-50 text-rose-700 border-rose-200',
};

// Campos da qualificação: todos são textos obrigatórios
export const CRITERIOS_QUALIFICACAO = [
  { chave: 'aderenciaTese', label: 'Aderência à Tese', dica: 'Alinhamento com a Tese de Inovação e as arenas estratégicas.' },
  { chave: 'relevancia', label: 'Relevância', dica: 'Tamanho do problema e impacto para o negócio.' },
  { chave: 'grauInovacao', label: 'Grau de inovação', dica: 'Do incremental ao disruptivo.' },
  { chave: 'viabilidade', label: 'Viabilidade', dica: 'Recursos, tecnologia e prazo disponíveis.' },
  { chave: 'maturidadeTecnologica', label: 'Maturidade tecnológica', dica: 'Leitura da maturidade da solução. Não altera o TRL do projeto.' },
  { chave: 'fundamentacao', label: 'Fundamentação', dica: 'O que sustenta a análise.' },
  { chave: 'conclusao', label: 'Conclusão', dica: 'Encaminhamento recomendado.' },
] as const;

export const RADAR_EIXOS = ['Negócio', 'Produto', 'Time', 'Receita'] as const;

export const TRL_DEFINICOES: Record<number, { titulo: string; descricao: string }> = {
  1: { titulo: 'Princípios básicos observados', descricao: 'Pesquisa conceitual preliminar. Hipótese teórica sem validação laboratorial.' },
  2: { titulo: 'Conceito tecnológico formulado', descricao: 'Aplicações operacionais definidas e arquitetura lógica da solução formulada.' },
  3: { titulo: 'Prova de conceito experimental', descricao: 'Estudos e simulações que validam de forma preliminar os componentes essenciais.' },
  4: { titulo: 'Validação em laboratório', descricao: 'Módulos integrados e testados em bancada controlada pela engenharia.' },
  5: { titulo: 'Validação em ambiente relevante', descricao: 'Componentes integrados com dados e periféricos reais em sandbox simulado.' },
  6: { titulo: 'Demonstração em piloto', descricao: 'Piloto restrito executado em ambiente real, em unidades selecionadas.' },
  7: { titulo: 'Protótipo operacional em campo', descricao: 'Protótipo em condições plenas, com usuários finais participando da validação.' },
  8: { titulo: 'Sistema qualificado', descricao: 'Tecnologia testada, auditada e pronta para integração aos sistemas core.' },
  9: { titulo: 'Sistema comprovado em escala', descricao: 'Implantação corporativa completa, integrada à governança e sustentação.' },
};

// A área demandante ainda é só um identificador no back-end (sem entidade própria).
export const AREAS_DEMANDANTES: AreaDemandante[] = [
  { id: 1, sigla: 'DIOPE', nome: 'Diretoria de Operações' },
  { id: 2, sigla: 'DINEG', nome: 'Diretoria de Negócios' },
  { id: 3, sigla: 'DISEG', nome: 'Diretoria de Segurança' },
  { id: 4, sigla: 'DITEC', nome: 'Diretoria de Tecnologia' },
  { id: 5, sigla: 'DIPES', nome: 'Diretoria de Pessoas' },
];

export function areaNome(id: number): string {
  const a = AREAS_DEMANDANTES.find((x) => x.id === id);
  return a ? `${a.sigla} · ${a.nome}` : `Área #${id}`;
}

export function areaSigla(id: number): string {
  return AREAS_DEMANDANTES.find((x) => x.id === id)?.sigla ?? `#${id}`;
}
