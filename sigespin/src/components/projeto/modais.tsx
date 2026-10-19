import { AlertTriangle, ArrowRight, Check, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { toast } from 'sonner';

import { Anexos, Campo, Modal, Notas, Spinner } from '@/components/common/ui';
import { entregaService, governancaService, parecerService, projetoService, usuarioService } from '@/services';
import { mensagemErro } from '@/services/api';
import { ApiError } from '@/types/api';
import type {
  ConsultaEspecialista,
  DecisaoTipo,
  Entrega,
  EtapaJornada,
  PautaGovernanca,
  Projeto,
  RecomendacaoParecer,
  RecomendacaoQualificacao,
  ScoresRadar,
  Usuario,
} from '@/types/domain';
import {
  CRITERIOS_QUALIFICACAO,
  ETAPA_LABEL,
  RADAR_EIXOS,
  RECOMENDACAO_PARECER_LABEL,
  RECOMENDACAO_QUALIFICACAO_DESCRICAO,
  RECOMENDACAO_QUALIFICACAO_LABEL,
  TRL_DEFINICOES,
} from '@/utils/constants';
import { formatarScore } from '@/utils/formatters';

// Envio padrão: mostra o resultado, recarrega em caso de sucesso ou de conflito (409)
function useEnvio(onSucesso: () => void, onFechar: () => void) {
  const [enviando, setEnviando] = useState(false);
  const enviar = async (fn: () => Promise<unknown>, msg: string) => {
    setEnviando(true);
    try {
      await fn();
      toast.success(msg);
      onSucesso();
      onFechar();
    } catch (e) {
      toast.error(mensagemErro(e));
      if (e instanceof ApiError && e.status === 409) {
        onSucesso();
        onFechar();
      }
    } finally {
      setEnviando(false);
    }
  };
  return { enviando, enviar };
}

function Rodape({ enviando, onFechar, rotulo, perigo, children }: { enviando: boolean; onFechar: () => void; rotulo: string; perigo?: boolean; children?: ReactNode }) {
  return (
    <>
      {children}
      <button className="btn-ghost" onClick={onFechar} disabled={enviando}>
        Cancelar
      </button>
      <button type="submit" form="form-modal" className={perigo ? 'btn-danger' : 'btn-primary'} disabled={enviando}>
        {enviando ? <Spinner /> : <Check className="h-4 w-4" />} {rotulo}
      </button>
    </>
  );
}

function Opcoes<T extends string>({ valor, onChange, opcoes }: { valor: T; onChange: (v: T) => void; opcoes: { v: T; t: string; d?: string; tom?: 'perigo' }[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {opcoes.map((o) => (
        <label
          key={o.v}
          className={`cursor-pointer rounded-xl border p-3 transition ${
            valor === o.v ? (o.tom === 'perigo' ? 'border-rose-400 bg-rose-50 ring-1 ring-rose-400' : 'border-bb-blue bg-bb-blue-light ring-1 ring-bb-blue') : 'border-bb-line hover:border-bb-line-2'
          }`}
        >
          <input type="radio" className="sr-only" checked={valor === o.v} onChange={() => onChange(o.v)} />
          <span className="block text-sm font-bold">{o.t}</span>
          {o.d && <span className="mt-0.5 block text-xs leading-snug text-bb-muted">{o.d}</span>}
        </label>
      ))}
    </div>
  );
}

function SeletorTrl({ valor, onChange, atual }: { valor: number; onChange: (n: number) => void; atual?: number }) {
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`relative h-10 w-10 rounded-lg border text-sm font-bold transition ${
              valor === n ? 'border-bb-blue bg-bb-blue text-white' : 'border-bb-line-2 hover:border-bb-blue hover:text-bb-blue'
            }`}
          >
            {n}
            {atual === n && valor !== n && <span className="absolute -top-1 right-0.5 h-2 w-2 rounded-full bg-bb-yellow ring-2 ring-white" title="TRL atual" />}
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-xs text-bb-muted">
        <strong>TRL {valor}:</strong> {TRL_DEFINICOES[valor].descricao}
      </p>
    </div>
  );
}

