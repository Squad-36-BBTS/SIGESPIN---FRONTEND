import { Link } from 'react-router-dom';

import { Logo } from '@/components/common/ui';

export default function NaoEncontradoPage() {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="page-in text-center">
        <Logo compacto />
        <p className="mt-6 font-mono text-6xl font-bold text-bb-blue">404</p>
        <h1 className="mt-2 text-xl font-bold">Página não encontrada</h1>
        <p className="mt-1 text-bb-muted">O endereço pode ter mudado ou não existe.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Link to="/" className="btn-secondary">
            Página inicial
          </Link>
          <Link to="/app" className="btn-primary">
            Ir para o sistema
          </Link>
        </div>
      </div>
    </div>
  );
}
