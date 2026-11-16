// Matriz de permissões do guia da Fase 3 (seção 2), em um único lugar.
// Cada ação devolve se está disponível e, quando não estiver, o MOTIVO, para a interface
// explicar em vez de mostrar um botão sem contexto. O mock confere as mesmas condições ao executar.
import type { PerfilUsuario, Projeto, SolicitacaoTransicao, TransicaoKanban, Usuario } from '@/types/domain';

export type AcaoId =
  | 'registrarDemanda'
  | 'qualificar'
  | 'consultarEspecialista'
  | 'emitirParecer'
  | 'avaliarTrl'
  | 'moverDireto'
  | 'solicitarAvanco'
  | 'decidirAvanco'
  | 'cancelarAvanco'
  | 'configurarQuadro'
  | 'proporConfiguracao'
  | 'decidirProposta'
  | 'cancelarProposta'
  | 'submeterEntrega'
  | 'validarEntrega'
  | 'registrarCorrecao'
  | 'recomendarDemanda'
  | 'responderRecomendacao'
  | 'gerirProjeto'
  | 'comentar';

export interface Permissao {
  permitido: boolean;
  motivo?: string;
}

// Linhas = ações; colunas = perfis. null = não pode; texto = pode, com a condição do perfil
const MATRIZ: Record<AcaoId, Record<PerfilUsuario, string | null>> = {
  registrarDemanda: { DEMANDANTE: 'Sim', ANALISTA: null, ESPECIALISTA: null },
  qualificar: { DEMANDANTE: null, ANALISTA: 'Sim', ESPECIALISTA: null },
  consultarEspecialista: { DEMANDANTE: null, ANALISTA: 'Sim', ESPECIALISTA: null },
  emitirParecer: { DEMANDANTE: null, ANALISTA: null, ESPECIALISTA: 'Sim' },
  avaliarTrl: { DEMANDANTE: null, ANALISTA: 'Sim', ESPECIALISTA: 'Sim' },
  moverDireto: { DEMANDANTE: null, ANALISTA: 'Percurso livre', ESPECIALISTA: 'Percurso livre ou governado' },
  solicitarAvanco: { DEMANDANTE: null, ANALISTA: 'Sim', ESPECIALISTA: null },
  decidirAvanco: { DEMANDANTE: null, ANALISTA: null, ESPECIALISTA: 'Sim' },
  cancelarAvanco: { DEMANDANTE: null, ANALISTA: 'Pedido próprio', ESPECIALISTA: 'Sim' },
  configurarQuadro: { DEMANDANTE: null, ANALISTA: null, ESPECIALISTA: 'Sim' },
  proporConfiguracao: { DEMANDANTE: null, ANALISTA: 'Sim', ESPECIALISTA: null },
  decidirProposta: { DEMANDANTE: null, ANALISTA: null, ESPECIALISTA: 'Sim' },
  cancelarProposta: { DEMANDANTE: null, ANALISTA: 'Pedido próprio', ESPECIALISTA: 'Sim' },
  submeterEntrega: { DEMANDANTE: null, ANALISTA: 'Sim', ESPECIALISTA: 'Sim' },
  validarEntrega: { DEMANDANTE: 'Responsável pelo projeto', ANALISTA: null, ESPECIALISTA: null },
  registrarCorrecao: { DEMANDANTE: 'Responsável pelo projeto', ANALISTA: null, ESPECIALISTA: null },
  recomendarDemanda: { DEMANDANTE: null, ANALISTA: 'Sim', ESPECIALISTA: 'Sim' },
  responderRecomendacao: { DEMANDANTE: 'Somente destinatário', ANALISTA: null, ESPECIALISTA: null },
  gerirProjeto: { DEMANDANTE: null, ANALISTA: null, ESPECIALISTA: 'Sim' },
  comentar: { DEMANDANTE: 'Responsável pelo projeto', ANALISTA: 'Sim', ESPECIALISTA: 'Sim' },
};

