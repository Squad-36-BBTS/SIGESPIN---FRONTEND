import { Lightbulb } from 'lucide-react';
import { lazy } from 'react';

import type { RotasFluxo } from '../tipos';

// Recomendações: Analista e Especialista recomendam; o Demandante destinatário converte ou recusa
const rotas: RotasFluxo = {
  app: [{ caminho: 'recomendacoes', Pagina: lazy(() => import('./RecomendacoesPage')) }],
  menu: [{ to: '/app/recomendacoes', label: 'Recomendações', icon: Lightbulb, ordem: 45 }],
};
export default rotas;
