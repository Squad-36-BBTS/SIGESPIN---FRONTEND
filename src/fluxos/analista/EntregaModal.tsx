import { useEffect, useState } from 'react';

import { Campo } from '@/components/common/ui';
import { FormularioConfirmado, type ModalBaseProps } from '@/components/projeto/formulario';
import { entregaService } from '@/services';

// ---------------- Submeter entrega (Analista e Especialista) ----------------
// Só a descrição é obrigatória. O registro guarda projeto, autor e data.

export function EntregaModal({ projeto, aberto, onFechar, onFeito }: ModalBaseProps) {
  const [descricao, setDescricao] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (aberto) {
      setDescricao('');
      setErro(null);
    }
  }, [aberto]);

  const demandante = projeto.demandante?.nome ?? 'o Demandante responsável';
  return (
    <FormularioConfirmado
      aberto={aberto}
      onFechar={onFechar}
      onAtualizar={onFeito}
      titulo="Submeter entrega"
      descricao="A entrega segue para validação do Demandante responsável pelo projeto."
      validar={() => {
        if (!descricao.trim()) {
          setErro('Descreva a entrega.');
          return false;
        }
        return true;
      }}
      resumo={() => [
        ['Projeto', projeto.titulo],
        ['Descrição', descricao],
      ]}
      aviso="A validação do Demandante não muda o TRL nem a etapa do Kanban."
      enviar={async () => {
        await entregaService.registrar(projeto.id, { descricao });
        return `Entrega submetida. Próximo responsável: ${demandante} (validação).`;
      }}
      rotuloConfirmar="Submeter entrega"
    >
      {() => (
        <Campo label="Descrição" erro={erro ?? undefined} htmlFor="e-desc">
          <textarea id="e-desc" rows={5} className="input" placeholder="O que foi entregue, onde está disponível e o que o Demandante deve verificar." value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </Campo>
      )}
    </FormularioConfirmado>
  );
}
