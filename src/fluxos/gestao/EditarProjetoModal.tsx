import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Campo } from '@/components/common/ui';
import { FormularioConfirmado, type ModalBaseProps } from '@/components/projeto/formulario';
import { projetoService, usuarioService } from '@/services';
import type { ArenaTipo, DadosProjeto, ProjetoDetalhe, Usuario } from '@/types/domain';
import { ARENA_LABEL, ARENAS, AREAS_DEMANDANTES, areaNome } from '@/utils/constants';
import { formatarMoedaBRL } from '@/utils/formatters';

// ---------------- Editar projeto (Especialista) ----------------
// Envia os dados, a versão vigente e uma justificativa. Se o registro mudou desde a abertura do formulário,
// o rascunho é preservado e a versão mais recente aparece para revisão antes de salvar de novo.

type Rascunho = Omit<DadosProjeto, 'dispendioEstimado' | 'potencialLeiDoBem'> & { dispendioEstimado: string; potencialLeiDoBem: '' | 'SIM' | 'NAO' };

const DISPENDIO = /^\d{1,10}([.,]\d{1,2})?$/;

function rascunhoDe(p: ProjetoDetalhe): Rascunho {
  return {
    titulo: p.titulo,
    descricaoDor: p.descricaoDor,
    areaDemandanteId: p.areaDemandanteId,
    hipoteseSolucao: p.hipoteseSolucao ?? '',
    arena: p.arena,
    potencialLeiDoBem: p.potencialLeiDoBem == null ? '' : p.potencialLeiDoBem ? 'SIM' : 'NAO',
    dispendioEstimado: p.dispendioEstimado == null ? '' : String(p.dispendioEstimado),
    demandanteId: p.demandante?.id ?? 0,
    analistaResponsavelId: p.analistaResponsavel?.id ?? null,
  };
}

const dados = (r: Rascunho): DadosProjeto => ({
  ...r,
  hipoteseSolucao: r.hipoteseSolucao?.trim() || null,
  potencialLeiDoBem: r.potencialLeiDoBem === '' ? null : r.potencialLeiDoBem === 'SIM',
  dispendioEstimado: r.dispendioEstimado.trim() ? Number(r.dispendioEstimado.replace(',', '.')) : null,
});

