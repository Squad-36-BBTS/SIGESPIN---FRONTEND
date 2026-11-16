import { useEffect, useState } from 'react';

import { Campo } from '@/components/common/ui';
import { nomesEvidencias, SeletorEvidencias } from '@/components/projeto/evidencias';
import { FormularioConfirmado } from '@/components/projeto/formulario';
import { parecerService } from '@/services';
import type { ConsultaEspecialista, Evidencia } from '@/types/domain';

// ---------------- Parecer técnico (Especialista) ----------------
// Independente (sem consulta) ou em resposta a uma consulta do projeto dirigida a quem emite.
// Fundamentação e conclusão são obrigatórias; as evidências do projeto são opcionais (a lista pode ficar vazia).

export interface AlvoParecer {
  projetoId: number;
  projetoTitulo: string;
  evidencias: Evidencia[];
  consulta: ConsultaEspecialista | null;
}

export function ParecerModal({ alvo, onFechar, onFeito }: { alvo: AlvoParecer | null; onFechar: () => void; onFeito: () => void }) {
  const [fundamentacao, setFundamentacao] = useState('');
  const [conclusao, setConclusao] = useState('');
  const [evidenciaIds, setEvidenciaIds] = useState<number[]>([]);
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    setFundamentacao('');
    setConclusao('');
    setEvidenciaIds([]);
    setErros({});
  }, [alvo]);

  if (!alvo) return null;
  const c = alvo.consulta;
  return (
    <FormularioConfirmado
      aberto
      onFechar={onFechar}
      onAtualizar={onFeito}
      titulo={c ? 'Responder consulta com parecer' : 'Emitir parecer independente'}
      descricao={alvo.projetoTitulo}
      largura="max-w-2xl"
      validar={() => {
        const e: Record<string, string> = {};
        if (!fundamentacao.trim()) e.fundamentacao = 'A fundamentação é obrigatória.';
        if (!conclusao.trim()) e.conclusao = 'A conclusão é obrigatória.';
        setErros(e);
        return !Object.keys(e).length;
      }}
      resumo={() => [
        ['Tipo', c ? `Resposta à consulta de ${c.solicitante.nome}` : 'Parecer independente'],
        ...(c ? ([['Questão', c.questao]] as [string, string][]) : []),
        ['Fundamentação', fundamentacao],
        ['Conclusão', conclusao],
        ['Evidências', nomesEvidencias(alvo.evidencias, evidenciaIds)],
      ]}
      aviso="O parecer e o conjunto de evidências ficam preservados depois do registro. Ele subsidia a análise; não é decisão de governança."
      enviar={async () => {
        await parecerService.emitir(alvo.projetoId, { consultaId: c?.id ?? null, fundamentacao, conclusao, evidenciaIds });
        return c ? `Parecer enviado. Próximo responsável: ${c.solicitante.nome} (Analista).` : 'Parecer independente registrado no projeto.';
      }}
      rotuloConfirmar="Registrar parecer"
    >
      {() => (
        <>
          {c && (
            <div className="rounded-lg bg-slate-50 p-3 text-sm">
              <p className="eyebrow mb-1">Questão de {c.solicitante.nome}</p>
              <p className="text-slate-700">{c.questao}</p>
            </div>
          )}
          <Campo label="Fundamentação" erro={erros.fundamentacao} htmlFor="p-fund">
            <textarea id="p-fund" rows={5} className="input" value={fundamentacao} onChange={(e) => setFundamentacao(e.target.value)} />
          </Campo>
          <Campo label="Conclusão" erro={erros.conclusao} htmlFor="p-conc">
            <textarea id="p-conc" rows={2} className="input" value={conclusao} onChange={(e) => setConclusao(e.target.value)} />
          </Campo>
          <Campo label="Evidências do projeto (opcional)">
            <SeletorEvidencias evidencias={alvo.evidencias} valor={evidenciaIds} onChange={setEvidenciaIds} />
          </Campo>
        </>
      )}
    </FormularioConfirmado>
  );
}
