import { Settings2, UserRound } from 'lucide-react';
import { lazy } from 'react';

import type { RotasFluxo } from '../tipos';

// Governança (Especialista): configuração do Kanban (etapas, transições e exigência de governança)
// e meu perfil, com a matriz de papéis × ações
const rotas: RotasFluxo = {
  app: [
    { caminho: 'kanban/configuracao', Pagina: lazy(() => import('./KanbanConfigPage')) },
    { caminho: 'perfil', Pagina: lazy(() => import('./PerfilPage')) },
  ],
  menu: [
    { to: '/app/kanban/configuracao', label: 'Configurar Kanban', icon: Settings2, ordem: 60 },
    { to: '/app/perfil', label: 'Meu perfil', icon: UserRound, ordem: 90 },
  ],
};
export default rotas;