// ---------------- Qualificação (Analista) ----------------

export function QualificacaoModal({ projeto, aberto, onFechar, onFeito }: { projeto: Projeto; aberto: boolean; onFechar: () => void; onFeito: () => void }) {
  const [notas, setNotas] = useState({ aderenciaTese: 0, relevancia: 0, grauInovacao: 0, viabilidade: 0 });
  const [trl, setTrl] = useState(projeto.trlAtual);
  const [parecer, setParecer] = useState('');
  const [dispendio, setDispendio] = useState(projeto.dispendioEstimado != null ? String(projeto.dispendioEstimado) : '');
  const [recomendacao, setRecomendacao] = useState<RecomendacaoQualificacao>('ENCAMINHAR_GOVERNANCA');
  const [erros, setErros] = useState<Record<string, string>>({});
  const { enviando, enviar } = useEnvio(onFeito, onFechar);

  useEffect(() => {
    if (aberto) {
      setNotas({ aderenciaTese: 0, relevancia: 0, grauInovacao: 0, viabilidade: 0 });
      setTrl(projeto.trlAtual);
      setParecer('');
      setErros({});
    }
  }, [aberto, projeto.trlAtual]);

  const media = Object.values(notas).filter(Boolean).length === 4 ? Object.values(notas).reduce((a, b) => a + b, 0) / 4 : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (Object.values(notas).some((n) => !n)) er.notas = 'Avalie os quatro critérios.';
    if (parecer.trim().length < 20) er.parecer = 'Escreva o parecer (mínimo de 20 caracteres).';
    setErros(er);
    if (Object.keys(er).length) return;
    const valor = dispendio.trim() ? Number(dispendio.replace(/\D/g, '')) : null;
    enviar(
      () => projetoService.qualificar(projeto.id, { ...notas, trlAvaliado: trl, parecer, recomendacao, dispendioEstimado: valor }),
      `Qualificação registrada: ${RECOMENDACAO_QUALIFICACAO_LABEL[recomendacao].toLowerCase()}.`,
    );
  };

  return (
    <Modal aberto={aberto} onFechar={onFechar} titulo="Qualificar demanda" descricao={projeto.titulo} largura="max-w-2xl" rodape={<Rodape enviando={enviando} onFechar={onFechar} rotulo="Registrar qualificação" />}>
      <form id="form-modal" onSubmit={submit} className="space-y-5">
        <div className="space-y-3">
          {CRITERIOS_QUALIFICACAO.map((c) => (
            <div key={c.chave} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold">{c.label}</p>
                <p className="text-xs text-bb-muted">{c.dica}</p>
              </div>
              <Notas rotulo={c.label} valor={notas[c.chave]} onChange={(n) => setNotas({ ...notas, [c.chave]: n })} />
            </div>
          ))}
          {erros.notas && <p className="text-xs font-semibold text-rose-600">{erros.notas}</p>}
          {media != null && (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
              Média da qualificação: <strong>{media.toFixed(1).replace('.', ',')}</strong> / 5
            </p>
          )}
        </div>

        <Campo label="TRL avaliado" dica="O TRL é um indicador: registre o nível que as informações atuais sustentam.">
          <SeletorTrl valor={trl} onChange={setTrl} atual={projeto.trlAtual} />
        </Campo>

        <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
          <Campo label="Parecer da qualificação" erro={erros.parecer} htmlFor="parecer-q">
            <textarea id="parecer-q" rows={4} className={`input ${erros.parecer ? 'input-erro' : ''}`} value={parecer} onChange={(e) => setParecer(e.target.value)} />
          </Campo>
          <Campo label="Dispêndio estimado (R$)" dica="Opcional" htmlFor="disp">
            <input id="disp" inputMode="numeric" className="input" placeholder="Ex.: 250000" value={dispendio} onChange={(e) => setDispendio(e.target.value)} />
          </Campo>
        </div>

        <Campo label="Encaminhamento">
          <Opcoes
            valor={recomendacao}
            onChange={setRecomendacao}
            opcoes={(['ENCAMINHAR_GOVERNANCA', 'INICIAR_EXPERIMENTACAO', 'DEVOLVER_DEMANDANTE', 'ARQUIVAR'] as const).map((v) => ({
              v,
              t: RECOMENDACAO_QUALIFICACAO_LABEL[v],
              d: RECOMENDACAO_QUALIFICACAO_DESCRICAO[v],
              tom: v === 'ARQUIVAR' ? 'perigo' : undefined,
            }))}
          />
        </Campo>
      </form>
    </Modal>
  );
}

