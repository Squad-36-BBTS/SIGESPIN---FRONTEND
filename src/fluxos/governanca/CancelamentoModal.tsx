import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Campo } from '@/components/common/ui';
import { FormularioConfirmado } from '@/components/projeto/formulario';
import { governancaService } from '@/services';
import type { SolicitacaoTransicao } from '@/types/domain';

// ---------------- Cancelar pedido de avanço ----------------
// O Analista cancela o pedido que abriu; o Especialista cancela qualquer pedido pendente. O cartão fica onde está.

export function CancelamentoModal({ solicitacao, onFechar, onFeito }: { solicitacao: SolicitacaoTransicao | null; onFechar: () => void; onFeito: () => void }) {
  const [justificativa, setJustificativa] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setJustificativa('');
    setErro(null);
  }, [solicitacao]);

  if (!solicitacao) return null;
  const s = solicitacao;
  return (
    <FormularioConfirmado
      aberto
      onFechar={onFechar}
      onAtualizar={onFeito}
      titulo="Cancelar pedido de avanço"
      descricao={s.projetoTitulo}
      validar={() => {
        if (!justificativa.trim()) {
          setErro('O cancelamento exige justificativa.');
          return false;
        }
        return true;
      }}
      resumo={() => [
        ['Percurso', `${s.origem.nome} → ${s.destino.nome}`],
        ['Aberto por', s.solicitante.nome],
        ['Justificativa', justificativa],
      ]}
      aviso={`O projeto continua em ${s.origem.nome}. O pedido fica no histórico como cancelado.`}
      enviar={async () => {
        await governancaService.cancelar(s.id, { justificativa });
        return `Pedido cancelado. O projeto segue em ${s.origem.nome}.`;
      }}
      rotuloConfirmar="Confirmar cancelamento"
      perigo
    >
      {() => (
        <>
          <p className="flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm font-bold">
            {s.origem.nome} <ArrowRight className="h-4 w-4 text-bb-muted" /> {s.destino.nome}
          </p>
          <Campo label="Justificativa do cancelamento" erro={erro ?? undefined} htmlFor="cn-just">
            <textarea id="cn-just" rows={3} className="input" value={justificativa} onChange={(e) => setJustificativa(e.target.value)} />
          </Campo>
        </>
      )}
    </FormularioConfirmado>
  );
}
