import { MessageSquareReply, MessagesSquare } from 'lucide-react';
import { useMemo } from 'react';

import type { ConsultaEspecialista } from '@/types/domain';
import { podeResponderConsulta } from '@/utils/constants';
import { noProjeto, visivelPara } from '@/utils/permissoes';

import type { AcaoProjeto, ModalProjetoProps } from '../tipos';
import { ParecerModal } from './ParecerModal';

// alvo: a consulta respondida, ou null para um parecer independente
function ModalParecer({ projeto, aberto, alvo, onFechar, onFeito }: ModalProjetoProps) {
  const dados = useMemo(
    () => (aberto ? { projetoId: projeto.id, projetoTitulo: projeto.titulo, evidencias: projeto.evidencias, consulta: (alvo as ConsultaEspecialista | null) ?? null } : null),
    [aberto, alvo, projeto],
  );
  return <ParecerModal alvo={dados} onFechar={onFechar} onFeito={onFeito} />;
}

// Especialista: quando há consulta dirigida a ele, pode responder a ela ou emitir um parecer independente;
// sem consulta, emite o parecer independente
const acoes: AcaoProjeto[] = [
  {
    id: 'emitirParecer',
    ordem: 60,
    botao: ({ p, usuario }) => {
      if (!visivelPara('emitirParecer', usuario.perfil)) return null;
      const paraMim = p.consultas.find((c) => podeResponderConsulta(c, usuario));
      if (!paraMim) return null;
      return { perm: noProjeto('emitirParecer', usuario, p), rotulo: 'Responder consulta', icon: <MessageSquareReply className="h-4 w-4" />, primaria: true, alvo: paraMim };
    },
    Modal: ModalParecer,
  },
  {
    id: 'emitirParecerIndependente',
    ordem: 61,
    botao: ({ p, usuario }) =>
      visivelPara('emitirParecer', usuario.perfil)
        ? { perm: noProjeto('emitirParecer', usuario, p), rotulo: 'Emitir parecer independente', icon: <MessagesSquare className="h-4 w-4" />, alvo: null }
        : null,
    Modal: ModalParecer,
  },
];
export default acoes;