// ---------------- Consulta a especialista (Analista) ----------------

export function ConsultaModal({ projeto, aberto, onFechar, onFeito }: { projeto: Projeto; aberto: boolean; onFechar: () => void; onFeito: () => void }) {
  const [especialistas, setEspecialistas] = useState<Usuario[]>([]);
  const [area, setArea] = useState('');
  const [especialistaId, setEspecialistaId] = useState(0);
  const [pergunta, setPergunta] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const { enviando, enviar } = useEnvio(onFeito, onFechar);

  useEffect(() => {
    if (!aberto) return;
    setPergunta('');
    setArea('');
    setEspecialistaId(0);
    setErro(null);
    usuarioService.especialistas().then(setEspecialistas).catch(() => setEspecialistas([]));
  }, [aberto]);

  const areas = [...new Set(especialistas.map((x) => x.areaTecnica).filter(Boolean) as string[])].sort();
  const daArea = especialistas.filter((x) => x.areaTecnica === area);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!area) return setErro('Selecione a área técnica.');
    if (pergunta.trim().length < 15) return setErro('Descreva o que precisa ser avaliado.');
    enviar(
      () => parecerService.consultar(projeto.id, { areaTecnica: area, especialistaId: especialistaId || null, pergunta }),
      especialistaId ? 'Consulta enviada ao especialista.' : `Consulta enviada à área de ${area}.`,
    );
  };

  return (
    <Modal aberto={aberto} onFechar={onFechar} titulo="Consultar especialista ou área técnica" descricao="Peça um parecer técnico para subsidiar a qualificação ou a decisão." rodape={<Rodape enviando={enviando} onFechar={onFechar} rotulo="Enviar consulta" />}>
      <form id="form-modal" onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Área técnica" htmlFor="area-tec">
            <select
              id="area-tec"
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
          <Campo label="Especialista" dica="Opcional: sem escolha, qualquer especialista da área pode responder." htmlFor="esp">
            <select id="esp" className="input" value={especialistaId} onChange={(e) => setEspecialistaId(Number(e.target.value))} disabled={!area}>
              <option value={0}>Qualquer especialista da área</option>
              {daArea.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.nome}
                </option>
              ))}
            </select>
          </Campo>
        </div>
        <Campo label="O que precisa ser avaliado?" erro={erro ?? undefined} htmlFor="perg">
          <textarea id="perg" rows={4} className="input" value={pergunta} onChange={(e) => setPergunta(e.target.value)} />
        </Campo>
      </form>
    </Modal>
  );
}

// ---------------- Resposta do especialista ----------------

