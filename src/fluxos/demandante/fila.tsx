import { ClipboardList, Lightbulb, PackageCheck, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { EtapaBadge, Selo, TarefaBadge } from '@/components/common/ui';
import { SecaoFila } from '@/components/fila/SecaoFila';
import { temRota } from '@/fluxos/registro';
import type { Entrega, MinhaFila } from '@/types/domain';
import { tempoRelativo } from '@/utils/formatters';

import type { FilaFluxo } from '../tipos';
import { ValidacaoModal } from './ValidacaoModal';

// Demandante: entregas aguardando a sua validação, recomendações recebidas e o acompanhamento das suas demandas
function SecoesDemandante({ fila: f, recarregar }: { fila: MinhaFila; recarregar: () => void }) {
  const [validar, setValidar] = useState<Entrega | null>(null);

  return (
    <>
      <SecaoFila titulo="Entregas aguardando a sua validação" icon={<PackageCheck className="h-4 w-4 text-bb-blue" />} total={f.entregasParaValidar.length} descricao="Projetos em que você é o Demandante responsável.">
        {f.entregasParaValidar.map((e) => (
          <li key={e.id} className="py-3 text-sm">
            <Link to={`/app/projetos/${e.projetoId}?aba=entregas`} className="text-xs font-bold text-bb-blue hover:underline">
              {e.projetoTitulo}
            </Link>
            <p className="mt-1 text-slate-700">{e.descricao}</p>
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
      {temRota('/app/recomendacoes') && (
        <SecaoFila titulo="Recomendações para você" icon={<Lightbulb className="h-4 w-4 text-amber-600" />} total={f.recomendacoesPendentes.length} descricao="Converta em demanda espontânea ou recuse com justificativa.">
          {f.recomendacoesPendentes.map((r) => (
            <li key={r.id} className="py-3 text-sm">
              <p className="font-bold">{r.titulo}</p>
              <p className="mt-1 line-clamp-2 text-slate-600">{r.descricao}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-bb-muted">
                  {r.autor.nome} · {tempoRelativo(r.criadaEm)}
                </span>
                <Link to="/app/recomendacoes" className="btn-secondary btn-sm">
                  Responder
                </Link>
              </div>
            </li>
          ))}
        </SecaoFila>
      )}
      <SecaoFila titulo="Minhas demandas" icon={<ClipboardList className="h-4 w-4 text-bb-blue" />} total={f.minhasDemandas.length} descricao="Acompanhe, registre correções e adicione contexto pelo detalhe do projeto.">
        {f.minhasDemandas.map((p) => (
          <li key={p.id} className="py-3">
            <Link to={`/app/projetos/${p.id}`} className="font-bold hover:text-bb-blue">
              {p.titulo}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <EtapaBadge etapa={p.etapa} />
              {p.arquivado && <Selo classe="border-slate-300 bg-slate-100 text-slate-600">Arquivado</Selo>}
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
    descricao: 'Entregas aguardando a sua validação, recomendações recebidas e o acompanhamento das suas demandas.',
    Acoes: NovaDemanda,
    Secoes: SecoesDemandante,
  },
];
export default fila;
