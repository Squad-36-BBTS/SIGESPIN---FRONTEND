import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { Spinner } from '@/components/common/ui';
import { useAuth } from '@/hooks';
import CadastroPage from '@/pages/public/CadastroPage';
import LandingPage from '@/pages/public/LandingPage';
import LoginPage from '@/pages/public/LoginPage';
import NaoEncontradoPage from '@/pages/public/NaoEncontradoPage';
import type { Usuario } from '@/types/domain';

// A área autenticada (e o Chart.js) só é baixada depois do login: a landing fica leve
const AppLayout = lazy(() => import('@/components/layout/AppLayout').then((m) => ({ default: m.AppLayout })));
const DashboardPage = lazy(() => import('@/pages/app/DashboardPage'));
const PortfolioPage = lazy(() => import('@/pages/app/PortfolioPage'));
const CampanhasPage = lazy(() => import('@/pages/app/CampanhasPage'));
const IntakePage = lazy(() => import('@/pages/app/IntakePage'));
const MinhasDemandasPage = lazy(() => import('@/pages/app/MinhasDemandasPage'));
const ProjetoDetalhesPage = lazy(() => import('@/pages/app/ProjetoDetalhesPage'));
const TriagemPage = lazy(() => import('@/pages/app/TriagemPage'));
const PareceresPage = lazy(() => import('@/pages/app/PareceresPage'));
const GovernancaPage = lazy(() => import('@/pages/app/GovernancaPage'));
const PerfilPage = lazy(() => import('@/pages/app/PerfilPage'));

const Carregando = () => (
  <div className="grid min-h-[50vh] place-items-center text-bb-blue">
    <Spinner className="h-6 w-6" />
  </div>
);

function Privada({ children, permitir }: { children: ReactNode; permitir?: (u: Usuario) => boolean }) {
  const { usuario } = useAuth();
  const location = useLocation();
  if (!usuario) return <Navigate to="/login" replace state={{ de: location.pathname + location.search }} />;
  // O controle visual reflete a permissão; a autorização final é do back-end
  if (permitir && !permitir(usuario)) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

const demandante = (u: Usuario) => u.perfil === 'DEMANDANTE';

export default function App() {
  return (
    <Suspense fallback={<Carregando />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />

        <Route
          path="/app"
          element={
            <Privada>
              <AppLayout />
            </Privada>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="campanhas" element={<CampanhasPage />} />
          <Route path="demandas/nova" element={<Privada permitir={demandante}><IntakePage /></Privada>} />
          <Route path="minhas-demandas" element={<Privada permitir={demandante}><MinhasDemandasPage /></Privada>} />
          <Route path="projetos/:id" element={<ProjetoDetalhesPage />} />
          <Route path="triagem" element={<Privada permitir={(u) => u.perfil === 'ANALISTA'}><TriagemPage /></Privada>} />
          <Route path="pareceres" element={<Privada permitir={(u) => u.perfil === 'ESPECIALISTA'}><PareceresPage /></Privada>} />
          <Route path="governanca" element={<Privada permitir={(u) => u.alcadaGovernanca}><GovernancaPage /></Privada>} />
          <Route path="perfil" element={<PerfilPage />} />
          {/* Rotas da versão anterior */}
          <Route path="projetos/novo" element={<Navigate to="/app/demandas/nova" replace />} />
          <Route path="comite" element={<Navigate to="/app/governanca" replace />} />
          <Route path="solicitacoes" element={<Navigate to="/app/triagem" replace />} />
        </Route>

        <Route path="*" element={<NaoEncontradoPage />} />
      </Routes>
    </Suspense>
  );
}
