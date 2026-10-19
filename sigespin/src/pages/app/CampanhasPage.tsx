import { CalendarDays, Megaphone, Plus, Sprout } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Campo, Erro, Modal, PageHeader, Selo, Skeleton, Spinner, Vazio } from '@/components/common/ui';
import { useAsync, useAuth } from '@/hooks';
import { campanhaService } from '@/services';
import { mensagemErro } from '@/services/api';
import type { TipoCampanha } from '@/types/domain';
import { TIPO_CAMPANHA_LABEL } from '@/utils/constants';
import { formatarData } from '@/utils/formatters';

const TIPOS: TipoCampanha[] = ['CAMPANHA', 'DESAFIO', 'HACKATHON', 'RESIDENCIA'];

// Entrada induzida: campanhas, desafios, hackathons e residências mobilizam demandas.
// A entrada espontânea (backlog) continua disponível a qualquer momento.
export default function CampanhasPage() {
  const { temPerfil } = useAuth();
  const { dados, erro, recarregar } = useAsync(() => campanhaService.listar(), []);
  const [nova, setNova] = useState(false);
  const [encerrando, setEncerrando] = useState<number | null>(null);

  const encerrar = async (id: number) => {
    setEncerrando(id);
    try {
      await campanhaService.encerrar(id);
      toast.success('Campanha encerrada. As demandas recebidas continuam no portfólio.');
      recarregar();
    } catch (e) {
      toast.error(mensagemErro(e));
    } finally {
      setEncerrando(null);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Entrada induzida"
        titulo="Campanhas e desafios"
        descricao="Mobilizações que convidam as áreas a registrar demandas sobre um tema. Ideias livres continuam entrando pelo backlog espontâneo."
        acoes={
          <>
            {temPerfil('DEMANDANTE') && (
              <Link to="/app/demandas/nova" className="btn-secondary">
                <Sprout className="h-4 w-4" /> Demanda espontânea
              </Link>
            )}
            {temPerfil('ANALISTA') && (
              <button className="btn-primary" onClick={() => setNova(true)}>
                <Plus className="h-4 w-4" /> Nova campanha
              </button>
            )}
          </>
        }
      />

      {erro && <Erro texto={erro} onTentar={recarregar} />}
      {!dados ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : dados.length === 0 ? (
        <Vazio titulo="Nenhuma campanha" texto="A equipe de inovação ainda não abriu campanhas." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dados.map((c) => {
            const aberta = c.status === 'ABERTA';
            return (
              <article key={c.id} className={`card card-hover flex flex-col p-5 ${aberta ? '' : 'opacity-75'}`}>
                <div className="flex items-center justify-between gap-2">
                  <Selo classe="border-orange-200 bg-orange-50 text-orange-800">
                    <Megaphone className="h-3 w-3" /> {TIPO_CAMPANHA_LABEL[c.tipo]}
                  </Selo>
                  <Selo classe={aberta ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-500'}>{aberta ? 'Aberta' : 'Encerrada'}</Selo>
                </div>
                <h2 className="mt-3 text-lg font-bold leading-snug">{c.titulo}</h2>
                <p className="mt-1 text-xs font-semibold text-bb-blue">{c.tema}</p>
                <p className="mt-2 flex-1 text-sm text-bb-muted">{c.descricao}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-bb-muted">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" /> {formatarData(c.inicio)} a {formatarData(c.fim)}
                  </span>
                  <span className="font-bold text-bb-slate">{c.totalDemandas ?? 0} demandas</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-bb-line pt-4">
                  <Link to={`/app/portfolio?campanha=${c.id}`} className="btn-ghost btn-sm">
                    Ver demandas
                  </Link>
                  {aberta && temPerfil('DEMANDANTE') && (
                    <Link to={`/app/demandas/nova?campanha=${c.id}`} className="btn-primary btn-sm ml-auto">
                      Participar
                    </Link>
                  )}
                  {aberta && temPerfil('ANALISTA') && (
                    <button className="btn-secondary btn-sm ml-auto" disabled={encerrando === c.id} onClick={() => encerrar(c.id)}>
                      {encerrando === c.id && <Spinner className="h-3 w-3" />} Encerrar
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <NovaCampanhaModal aberto={nova} onFechar={() => setNova(false)} onCriada={recarregar} />
    </div>
  );
}

function NovaCampanhaModal({ aberto, onFechar, onCriada }: { aberto: boolean; onFechar: () => void; onCriada: () => void }) {
  const hoje = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ titulo: '', tipo: 'DESAFIO' as TipoCampanha, tema: '', descricao: '', inicio: hoje, fim: '' });
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.titulo.trim().length < 5 || form.descricao.trim().length < 15 || !form.tema.trim()) return setErro('Preencha título, tema e descrição.');
    if (!form.fim || form.fim < form.inicio) return setErro('A data de término deve ser posterior ao início.');
    setEnviando(true);
    try {
      await campanhaService.criar({ ...form, inicio: new Date(form.inicio).toISOString(), fim: new Date(form.fim).toISOString() });
      toast.success('Campanha aberta.');
      onCriada();
      onFechar();
      setForm({ titulo: '', tipo: 'DESAFIO', tema: '', descricao: '', inicio: hoje, fim: '' });
    } catch (er) {
      toast.error(mensagemErro(er));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo="Nova campanha"
      descricao="Campanhas, desafios, hackathons e residências geram demandas induzidas."
      largura="max-w-xl"
      rodape={
        <>
          <button className="btn-ghost" onClick={onFechar} disabled={enviando}>
            Cancelar
          </button>
          <button type="submit" form="form-campanha" className="btn-primary" disabled={enviando}>
            {enviando && <Spinner />} Abrir campanha
          </button>
        </>
      }
    >
      <form id="form-campanha" onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
          <Campo label="Título" htmlFor="c-tit">
            <input id="c-tit" className="input" value={form.titulo} onChange={(e) => set('titulo', e.target.value)} />
          </Campo>
          <Campo label="Tipo" htmlFor="c-tipo">
            <select id="c-tipo" className="input" value={form.tipo} onChange={(e) => set('tipo', e.target.value as TipoCampanha)}>
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {TIPO_CAMPANHA_LABEL[t]}
                </option>
              ))}
            </select>
          </Campo>
        </div>
        <Campo label="Tema" htmlFor="c-tema">
          <input id="c-tema" className="input" value={form.tema} onChange={(e) => set('tema', e.target.value)} />
        </Campo>
        <Campo label="Chamada / desafio proposto" htmlFor="c-desc">
          <textarea id="c-desc" rows={3} className="input" value={form.descricao} onChange={(e) => set('descricao', e.target.value)} />
        </Campo>
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Início" htmlFor="c-ini">
            <input id="c-ini" type="date" className="input" value={form.inicio} onChange={(e) => set('inicio', e.target.value)} />
          </Campo>
          <Campo label="Término" htmlFor="c-fim">
            <input id="c-fim" type="date" className="input" value={form.fim} onChange={(e) => set('fim', e.target.value)} />
          </Campo>
        </div>
        {erro && <p className="text-sm font-semibold text-rose-600">{erro}</p>}
      </form>
    </Modal>
  );
}