export function ParecerModal({ consulta, onFechar, onFeito }: { consulta: ConsultaEspecialista | null; onFechar: () => void; onFeito: () => void }) {
  const [parecer, setParecer] = useState('');
  const [recomendacao, setRecomendacao] = useState<RecomendacaoParecer>('FAVORAVEL');
  const [sugerir, setSugerir] = useState(false);
  const [trl, setTrl] = useState(3);
  const [erro, setErro] = useState<string | null>(null);
  const { enviando, enviar } = useEnvio(onFeito, onFechar);

  useEffect(() => {
    setParecer('');
    setRecomendacao('FAVORAVEL');
    setSugerir(false);
    setErro(null);
  }, [consulta]);

  if (!consulta) return null;
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parecer.trim().length < 20) return setErro('Escreva o parecer técnico (mínimo de 20 caracteres).');
    enviar(() => parecerService.responder(consulta.id, { parecer, recomendacao, trlSugerido: sugerir ? trl : null }), 'Parecer registrado.');
  };

  return (
    <Modal aberto onFechar={onFechar} titulo="Emitir parecer técnico" descricao={consulta.projetoTitulo} largura="max-w-xl" rodape={<Rodape enviando={enviando} onFechar={onFechar} rotulo="Registrar parecer" />}>
      <form id="form-modal" onSubmit={submit} className="space-y-4">
        <div className="rounded-lg bg-slate-50 p-3 text-sm">
          <p className="eyebrow mb-1">Pergunta de {consulta.solicitante.nome}</p>
          <p className="text-slate-700">{consulta.pergunta}</p>
        </div>
        <Campo label="Recomendação">
          <Opcoes
            valor={recomendacao}
            onChange={setRecomendacao}
            opcoes={(['FAVORAVEL', 'FAVORAVEL_COM_RESSALVAS', 'DESFAVORAVEL'] as const).map((v) => ({ v, t: RECOMENDACAO_PARECER_LABEL[v], tom: v === 'DESFAVORAVEL' ? 'perigo' : undefined }))}
          />
        </Campo>
        <Campo label="Parecer" erro={erro ?? undefined} htmlFor="par">
          <textarea id="par" rows={5} className="input" value={parecer} onChange={(e) => setParecer(e.target.value)} />
        </Campo>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" className="h-4 w-4 accent-bb-blue" checked={sugerir} onChange={(e) => setSugerir(e.target.checked)} />
          Sugerir um TRL com base na avaliação técnica
        </label>
        {sugerir && <SeletorTrl valor={trl} onChange={setTrl} />}
      </form>
    </Modal>
  );
}

// ---------------- Atualização de maturidade (TRL por evidências) ----------------

const CHAVES_RADAR: (keyof ScoresRadar)[] = ['negocio', 'produto', 'time', 'receita'];

export function MaturidadeModal({ projeto, aberto, onFechar, onFeito }: { projeto: Projeto; aberto: boolean; onFechar: () => void; onFeito: () => void }) {
  const [trl, setTrl] = useState(projeto.trlAtual);
  const [justificativa, setJustificativa] = useState('');
  const [comRadar, setComRadar] = useState(false);
  const [radar, setRadar] = useState<ScoresRadar>({ negocio: 2, produto: 2, time: 2, receita: 2 });
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [erros, setErros] = useState<Record<string, string>>({});
  const { enviando, enviar } = useEnvio(onFeito, onFechar);

  useEffect(() => {
    if (aberto) {
      setTrl(projeto.trlAtual);
      setJustificativa('');
      setArquivos([]);
      setComRadar(false);
      setErros({});
    }
  }, [aberto, projeto.trlAtual]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (trl === projeto.trlAtual && !comRadar) er.trl = 'Escolha um TRL diferente do atual ou registre uma nova leitura do radar.';
    if (justificativa.trim().length < 20) er.justificativa = 'Descreva os resultados que sustentam a atualização.';
    if (!arquivos.length) er.arquivos = 'Anexe ao menos uma evidência.';
    setErros(er);
    if (Object.keys(er).length) return;
    enviar(() => projetoService.registrarMaturidade(projeto.id, { trlNovo: trl, justificativa, radar: comRadar ? radar : null, arquivos }), 'Maturidade atualizada.');
  };

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo="Atualizar maturidade"
      descricao="O TRL é um indicador: atualize-o com base nas evidências e nos resultados produzidos."
      largura="max-w-2xl"
      rodape={<Rodape enviando={enviando} onFechar={onFechar} rotulo="Registrar atualização" />}
    >
      <form id="form-modal" onSubmit={submit} className="space-y-5">
        <Campo label={`TRL (atual: ${projeto.trlAtual})`} erro={erros.trl}>
          <SeletorTrl valor={trl} onChange={setTrl} atual={projeto.trlAtual} />
        </Campo>
        {trl < projeto.trlAtual && (
          <p className="flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> O TRL vai diminuir. Isso é permitido quando as evidências mostram uma maturidade menor que a registrada.
          </p>
        )}
        <Campo label="Resultados e justificativa" erro={erros.justificativa} htmlFor="just-mat">
          <textarea id="just-mat" rows={4} className="input" placeholder="Que testes, ambientes e números sustentam este nível?" value={justificativa} onChange={(e) => setJustificativa(e.target.value)} />
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
                    <span className="font-semibold">{RADAR_EIXOS[i]}</span>
                    <span className="font-bold text-bb-blue">{formatarScore(radar[k])}</span>
                  </div>
                  <input type="range" min={0} max={4} step={0.25} value={radar[k]} onChange={(e) => setRadar({ ...radar, [k]: Number(e.target.value) })} className="w-full accent-bb-blue" />
                </div>
              ))}
            </div>
          )}
        </div>
        <Campo label="Evidências">
          <Anexos arquivos={arquivos} onChange={setArquivos} erro={erros.arquivos} />
        </Campo>
      </form>
    </Modal>
  );
}

