import { ClipboardList, Gavel, MessagesSquare, PackageCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

import { OrigemBadge, Selo } from '@/components/common/ui';
import { SecaoFila } from '@/components/fila/SecaoFila';
import type { MinhaFila } from '@/types/domain';
import { VALIDACAO_BADGE, VALIDACAO_LABEL, areaSigla } from '@/utils/constants';
import { tempoRelativo } from '@/utils/formatters';

import type { FilaFluxo } from '../tipos';

// Analista: demandas aguardando triagem e os retornos (decisões, pareceres e validações) das suas iniciativas
function SecoesAnalista({ fila: f }: { fila: MinhaFila }) {
  return (
    <>
      <SecaoFila titulo="Aguardando triagem" icon={<ClipboardList className="h-4 w-4 text-bb-blue" />} total={f.triagem.length} descricao="Demandas sem qualificação, da mais antiga para a mais recente.">
        {[...f.triagem].sort((a, b) => a.criadoEm.localeCompare(b.criadoEm)).map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <Link to={`/app/projetos/${p.id}?aba=qualificacao`} className="font-bold hover:text-bb-blue">
                {p.titulo}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-bb-muted">
                <OrigemBadge origem={p.origem} campanha={p.campanha} />
                {areaSigla(p.areaDemandanteId)} · {p.demandante?.nome} · registrada {tempoRelativo(p.criadoEm)}
              </div>
            </div>
            <Link to={`/app/projetos/${p.id}?aba=qualificacao`} className="btn-primary btn-sm">
              Qualificar
            </Link>
          </li>
        ))}
      </SecaoFila>
      <SecaoFila titulo="Solicitações aguardando governança" icon={<Gavel className="h-4 w-4 text-amber-600" />} total={f.solicitacoesPendentes.length} descricao="Pedidos seus ainda sem decisão. O projeto segue na etapa atual.">
        {f.solicitacoesPendentes.map((s) => (
          <li key={s.id} className="py-3 text-sm">
            <Link to={`/app/projetos/${s.projetoId}?aba=kanban`} className="font-bold hover:text-bb-blue">
              {s.projetoTitulo}
            </Link>
            <p className="text-xs text-bb-muted">
              {s.origem.nome} → {s.destino.nome} · enviada {tempoRelativo(s.criadaEm)}
            </p>
          </li>
        ))}
      </SecaoFila>
      <SecaoFila titulo="Decisões recebidas" icon={<Gavel className="h-4 w-4 text-bb-blue" />} total={f.solicitacoesDecididas.length} descricao="Últimos 30 dias. Na rejeição, a etapa foi mantida.">
        {f.solicitacoesDecididas.map((s) => (
          <li key={s.id} className="py-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Link to={`/app/projetos/${s.projetoId}?aba=kanban`} className="font-bold hover:text-bb-blue">
                {s.projetoTitulo}
              </Link>
              <Selo classe={s.status === 'APROVADA' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}>{s.status === 'APROVADA' ? 'Aprovada' : 'Rejeitada'}</Selo>
            </div>
            <p className="text-xs text-bb-muted">
              {s.origem.nome} → {s.destino.nome} · {s.decisor?.nome}: “{s.justificativaDecisao}”
            </p>
          </li>
        ))}
      </SecaoFila>
      <SecaoFila titulo="Pareceres recebidos" icon={<MessagesSquare className="h-4 w-4 text-teal-600" />} total={f.pareceresRecebidos.length} descricao="Respostas às suas consultas nos últimos 30 dias.">
        {f.pareceresRecebidos.map((c) => (
          <li key={c.id} className="py-3 text-sm">
            <Link to={`/app/projetos/${c.projetoId}?aba=qualificacao`} className="font-bold hover:text-bb-blue">
              {c.projetoTitulo}
            </Link>
            <p className="text-xs text-bb-muted">
              {c.especialista?.nome} · {c.conclusao}
            </p>
          </li>
        ))}
      </SecaoFila>
      <SecaoFila titulo="Validações recebidas" icon={<PackageCheck className="h-4 w-4 text-bb-blue" />} total={f.entregasValidadas.length} descricao="Retorno dos demandantes. A validação não altera TRL nem Kanban.">
        {f.entregasValidadas.map((e) => (
          <li key={e.id} className="py-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Link to={`/app/projetos/${e.projetoId}?aba=entregas`} className="font-bold hover:text-bb-blue">
                {e.titulo}
              </Link>
              {e.validacao && <Selo classe={VALIDACAO_BADGE[e.validacao.resultado]}>{VALIDACAO_LABEL[e.validacao.resultado]}</Selo>}
            </div>
            <p className="text-xs text-bb-muted">{e.projetoTitulo}</p>
          </li>
        ))}
      </SecaoFila>
    </>
  );
}

const fila: FilaFluxo[] = [
  {
    perfil: 'ANALISTA',
    descricao: 'Demandas aguardando triagem e retornos de pareceres, decisões e validações das suas iniciativas.',
    Secoes: SecoesAnalista,
  },
];
export default fila;