export const ACAO_LABEL: Record<AcaoId, string> = {
  registrarDemanda: 'Cadastrar demanda',
  qualificar: 'Qualificar demanda',
  consultarEspecialista: 'Consultar Especialista',
  emitirParecer: 'Emitir parecer',
  avaliarTrl: 'Registrar TRL',
  moverDireto: 'Mover diretamente',
  solicitarAvanco: 'Solicitar avanço governado',
  decidirAvanco: 'Decidir avanço',
  cancelarAvanco: 'Cancelar avanço',
  configurarQuadro: 'Configurar quadro diretamente',
  proporConfiguracao: 'Propor coluna ou percurso',
  decidirProposta: 'Decidir proposta de configuração',
  cancelarProposta: 'Cancelar proposta de configuração',
  submeterEntrega: 'Submeter entrega',
  validarEntrega: 'Validar entrega',
  registrarCorrecao: 'Registrar correção',
  recomendarDemanda: 'Recomendar demanda',
  responderRecomendacao: 'Converter ou recusar recomendação',
  gerirProjeto: 'Editar, arquivar e reativar projeto',
  comentar: 'Participar da conversa do projeto',
};

// Coluna "Condição adicional" do guia
export const ACAO_CONDICAO: Record<AcaoId, string> = {
  registrarDemanda: 'Projeto começa em Ideação',
  qualificar: 'Projeto ativo',
  consultarEspecialista: 'Projeto ativo e Especialista ativo como destinatário',
  emitirParecer: 'Se vinculado à consulta, exige o destinatário correto',
  avaliarTrl: 'Evidências do projeto',
  moverDireto: 'Percurso válido e projeto sem solicitação pendente',
  solicitarAvanco: 'Percurso governado; um pedido pendente por projeto',
  decidirAvanco: 'Pedido pendente',
  cancelarAvanco: 'Pedido pendente',
  configurarQuadro: 'Restrições de uso e versão',
  proporConfiguracao: 'Proposta válida e justificativa',
  decidirProposta: 'Pedido pendente',
  cancelarProposta: 'Pedido pendente',
  submeterEntrega: 'Projeto ativo',
  validarEntrega: 'Projeto ativo',
  registrarCorrecao: 'Projeto ativo',
  recomendarDemanda: 'Destinatário ativo com perfil Demandante',
  responderRecomendacao: 'Recomendação pendente',
  gerirProjeto: 'Versão vigente e justificativa',
  comentar: 'Projeto ativo',
};

// Ordem da tabela de permissões (Meu perfil)
export const ACOES_MATRIZ: AcaoId[] = [
  'registrarDemanda',
  'qualificar',
  'consultarEspecialista',
  'emitirParecer',
  'avaliarTrl',
  'moverDireto',
  'solicitarAvanco',
  'decidirAvanco',
  'cancelarAvanco',
  'configurarQuadro',
  'proporConfiguracao',
  'decidirProposta',
  'cancelarProposta',
  'submeterEntrega',
  'validarEntrega',
  'registrarCorrecao',
  'recomendarDemanda',
  'responderRecomendacao',
  'gerirProjeto',
];

export function valorMatriz(acao: AcaoId, perfil: PerfilUsuario): string | null {
  return MATRIZ[acao][perfil];
}

const QUEM: Record<AcaoId, string> = {
  registrarDemanda: 'ao Demandante',
  qualificar: 'ao Analista',
  consultarEspecialista: 'ao Analista',
  emitirParecer: 'ao Especialista',
  avaliarTrl: 'ao Analista e ao Especialista',
  moverDireto: 'ao Analista (percurso livre) e ao Especialista',
  solicitarAvanco: 'ao Analista',
  decidirAvanco: 'ao Especialista',
  cancelarAvanco: 'ao Analista que abriu o pedido e ao Especialista',
  configurarQuadro: 'ao Especialista',
  proporConfiguracao: 'ao Analista',
  decidirProposta: 'ao Especialista',
  cancelarProposta: 'ao Analista que abriu a proposta e ao Especialista',
  submeterEntrega: 'ao Analista e ao Especialista',
  validarEntrega: 'ao Demandante responsável pelo projeto',
  registrarCorrecao: 'ao Demandante responsável pelo projeto',
  recomendarDemanda: 'ao Analista e ao Especialista',
  responderRecomendacao: 'ao Demandante destinatário',
  gerirProjeto: 'ao Especialista',
  comentar: 'à equipe e ao Demandante responsável',
};

