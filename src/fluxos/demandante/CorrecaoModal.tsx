import { useEffect, useState } from 'react';

import { Campo } from '@/components/common/ui';
import { SeletorEvidencia } from '@/components/projeto/evidencias';
import { FormularioConfirmado, type ModalBaseProps } from '@/components/projeto/formulario';
import { entregaService } from '@/services';

const MAX_REFERENCIA = 500;

// ---------------- Correção (Demandante responsável) ----------------
// Descrição obrigatória, referência opcional (até 500 caracteres) e uma evidência opcional do próprio projeto.

export function CorrecaoModal({ projeto, aberto, onFechar, onFeito }: ModalBaseProps) {
  const [descricao, setDescricao] = useState('');
  const [referencia, setReferencia] = useState('');
  const [evidenciaId, setEvidenciaId] = useState<number | null>(null);
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    if (aberto) {
      setDescricao('');
      setReferencia('');
      setEvidenciaId(null);
      setErros({});
    }
  }, [aberto]);

  const evidencia = projeto.evidencias.find((e) => e.id === evidenciaId);
  return (
    <FormularioConfirmado
      aberto={aberto}
      onFechar={onFechar}
      onAtualizar={onFeito}
      titulo="Registrar correção"
      descricao={projeto.titulo}
      validar={() => {
        const e: Record<string, string> = {};
        if (!descricao.trim()) e.descricao = 'Descreva a correção.';
        if (referencia.trim().length > MAX_REFERENCIA) e.referencia = `Use até ${MAX_REFERENCIA} caracteres.`;
        setErros(e);
        return !Object.keys(e).length;
      }}
      resumo={() => [
        ['Descrição', descricao],
        ['Referência', referencia.trim() || '—'],
        ['Evidência', evidencia?.nomeArquivo ?? 'Sem evidência'],
      ]}
      aviso="A correção fica registrada com autoria e data e continua consultável mesmo se o projeto for arquivado."
      enviar={async () => {
        await entregaService.registrarCorrecao(projeto.id, { descricao, referencia: referencia.trim() || null, evidenciaId });
        return 'Correção registrada. A equipe verá o registro na aba Correções.';
      }}
      rotuloConfirmar="Registrar correção"
    >
      {() => (
        <>
          <Campo label="Descrição" erro={erros.descricao} htmlFor="c-desc">
            <textarea id="c-desc" rows={4} className="input" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </Campo>
          <Campo label="Referência (opcional)" erro={erros.referencia} dica={`O que está sendo corrigido: uma entrega, um dado do cadastro… ${referencia.trim().length}/${MAX_REFERENCIA}`} htmlFor="c-ref">
            <input id="c-ref" className="input" value={referencia} onChange={(e) => setReferencia(e.target.value)} />
          </Campo>
          <Campo label="Evidência do projeto (opcional)" htmlFor="c-ev">
            <SeletorEvidencia id="c-ev" evidencias={projeto.evidencias} valor={evidenciaId} onChange={setEvidenciaId} />
          </Campo>
        </>
      )}
    </FormularioConfirmado>
  );
}