export function EditarProjetoModal({ projeto, aberto, onFechar, onFeito }: ModalBaseProps) {
  const [form, setForm] = useState<Rascunho>(rascunhoDe(projeto));
  const [versao, setVersao] = useState(projeto.versao);
  const [justificativa, setJustificativa] = useState('');
  const [recente, setRecente] = useState<ProjetoDetalhe | null>(null);
  const [pessoas, setPessoas] = useState<Usuario[]>([]);
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!aberto) return;
    setForm(rascunhoDe(projeto));
    setVersao(projeto.versao);
    setJustificativa('');
    setRecente(null);
    setErros({});
    usuarioService.listar().then(setPessoas).catch(() => setPessoas([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  const set = (p: Partial<Rascunho>) => setForm((f) => ({ ...f, ...p }));
  const demandantes = pessoas.filter((x) => x.perfil === 'DEMANDANTE');
  const analistas = pessoas.filter((x) => x.perfil === 'ANALISTA');
  const nome = (id: number | null) => pessoas.find((x) => x.id === id)?.nome ?? '—';
  const original = rascunhoDe(recente ?? projeto);

  const alterados = (): [string, string][] => {
    const linhas: [string, string, string][] = [
      ['Título', original.titulo, form.titulo],
      ['Descrição da dor', original.descricaoDor, form.descricaoDor],
      ['Área demandante', areaNome(original.areaDemandanteId), areaNome(form.areaDemandanteId)],
      ['Hipótese de solução', original.hipoteseSolucao ?? '', form.hipoteseSolucao ?? ''],
      ['Arena', ARENA_LABEL[original.arena], ARENA_LABEL[form.arena]],
      ['Potencial de Lei do Bem', original.potencialLeiDoBem, form.potencialLeiDoBem],
      ['Dispêndio estimado', original.dispendioEstimado, form.dispendioEstimado],
      ['Demandante', nome(original.demandanteId), nome(form.demandanteId)],
      ['Analista responsável', nome(original.analistaResponsavelId), nome(form.analistaResponsavelId)],
    ];
    return linhas.filter(([, a, b]) => a !== b).map(([campo, a, b]) => [campo, `${a || '—'} → ${b || '—'}`]);
  };

  return (
    <FormularioConfirmado
      aberto={aberto}
      onFechar={onFechar}
      onAtualizar={onFeito}
      titulo={`Editar projeto · versão ${versao}`}
      descricao="Os responsáveis devem estar ativos e ter os perfis correspondentes. A alteração entra no histórico de gestão."
      largura="max-w-3xl"
      validar={() => {
        const e: Record<string, string> = {};
        if (!form.titulo.trim() || form.titulo.trim().length > 255) e.titulo = 'Informe o título (até 255 caracteres).';
        if (!form.descricaoDor.trim()) e.descricaoDor = 'Descreva a dor.';
        if (!form.areaDemandanteId) e.areaDemandanteId = 'Selecione a área.';
        if (form.dispendioEstimado.trim() && !DISPENDIO.test(form.dispendioEstimado.trim())) e.dispendioEstimado = 'Valor não negativo, com até 10 dígitos inteiros e 2 decimais.';
        if (!form.demandanteId) e.demandanteId = 'Escolha o Demandante responsável.';
        if (!justificativa.trim()) e.justificativa = 'A justificativa é obrigatória.';
        if (!alterados().length) e.justificativa = 'Nenhum dado foi alterado.';
        setErros(e);
        return !Object.keys(e).length;
      }}
      resumo={() => [...alterados(), ['Justificativa', justificativa]]}
      enviar={async () => {
        await projetoService.editar(projeto.id, { dados: dados(form), versao, justificativa });
        return 'Projeto atualizado. A alteração foi registrada no histórico de gestão.';
      }}
      aoConflitar={async () => {
        const atual = await projetoService.obter(projeto.id);
        setRecente(atual);
        setVersao(atual.versao);
        onFeito();
      }}
      rotuloConfirmar="Salvar alterações"
    >
      {() => (
        <>
          {recente && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="flex items-center gap-2 font-bold">
                <RefreshCw className="h-4 w-4" /> O projeto mudou para a versão {recente.versao}. O seu rascunho foi preservado.
              </p>
              <p className="mt-1">Valores atuais: {recente.titulo} · {ARENA_LABEL[recente.arena]} · Demandante {recente.demandante?.nome ?? '—'} · Analista {recente.analistaResponsavel?.nome ?? '—'} · {formatarMoedaBRL(recente.dispendioEstimado)}</p>
              <p className="mt-1 text-xs">Revise os campos e clique em Revisar para salvar sobre a versão mais recente.</p>
            </div>
          )}
          {!projeto.demandante && (
            <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">Projeto legado sem Demandante vinculado. Atribua um Demandante ativo para salvar.</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Campo label="Título" erro={erros.titulo} htmlFor="g-tit">
                <input id="g-tit" className="input" value={form.titulo} onChange={(e) => set({ titulo: e.target.value })} />
              </Campo>
            </div>
            <div className="sm:col-span-2">
              <Campo label="Descrição da dor" erro={erros.descricaoDor} htmlFor="g-dor">
                <textarea id="g-dor" rows={3} className="input" value={form.descricaoDor} onChange={(e) => set({ descricaoDor: e.target.value })} />
              </Campo>
            </div>
            <Campo label="Área demandante" erro={erros.areaDemandanteId} htmlFor="g-area">
              <select id="g-area" className="input" value={form.areaDemandanteId} onChange={(e) => set({ areaDemandanteId: Number(e.target.value) })}>
                <option value={0}>Selecione…</option>
                {AREAS_DEMANDANTES.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.sigla} · {a.nome}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Arena" htmlFor="g-arena">
              <select id="g-arena" className="input" value={form.arena} onChange={(e) => set({ arena: e.target.value as ArenaTipo })}>
                {ARENAS.map((a) => (
                  <option key={a} value={a}>
                    {ARENA_LABEL[a]}
                  </option>
                ))}
              </select>
            </Campo>
            <div className="sm:col-span-2">
              <Campo label="Hipótese de solução (opcional)" htmlFor="g-hip">
                <textarea id="g-hip" rows={2} className="input" value={form.hipoteseSolucao ?? ''} onChange={(e) => set({ hipoteseSolucao: e.target.value })} />
              </Campo>
            </div>
            <Campo label="Potencial de Lei do Bem (opcional)" htmlFor="g-lei">
              <select id="g-lei" className="input" value={form.potencialLeiDoBem} onChange={(e) => set({ potencialLeiDoBem: e.target.value as Rascunho['potencialLeiDoBem'] })}>
                <option value="">Não informado</option>
                <option value="SIM">Sim</option>
                <option value="NAO">Não</option>
              </select>
            </Campo>
            <Campo label="Dispêndio estimado em R$ (opcional)" erro={erros.dispendioEstimado} dica="Até 10 dígitos inteiros e 2 decimais." htmlFor="g-disp">
              <input id="g-disp" inputMode="decimal" className="input" placeholder="Ex.: 150000,00" value={form.dispendioEstimado} onChange={(e) => set({ dispendioEstimado: e.target.value })} />
            </Campo>
            <Campo label="Demandante responsável" erro={erros.demandanteId} htmlFor="g-dem">
              <select id="g-dem" className="input" value={form.demandanteId} onChange={(e) => set({ demandanteId: Number(e.target.value) })}>
                <option value={0}>Selecione…</option>
                {demandantes.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nome}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Analista responsável (opcional)" htmlFor="g-ana">
              <select id="g-ana" className="input" value={form.analistaResponsavelId ?? 0} onChange={(e) => set({ analistaResponsavelId: Number(e.target.value) || null })}>
                <option value={0}>Sem analista</option>
                {analistas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </select>
            </Campo>
          </div>
          <Campo label="Justificativa" erro={erros.justificativa} htmlFor="g-just">
            <textarea id="g-just" rows={2} className="input" value={justificativa} onChange={(e) => setJustificativa(e.target.value)} />
          </Campo>
        </>
      )}
    </FormularioConfirmado>
  );
}
