import { AlertTriangle, FileUp, Inbox, Megaphone, Paperclip, Sprout, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState, type DragEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';

import type { ArenaTipo, CampanhaResumo, EtapaJornada, OrigemDemanda } from '@/types/domain';
import { ARENA_BADGE, ARENA_LABEL, ETAPA_BADGE, ETAPA_CURTO, TIPO_CAMPANHA_LABEL } from '@/utils/constants';
import { formatarTamanho, iniciais } from '@/utils/formatters';

export function Logo({ claro = false, compacto = false }: { claro?: boolean; compacto?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="relative grid h-9 w-9 place-items-center rounded-lg bg-bb-blue text-white font-bold text-[15px] tracking-tight">
        SP
        <span className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full bg-bb-yellow ring-2 ring-white" />
      </span>
      {!compacto && (
        <span className="leading-tight">
          <span className={`block font-bold text-[17px] tracking-tight ${claro ? 'text-white' : 'text-bb-slate'}`}>SIGES-PIN</span>
          <span className={`block text-[11px] ${claro ? 'text-white/70' : 'text-bb-muted'}`}>Portfólio de Inovação · BBTS</span>
        </span>
      )}
    </span>
  );
}

export function ArenaBadge({ arena }: { arena: ArenaTipo }) {
  return <span className={`badge ${ARENA_BADGE[arena]}`}>{ARENA_LABEL[arena]}</span>;
}

export function EtapaBadge({ etapa }: { etapa: EtapaJornada }) {
  return <span className={`badge ${ETAPA_BADGE[etapa]}`}>{ETAPA_CURTO[etapa]}</span>;
}

// Origem da demanda: espontânea (backlog) ou induzida (campanha, desafio, hackathon, residência)
export function OrigemBadge({ origem, campanha }: { origem: OrigemDemanda; campanha?: CampanhaResumo | null }) {
  if (origem === 'INDUZIDA')
    return (
      <span className="badge border-orange-200 bg-orange-50 text-orange-800" title={campanha?.titulo}>
        <Megaphone className="h-3 w-3" />
        {campanha ? TIPO_CAMPANHA_LABEL[campanha.tipo] : 'Induzida'}
      </span>
    );
  return (
    <span className="badge border-lime-200 bg-lime-50 text-lime-800">
      <Sprout className="h-3 w-3" /> Espontânea
    </span>
  );
}

export function Selo({ children, classe }: { children: ReactNode; classe: string }) {
  return <span className={`badge ${classe}`}>{children}</span>;
}

// Notas de 1 a 5 em botões (qualificação)
export function Notas({ valor, onChange, rotulo }: { valor: number; onChange: (n: number) => void; rotulo: string }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label={rotulo}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={valor === n}
          onClick={() => onChange(n)}
          className={`h-9 w-9 rounded-lg border text-sm font-bold transition ${
            valor >= n ? 'border-bb-blue bg-bb-blue text-white' : 'border-bb-line-2 text-slate-500 hover:border-bb-blue hover:text-bb-blue'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

const TAMANHO_MAX = 10 * 1024 * 1024;
const ACEITOS = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.json,.csv,.zip,.txt';

// Área de anexos com arrastar e soltar (até 10 MB por arquivo)
export function Anexos({ arquivos, onChange, erro }: { arquivos: File[]; onChange: (f: File[]) => void; erro?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);

  const adicionar = (lista: FileList | null) => {
    if (!lista) return;
    const novos: File[] = [];
    for (const f of Array.from(lista)) {
      if (f.size > TAMANHO_MAX) toast.error(`${f.name} passa de 10 MB.`);
      else if (!arquivos.some((a) => a.name === f.name && a.size === f.size)) novos.push(f);
    }
    onChange([...arquivos, ...novos]);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e: DragEvent) => {
          e.preventDefault();
          setArrastando(false);
          adicionar(e.dataTransfer.files);
        }}
        onClick={() => input.current?.click()}
        className={`flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed px-4 py-5 text-center transition ${
          arrastando ? 'border-bb-blue bg-bb-blue-light' : erro ? 'border-rose-300 bg-rose-50/50' : 'border-bb-line-2 hover:border-bb-blue hover:bg-slate-50'
        }`}
      >
        <FileUp className="h-6 w-6 text-bb-blue" />
        <p className="mt-1.5 text-sm font-semibold">Clique para anexar ou arraste os arquivos aqui</p>
        <p className="text-xs text-bb-muted">PDF, Office, imagens, JSON, CSV ou ZIP · até 10 MB cada</p>
        <input ref={input} type="file" multiple accept={ACEITOS} className="hidden" onChange={(e) => adicionar(e.target.files)} />
      </div>
      {erro && <p className="mt-1 text-xs font-semibold text-rose-600">{erro}</p>}
      {arquivos.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {arquivos.map((f) => (
            <li key={f.name + f.size} className="flex items-center gap-2 rounded-lg border border-bb-line px-3 py-2 text-sm">
              <Paperclip className="h-4 w-4 text-bb-muted" />
              <span className="flex-1 truncate">{f.name}</span>
              <span className="text-xs text-bb-muted">{formatarTamanho(f.size)}</span>
              <button type="button" className="text-slate-400 hover:text-rose-600" onClick={() => onChange(arquivos.filter((x) => x !== f))} aria-label={`Remover ${f.name}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function TrlBadge({ trl }: { trl: number }) {
  return <span className="badge bg-bb-blue-light text-bb-blue border-blue-200">TRL {trl}</span>;
}

// Régua compacta de 9 segmentos
export function TrlMeter({ trl, className = '' }: { trl: number; className?: string }) {
  return (
    <div className={`flex gap-0.5 ${className}`} role="img" aria-label={`TRL ${trl} de 9`}>
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={`h-1.5 flex-1 rounded-full ${i < trl ? 'bg-bb-blue' : 'bg-slate-200'}`} />
      ))}
    </div>
  );
}

