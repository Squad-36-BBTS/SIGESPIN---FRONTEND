import { Check, LogOut, Minus, RotateCcw, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Avatar, PageHeader, SeloDiscussao } from '@/components/common/ui';
import { useAuth } from '@/hooks';
import { USE_MOCK } from '@/services/api';
import { resetarMock } from '@/services/mock/mockServer';
import type { PerfilUsuario } from '@/types/domain';
import { PERFIL_DESCRICAO, PERFIL_LABEL, rotuloUsuario } from '@/utils/constants';
import { ACAO_LABEL, ACOES_MATRIZ, valorMatriz } from '@/utils/permissoes';

const PERFIS: PerfilUsuario[] = ['DEMANDANTE', 'ANALISTA', 'ESPECIALISTA'];

export default function PerfilPage() {
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();
  if (!usuario) return null;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Conta" titulo="Meu perfil" />
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <section className="card h-fit p-6 text-center">
          <div className="flex justify-center">
            <Avatar nome={usuario.nome} tamanho="lg" />
          </div>
          <h2 className="mt-3 text-lg font-bold">{usuario.nome}</h2>
          <p className="text-sm text-bb-muted">{usuario.email}</p>
          <span className="badge mt-3 border-blue-200 bg-bb-blue-light text-bb-blue">{rotuloUsuario(usuario)}</span>
          <p className="mt-3 text-sm text-slate-600">{PERFIL_DESCRICAO[usuario.perfil]}</p>
          <button
            className="btn-secondary mt-6 w-full"
            onClick={async () => {
              await sair();
              navigate('/login');
            }}
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </section>

        <section className="card overflow-hidden">
          <div className="p-6 pb-3">
            <h2 className="font-bold">Papéis e ações</h2>
            <p className="text-xs text-bb-muted">Todos os perfis consultam todo o portfólio. “A definir” ainda será validado com o cliente e aparece desabilitado nas telas.</p>
          </div>
          <div className="scroll-fino overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-bb-muted">
                <tr>
                  <th className="px-6 py-3">Ação</th>
                  {PERFIS.map((p) => (
                    <th key={p} className={`px-3 py-3 text-center ${p === usuario.perfil ? 'bg-bb-blue-light text-bb-blue' : ''}`}>
                      {PERFIL_LABEL[p]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-bb-line">
                <tr>
                  <td className="px-6 py-2.5">Consultar projetos do portfólio</td>
                  {PERFIS.map((p) => (
                    <td key={p} className={`px-3 py-2.5 text-center ${p === usuario.perfil ? 'bg-bb-blue-light/50' : ''}`}>
                      <Check className="mx-auto h-4 w-4 text-emerald-600" aria-label="Sim" />
                    </td>
                  ))}
                </tr>
                {ACOES_MATRIZ.map((a) => (
                  <tr key={a}>
                    <td className="px-6 py-2.5">{ACAO_LABEL[a]}</td>
                    {PERFIS.map((p) => {
                      const v = valorMatriz(a, p);
                      return (
                        <td key={p} className={`px-3 py-2.5 text-center ${p === usuario.perfil ? 'bg-bb-blue-light/50' : ''}`}>
                          {v === 'SIM' ? (
                            <Check className="mx-auto h-4 w-4 text-emerald-600" aria-label="Sim" />
                          ) : v === 'NAO' ? (
                            <X className="mx-auto h-4 w-4 text-slate-300" aria-label="Não" />
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700" aria-label="A definir">
                              <Minus className="h-3 w-3" /> A definir
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-bb-line p-4 text-xs text-bb-muted">
            <SeloDiscussao /> Dados financeiros: a política de exibição ainda não foi definida, então o protótipo não exibe o dispêndio estimado.
          </div>
        </section>
      </div>

      {USE_MOCK && (
        <section className="card mt-4 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold">Modo demonstração</h2>
            <p className="text-sm text-bb-muted">Login, dados, arquivos e IA são simulados e ficam no navegador. Restaure o estado inicial para recomeçar os testes.</p>
          </div>
          <button
            className="btn-secondary"
            onClick={() => {
              resetarMock();
              toast.success('Dados de demonstração restaurados.');
            }}
          >
            <RotateCcw className="h-4 w-4" /> Restaurar dados
          </button>
        </section>
      )}
    </div>
  );
}
