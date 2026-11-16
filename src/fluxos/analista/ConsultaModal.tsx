import { useEffect, useState } from 'react';

import { Campo } from '@/components/common/ui';
import { FormularioConfirmado, type ModalBaseProps } from '@/components/projeto/formulario';
import { parecerService, usuarioService } from '@/services';
import type { Usuario } from '@/types/domain';
import { rotuloUsuario } from '@/utils/constants';

// ---------------- Consulta a Especialista (Analista) ----------------
// O Analista escolhe um Especialista ativo; só ele responde. Pode ser aberta antes da qualificação.

export function ConsultaModal({ projeto, aberto, onFechar, onFeito }: ModalBaseProps) {
  const [especialistas, setEspecialistas] = useState<Usuario[]>([]);
  const [especialistaId, setEspecialistaId] = useState(0);
  const [questao, setQuestao] = useState('');
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!aberto) return;
    setEspecialistaId(0);
    setQuestao('');
    setErros({});
    usuarioService.listar('ESPECIALISTA').then(setEspecialistas).catch(() => setEspecialistas([]));
  }, [aberto]);

  const destinatario = especialistas.find((x) => x.id === especialistaId);
  return (
    <FormularioConfirmado
      aberto={aberto}
      onFechar={onFechar}
      onAtualizar={onFeito}
      titulo="Consultar Especialista"
      descricao="Questão dirigida para subsidiar a análise. O parecer não equivale a uma decisão de governança."
      validar={() => {
        const e: Record<string, string> = {};
        if (!especialistaId) e.especialistaId = 'Escolha o Especialista.';
        if (!questao.trim()) e.questao = 'Escreva a questão.';
        setErros(e);
        return !Object.keys(e).length;
      }}
      resumo={() => [
        ['Destinatário', destinatario ? `${destinatario.nome} · ${rotuloUsuario(destinatario)}` : '—'],
        ['Questão', questao],
      ]}
      aviso={projeto.qualificacoes.length ? undefined : 'A consulta pode ser aberta antes da qualificação.'}
      enviar={async () => {
        await parecerService.consultar(projeto.id, { especialistaId, questao });
        return `Consulta enviada. Próximo responsável: ${destinatario?.nome} (Especialista).`;
      }}
      rotuloConfirmar="Enviar consulta"
    >
      {() => (
        <>
          <Campo label="Especialista" erro={erros.especialistaId} htmlFor="c-esp">
            <select id="c-esp" className="input" value={especialistaId} onChange={(e) => setEspecialistaId(Number(e.target.value))}>
              <option value={0}>Selecione…</option>
              {especialistas.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.nome} · {x.areaTecnica ?? 'Especialista'}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Questão" erro={erros.questao} htmlFor="c-quest">
            <textarea id="c-quest" rows={4} className="input" value={questao} onChange={(e) => setQuestao(e.target.value)} />
          </Campo>
        </>
      )}
    </FormularioConfirmado>
  );
}
