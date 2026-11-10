import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Anexos, Campo } from '@/components/common/ui';
import { FormularioConfirmado, nomesArquivos, type ModalBaseProps } from '@/components/projeto/formulario';
import { projetoService } from '@/services';
import type { ScoresRadar } from '@/types/domain';
import { RADAR_EIXOS } from '@/utils/constants';
import { formatarScore } from '@/utils/formatters';

import { SeletorTrl } from './SeletorTrl';

// ---------------- Avaliação de TRL (Analista) ----------------

const CHAVES_RADAR: (keyof ScoresRadar)[] = ['negocio', 'produto', 'time', 'receita'];

export function AvaliacaoTrlModal({ projeto, aberto, onFechar, onFeito }: ModalBaseProps) {
  const [trl, setTrl] = useState(projeto.trlAtual);
  const [justificativa, setJustificativa] = useState('');
  const [comRadar, setComRadar] = useState(false);
  const [radar, setRadar] = useState<ScoresRadar>({ negocio: 2, produto: 2, time: 2, receita: 2 });
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [erros, setErros] = useState<Record<string, string>>({});
  const reducao = trl < projeto.trlAtual;

  useEffect(() => {
    if (aberto) {
      setTrl(projeto.trlAtual);
      setJustificativa('');
      setArquivos([]);
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
      descricao="O TRL é um indicador de maturidade: pode subir ou descer, sempre com fundamentação e evidências."
      largura="max-w-2xl"
      validar={() => {
        const e: Record<string, string> = {};
        const min = reducao ? 40 : 20;
        if (justificativa.trim().length < min) e.justificativa = reducao ? 'Uma redução exige fundamentação detalhada (mínimo de 40 caracteres).' : 'Descreva os resultados que fundamentam a avaliação.';
        if (!arquivos.length) e.arquivos = 'Anexe ao menos uma evidência pertinente.';
        setErros(e);
        return !Object.keys(e).length;
      }}
      resumo={() => [
        ['TRL atual', `TRL ${projeto.trlAtual}`],
        ['TRL avaliado', `TRL ${trl}${reducao ? ' (redução)' : trl === projeto.trlAtual ? ' (mantido)' : ''}`],
        ['Justificativa', justificativa],
        ['Radar 4D', comRadar ? CHAVES_RADAR.map((k, i) => `${RADAR_EIXOS[i]}: ${formatarScore(radar[k])}`).join(' · ') : 'Sem nova leitura'],
        ['Evidências', nomesArquivos(arquivos)],
      ]}
      aviso={reducao ? `Atenção: o TRL será reduzido de ${projeto.trlAtual} para ${trl}. A avaliação anterior continua no histórico.` : undefined}
      enviar={async () => {
        await projetoService.avaliarTrl(projeto.id, { trlNovo: trl, justificativa, radar: comRadar ? radar : null, arquivos });
        return trl === projeto.trlAtual ? `Avaliação registrada. TRL mantido em ${trl}.` : `TRL alterado de ${projeto.trlAtual} para ${trl}. A avaliação anterior segue no histórico.`;
      }}
      rotuloConfirmar="Registrar avaliação"
      perigo={reducao}
    >
      {({ falhou, enviando, limparFalha }) => (
        <>
          <Campo label={`Nível avaliado (atual: TRL ${projeto.trlAtual})`}>
            <SeletorTrl valor={trl} onChange={setTrl} atual={projeto.trlAtual} />
          </Campo>
          {reducao && (
            <p className="flex gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900" role="alert">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Redução de TRL {projeto.trlAtual} para {trl}. Explique o que as evidências mostram.
            </p>
          )}
          <Campo label="Justificativa" erro={erros.justificativa} htmlFor="t-just">
            <textarea id="t-just" rows={4} className="input" placeholder="Que testes, ambientes e resultados sustentam este nível?" value={justificativa} onChange={(e) => setJustificativa(e.target.value)} />
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
          <Campo label="Evidências">
            <Anexos
              arquivos={arquivos}
              onChange={(f) => {
                setArquivos(f);
                limparFalha();
              }}
              erro={erros.arquivos}
              falhou={falhou}
              enviando={enviando}
            />
          </Campo>
        </>
      )}
    </FormularioConfirmado>
  );
}
