import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Erro, PageHeader, Skeleton, Vazio } from '@/components/common/ui';
import { DecisaoModal } from '@/components/projeto/modais';
import { useAsync } from '@/hooks';
import { governancaService, projetoService } from '@/services';
import type { DecisaoTipo, PautaGovernanca, Projeto } from '@/types/domain';
import { DECISAO_LABEL, ETAPA_LABEL } from '@/utils/constants';
import { tempoRelativo } from '@/utils/formatters';

// Instância de governança: quem tem alçada prioriza e decide sobre as pautas encaminhadas.
// Nem todo avanço passa por aqui: marcos dentro da alçada da equipe são registrados pelo Analista.
export default function GovernancaPage() {
  const pautas = useAsync(() => governancaService.pautas(), []);
  const recentes = useAsync(() => governancaService.decisoesRecentes(), []);
  const projetos = useAsync(() => projetoService.listar(), []);
  const [decidir, setDecidir] = useState<{ pauta: PautaGovernanca; projeto: Projeto; tipo: DecisaoTipo } | null>(null);

  const projetoDe = (id: number) => projetos.dados?.itens.find((p) => p.id === id);
  const recarregar = () => {
    pautas.recarregar();
    recentes.recarregar();
    projetos.recarregar();
  };

  return (
    <div>
      <PageHeader
        eyebrow="Governança"
        titulo="Pauta de priorização e decisão"
        descricao="Demandas qualificadas e marcos que exigem a sua alçada. Considere a qualificação e os pareceres técnicos antes de decidir."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div>
          {pautas.erro && <Erro texto={pautas.erro} onTentar={pautas.recarregar} />}
          {!pautas.dados || !projetos.dados ? (
            <Skeleton className="h-64" />
          ) : pautas.dados.length === 0 ? (
            <Vazio titulo="Pauta vazia" texto="Não há itens aguardando decisão." />
          ) : (
            <div className="space-y-3">
              {pautas.dados.map((pt) => {
                const p = projetoDe(pt.projetoId);
                return (
                  <article key={pt.id} className="card border-l-4 border-l-bb-yellow p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <Link to={`/app/projetos/${pt.projetoId}?aba=governanca`} className="text-lg font-bold hover:text-bb-blue">
                          {pt.projetoTitulo}
                        </Link>
                        <p className="text-xs text-bb-muted">
                          {pt.etapaAtual === 'GOVERNANCA' ? 'Priorização inicial' : 'Marco da jornada'} · encaminhada por {pt.encaminhadaPor.nome} · {tempoRelativo(pt.criadaEm)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="badge border-slate-200 bg-slate-100 text-slate-600">{ETAPA_LABEL[pt.etapaAtual]}</span>
                        {pt.etapaProposta && (
                          <>
                            <ArrowRight className="h-3.5 w-3.5 text-bb-muted" />
                            <span className="badge border-blue-200 bg-bb-blue-light text-bb-blue">{ETAPA_LABEL[pt.etapaProposta]}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-700">{pt.motivo}</p>
                    <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-bb-line pt-4">
                      <Link to={`/app/projetos/${pt.projetoId}?aba=qualificacao`} className="btn-ghost btn-sm mr-auto">
                        Qualificação e pareceres
                      </Link>
                      {p && (
                        <>
                          <button className="btn-sm btn border border-rose-200 bg-white text-rose-700 hover:bg-rose-50" onClick={() => setDecidir({ pauta: pt, projeto: p, tipo: 'REPROVADO' })}>
                            Descontinuar
                          </button>
                          <button className="btn-secondary btn-sm" onClick={() => setDecidir({ pauta: pt, projeto: p, tipo: 'PIVOTADO' })}>
                            Pivotar
                          </button>
                          <button className="btn-primary btn-sm" onClick={() => setDecidir({ pauta: pt, projeto: p, tipo: 'APROVADO' })}>
                            Aprovar
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
        <aside className="card h-fit p-5">
          <h2 className="font-bold">Decisões recentes</h2>
          {!recentes.dados ? (
            <Skeleton className="mt-4 h-40" />
          ) : (
            <ul className="mt-3 divide-y divide-bb-line">
              {recentes.dados.map((dc) => (
                <li key={dc.id} className="py-3 text-sm">
                  <Link to={`/app/projetos/${dc.projetoId}?aba=governanca`} className="block truncate font-semibold hover:text-bb-blue">
                    {dc.projetoTitulo}
                  </Link>
                  <p className="text-xs text-bb-muted">
                    <span className={dc.decisao === 'APROVADO' ? 'font-bold text-emerald-700' : dc.decisao === 'REPROVADO' ? 'font-bold text-rose-700' : 'font-bold text-indigo-700'}>
                      {DECISAO_LABEL[dc.decisao]}
                    </span>{' '}
                    · {dc.responsavel.nome} · {tempoRelativo(dc.dataDecisao)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
      <DecisaoModal projeto={decidir?.projeto ?? null} pauta={decidir?.pauta ?? null} tipoInicial={decidir?.tipo ?? 'APROVADO'} onFechar={() => setDecidir(null)} onFeito={recarregar} />
    </div>
  );
}
