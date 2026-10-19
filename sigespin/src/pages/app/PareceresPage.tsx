import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Erro, PageHeader, Selo, Skeleton, Vazio } from '@/components/common/ui';
import { ParecerModal } from '@/components/projeto/modais';
import { useAsync, useAuth } from '@/hooks';
import { parecerService } from '@/services';
import type { ConsultaEspecialista } from '@/types/domain';
import { RECOMENDACAO_PARECER_BADGE, RECOMENDACAO_PARECER_LABEL } from '@/utils/constants';
import { formatarDataHora, tempoRelativo } from '@/utils/formatters';

// Especialista: responde às consultas técnicas que subsidiam a qualificação e a governança
export default function PareceresPage() {
  const { usuario } = useAuth();
  const { dados, erro, recarregar } = useAsync(() => parecerService.minhas(), []);
  const [responder, setResponder] = useState<ConsultaEspecialista | null>(null);
  const pendentes = (dados ?? []).filter((c) => c.status === 'PENDENTE');
  const respondidas = (dados ?? []).filter((c) => c.status === 'RESPONDIDA');

  return (
    <div>
      <PageHeader
        eyebrow={usuario?.areaTecnica ?? 'Especialista'}
        titulo="Pareceres técnicos"
        descricao="Consultas enviadas pela equipe de inovação para subsidiar a qualificação e as decisões."
      />
      {erro && <Erro texto={erro} onTentar={recarregar} />}
      {!dados ? (
        <Skeleton className="h-64" />
      ) : dados.length === 0 ? (
        <Vazio titulo="Nenhuma consulta" texto="Quando um analista pedir o seu parecer, ele aparece aqui." />
      ) : (
        <div className="space-y-6">
          <section>
            <h2 className="mb-3 font-bold">Aguardando parecer ({pendentes.length})</h2>
            {pendentes.length === 0 ? (
              <p className="card p-6 text-center text-sm text-bb-muted">Tudo respondido.</p>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {pendentes.map((c) => (
                  <article key={c.id} className="card border-l-4 border-l-amber-400 p-5">
                    <Link to={`/app/projetos/${c.projetoId}?aba=qualificacao`} className="font-bold hover:text-bb-blue">
                      {c.projetoTitulo}
                    </Link>
                    <p className="mt-0.5 text-xs text-bb-muted">
                      {c.solicitante.nome} · {tempoRelativo(c.criadaEm)}
                    </p>
                    <p className="mt-3 text-sm text-slate-700">{c.pergunta}</p>
                    <div className="mt-4 flex justify-end gap-2 border-t border-bb-line pt-4">
                      <Link to={`/app/projetos/${c.projetoId}`} className="btn-ghost btn-sm">
                        Ver projeto
                      </Link>
                      <button className="btn-primary btn-sm" onClick={() => setResponder(c)}>
                        Emitir parecer
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
          {respondidas.length > 0 && (
            <section>
              <h2 className="mb-3 font-bold">Respondidas</h2>
              <div className="card divide-y divide-bb-line">
                {respondidas.map((c) => (
                  <div key={c.id} className="p-4 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link to={`/app/projetos/${c.projetoId}?aba=qualificacao`} className="font-bold hover:text-bb-blue">
                        {c.projetoTitulo}
                      </Link>
                      {c.recomendacao && <Selo classe={RECOMENDACAO_PARECER_BADGE[c.recomendacao]}>{RECOMENDACAO_PARECER_LABEL[c.recomendacao]}</Selo>}
                      <span className="ml-auto text-xs text-bb-muted">{formatarDataHora(c.respondidaEm)}</span>
                    </div>
                    <p className="mt-1 text-slate-600">{c.parecer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
      <ParecerModal consulta={responder} onFechar={() => setResponder(null)} onFeito={recarregar} />
    </div>
  );
}
