import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';

import { authService } from '@/services';
import { TOKEN_KEY, USUARIO_KEY } from '@/services/api';
import type { PerfilUsuario, Usuario } from '@/types/domain';

interface AuthContextValue {
  usuario: Usuario | null;
  autenticado: boolean;
  entrar: (email: string, senha: string) => Promise<Usuario>;
  sair: () => Promise<void>;
  temPerfil: (...perfis: PerfilUsuario[]) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function lerUsuario(): Usuario | null {
  try {
    if (!localStorage.getItem(TOKEN_KEY)) return null;
    const raw = localStorage.getItem(USUARIO_KEY);
    return raw ? (JSON.parse(raw) as Usuario) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(lerUsuario);

  const entrar = useCallback(async (email: string, senha: string) => {
    const { token, usuario: u } = await authService.login(email, senha);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(u));
    setUsuario(u);
    return u;
  }, []);

  const sair = useCallback(async () => {
    await authService.logout();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    setUsuario(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      autenticado: !!usuario,
      entrar,
      sair,
      temPerfil: (...perfis: PerfilUsuario[]) => !!usuario && perfis.includes(usuario.perfil),
    }),
    [usuario, entrar, sair],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
