import { useCallback, useContext, useEffect, useRef, useState, type DependencyList } from 'react';

import { AuthContext } from '@/contexts/AuthContext';
import { mensagemErro } from '@/services/api';

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}

export function useDebounce<T>(valor: T, delay = 300): T {
  const [v, setV] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setV(valor), delay);
    return () => clearTimeout(t);
  }, [valor, delay]);
  return v;
}

// Carrega dados assíncronos com estados de carregamento e erro, e expõe recarregar()
export function useAsync<T>(fn: () => Promise<T>, deps: DependencyList) {
  const [dados, setDados] = useState<T | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const chamada = useRef(0);

  const executar = useCallback(async () => {
    const id = ++chamada.current;
    setCarregando(true);
    setErro(null);
    try {
      const r = await fn();
      if (id === chamada.current) setDados(r);
    } catch (e) {
      if (id === chamada.current) setErro(mensagemErro(e));
    } finally {
      if (id === chamada.current) setCarregando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    executar();
  }, [executar]);

  return { dados, carregando, erro, recarregar: executar };
}

// Revela elementos marcados com [data-reveal] ao entrarem na tela (só CSS + IntersectionObserver).
// Inspirado no useReveal do Vise-landing, sem GSAP para manter o site leve.
export function useReveal<T extends HTMLElement>(deps: DependencyList = []) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const alvos = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal], [data-lines], [data-rule]'));
    if (!('IntersectionObserver' in window)) {
      alvos.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        // Agrupa os elementos que entram juntos e aplica um pequeno atraso em sequência
        let ordem = 0;
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          el.style.setProperty('--d', `${ordem++ * 70}ms`);
          el.classList.add('is-in');
          io.unobserve(el);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    alvos.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}
