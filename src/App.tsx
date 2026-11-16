import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { Spinner } from '@/components/common/ui';
import { ROTAS_APP, ROTAS_PUBLICAS, temRota } from '@/fluxos/registro';
import { useAuth } from '@/hooks';
import NaoEncontradoPage from '@/pages/public/NaoEncontradoPage';

// A área autenticada (e o Chart.js) só é baixada depois do login: a landing fica leve
const AppLayout = lazy(() => import('@/components/layout/AppLayout').then((m) => ({ default: m.AppLayout })));
const MinhaFilaPage = lazy(() => import('@/pages/app/MinhaFilaPage'));
const PortfolioPage = lazy(() => import('@/pages/app/PortfolioPage'));
const ProjetoDetalhesPage = lazy(() => import('@/pages/app/ProjetoDetalhesPage'));
const EntrarSimuladoPage = lazy(() => import('@/pages/public/EntrarSimuladoPage'));

const Carregando = () => (
  <div className="grid min-h-[50vh] place-items-center text-bb-blue">
    <Spinner className="h-6 w-6" />
  </div>
);

// Todas as telas são de leitura global para usuários autenticados; as ações são controladas
// por perfil dentro de cada tela (utils/permissoes.ts), com explicação quando indisponíveis.
function Privada({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const location = useLocation();
  if (!usuario) return <Navigate to="/login" replace state={{ de: location.pathname + location.search }} />;
  return <>{children}</>;
}

// A base (Minha fila, Portfólio e Detalhe do projeto) existe sempre; as demais telas vêm dos
// fluxos instalados em src/fluxos. Sem o fluxo de acesso, um login simples substitui a landing.
export default function App() {
  return (
    <Suspense fallback={<Carregando />}>
      <Routes>
        {ROTAS_PUBLICAS.map(({ caminho, Pagina }) => (
          <Route key={caminho} path={caminho} element={<Pagina />} />
        ))}
        {!temRota('/login') && <Route path="/login" element={<EntrarSimuladoPage />} />}
        {!temRota('/') && <Route path="/" element={<Navigate to="/login" replace />} />}

        <Route
          path="/app"
          element={
            <Privada>
              <AppLayout />
            </Privada>
          }
        >
          {!temRota('/app') && <Route index element={<Navigate to="/app/fila" replace />} />}
          <Route path="fila" element={<MinhaFilaPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="projetos/:id" element={<ProjetoDetalhesPage />} />
          {ROTAS_APP.map(({ caminho, Pagina }) =>
            caminho ? <Route key={caminho} path={caminho} element={<Pagina />} /> : <Route key="inicio" index element={<Pagina />} />,
          )}
          {/* Rotas de versões anteriores */}
          {['triagem', 'pareceres', 'governanca', 'comite', 'solicitacoes', 'minhas-demandas'].map((r) => (
            <Route key={r} path={r} element={<Navigate to="/app/fila" replace />} />
          ))}
          {temRota('/app/mobilizacao') && <Route path="campanhas" element={<Navigate to="/app/mobilizacao" replace />} />}
        </Route>

        {!temRota('/cadastro') && <Route path="/cadastro" element={<Navigate to="/login" replace />} />}
        <Route path="*" element={<NaoEncontradoPage />} />
      </Routes>
    </Suspense>
  );
}
