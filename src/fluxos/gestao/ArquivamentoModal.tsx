import { useEffect, useState } from 'react';

import { Campo } from '@/components/common/ui';
import { FormularioConfirmado, type ModalBaseProps } from '@/components/projeto/formulario';
import { projetoService } from '@/services';

// ---------------- Arquivar ou reativar projeto (Especialista) ----------------
// Envia o novo estado, a versão vigente e uma justificativa. Arquivar exige ausência de pedido pendente.
// O projeto arquivado continua consultável; as ações que exigem projeto ativo ficam bloqueadas.

export function ArquivamentoModal({ projeto, aberto, onFechar, onFeito }: ModalBaseProps) {
  const [justificativa, setJustificativa] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const arquivar = !projeto.arquivado;

  useEffect(() => {
    if (aberto) {
      setJustificativa('');
      setErro(null);
    }
  }, [aberto]);

  return (
    <FormularioConfirmado
      aberto={aberto}
      onFechar={onFechar}
      onAtualizar={onFeito}
      titulo={arquivar ? 'Arquivar projeto' : 'Reativar projeto'}
      descricao={`${projeto.titulo} · versão ${projeto.versao}`}
      validar={() => {
        if (!justificativa.trim()) {
          setErro('A justificativa é obrigatória.');
          return false;
        }
        return true;
      }}
      resumo={() => [
        ['Projeto', projeto.titulo],
        ['Novo estado', arquivar ? 'Arquivado' : 'Ativo'],
        ['Justificativa', justificativa],
      ]}
      aviso={
        arquivar
          ? 'Os dados continuam consultáveis, inclusive entregas, validações e correções. Qualificação, consultas, TRL, movimentação, entregas e correções ficam bloqueadas até a reativação.'
          : 'As ações que exigem projeto ativo voltam a ficar disponíveis.'
      }
      enviar={async () => {
        await projetoService.alterarArquivamento(projeto.id, { arquivado: arquivar, versao: projeto.versao, justificativa });
        return arquivar ? 'Projeto arquivado. O registro entrou no histórico de gestão.' : 'Projeto reativado. O registro entrou no histórico de gestão.';
      }}
      rotuloConfirmar={arquivar ? 'Confirmar arquivamento' : 'Confirmar reativação'}
      perigo={arquivar}
    >
      {() => (
        <Campo label={arquivar ? 'Motivo do arquivamento' : 'Justificativa da reativação'} erro={erro ?? undefined} htmlFor="a-just">
          <textarea id="a-just" rows={4} className="input" value={justificativa} onChange={(e) => setJustificativa(e.target.value)} />
        </Campo>
      )}
    </FormularioConfirmado>
  );
}
