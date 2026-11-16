import { ClipboardList, Gavel, MessagesSquare, PackageCheck, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { OrigemBadge, Selo } from '@/components/common/ui';
import { SecaoFila } from '@/components/fila/SecaoFila';
import { temRota } from '@/fluxos/registro';
import type { MinhaFila } from '@/types/domain';
import { GOVERNANCA_BADGE, GOVERNANCA_LABEL, TIPO_PROPOSTA_LABEL, VALIDACAO_BADGE, VALIDACAO_LABEL, areaSigla } from '@/utils/constants';
import { tempoRelativo } from '@/utils/formatters';

import type { FilaFluxo } from '../tipos';

// Analista: demandas aguardando triagem e os retornos (decisões, pareceres, validações e propostas) do seu trabalho
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
                {areaSigla(p.areaDemandanteId)} · {p.demandante?.nome ?? 'sem Demandante'} · registrada {tempoRelativo(p.criadoEm)}
              </div>
            </div>
            <Link to={`/app/projetos/${p.id}?aba=qualificacao`} className="btn-primary btn-sm">
              Qualificar
            </Link>
          </li>
        ))}
      </SecaoFila>
      <SecaoFila titulo="Seus pedidos de avanço pendentes" icon={<Gavel className="h-4 w-4 text-amber-600" />} total={f.solicitacoesPendentes.length} descricao="O cartão segue na origem até a decisão. Você pode cancelar o próprio pedido.">
        {f.solicitacoesPendentes.map((s) => (
          <li key={s.id} className="py-3 text-sm">
            <Link to={`/app/projetos/${s.projetoId}?aba=kanban`} className="font-bold hover:text-bb-blue">
              {s.projetoTitulo}
            </Link>
            <p className="text-xs text-bb-muted">
              {s.origem.nome} → {s.destino.nome} · enviado {tempoRelativo(s.criadaEm)}
            </p>
          </li>
        ))}
      </SecaoFila>
      <SecaoFila titulo="Pedidos encerrados" icon={<Gavel className="h-4 w-4 text-bb-blue" />} total={f.solicitacoesEncerradas.length} descricao="Últimos 30 dias. Na rejeição e no cancelamento, a etapa foi mantida.">
        {f.solicitacoesEncerradas.map((s) => (
          <li key={s.id} className="py-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Link to={`/app/projetos/${s.projetoId}?aba=kanban`} className="font-bold hover:text-bb-blue">
                {s.projetoTitulo}
              </Link>
              <Selo classe={GOVERNANCA_BADGE[s.status]}>{GOVERNANCA_LABEL[s.status]}</Selo>
            </div>
            <p className="text-xs text-bb-muted">
              {s.origem.nome} → {s.destino.nome} · {s.encerradaPor?.nome}: “{s.justificativaEncerramento}”
            </p>
          </li>
        ))}
      </SecaoFila>
      <SecaoFila titulo="Pareceres recebidos" icon={<MessagesSquare className="h-4 w-4 text-teal-600" />} total={f.pareceresRecebidos.length} descricao="Respostas às suas consultas nos últimos 30 dias.">
        {f.pareceresRecebidos.map((c) => (
          <li key={c.id} className="py-3 text-sm">
            <Link to={`/app/projetos/${c.projetoId}?aba=pareceres`} className="font-bold hover:text-bb-blue">
              {c.projetoTitulo}
            </Link>
            <p className="text-xs text-bb-muted">
              {c.especialista.nome} · {c.conclusao}
            </p>
          </li>
        ))}
      </SecaoFila>
      <SecaoFila titulo="Validações recebidas" icon={<PackageCheck className="h-4 w-4 text-bb-blue" />} total={f.entregasValidadas.length} descricao="Retorno dos Demandantes nos últimos 30 dias. A validação não altera TRL nem Kanban.">
        {f.entregasValidadas.map((e) => (
          <li key={e.id} className="py-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Link to={`/app/projetos/${e.projetoId}?aba=entregas`} className="font-bold hover:text-bb-blue">
                Entrega #{e.id}
              </Link>
              {e.validacoes[0] && <Selo classe={VALIDACAO_BADGE[e.validacoes[0].resultado]}>{VALIDACAO_LABEL[e.validacoes[0].resultado]}</Selo>}
            </div>
            <p className="text-xs text-bb-muted">{e.projetoTitulo}</p>
          </li>
        ))}
      </SecaoFila>
      {temRota('/app/propostas') && (
        <SecaoFila titulo="Suas propostas de configuração" icon={<Settings2 className="h-4 w-4 text-bb-blue" />} total={f.propostasPendentes.length} descricao="Aguardando a decisão de um Especialista.">
          {f.propostasPendentes.map((p) => (
            <li key={p.id} className="py-3 text-sm">
              <Link to="/app/propostas" className="font-bold hover:text-bb-blue">
                {TIPO_PROPOSTA_LABEL[p.tipo]} · {p.tipo === 'COLUNA' ? p.proposta.nome : `percurso #${p.id}`}
              </Link>
              <p className="text-xs text-bb-muted">Enviada {tempoRelativo(p.criadaEm)}</p>
            </li>
          ))}
        </SecaoFila>
      )}
    </>
  );
}

const fila: FilaFluxo[] = [
  {
    perfil: 'ANALISTA',
    descricao: 'Demandas aguardando triagem e o retorno de pedidos, pareceres, validações e propostas.',
    Secoes: SecoesAnalista,
  },
];
export default fila;
