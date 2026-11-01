import {
  AlertTriangle,
  CircleAlert,
  CircleCheck,
  Clock3,
  FileUp,
  Inbox,
  Info,
  Megaphone,
  MessagesSquare,
  Paperclip,
  RotateCw,
  Sprout,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState, type DragEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';

import type { ArenaTipo, CampanhaResumo, EstadoTarefa, EtapaResumo, OrigemDemanda } from '@/types/domain';
import { ARENA_BADGE, ARENA_LABEL, TAREFA_LABEL, TIPO_CAMPANHA_LABEL } from '@/utils/constants';
import { formatarTamanho, iniciais } from '@/utils/formatters';
import type { Permissao } from '@/utils/permissoes';

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

// Etapa do Kanban (configurável): cor sólida
export function EtapaBadge({ etapa }: { etapa: EtapaResumo }) {
  return (
    <span className="badge border-transparent text-white" style={{ background: etapa.cor }}>
      {etapa.nome}
    </span>
  );
}

// Estado de tarefa (pendência): contorno tracejado, para não confundir com etapa do Kanban
const TAREFA_ESTILO: Record<EstadoTarefa, string> = {
  AGUARDANDO_TRIAGEM: 'border-slate-400 text-slate-700',
  AGUARDANDO_PARECER: 'border-teal-500 text-teal-800',
  AGUARDANDO_GOVERNANCA: 'border-amber-500 text-amber-800',
  AGUARDANDO_VALIDACAO: 'border-bb-blue text-bb-blue',
};

export function TarefaBadge({ tarefa }: { tarefa: EstadoTarefa }) {
  return (
    <span className={`badge border-dashed bg-white ${TAREFA_ESTILO[tarefa]}`}>
      <Clock3 className="h-3 w-3" /> {TAREFA_LABEL[tarefa]}
    </span>
  );
}

// Origem da demanda: espontânea ou induzida (ação de mobilização)
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

// Selo para o que ainda depende de decisão do cliente
export function SeloDiscussao({ texto = 'Em discussão' }: { texto?: string }) {
  return (
    <span className="badge border-dashed border-purple-300 bg-purple-50 text-purple-800" title="Ainda não validado com o cliente">
      <MessagesSquare className="h-3 w-3" /> {texto}
    </span>
  );
}

// Selo para dados ou integrações simuladas no protótipo
export function SeloSimulado({ texto = 'Simulado' }: { texto?: string }) {
  return <span className="badge border-dashed border-slate-300 bg-slate-50 text-slate-500">{texto}</span>;
}

// Botão de ação que respeita a permissão: quando indisponível, fica desabilitado e explica o motivo
export function BotaoAcao({
  permissao,
  onClick,
  icon,
  children,
  variante = 'secundario',
}: {
  permissao: Permissao;
  onClick: () => void;
  icon?: ReactNode;
  children: ReactNode;
  variante?: 'primario' | 'secundario';
}) {
  if (permissao.permitido)
    return (
      <button type="button" className={variante === 'primario' ? 'btn-primary' : 'btn-secondary'} onClick={onClick}>
        {icon} {children}
      </button>
    );
  return (
    <div className="flex max-w-[280px] flex-col gap-1">
      <button type="button" className="btn border border-dashed border-bb-line-2 bg-slate-50 text-slate-400" disabled>
        {icon} {children}
        {permissao.aDefinir && <SeloDiscussao />}
      </button>
      <span className="text-[11px] leading-snug text-bb-muted">{permissao.motivo}</span>
    </div>
  );
}

// Resumo apresentado antes de enviar ou decidir
export function ResumoConfirmacao({ titulo = 'Confira antes de confirmar', itens, aviso }: { titulo?: string; itens: [string, ReactNode][]; aviso?: ReactNode }) {
  return (
    <div className="fade-in space-y-4">
      <div className="flex items-center gap-2 text-sm font-bold text-bb-slate">
        <Info className="h-4 w-4 text-bb-blue" /> {titulo}
      </div>
      <dl className="divide-y divide-bb-line rounded-xl border border-bb-line">
        {itens.map(([k, v]) => (
          <div key={k} className="grid gap-1 px-4 py-2.5 text-sm sm:grid-cols-[170px_1fr]">
            <dt className="font-semibold text-bb-muted">{k}</dt>
            <dd className="whitespace-pre-line text-slate-800">{v || '—'}</dd>
          </div>
        ))}
      </dl>
      {aviso && <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{aviso}</div>}
    </div>
  );
}

const TAMANHO_MAX = 10 * 1024 * 1024;
const ACEITOS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'json', 'csv', 'zip', 'txt'];

// Anexos com validação de tipo e tamanho e estado de envio por arquivo.
// "falhou" marca o arquivo que não foi enviado; o usuário pode removê-lo ou tentar de novo.
export function Anexos({
  arquivos,
  onChange,
  erro,
  falhou,
  enviando,
}: {
  arquivos: File[];
  onChange: (f: File[]) => void;
  erro?: string;
  falhou?: string | null;
  enviando?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);

  const adicionar = (lista: FileList | null) => {
    if (!lista) return;
    const novos: File[] = [];
    for (const f of Array.from(lista)) {
      const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
      if (!ACEITOS.includes(ext)) toast.error(`${f.name}: formato não aceito.`);
      else if (f.size > TAMANHO_MAX) toast.error(`${f.name} passa de 10 MB.`);
      else if (!arquivos.some((a) => a.name === f.name && a.size === f.size)) novos.push(f);
    }
    onChange([...arquivos, ...novos]);
  };

  const estado = (f: File) =>
    enviando ? (
      <span className="flex items-center gap-1 text-xs text-bb-blue">
        <Spinner className="h-3 w-3" /> Enviando
      </span>
    ) : falhou === f.name ? (
      <span className="flex items-center gap-1 text-xs font-semibold text-rose-600">
        <CircleAlert className="h-3.5 w-3.5" /> Falhou
      </span>
    ) : (
      <span className="flex items-center gap-1 text-xs text-slate-500">
        <CircleCheck className="h-3.5 w-3.5" /> Pronto
      </span>
    );

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Anexar arquivos"
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
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
        <p className="text-xs text-bb-muted">PDF, Office, imagens, JSON, CSV, TXT ou ZIP · até 10 MB cada</p>
        <input ref={input} type="file" multiple accept={ACEITOS.map((x) => '.' + x).join(',')} className="hidden" onChange={(e) => adicionar(e.target.files)} />
      </div>
      {erro && <p className="mt-1 text-xs font-semibold text-rose-600">{erro}</p>}
      {arquivos.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {arquivos.map((f) => (
            <li key={f.name + f.size} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${falhou === f.name ? 'border-rose-300 bg-rose-50' : 'border-bb-line'}`}>
              <Paperclip className="h-4 w-4 text-bb-muted" />
              <span className="flex-1 truncate">{f.name}</span>
              <span className="text-xs text-bb-muted">{formatarTamanho(f.size)}</span>
              {estado(f)}
              <button type="button" className="text-slate-400 hover:text-rose-600" onClick={() => onChange(arquivos.filter((x) => x !== f))} aria-label={`Remover ${f.name}`} disabled={enviando}>
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {falhou && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-rose-700">
          <RotateCw className="h-3.5 w-3.5" /> Nada foi registrado. Remova ou substitua o arquivo e envie de novo.
        </p>
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
      {acoes && <div className="flex flex-wrap items-start gap-2">{acoes}</div>}
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
        {rodape && <div className="flex flex-wrap justify-end gap-2 border-t border-bb-line px-6 py-4">{rodape}</div>}
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
