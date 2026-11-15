import { Eye, EyeOff, Info, LogIn } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { IMAGENS } from './imagens';
import { Campo, Spinner } from '@/components/common/ui';
import { useAuth } from '@/hooks';
import { USE_MOCK } from '@/services/api';
import { SENHA_DEMO, USUARIOS, USUARIOS_SELETOR } from '@/services/mock/seed';
import { ApiError } from '@/types/api';
import { rotuloUsuario } from '@/utils/constants';

import { AuthShell } from './AuthShell';

const MAX_TENTATIVAS = 5;
const BLOQUEIO_SEG = 60;

export default function LoginPage() {
  const { entrar, autenticado } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [falhas, setFalhas] = useState(0);
  const [bloqueadoAte, setBloqueadoAte] = useState<number | null>(null);
  const [agora, setAgora] = useState(Date.now());

  const destino = (location.state as { de?: string } | null)?.de ?? '/app';
  const restante = bloqueadoAte ? Math.max(0, Math.ceil((bloqueadoAte - agora) / 1000)) : 0;
  const bloqueado = restante > 0;

  useEffect(() => {
    if (!bloqueadoAte) return;
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, [bloqueadoAte]);

  useEffect(() => {
    if (bloqueadoAte && !bloqueado) {
      setBloqueadoAte(null);
      setFalhas(0);
    }
  }, [bloqueado, bloqueadoAte]);

  if (autenticado) return <Navigate to={destino} replace />;

  const bloquear = () => {
    setBloqueadoAte(Date.now() + BLOQUEIO_SEG * 1000);
    setAgora(Date.now());
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (bloqueado) return;
    setErro(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErro('Informe um e-mail válido.');
    if (!senha) return setErro('Informe a senha.');
    setEnviando(true);
    try {
      const u = await entrar(email, senha);
      toast.success(`Bem-vindo, ${u.nome.split(' ')[0]}!`);
      navigate(destino, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        bloquear();
        setErro('Muitas tentativas. Aguarde para tentar novamente.');
      } else {
        const n = falhas + 1;
        setFalhas(n);
        if (n >= MAX_TENTATIVAS) bloquear();
        setErro(err instanceof ApiError ? err.message : 'Não foi possível entrar.');
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthShell
      imagem={IMAGENS.login}
      titulo="O portfólio de inovação inteiro, num só lugar."
      texto="Demandas espontâneas e de campanhas, triagem, maturidade TRL, entregas validadas e decisões de governança."
    >
      <h1 className="text-2xl font-bold tracking-tight">Entrar</h1>
      <p className="mt-1 text-sm text-bb-muted">Use seu e-mail institucional da BBTS.</p>

      {params.get('expirado') && (
        <div className="mt-5 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0" /> Sua sessão expirou. Entre novamente.
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <Campo label="E-mail" htmlFor="email">
          <input
            id="email"
            type="email"
            autoComplete="username"
            className="input h-11"
            placeholder="nome@bbts.com.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={bloqueado}
          />
        </Campo>
        <Campo label="Senha" htmlFor="senha">
          <div className="relative">
            <input
              id="senha"
              type={verSenha ? 'text' : 'password'}
              autoComplete="current-password"
              className="input h-11 pr-11"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={bloqueado}
            />
            <button
              type="button"
              className="absolute right-1 top-1 grid h-9 w-9 place-items-center rounded-md text-bb-muted hover:text-bb-slate"
              onClick={() => setVerSenha((v) => !v)}
              aria-label={verSenha ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {verSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Campo>

        {erro && (
          <p className="fade-in rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700" role="alert">
            {erro}
            {bloqueado && ` (${restante}s)`}
          </p>
        )}

        <button type="submit" className="btn-primary h-11 w-full text-base" disabled={enviando || bloqueado}>
          {enviando ? <Spinner /> : <LogIn className="h-4 w-4" />}
          {bloqueado ? `Bloqueado por ${restante}s` : 'Entrar'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-bb-muted">
        Ainda não tem acesso?{' '}
        <Link to="/cadastro" className="font-semibold text-bb-blue hover:underline">
          Solicitar acesso
        </Link>
      </p>

      {USE_MOCK && (
        <div className="mt-8 rounded-card border border-dashed border-bb-line-2 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-bb-muted">Login simulado · entrar como</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {USUARIOS_SELETOR.map((id) => USUARIOS.find((x) => x.id === id)!).map((u) => (
              <button
                key={u.id}
                type="button"
                className="rounded-lg border border-bb-line px-3 py-2 text-left transition hover:border-bb-blue hover:bg-bb-blue-light"
                onClick={() => {
                  setEmail(u.email);
                  setSenha(SENHA_DEMO);
                  setErro(null);
                }}
              >
                <span className="block text-sm font-bold">{rotuloUsuario(u)}</span>
                <span className="block truncate text-[11px] text-bb-muted">{u.nome}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-bb-muted">
            Dois Demandantes mostram a diferença entre ser o responsável pelo projeto e só ter o mesmo perfil. Ao trocar de usuário, os registros da demonstração continuam.
          </p>
        </div>
      )}
    </AuthShell>
  );
}
