import type { ReactNode } from 'react';

// Bloco da "Minha fila": título, total e a lista de tarefas (ou "Nada pendente")
export function SecaoFila({ titulo, icon, total, descricao, children }: { titulo: string; icon: ReactNode; total: number; descricao: string; children: ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="flex items-center gap-2 font-bold">
        {icon} {titulo}
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-bb-muted">{total}</span>
      </h2>
      <p className="text-xs text-bb-muted">{descricao}</p>
      {total === 0 ? <p className="py-6 text-center text-sm text-bb-muted">Nada pendente.</p> : <ul className="mt-2 divide-y divide-bb-line">{children}</ul>}
    </section>
  );
}
