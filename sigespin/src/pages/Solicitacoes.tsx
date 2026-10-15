
import { useState } from 'react'
import {
  CheckCircle2,
  Clock3,
  FileText,
  Search,
  XCircle,
} from 'lucide-react'

type StatusSolicitacao =
  | 'Pendente'
  | 'Aprovada'
  | 'Rejeitada'
  | 'Cancelada'

type Solicitacao = {
  id: number
  projeto: string
  solicitante: string
  etapaAtual: string
  etapaSolicitada: string
  data: string
  status: StatusSolicitacao
}

const solicitacoesIniciais: Solicitacao[] = [
  {
    id: 1,
    projeto: 'Plataforma de Inteligência Corporativa',
    solicitante: 'Ana Oliveira',
    etapaAtual: 'IDEAÇÃO',
    etapaSolicitada: 'POC',
    data: '14/10/2026',
    status: 'Pendente',
  },
  {
    id: 2,
    projeto: 'Automação de Processos Internos',
    solicitante: 'Carlos Mendes',
    etapaAtual: 'POC',
    etapaSolicitada: 'MVP',
    data: '12/10/2026',
    status: 'Aprovada',
  },
  {
    id: 3,
    projeto: 'Sistema de Análise de Dados',
    solicitante: 'Mariana Costa',
    etapaAtual: 'IDEAÇÃO',
    etapaSolicitada: 'POC',
    data: '10/10/2026',
    status: 'Rejeitada',
  },
  {
    id: 4,
    projeto: 'Monitoramento de Indicadores',
    solicitante: 'Pedro Santos',
    etapaAtual: 'MVP',
    etapaSolicitada: 'CONCLUÍDO',
    data: '09/10/2026',
    status: 'Cancelada',
  },
]

const estilosStatus: Record<StatusSolicitacao, string> = {
  Pendente: 'bg-amber-50 text-amber-700',
  Aprovada: 'bg-emerald-50 text-emerald-700',
  Rejeitada: 'bg-red-50 text-red-700',
  Cancelada: 'bg-slate-100 text-slate-600',
}

export default function Solicitacoes() {
  const [solicitacoes, setSolicitacoes] =
    useState(solicitacoesIniciais)
  const [filtro, setFiltro] = useState('Todas')
  const [busca, setBusca] = useState('')
  const [mensagem, setMensagem] = useState('')

  const listaFiltrada = solicitacoes.filter((solicitacao) => {
    const correspondeStatus =
      filtro === 'Todas' || solicitacao.status === filtro

    const termo = busca.toLowerCase()

    const correspondeBusca =
      solicitacao.projeto.toLowerCase().includes(termo) ||
      solicitacao.solicitante.toLowerCase().includes(termo)

    return correspondeStatus && correspondeBusca
  })

  const quantidade = (status: StatusSolicitacao) =>
    solicitacoes.filter((item) => item.status === status).length

  function deliberar(
    id: number,
    decisao: 'Aprovada' | 'Rejeitada',
  ) {
    setSolicitacoes((atuais) =>
      atuais.map((item) =>
        item.id === id && item.status === 'Pendente'
          ? { ...item, status: decisao }
          : item,
      ),
    )

    setMensagem(
      `Solicitação ${id}: decisão demonstrativa registrada como ${decisao.toLowerCase()}.`,
    )
  }

  return (
    <section className="min-h-full bg-[#F8FAFC] px-4 py-6 text-slate-800 sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
              Governança do portfólio
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Solicitações e Deliberações
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Acompanhe pedidos de avanço de estágio e consulte as
              decisões registradas no processo de inovação.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <FileText size={18} />
            <span>Fluxo de aprovação do Comitê</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              titulo: 'Total de solicitações',
              valor: solicitacoes.length,
              icone: FileText,
              cor: 'bg-blue-50 text-blue-700',
            },
            {
              titulo: 'Pendentes',
              valor: quantidade('Pendente'),
              icone: Clock3,
              cor: 'bg-amber-50 text-amber-700',
            },
            {
              titulo: 'Aprovadas',
              valor: quantidade('Aprovada'),
              icone: CheckCircle2,
              cor: 'bg-emerald-50 text-emerald-700',
            },
            {
              titulo: 'Rejeitadas',
              valor: quantidade('Rejeitada'),
              icone: XCircle,
              cor: 'bg-red-50 text-red-700',
            },
          ].map((indicador) => {
            const Icone = indicador.icone

            return (
              <article
                key={indicador.titulo}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-500">
                    {indicador.titulo}
                  </p>

                  <div className={`rounded-lg p-2 ${indicador.cor}`}>
                    <Icone size={20} />
                  </div>
                </div>

                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {indicador.valor}
                </p>
              </article>
            )
          })}
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <h2 className="text-base font-bold text-slate-900">
              Pedidos de avanço
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Consulte o estágio atual, o estágio solicitado e a situação
              de cada pedido.
            </p>

            <div className="mt-5 flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                  placeholder="Buscar por projeto ou solicitante..."
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <select
                value={filtro}
                onChange={(event) => setFiltro(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                aria-label="Filtrar solicitações por status"
              >
                <option value="Todas">Todos os status</option>
                <option value="Pendente">Pendente</option>
                <option value="Aprovada">Aprovada</option>
                <option value="Rejeitada">Rejeitada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          {mensagem && (
            <div
              role="status"
              className="border-b border-blue-100 bg-blue-50 px-5 py-3 text-sm text-blue-800"
            >
              {mensagem}
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {listaFiltrada.map((solicitacao) => (
              <article
                key={solicitacao.id}
                className="p-5 transition hover:bg-slate-50/70 sm:p-6"
              >
                <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400">
                        SOL-{String(solicitacao.id).padStart(3, '0')}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${estilosStatus[solicitacao.status]}`}
                      >
                        {solicitacao.status}
                      </span>
                    </div>

                    <h3 className="mt-2 text-sm font-bold text-slate-900 sm:text-base">
                      {solicitacao.projeto}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Solicitante: {solicitacao.solicitante}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      Enviada em {solicitacao.data}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Estágio atual
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {solicitacao.etapaAtual}
                      </p>
                    </div>

                    <span className="text-slate-400" aria-hidden="true">
                      →
                    </span>

                    <div className="rounded-lg bg-blue-50 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-500">
                        Estágio solicitado
                      </p>
                      <p className="mt-1 text-sm font-semibold text-blue-800">
                        {solicitacao.etapaSolicitada}
                      </p>
                    </div>

                    {solicitacao.status === 'Pendente' && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            deliberar(solicitacao.id, 'Aprovada')
                          }
                          className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                        >
                          Aprovar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deliberar(solicitacao.id, 'Rejeitada')
                          }
                          className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                        >
                          Rejeitar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}

            {listaFiltrada.length === 0 && (
              <div className="px-5 py-12 text-center">
                <Search
                  size={28}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm font-semibold text-slate-700">
                  Nenhuma solicitação encontrada
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Tente alterar a busca ou o filtro selecionado.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-500">
            Exibindo {listaFiltrada.length} de {solicitacoes.length}{' '}
            solicitações.
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
            Ambiente demonstrativo
          </p>

          <p className="mt-1 text-sm leading-6 text-amber-800">
            Os registros são fictícios e as decisões ficam somente na
            memória da tela. Antes de integrar ao sistema real, será
            necessário validar o perfil do usuário, exigir justificativas
            nas deliberações e persistir as decisões no back-end.
          </p>
        </div>
      </div>
    </section>
  )
}
