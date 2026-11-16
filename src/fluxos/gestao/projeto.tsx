import { Archive, ArchiveRestore, PencilLine } from 'lucide-react';

import { negado, noProjeto, visivelPara } from '@/utils/permissoes';

import type { AcaoProjeto } from '../tipos';
import { ArquivamentoModal } from './ArquivamentoModal';
import { EditarProjetoModal } from './EditarProjetoModal';

// Gestão do projeto (Especialista): editar dados e responsáveis, arquivar e reativar.
// Cada operação usa a versão vigente e entra no histórico de gestão.
const acoes: AcaoProjeto[] = [
  {
    id: 'editarProjeto',
    ordem: 95,
    botao: ({ p, usuario }) => {
      if (!visivelPara('gerirProjeto', usuario.perfil)) return null;
      const perm = noProjeto('gerirProjeto', usuario, p);
      return {
        perm: perm.permitido && p.arquivado ? negado('Reative o projeto para editar os dados.') : perm,
        rotulo: p.demandante ? 'Editar projeto' : 'Atribuir Demandante e editar',
        icon: <PencilLine className="h-4 w-4" />,
        primaria: !p.demandante && !p.arquivado,
      };
    },
    Modal: EditarProjetoModal,
  },
  {
    id: 'arquivamento',
    ordem: 96,
    botao: ({ p, usuario, pendente }) => {
      if (!visivelPara('gerirProjeto', usuario.perfil)) return null;
      const perm = noProjeto('gerirProjeto', usuario, p);
      return {
        perm: perm.permitido && !p.arquivado && pendente ? negado('Há pedido de avanço pendente. Decida ou cancele o pedido antes de arquivar.') : perm,
        rotulo: p.arquivado ? 'Reativar projeto' : 'Arquivar projeto',
        icon: p.arquivado ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />,
        primaria: p.arquivado,
      };
    },
    Modal: ArquivamentoModal,
  },
];
export default acoes;
