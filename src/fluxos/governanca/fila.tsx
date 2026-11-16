import { ArrowRight, Check, Gavel, Settings2, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { SecaoFila } from '@/components/fila/SecaoFila';
import { temRota } from '@/fluxos/registro';
import type { DecisaoRequest, MinhaFila, SolicitacaoTransicao } from '@/types/domain';
import { TIPO_PROPOSTA_LABEL } from '@/utils/constants';
import { tempoRelativo } from '@/utils/formatters';

import type { FilaFluxo } from '../tipos';
import { DecisaoModal } from './DecisaoModal';

// Especialista: pedidos de avanço que aguardam decisão e propostas de configuração pendentes
function SecaoGovernanca({ fila: f, recarregar }: { fila: MinhaFila; recarregar: () => void }) {
  const [decisao, setDecisao] = useState<{ s: SolicitacaoTransicao; d: DecisaoRequest['decisao'] } | null>(null);

  return (
    <>
      <SecaoFila titulo="Pedidos de avanço aguardando decisão" icon={<Gavel className="h-4 w-4 text-amber-600" />} total={f.solicitacoesPendentes.length} descricao="Consulte etapa atual, destino, justificativa e evidências antes de decidir.">
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
                <button className="btn-sm btn border border-rose-200 bg-white text-rose-700 hover:bg-rose-50" onClick={() => setDecisao({ s, d: 'REJEITAR' })}>
                  <X className="h-3.5 w-3.5" /> Rejeitar
                </button>
                <button className="btn-primary btn-sm" onClick={() => setDecisao({ s, d: 'APROVAR' })}>
                  <Check className="h-3.5 w-3.5" /> Aprovar
                </button>
              </span>
            </div>
          </li>
        ))}
      </SecaoFila>
      {temRota('/app/propostas') && (
        <SecaoFila titulo="Propostas de configuração pendentes" icon={<Settings2 className="h-4 w-4 text-bb-blue" />} total={f.propostasPendentes.length} descricao="Colunas e percursos propostos pelo Analista.">
          {f.propostasPendentes.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span>
                <span className="font-bold">
                  {TIPO_PROPOSTA_LABEL[p.tipo]}
                  {p.tipo === 'COLUNA' ? ` · ${p.proposta.nome}` : ''}
                </span>
                <span className="block text-xs text-bb-muted">
                  {p.autor.nome} · {tempoRelativo(p.criadaEm)}
                </span>
              </span>
              <Link to="/app/propostas?status=PENDENTE" className="btn-secondary btn-sm">
                Decidir
              </Link>
            </li>
          ))}
        </SecaoFila>
      )}

      <DecisaoModal solicitacao={decisao?.s ?? null} decisaoInicial={decisao?.d ?? 'APROVAR'} onFechar={() => setDecisao(null)} onFeito={recarregar} />
    </>
  );
}

const fila: FilaFluxo[] = [
  {
    perfil: 'ESPECIALISTA',
    ordem: 20,
    descricao: 'Pedidos de avanço e propostas de configuração que aguardam decisão.',
    Secoes: SecaoGovernanca,
  },
];
export default fila;
