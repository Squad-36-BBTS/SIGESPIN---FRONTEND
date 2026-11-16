import { ArrowRight, CheckCircle2, Gavel } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Campo } from '@/components/common/ui';
import { nomesEvidencias, SeletorEvidencias } from '@/components/projeto/evidencias';
import { FormularioConfirmado, type ModalBaseProps } from '@/components/projeto/formulario';
import { useAuth } from '@/hooks';
import { projetoService } from '@/services';
import { modoMovimentacao } from '@/utils/permissoes';

// ---------------- Movimentação no Kanban (Analista e Especialista) ----------------
// Ao escolher o destino, a tela oferece movimentação direta ou pedido de avanço conforme perfil e percurso:
// percurso livre → movimentação direta; percurso governado → o Analista solicita o avanço e o Especialista
// move diretamente. Pedido pendente impede qualquer movimentação.

export function MovimentacaoModal({ projeto, aberto, onFechar, onFeito }: ModalBaseProps) {
  const { usuario } = useAuth();
  const opcoes = projeto.transicoesDisponiveis;
  const [transicaoId, setTransicaoId] = useState(0);
  const [justificativa, setJustificativa] = useState('');
  const [evidenciaIds, setEvidenciaIds] = useState<number[]>([]);
  const [erros, setErros] = useState<Record<string, string>>({});
  const t = opcoes.find((x) => x.id === transicaoId);
  const modo = usuario && t ? modoMovimentacao(usuario, t) : null;
  const solicitacao = modo === 'SOLICITACAO';

  useEffect(() => {
    if (aberto) {
      setTransicaoId(opcoes[0]?.id ?? 0);
      setJustificativa('');
      setEvidenciaIds([]);
      setErros({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  return (
    <FormularioConfirmado
      aberto={aberto}
      onFechar={onFechar}
      onAtualizar={onFeito}
      titulo="Movimentar no Kanban"
      descricao={`Percursos configurados a partir de ${projeto.etapa.nome}.`}
      largura="max-w-2xl"
      validar={() => {
        const e: Record<string, string> = {};
        if (!t) e.transicao = 'Escolha o destino.';
        if (!justificativa.trim()) e.justificativa = 'A justificativa é obrigatória.';
        if (solicitacao && !evidenciaIds.length) e.evidencias = 'O pedido de avanço exige ao menos uma evidência do projeto.';
        setErros(e);
        return !Object.keys(e).length;
      }}
      resumo={() => [
        ['Percurso', `${projeto.etapa.nome} → ${t?.destino.nome}`],
        ['Tipo', solicitacao ? 'Pedido de avanço (percurso governado)' : t?.exigeGovernanca ? 'Movimentação direta pelo Especialista (percurso governado)' : 'Movimentação direta (percurso livre)'],
        ['Justificativa', justificativa],
        ...(solicitacao ? ([['Evidências', nomesEvidencias(projeto.evidencias, evidenciaIds)]] as [string, string][]) : []),
      ]}
      aviso={
        solicitacao
          ? `O cartão continua em ${projeto.etapa.nome} até a decisão do Especialista. Só pode haver um pedido pendente por projeto.`
          : usuario?.perfil === 'ESPECIALISTA'
            ? 'A movimentação do Especialista gera uma notificação para todos os perfis.'
            : undefined
      }
      enviar={async () => {
        if (solicitacao) {
          await projetoService.solicitarAvanco(projeto.id, { transicaoId, justificativa, evidenciaIds });
          return `Pedido de avanço enviado. O projeto segue em ${projeto.etapa.nome}. Próximo responsável: Especialista.`;
        }
        const r = await projetoService.moverDireto(projeto.id, { transicaoId, justificativa });
        return `Projeto movido para ${r.destino}.`;
      }}
      rotuloConfirmar={solicitacao ? 'Enviar pedido de avanço' : 'Movimentar'}
    >
      {() => (
        <>
          {opcoes.length === 0 ? (
            <p className="rounded-lg bg-slate-50 p-4 text-sm text-bb-muted">Não há percursos ativos a partir de {projeto.etapa.nome} na configuração atual do quadro.</p>
          ) : (
            <Campo label="Destino" erro={erros.transicao}>
              <div className="grid gap-2 sm:grid-cols-2" role="radiogroup">
                {opcoes.map((o) => {
                  const m = usuario ? modoMovimentacao(usuario, o) : null;
                  return (
                    <label
                      key={o.id}
                      className={`cursor-pointer rounded-xl border p-3 transition focus-within:ring-2 ${transicaoId === o.id ? 'border-bb-blue bg-bb-blue-light ring-1 ring-bb-blue' : 'border-bb-line hover:border-bb-line-2'}`}
                    >
                      <input type="radio" className="sr-only" checked={transicaoId === o.id} onChange={() => setTransicaoId(o.id)} />
                      <span className="flex items-center gap-1.5 text-sm font-bold">
                        {projeto.etapa.nome} <ArrowRight className="h-3.5 w-3.5" /> {o.destino.nome}
                      </span>
                      <span className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${o.exigeGovernanca ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {o.exigeGovernanca ? <Gavel className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                        {o.exigeGovernanca ? 'Governado' : 'Livre'} · {m === 'SOLICITACAO' ? 'pedido de avanço' : 'movimentação direta'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </Campo>
          )}
          <Campo label="Justificativa" erro={erros.justificativa} htmlFor="m-just">
            <textarea id="m-just" rows={4} className="input" value={justificativa} onChange={(e) => setJustificativa(e.target.value)} />
          </Campo>
          {solicitacao && (
            <Campo label="Evidências do projeto">
              <SeletorEvidencias evidencias={projeto.evidencias} valor={evidenciaIds} onChange={setEvidenciaIds} erro={erros.evidencias} />
            </Campo>
          )}
        </>
      )}
    </FormularioConfirmado>
  );
}
