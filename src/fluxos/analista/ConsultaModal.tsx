import { useEffect, useState } from 'react';

import { Campo } from '@/components/common/ui';
import { FormularioConfirmado, type ModalBaseProps } from '@/components/projeto/formulario';
import { parecerService, usuarioService } from '@/services';
import type { Usuario } from '@/types/domain';

// ---------------- Consulta a Especialista (Analista) ----------------

export function ConsultaModal({ projeto, aberto, onFechar, onFeito }: ModalBaseProps) {
  const [especialistas, setEspecialistas] = useState<Usuario[]>([]);
  const [area, setArea] = useState('');
  const [especialistaId, setEspecialistaId] = useState(0);
  const [pergunta, setPergunta] = useState('');
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!aberto) return;
    setArea('');
    setEspecialistaId(0);
    setPergunta('');
    setErros({});
    usuarioService.especialistas().then(setEspecialistas).catch(() => setEspecialistas([]));
  }, [aberto]);

  const areas = [...new Set(especialistas.map((x) => x.areaTecnica).filter(Boolean) as string[])].sort();
  const daArea = especialistas.filter((x) => x.areaTecnica === area);
  const destinatario = especialistaId ? daArea.find((x) => x.id === especialistaId)?.nome : `Qualquer especialista de ${area}`;

  return (
    <FormularioConfirmado
      aberto={aberto}
      onFechar={onFechar}
      onAtualizar={onFeito}
      titulo="Consultar Especialista"
      descricao="Pergunta dirigida para subsidiar a análise. O parecer não equivale a uma decisão de governança."
      validar={() => {
        const e: Record<string, string> = {};
        if (!area) e.area = 'Selecione a área técnica.';
        if (pergunta.trim().length < 15) e.pergunta = 'Escreva uma pergunta dirigida (mínimo de 15 caracteres).';
        setErros(e);
        return !Object.keys(e).length;
      }}
      resumo={() => [
        ['Destinatário', destinatario],
        ['Pergunta', pergunta],
      ]}
      enviar={async () => {
        await parecerService.consultar(projeto.id, { areaTecnica: area, especialistaId: especialistaId || null, pergunta });
        return `Consulta enviada. Próximo responsável: ${destinatario}.`;
      }}
      rotuloConfirmar="Enviar consulta"
    >
      {() => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Área técnica" erro={erros.area} htmlFor="c-area">
              <select
                id="c-area"
                className="input"
                value={area}
                onChange={(e) => {
                  setArea(e.target.value);
                  setEspecialistaId(0);
                }}
              >
                <option value="">Selecione…</option>
                {areas.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Especialista" dica="Opcional: sem escolha, qualquer especialista da área responde." htmlFor="c-esp">
              <select id="c-esp" className="input" value={especialistaId} onChange={(e) => setEspecialistaId(Number(e.target.value))} disabled={!area}>
                <option value={0}>Qualquer especialista da área</option>
                {daArea.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.nome}
                  </option>
                ))}
              </select>
            </Campo>
          </div>
          <Campo label="Pergunta" erro={erros.pergunta} htmlFor="c-perg">
            <textarea id="c-perg" rows={4} className="input" value={pergunta} onChange={(e) => setPergunta(e.target.value)} />
          </Campo>
        </>
      )}
    </FormularioConfirmado>
  );
}
