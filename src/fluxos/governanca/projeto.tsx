import { Ban, Gavel } from 'lucide-react';

import type { DecisaoRequest, SolicitacaoTransicao } from '@/types/domain';
import { podeCancelar, porPerfil, solicitanteDe, visivelPara } from '@/utils/permissoes';

import type { AcaoProjeto, ModalProjetoProps } from '../tipos';
import { CancelamentoModal } from './CancelamentoModal';
import { DecisaoModal } from './DecisaoModal';

type AlvoDecisao = { s: SolicitacaoTransicao; d: DecisaoRequest['decisao'] };

function ModalDecisao({ projeto, alvo, onFechar, onFeito }: ModalProjetoProps) {
  const a = alvo as AlvoDecisao | null;
  return <DecisaoModal solicitacao={a && { ...a.s, projetoTitulo: projeto.titulo }} decisaoInicial={a?.d ?? 'APROVAR'} onFechar={onFechar} onFeito={onFeito} />;
}

function ModalCancelamento({ projeto, alvo, onFechar, onFeito }: ModalProjetoProps) {
  const s = alvo as SolicitacaoTransicao | null;
  return <CancelamentoModal solicitacao={s && { ...s, projetoTitulo: projeto.titulo }} onFechar={onFechar} onFeito={onFeito} />;
}

// Governança do pedido de avanço: o Especialista decide; o Analista que abriu e o Especialista cancelam
const acoes: AcaoProjeto[] = [
  {
    id: 'decidirAvanco',
    ordem: 70,
    // Só aparece quando há pedido pendente, para não deixar um botão desabilitado sem uso na barra
    botao: ({ usuario, pendente }) => {
      if (!visivelPara('decidirAvanco', usuario.perfil) || !pendente) return null;
      return {
        perm: porPerfil('decidirAvanco', usuario),
        rotulo: 'Decidir avanço',
        icon: <Gavel className="h-4 w-4" />,
        primaria: true,
        alvo: { s: pendente, d: 'APROVAR' },
      };
    },
    Modal: ModalDecisao,
  },
  {
    id: 'cancelarAvanco',
    ordem: 75,
    botao: ({ usuario, pendente }) => {
      if (!visivelPara('cancelarAvanco', usuario.perfil) || !pendente) return null;
      return { perm: podeCancelar('cancelarAvanco', usuario, solicitanteDe(pendente)), rotulo: 'Cancelar pedido', icon: <Ban className="h-4 w-4" />, alvo: pendente };
    },
    Modal: ModalCancelamento,
  },
];
export default acoes;
