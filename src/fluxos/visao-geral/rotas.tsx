import { Bell, LayoutDashboard, Megaphone } from 'lucide-react';
import { lazy } from 'react';

import type { RotasFluxo } from '../tipos';

// Visão geral: dashboard de indicadores (página inicial da área logada), ações de mobilização vigentes
// e notificações globais das movimentações feitas por Especialistas
const rotas: RotasFluxo = {
  app: [
    { caminho: '', Pagina: lazy(() => import('./DashboardPage')) },
    { caminho: 'mobilizacao', Pagina: lazy(() => import('./AcoesMobilizacaoPage')) },
    { caminho: 'notificacoes', Pagina: lazy(() => import('./NotificacoesPage')) },
  ],
  menu: [
    { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true, ordem: 30 },
    { to: '/app/mobilizacao', label: 'Ações de mobilização', icon: Megaphone, ordem: 50 },
    { to: '/app/notificacoes', label: 'Notificações', icon: Bell, ordem: 55, contador: 'notificacoes' },
  ],
};
export default rotas;
