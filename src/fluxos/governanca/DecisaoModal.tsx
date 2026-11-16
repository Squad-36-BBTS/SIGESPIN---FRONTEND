import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Campo } from '@/components/common/ui';
import { FormularioConfirmado, Opcoes } from '@/components/projeto/formulario';
import { governancaService } from '@/services';
import type { SolicitacaoTransicao } from '@/types/domain';
import { formatarTamanho } from '@/utils/formatters';

// ---------------- Decisão de governança (Especialista) ----------------

export function DecisaoModal({ solicitacao, decisaoInicial, onFechar, onFeito }: { solicitacao: SolicitacaoTransicao | null; decisaoInicial: 'APROVADA' | 'REJEITADA'; onFechar: () => void; onFeito: () => void }) {
  const [decisao, setDecisao] = useState(decisaoInicial);
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
      titulo="Decidir transição com governança"
      descricao={s.projetoTitulo}
      largura="max-w-2xl"
      validar={() => {
        if (justificativa.trim().length < 10) {
          setErro('A justificativa da decisão é obrigatória.');
          return false;
        }
        return true;
      }}
      resumo={() => [
        ['Transição', `${s.origem.nome} → ${s.destino.nome}`],
        ['Decisão', decisao === 'APROVADA' ? 'Aprovar' : 'Rejeitar'],
        ['Justificativa', justificativa],
      ]}
      aviso={decisao === 'APROVADA' ? `O projeto passa para ${s.destino.nome} e a movimentação fica no histórico.` : `O projeto permanece em ${s.origem.nome}. O Analista verá a sua justificativa.`}
      enviar={async () => {
        await governancaService.decidir(s.id, { decisao, justificativa });
        return decisao === 'APROVADA'
          ? `Aprovada: projeto movido para ${s.destino.nome}. Próximo responsável: ${s.solicitante.nome} (Analista).`
          : `Rejeitada: projeto mantido em ${s.origem.nome}. ${s.solicitante.nome} (Analista) foi informado.`;
      }}
      rotuloConfirmar={decisao === 'APROVADA' ? 'Confirmar aprovação' : 'Confirmar rejeição'}
      perigo={decisao === 'REJEITADA'}
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
                <ul className="space-y-1">
                  {s.evidencias.map((e) => (
                    <li key={e.id} className="text-slate-700">
                      {e.nomeArquivo} <span className="text-bb-muted">· {formatarTamanho(e.tamanhoBytes)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <Opcoes
            valor={decisao}
            onChange={setDecisao}
            opcoes={[
              { v: 'APROVADA', t: 'Aprovar', d: `Move o projeto para ${s.destino.nome}.` },
              { v: 'REJEITADA', t: 'Rejeitar', d: `Mantém o projeto em ${s.origem.nome}.`, tom: 'perigo' },
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
