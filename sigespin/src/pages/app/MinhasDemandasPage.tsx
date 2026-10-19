import { CheckCircle2, MessageSquareWarning, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { ArenaBadge, EtapaBadge, OrigemBadge, PageHeader, Skeleton, TrlMeter, Vazio } from '@/components/common/ui';
import { ValidacaoModal } from '@/components/projeto/modais';
import { useAsync, useAuth } from '@/hooks';
import { entregaService, projetoService } from '@/services';
import type { Entrega } from '@/types/domain';
import { ETAPA_DESCRICAO } from '@/utils/constants';
import { tempoRelativo } from '@/utils/formatters';

// O demandante é o dono do problema: acompanha a jornada, complementa e valida as entregas
export default function MinhasDemandasPage() {
  const { usuario } = useAuth();
  const projetos = useAsync(() => projetoService.listar(), []);
  const entregas = useAsync(() => entregaService.paraValidar(), []);
  const [validar, setValidar] = useState<Entrega | null>(null);

  const minhas = (projetos.dados?.itens ?? []).filter((p) => p.demandante?.id === usuario?.id);
  const complemento = minhas.filter((p) => p.aguardandoComplemento);

  return (
    <div>
      <PageHeader
        eyebrow="Demandante"
        titulo="Minhas demandas"
        descricao="Você é o dono do problema: acompanhe a jornada, complemente quando pedirem e valide as entregas."
        acoes={
          <Link to="/app/demandas/nova" className="btn-primary">
            <Plus className="h-4 w-4" /> Nova demanda
          </Link>
        }
      />

      {(entregas.dados?.length ?? 0) > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 font-bold">
            <CheckCircle2 className="h-5 w-5 text-bb-blue" /> Entregas aguardando a sua validação
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {entregas.dados!.map((e) => (
              <article key={e.id} className="card border-l-4 border-l-bb-yellow p-5">
                <Link to={`/app/projetos/${e.projetoId}?aba=entregas`} className="text-xs font-bold text-bb-blue hover:underline">
                  {e.projetoTitulo}
                </Link>
                <h3 className="mt-1 font-bold">{e.titulo}</h3>
                <p className="mt-1 text-sm text-bb-muted">{e.descricao}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-bb-muted">
                    {e.registradaPor.nome} · {tempoRelativo(e.registradaEm)}
                  </span>
                  <button className="btn-primary btn-sm" onClick={() => setValidar(e)}>
                    Validar entrega
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {complemento.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-card border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <MessageSquareWarning className="h-4 w-4" />
          <span>
            <strong>{complemento.length}</strong> demanda{complemento.length > 1 ? 's' : ''} devolvida{complemento.length > 1 ? 's' : ''} na triagem aguardando o seu complemento.
          </span>
        </div>
      )}

      {!projetos.dados ? (
        <Skeleton className="h-64" />
      ) : minhas.length === 0 ? (
        <Vazio titulo="Você ainda não registrou demandas" texto="Registre um problema, uma necessidade ou uma oportunidade, ou participe de uma campanha aberta." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {minhas.map((p) => (
            <Link key={p.id} to={`/app/projetos/${p.id}`} className="card card-hover flex flex-col p-5">
              <div className="flex flex-wrap gap-1.5">
                <EtapaBadge etapa={p.etapa} />
                <OrigemBadge origem={p.origem} campanha={p.campanha} />
                {p.aguardandoComplemento && <span className="badge border-amber-200 bg-amber-50 text-amber-800">Complementar</span>}
                {p.entregasAguardandoValidacao > 0 && <span className="badge border-transparent bg-bb-yellow text-bb-slate">Validar entrega</span>}
              </div>
              <h3 className="mt-3 font-bold leading-snug">{p.titulo}</h3>
              <p className="mt-1 text-xs text-bb-muted">{ETAPA_DESCRICAO[p.etapa]}</p>
              <div className="mt-auto pt-4">
                <div className="mb-1 flex justify-between text-xs">
                  <ArenaBadge arena={p.arena} />
                  <span className="font-bold text-bb-blue">TRL {p.trlAtual}</span>
                </div>
                <TrlMeter trl={p.trlAtual} />
              </div>
            </Link>
          ))}
        </div>
      )}

      <ValidacaoModal
        entrega={validar}
        onFechar={() => setValidar(null)}
        onFeito={() => {
          entregas.recarregar();
          projetos.recarregar();
        }}
      />
    </div>
  );
}