// ---------------- Entrega (Analista) e validação (Demandante) ----------------

export function EntregaModal({ projeto, aberto, onFechar, onFeito }: { projeto: Projeto; aberto: boolean; onFechar: () => void; onFeito: () => void }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const { enviando, enviar } = useEnvio(onFeito, onFechar);

  useEffect(() => {
    if (aberto) {
      setTitulo('');
      setDescricao('');
      setArquivos([]);
      setErro(null);
    }
  }, [aberto]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titulo.trim().length < 5 || descricao.trim().length < 15) return setErro('Informe o título e descreva o que foi entregue.');
    enviar(() => entregaService.registrar(projeto.id, { titulo, descricao, arquivos }), 'Entrega registrada. O demandante foi convidado a validar.');
  };

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo="Registrar entrega"
      descricao={`${ETAPA_LABEL[projeto.etapa]} · o demandante valida se a entrega resolve o problema`}
      largura="max-w-xl"
      rodape={<Rodape enviando={enviando} onFechar={onFechar} rotulo="Enviar para validação" />}
    >
      <form id="form-modal" onSubmit={submit} className="space-y-4">
        <Campo label="Título da entrega" htmlFor="tit-ent">
          <input id="tit-ent" className="input" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </Campo>
        <Campo label="O que foi entregue" erro={erro ?? undefined} htmlFor="desc-ent">
          <textarea id="desc-ent" rows={4} className="input" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </Campo>
        <Campo label="Materiais (opcional)">
          <Anexos arquivos={arquivos} onChange={setArquivos} />
        </Campo>
      </form>
    </Modal>
  );
}

