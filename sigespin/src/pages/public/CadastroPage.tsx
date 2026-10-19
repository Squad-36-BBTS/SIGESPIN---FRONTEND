import { CheckCircle2, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { IMAGENS } from '@/assets/imagens';
import { Campo, Spinner } from '@/components/common/ui';
import { authService } from '@/services';
import { mensagemErro } from '@/services/api';
import type { PerfilUsuario } from '@/types/domain';
import { AREAS_DEMANDANTES, PERFIL_DESCRICAO, PERFIL_LABEL } from '@/utils/constants';

import { AuthShell } from './AuthShell';

const PERFIS: PerfilUsuario[] = ['DEMANDANTE', 'ANALISTA', 'ESPECIALISTA'];

// O back-end não prevê autocadastro: esta tela envia um PEDIDO de acesso,
// que a administração aprova definindo o perfil. Rota a confirmar com o back-end.
export default function CadastroPage() {
  const [form, setForm] = useState({ nome: '', email: '', areaId: 0, perfil: 'DEMANDANTE' as PerfilUsuario, justificativa: '' });
  const [erros, setErros] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const validar = () => {
    const e: Record<string, string> = {};
    if (form.nome.trim().split(/\s+/).length < 2) e.nome = 'Informe nome e sobrenome.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Informe um e-mail válido.';
    else if (!/@bbts\.com\.br$/i.test(form.email.trim())) e.email = 'Use o e-mail institucional (@bbts.com.br).';
    if (!form.areaId) e.areaId = 'Selecione a área.';
    if (form.justificativa.trim().length < 10) e.justificativa = 'Conte em poucas palavras por que precisa do acesso.';
    setErros(e);
    return !Object.keys(e).length;
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setErroGeral(null);
    if (!validar()) return;
    setEnviando(true);
    try {
      await authService.solicitarAcesso(form);
      setEnviado(true);
    } catch (e) {
      setErroGeral(mensagemErro(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthShell
      imagem={IMAGENS.cadastro}
      titulo="Participe do Hub de Inovação."
      texto="Demandantes, analistas de inovação e especialistas usam o SIGES-PIN para levar ideias do problema à entrega validada."
    >
      {enviado ? (
        <div className="pop-in text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
          <h1 className="mt-4 text-2xl font-bold">Pedido enviado</h1>
          <p className="mt-2 text-bb-muted">
            A administração do Hub vai analisar o pedido e confirmar o seu perfil. Você receberá a resposta em <strong>{form.email}</strong>.
          </p>
          <Link to="/login" className="btn-primary mt-6">
            Ir para o login
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold tracking-tight">Solicitar acesso</h1>
          <p className="mt-1 text-sm text-bb-muted">
            O perfil final e a alçada de governança são definidos pela administração após a análise do pedido.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            <Campo label="Nome completo" erro={erros.nome} htmlFor="nome">
              <input id="nome" className={`input ${erros.nome ? 'input-erro' : ''}`} value={form.nome} onChange={(e) => set('nome', e.target.value)} autoComplete="name" />
            </Campo>
            <Campo label="E-mail institucional" erro={erros.email} htmlFor="email">
              <input
                id="email"
                type="email"
                className={`input ${erros.email ? 'input-erro' : ''}`}
                placeholder="nome@bbts.com.br"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                autoComplete="email"
              />
            </Campo>
            <Campo label="Área" erro={erros.areaId} htmlFor="area">
              <select id="area" className={`input ${erros.areaId ? 'input-erro' : ''}`} value={form.areaId} onChange={(e) => set('areaId', Number(e.target.value))}>
                <option value={0}>Selecione…</option>
                {AREAS_DEMANDANTES.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.sigla} · {a.nome}
                  </option>
                ))}
              </select>
            </Campo>

            <fieldset>
              <legend className="label">Perfil desejado</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {PERFIS.map((p) => (
                  <label
                    key={p}
                    className={`cursor-pointer rounded-lg border p-3 transition ${
                      form.perfil === p ? 'border-bb-blue bg-bb-blue-light ring-1 ring-bb-blue' : 'border-bb-line hover:border-bb-line-2'
                    }`}
                  >
                    <input type="radio" name="perfil" className="sr-only" checked={form.perfil === p} onChange={() => set('perfil', p)} />
                    <span className="block text-sm font-bold">{PERFIL_LABEL[p]}</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-bb-muted">{PERFIL_DESCRICAO[p]}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <Campo label="Por que precisa do acesso?" erro={erros.justificativa} htmlFor="just">
              <textarea
                id="just"
                rows={3}
                className={`input ${erros.justificativa ? 'input-erro' : ''}`}
                value={form.justificativa}
                onChange={(e) => set('justificativa', e.target.value)}
              />
            </Campo>

            {erroGeral && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{erroGeral}</p>}

            <button type="submit" className="btn-primary h-11 w-full text-base" disabled={enviando}>
              {enviando ? <Spinner /> : <Send className="h-4 w-4" />} Enviar pedido
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-bb-muted">
            Já tem acesso?{' '}
            <Link to="/login" className="font-semibold text-bb-blue hover:underline">
              Entrar
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
