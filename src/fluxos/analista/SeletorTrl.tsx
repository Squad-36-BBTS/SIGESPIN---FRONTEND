import { TRL_DEFINICOES } from '@/utils/constants';

export function SeletorTrl({ valor, onChange, atual }: { valor: number; onChange: (n: number) => void; atual?: number }) {
  return (
    <div>
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Nível TRL">
        {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={valor === n}
            onClick={() => onChange(n)}
            className={`relative h-10 w-10 rounded-lg border text-sm font-bold transition ${valor === n ? 'border-bb-blue bg-bb-blue text-white' : 'border-bb-line-2 hover:border-bb-blue hover:text-bb-blue'}`}
          >
            {n}
            {atual === n && <span className="absolute -top-1 right-0.5 h-2 w-2 rounded-full bg-bb-yellow ring-2 ring-white" title="TRL atual" />}
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-xs text-bb-muted">
        <strong>TRL {valor}:</strong> {TRL_DEFINICOES[valor].descricao}
      </p>
    </div>
  );
}
