import { ArrowLeft, Check, CheckCircle2, Megaphone, PenLine, Sparkles, Sprout, WandSparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { ArenaBadge, Campo, OrigemBadge, PageHeader, SeloDiscussao, SeloSimulado, Spinner } from '@/components/common/ui';
import { RadarChart } from '@/components/radar/RadarChart';
import { useAsync, useAuth } from '@/hooks';
import { porPerfil } from '@/utils/permissoes';
import { campanhaService, iaService, projetoService } from '@/services';
import { mensagemErro } from '@/services/api';
import { ApiError } from '@/types/api';
import type { ArenaTipo, NaturezaDemanda, OrigemDemanda, ScoresRadar } from '@/types/domain';
import {
  ARENA_LABEL,
  ARENAS,
  AREAS_DEMANDANTES,
  NATUREZA_LABEL,
  ORIGEM_DESCRICAO,
  ORIGEM_LABEL,
  RADAR_EIXOS,
  TIPO_CAMPANHA_LABEL,
  TRL_DEFINICOES,
  areaNome,
} from '@/utils/constants';
import { formatarData, formatarScore } from '@/utils/formatters';

const MIN_DESCRICAO = 15;
type Passo = 1 | 2 | 3;
type Origem = 'IA' | 'MANUAL';

const RADAR_VAZIO: ScoresRadar = { negocio: 0, produto: 0, time: 0, receita: 0 };
const CHAVES_RADAR: (keyof ScoresRadar)[] = ['negocio', 'produto', 'time', 'receita'];

export default function IntakePage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [params] = useSearchParams();
  const campanhaInicial = Number(params.get('campanha')) || 0;
  const campanhas = useAsync(() => campanhaService.listar(), []);
  const abertas = (campanhas.dados ?? []).filter((c) => c.status === 'ABERTA');
  const [entrada, setEntrada] = useState<{ origem: OrigemDemanda; campanhaId: number; natureza: NaturezaDemanda }>({
    origem: campanhaInicial ? 'INDUZIDA' : 'ESPONTANEA',
    campanhaId: campanhaInicial,
    natureza: 'PROBLEMA',
  });
  const campanhaSel = abertas.find((c) => c.id === entrada.campanhaId);
  const [passo, setPasso] = useState<Passo>(1);
  const [origem, setOrigem] = useState<Origem>('IA');
  const [analisando, setAnalisando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [observacao, setObservacao] = useState<string | null>(null);

  const [dados, setDados] = useState({ titulo: '', areaDemandanteId: 0, descricaoDor: '', contexto: '' });
  const [revisao, setRevisao] = useState({
    arena: 'A_DEFINIR' as ArenaTipo,
    hipoteseSolucao: '',
    trlInicial: 1,
    potencialLeiDoBem: false,
    radar: RADAR_VAZIO,
  });

  const validarDados = () => {
    const e: Record<string, string> = {};
    if (dados.titulo.trim().length < 5) e.titulo = 'Informe um título com pelo menos 5 caracteres.';
    if (!dados.areaDemandanteId) e.areaDemandanteId = 'Selecione a área demandante.';
    if (dados.descricaoDor.trim().length < MIN_DESCRICAO) e.descricaoDor = `Descreva a dor com pelo menos ${MIN_DESCRICAO} caracteres.`;
    if (entrada.origem === 'INDUZIDA' && !entrada.campanhaId) e.campanhaId = 'Selecione a ação de mobilização.';
    setErros(e);
    return !Object.keys(e).length;
  };

  const analisar = async () => {
    if (!validarDados()) return;
    setAnalisando(true);
    try {
      const r = await iaService.analisarDemanda({ ...dados, natureza: entrada.natureza });
      setRevisao({ arena: r.arena, hipoteseSolucao: r.hipoteseSolucao, trlInicial: r.trlInicial, potencialLeiDoBem: r.potencialLeiDoBem, radar: r.radar });
      setObservacao(r.observacoes ?? null);
      setOrigem('IA');
      setPasso(2);
    } catch (e) {
      // Degradação suave: a IA fora do ar não bloqueia o cadastro
      if (e instanceof ApiError && (e.status === 503 || e.codigo === 'TIMEOUT' || e.codigo === 'IA_INDISPONIVEL')) {
        toast.warning('A IA está indisponível agora. Você pode preencher os campos manualmente.');
        irManual();
      } else toast.error(mensagemErro(e));
    } finally {
      setAnalisando(false);
    }
  };

  const irManual = () => {
    setOrigem('MANUAL');
    setObservacao(null);
    setPasso(2);
  };

  const validarRevisao = () => {
    const e: Record<string, string> = {};
    if (revisao.hipoteseSolucao.trim().length < 10) e.hipoteseSolucao = 'Descreva a hipótese de solução.';
    setErros(e);
    return !Object.keys(e).length;
  };

  const confirmar = async () => {
    setSalvando(true);
    try {
      const p = await projetoService.criar({
        ...dados,
        ...revisao,
        natureza: entrada.natureza,
        origem: entrada.origem,
        campanhaId: entrada.origem === 'INDUZIDA' ? entrada.campanhaId : null,
      });
      toast.success(`Demanda registrada em ${p.etapa.nome}. Próximo responsável: Analista (triagem).`, { duration: 6000 });
      navigate(`/app/projetos/${p.id}`, { replace: true });
    } catch (e) {
      if (e instanceof ApiError && e.codigo === 'VALIDACAO_FALHOU' && e.detalhes && !Array.isArray(e.detalhes)) {
        setErros(e.detalhes);
        setPasso(1);
      }
      toast.error(mensagemErro(e));
    } finally {
      setSalvando(false);
    }
  };

  const passos = ['Dados da demanda', 'Revisão das sugestões', 'Confirmação'];

  // Registrar demanda é do Demandante; para os demais perfis, a regra ainda está "a definir"
  const perm = porPerfil('registrarDemanda', usuario);
  if (!perm.permitido)
    return (
      <div className="mx-auto max-w-xl">
        <PageHeader eyebrow="Cadastro de demanda" titulo="Nova demanda de inovação" />
        <div className="card p-6 text-sm">
          <div className="flex items-center gap-2">
            {perm.aDefinir && <SeloDiscussao />}
            <span className="font-bold">Indisponível para o seu perfil</span>
          </div>
          <p className="mt-2 text-slate-600">{perm.motivo}</p>
          <p className="mt-2 text-bb-muted">Hoje, o registro de demandas cabe ao Demandante. Se Analistas e Especialistas também poderão registrar ainda será decidido com o cliente.</p>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Cadastro de demanda"
        titulo="Nova demanda de inovação"
        descricao="Registre o problema, a necessidade ou a oportunidade. A IA sugere o enquadramento, você revisa, e a equipe de inovação faz a triagem."
      />

      {/* Stepper */}
      <ol className="mb-6 grid grid-cols-3 gap-2">
        {passos.map((t, i) => {
          const n = (i + 1) as Passo;
          const feito = passo > n;
          const atual = passo === n;
          return (
            <li key={t} className="flex items-center gap-2.5">
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors ${
                  feito ? 'bg-bb-blue text-white' : atual ? 'bg-bb-yellow text-bb-slate ring-2 ring-bb-blue ring-offset-2' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {feito ? <Check className="h-4 w-4" /> : n}
              </span>
              <span className={`hidden text-sm font-semibold sm:block ${atual ? 'text-bb-slate' : 'text-bb-muted'}`}>{t}</span>
              {i < 2 && <span className={`hidden h-px flex-1 sm:block ${feito ? 'bg-bb-blue' : 'bg-bb-line-2'}`} />}
            </li>
          );
        })}
      </ol>

      {passo === 1 && (
        <div key="p1" className="page-in card p-6">
          {/* Origem da demanda: espontânea ou induzida (ação de mobilização) */}
          <fieldset className="mb-6">
            <legend className="label">Como esta demanda surgiu?</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {(['ESPONTANEA', 'INDUZIDA'] as const).map((o) => {
                const Icon = o === 'ESPONTANEA' ? Sprout : Megaphone;
                const ativo = entrada.origem === o;
                return (
                  <label
                    key={o}
                    className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${ativo ? 'border-bb-blue bg-bb-blue-light ring-1 ring-bb-blue' : 'border-bb-line hover:border-bb-line-2'}`}
                  >
                    <input type="radio" name="origem" className="sr-only" checked={ativo} onChange={() => setEntrada({ ...entrada, origem: o })} />
                    <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${ativo ? 'text-bb-blue' : 'text-bb-muted'}`} />
                    <span>
                      <span className="block font-bold">{ORIGEM_LABEL[o]}</span>
                      <span className="block text-xs text-bb-muted">{ORIGEM_DESCRICAO[o]}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            {entrada.origem === 'INDUZIDA' && (
              <div className="fade-in mt-3">
                <Campo label="Ação de mobilização" erro={erros.campanhaId} htmlFor="campanha">
                  <select
                    id="campanha"
                    className={`input ${erros.campanhaId ? 'input-erro' : ''}`}
                    value={entrada.campanhaId}
                    onChange={(e) => setEntrada({ ...entrada, campanhaId: Number(e.target.value) })}
                  >
                    <option value={0}>{campanhas.carregando ? 'Carregando…' : abertas.length ? 'Selecione…' : 'Nenhuma ação vigente'}</option>
                    {abertas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {TIPO_CAMPANHA_LABEL[c.tipo]} · {c.titulo} (até {formatarData(c.fim)})
                      </option>
                    ))}
                  </select>
                </Campo>
                {campanhaSel && <p className="mt-2 rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-900">{campanhaSel.descricao}</p>}
              </div>
            )}
          </fieldset>

          <fieldset className="mb-6">
            <legend className="label">O que você está registrando?</legend>
            <div className="flex flex-wrap gap-2">
              {(['PROBLEMA', 'NECESSIDADE', 'OPORTUNIDADE'] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setEntrada({ ...entrada, natureza: n })}
                  aria-pressed={entrada.natureza === n}
                  className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                    entrada.natureza === n ? 'border-bb-blue bg-bb-blue text-white' : 'border-bb-line-2 text-slate-600 hover:border-bb-blue'
                  }`}
                >
                  {NATUREZA_LABEL[n]}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-5 md:grid-cols-2">
            <Campo label="Título da demanda" erro={erros.titulo} htmlFor="titulo">
              <input
                id="titulo"
                className={`input ${erros.titulo ? 'input-erro' : ''}`}
                placeholder="Ex.: Automatizar conferência de documentos"
                value={dados.titulo}
                onChange={(e) => setDados({ ...dados, titulo: e.target.value })}
              />
            </Campo>
            <Campo label="Área demandante" erro={erros.areaDemandanteId} htmlFor="area">
              <select
                id="area"
                className={`input ${erros.areaDemandanteId ? 'input-erro' : ''}`}
                value={dados.areaDemandanteId}
                onChange={(e) => setDados({ ...dados, areaDemandanteId: Number(e.target.value) })}
              >
                <option value={0}>Selecione…</option>
                {AREAS_DEMANDANTES.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.sigla} · {a.nome}
                  </option>
                ))}
              </select>
            </Campo>
          </div>
          <div className="mt-5">
            <Campo
              label="Descrição da dor"
              erro={erros.descricaoDor}
              dica={`Qual problema existe hoje? Quem é afetado e com que frequência? (${dados.descricaoDor.trim().length}/${MIN_DESCRICAO} caracteres mínimos)`}
              htmlFor="dor"
            >
              <textarea
                id="dor"
                rows={6}
                className={`input ${erros.descricaoDor ? 'input-erro' : ''}`}
                placeholder="Ex.: A conferência manual de documentos leva 40 minutos por processo e gera retrabalho…"
                value={dados.descricaoDor}
                onChange={(e) => setDados({ ...dados, descricaoDor: e.target.value })}
              />
            </Campo>
          </div>
          <div className="mt-5">
            <Campo label="Contexto relevante (opcional)" dica="Volume, áreas envolvidas, tentativas anteriores, restrições ou documentos de referência." htmlFor="contexto">
              <textarea id="contexto" rows={3} className="input" value={dados.contexto} onChange={(e) => setDados({ ...dados, contexto: e.target.value })} />
            </Campo>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 border-t border-bb-line pt-5 sm:flex-row sm:justify-between">
            <button className="btn-ghost" onClick={() => validarDados() && irManual()} disabled={analisando}>
              <PenLine className="h-4 w-4" /> Preencher manualmente
            </button>
            <button className="btn-primary h-11 px-5" onClick={analisar} disabled={analisando}>
              {analisando ? (
                <>
                  <Spinner /> Analisando a demanda…
                </>
              ) : (
                <>
                  <WandSparkles className="h-4 w-4" /> Pedir sugestões à IA
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {passo === 2 && (
        <div key="p2" className="page-in grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="card p-6">
            {origem === 'IA' ? (
              <div className="mb-5 flex gap-3 rounded-xl border border-bb-blue/20 bg-bb-blue-light p-4">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-bb-blue" />
                <div className="text-sm">
                  <p className="flex flex-wrap items-center gap-2 font-bold text-bb-slate">
                    Sugestões para revisão. Nada foi decidido nem salvo. <SeloSimulado texto="IA simulada no protótipo" />
                  </p>
                  <p className="text-slate-600">{observacao ?? 'Todos os campos podem ser editados.'}</p>
                </div>
              </div>
            ) : (
              <div className="mb-5 flex gap-3 rounded-xl border border-bb-line bg-slate-50 p-4 text-sm">
                <PenLine className="mt-0.5 h-5 w-5 shrink-0 text-bb-muted" />
                <p className="text-slate-600">
                  <strong className="text-bb-slate">Preenchimento manual.</strong> Informe o enquadramento inicial da demanda.
                </p>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <Campo label="Arena estratégica" htmlFor="arena">
                <select id="arena" className="input" value={revisao.arena} onChange={(e) => setRevisao({ ...revisao, arena: e.target.value as ArenaTipo })}>
                  {ARENAS.map((a) => (
                    <option key={a} value={a}>
                      {ARENA_LABEL[a]}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="TRL inicial" dica={TRL_DEFINICOES[revisao.trlInicial].titulo} htmlFor="trl">
                <select id="trl" className="input" value={revisao.trlInicial} onChange={(e) => setRevisao({ ...revisao, trlInicial: Number(e.target.value) })}>
                  {Array.from({ length: 9 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      TRL {i + 1}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>

            <div className="mt-5">
              <Campo label="Hipótese de solução" erro={erros.hipoteseSolucao} htmlFor="hip">
                <textarea
                  id="hip"
                  rows={4}
                  className={`input ${erros.hipoteseSolucao ? 'input-erro' : ''}`}
                  value={revisao.hipoteseSolucao}
                  onChange={(e) => setRevisao({ ...revisao, hipoteseSolucao: e.target.value })}
                />
              </Campo>
            </div>

            <label className="mt-5 flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-bb-line p-4">
              <span>
                <span className="block text-sm font-bold">Potencial de Lei do Bem</span>
                <span className="block text-xs text-bb-muted">Indica possível enquadramento em incentivos fiscais à inovação.</span>
              </span>
              <input
                type="checkbox"
                className="peer sr-only"
                checked={revisao.potencialLeiDoBem}
                onChange={(e) => setRevisao({ ...revisao, potencialLeiDoBem: e.target.checked })}
              />
              <span className="relative h-6 w-11 shrink-0 rounded-full bg-slate-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-bb-blue peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-bb-blue peer-focus-visible:ring-offset-2" />
            </label>

            <div className="mt-6 flex justify-between border-t border-bb-line pt-5">
              <button className="btn-ghost" onClick={() => setPasso(1)}>
                <ArrowLeft className="h-4 w-4" /> Voltar
              </button>
              <button className="btn-primary" onClick={() => validarRevisao() && setPasso(3)}>
                Revisar e confirmar
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-bold">Leitura inicial do radar</h2>
            <p className="text-xs text-bb-muted">Notas de 0 a 4 para cada dimensão.</p>
            <RadarChart inicial={null} atual={revisao.radar} altura={220} />
            <div className="mt-3 space-y-3">
              {CHAVES_RADAR.map((k, i) => (
                <div key={k}>
                  <div className="mb-1 flex justify-between text-sm">
                    <label htmlFor={`r-${k}`} className="font-semibold">
                      {RADAR_EIXOS[i]}
                    </label>
                    <span className="font-bold tabular-nums text-bb-blue">{formatarScore(revisao.radar[k])}</span>
                  </div>
                  <input
                    id={`r-${k}`}
                    type="range"
                    min={0}
                    max={4}
                    step={0.25}
                    value={revisao.radar[k]}
                    onChange={(e) => setRevisao({ ...revisao, radar: { ...revisao.radar, [k]: Number(e.target.value) } })}
                    className="w-full accent-bb-blue"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {passo === 3 && (
        <div key="p3" className="page-in card p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-bb-blue" />
            <div>
              <h2 className="font-bold">Confira antes de cadastrar</h2>
              <p className="text-sm text-bb-muted">A demanda entra no portfólio na etapa inicial do Kanban, visível para todos, aguardando a triagem do Analista.</p>
            </div>
          </div>
          <dl className="mt-6 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="eyebrow">Título</dt>
              <dd className="mt-1 text-lg font-bold">{dados.titulo}</dd>
            </div>
            <div>
              <dt className="eyebrow">Origem</dt>
              <dd className="mt-1 flex flex-wrap items-center gap-2">
                <OrigemBadge origem={entrada.origem} campanha={campanhaSel} />
                {campanhaSel && <span className="text-slate-600">{campanhaSel.titulo}</span>}
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Natureza</dt>
              <dd className="mt-1">{NATUREZA_LABEL[entrada.natureza]}</dd>
            </div>
            {dados.contexto.trim() && (
              <div className="sm:col-span-2">
                <dt className="eyebrow">Contexto relevante</dt>
                <dd className="mt-1 text-slate-600">{dados.contexto}</dd>
              </div>
            )}
            <div>
              <dt className="eyebrow">Área demandante</dt>
              <dd className="mt-1">{areaNome(dados.areaDemandanteId)}</dd>
            </div>
            <div>
              <dt className="eyebrow">Arena</dt>
              <dd className="mt-1">
                <ArenaBadge arena={revisao.arena} />
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="eyebrow">Descrição da dor</dt>
              <dd className="mt-1 text-slate-600">{dados.descricaoDor}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="eyebrow">Hipótese de solução</dt>
              <dd className="mt-1 text-slate-600">{revisao.hipoteseSolucao}</dd>
            </div>
            <div>
              <dt className="eyebrow">TRL inicial</dt>
              <dd className="mt-1 font-bold">
                TRL {revisao.trlInicial} · <span className="font-normal text-slate-600">{TRL_DEFINICOES[revisao.trlInicial].titulo}</span>
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Lei do Bem</dt>
              <dd className="mt-1">{revisao.potencialLeiDoBem ? 'Com potencial' : 'Sem potencial identificado'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="eyebrow">Radar inicial</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {CHAVES_RADAR.map((k, i) => (
                  <span key={k} className="rounded-lg bg-slate-100 px-3 py-1.5">
                    {RADAR_EIXOS[i]}: <strong>{formatarScore(revisao.radar[k])}</strong>
                  </span>
                ))}
              </dd>
            </div>
          </dl>
          <div className="mt-6 flex justify-between border-t border-bb-line pt-5">
            <button className="btn-ghost" onClick={() => setPasso(2)} disabled={salvando}>
              <ArrowLeft className="h-4 w-4" /> Voltar e editar
            </button>
            <button className="btn-primary h-11 px-5" onClick={confirmar} disabled={salvando}>
              {salvando ? <Spinner /> : <Check className="h-4 w-4" />} Confirmar cadastro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
