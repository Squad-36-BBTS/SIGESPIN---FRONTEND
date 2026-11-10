import { useEffect, useState, type ReactNode } from 'react';

import { Campo } from '@/components/common/ui';
import { FormularioConfirmado, type ModalBaseProps } from '@/components/projeto/formulario';
import { projetoService } from '@/services';
import { CRITERIOS_QUALIFICACAO } from '@/utils/constants';

import { SeletorTrl } from './SeletorTrl';

// ---------------- Qualificação (Analista) ----------------

export function QualificacaoModal({ projeto, aberto, onFechar, onFeito }: ModalBaseProps) {
  const vazio = { aderenciaTese: '', relevancia: '', grauInovacao: '', viabilidade: '' };
  const [criterios, setCriterios] = useState(vazio);
  const [trl, setTrl] = useState(projeto.trlAtual);
  const [conclusao, setConclusao] = useState('');
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    if (aberto) {
      setCriterios(vazio);
      setTrl(projeto.trlAtual);
      setConclusao('');
      setErros({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        for (const c of CRITERIOS_QUALIFICACAO) if (criterios[c.chave].trim().length < 5) e[c.chave] = 'Descreva este critério.';
        if (conclusao.trim().length < 20) e.conclusao = 'Escreva a fundamentação e a conclusão (mínimo de 20 caracteres).';
        setErros(e);
        return !Object.keys(e).length;
      }}
      resumo={() => [...CRITERIOS_QUALIFICACAO.map((c) => [c.label, criterios[c.chave]] as [string, ReactNode]), ['Maturidade (TRL)', `TRL ${trl}`], ['Fundamentação e conclusão', conclusao]]}
      aviso="A qualificação registra a análise; não movimenta o Kanban nem altera o TRL do projeto. Para isso, use as ações próprias."
      enviar={async () => {
        await projetoService.qualificar(projeto.id, { ...criterios, trlAvaliado: trl, conclusao });
        return 'Qualificação registrada. Próximo passo: consultar um Especialista, se necessário, ou propor a transição no Kanban.';
      }}
      rotuloConfirmar="Registrar qualificação"
    >
      {() => (
        <>
          {CRITERIOS_QUALIFICACAO.map((c) => (
            <Campo key={c.chave} label={c.label} dica={c.dica} erro={erros[c.chave]} htmlFor={`q-${c.chave}`}>
              <textarea id={`q-${c.chave}`} rows={2} className="input" value={criterios[c.chave]} onChange={(e) => setCriterios({ ...criterios, [c.chave]: e.target.value })} />
            </Campo>
          ))}
          <Campo label="Maturidade avaliada (TRL)" dica="Registro da análise. Para alterar o TRL do projeto, use “Registrar avaliação TRL”.">
            <SeletorTrl valor={trl} onChange={setTrl} atual={projeto.trlAtual} />
          </Campo>
          <Campo label="Fundamentação e conclusão" erro={erros.conclusao} htmlFor="q-conclusao">
            <textarea id="q-conclusao" rows={4} className="input" value={conclusao} onChange={(e) => setConclusao(e.target.value)} />
          </Campo>
        </>
      )}
    </FormularioConfirmado>
  );
}
