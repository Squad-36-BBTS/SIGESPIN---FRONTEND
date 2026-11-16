import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Campo } from '@/components/common/ui';
import { nomesEvidencias, SeletorEvidencias } from '@/components/projeto/evidencias';
import { FormularioConfirmado, type ModalBaseProps } from '@/components/projeto/formulario';
import { projetoService } from '@/services';
import type { ScoresRadar } from '@/types/domain';
import { RADAR_EIXOS } from '@/utils/constants';
import { formatarScore } from '@/utils/formatters';

import { SeletorTrl } from './SeletorTrl';

// ---------------- Avaliação de TRL (Analista e Especialista) ----------------
// Nível de 1 a 9 (pode subir, cair ou se manter), justificativa e ao menos uma evidência do projeto.

const CHAVES_RADAR: (keyof ScoresRadar)[] = ['negocio', 'produto', 'time', 'receita'];

export function AvaliacaoTrlModal({ projeto, aberto, onFechar, onFeito }: ModalBaseProps) {
  const [nivel, setNivel] = useState(projeto.trlAtual);
  const [justificativa, setJustificativa] = useState('');
  const [evidenciaIds, setEvidenciaIds] = useState<number[]>([]);
  const [comRadar, setComRadar] = useState(false);
  const [radar, setRadar] = useState<ScoresRadar>({ negocio: 2, produto: 2, time: 2, receita: 2 });
  const [erros, setErros] = useState<Record<string, string>>({});
  const reducao = nivel < projeto.trlAtual;

  useEffect(() => {
    if (aberto) {
      setNivel(projeto.trlAtual);
      setJustificativa('');
      setEvidenciaIds([]);
      setComRadar(false);
      setErros({});
    }
  }, [aberto, projeto.trlAtual]);

  return (
    <FormularioConfirmado
      aberto={aberto}
      onFechar={onFechar}
      onAtualizar={onFeito}
      titulo="Registrar avaliação TRL"
      descricao="O TRL é um indicador de maturidade: pode subir, cair ou se manter, sempre com justificativa e evidências do projeto."
      largura="max-w-2xl"
      validar={() => {
        const e: Record<string, string> = {};
        if (!justificativa.trim()) e.justificativa = 'A justificativa é obrigatória.';
        if (!evidenciaIds.length) e.evidencias = 'Selecione ao menos uma evidência do projeto.';
        setErros(e);
        return !Object.keys(e).length;
      }}
      resumo={() => [
        ['TRL atual', `TRL ${projeto.trlAtual}`],
        ['Nível registrado', `TRL ${nivel}${reducao ? ' (redução)' : nivel === projeto.trlAtual ? ' (mantido)' : ''}`],
        ['Justificativa', justificativa],
        ['Evidências', nomesEvidencias(projeto.evidencias, evidenciaIds)],
        ['Radar 4D', comRadar ? CHAVES_RADAR.map((k, i) => `${RADAR_EIXOS[i]}: ${formatarScore(radar[k])}`).join(' · ') : 'Sem nova leitura'],
      ]}
      aviso={reducao ? `O TRL será reduzido de ${projeto.trlAtual} para ${nivel}. Os dois níveis ficam no histórico.` : undefined}
      enviar={async () => {
        await projetoService.avaliarTrl(projeto.id, { nivel, justificativa, evidenciaIds, radar: comRadar ? radar : null });
        return nivel === projeto.trlAtual ? `Avaliação registrada. TRL mantido em ${nivel}.` : `TRL alterado de ${projeto.trlAtual} para ${nivel}. A avaliação fica no histórico.`;
      }}
      rotuloConfirmar="Registrar avaliação"
      perigo={reducao}
    >
      {() => (
        <>
          <Campo label={`Nível avaliado (atual: TRL ${projeto.trlAtual})`}>
            <SeletorTrl valor={nivel} onChange={setNivel} atual={projeto.trlAtual} />
          </Campo>
          {reducao && (
            <p className="flex gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900" role="alert">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Redução de TRL {projeto.trlAtual} para {nivel}. Explique o que as evidências mostram.
            </p>
          )}
          <Campo label="Justificativa" erro={erros.justificativa} htmlFor="t-just">
            <textarea id="t-just" rows={4} className="input" placeholder="Que testes, ambientes e resultados sustentam este nível?" value={justificativa} onChange={(e) => setJustificativa(e.target.value)} />
          </Campo>
          <Campo label="Evidências do projeto">
            <SeletorEvidencias evidencias={projeto.evidencias} valor={evidenciaIds} onChange={setEvidenciaIds} erro={erros.evidencias} />
          </Campo>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" className="h-4 w-4 accent-bb-blue" checked={comRadar} onChange={(e) => setComRadar(e.target.checked)} />
              Registrar também uma nova leitura do radar 4D
            </label>
            {comRadar && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {CHAVES_RADAR.map((k, i) => (
                  <div key={k}>
                    <div className="mb-1 flex justify-between text-sm">
                      <label htmlFor={`r-${k}`} className="font-semibold">
                        {RADAR_EIXOS[i]}
                      </label>
                      <span className="font-bold text-bb-blue">{formatarScore(radar[k])}</span>
                    </div>
                    <input id={`r-${k}`} type="range" min={0} max={4} step={0.25} value={radar[k]} onChange={(e) => setRadar({ ...radar, [k]: Number(e.target.value) })} className="w-full accent-bb-blue" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </FormularioConfirmado>
  );
}
