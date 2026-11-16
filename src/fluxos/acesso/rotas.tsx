import { lazy } from 'react';

import type { RotasFluxo } from '../tipos';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';

// Fluxo de acesso: landing, login e cadastro (pedido de acesso).
// Landing e login entram no pacote inicial; o cadastro só é baixado quando a tela é aberta.
const rotas: RotasFluxo = {
  publicas: [
    { caminho: '/', Pagina: LandingPage },
    { caminho: '/login', Pagina: LoginPage },
    { caminho: '/cadastro', Pagina: lazy(() => import('./CadastroPage')) },
  ],
};
export default rotas;
