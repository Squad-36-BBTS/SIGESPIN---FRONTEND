// Matriz de ações do guia de fluxo (seção 6), em um único lugar.
// Cada ação devolve se está disponível e, quando não estiver, o MOTIVO, para a interface
// explicar em vez de mostrar um botão sem contexto. "A definir" = ainda não validado com o cliente.
import type { PerfilUsuario, Projeto, Usuario } from '@/types/domain';

export type AcaoId =
  | 'registrarDemanda'
  | 'qualificar'
  | 'consultarEspecialista'
  | 'emitirParecer'
  | 'avaliarTrl'
  | 'moverSemGovernanca'
  | 'solicitarTransicao'
  | 'decidirTransicao'
  | 'submeterEntrega'
  | 'validarEntrega'
  | 'configurarKanban'
  | 'criarMobilizacao'
  | 'comentar';

export interface Permissao {
  permitido: boolean;
  aDefinir: boolean;
  motivo?: string;
}

type Valor = 'SIM' | 'NAO' | 'A_DEFINIR';

// Linhas = ações; colunas = perfis (guia, seção 6)
const MATRIZ: Record<AcaoId, Record<PerfilUsuario, Valor>> = {
  registrarDemanda: { DEMANDANTE: 'SIM', ANALISTA: 'A_DEFINIR', ESPECIALISTA: 'A_DEFINIR' },
  qualificar: { DEMANDANTE: 'NAO', ANALISTA: 'SIM', ESPECIALISTA: 'NAO' },
  consultarEspecialista: { DEMANDANTE: 'NAO', ANALISTA: 'SIM', ESPECIALISTA: 'NAO' },
  emitirParecer: { DEMANDANTE: 'NAO', ANALISTA: 'NAO', ESPECIALISTA: 'SIM' },
  avaliarTrl: { DEMANDANTE: 'NAO', ANALISTA: 'SIM', ESPECIALISTA: 'A_DEFINIR' },
  moverSemGovernanca: { DEMANDANTE: 'NAO', ANALISTA: 'SIM', ESPECIALISTA: 'A_DEFINIR' },
  solicitarTransicao: { DEMANDANTE: 'NAO', ANALISTA: 'SIM', ESPECIALISTA: 'NAO' },
  decidirTransicao: { DEMANDANTE: 'NAO', ANALISTA: 'NAO', ESPECIALISTA: 'SIM' },
  submeterEntrega: { DEMANDANTE: 'NAO', ANALISTA: 'SIM', ESPECIALISTA: 'A_DEFINIR' },
  validarEntrega: { DEMANDANTE: 'SIM', ANALISTA: 'NAO', ESPECIALISTA: 'NAO' },
  configurarKanban: { DEMANDANTE: 'A_DEFINIR', ANALISTA: 'A_DEFINIR', ESPECIALISTA: 'A_DEFINIR' },
  criarMobilizacao: { DEMANDANTE: 'A_DEFINIR', ANALISTA: 'A_DEFINIR', ESPECIALISTA: 'A_DEFINIR' },
  comentar: { DEMANDANTE: 'SIM', ANALISTA: 'SIM', ESPECIALISTA: 'SIM' },
};

export const ACAO_LABEL: Record<AcaoId, string> = {
  registrarDemanda: 'Registrar demanda',
  qualificar: 'Qualificar demanda',
  consultarEspecialista: 'Consultar Especialista',
  emitirParecer: 'Emitir parecer técnico',
  avaliarTrl: 'Registrar avaliação de TRL',
  moverSemGovernanca: 'Movimentar transição sem governança',
  solicitarTransicao: 'Solicitar transição com governança',
  decidirTransicao: 'Decidir transição que exige governança',
  submeterEntrega: 'Submeter entrega/MVP',
  validarEntrega: 'Validar entrega/MVP',
  configurarKanban: 'Configurar etapas e transições',
  criarMobilizacao: 'Cadastrar ação de mobilização',
  comentar: 'Participar da conversa do projeto',
};