export const negado = (motivo: string): Permissao => ({ permitido: false, motivo });
const PERMITIDO: Permissao = { permitido: true };

// Permissão pelo perfil (sem contexto do projeto)
export function porPerfil(acao: AcaoId, u: Usuario | null): Permissao {
  if (!u) return negado('Entre no sistema.');
  return MATRIZ[acao][u.perfil] ? PERMITIDO : negado(`Esta ação cabe ${QUEM[acao]}.`);
}

// Ações que exigem projeto ativo (não arquivado). Gerir o projeto inclui a reativação.
const EXIGEM_ATIVO: AcaoId[] = [
  'qualificar',
  'consultarEspecialista',
  'emitirParecer',
  'avaliarTrl',
  'moverDireto',
  'solicitarAvanco',
  'submeterEntrega',
  'validarEntrega',
  'registrarCorrecao',
  'comentar',
];

// Permissão no contexto de um projeto (estado, responsável, pedidos pendentes)
export function noProjeto(acao: AcaoId, u: Usuario | null, p: Projeto, extra: { solicitacaoPendente?: boolean } = {}): Permissao {
  const base = porPerfil(acao, u);
  if (!base.permitido || !u) return base;
  if (p.arquivado && EXIGEM_ATIVO.includes(acao)) return negado('O projeto está arquivado. As ações voltam após a reativação pelo Especialista.');
  if ((acao === 'moverDireto' || acao === 'solicitarAvanco') && p.etapa.terminal) return negado(`${p.etapa.nome} é uma etapa terminal e não admite saída.`);
  if ((acao === 'moverDireto' || acao === 'solicitarAvanco') && extra.solicitacaoPendente) return negado('Já existe um pedido de avanço pendente para este projeto.');
  if ((acao === 'validarEntrega' || acao === 'registrarCorrecao') && p.demandante?.id !== u.id)
    return negado(p.demandante ? `Somente ${p.demandante.nome}, Demandante responsável pelo projeto, pode fazer isso.` : 'O projeto ainda não tem Demandante responsável.');
  if (acao === 'comentar' && u.perfil === 'DEMANDANTE' && p.demandante?.id !== u.id) return negado('Somente o Demandante responsável participa da conversa.');
  return PERMITIDO;
}

// Percurso livre: Analista e Especialista movem direto. Percurso governado: Especialista move direto;
// o Analista abre um pedido de avanço.
export function modoMovimentacao(u: Usuario, t: Pick<TransicaoKanban, 'exigeGovernanca'>): 'DIRETO' | 'SOLICITACAO' | null {
  if (u.perfil === 'ESPECIALISTA') return 'DIRETO';
  if (u.perfil === 'ANALISTA') return t.exigeGovernanca ? 'SOLICITACAO' : 'DIRETO';
  return null;
}

// Cancelar pedido de avanço ou proposta: o Analista só cancela o próprio; o Especialista cancela qualquer um
export function podeCancelar(acao: 'cancelarAvanco' | 'cancelarProposta', u: Usuario | null, pedido: { status: string; solicitanteId: number }): Permissao {
  const base = porPerfil(acao, u);
  if (!base.permitido || !u) return base;
  if (pedido.status !== 'PENDENTE') return negado('Somente pedidos pendentes podem ser cancelados.');
  if (u.perfil === 'ANALISTA' && pedido.solicitanteId !== u.id) return negado('O Analista só cancela os pedidos que ele mesmo abriu.');
  return PERMITIDO;
}

export const solicitanteDe = (s: SolicitacaoTransicao) => ({ status: s.status, solicitanteId: s.solicitante.id });

// A ação aparece para o perfil quando a matriz permite; o que não cabe ao perfil fica fora da barra de ações
export const visivelPara = (acao: AcaoId, perfil: PerfilUsuario) => valorMatriz(acao, perfil) !== null;
