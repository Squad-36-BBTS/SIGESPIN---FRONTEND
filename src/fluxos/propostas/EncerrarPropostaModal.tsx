import { useEffect, useState } from 'react';

import { Campo } from '@/components/common/ui';
import { FormularioConfirmado, Opcoes } from '@/components/projeto/formulario';
import { propostaService } from '@/services';
import type { PropostaConfiguracao } from '@/types/domain';

export type Encerramento = 'APROVAR' | 'REJEITAR' | 'CANCELAR';

// ---------------- Decidir ou cancelar proposta de configuração ----------------
// Decidir: Especialista. Cancelar: o Analista que propôs ou o Especialista. A aprovação aplica a
// configuração depois de revalidá-la; rejeição e cancelamento preservam a proposta sem aplicá-la.

export function EncerrarPropostaModal({ alvo, descricao, onFechar, onFeito }: { alvo: { p: PropostaConfiguracao; acao: Encerramento } | null; descricao: string; onFechar: () => void; onFeito: () => void }) {
  const [acao, setAcao] = useState<Encerramento>('APROVAR');
  const [justificativa, setJustificativa] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setAcao(alvo?.acao ?? 'APROVAR');
    setJustificativa('');
    setErro(null);
  }, [alvo]);

  if (!alvo) return null;
  const { p } = alvo;
  const cancelar = acao === 'CANCELAR';
  return (
    <FormularioConfirmado
      aberto
      onFechar={onFechar}
      onAtualizar={onFeito}
      titulo={cancelar ? 'Cancelar proposta' : 'Decidir proposta'}
      descricao={descricao}
      validar={() => {
        if (!justificativa.trim()) {
          setErro('A justificativa é obrigatória.');
          return false;
        }
        return true;
      }}
      resumo={() => [
        ['Proposta', descricao],
        ['Ação', acao === 'APROVAR' ? 'Aprovar e aplicar' : acao === 'REJEITAR' ? 'Rejeitar' : 'Cancelar'],
        ['Justificativa', justificativa],
      ]}
      aviso={acao === 'APROVAR' ? 'A configuração é revalidada e aplicada ao quadro agora.' : 'A proposta fica registrada, sem alterar o quadro.'}
      enviar={async () => {
        if (cancelar) await propostaService.cancelar(p.id, { justificativa });
        else await propostaService.decidir(p.id, { decisao: acao, justificativa });
        return acao === 'APROVAR' ? 'Proposta aprovada e aplicada ao quadro.' : acao === 'REJEITAR' ? 'Proposta rejeitada.' : 'Proposta cancelada.';
      }}
      rotuloConfirmar={acao === 'APROVAR' ? 'Confirmar aprovação' : acao === 'REJEITAR' ? 'Confirmar rejeição' : 'Confirmar cancelamento'}
      perigo={acao !== 'APROVAR'}
    >
      {() => (
        <>
          <div className="rounded-xl bg-slate-50 p-4 text-sm">
            <p className="eyebrow mb-1">Justificativa de {p.autor.nome}</p>
            <p className="text-slate-700">{p.justificativa}</p>
          </div>
          {!cancelar && (
            <Opcoes
              valor={acao}
              onChange={setAcao}
              opcoes={[
                { v: 'APROVAR', t: 'Aprovar', d: 'Aplica a configuração ao quadro.' },
                { v: 'REJEITAR', t: 'Rejeitar', d: 'Mantém o quadro como está.', tom: 'perigo' },
              ]}
            />
          )}
          <Campo label="Justificativa" erro={erro ?? undefined} htmlFor="ep-just">
            <textarea id="ep-just" rows={3} className="input" value={justificativa} onChange={(e) => setJustificativa(e.target.value)} />
          </Campo>
        </>
      )}
    </FormularioConfirmado>
  );
}
