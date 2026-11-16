import { ArrowRight, Check, Gavel, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { SecaoFila } from '@/components/fila/SecaoFila';
import type { MinhaFila, SolicitacaoTransicao } from '@/types/domain';
import { tempoRelativo } from '@/utils/formatters';

import type { FilaFluxo } from '../tipos';
import { DecisaoModal } from './DecisaoModal';

// Especialista: transições do Kanban que exigem decisão de governança
function SecaoGovernanca({ fila: f, recarregar }: { fila: MinhaFila; recarregar: () => void }) {
  const [decisao, setDecisao] = useState<{ s: SolicitacaoTransicao; d: 'APROVADA' | 'REJEITADA' } | null>(null);

  return (
    <>
      <SecaoFila titulo="Transições aguardando governança" icon={<Gavel className="h-4 w-4 text-amber-600" />} total={f.solicitacoesPendentes.length} descricao="Consulte etapa atual, destino, justificativa e evidências antes de decidir.">
        {f.solicitacoesPendentes.map((s) => (
          <li key={s.id} className="py-3 text-sm">
            <Link to={`/app/projetos/${s.projetoId}?aba=kanban`} className="font-bold hover:text-bb-blue">
              {s.projetoTitulo}
            </Link>
            <p className="mt-1 flex items-center gap-1.5 font-semibold">
              {s.origem.nome} <ArrowRight className="h-3.5 w-3.5 text-bb-muted" /> {s.destino.nome}
            </p>
            <p className="mt-1 line-clamp-2 text-slate-600">{s.justificativa}</p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-bb-muted">
                {s.solicitante.nome} · {tempoRelativo(s.criadaEm)} · {s.evidencias.length} evidência(s)
              </span>
              <span className="flex gap-2">
                <button className="btn-sm btn border border-rose-200 bg-white text-rose-700 hover:bg-rose-50" onClick={() => setDecisao({ s, d: 'REJEITADA' })}>
                  <X className="h-3.5 w-3.5" /> Rejeitar
                </button>
                <button className="btn-primary btn-sm" onClick={() => setDecisao({ s, d: 'APROVADA' })}>
                  <Check className="h-3.5 w-3.5" /> Aprovar
                </button>
              </span>
            </div>
          </li>
        ))}
      </SecaoFila>

      <DecisaoModal solicitacao={decisao?.s ?? null} decisaoInicial={decisao?.d ?? 'APROVADA'} onFechar={() => setDecisao(null)} onFeito={recarregar} />
    </>
  );
}

const fila: FilaFluxo[] = [
  {
    perfil: 'ESPECIALISTA',
    ordem: 20,
    descricao: 'Transições que exigem decisão de governança.',
    Secoes: SecaoGovernanca,
  },
];
export default fila;
