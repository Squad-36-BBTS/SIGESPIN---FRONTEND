import { useEffect, useState } from 'react';

import { Anexos, Campo } from '@/components/common/ui';
import { FormularioConfirmado, nomesArquivos, type ModalBaseProps } from '@/components/projeto/formulario';
import { entregaService } from '@/services';

// ---------------- Entrega (Analista) ----------------

export function EntregaModal({ projeto, aberto, onFechar, onFeito }: ModalBaseProps) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [ehMvp, setEhMvp] = useState(false);
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    if (aberto) {
      setTitulo('');
      setDescricao('');
      setEhMvp(false);
      setArquivos([]);
      setErros({});
    }
  }, [aberto]);

  const demandante = projeto.demandante?.nome ?? 'o demandante';
  return (
    <FormularioConfirmado
      aberto={aberto}
      onFechar={onFechar}
      onAtualizar={onFeito}
      titulo="Publicar entrega"
      descricao="A entrega segue para validação do demandante."
      largura="max-w-xl"
      validar={() => {
        const e: Record<string, string> = {};
        if (titulo.trim().length < 5) e.titulo = 'Informe o título.';
        if (descricao.trim().length < 15) e.descricao = 'Descreva o que foi entregue.';
        setErros(e);
        return !Object.keys(e).length;
      }}
      resumo={() => [
        ['Tipo', ehMvp ? 'MVP' : 'Entrega'],
        ['Título', titulo],
        ['Descrição', descricao],
        ['Evidências', nomesArquivos(arquivos)],
      ]}
      aviso="A validação do demandante não muda o TRL nem a etapa do Kanban."
      enviar={async () => {
        await entregaService.registrar(projeto.id, { titulo, descricao, ehMvp, arquivos });
        return `Entrega publicada. Próximo responsável: ${demandante} (validação).`;
      }}
      rotuloConfirmar="Publicar e encaminhar"
    >
      {({ falhou, enviando, limparFalha }) => (
        <>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" className="h-4 w-4 accent-bb-blue" checked={ehMvp} onChange={(e) => setEhMvp(e.target.checked)} />
            Esta entrega é um MVP
          </label>
          <Campo label="Título" erro={erros.titulo} htmlFor="e-tit">
            <input id="e-tit" className="input" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </Campo>
          <Campo label="Descrição" erro={erros.descricao} htmlFor="e-desc">
            <textarea id="e-desc" rows={4} className="input" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </Campo>
          <Campo label="Arquivos e evidências">
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
