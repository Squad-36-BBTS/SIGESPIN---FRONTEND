import { Check, MessageSquarePlus } from 'lucide-react';

import type { Entrega } from '@/types/domain';
import { negado, noProjeto, visivelPara } from '@/utils/permissoes';

import type { AcaoProjeto, ModalProjetoProps } from '../tipos';
import { ValidacaoModal } from './ValidacaoModal';

function ModalValidacao({ projeto, alvo, onFechar, onFeito }: ModalProjetoProps) {
  const e = alvo as Entrega | null;
  return <ValidacaoModal entrega={e && { ...e, projetoTitulo: projeto.titulo }} onFechar={onFechar} onFeito={onFeito} />;
}

// Demandante: validar entregas/MVPs e adicionar contexto durante a evolução da demanda
const acoes: AcaoProjeto[] = [
  {
    id: 'validarEntrega',
    ordem: 80,
    botao: ({ p, usuario }) => {
      if (!visivelPara('validarEntrega', usuario.perfil)) return null;
      const perm = noProjeto('validarEntrega', usuario, p);
      const aValidar = p.entregas.find((e) => !e.validacao);
      return {
        perm: perm.permitido && !aValidar ? negado('Não há entrega aguardando a sua validação.') : perm,
        rotulo: 'Validar entrega',
        icon: <Check className="h-4 w-4" />,
        primaria: !!aValidar && perm.permitido,
        alvo: aValidar,
      };
    },
    Modal: ModalValidacao,
  },
  {
    id: 'adicionarContexto',
    ordem: 90,
    botao: ({ p, usuario, irAba }) =>
      usuario.perfil === 'DEMANDANTE'
        ? { perm: noProjeto('comentar', usuario, p), rotulo: 'Adicionar contexto', icon: <MessageSquarePlus className="h-4 w-4" />, aoClicar: () => irAba('participacao') }
        : null,
  },
];
export default acoes;
