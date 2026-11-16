import { Check, Undo2 } from 'lucide-react';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { toast } from 'sonner';

import { Modal, ResumoConfirmacao, Spinner } from '@/components/common/ui';
import { mensagemErro } from '@/services/api';
import { ApiError } from '@/types/api';
import type { ProjetoDetalhe } from '@/types/domain';
import { formatarTamanho } from '@/utils/formatters';

// ---------------- Formulário com revisão e confirmação ----------------
// 1) o usuário preenche; 2) revisa um resumo; 3) confirma. Depois do sucesso, a mensagem diz
// o que mudou e quem é o próximo responsável. Conflito (409) oferece recarregar; com aoConflitar,
// o formulário continua aberto com o rascunho para revisar a versão mais recente.

interface EstadoEnvio {
  enviando: boolean;
  falhou: string | null;
  limparFalha: () => void;
}

export function FormularioConfirmado({
  aberto,
  onFechar,
  onAtualizar,
  titulo,
  descricao,
  largura = 'max-w-xl',
  validar,
  resumo,
  aviso,
  enviar,
  rotuloConfirmar,
  perigo,
  aoConflitar,
  children,
}: {
  aberto: boolean;
  onFechar: () => void;
  onAtualizar: () => void;
  titulo: string;
  descricao?: string;
  largura?: string;
  validar: () => boolean;
  resumo: () => [string, ReactNode][];
  aviso?: ReactNode;
  enviar: () => Promise<string>;
  rotuloConfirmar: string;
  perigo?: boolean;
  aoConflitar?: () => void;
  children: (f: EstadoEnvio) => ReactNode;
}) {
  const [revisando, setRevisando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [falhou, setFalhou] = useState<string | null>(null);

  useEffect(() => {
    if (aberto) {
      setRevisando(false);
      setFalhou(null);
    }
  }, [aberto]);

  const revisar = (e: FormEvent) => {
    e.preventDefault();
    if (validar()) setRevisando(true);
  };

  const confirmar = async () => {
    setEnviando(true);
    try {
      const msg = await enviar();
      toast.success(msg, { duration: 6000 });
      onAtualizar();
      onFechar();
    } catch (er) {
      if (er instanceof ApiError && er.status === 409 && aoConflitar) {
        toast.error(er.message, { duration: 8000 });
        setRevisando(false);
        aoConflitar();
      } else if (er instanceof ApiError && er.status === 409) {
        toast.error(er.message, { action: { label: 'Recarregar', onClick: onAtualizar }, duration: 10000 });
        onFechar();
      } else if (er instanceof ApiError && ['UPLOAD_FALHOU', 'TIPO_INVALIDO', 'TAMANHO_INVALIDO'].includes(er.codigo)) {
        const arquivo = (er.detalhes as Record<string, string> | undefined)?.arquivo ?? null;
        setFalhou(arquivo);
        setRevisando(false);
        toast.error(er.message);
      } else {
        toast.error(mensagemErro(er));
        setRevisando(false);
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo={titulo}
      descricao={descricao}
      largura={largura}
      rodape={
        revisando ? (
          <>
            <button className="btn-ghost" onClick={() => setRevisando(false)} disabled={enviando}>
              <Undo2 className="h-4 w-4" /> Voltar e editar
            </button>
            <button className={perigo ? 'btn-danger' : 'btn-primary'} onClick={confirmar} disabled={enviando}>
              {enviando ? <Spinner /> : <Check className="h-4 w-4" />} {rotuloConfirmar}
            </button>
          </>
        ) : (
          <>
            <button className="btn-ghost" onClick={onFechar}>
              Cancelar
            </button>
            <button type="submit" form="form-confirmado" className="btn-primary">
              Revisar
            </button>
          </>
        )
      }
    >
      {revisando ? (
        <ResumoConfirmacao itens={resumo()} aviso={aviso} />
      ) : (
        <form id="form-confirmado" onSubmit={revisar} className="space-y-5" noValidate>
          {children({ enviando, falhou, limparFalha: () => setFalhou(null) })}
        </form>
      )}
    </Modal>
  );
}

export function Opcoes<T extends string>({ valor, onChange, opcoes, colunas = 2 }: { valor: T; onChange: (v: T) => void; opcoes: { v: T; t: string; d?: string; tom?: 'perigo' | 'alerta' }[]; colunas?: 2 | 3 }) {
  return (
    <div className={`grid gap-2 ${colunas === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`} role="radiogroup">
      {opcoes.map((o) => {
        const ativo = valor === o.v;
        const cor = o.tom === 'perigo' ? 'border-rose-400 bg-rose-50 ring-rose-400' : o.tom === 'alerta' ? 'border-amber-400 bg-amber-50 ring-amber-400' : 'border-bb-blue bg-bb-blue-light ring-bb-blue';
        return (
          <label key={o.v} className={`cursor-pointer rounded-xl border p-3 transition focus-within:ring-2 ${ativo ? `${cor} ring-1` : 'border-bb-line hover:border-bb-line-2'}`}>
            <input type="radio" className="sr-only" checked={ativo} onChange={() => onChange(o.v)} />
            <span className="block text-sm font-bold">{o.t}</span>
            {o.d && <span className="mt-0.5 block text-xs leading-snug text-bb-muted">{o.d}</span>}
          </label>
        );
      })}
    </div>
  );
}

export const nomesArquivos = (fs: File[]) => (fs.length ? fs.map((f) => `${f.name} (${formatarTamanho(f.size)})`).join('\n') : 'Nenhum');

// Props comuns dos formulários abertos a partir do detalhe do projeto
export type ModalBaseProps = { projeto: ProjetoDetalhe; aberto: boolean; onFechar: () => void; onFeito: () => void };