export const ACOES_MATRIZ: AcaoId[] = [
  'registrarDemanda',
  'qualificar',
  'consultarEspecialista',
  'emitirParecer',
  'avaliarTrl',
  'moverSemGovernanca',
  'solicitarTransicao',
  'decidirTransicao',
  'submeterEntrega',
  'validarEntrega',
  'configurarKanban',
];

export function valorMatriz(acao: AcaoId, perfil: PerfilUsuario): Valor {
  return MATRIZ[acao][perfil];
}

const QUEM: Record<AcaoId, string> = {
  registrarDemanda: 'ao Demandante',
  qualificar: 'ao Analista',
  consultarEspecialista: 'ao Analista',
  emitirParecer: 'ao Especialista',
  avaliarTrl: 'ao Analista',
  moverSemGovernanca: 'ao Analista',
  solicitarTransicao: 'ao Analista',
  decidirTransicao: 'ao Especialista',
  submeterEntrega: 'ao Analista',
  validarEntrega: 'ao Demandante dono do problema',
  configurarKanban: 'a um perfil ainda não definido',
  criarMobilizacao: 'a um perfil ainda não definido',
  comentar: 'à equipe e ao demandante',
};

// Permissão pelo perfil (sem contexto do projeto)
export function porPerfil(acao: AcaoId, u: Usuario | null): Permissao {
  if (!u) return { permitido: false, aDefinir: false, motivo: 'Entre no sistema.' };
  const v = MATRIZ[acao][u.perfil];
  if (v === 'SIM') return { permitido: true, aDefinir: false };
  if (v === 'A_DEFINIR')
    return { permitido: false, aDefinir: true, motivo: 'Permissão em discussão com o cliente; ainda não é uma regra do sistema.' };
  return { permitido: false, aDefinir: false, motivo: `Esta ação cabe ${QUEM[acao]}.` };
}

// Permissão no contexto de um projeto (etapa, responsável, dono etc.)
export function noProjeto(acao: AcaoId, u: Usuario | null, p: Projeto, extra: { solicitacaoPendente?: boolean } = {}): Permissao {
  const base = porPerfil(acao, u);
  if (!base.permitido || !u) return base;
  const negar = (motivo: string): Permissao => ({ permitido: false, aDefinir: false, motivo });

  const acoesDoAnalista: AcaoId[] = ['qualificar', 'consultarEspecialista', 'avaliarTrl', 'moverSemGovernanca', 'solicitarTransicao', 'submeterEntrega'];
  if (acoesDoAnalista.includes(acao)) {
    if (p.etapa.terminal) return negar(`O projeto está em ${p.etapa.nome}, uma etapa final.`);
    if (p.analistaResponsavel && p.analistaResponsavel.id !== u.id)
      return negar(`A iniciativa é conduzida por ${p.analistaResponsavel.nome}.`);
  }
  if ((acao === 'moverSemGovernanca' || acao === 'solicitarTransicao') && extra.solicitacaoPendente)
    return negar('Já existe uma solicitação de transição aguardando governança.');
  if (acao === 'validarEntrega' && p.demandante?.id !== u.id) return negar('Somente o demandante dono do problema valida as entregas.');
  if (acao === 'comentar' && u.perfil === 'DEMANDANTE' && p.demandante?.id !== u.id)
    return negar('Somente o demandante desta demanda participa da conversa.');
  return base;
}

// Ação indisponível por um motivo de contexto (sem consulta à matriz)
export const negado = (motivo: string): Permissao => ({ permitido: false, aDefinir: false, motivo });

// A ação aparece para o perfil quando é "Sim" ou "A definir"; "Não" fica fora da barra de ações
export const visivelPara = (acao: AcaoId, perfil: PerfilUsuario) => valorMatriz(acao, perfil) !== 'NAO';
