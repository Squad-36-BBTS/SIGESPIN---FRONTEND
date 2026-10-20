import { useState, useEffect } from 'react'
import {
  Bell,
  LockKeyhole,
  Save,
  Settings,
  SlidersHorizontal,
  UserRound,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Configuracoes() {
  const { user } = useAuth()
  const [nome, setNome] = useState(user?.name || 'Abraão Freitas')
  const [email, setEmail] = useState(user?.email || 'abraao.freitas@bbts.com.br')
  const [notificarSolicitacoes, setNotificarSolicitacoes] = useState(true)
  const [notificarDeliberacoes, setNotificarDeliberacoes] = useState(true)
  const [notificarEstagios, setNotificarEstagios] = useState(false)
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    if (user) {
      setNome(user.name)
      setEmail(user.email)
    }
  }, [user])

  function salvarPreferencias() {
    setMensagem(
      'Preferências atualizadas nesta sessão. A persistência no servidor ainda não foi implementada.',
    )
  }

  return (
    <section className="min-h-full bg-[#F8FAFC] px-4 py-6 text-slate-800 sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
            <Settings size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Configurações
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Gerencie suas informações e preferências do SIGES-PIN.
            </p>
          </div>
        </div>

        <form
          className="mt-7 space-y-6"
          onSubmit={(event) => {
            event.preventDefault()
            salvarPreferencias()
          }}
        >
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <UserRound className="text-blue-700" size={21} />
              <div>
                <h2 className="font-bold text-slate-900">Perfil e conta</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Informações básicas do usuário autenticado.
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Nome completo
                </span>
                <input
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  placeholder="Digite seu nome"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  E-mail institucional
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="usuario@bbts.com.br"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <div className="sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">
                  Perfil de acesso e Chave Corporativa
                </span>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700 border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-blue-700" />
                    <span>
                      Perfil atual:{' '}
                      <strong className="text-slate-900">
                        {user?.role || 'Administrador do Sistema'}
                      </strong>
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono bg-white px-2 py-1 rounded border border-slate-200">
                    Chave F: {user?.matricula || 'F7389102'}
                  </span>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <Bell className="text-blue-700" size={21} />
              <div>
                <h2 className="font-bold text-slate-900">Notificações</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Escolha quais avisos deseja receber.
                </p>
              </div>
            </div>

            <div className="mt-2 divide-y divide-slate-100">
              {[
                {
                  titulo: 'Novas solicitações',
                  descricao: 'Avisos sobre pedidos de avanço de estágio.',
                  valor: notificarSolicitacoes,
                  alterar: setNotificarSolicitacoes,
                },
                {
                  titulo: 'Deliberações do Comitê',
                  descricao: 'Avisos sobre decisões de aprovação ou rejeição.',
                  valor: notificarDeliberacoes,
                  alterar: setNotificarDeliberacoes,
                },
                {
                  titulo: 'Mudanças de estágio',
                  descricao: 'Avisos sobre transições registradas nos projetos.',
                  valor: notificarEstagios,
                  alterar: setNotificarEstagios,
                },
              ].map((item) => (
                <label
                  key={item.titulo}
                  className="flex cursor-pointer items-center justify-between gap-4 py-4"
                >
                  <span>
                    <span className="block text-sm font-medium text-slate-800">
                      {item.titulo}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      {item.descricao}
                    </span>
                  </span>

                  <input
                    type="checkbox"
                    checked={item.valor}
                    onChange={(event) => item.alterar(event.target.checked)}
                    className="h-4 w-4 shrink-0 accent-blue-700"
                  />
                </label>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <LockKeyhole className="text-blue-700" size={21} />
              <div>
                <h2 className="font-bold text-slate-900">Segurança</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Proteção e acesso à sua conta.
                </p>
              </div>
            </div>

            <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              A alteração de senha é integrada ao Active Directory e SISBB corporativo da BBTS. Para redefinir sua credencial, utilize o autoatendimento corporativo.
            </p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <SlidersHorizontal className="text-blue-700" size={21} />
              <div>
                <h2 className="font-bold text-slate-900">
                  Preferências do sistema
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Opções gerais da interface.
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              O SIGES-PIN utiliza o mesmo padrão visual em todas as telas.
              Preferências adicionais poderão ser incluídas conforme a
              integração com o back-end.
            </p>
          </article>

          {mensagem && (
            <p role="status" className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
              {mensagem}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              <Save size={17} />
              Salvar preferências
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
