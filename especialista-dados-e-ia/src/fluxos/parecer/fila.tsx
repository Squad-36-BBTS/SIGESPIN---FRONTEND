import { MessagesSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

import { SecaoFila } from '@/components/fila/SecaoFila';
import type { MinhaFila } from '@/types/domain';
import { tempoRelativo } from '@/utils/formatters';

import type { FilaFluxo } from '../tipos';

// Especialista: consultas dirigidas a ele. O parecer é emitido no detalhe, com as evidências do projeto.
function SecaoPareceres({ fila: f }: { fila: MinhaFila }) {
  return (
    <SecaoFila titulo="Consultas aguardando o seu parecer" icon={<MessagesSquare className="h-4 w-4 text-teal-600" />} total={f.consultasPendentes.length} descricao="Somente você, como destinatário, pode responder.">
      {f.consultasPendentes.map((c) => (
        <li key={c.id} className="py-3 text-sm">
          <Link to={`/app/projetos/${c.projetoId}?aba=pareceres`} className="font-bold hover:text-bb-blue">
            {c.projetoTitulo}
          </Link>
          <p className="mt-1 text-slate-700">“{c.questao}”</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-xs text-bb-muted">
              {c.solicitante.nome} · {tempoRelativo(c.criadaEm)}
            </span>
            <Link to={`/app/projetos/${c.projetoId}?aba=pareceres`} className="btn-primary btn-sm">
              Responder
            </Link>
          </div>
        </li>
      ))}
    </SecaoFila>
  );
}

const fila: FilaFluxo[] = [
  {
    perfil: 'ESPECIALISTA',
    ordem: 10,
    descricao: 'Consultas dirigidas a você.',
    Secoes: SecaoPareceres,
  },
];
export default fila;
