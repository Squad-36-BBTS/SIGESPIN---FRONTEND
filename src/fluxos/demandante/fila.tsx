import { ClipboardList, PackageCheck, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { EtapaBadge, Selo, TarefaBadge } from '@/components/common/ui';
import { SecaoFila } from '@/components/fila/SecaoFila';
import type { Entrega, MinhaFila } from '@/types/domain';
import { tempoRelativo } from '@/utils/formatters';

import type { FilaFluxo } from '../tipos';
import { ValidacaoModal } from './ValidacaoModal';

// Demandante: entregas aguardando a sua validação e o acompanhamento das suas demandas
function SecoesDemandante({ fila: f, recarregar }: { fila: MinhaFila; recarregar: () => void }) {
  const [validar, setValidar] = useState<Entrega | null>(null);

  return (
    <>
      <SecaoFila titulo="Entregas aguardando a sua validação" icon={<PackageCheck className="h-4 w-4 text-bb-blue" />} total={f.entregasParaValidar.length} descricao="Consulte a descrição e as evidências e registre o resultado.">
        {f.entregasParaValidar.map((e) => (
          <li key={e.id} className="py-3 text-sm">
            <Link to={`/app/projetos/${e.projetoId}?aba=entregas`} className="text-xs font-bold text-bb-blue hover:underline">
              {e.projetoTitulo}
            </Link>
            <p className="font-bold">
              {e.titulo} {e.ehMvp && <Selo classe="border-indigo-200 bg-indigo-50 text-indigo-800">MVP</Selo>}
            </p>
            <p className="mt-1 text-slate-600">{e.descricao}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-bb-muted">
                {e.registradaPor.nome} · {tempoRelativo(e.registradaEm)}
              </span>
              <button className="btn-primary btn-sm" onClick={() => setValidar(e)}>
                Validar
              </button>
            </div>
          </li>
        ))}
      </SecaoFila>
      <SecaoFila titulo="Minhas demandas" icon={<ClipboardList className="h-4 w-4 text-bb-blue" />} total={f.minhasDemandas.length} descricao="Acompanhe, responda dúvidas e adicione contexto pelo detalhe do projeto.">
        {f.minhasDemandas.map((p) => (
          <li key={p.id} className="py-3">
            <Link to={`/app/projetos/${p.id}`} className="font-bold hover:text-bb-blue">
              {p.titulo}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <EtapaBadge etapa={p.etapa} />
              {p.pendencias.map((t) => (
                <TarefaBadge key={t} tarefa={t} />
              ))}
            </div>
          </li>
        ))}
      </SecaoFila>

      <ValidacaoModal entrega={validar} onFechar={() => setValidar(null)} onFeito={recarregar} />
    </>
  );
}

const NovaDemanda = () => (
  <Link to="/app/demandas/nova" className="btn-primary">
    <Plus className="h-4 w-4" /> Nova demanda
  </Link>
);

const fila: FilaFluxo[] = [
  {
    perfil: 'DEMANDANTE',
    descricao: 'Entregas aguardando a sua validação e o acompanhamento das suas demandas.',
    Acoes: NovaDemanda,
    Secoes: SecoesDemandante,
  },
];
export default fila;
