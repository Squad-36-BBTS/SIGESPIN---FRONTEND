import { Check, FilePen, MessageSquarePlus } from 'lucide-react';

import type { Entrega } from '@/types/domain';
import { negado, noProjeto, visivelPara } from '@/utils/permissoes';

import type { AcaoProjeto, ModalProjetoProps } from '../tipos';
import { CorrecaoModal } from './CorrecaoModal';
import { ValidacaoModal } from './ValidacaoModal';

function ModalValidacao({ projeto, alvo, onFechar, onFeito }: ModalProjetoProps) {
  const e = alvo as Entrega | null;
  return <ValidacaoModal entrega={e && { ...e, projetoTitulo: projeto.titulo }} onFechar={onFechar} onFeito={onFeito} />;
}

// Demandante responsável: validar entregas, registrar correções e adicionar contexto
const acoes: AcaoProjeto[] = [
  {
    id: 'validarEntrega',
    ordem: 80,
    botao: ({ p, usuario }) => {
      if (!visivelPara('validarEntrega', usuario.perfil) || !p.entregas.length) return null;
      const perm = noProjeto('validarEntrega', usuario, p);
      const aValidar = p.entregas.find((e) => !e.validacoes.length);
      return {
        perm: perm.permitido && !aValidar ? negado('Não há entrega aguardando a primeira validação. Para uma nova manifestação, use a aba Entregas.') : perm,
        rotulo: 'Validar entrega',
        icon: <Check className="h-4 w-4" />,
        primaria: !!aValidar && perm.permitido,
        alvo: aValidar,
      };
    },
    Modal: ModalValidacao,
  },
  {
    id: 'registrarCorrecao',
    ordem: 85,
    botao: ({ p, usuario }) =>
      visivelPara('registrarCorrecao', usuario.perfil) ? { perm: noProjeto('registrarCorrecao', usuario, p), rotulo: 'Registrar correção', icon: <FilePen className="h-4 w-4" /> } : null,
    Modal: CorrecaoModal,
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