export function Avatar({ nome, tamanho = 'md' }: { nome: string; tamanho?: 'sm' | 'md' | 'lg' }) {
  const t = { sm: 'h-7 w-7 text-[10px]', md: 'h-9 w-9 text-xs', lg: 'h-12 w-12 text-sm' }[tamanho];
  return (
    <span className={`grid ${t} shrink-0 place-items-center rounded-full bg-bb-navy text-white font-bold ring-2 ring-bb-yellow/80`}>
      {iniciais(nome)}
    </span>
  );
}

export function PageHeader({ eyebrow, titulo, descricao, acoes }: { eyebrow?: string; titulo: string; descricao?: string; acoes?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight text-bb-slate">{titulo}</h1>
        {descricao && <p className="mt-1 max-w-2xl text-sm text-bb-muted">{descricao}</p>}
      </div>
      {acoes && <div className="flex flex-wrap gap-2">{acoes}</div>}
    </div>
  );
}

export function Vazio({ titulo, texto, acao }: { titulo: string; texto?: string; acao?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-bb-line-2 bg-white/60 px-6 py-12 text-center">
      <Inbox className="mb-3 h-8 w-8 text-slate-300" />
      <p className="font-semibold text-bb-slate">{titulo}</p>
      {texto && <p className="mt-1 max-w-sm text-sm text-bb-muted">{texto}</p>}
      {acao && <div className="mt-4">{acao}</div>}
    </div>
  );
}

export function Erro({ texto, onTentar }: { texto: string; onTentar?: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span className="flex-1">{texto}</span>
      {onTentar && (
        <button className="btn-sm btn bg-white text-rose-700 border border-rose-200 hover:bg-rose-100" onClick={onTentar}>
          Tentar de novo
        </button>
      )}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return <span className={`inline-block animate-spin rounded-full border-2 border-current border-r-transparent ${className}`} aria-hidden="true" />;
}

export function Modal({
  aberto,
  onFechar,
  titulo,
  descricao,
  children,
  rodape,
  largura = 'max-w-lg',
}: {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  descricao?: string;
  children: ReactNode;
  rodape?: ReactNode;
  largura?: string;
}) {
  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onFechar();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;
  // Portal no body: a animação de entrada da página (transform) quebraria o position: fixed
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={titulo}>
      <div className="fade-in absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onFechar} />
      <div className={`pop-in relative flex max-h-[92vh] w-full ${largura} flex-col rounded-t-panel bg-white shadow-float sm:rounded-panel`}>
        <div className="flex items-start justify-between gap-4 border-b border-bb-line px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-bb-slate">{titulo}</h2>
            {descricao && <p className="mt-0.5 text-sm text-bb-muted">{descricao}</p>}
          </div>
          <button className="btn-ghost h-8 w-8 px-0" onClick={onFechar} aria-label="Fechar">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="scroll-fino overflow-y-auto px-6 py-5">{children}</div>
        {rodape && <div className="flex justify-end gap-2 border-t border-bb-line px-6 py-4">{rodape}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function Campo({ label, erro, dica, children, htmlFor }: { label: string; erro?: string; dica?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {erro ? <p className="mt-1 text-xs font-semibold text-rose-600">{erro}</p> : dica ? <p className="mt-1 text-xs text-bb-muted">{dica}</p> : null}
    </div>
  );
}
