import type {
  AreaDemandante,
  ArenaTipo,
  DecisaoTipo,
  EtapaJornada,
  NaturezaDemanda,
  OrigemDemanda,
  PerfilUsuario,
  RecomendacaoParecer,
  RecomendacaoQualificacao,
  StatusEntrega,
  TipoCampanha,
  Usuario,
} from '@/types/domain';

export const PERFIL_LABEL: Record<PerfilUsuario, string> = {
  DEMANDANTE: 'Demandante',
  ANALISTA: 'Analista de Inovação',
  ESPECIALISTA: 'Especialista',
};

export const PERFIL_DESCRICAO: Record<PerfilUsuario, string> = {
  DEMANDANTE: 'Dono do problema: registra a demanda, participa da jornada e valida as entregas e o MVP.',
  ANALISTA: 'Faz a triagem e a qualificação, conduz o ciclo de vida e acompanha o portfólio e os indicadores.',
  ESPECIALISTA: 'Emite pareceres técnicos. Com alçada de governança, também prioriza e decide.',
};

// Consulta direcionada à pessoa, ou aberta para a área técnica do especialista
export function podeResponderConsulta(
  c: { especialista: { id: number } | null; areaTecnica: string; status: string },
  u: Pick<Usuario, 'id' | 'perfil' | 'areaTecnica'> | null | undefined,
): boolean {
  if (!u || u.perfil !== 'ESPECIALISTA' || c.status !== 'PENDENTE') return false;
  return c.especialista ? c.especialista.id === u.id : c.areaTecnica === u.areaTecnica;
}

export function rotuloUsuario(u: Pick<Usuario, 'perfil' | 'alcadaGovernanca'>): string {
  if (u.perfil === 'ESPECIALISTA' && u.alcadaGovernanca) return 'Especialista · Governança';
  if (u.perfil === 'ANALISTA' && u.alcadaGovernanca) return 'Analista · Gestor';
  return PERFIL_LABEL[u.perfil];
}

export const ORIGEM_LABEL: Record<OrigemDemanda, string> = {
  ESPONTANEA: 'Espontânea',
  INDUZIDA: 'Induzida',
};

export const ORIGEM_DESCRICAO: Record<OrigemDemanda, string> = {
  ESPONTANEA: 'Backlog de ideias, problemas e oportunidades registrados a qualquer momento.',
  INDUZIDA: 'Resposta a uma campanha, desafio, hackathon ou residência.',
};

export const NATUREZA_LABEL: Record<NaturezaDemanda, string> = {
  PROBLEMA: 'Problema',
  NECESSIDADE: 'Necessidade',
  OPORTUNIDADE: 'Oportunidade',
};

