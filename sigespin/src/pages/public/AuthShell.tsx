import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Logo } from '@/components/common/ui';

// Moldura das telas de login e cadastro: foto real à esquerda, formulário à direita
export function AuthShell({ imagem, titulo, texto, children }: { imagem: string; titulo: string; texto: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden lg:block">
        <img src={imagem} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-bb-navy via-bb-navy/70 to-bb-blue/40" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <Link to="/" aria-label="Voltar para a página inicial">
            <Logo claro />
          </Link>
          <div className="page-in max-w-md">
            <span className="mb-4 block h-1 w-12 rounded-full bg-bb-yellow" />
            <h2 className="text-3xl font-bold leading-tight">{titulo}</h2>
            <p className="mt-3 text-white/80">{texto}</p>
          </div>
        </div>
      </aside>

      <main className="flex flex-col px-4 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="lg:hidden">
            <Logo />
          </Link>
          <Link to="/" className="btn-ghost ml-auto">
            <ArrowLeft className="h-4 w-4" /> Início
          </Link>
        </div>
        <div className="page-in mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">{children}</div>
        <p className="text-center text-xs text-bb-muted">Ambiente restrito · BB Tecnologia e Serviços</p>
      </main>
    </div>
  );
}
