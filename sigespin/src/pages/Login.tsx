import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Logo from '../components/layout/Logo'
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  GitBranch,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  X,
  Sparkles,
  BriefcaseBusiness,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, quickLogin, isLoading } = useAuth()

  const [identifier, setIdentifier] = useState('F7389102')
  const [password, setPassword] = useState('bbts@2026')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  // Onde redirecionar após login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrorMessage('')

    if (!identifier.trim()) {
      setErrorMessage('Por favor, informe sua Chave F ou e-mail institucional.')
      return
    }

    if (!password) {
      setErrorMessage('Por favor, digite sua senha de acesso.')
      return
    }

    const res = await login(identifier, password, rememberMe)
    if (res.success) {
      navigate(from, { replace: true })
    } else {
      setErrorMessage(res.error || 'Credenciais inválidas. Verifique os dados informados.')
    }
  }

  async function handleQuickAccess(profileKey: 'admin' | 'gestor' | 'pmo') {
    setErrorMessage('')
    await quickLogin(profileKey)
    navigate(from, { replace: true })
  }

  function handleForgotSubmit(e: FormEvent) {
    e.preventDefault()
    if (!forgotEmail.trim()) return
    setForgotSent(true)
  }

  return (
    <div className="min-h-screen w-full bg-[#0B1E3D] flex flex-col justify-between text-slate-800">
      {/* Top corporate notice bar */}
      <div className="bg-[#081832] border-b border-blue-950/60 px-4 py-2 text-[11px] text-blue-200/90 flex flex-wrap items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white tracking-wide">BBTS</span>
          <span className="text-blue-300/60">·</span>
          <span>Banco do Brasil Tecnologia e Serviços S.A.</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[10px] text-blue-300/70">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-400" />
            Canal Seguro Corporativo
          </span>
          <span>Ambiente Homologado</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 rounded-2xl overflow-hidden shadow-2xl border border-blue-900/40 bg-white min-h-[620px]">
          
          {/* PAINEL ESQUERDO: Apresentação Institucional SIGES-PIN */}
          <div className="lg:col-span-6 bg-gradient-to-br from-[#09224E] via-[#0E357A] to-[#1553AE] p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Background geometric accents */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-[#FCBB00]/10 blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

            <div className="relative z-10">
              {/* Logo SIGES-PIN */}
              <div className="flex items-center gap-3.5">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2.5 sm:p-3 shadow-inner">
                  <Logo className="h-full w-auto object-contain drop-shadow-md" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black tracking-tight text-white">SIGES-PIN</span>
                    <span className="rounded bg-[#FCBB00] px-1.5 py-0.5 text-[9px] font-bold text-slate-950 uppercase tracking-wider">
                      v1.0
                    </span>
                  </div>
                  <p className="text-xs text-blue-200 font-medium">
                    Gestão do Portfólio de Inovação
                  </p>
                </div>
              </div>

              {/* Pitch principal */}
              <div className="mt-8 space-y-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                  Inovação estratégica, governança ágil e impacto real para a BBTS.
                </h1>
                <p className="text-sm text-blue-100/80 leading-relaxed max-w-lg">
                  Plataforma corporativa única para captação de demandas, deliberações colegiadas, aceleração de POCs/MVPs e gestão do ecossistema de Open Innovation.
                </p>
              </div>

              {/* Destaques da plataforma */}
              <div className="mt-8 space-y-3.5">
                <div className="flex items-start gap-3.5 rounded-xl bg-white/5 border border-white/10 p-3.5 backdrop-blur-xs transition hover:bg-white/10">
                  <div className="rounded-lg bg-blue-400/20 p-2 text-[#FCBB00] shrink-0 mt-0.5">
                    <Sparkles size={17} />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white">Intake Inteligente com IA</h2>
                    <p className="text-[11px] text-blue-100/75 mt-0.5 leading-snug">
                      Triagem automatizada, classificação por arenas de negócio e análise preditiva de aderência estratégica.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 rounded-xl bg-white/5 border border-white/10 p-3.5 backdrop-blur-xs transition hover:bg-white/10">
                  <div className="rounded-lg bg-blue-400/20 p-2 text-blue-200 shrink-0 mt-0.5">
                    <GitBranch size={17} />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white">Funil de Inovação & Régua TRL</h2>
                    <p className="text-[11px] text-blue-100/75 mt-0.5 leading-snug">
                      Controle estrito de estágios da ideação à conclusão com validação de maturidade tecnológica contínua.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 rounded-xl bg-white/5 border border-white/10 p-3.5 backdrop-blur-xs transition hover:bg-white/10">
                  <div className="rounded-lg bg-blue-400/20 p-2 text-emerald-300 shrink-0 mt-0.5">
                    <BriefcaseBusiness size={17} />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white">Open Innovation & Startups</h2>
                    <p className="text-[11px] text-blue-100/75 mt-0.5 leading-snug">
                      Homologação de parceiros externos e orquestração de provas de conceito de alto valor agregado.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Teaser métricas do portfólio */}
            <div className="mt-8 pt-6 border-t border-blue-400/20 relative z-10 flex items-center justify-between text-xs">
              <div>
                <span className="block text-lg font-black text-white">42</span>
                <span className="text-[10px] text-blue-200 uppercase tracking-wider">Iniciativas Ativas</span>
              </div>
              <div className="h-7 w-px bg-blue-400/20" />
              <div>
                <span className="block text-lg font-black text-[#FCBB00]">TRL 5.4</span>
                <span className="text-[10px] text-blue-200 uppercase tracking-wider">Maturidade Média</span>
              </div>
              <div className="h-7 w-px bg-blue-400/20" />
              <div>
                <span className="block text-lg font-black text-white">18</span>
                <span className="text-[10px] text-blue-200 uppercase tracking-wider">Startups Parceiras</span>
              </div>
            </div>
          </div>

          {/* PAINEL DIREITO: Formulário de Autenticação */}
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between bg-white">
            <div>
              {/* Header do Formulário */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    Acesso ao Sistema
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Insira suas credenciais da rede corporativa BBTS
                  </p>
                </div>
                <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#123A85]">
                  <Lock size={18} />
                </div>
              </div>

              {/* Mensagem de Erro */}
              {errorMessage && (
                <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 animate-in fade-in duration-200">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                  <p className="leading-snug">{errorMessage}</p>
                </div>
              )}

              {/* Formulário */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {/* Campo Chave F ou E-mail */}
                <div>
                  <label htmlFor="identifier" className="block text-xs font-semibold text-slate-700">
                    Chave Corporativa ou E-mail
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <User size={16} />
                    </div>
                    <input
                      id="identifier"
                      type="text"
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Ex: F7389102 ou usuario@bbts.com.br"
                      required
                      className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 transition focus:border-[#1553AE] focus:outline-none focus:ring-2 focus:ring-[#1553AE]/20"
                    />
                  </div>
                  <span className="mt-1 block text-[10px] text-slate-400">
                    Utilize sua Chave F funcional ou endereço de e-mail BBTS.
                  </span>
                </div>

                {/* Campo Senha */}
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                      Senha Corporativa
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(true)}
                      className="text-[11px] font-medium text-[#1553AE] hover:text-[#123A85] hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite sua senha de rede"
                      required
                      className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-10 text-sm text-slate-800 placeholder-slate-400 transition focus:border-[#1553AE] focus:outline-none focus:ring-2 focus:ring-[#1553AE]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                      title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Lembrar-me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-[#1553AE] focus:ring-[#1553AE]/30"
                    />
                    <span className="text-xs text-slate-600">Lembrar meu acesso neste dispositivo</span>
                  </label>
                </div>

                {/* Botão Entrar */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#1553AE] hover:bg-[#123A85] text-white py-3 px-4 text-sm font-semibold shadow-md shadow-blue-900/10 transition active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Autenticando...</span>
                    </>
                  ) : (
                    <>
                      <span>Entrar no SIGES-PIN</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* SEÇÃO DE ACESSO RÁPIDO / HOMOLOGAÇÃO */}
              <div className="mt-7 pt-5 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Acesso Rápido de Homologação
                  </span>
                  <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-800">
                    1-Clique
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Clique em um dos perfis pré-configurados para testar o sistema imediatamente:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickAccess('admin')}
                    disabled={isLoading}
                    className="flex flex-col items-start p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-300 transition text-left group"
                  >
                    <span className="text-[11px] font-bold text-slate-800 group-hover:text-blue-900">
                      Administrador
                    </span>
                    <span className="text-[10px] text-slate-500 truncate w-full">Abraão Freitas</span>
                    <span className="mt-1 text-[9px] font-medium text-blue-700 bg-blue-100/80 px-1 rounded">
                      Chave F7389102
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickAccess('gestor')}
                    disabled={isLoading}
                    className="flex flex-col items-start p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-300 transition text-left group"
                  >
                    <span className="text-[11px] font-bold text-slate-800 group-hover:text-blue-900">
                      Gestão Inovação
                    </span>
                    <span className="text-[10px] text-slate-500 truncate w-full">Carolina V.</span>
                    <span className="mt-1 text-[9px] font-medium text-purple-700 bg-purple-100/80 px-1 rounded">
                      Chave F6241908
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickAccess('pmo')}
                    disabled={isLoading}
                    className="flex flex-col items-start p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-300 transition text-left group"
                  >
                    <span className="text-[11px] font-bold text-slate-800 group-hover:text-blue-900">
                      Avaliador / PMO
                    </span>
                    <span className="text-[10px] text-slate-500 truncate w-full">Rodrigo M.</span>
                    <span className="mt-1 text-[9px] font-medium text-emerald-700 bg-emerald-100/80 px-1 rounded">
                      Chave F4910283
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Rodapé de Segurança e LGPD */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#1553AE]" />
                <span>Criptografia TLS 1.3 · LGPD</span>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition"
              >
                <HelpCircle size={13} />
                <span>Central de Ajuda BBTS</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Corporate copyright footer */}
      <footer className="text-center py-3 text-[11px] text-blue-300/60 bg-[#081832] border-t border-blue-950/60">
        © 2026 BBTS · Banco do Brasil Tecnologia e Serviços S.A. Todos os direitos reservados.
      </footer>

      {/* MODAL: Esqueci minha senha / Suporte Corporativo */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900">
                <div className="rounded-lg bg-blue-100 p-2 text-blue-800">
                  <Lock size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Recuperação de Acesso</h3>
                  <p className="text-[11px] text-slate-500">Credenciais Corporativas BBTS</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsForgotModalOpen(false)
                  setForgotSent(false)
                }}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4">
              {forgotSent ? (
                <div className="text-center py-4 space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 size={26} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Instruções Encaminhadas!</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Caso a Chave F ou e-mail <strong>{forgotEmail}</strong> conste na base corporativa, um link temporário para redefinição de senha foi emitido para seu e-mail institucional.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotModalOpen(false)
                      setForgotSent(false)
                    }}
                    className="mt-3 w-full rounded-lg bg-[#1553AE] py-2 text-xs font-semibold text-white hover:bg-[#123A85] transition"
                  >
                    Retornar ao Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    O acesso ao <strong>SIGES-PIN</strong> é sincronizado com a conta corporativa da BBTS. Digite sua Chave F ou e-mail institucional para receber as instruções de recuperação:
                  </p>

                  <div>
                    <label htmlFor="forgot-email" className="block text-xs font-semibold text-slate-700">
                      Chave F ou E-mail Cadastrado
                    </label>
                    <input
                      id="forgot-email"
                      type="text"
                      required
                      placeholder="Ex: F1234567 ou nome@bbts.com.br"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#1553AE] focus:outline-none focus:ring-2 focus:ring-[#1553AE]/20"
                    />
                  </div>

                  <div className="rounded-lg bg-blue-50 p-3 text-[11px] text-blue-800 leading-relaxed">
                    <strong>Importante:</strong> Se sua conta corporativa estiver bloqueada no SISBB ou no Active Directory, contate a <strong>Central de Serviços de TI BBTS</strong> pelo ramal corporativo ou portal de atendimento interno.
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(false)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-[#1553AE] px-4 py-2 text-xs font-semibold text-white hover:bg-[#123A85] transition"
                    >
                      Enviar Instruções
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
