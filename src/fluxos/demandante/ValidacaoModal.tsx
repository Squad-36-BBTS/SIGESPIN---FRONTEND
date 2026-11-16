import { useEffect, useState } from 'react';

import { Campo, Selo } from '@/components/common/ui';
import { FormularioConfirmado, Opcoes } from '@/components/projeto/formulario';
import { entregaService } from '@/services';
import type { Entrega, ResultadoValidacao } from '@/types/domain';
import { VALIDACAO_BADGE, VALIDACAO_LABEL } from '@/utils/constants';
import { formatarDataHora } from '@/utils/formatters';

// ---------------- Validação de entrega (Demandante responsável) ----------------
// Cada manifestação gera um novo registro; as validações anteriores são preservadas.

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
  const anterior = entrega.validacoes[0];
  return (
    <FormularioConfirmado
      aberto
      onFechar={onFechar}
      onAtualizar={onFeito}
      titulo={anterior ? 'Nova validação da entrega' : 'Validar entrega'}
      descricao={entrega.projetoTitulo}
      largura="max-w-2xl"
      validar={() => {
        if (!observacoes.trim()) {
          setErro('As observações são obrigatórias.');
          return false;
        }
        return true;
      }}
      resumo={() => [
        ['Entrega', entrega.descricao],
        ['Resultado', VALIDACAO_LABEL[resultado]],
        ['Observações', observacoes],
      ]}
      aviso={anterior ? 'A validação anterior continua registrada; esta será a manifestação mais recente.' : 'A validação fica registrada na entrega. Ela não muda o TRL nem a etapa do Kanban.'}
      enviar={async () => {
        await entregaService.validar(entrega.id, { resultado, observacoes });
        return `Validação registrada (${VALIDACAO_LABEL[resultado].toLowerCase()}). ${entrega.registradaPor.nome} verá o retorno.`;
      }}
      rotuloConfirmar="Registrar validação"
    >
      {() => (
        <>
          <div className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
            <p className="eyebrow">Entrega #{entrega.id} · {entrega.registradaPor.nome}</p>
            <p className="text-slate-700">{entrega.descricao}</p>
            {anterior && (
              <p className="flex flex-wrap items-center gap-2 text-xs text-bb-muted">
                Última validação: <Selo classe={VALIDACAO_BADGE[anterior.resultado]}>{VALIDACAO_LABEL[anterior.resultado]}</Selo> em {formatarDataHora(anterior.em)}
              </p>
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
