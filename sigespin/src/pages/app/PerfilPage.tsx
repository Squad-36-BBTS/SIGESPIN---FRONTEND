import { Check, LogOut, RotateCcw, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Avatar, PageHeader } from '@/components/common/ui';
import { useAuth } from '@/hooks';
import { USE_MOCK } from '@/services/api';
import { resetarMock } from '@/services/mock/mockServer';
import { PERFIL_DESCRICAO, rotuloUsuario } from '@/utils/constants';

import type { Usuario } from '@/types/domain';

// Matriz de ações (revisão 2), mostrada para o próprio usuário
const ACOES: { acao: string; pode: (u: Usuario) => boolean }[] = [
  { acao: 'Consultar todo o portfólio, o Kanban e o dashboard', pode: () => true },
  { acao: 'Registrar demandas espontâneas ou de campanhas', pode: (u) => u.perfil === 'DEMANDANTE' },
  { acao: 'Complementar a demanda e validar entregas e MVP', pode: (u) => u.perfil === 'DEMANDANTE' },
  { acao: 'Abrir e encerrar campanhas, desafios e hackathons', pode: (u) => u.perfil === 'ANALISTA' },
  { acao: 'Fazer a triagem e a qualificação das demandas', pode: (u) => u.perfil === 'ANALISTA' },
  { acao: 'Atualizar TRL e radar com base em evidências', pode: (u) => u.perfil === 'ANALISTA' },
  { acao: 'Registrar marcos e entregas da jornada', pode: (u) => u.perfil === 'ANALISTA' },
  { acao: 'Emitir pareceres técnicos', pode: (u) => u.perfil === 'ESPECIALISTA' },
  { acao: 'Ver o dispêndio estimado', pode: (u) => u.perfil === 'ANALISTA' || u.alcadaGovernanca },
  { acao: 'Priorizar, aprovar, pivotar ou descontinuar (alçada de governança)', pode: (u) => u.alcadaGovernanca },
];

export default function PerfilPage() {
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();
  if (!usuario) return null;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader eyebrow="Conta" titulo="Meu perfil" />
      <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
        <section className="card p-6 text-center">
          <div className="flex justify-center">
            <Avatar nome={usuario.nome} tamanho="lg" />
          </div>
          <h2 className="mt-3 text-lg font-bold">{usuario.nome}</h2>
          <p className="text-sm text-bb-muted">{usuario.email}</p>
          <span className="badge mt-3 border-blue-200 bg-bb-blue-light text-bb-blue">{rotuloUsuario(usuario)}</span>
          {usuario.areaTecnica && <p className="mt-2 text-xs font-semibold text-bb-blue">{usuario.areaTecnica}</p>}
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

        <section className="card p-6">
          <h2 className="font-bold">O que o seu perfil pode fazer</h2>
          <ul className="mt-4 space-y-2.5">
            {ACOES.map((a) => {
              const pode = a.pode(usuario);
              return (
                <li key={a.acao} className={`flex items-start gap-2.5 text-sm ${pode ? '' : 'text-slate-400'}`}>
                  {pode ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : <X className="mt-0.5 h-4 w-4 shrink-0" />}
                  {a.acao}
                </li>
              );
            })}
          </ul>
          <p className="mt-5 border-t border-bb-line pt-4 text-xs text-bb-muted">
            O TRL é um indicador atualizado por evidências. Marcos dentro da alçada da equipe são registrados pelo Analista; priorização e decisões ficam com quem tem alçada de governança.
          </p>
        </section>
      </div>

      {USE_MOCK && (
        <section className="card mt-4 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold">Modo demonstração</h2>
            <p className="text-sm text-bb-muted">Os dados ficam no navegador. Restaure o estado inicial para recomeçar os testes.</p>
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
