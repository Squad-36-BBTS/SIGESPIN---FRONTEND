import { FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Anexos, Campo, SeloSimulado } from '@/components/common/ui';
import { evidenciaService } from '@/services';
import type { Evidencia, ProjetoDetalhe } from '@/types/domain';
import { formatarData, formatarTamanho } from '@/utils/formatters';

import { FormularioConfirmado, nomesArquivos } from './formulario';

// Anexar evidências ao projeto (envio simulado): JPEG/JPG, PDF ou Word até 10 MB cada.
// Depois de anexadas, elas aparecem nos formulários de TRL, pedido de avanço, parecer e correção.
export function AnexarEvidenciasModal({ projeto, aberto, onFechar, onFeito }: { projeto: ProjetoDetalhe; aberto: boolean; onFechar: () => void; onFeito: () => void }) {
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [descricao, setDescricao] = useState('');
  const [erro, setErro] = useState<string | undefined>();

  useEffect(() => {
    if (aberto) {
      setArquivos([]);
      setDescricao('');
      setErro(undefined);
    }
  }, [aberto]);

  return (
    <FormularioConfirmado
      aberto={aberto}
      onFechar={onFechar}
      onAtualizar={onFeito}
      titulo="Anexar evidências"
      descricao={projeto.titulo}
      validar={() => {
        setErro(arquivos.length ? undefined : 'Escolha ao menos um arquivo.');
        return arquivos.length > 0;
      }}
      resumo={() => [
        ['Arquivos', nomesArquivos(arquivos)],
        ['Descrição', descricao.trim() || '—'],
      ]}
      aviso="Envio simulado no protótipo: o arquivo não sai do seu computador, só o nome e o tamanho ficam registrados."
      enviar={async () => {
        const novas = await evidenciaService.anexar(projeto.id, arquivos, descricao);
        return `${novas.length} evidência(s) anexada(s). Elas já podem ser selecionadas nos formulários do projeto.`;
      }}
      rotuloConfirmar="Anexar"
    >
      {({ falhou, enviando, limparFalha }) => (
        <>
          <p className="flex items-center gap-2 text-xs text-bb-muted">
            <SeloSimulado texto="Envio simulado" /> Formatos aceitos: JPEG/JPG, PDF e Word (DOC/DOCX), até 10 MB por arquivo.
          </p>
          <Anexos
            arquivos={arquivos}
            onChange={(f) => {
              setArquivos(f);
              setErro(undefined);
              limparFalha();
            }}
            erro={erro}
            falhou={falhou}
            enviando={enviando}
          />
          <Campo label="Descrição (opcional)" htmlFor="ev-desc" dica="Ex.: relatório de testes, ata da reunião, foto do protótipo.">
            <input id="ev-desc" className="input" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </Campo>
        </>
      )}
    </FormularioConfirmado>
  );
}

// Seleção de evidências já vinculadas ao projeto (guia, seção 3): cada uma aparece uma única vez.
// TRL e pedido de avanço exigem ao menos uma; no parecer a lista pode ficar vazia.
export function SeletorEvidencias({ evidencias, valor, onChange, erro }: { evidencias: Evidencia[]; valor: number[]; onChange: (ids: number[]) => void; erro?: string }) {
  if (!evidencias.length)
    return (
      <p className="rounded-lg border border-dashed border-bb-line-2 bg-slate-50 p-3 text-sm text-bb-muted">
        Este projeto ainda não tem evidências. Anexe arquivos na aba <strong>Evidências</strong> do projeto e volte a este formulário.
      </p>
    );
  const alternar = (id: number) => onChange(valor.includes(id) ? valor.filter((x) => x !== id) : [...valor, id]);
  return (
    <div>
      <ul className={`divide-y divide-bb-line rounded-xl border ${erro ? 'border-rose-300' : 'border-bb-line'}`}>
        {evidencias.map((e) => (
          <li key={e.id}>
            <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm hover:bg-slate-50">
              <input type="checkbox" className="h-4 w-4 accent-bb-blue" checked={valor.includes(e.id)} onChange={() => alternar(e.id)} />
              <FileText className="h-4 w-4 shrink-0 text-bb-blue" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{e.nomeArquivo}</span>
                <span className="block text-xs text-bb-muted">
                  {e.descricao ? `${e.descricao} · ` : ''}
                  {e.enviadaPor.nome} · {formatarData(e.dataUpload)} · {formatarTamanho(e.tamanhoBytes)}
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      {erro && <p className="mt-1 text-xs font-semibold text-rose-600">{erro}</p>}
    </div>
  );
}

// Correção: um único ID de evidência, opcional
export function SeletorEvidencia({ evidencias, valor, onChange, id }: { evidencias: Evidencia[]; valor: number | null; onChange: (id: number | null) => void; id?: string }) {
  return (
    <select id={id} className="input" value={valor ?? 0} onChange={(e) => onChange(Number(e.target.value) || null)}>
      <option value={0}>Sem evidência</option>
      {evidencias.map((e) => (
        <option key={e.id} value={e.id}>
          {e.nomeArquivo}
        </option>
      ))}
    </select>
  );
}

export const nomesEvidencias = (evidencias: Evidencia[], ids: number[]) => {
  const nomes = evidencias.filter((e) => ids.includes(e.id)).map((e) => e.nomeArquivo);
  return nomes.length ? nomes.join('\n') : 'Nenhuma';
};

// Lista compacta das evidências de um registro
export function ListaEvidencias({ evidencias }: { evidencias: Evidencia[] }) {
  if (!evidencias.length) return null;
  return (
    <ul className="mt-2 flex flex-wrap gap-2">
      {evidencias.map((e) => (
        <li key={e.id} className="flex items-center gap-1.5 rounded-lg border border-bb-line bg-white px-2.5 py-1.5 text-xs">
          <FileText className="h-3.5 w-3.5 text-bb-blue" />
          <span className="max-w-[220px] truncate font-semibold">{e.nomeArquivo}</span>
          <span className="text-bb-muted">{formatarTamanho(e.tamanhoBytes)}</span>
        </li>
      ))}
    </ul>
  );
}
