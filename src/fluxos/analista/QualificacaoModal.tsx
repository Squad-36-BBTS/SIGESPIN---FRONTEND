import { useEffect, useState, type ReactNode } from 'react';

import { Campo } from '@/components/common/ui';
import { FormularioConfirmado, type ModalBaseProps } from '@/components/projeto/formulario';
import { projetoService } from '@/services';
import type { QualificacaoRequest } from '@/types/domain';
import { CRITERIOS_QUALIFICACAO } from '@/utils/constants';

// ---------------- Qualificação (Analista) ----------------
// Sete textos obrigatórios. Cada qualificação é um novo registro com autoria e data; o histórico é preservado.

const VAZIO: QualificacaoRequest = { aderenciaTese: '', relevancia: '', grauInovacao: '', viabilidade: '', maturidadeTecnologica: '', fundamentacao: '', conclusao: '' };

export function QualificacaoModal({ projeto, aberto, onFechar, onFeito }: ModalBaseProps) {
  const [form, setForm] = useState<QualificacaoRequest>(VAZIO);
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    if (aberto) {
      setForm(VAZIO);
      setErros({});
    }
  }, [aberto]);

  return (
    <FormularioConfirmado
      aberto={aberto}
      onFechar={onFechar}
      onAtualizar={onFeito}
      titulo={projeto.qualificacoes.length ? 'Nova qualificação' : 'Qualificar demanda'}
      descricao={`${projeto.titulo}${projeto.qualificacoes.length ? ' · as qualificações anteriores ficam no histórico' : ''}`}
      largura="max-w-2xl"
      validar={() => {
        const e: Record<string, string> = {};
        for (const c of CRITERIOS_QUALIFICACAO) if (!form[c.chave].trim()) e[c.chave] = 'Campo obrigatório.';
        setErros(e);
        return !Object.keys(e).length;
      }}
      resumo={() => CRITERIOS_QUALIFICACAO.map((c) => [c.label, form[c.chave]] as [string, ReactNode])}
      aviso="A qualificação registra a análise. Ela não movimenta o Kanban nem altera o TRL do projeto."
      enviar={async () => {
        await projetoService.qualificar(projeto.id, form);
        return 'Qualificação registrada. Próximo passo: consultar um Especialista, registrar o TRL ou movimentar no Kanban.';
      }}
      rotuloConfirmar="Registrar qualificação"
    >
      {() => (
        <>
          {CRITERIOS_QUALIFICACAO.map((c) => (
            <Campo key={c.chave} label={c.label} dica={c.dica} erro={erros[c.chave]} htmlFor={`q-${c.chave}`}>
              <textarea id={`q-${c.chave}`} rows={c.chave === 'fundamentacao' || c.chave === 'conclusao' ? 3 : 2} className="input" value={form[c.chave]} onChange={(e) => setForm({ ...form, [c.chave]: e.target.value })} />
            </Campo>
          ))}
        </>
      )}
    </FormularioConfirmado>
  );
}
