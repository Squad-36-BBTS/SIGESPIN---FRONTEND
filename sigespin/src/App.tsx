import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PortfolioKanban from './pages/PortfolioKanban'
import PortfolioLista from './pages/PortfolioLista'
import Intake from './pages/Intake'
import Configuracoes from './pages/Configuracoes'
import Solicitacoes from './pages/Solicitacoes'
import ProjetoDetalhes from './pages/ProjetoDetalhes'
import './App.css'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota pública de Autenticação */}
          <Route path="/login" element={<Login />} />

          {/* Rotas protegidas dentro do layout corporativo (Header + Sidebar) */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/kanban" element={<PortfolioKanban />} />
            <Route path="/projetos" element={<PortfolioLista />} />
            <Route path="/demandas/nova" element={<Intake />} />
            <Route path="/solicitacoes" element={<Solicitacoes />} />
            <Route path="/projetos/:id" element={<ProjetoDetalhes />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Route>

          {/* Fallback de rotas desconhecidas */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
