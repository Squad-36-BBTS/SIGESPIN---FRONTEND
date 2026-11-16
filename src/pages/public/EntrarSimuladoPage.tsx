import { LogIn, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Logo, Spinner } from '@/components/common/ui';
import { useAuth } from '@/hooks';
import { mensagemErro } from '@/services/api';
import { resetarMock } from '@/services/mock/mockServer';
import { SENHA_DEMO, USUARIOS, USUARIOS_SELETOR } from '@/services/mock/seed';
import { rotuloUsuario } from '@/utils/constants';

// Entrada simples usada quando o fluxo de acesso (landing e login) não está nesta versão.
// Permite rodar e testar cada fluxo sozinho com os usuários simulados.
export default function EntrarSimuladoPage() {
  const { entrar, autenticado } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [entrando, setEntrando] = useState<number | null>(null);
  const destino = (location.state as { de?: string } | null)?.de ?? '/app';

  if (autenticado) return <Navigate to={destino} replace />;

  const entrarComo = async (id: number, email: string) => {
    setEntrando(id);
    try {
      await entrar(email, SENHA_DEMO);
      navigate(destino, { replace: true });
    } catch (er) {
      toast.error(mensagemErro(er));
      setEntrando(null);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-bb-bg px-4 py-10">
      <div className="card w-full max-w-md p-6">
        <Logo />
        <h1 className="mt-6 text-xl font-bold">Entrar como</h1>
        <p className="mt-1 text-sm text-bb-muted">Login simulado. A landing page e o login completo fazem parte do fluxo de acesso.</p>
        <div className="mt-5 grid gap-2">
          {USUARIOS_SELETOR.map((id) => USUARIOS.find((x) => x.id === id)!).map((u) => (
            <button
              key={u.id}
              className="flex items-center gap-3 rounded-lg border border-bb-line px-3 py-2.5 text-left transition hover:border-bb-blue hover:bg-bb-blue-light"
              onClick={() => entrarComo(u.id, u.email)}
              disabled={entrando !== null}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{u.nome}</span>
                <span className="block truncate text-[11px] text-bb-muted">{rotuloUsuario(u)}</span>
              </span>
              {entrando === u.id ? <Spinner /> : <LogIn className="h-4 w-4 text-bb-muted" />}
            </button>
          ))}
        </div>
        <button
          className="btn-ghost btn-sm mt-4"
          onClick={() => {
            resetarMock();
            toast.success('Dados simulados restaurados.');
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" /> Restaurar dados
        </button>
      </div>
    </main>
  );
}