export function ValidacaoModal({ entrega, onFechar, onFeito }: { entrega: Entrega | null; onFechar: () => void; onFeito: () => void }) {
  const [resultado, setResultado] = useState<'VALIDADA' | 'AJUSTES_SOLICITADOS'>('VALIDADA');
  const [comentario, setComentario] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const { enviando, enviar } = useEnvio(onFeito, onFechar);

  useEffect(() => {
    setResultado('VALIDADA');
    setComentario('');
    setErro(null);
  }, [entrega]);

  if (!entrega) return null;
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comentario.trim().length < 10) return setErro('Comente a sua avaliação.');
    enviar(() => entregaService.validar(entrega.id, { resultado, comentario }), resultado === 'VALIDADA' ? 'Entrega validada.' : 'Ajustes solicitados à equipe.');
  };

  return (
    <Modal aberto onFechar={onFechar} titulo="Validar entrega" descricao={entrega.titulo} largura="max-w-xl" rodape={<Rodape enviando={enviando} onFechar={onFechar} rotulo="Registrar validação" />}>
      <form id="form-modal" onSubmit={submit} className="space-y-4">
        <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{entrega.descricao}</p>
        <Opcoes
          valor={resultado}
          onChange={setResultado}
          opcoes={[
            { v: 'VALIDADA', t: 'Resolve o problema', d: 'A entrega atende à necessidade apresentada.' },
            { v: 'AJUSTES_SOLICITADOS', t: 'Precisa de ajustes', d: 'Ainda não atende. Explique o que falta.', tom: 'perigo' },
          ]}
        />
        <Campo label="Comentário" erro={erro ?? undefined} htmlFor="com-val">
          <textarea id="com-val" rows={4} className="input" value={comentario} onChange={(e) => setComentario(e.target.value)} />
        </Campo>
      </form>
    </Modal>
  );
}

// ---------------- Marcos e encaminhamentos (Analista) ----------------

export function MarcoModal({ projeto, aberto, onFechar, onFeito }: { projeto: Projeto; aberto: boolean; onFechar: () => void; onFeito: () => void }) {
  const proxima: EtapaJornada = projeto.etapa === 'EXPERIMENTACAO' ? 'MVP' : 'CONCLUIDO';
  const [motivo, setMotivo] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const { enviando, enviar } = useEnvio(onFeito, onFechar);

  useEffect(() => {
    if (aberto) {
      setMotivo('');
      setErro(null);
    }
  }, [aberto]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (motivo.trim().length < 10) return setErro('Descreva o marco atingido.');
    enviar(() => projetoService.avancarMarco(projeto.id, { etapaNova: proxima, motivo }), `Projeto em ${ETAPA_LABEL[proxima]}.`);
  };

  return (
    <Modal aberto={aberto} onFechar={onFechar} titulo="Registrar marco da jornada" descricao={projeto.titulo} rodape={<Rodape enviando={enviando} onFechar={onFechar} rotulo="Registrar marco" />}>
      <form id="form-modal" onSubmit={submit} className="space-y-4">
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm">
          <span className="font-semibold">{ETAPA_LABEL[projeto.etapa]}</span>
          <ArrowRight className="h-4 w-4 text-bb-muted" />
          <span className="font-bold text-bb-blue">{ETAPA_LABEL[proxima]}</span>
        </div>
        {proxima === 'CONCLUIDO' && <p className="text-xs text-bb-muted">Exige ao menos uma entrega do MVP validada pelo demandante.</p>}
        <Campo label="Marco atingido" erro={erro ?? undefined} htmlFor="mot-marco">
          <textarea id="mot-marco" rows={3} className="input" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
        </Campo>
        <p className="text-xs text-bb-muted">Se a mudança precisar de priorização ou investimento, use “Encaminhar à governança”.</p>
      </form>
    </Modal>
  );
}

