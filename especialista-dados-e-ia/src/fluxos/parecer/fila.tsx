import { MessagesSquare } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { SecaoFila } from '@/components/fila/SecaoFila';
import type { ConsultaEspecialista, MinhaFila, Usuario } from '@/types/domain';
import { tempoRelativo } from '@/utils/formatters';

import type { FilaFluxo } from '../tipos';
import { ParecerModal } from './ParecerModal';

// Especialista: consultas aguardando o seu parecer técnico (para você ou para a sua área)
function SecaoPareceres({ fila: f, usuario, recarregar }: { fila: MinhaFila; usuario: Usuario; recarregar: () => void }) {
  const [parecer, setParecer] = useState<ConsultaEspecialista | null>(null);

  return (
    <>
      <SecaoFila titulo="Consultas aguardando parecer" icon={<MessagesSquare className="h-4 w-4 text-teal-600" />} total={f.consultasPendentes.length} descricao={`Direcionadas a você ou abertas para ${usuario.areaTecnica ?? 'a sua área'}.`}>
        {f.consultasPendentes.map((c) => (
          <li key={c.id} className="py-3 text-sm">
            <Link to={`/app/projetos/${c.projetoId}?aba=qualificacao`} className="font-bold hover:text-bb-blue">
              {c.projetoTitulo}
            </Link>
            <p className="mt-1 text-slate-700">“{c.pergunta}”</p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-xs text-bb-muted">
                {c.solicitante.nome} · {tempoRelativo(c.criadaEm)} · {c.especialista ? 'para você' : `para a área ${c.areaTecnica}`}
              </span>
              <button className="btn-primary btn-sm" onClick={() => setParecer(c)}>
                Emitir parecer
              </button>
            </div>
          </li>
        ))}
      </SecaoFila>

      <ParecerModal consulta={parecer} onFechar={() => setParecer(null)} onFeito={recarregar} />
    </>
  );
}

const fila: FilaFluxo[] = [
  {
    perfil: 'ESPECIALISTA',
    ordem: 10,
    descricao: 'Consultas aguardando o seu parecer técnico.',
    Secoes: SecaoPareceres,
  },
];
export default fila;
