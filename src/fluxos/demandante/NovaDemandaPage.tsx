import { ArrowLeft, Check, CheckCircle2, Lightbulb, Megaphone, Sprout, WandSparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { ArenaBadge, Campo, OrigemBadge, PageHeader, SeloSimulado, Spinner } from '@/components/common/ui';
import { useAsync, useAuth } from '@/hooks';
import { campanhaService, iaService, projetoService, recomendacaoService } from '@/services';
import { mensagemErro } from '@/services/api';
import { ApiError } from '@/types/api';
import type { OrigemDemanda } from '@/types/domain';
import { AREAS_DEMANDANTES, ORIGEM_DESCRICAO, ORIGEM_LABEL, TIPO_CAMPANHA_LABEL, TRL_DEFINICOES, areaNome } from '@/utils/constants';
import { formatarData } from '@/utils/formatters';
import { porPerfil } from '@/utils/permissoes';

const MAX_TITULO = 255;

// Cadastro de demanda (guia, seção 3): título, descrição da dor, área, origem, TRL inicial declarado e
// hipótese opcional. A demanda começa em Ideação com a arena "A definir". Também converte uma
// recomendação recebida em demanda espontânea (?recomendacao=id).
export default function NovaDemandaPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [params] = useSearchParams();
  const recomendacaoId = Number(params.get('recomendacao')) || null;
  const campanhaInicial = Number(params.get('campanha')) || 0;
  const campanhas = useAsync(() => campanhaService.listar(), []);
  const recomendacao = useAsync(() => (recomendacaoId ? recomendacaoService.obter(recomendacaoId) : Promise.resolve(null)), [recomendacaoId]);

  const [form, setForm] = useState({
    titulo: '',
    descricaoDor: '',
    areaDemandanteId: 0,
    origem: (campanhaInicial && !recomendacaoId ? 'INDUZIDA' : 'ESPONTANEA') as OrigemDemanda,
    acaoMobilizacaoId: campanhaInicial,
    trlInicialDeclarado: 1,
    hipoteseSolucao: '',
  });
  const [revisando, setRevisando] = useState(false);
  const [sugerindo, setSugerindo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const set = (p: Partial<typeof form>) => setForm((f) => ({ ...f, ...p }));

  // A conversão traz o título e a descrição da recomendação; o destinatário pode ajustar
  const rec = recomendacao.dados;
  useEffect(() => {
    if (rec) set({ titulo: rec.titulo, descricaoDor: rec.descricao, origem: 'ESPONTANEA', acaoMobilizacaoId: 0 });
  }, [rec]);

  const acaoSel = (campanhas.dados ?? []).find((c) => c.id === form.acaoMobilizacaoId);

  const validar = () => {
    const e: Record<string, string> = {};
    if (!form.titulo.trim()) e.titulo = 'Informe o título.';
    else if (form.titulo.trim().length > MAX_TITULO) e.titulo = `Use até ${MAX_TITULO} caracteres.`;
    if (!form.descricaoDor.trim()) e.descricaoDor = 'Descreva a dor.';
    if (!form.areaDemandanteId) e.areaDemandanteId = 'Selecione a área demandante.';
    if (form.origem === 'INDUZIDA' && !form.acaoMobilizacaoId) e.acaoMobilizacaoId = 'Selecione a ação de mobilização.';
    setErros(e);
    return !Object.keys(e).length;
  };

  const sugerir = async () => {
    if (!form.titulo.trim() || !form.descricaoDor.trim()) {
      setErros({ ...erros, titulo: form.titulo.trim() ? '' : 'Informe o título.', descricaoDor: form.descricaoDor.trim() ? '' : 'Descreva a dor.' });
      return;
    }
    setSugerindo(true);
    try {
      const r = await iaService.analisarDemanda({ titulo: form.titulo, descricaoDor: form.descricaoDor });
      set({ hipoteseSolucao: r.hipoteseSolucao, trlInicialDeclarado: r.trlSugerido });
      toast.info(r.observacoes ?? 'Sugestão aplicada. Revise antes de enviar.');
    } catch (e) {
      toast.warning(e instanceof ApiError && e.status === 503 ? 'A IA está indisponível agora. Preencha a hipótese manualmente.' : mensagemErro(e));
    } finally {
      setSugerindo(false);
    }
  };

  const confirmar = async () => {
    setSalvando(true);
    try {
      const p = await projetoService.criar({
        titulo: form.titulo,
        descricaoDor: form.descricaoDor,
        areaDemandanteId: form.areaDemandanteId,
        origem: form.origem,
        acaoMobilizacaoId: form.origem === 'INDUZIDA' ? form.acaoMobilizacaoId : null,
        trlInicialDeclarado: form.trlInicialDeclarado,
        hipoteseSolucao: form.hipoteseSolucao.trim() || null,
        recomendacaoId,
      });
      toast.success(
        recomendacaoId ? `Recomendação convertida em demanda. Ela começa em ${p.etapa.nome}, aguardando a triagem do Analista.` : `Demanda registrada em ${p.etapa.nome}. Próximo responsável: Analista (triagem).`,
        { duration: 6000 },
      );
      navigate(`/app/projetos/${p.id}`, { replace: true });
    } catch (e) {
      if (e instanceof ApiError && e.codigo === 'VALIDACAO_FALHOU' && e.detalhes && !Array.isArray(e.detalhes)) {
        setErros(e.detalhes);
        setRevisando(false);
      }
      toast.error(mensagemErro(e));
    } finally {
      setSalvando(false);
    }
  };

  const perm = porPerfil('registrarDemanda', usuario);
  if (!perm.permitido)
    return (
      <div className="mx-auto max-w-xl">
        <PageHeader eyebrow="Cadastro de demanda" titulo="Nova demanda de inovação" />
        <div className="card p-6 text-sm">
          <p className="font-bold">Indisponível para o seu perfil</p>
          <p className="mt-2 text-slate-600">{perm.motivo}</p>
        </div>
      </div>
    );

  if (recomendacaoId && recomendacao.erro)
    return (
      <div className="mx-auto max-w-xl">
        <PageHeader eyebrow="Recomendação" titulo="Converter em demanda" />
        <div className="card p-6 text-sm text-rose-700">{recomendacao.erro}</div>
      </div>
    );

  const recEncerrada = rec && rec.status !== 'PENDENTE';

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow={recomendacaoId ? 'Recomendação' : 'Cadastro de demanda'}
        titulo={recomendacaoId ? 'Converter recomendação em demanda' : 'Nova demanda de inovação'}
        descricao="A demanda entra no portfólio em Ideação, com a arena “A definir”. O TRL declarado vira o valor inicial do projeto; a avaliação formal tem formulário próprio."
      />

      {rec && (
        <div className={`mb-5 flex gap-3 rounded-card border px-4 py-3 text-sm ${recEncerrada ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-bb-blue/20 bg-bb-blue-light text-bb-slate'}`}>
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-bb-blue" />
          <p>
            {recEncerrada ? (
              <>Esta recomendação já foi encerrada e não pode mais ser convertida.</>
            ) : (
              <>
                Recomendação de <strong>{rec.autor.nome}</strong>. A conversão cria uma única demanda <strong>espontânea</strong> e encerra a recomendação como convertida.
              </>
            )}
          </p>
        </div>
      )}

      {!revisando ? (
        <div key="dados" className="page-in card p-6">
          {!recomendacaoId && (
            <fieldset className="mb-6">
              <legend className="label">Como esta demanda surgiu?</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {(['ESPONTANEA', 'INDUZIDA'] as const).map((o) => {
                  const Icon = o === 'ESPONTANEA' ? Sprout : Megaphone;
                  const ativo = form.origem === o;
                  return (
                    <label key={o} className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${ativo ? 'border-bb-blue bg-bb-blue-light ring-1 ring-bb-blue' : 'border-bb-line hover:border-bb-line-2'}`}>
                      {/* Espontânea limpa a ação de mobilização */}
                      <input type="radio" name="origem" className="sr-only" checked={ativo} onChange={() => set({ origem: o, acaoMobilizacaoId: o === 'ESPONTANEA' ? 0 : form.acaoMobilizacaoId })} />
                      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${ativo ? 'text-bb-blue' : 'text-bb-muted'}`} />
                      <span>
                        <span className="block font-bold">{ORIGEM_LABEL[o]}</span>
                        <span className="block text-xs text-bb-muted">{ORIGEM_DESCRICAO[o]}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {form.origem === 'INDUZIDA' && (
                <div className="fade-in mt-3">
                  <Campo label="Ação de mobilização" erro={erros.acaoMobilizacaoId} htmlFor="acao">
                    <select id="acao" className={`input ${erros.acaoMobilizacaoId ? 'input-erro' : ''}`} value={form.acaoMobilizacaoId} onChange={(e) => set({ acaoMobilizacaoId: Number(e.target.value) })}>
                      <option value={0}>{campanhas.carregando ? 'Carregando…' : 'Selecione…'}</option>
                      {(campanhas.dados ?? []).map((c) => (
                        <option key={c.id} value={c.id}>
                          {TIPO_CAMPANHA_LABEL[c.tipo]} · {c.titulo} ({c.status === 'ABERTA' ? `até ${formatarData(c.fim)}` : 'encerrada'})
                        </option>
                      ))}
                    </select>
                  </Campo>
                  {acaoSel && <p className="mt-2 rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-900">{acaoSel.descricao}</p>}
                </div>
              )}
            </fieldset>
          )}

          <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
            <Campo label="Título" erro={erros.titulo} dica={`${form.titulo.trim().length}/${MAX_TITULO} caracteres`} htmlFor="titulo">
              <input id="titulo" className={`input ${erros.titulo ? 'input-erro' : ''}`} maxLength={MAX_TITULO + 20} placeholder="Ex.: Automatizar conferência de documentos" value={form.titulo} onChange={(e) => set({ titulo: e.target.value })} />
            </Campo>
            <Campo label="Área demandante" erro={erros.areaDemandanteId} htmlFor="area">
              <select id="area" className={`input ${erros.areaDemandanteId ? 'input-erro' : ''}`} value={form.areaDemandanteId} onChange={(e) => set({ areaDemandanteId: Number(e.target.value) })}>
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
            <Campo label="Descrição da dor" erro={erros.descricaoDor} dica="Qual problema existe hoje? Quem é afetado e com que frequência?" htmlFor="dor">
              <textarea id="dor" rows={5} className={`input ${erros.descricaoDor ? 'input-erro' : ''}`} value={form.descricaoDor} onChange={(e) => set({ descricaoDor: e.target.value })} />
            </Campo>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-[1fr_1.4fr]">
            <Campo label="TRL inicial declarado" dica={TRL_DEFINICOES[form.trlInicialDeclarado].titulo} htmlFor="trl">
              <select id="trl" className="input" value={form.trlInicialDeclarado} onChange={(e) => set({ trlInicialDeclarado: Number(e.target.value) })}>
                {Array.from({ length: 9 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    TRL {i + 1}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Hipótese de solução (opcional)" htmlFor="hip">
              <textarea id="hip" rows={3} className="input" value={form.hipoteseSolucao} onChange={(e) => set({ hipoteseSolucao: e.target.value })} />
            </Campo>
          </div>
          <button type="button" className="btn-ghost btn-sm mt-3" onClick={sugerir} disabled={sugerindo}>
            {sugerindo ? <Spinner /> : <WandSparkles className="h-4 w-4" />} Sugerir hipótese e TRL com IA <SeloSimulado texto="IA simulada" />
          </button>

          <div className="mt-6 flex justify-end border-t border-bb-line pt-5">
            <button className="btn-primary h-11 px-5" onClick={() => validar() && setRevisando(true)} disabled={!!recEncerrada}>
              Revisar e confirmar
            </button>
          </div>
        </div>
      ) : (
        <div key="conf" className="page-in card p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-bb-blue" />
            <div>
              <h2 className="font-bold">Confira antes de cadastrar</h2>
              <p className="text-sm text-bb-muted">A demanda fica visível para todos no portfólio, aguardando a triagem do Analista.</p>
            </div>
          </div>
          <dl className="mt-6 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="eyebrow">Título</dt>
              <dd className="mt-1 text-lg font-bold">{form.titulo}</dd>
            </div>
            <div>
              <dt className="eyebrow">Origem</dt>
              <dd className="mt-1 flex flex-wrap items-center gap-2">
                <OrigemBadge origem={form.origem} campanha={form.origem === 'INDUZIDA' ? acaoSel : null} />
                {form.origem === 'INDUZIDA' && acaoSel && <span className="text-slate-600">{acaoSel.titulo}</span>}
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Área demandante</dt>
              <dd className="mt-1">{areaNome(form.areaDemandanteId)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="eyebrow">Descrição da dor</dt>
              <dd className="mt-1 whitespace-pre-line text-slate-600">{form.descricaoDor}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="eyebrow">Hipótese de solução</dt>
              <dd className="mt-1 text-slate-600">{form.hipoteseSolucao.trim() || '—'}</dd>
            </div>
            <div>
              <dt className="eyebrow">TRL inicial declarado</dt>
              <dd className="mt-1 font-bold">
                TRL {form.trlInicialDeclarado} · <span className="font-normal text-slate-600">{TRL_DEFINICOES[form.trlInicialDeclarado].titulo}</span>
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Etapa e arena iniciais</dt>
              <dd className="mt-1 flex items-center gap-2">
                Ideação · <ArenaBadge arena="A_DEFINIR" />
              </dd>
            </div>
          </dl>
          <div className="mt-6 flex justify-between border-t border-bb-line pt-5">
            <button className="btn-ghost" onClick={() => setRevisando(false)} disabled={salvando}>
              <ArrowLeft className="h-4 w-4" /> Voltar e editar
            </button>
            <button className="btn-primary h-11 px-5" onClick={confirmar} disabled={salvando}>
              {salvando ? <Spinner /> : <Check className="h-4 w-4" />} {recomendacaoId ? 'Converter em demanda' : 'Confirmar cadastro'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
