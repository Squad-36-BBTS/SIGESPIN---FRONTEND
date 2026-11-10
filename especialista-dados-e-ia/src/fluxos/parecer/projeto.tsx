import { MessagesSquare } from 'lucide-react';

import type { ConsultaEspecialista } from '@/types/domain';
import { podeResponderConsulta } from '@/utils/constants';
import { negado, noProjeto, visivelPara } from '@/utils/permissoes';

import type { AcaoProjeto, ModalProjetoProps } from '../tipos';
import { ParecerModal } from './ParecerModal';

function ModalParecer({ projeto, alvo, onFechar, onFeito }: ModalProjetoProps) {
  const c = alvo as ConsultaEspecialista | null;
  return <ParecerModal consulta={c && { ...c, projetoTitulo: projeto.titulo }} onFechar={onFechar} onFeito={onFeito} />;
}

// Especialista: emitir parecer técnico. O parecer subsidia a análise; não é decisão de governança.
const acoes: AcaoProjeto[] = [
  {
    id: 'emitirParecer',
    ordem: 60,
    botao: ({ p, usuario }) => {
      if (!visivelPara('emitirParecer', usuario.perfil)) return null;
      const paraMim = p.consultas.find((c) => podeResponderConsulta(c, usuario));
      return {
        perm: paraMim ? noProjeto('emitirParecer', usuario, p) : negado('Não há consulta pendente para você neste projeto.'),
        rotulo: 'Emitir parecer',
        icon: <MessagesSquare className="h-4 w-4" />,
        primaria: !!paraMim,
        alvo: paraMim,
      };
    },
    Modal: ModalParecer,
  },
];
export default acoes;
