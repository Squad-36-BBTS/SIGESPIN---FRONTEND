
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import PortfolioKanban from './pages/PortfolioKanban'
import PortfolioLista from './pages/PortfolioLista'
import Intake from './pages/Intake'
import Configuracoes from './pages/Configuracoes'
import Solicitacoes from './pages/Solicitacoes'
import ProjetoDetalhes from './pages/ProjetoDetalhes'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F8FAFC]">
        <Header />

        <div className="flex min-h-[calc(100vh-76px)] flex-col md:flex-row">
          <Sidebar />

          <main className="min-w-0 flex-1">
            <Routes>
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/kanban" element={<PortfolioKanban />} />
              <Route path="/projetos" element={<PortfolioLista />} />
              <Route path="/demandas/nova" element={<Intake />} />
              <Route path="/solicitacoes" element={<Solicitacoes />} />
              <Route path="/projetos/:id" element={<ProjetoDetalhes />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}
