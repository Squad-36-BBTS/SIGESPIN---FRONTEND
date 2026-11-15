import { useEffect, useState } from 'react';

import { Campo } from '@/components/common/ui';
import { FormularioConfirmado } from '@/components/projeto/formulario';
import { recomendacaoService } from '@/services';
import type { Recomendacao } from '@/types/domain';

// ---------------- Recusar recomendação (Demandante destinatário) ----------------

export function RecusarModal({ recomendacao, onFechar, onFeito }: { recomendacao: Recomendacao | null; onFechar: () => void; onFeito: () => void }) {
  const [justificativa, setJustificativa] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setJustificativa('');
    setErro(null);
  }, [recomendacao]);

  if (!recomendacao) return null;
  const r = recomendacao;
  return (
    <FormularioConfirmado
      aberto
      onFechar={onFechar}
      onAtualizar={onFeito}
      titulo="Recusar recomendação"
      descricao={r.titulo}
      validar={() => {
        if (!justificativa.trim()) {
          setErro('A recusa exige justificativa.');
          return false;
        }
        return true;
      }}
      resumo={() => [
        ['Recomendação', r.titulo],
        ['De', r.autor.nome],
        ['Justificativa', justificativa],
      ]}
      aviso="A recusa é um estado final: a recomendação não poderá mais ser convertida."
      enviar={async () => {
        await recomendacaoService.recusar(r.id, { justificativa });
        return `Recomendação recusada. ${r.autor.nome} verá a sua resposta.`;
      }}
      rotuloConfirmar="Confirmar recusa"
      perigo
    >
      {() => (
        <>
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{r.descricao}</div>
          <Campo label="Justificativa" erro={erro ?? undefined} htmlFor="rr-just">
            <textarea id="rr-just" rows={4} className="input" value={justificativa} onChange={(e) => setJustificativa(e.target.value)} />
          </Campo>
        </>
      )}
    </FormularioConfirmado>
  );
}