export function EncaminharModal({ projeto, aberto, onFechar, onFeito }: { projeto: Projeto; aberto: boolean; onFechar: () => void; onFeito: () => void }) {
  const proxima: EtapaJornada | null = projeto.etapa === 'EXPERIMENTACAO' ? 'MVP' : projeto.etapa === 'MVP' ? 'CONCLUIDO' : null;
  const [proposta, setProposta] = useState<'AVANCAR' | 'DELIBERAR'>('AVANCAR');
  const [motivo, setMotivo] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const { enviando, enviar } = useEnvio(onFeito, onFechar);

  useEffect(() => {
    if (aberto) {
      setMotivo('');
      setErro(null);
    }
  }, [aberto]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (motivo.trim().length < 15) return setErro('Explique o que precisa ser decidido.');
    enviar(() => governancaService.encaminhar(projeto.id, { motivo, etapaProposta: proposta === 'AVANCAR' ? proxima : null }), 'Projeto incluído na pauta da governança.');
  };

  return (
    <Modal aberto={aberto} onFechar={onFechar} titulo="Encaminhar à governança" descricao="Para priorização, investimento ou decisões fora da alçada da equipe." rodape={<Rodape enviando={enviando} onFechar={onFechar} rotulo="Incluir na pauta" />}>
      <form id="form-modal" onSubmit={submit} className="space-y-4">
        <Opcoes
          valor={proposta}
          onChange={setProposta}
          opcoes={[
            { v: 'AVANCAR', t: proxima ? `Propor avanço para ${ETAPA_LABEL[proxima]}` : 'Propor avanço', d: 'Se aprovado, o projeto muda de etapa.' },
            { v: 'DELIBERAR', t: 'Pedir deliberação', d: 'Continuidade, pivotamento ou descontinuação.' },
          ]}
        />
        <Campo label="Motivo" erro={erro ?? undefined} htmlFor="mot-pauta">
          <textarea id="mot-pauta" rows={4} className="input" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
        </Campo>
      </form>
    </Modal>
  );
}

export function TextoModal({
  aberto,
  titulo,
  descricao,
  rotulo,
  campo,
  perigo,
  minimo = 10,
  inicial = '',
  onFechar,
  onEnviar,
  onFeito,
  sucesso,
  extra,
}: {
  aberto: boolean;
  titulo: string;
  descricao?: string;
  rotulo: string;
  campo: string;
  perigo?: boolean;
  minimo?: number;
  inicial?: string;
  onFechar: () => void;
  onEnviar: (texto: string) => Promise<unknown>;
  onFeito: () => void;
  sucesso: string;
  extra?: ReactNode;
}) {
  const [texto, setTexto] = useState(inicial);
  const [erro, setErro] = useState<string | null>(null);
  const { enviando, enviar } = useEnvio(onFeito, onFechar);

  useEffect(() => {
    if (aberto) {
      setTexto(inicial);
      setErro(null);
    }
  }, [aberto, inicial]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (texto.trim().length < minimo) return setErro(`Escreva ao menos ${minimo} caracteres.`);
    enviar(() => onEnviar(texto), sucesso);
  };

  return (
    <Modal aberto={aberto} onFechar={onFechar} titulo={titulo} descricao={descricao} rodape={<Rodape enviando={enviando} onFechar={onFechar} rotulo={rotulo} perigo={perigo} />}>
      <form id="form-modal" onSubmit={submit} className="space-y-4">
        {extra}
        <Campo label={campo} erro={erro ?? undefined} htmlFor="texto-modal">
          <textarea id="texto-modal" rows={5} className="input" value={texto} onChange={(e) => setTexto(e.target.value)} />
        </Campo>
      </form>
    </Modal>
  );
}

// ---------------- Decisão de governança ----------------

