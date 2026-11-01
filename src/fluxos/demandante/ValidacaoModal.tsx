import { useEffect, useState } from 'react';

import { Campo } from '@/components/common/ui';
import { FormularioConfirmado, Opcoes } from '@/components/projeto/formulario';
import { entregaService } from '@/services';
import type { Entrega, ResultadoValidacao } from '@/types/domain';
import { VALIDACAO_LABEL } from '@/utils/constants';
import { formatarTamanho } from '@/utils/formatters';

// ---------------- Validação de entrega (Demandante) ----------------

export function ValidacaoModal({ entrega, onFechar, onFeito }: { entrega: Entrega | null; onFechar: () => void; onFeito: () => void }) {
  const [resultado, setResultado] = useState<ResultadoValidacao>('VALIDADA');
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setResultado('VALIDADA');
    setObservacoes('');
    setErro(null);
  }, [entrega]);

  if (!entrega) return null;
  return (
    <FormularioConfirmado
      aberto
      onFechar={onFechar}
      onAtualizar={onFeito}
      titulo={entrega.ehMvp ? 'Validar MVP' : 'Validar entrega'}
      descricao={entrega.titulo}
      largura="max-w-2xl"
      validar={() => {
        const min = resultado === 'VALIDADA' ? 5 : 15;
        if (observacoes.trim().length < min) {
          setErro(resultado === 'VALIDADA' ? 'Escreva as observações.' : 'Explique as ressalvas ou o motivo de não validar.');
          return false;
        }
        return true;
      }}
      resumo={() => [
        ['Entrega', entrega.titulo],
        ['Resultado', VALIDACAO_LABEL[resultado]],
        ['Observações', observacoes],
      ]}
      aviso="A validação fica registrada no histórico da entrega. Ela não muda o TRL nem a etapa do Kanban."
      enviar={async () => {
        await entregaService.validar(entrega.id, { resultado, observacoes });
        return `Validação registrada (${VALIDACAO_LABEL[resultado].toLowerCase()}). Próximo responsável: ${entrega.registradaPor.nome} (Analista).`;
      }}
      rotuloConfirmar="Registrar validação"
    >
      {() => (
        <>
          <div className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
            <p className="text-slate-700">{entrega.descricao}</p>
            {entrega.evidencias.length > 0 && (
              <ul className="text-xs text-bb-muted">
                {entrega.evidencias.map((e) => (
                  <li key={e.id}>
                    {e.nomeArquivo} · {formatarTamanho(e.tamanhoBytes)}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Opcoes
            colunas={3}
            valor={resultado}
            onChange={setResultado}
            opcoes={[
              { v: 'VALIDADA', t: 'Validada', d: 'Resolve o problema apresentado.' },
              { v: 'VALIDADA_COM_RESSALVAS', t: 'Validada com ressalvas', d: 'Atende, com ajustes a considerar.', tom: 'alerta' },
              { v: 'NAO_VALIDADA', t: 'Não validada', d: 'Ainda não atende ao problema.', tom: 'perigo' },
            ]}
          />
          <Campo label="Observações" erro={erro ?? undefined} htmlFor="v-obs">
            <textarea id="v-obs" rows={4} className="input" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
          </Campo>
        </>
      )}
    </FormularioConfirmado>
  );
}
