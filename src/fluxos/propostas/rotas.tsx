import { GitPullRequestArrow } from 'lucide-react';
import { lazy } from 'react';

import type { RotasFluxo } from '../tipos';

// Propostas de configuração: o Analista propõe coluna ou percurso; o Especialista decide.
// A consulta é aberta a todos os perfis autenticados.
const rotas: RotasFluxo = {
  app: [{ caminho: 'propostas', Pagina: lazy(() => import('./PropostasPage')) }],
  menu: [{ to: '/app/propostas', label: 'Propostas de configuração', icon: GitPullRequestArrow, ordem: 65 }],
};
export default rotas;
