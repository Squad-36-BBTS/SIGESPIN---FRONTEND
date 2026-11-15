import { FileText } from 'lucide-react';

import type { Evidencia } from '@/types/domain';
import { formatarData, formatarTamanho } from '@/utils/formatters';

// Seleção de evidências já vinculadas ao projeto (guia, seção 3): cada uma aparece uma única vez.
// TRL e pedido de avanço exigem ao menos uma; no parecer a lista pode ficar vazia.
export function SeletorEvidencias({ evidencias, valor, onChange, erro }: { evidencias: Evidencia[]; valor: number[]; onChange: (ids: number[]) => void; erro?: string }) {
  if (!evidencias.length)
    return <p className="rounded-lg border border-dashed border-bb-line-2 bg-slate-50 p-3 text-sm text-bb-muted">Este projeto ainda não tem evidências vinculadas.</p>;
  const alternar = (id: number) => onChange(valor.includes(id) ? valor.filter((x) => x !== id) : [...valor, id]);
  return (
    <div>
      <ul className={`divide-y divide-bb-line rounded-xl border ${erro ? 'border-rose-300' : 'border-bb-line'}`}>
        {evidencias.map((e) => (
          <li key={e.id}>
            <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm hover:bg-slate-50">
              <input type="checkbox" className="h-4 w-4 accent-bb-blue" checked={valor.includes(e.id)} onChange={() => alternar(e.id)} />
              <FileText className="h-4 w-4 shrink-0 text-bb-blue" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{e.nomeArquivo}</span>
                <span className="block text-xs text-bb-muted">
                  {e.descricao ? `${e.descricao} · ` : ''}
                  {e.enviadaPor.nome} · {formatarData(e.dataUpload)} · {formatarTamanho(e.tamanhoBytes)}
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      {erro && <p className="mt-1 text-xs font-semibold text-rose-600">{erro}</p>}
    </div>
  );
}

// Correção: um único ID de evidência, opcional
export function SeletorEvidencia({ evidencias, valor, onChange, id }: { evidencias: Evidencia[]; valor: number | null; onChange: (id: number | null) => void; id?: string }) {
  return (
    <select id={id} className="input" value={valor ?? 0} onChange={(e) => onChange(Number(e.target.value) || null)}>
      <option value={0}>Sem evidência</option>
      {evidencias.map((e) => (
        <option key={e.id} value={e.id}>
          {e.nomeArquivo}
        </option>
      ))}
    </select>
  );
}

export const nomesEvidencias = (evidencias: Evidencia[], ids: number[]) => {
  const nomes = evidencias.filter((e) => ids.includes(e.id)).map((e) => e.nomeArquivo);
  return nomes.length ? nomes.join('\n') : 'Nenhuma';
};

// Lista compacta das evidências de um registro
export function ListaEvidencias({ evidencias }: { evidencias: Evidencia[] }) {
  if (!evidencias.length) return null;
  return (
    <ul className="mt-2 flex flex-wrap gap-2">
      {evidencias.map((e) => (
        <li key={e.id} className="flex items-center gap-1.5 rounded-lg border border-bb-line bg-white px-2.5 py-1.5 text-xs">
          <FileText className="h-3.5 w-3.5 text-bb-blue" />
          <span className="max-w-[220px] truncate font-semibold">{e.nomeArquivo}</span>
          <span className="text-bb-muted">{formatarTamanho(e.tamanhoBytes)}</span>
        </li>
      ))}
    </ul>
  );
}
