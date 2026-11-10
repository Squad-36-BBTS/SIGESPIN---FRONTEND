import { useEffect, useState } from 'react';

import { Anexos, Campo } from '@/components/common/ui';
import { FormularioConfirmado, nomesArquivos } from '@/components/projeto/formulario';
import { parecerService } from '@/services';
import type { ConsultaEspecialista } from '@/types/domain';

// ---------------- Parecer técnico (Especialista) ----------------

export function ParecerModal({ consulta, onFechar, onFeito }: { consulta: ConsultaEspecialista | null; onFechar: () => void; onFeito: () => void }) {
  const [fundamentacao, setFundamentacao] = useState('');
  const [conclusao, setConclusao] = useState('');
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    setFundamentacao('');
    setConclusao('');
    setArquivos([]);
    setErros({});
  }, [consulta]);

  if (!consulta) return null;
  return (
    <FormularioConfirmado
      aberto
      onFechar={onFechar}
      onAtualizar={onFeito}
      titulo="Emitir parecer técnico"
      descricao={consulta.projetoTitulo}
      largura="max-w-2xl"
      validar={() => {
        const e: Record<string, string> = {};
        if (fundamentacao.trim().length < 20) e.fundamentacao = 'Escreva a fundamentação (mínimo de 20 caracteres).';
        if (conclusao.trim().length < 10) e.conclusao = 'Escreva a conclusão.';
        setErros(e);
        return !Object.keys(e).length;
      }}
      resumo={() => [
        ['Pergunta', consulta.pergunta],
        ['Fundamentação', fundamentacao],
        ['Conclusão', conclusao],
        ['Evidências técnicas', nomesArquivos(arquivos)],
      ]}
      aviso="O parecer subsidia a análise do Analista. Ele não aprova transições do Kanban."
      enviar={async () => {
        await parecerService.responder(consulta.id, { fundamentacao, conclusao, arquivos });
        return `Parecer enviado. Próximo responsável: ${consulta.solicitante.nome} (Analista).`;
      }}
      rotuloConfirmar="Enviar parecer"
    >
      {({ falhou, enviando, limparFalha }) => (
        <>
          <div className="rounded-lg bg-slate-50 p-3 text-sm">
            <p className="eyebrow mb-1">Pergunta de {consulta.solicitante.nome}</p>
            <p className="text-slate-700">{consulta.pergunta}</p>
          </div>
          <Campo label="Fundamentação" erro={erros.fundamentacao} htmlFor="p-fund">
            <textarea id="p-fund" rows={5} className="input" value={fundamentacao} onChange={(e) => setFundamentacao(e.target.value)} />
          </Campo>
          <Campo label="Conclusão" erro={erros.conclusao} htmlFor="p-conc">
            <textarea id="p-conc" rows={2} className="input" value={conclusao} onChange={(e) => setConclusao(e.target.value)} />
          </Campo>
          <Campo label="Evidências técnicas (opcional)">
            <Anexos
              arquivos={arquivos}
              onChange={(f) => {
                setArquivos(f);
                limparFalha();
              }}
              falhou={falhou}
              enviando={enviando}
            />
          </Campo>
        </>
      )}
    </FormularioConfirmado>
  );
}