export function DecisaoModal({
  projeto,
  pauta,
  tipoInicial,
  onFechar,
  onFeito,
}: {
  projeto: Pick<Projeto, 'id' | 'titulo' | 'hipoteseSolucao'> | null;
  pauta: PautaGovernanca | null;
  tipoInicial: DecisaoTipo;
  onFechar: () => void;
  onFeito: () => void;
}) {
  const [decisao, setDecisao] = useState<DecisaoTipo>(tipoInicial);
  const [justificativa, setJustificativa] = useState('');
  const [novaHipotese, setNovaHipotese] = useState('');
  const [erros, setErros] = useState<Record<string, string>>({});
  const { enviando, enviar } = useEnvio(onFeito, onFechar);

  useEffect(() => {
    setDecisao(tipoInicial);
    setJustificativa('');
    setNovaHipotese('');
    setErros({});
  }, [projeto, pauta, tipoInicial]);

  if (!projeto) return null;
  const opcoes: { v: DecisaoTipo; t: string; d: string; tom?: 'perigo' }[] = [
    ...(pauta
      ? [{ v: 'APROVADO' as const, t: 'Aprovar / priorizar', d: pauta.etapaProposta ? `O projeto segue para ${ETAPA_LABEL[pauta.etapaProposta]}.` : 'Registra a continuidade do projeto.' }]
      : []),
    { v: 'PIVOTADO', t: 'Pivotar', d: pauta?.etapaAtual === 'GOVERNANCA' ? 'Nova hipótese; volta para requalificação.' : 'Nova hipótese, mantendo a etapa.' },
    { v: 'REPROVADO', t: 'Descontinuar', d: 'Estado final, sem reabertura.', tom: 'perigo' },
  ];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (justificativa.trim().length < 10) er.justificativa = 'A justificativa é obrigatória.';
    if (decisao === 'PIVOTADO' && novaHipotese.trim().length < 10) er.novaHipotese = 'Descreva a nova hipótese.';
    setErros(er);
    if (Object.keys(er).length) return;
    const req = { decisao, justificativa, novaHipotese: decisao === 'PIVOTADO' ? novaHipotese : undefined };
    enviar(() => (pauta ? governancaService.decidir(pauta.id, req) : governancaService.deliberar(projeto.id, req)), 'Decisão registrada.');
  };

  return (
    <Modal
      aberto
      onFechar={onFechar}
      titulo="Decisão de governança"
      descricao={projeto.titulo}
      largura="max-w-xl"
      rodape={
        <>
          <button className="btn-ghost" onClick={onFechar} disabled={enviando}>
            Cancelar
          </button>
          <button type="submit" form="form-modal" className={decisao === 'REPROVADO' ? 'btn-danger' : 'btn-primary'} disabled={enviando}>
            {enviando ? <Spinner /> : decisao === 'REPROVADO' ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />} Registrar decisão
          </button>
        </>
      }
    >
      <form id="form-modal" onSubmit={submit} className="space-y-4">
        {pauta && (
          <div className="rounded-lg bg-slate-50 p-3 text-sm">
            <p className="eyebrow mb-1">Encaminhado por {pauta.encaminhadaPor.nome}</p>
            <p className="text-slate-700">{pauta.motivo}</p>
          </div>
        )}
        <div className={`grid gap-2 ${opcoes.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
          {opcoes.map((o) => (
            <label
              key={o.v}
              className={`cursor-pointer rounded-xl border p-3 transition ${
                decisao === o.v ? (o.tom ? 'border-rose-400 bg-rose-50 ring-1 ring-rose-400' : 'border-bb-blue bg-bb-blue-light ring-1 ring-bb-blue') : 'border-bb-line hover:border-bb-line-2'
              }`}
            >
              <input type="radio" className="sr-only" checked={decisao === o.v} onChange={() => setDecisao(o.v)} />
              <span className="block text-sm font-bold">{o.t}</span>
              <span className="mt-0.5 block text-xs leading-snug text-bb-muted">{o.d}</span>
            </label>
          ))}
        </div>
        {decisao === 'PIVOTADO' && (
          <>
            <div className="rounded-lg bg-slate-50 p-3 text-sm">
              <p className="eyebrow mb-1">Hipótese atual</p>
              <p className="text-slate-600">{projeto.hipoteseSolucao}</p>
            </div>
            <Campo label="Nova hipótese de solução" erro={erros.novaHipotese} htmlFor="nova-hip">
              <textarea id="nova-hip" rows={3} className="input" value={novaHipotese} onChange={(e) => setNovaHipotese(e.target.value)} />
            </Campo>
          </>
        )}
        <Campo label="Justificativa" erro={erros.justificativa} htmlFor="just-dec">
          <textarea id="just-dec" rows={4} className="input" value={justificativa} onChange={(e) => setJustificativa(e.target.value)} />
        </Campo>
      </form>
    </Modal>
  );
}
