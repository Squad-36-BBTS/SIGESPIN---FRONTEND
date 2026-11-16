import { Gavel } from 'lucide-react';

import type { SolicitacaoTransicao } from '@/types/domain';
import { negado, noProjeto, visivelPara } from '@/utils/permissoes';

import type { AcaoProjeto, ModalProjetoProps } from '../tipos';
import { DecisaoModal } from './DecisaoModal';

type AlvoDecisao = { s: SolicitacaoTransicao; d: 'APROVADA' | 'REJEITADA' };

function ModalDecisao({ projeto, alvo, onFechar, onFeito }: ModalProjetoProps) {
  const a = alvo as AlvoDecisao | null;
  return <DecisaoModal solicitacao={a && { ...a.s, projetoTitulo: projeto.titulo }} decisaoInicial={a?.d ?? 'APROVADA'} onFechar={onFechar} onFeito={onFeito} />;
}

// Especialista: decidir transições do Kanban que exigem governança (aprovar move; rejeitar mantém)
const acoes: AcaoProjeto[] = [
  {
    id: 'decidirTransicao',
    ordem: 70,
    botao: ({ p, usuario, pendente }) => {
      if (!visivelPara('decidirTransicao', usuario.perfil)) return null;
      return {
        perm: pendente ? noProjeto('decidirTransicao', usuario, p) : negado('Não há solicitação aguardando governança.'),
        rotulo: 'Decidir transição',
        icon: <Gavel className="h-4 w-4" />,
        primaria: !!pendente,
        alvo: pendente && { s: pendente, d: 'APROVADA' },
      };
    },
    Modal: ModalDecisao,
  },
];
export default acoes;
