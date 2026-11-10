import { ArrowRight, ClipboardList, Gauge, MessagesSquare, PackageCheck } from 'lucide-react';

import { negado, noProjeto, valorMatriz, visivelPara } from '@/utils/permissoes';

import type { AcaoProjeto, CtxProjeto } from '../tipos';
import { AvaliacaoTrlModal } from './AvaliacaoTrlModal';
import { ConsultaModal } from './ConsultaModal';
import { EntregaModal } from './EntregaModal';
import { MovimentacaoModal } from './MovimentacaoModal';
import { QualificacaoModal } from './QualificacaoModal';

// Movimentar: depende das transições configuradas a partir da etapa atual
function permMover({ p, usuario, pendente }: CtxProjeto) {
  // Quem não solicita transições (Especialista) só poderia mover sem governança, que está "a definir"
  const acao = valorMatriz('solicitarTransicao', usuario.perfil) !== 'SIM' || p.transicoesDisponiveis.some((t) => !t.exigeGovernanca) ? 'moverSemGovernanca' : 'solicitarTransicao';
  const base = noProjeto(acao, usuario, p, { solicitacaoPendente: !!pendente });
  if (!base.permitido) return base;
  if (!p.transicoesDisponiveis.length) return negado(`Não há transições configuradas a partir de ${p.etapa.nome}.`);
  return base;
}

// Analista: qualificar, consultar Especialista, avaliar TRL, movimentar o Kanban e publicar entregas.
// O Especialista também vê as ações "a definir" para ele (TRL, mover, entrega), desabilitadas.
const acoes: AcaoProjeto[] = [
  {
    id: 'qualificar',
    ordem: 10,
    botao: ({ p, usuario }) =>
      visivelPara('qualificar', usuario.perfil)
        ? {
            perm: noProjeto('qualificar', usuario, p),
            rotulo: p.qualificacoes.length ? 'Nova qualificação' : 'Qualificar',
            icon: <ClipboardList className="h-4 w-4" />,
            primaria: p.pendencias.includes('AGUARDANDO_TRIAGEM'),
          }
        : null,
    Modal: QualificacaoModal,
  },
  {
    id: 'consultarEspecialista',
    ordem: 20,
    botao: ({ p, usuario }) =>
      visivelPara('consultarEspecialista', usuario.perfil) ? { perm: noProjeto('consultarEspecialista', usuario, p), rotulo: 'Consultar Especialista', icon: <MessagesSquare className="h-4 w-4" /> } : null,
    Modal: ConsultaModal,
  },
  {
    id: 'avaliarTrl',
    ordem: 30,
    botao: ({ p, usuario }) => (visivelPara('avaliarTrl', usuario.perfil) ? { perm: noProjeto('avaliarTrl', usuario, p), rotulo: 'Registrar avaliação TRL', icon: <Gauge className="h-4 w-4" /> } : null),
    Modal: AvaliacaoTrlModal,
  },
  {
    id: 'movimentar',
    ordem: 40,
    botao: (c) =>
      visivelPara('solicitarTransicao', c.usuario.perfil) || visivelPara('moverSemGovernanca', c.usuario.perfil)
        ? { perm: permMover(c), rotulo: 'Movimentar no Kanban', icon: <ArrowRight className="h-4 w-4" /> }
        : null,
    Modal: MovimentacaoModal,
  },
  {
    id: 'submeterEntrega',
    ordem: 50,
    botao: ({ p, usuario }) =>
      visivelPara('submeterEntrega', usuario.perfil) ? { perm: noProjeto('submeterEntrega', usuario, p), rotulo: 'Publicar entrega', icon: <PackageCheck className="h-4 w-4" /> } : null,
    Modal: EntregaModal,
  },
];
export default acoes;
