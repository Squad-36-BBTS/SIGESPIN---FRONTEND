import { CalendarDays, Megaphone, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { BotaoAcao, Erro, PageHeader, Selo, Skeleton, Vazio } from '@/components/common/ui';
import { temRota } from '@/fluxos/registro';
import { useAsync, useAuth } from '@/hooks';
import { campanhaService } from '@/services';
import { TIPO_CAMPANHA_LABEL } from '@/utils/constants';
import { formatarData } from '@/utils/formatters';
import { porPerfil } from '@/utils/permissoes';

// Ações de mobilização (campanhas, desafios, hackathons, residências): origem das demandas induzidas.
// O cadastro dessas ações não está definido no guia; aparece desabilitado e marcado para discussão.
export default function CampanhasPage() {
  const { usuario } = useAuth();
  const { dados, erro, recarregar } = useAsync(() => campanhaService.listar(), []);
  const podeRegistrar = !!usuario && temRota('/app/demandas/nova') && porPerfil('registrarDemanda', usuario).permitido;

  return (
    <div>
      <PageHeader
        eyebrow="Entrada induzida"
        titulo="Ações de mobilização"
        descricao="Campanhas, desafios, hackathons e residências vigentes. Ao registrar uma demanda induzida, ela é associada a uma destas ações."
        acoes={usuario && <BotaoAcao permissao={porPerfil('criarMobilizacao', usuario)} onClick={() => undefined} icon={<Plus className="h-4 w-4" />}>Nova ação</BotaoAcao>}
      />
      {erro && <Erro texto={erro} onTentar={recarregar} />}
      {!dados ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : dados.length === 0 ? (
        <Vazio titulo="Nenhuma ação de mobilização" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dados.map((c) => {
            const aberta = c.status === 'ABERTA';
            return (
              <article key={c.id} className={`card card-hover flex flex-col p-5 ${aberta ? '' : 'opacity-75'}`}>
                <div className="flex items-center justify-between gap-2">
                  <Selo classe="border-orange-200 bg-orange-50 text-orange-800">
                    <Megaphone className="h-3 w-3" /> {TIPO_CAMPANHA_LABEL[c.tipo]}
                  </Selo>
                  <Selo classe={aberta ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-500'}>{aberta ? 'Vigente' : 'Encerrada'}</Selo>
                </div>
                <h2 className="mt-3 text-lg font-bold leading-snug">{c.titulo}</h2>
                <p className="mt-1 text-xs font-semibold text-bb-blue">{c.tema}</p>
                <p className="mt-2 flex-1 text-sm text-bb-muted">{c.descricao}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-bb-muted">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" /> {formatarData(c.inicio)} a {formatarData(c.fim)}
                  </span>
                  <span className="font-bold text-bb-slate">{c.totalDemandas ?? 0} demandas</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-bb-line pt-4">
                  <Link to={`/app/portfolio?campanha=${c.id}`} className="btn-ghost btn-sm">
                    Ver demandas
                  </Link>
                  {aberta && podeRegistrar && (
                    <Link to={`/app/demandas/nova?campanha=${c.id}`} className="btn-primary btn-sm ml-auto">
                      Registrar demanda
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
