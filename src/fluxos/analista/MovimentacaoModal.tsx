import { ArrowRight, CheckCircle2, Gavel } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Anexos, Campo } from '@/components/common/ui';
import { FormularioConfirmado, nomesArquivos, type ModalBaseProps } from '@/components/projeto/formulario';
import { projetoService } from '@/services';

// ---------------- Movimentação do Kanban (Analista) ----------------

export function MovimentacaoModal({ projeto, aberto, onFechar, onFeito }: ModalBaseProps) {
  const opcoes = projeto.transicoesDisponiveis;
  const [transicaoId, setTransicaoId] = useState(0);
  const [justificativa, setJustificativa] = useState('');
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [erros, setErros] = useState<Record<string, string>>({});
  const t = opcoes.find((x) => x.id === transicaoId);

  useEffect(() => {
    if (aberto) {
      setTransicaoId(opcoes[0]?.id ?? 0);
      setJustificativa('');
      setArquivos([]);
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
      descricao="Escolha uma transição permitida pela configuração do Kanban."
      largura="max-w-2xl"
      validar={() => {
        const e: Record<string, string> = {};
        if (!t) e.transicao = 'Escolha a transição.';
        if (justificativa.trim().length < 15) e.justificativa = 'Escreva a justificativa (mínimo de 15 caracteres).';
        if (t?.exigeGovernanca && !arquivos.length) e.arquivos = 'Transições com governança exigem evidências.';
        setErros(e);
        return !Object.keys(e).length;
      }}
      resumo={() => [
        ['Transição', `${projeto.etapa.nome} → ${t?.destino.nome}`],
        ['Governança', t?.exigeGovernanca ? 'Exige decisão de um Especialista' : 'Não exige: a movimentação é imediata'],
        ['Justificativa', justificativa],
        ['Evidências', nomesArquivos(arquivos)],
      ]}
      aviso={t?.exigeGovernanca ? `O projeto continua em ${projeto.etapa.nome} até a decisão. Se rejeitada, a etapa é mantida.` : undefined}
      enviar={async () => {
        const r = await projetoService.movimentar(projeto.id, { transicaoId, justificativa, arquivos });
        return r.resultado === 'MOVIDO'
          ? `Projeto movido para ${r.destino}.`
          : `Solicitação enviada. O projeto segue em ${projeto.etapa.nome}. Próximo responsável: Especialista (governança).`;
      }}
      rotuloConfirmar={t?.exigeGovernanca ? 'Enviar solicitação' : 'Movimentar'}
    >
      {({ falhou, enviando, limparFalha }) => (
        <>
          {opcoes.length === 0 ? (
            <p className="rounded-lg bg-slate-50 p-4 text-sm text-bb-muted">Não há transições ativas a partir de {projeto.etapa.nome} na configuração atual do Kanban.</p>
          ) : (
            <Campo label="Transição" erro={erros.transicao}>
              <div className="grid gap-2 sm:grid-cols-2" role="radiogroup">
                {opcoes.map((o) => (
                  <label
                    key={o.id}
                    className={`cursor-pointer rounded-xl border p-3 transition focus-within:ring-2 ${transicaoId === o.id ? 'border-bb-blue bg-bb-blue-light ring-1 ring-bb-blue' : 'border-bb-line hover:border-bb-line-2'}`}
                  >
                    <input type="radio" className="sr-only" checked={transicaoId === o.id} onChange={() => setTransicaoId(o.id)} />
                    <span className="flex items-center gap-1.5 text-sm font-bold">
                      {projeto.etapa.nome} <ArrowRight className="h-3.5 w-3.5" /> {o.destino.nome}
                    </span>
                    <span className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${o.exigeGovernanca ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {o.exigeGovernanca ? (
                        <>
                          <Gavel className="h-3 w-3" /> Exige governança
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3 w-3" /> Sem governança
                        </>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </Campo>
          )}
          <Campo label="Justificativa" erro={erros.justificativa} htmlFor="m-just">
            <textarea id="m-just" rows={4} className="input" value={justificativa} onChange={(e) => setJustificativa(e.target.value)} />
          </Campo>
          <Campo label={t?.exigeGovernanca ? 'Evidências' : 'Evidências (opcional)'}>
            <Anexos
              arquivos={arquivos}
              onChange={(f) => {
                setArquivos(f);
                limparFalha();
              }}
              erro={erros.arquivos}
              falhou={falhou}
              enviando={enviando}
            />
          </Campo>
        </>
      )}
    </FormularioConfirmado>
  );
}
