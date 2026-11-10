import { Check } from 'lucide-react';
import { useState } from 'react';

import { TRL_DEFINICOES } from '@/utils/constants';

// Régua TRL 1–9 (consulta). O TRL é atualizado pelo Analista a partir de evidências.
export function TrlRegua({ atual }: { atual: number }) {
  const [foco, setFoco] = useState(atual);
  const def = TRL_DEFINICOES[foco];

  return (
    <div>
      <div className="grid grid-cols-9 gap-1.5">
        {Array.from({ length: 9 }, (_, i) => {
          const n = i + 1;
          const feito = n < atual;
          const vigente = n === atual;
          return (
            <button
              key={n}
              type="button"
              onClick={() => setFoco(n)}
              aria-pressed={foco === n}
              className={`group relative flex flex-col items-center gap-1.5 rounded-lg py-2 transition ${foco === n ? 'bg-bb-blue-light' : 'hover:bg-slate-50'}`}
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition ${
                  feito
                    ? 'bg-bb-blue text-white'
                    : vigente
                      ? 'bg-bb-yellow text-bb-slate ring-2 ring-bb-blue ring-offset-2'
                      : 'bg-slate-100 text-slate-400'
                }`}
              >
                {feito ? <Check className="h-4 w-4" /> : n}
              </span>
              <span className={`hidden text-[10px] font-semibold sm:block ${vigente ? 'text-bb-blue' : 'text-bb-muted'}`}>
                {vigente ? 'Atual' : `TRL ${n}`}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 rounded-xl border border-bb-line bg-slate-50/70 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge border-bb-blue/20 bg-bb-blue text-white">TRL {foco}</span>
          <span className="text-sm font-bold text-bb-slate">{def.titulo}</span>
          <span className="ml-auto text-xs font-semibold text-bb-muted">
            {foco < atual ? 'Atingido' : foco === atual ? 'Nível vigente' : 'Futuro'}
          </span>
        </div>
        <p className="mt-1.5 text-sm text-bb-muted">{def.descricao}</p>
      </div>
    </div>
  );
}
