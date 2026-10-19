import { ClipboardList, Hand, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ArenaBadge, EtapaBadge, Erro, OrigemBadge, PageHeader, Skeleton, Spinner, Vazio } from '@/components/common/ui';
import { useAsync, useAuth } from '@/hooks';
import { projetoService } from '@/services';
import { mensagemErro } from '@/services/api';
import type { Projeto } from '@/types/domain';
import { NATUREZA_LABEL, areaSigla } from '@/utils/constants';
import { tempoRelativo } from '@/utils/formatters';

// Fila de triagem do Analista: demandas novas no backlog e as que estão em qualificação
export default function TriagemPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const { dados, erro, recarregar } = useAsync(() => projetoService.listar(), []);
  const [assumindo, setAssumindo] = useState<number | null>(null);

  const itens = dados?.itens ?? [];
  const novas = itens.filter((p) => p.etapa === 'BACKLOG' && !p.aguardandoComplemento).sort((a, b) => a.criadoEm.localeCompare(b.criadoEm));
  const devolvidas = itens.filter((p) => p.etapa === 'BACKLOG' && p.aguardandoComplemento);
  const emQualificacao = itens.filter((p) => p.etapa === 'QUALIFICACAO');
  const minhas = emQualificacao.filter((p) => p.analistaResponsavel?.id === usuario?.id);
  const outras = emQualificacao.filter((p) => p.analistaResponsavel?.id !== usuario?.id);
  const acompanhamento = itens.filter((p) => p.analistaResponsavel?.id === usuario?.id && ['EXPERIMENTACAO', 'MVP', 'GOVERNANCA'].includes(p.etapa));

  const assumir = async (p: Projeto) => {
    setAssumindo(p.id);
    try {
      await projetoService.assumirTriagem(p.id);
      toast.success('Triagem iniciada. A demanda está em qualificação com você.');
      navigate(`/app/projetos/${p.id}?aba=qualificacao`);
    } catch (e) {
      toast.error(mensagemErro(e));
      recarregar();
    } finally {
      setAssumindo(null);
    }
  };

  const Linha = ({ p, acao }: { p: Projeto; acao?: React.ReactNode }) => (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <OrigemBadge origem={p.origem} campanha={p.campanha} />
          <span className="badge border-slate-200 bg-white text-slate-600">{NATUREZA_LABEL[p.natureza]}</span>
          <ArenaBadge arena={p.arena} />
        </div>
        <Link to={`/app/projetos/${p.id}`} className="mt-1.5 block font-bold hover:text-bb-blue">
          {p.titulo}
        </Link>
        <p className="line-clamp-1 text-sm text-bb-muted">{p.descricaoDor}</p>
        <p className="mt-1 text-xs text-bb-muted">
          {areaSigla(p.areaDemandanteId)} · {p.demandante?.nome ?? 'Demandante não informado'} · registrada {tempoRelativo(p.criadoEm)}
          {p.campanha && ` · ${p.campanha.titulo}`}
        </p>
      </div>
      {acao}
    </li>
  );

  const Secao = ({ titulo, texto, lista, acao }: { titulo: string; texto: string; lista: Projeto[]; acao?: (p: Projeto) => React.ReactNode }) => (
    <section className="card p-5">
      <h2 className="font-bold">
        {titulo} <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-bb-muted">{lista.length}</span>
      </h2>
      <p className="text-xs text-bb-muted">{texto}</p>
      {lista.length === 0 ? (
        <p className="py-6 text-center text-sm text-bb-muted">Nada por aqui.</p>
      ) : (
        <ul className="divide-y divide-bb-line">
          {lista.map((p) => (
            <Linha key={p.id} p={p} acao={acao?.(p)} />
          ))}
        </ul>
      )}
    </section>
  );

  return (
    <div>
      <PageHeader
        eyebrow="Analista de Inovação"
        titulo="Triagem e qualificação"
        descricao="Avalie aderência à Tese, relevância, grau de inovação, viabilidade e TRL. Consulte especialistas quando precisar de conhecimento técnico."
      />
      {erro && <Erro texto={erro} onTentar={recarregar} />}
      {!dados ? (
        <Skeleton className="h-96" />
      ) : novas.length + emQualificacao.length + devolvidas.length === 0 ? (
        <Vazio titulo="Fila de triagem vazia" texto="Novas demandas espontâneas e de campanhas aparecem aqui." />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          <Secao
            titulo="Novas no backlog"
            texto="Da mais antiga para a mais recente."
            lista={novas}
            acao={(p) => (
              <button className="btn-primary btn-sm shrink-0" disabled={assumindo === p.id} onClick={() => assumir(p)}>
                {assumindo === p.id ? <Spinner className="h-3 w-3" /> : <Hand className="h-3.5 w-3.5" />} Assumir triagem
              </button>
            )}
          />
          <Secao
            titulo="Em qualificação comigo"
            texto="Registre a qualificação para definir o encaminhamento."
            lista={minhas}
            acao={(p) => (
              <Link to={`/app/projetos/${p.id}?aba=qualificacao`} className="btn-secondary btn-sm shrink-0">
                <ClipboardList className="h-3.5 w-3.5" /> Qualificar
              </Link>
            )}
          />
          {outras.length > 0 && (
            <Secao
              titulo="Em qualificação com outros analistas"
              texto="Visíveis para acompanhamento."
              lista={outras}
              acao={(p) => (
                <span className="flex shrink-0 items-center gap-1 text-xs text-bb-muted">
                  <UserRound className="h-3.5 w-3.5" /> {p.analistaResponsavel?.nome}
                </span>
              )}
            />
          )}
          {devolvidas.length > 0 && (
            <Secao titulo="Aguardando complemento do demandante" texto="Voltam para a fila quando o demandante complementar." lista={devolvidas} />
          )}
          {acompanhamento.length > 0 && (
            <Secao titulo="Em andamento comigo" texto="Projetos que você conduz depois da qualificação." lista={acompanhamento} acao={(p) => <EtapaBadge etapa={p.etapa} />} />
          )}
        </div>
      )}
    </div>
  );
}