export const TIPO_CAMPANHA_LABEL: Record<TipoCampanha, string> = {
  CAMPANHA: 'Campanha',
  DESAFIO: 'Desafio',
  HACKATHON: 'Hackathon',
  RESIDENCIA: 'Residência',
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

// ---------------- Jornada ----------------

export const ETAPA_LABEL: Record<EtapaJornada, string> = {
  BACKLOG: 'Backlog',
  QUALIFICACAO: 'Qualificação',
  GOVERNANCA: 'Governança',
  EXPERIMENTACAO: 'Experimentação (PoC)',
  MVP: 'MVP / Piloto',
  CONCLUIDO: 'Concluído',
  ARQUIVADO: 'Arquivado',
  DESCONTINUADO: 'Descontinuado',
};

export const ETAPA_CURTO: Record<EtapaJornada, string> = {
  BACKLOG: 'Backlog',
  QUALIFICACAO: 'Qualificação',
  GOVERNANCA: 'Governança',
  EXPERIMENTACAO: 'Experimentação',
  MVP: 'MVP',
  CONCLUIDO: 'Concluído',
  ARQUIVADO: 'Arquivado',
  DESCONTINUADO: 'Descontinuado',
};

export const ETAPA_DESCRICAO: Record<EtapaJornada, string> = {
  BACKLOG: 'Registrada e aguardando triagem.',
  QUALIFICACAO: 'Triagem e qualificação pelo Analista, com pareceres quando necessário.',
  GOVERNANCA: 'Aguardando priorização ou decisão da instância de governança.',
  EXPERIMENTACAO: 'Ciclo de experimentação e provas de conceito.',
  MVP: 'Desenvolvimento do MVP ou piloto, validado pelo demandante.',
  CONCLUIDO: 'Jornada concluída com entrega validada.',
  ARQUIVADO: 'Não seguiu após a triagem.',
  DESCONTINUADO: 'Interrompido por decisão de governança.',
};

export const ETAPA_BADGE: Record<EtapaJornada, string> = {
  BACKLOG: 'bg-slate-100 text-slate-700 border-slate-200',
  QUALIFICACAO: 'bg-amber-50 text-amber-800 border-amber-200',
  GOVERNANCA: 'bg-yellow-50 text-yellow-900 border-yellow-300',
  EXPERIMENTACAO: 'bg-sky-50 text-sky-800 border-sky-200',
  MVP: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  CONCLUIDO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ARQUIVADO: 'bg-slate-100 text-slate-500 border-slate-200',
  DESCONTINUADO: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const ETAPA_COR: Record<EtapaJornada, string> = {
  BACKLOG: '#94A3B8',
  QUALIFICACAO: '#F59E0B',
  GOVERNANCA: '#CACA00',
  EXPERIMENTACAO: '#0EA5E9',
  MVP: '#6366F1',
  CONCLUIDO: '#10B981',
  ARQUIVADO: '#CBD5E1',
  DESCONTINUADO: '#F43F5E',
};

// Colunas do Kanban (marcos reais da jornada)
export const ETAPAS_FLUXO: EtapaJornada[] = ['BACKLOG', 'QUALIFICACAO', 'GOVERNANCA', 'EXPERIMENTACAO', 'MVP', 'CONCLUIDO'];
export const ETAPAS_TERMINAIS: EtapaJornada[] = ['CONCLUIDO', 'ARQUIVADO', 'DESCONTINUADO'];
export const ETAPAS_ENCERRADAS: EtapaJornada[] = ['ARQUIVADO', 'DESCONTINUADO'];
export const TODAS_ETAPAS: EtapaJornada[] = [...ETAPAS_FLUXO, ...ETAPAS_ENCERRADAS];

export const RECOMENDACAO_QUALIFICACAO_LABEL: Record<RecomendacaoQualificacao, string> = {
  ENCAMINHAR_GOVERNANCA: 'Encaminhar à governança',
  INICIAR_EXPERIMENTACAO: 'Iniciar experimentação',
  DEVOLVER_DEMANDANTE: 'Devolver ao demandante',
  ARQUIVAR: 'Arquivar',
};

export const RECOMENDACAO_QUALIFICACAO_DESCRICAO: Record<RecomendacaoQualificacao, string> = {
  ENCAMINHAR_GOVERNANCA: 'Precisa de priorização ou decisão de quem tem alçada.',
  INICIAR_EXPERIMENTACAO: 'Dentro da alçada da equipe de inovação; segue direto para experimentação.',
  DEVOLVER_DEMANDANTE: 'Falta informação; o demandante complementa e a demanda volta ao backlog.',
  ARQUIVAR: 'Não aderente ou inviável neste momento.',
};

export const CRITERIOS_QUALIFICACAO = [
  { chave: 'aderenciaTese', label: 'Aderência à Tese', dica: 'Alinhamento com a Tese de Inovação e as arenas estratégicas.' },
  { chave: 'relevancia', label: 'Relevância', dica: 'Tamanho do problema e impacto para o negócio.' },
  { chave: 'grauInovacao', label: 'Grau de inovação', dica: 'Incremental (1) até disruptivo (5).' },
  { chave: 'viabilidade', label: 'Viabilidade e factibilidade', dica: 'Recursos, tecnologia e prazo disponíveis.' },
] as const;

export const RECOMENDACAO_PARECER_LABEL: Record<RecomendacaoParecer, string> = {
  FAVORAVEL: 'Favorável',
  FAVORAVEL_COM_RESSALVAS: 'Favorável com ressalvas',
  DESFAVORAVEL: 'Desfavorável',
};

export const RECOMENDACAO_PARECER_BADGE: Record<RecomendacaoParecer, string> = {
  FAVORAVEL: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  FAVORAVEL_COM_RESSALVAS: 'bg-amber-50 text-amber-800 border-amber-200',
  DESFAVORAVEL: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const ENTREGA_LABEL: Record<StatusEntrega, string> = {
  AGUARDANDO_VALIDACAO: 'Aguardando validação',
  VALIDADA: 'Validada',
  AJUSTES_SOLICITADOS: 'Ajustes solicitados',
};

export const ENTREGA_BADGE: Record<StatusEntrega, string> = {
  AGUARDANDO_VALIDACAO: 'bg-amber-50 text-amber-800 border-amber-200',
  VALIDADA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  AJUSTES_SOLICITADOS: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const DECISAO_LABEL: Record<DecisaoTipo, string> = {
  APROVADO: 'Aprovado / priorizado',
  PIVOTADO: 'Pivotado',
  REPROVADO: 'Descontinuado',
};

export const RADAR_EIXOS = ['Negócio', 'Produto', 'Time', 'Receita'] as const;

// Definições da régua TRL usadas no protótipo homologado
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
