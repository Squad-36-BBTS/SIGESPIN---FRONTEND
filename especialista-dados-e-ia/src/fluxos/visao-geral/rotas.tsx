import { LayoutDashboard, Megaphone } from 'lucide-react';
import { lazy } from 'react';

import type { RotasFluxo } from '../tipos';

// Visão geral: dashboard de indicadores (página inicial da área logada) e ações de mobilização vigentes
const rotas: RotasFluxo = {
  app: [
    { caminho: '', Pagina: lazy(() => import('./DashboardPage')) },
    { caminho: 'mobilizacao', Pagina: lazy(() => import('./AcoesMobilizacaoPage')) },
  ],
  menu: [
    { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true, ordem: 30 },
    { to: '/app/mobilizacao', label: 'Ações de mobilização', icon: Megaphone, ordem: 50 },
  ],
};
export default rotas;
