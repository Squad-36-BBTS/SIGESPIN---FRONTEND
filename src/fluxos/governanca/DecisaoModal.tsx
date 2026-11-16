import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Campo } from '@/components/common/ui';
import { ListaEvidencias } from '@/components/projeto/evidencias';
import { FormularioConfirmado, Opcoes } from '@/components/projeto/formulario';
import { governancaService } from '@/services';
import type { DecisaoRequest, SolicitacaoTransicao } from '@/types/domain';

type Decisao = DecisaoRequest['decisao'];

// ---------------- Decisão de avanço (Especialista) ----------------
// Aprovar revalida o percurso e muda a etapa. Rejeitar encerra o pedido sem mover o projeto.

export function DecisaoModal({ solicitacao, decisaoInicial, onFechar, onFeito }: { solicitacao: SolicitacaoTransicao | null; decisaoInicial: Decisao; onFechar: () => void; onFeito: () => void }) {
  const [decisao, setDecisao] = useState<Decisao>(decisaoInicial);
  const [justificativa, setJustificativa] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setDecisao(decisaoInicial);
    setJustificativa('');
    setErro(null);
  }, [solicitacao, decisaoInicial]);

  if (!solicitacao) return null;
  const s = solicitacao;
  return (
    <FormularioConfirmado
      aberto
      onFechar={onFechar}
      onAtualizar={onFeito}
      titulo="Decidir pedido de avanço"
      descricao={s.projetoTitulo}
      largura="max-w-2xl"
      validar={() => {
        if (!justificativa.trim()) {
          setErro('A justificativa da decisão é obrigatória.');
          return false;
        }
        return true;
      }}
      resumo={() => [
        ['Percurso', `${s.origem.nome} → ${s.destino.nome}`],
        ['Decisão', decisao === 'APROVAR' ? 'Aprovar' : 'Rejeitar'],
        ['Justificativa', justificativa],
      ]}
      aviso={
        decisao === 'APROVAR'
          ? `O percurso é revalidado; o projeto passa para ${s.destino.nome} e todos os perfis recebem uma notificação.`
          : `O projeto permanece em ${s.origem.nome}. ${s.solicitante.nome} verá a sua justificativa.`
      }
      enviar={async () => {
        await governancaService.decidir(s.id, { decisao, justificativa });
        return decisao === 'APROVAR'
          ? `Aprovado: projeto movido para ${s.destino.nome}. Próximo responsável: ${s.solicitante.nome} (Analista).`
          : `Rejeitado: projeto mantido em ${s.origem.nome}. ${s.solicitante.nome} (Analista) foi informado.`;
      }}
      rotuloConfirmar={decisao === 'APROVAR' ? 'Confirmar aprovação' : 'Confirmar rejeição'}
      perigo={decisao === 'REJEITAR'}
    >
      {() => (
        <>
          <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
            <p className="flex items-center gap-2 font-bold">
              {s.origem.nome} <ArrowRight className="h-4 w-4 text-bb-muted" /> {s.destino.nome}
            </p>
            <div>
              <p className="eyebrow mb-1">Justificativa de {s.solicitante.nome}</p>
              <p className="text-slate-700">{s.justificativa}</p>
            </div>
            {s.evidencias.length > 0 && (
              <div>
                <p className="eyebrow mb-1">Evidências</p>
                <ListaEvidencias evidencias={s.evidencias} />
              </div>
            )}
          </div>
          <Opcoes
            valor={decisao}
            onChange={setDecisao}
            opcoes={[
              { v: 'APROVAR', t: 'Aprovar', d: `Move o projeto para ${s.destino.nome}.` },
              { v: 'REJEITAR', t: 'Rejeitar', d: `Mantém o projeto em ${s.origem.nome}.`, tom: 'perigo' },
            ]}
          />
          <Campo label="Justificativa da decisão" erro={erro ?? undefined} htmlFor="d-just">
            <textarea id="d-just" rows={4} className="input" value={justificativa} onChange={(e) => setJustificativa(e.target.value)} />
          </Campo>
        </>
      )}
    </FormularioConfirmado>
  );
}
