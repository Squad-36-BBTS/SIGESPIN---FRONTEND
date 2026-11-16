import { FilePlus2 } from 'lucide-react';
import { lazy } from 'react';

import { porPerfil } from '@/utils/permissoes';

import type { RotasFluxo } from '../tipos';

// Fluxo do Demandante: registrar a demanda (espontânea ou induzida)
const rotas: RotasFluxo = {
  app: [
    { caminho: 'demandas/nova', Pagina: lazy(() => import('./NovaDemandaPage')) },
  ],
  menu: [
    { to: '/app/demandas/nova', label: 'Nova demanda', icon: FilePlus2, ordem: 40, destaque: true, mostrar: (u) => porPerfil('registrarDemanda', u).permitido },
  ],
};
export default rotas;
