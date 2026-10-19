import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  ClipboardCheck,
  FileSearch,
  History,
  Lock,
  Sparkles,
  Target,
  Upload,
} from 'lucide-react';
import { useEffect, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';

import { IMAGENS } from '@/assets/imagens';
import { Logo } from '@/components/common/ui';
import { useReveal } from '@/hooks';
import { PERFIL_DESCRICAO, PERFIL_LABEL, TRL_DEFINICOES } from '@/utils/constants';

const NAV = [
  { href: '#sistema', label: 'O sistema' },
  { href: '#fluxo', label: 'Como funciona' },
  { href: '#perfis', label: 'Perfis' },
  { href: '#maturidade', label: 'Maturidade' },
  { href: '#duvidas', label: 'Dúvidas' },
];

function irPara(e: MouseEvent<HTMLAnchorElement>, href: string) {
  e.preventDefault();
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Cabeçalho em pílula (ideia do Vise-landing): fica sólido após o topo,
// some ao descer, volta ao subir e mostra o progresso da leitura.
function Header() {
  const [solido, setSolido] = useState(false);
  const [oculto, setOculto] = useState(false);
  const [menu, setMenu] = useState(false);
  const [progresso, setProgresso] = useState(0);

  useEffect(() => {
    let ultimo = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setSolido(y > 24);
        if (y > 400 && y > ultimo + 2) setOculto(true);
        if (y < ultimo - 2) setOculto(false);
        ultimo = y;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgresso(max > 0 ? y / max : 0);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-3 z-50 flex justify-center px-4 transition-transform duration-500 ease-out ${
        oculto && !menu ? '-translate-y-[calc(100%+20px)]' : ''
      }`}
    >
      <div
        className={`relative flex h-14 w-full items-center gap-6 rounded-2xl border pl-4 pr-2 transition-all duration-500 ease-out ${
          solido ? 'max-w-5xl border-bb-line bg-white/85 shadow-float backdrop-blur-md' : 'max-w-6xl border-transparent bg-transparent'
        }`}
      >
        <a href="#topo" onClick={(e) => irPara(e, '#topo')} aria-label="SIGES-PIN, voltar ao topo">
          <Logo />
        </a>
        <nav
          aria-label="Seções"
          className={`${
            menu ? 'absolute inset-x-0 top-16 flex flex-col rounded-2xl border border-bb-line bg-white p-2 shadow-float' : 'hidden'
          } ml-auto gap-1 lg:static lg:flex lg:flex-row lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none`}
        >
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={(e) => {
                irPara(e, n.href);
                setMenu(false);
              }}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-bb-blue-light hover:text-bb-blue"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Link to="/login" className="btn-primary h-10">
            Entrar
          </Link>
          <button type="button" className="btn-ghost h-10 lg:hidden" aria-expanded={menu} onClick={() => setMenu((v) => !v)}>
            {menu ? 'Fechar' : 'Menu'}
          </button>
        </div>
        <span
          className="progresso-leitura absolute inset-x-5 bottom-0 h-px bg-bb-blue"
          style={{ ['--p' as string]: solido ? progresso : 0 }}
          aria-hidden="true"
        />
      </div>
    </header>
  );
}

function Rotulo({ n, texto }: { n: string; texto: string }) {
  return (
    <p className="eyebrow mb-3 flex items-center gap-3 text-bb-blue" data-reveal>
      <span className="font-mono">{n}</span>
      <span className="h-px w-8 bg-bb-blue/40" />
      {texto}
    </p>
  );
}

function Hero() {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} id="topo" className="relative overflow-hidden pb-16 pt-28 sm:pt-32 lg:pb-24">
      {/* Fundo: grade sutil + brilho azul */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at 30% 20%, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 30% 20%, black 20%, transparent 70%)',
        }}
      />
      <div className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[520px] w-[520px] rounded-full bg-bb-blue/10 blur-3xl" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-bb-line bg-white px-3 py-1 text-xs font-bold text-bb-slate shadow-card" data-reveal>
            <span className="h-2 w-2 rounded-full bg-bb-yellow ring-2 ring-bb-blue/30" />
            Hub de Inovação · BB Tecnologia e Serviços
          </p>
          <h1 className="text-[2.6rem] font-bold leading-[1.05] tracking-tight text-bb-slate sm:text-6xl">
            <span data-lines className="block">
              <span>Da ideia ao impacto,</span>
            </span>
            <span data-lines className="block">
              <span>
                com <span className="relative whitespace-nowrap text-bb-blue">governança<span className="absolute inset-x-0 bottom-1 -z-10 h-3 bg-bb-yellow/80 sm:h-4" /></span>.
              </span>
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-bb-muted" data-reveal>
            O SIGES-PIN organiza o portfólio de inovação da BBTS: demandas espontâneas ou de campanhas, triagem com apoio de IA e especialistas, maturidade medida em TRL,
            jornada por marcos reais e decisões de governança registradas com evidências.
          </p>
          <div className="mt-8 flex flex-wrap gap-3" data-reveal>
            <Link to="/login" className="btn-primary h-12 px-6 text-base">
              Acessar o sistema <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/cadastro" className="btn-secondary h-12 px-6 text-base">
              Solicitar acesso
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-slate-600" data-reveal>
            {['Portfólio visível a todos os perfis', 'Demandante valida as entregas', 'Histórico auditável'].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-bb-blue" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <figure className="relative" data-reveal>
          <div className="overflow-hidden rounded-panel border border-white shadow-float">
            <img
              src={IMAGENS.hero}
              alt="Equipe colaborando em notebooks durante sessão de inovação"
              className="aspect-[4/3.4] w-full object-cover"
              loading="eager"
              {...{ fetchpriority: 'high' }}
            />
          </div>
          {/* Cartões flutuantes com dados do sistema */}
          <div className="boiar absolute -left-4 top-8 w-56 rounded-xl border border-bb-line bg-white/95 p-3.5 shadow-float backdrop-blur sm:-left-10">
            <p className="text-[11px] font-bold uppercase tracking-wider text-bb-muted">Atualização de maturidade</p>
            <p className="mt-1 text-sm font-bold text-bb-slate">TRL 3 → TRL 4</p>
            <div className="mt-2 flex gap-0.5">
              {Array.from({ length: 9 }, (_, i) => (
                <span key={i} className={`h-1.5 flex-1 rounded-full ${i < 3 ? 'bg-bb-blue' : i === 3 ? 'bg-bb-yellow' : 'bg-slate-200'}`} />
              ))}
            </div>
            <span className="badge mt-2.5 border-amber-200 bg-amber-50 text-amber-800">Com 3 evidências</span>
          </div>
          <div className="boiar absolute -bottom-6 right-2 w-60 rounded-xl border border-bb-line bg-white/95 p-3.5 shadow-float backdrop-blur [animation-delay:-2.5s] sm:-right-6">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-bb-blue-light text-bb-blue">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-bb-muted">Sugestão da IA</p>
                <p className="text-sm font-bold text-bb-slate">Eficiência operacional</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-bb-muted">Você revisa; a equipe de inovação faz a triagem.</p>
          </div>
        </figure>
      </div>
    </section>
  );
}

function Sistema() {
  const ref = useReveal<HTMLElement>();
  const itens = [
    { icon: FileSearch, t: 'Demandas espalhadas', d: 'Ideias chegam por e-mail, planilha e reunião, sem um registro único nem critério de entrada.' },
    { icon: Target, t: 'Maturidade sem régua', d: 'Sem uma escala comum, cada área descreve o estágio da tecnologia de um jeito diferente.' },
    { icon: History, t: 'Decisões sem rastro', d: 'Aprovações e mudanças de rumo ficam sem justificativa e sem evidências consultáveis.' },
  ];
  return (
    <section ref={ref} id="sistema" className="scroll-mt-24 border-y border-bb-line bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-end">
          <div>
            <Rotulo n="01" texto="O sistema" />
            <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl" data-lines>
              <span>Um só lugar para o portfólio</span>
              <span>de inovação da BBTS.</span>
            </h2>
          </div>
          <p className="text-lg leading-relaxed text-bb-muted" data-reveal>
            O SIGES-PIN segue o procedimento normativo PRO663-009. As demandas entram de forma espontânea ou por campanhas, passam
            pela triagem da equipe de inovação e evoluem por marcos reais, com a maturidade medida pelas evidências.
          </p>
        </div>
        <div className="mt-6 h-px bg-bb-line" data-rule />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {itens.map((i) => (
            <article key={i.t} className="card card-hover p-6" data-reveal>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-bb-blue-light text-bb-blue">
                <i.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{i.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-bb-muted">{i.d}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Fluxo() {
  const ref = useReveal<HTMLElement>();
  const passos = [
    {
      img: IMAGENS.ideia,
      icon: Sparkles,
      t: 'Entrada da demanda',
      d: 'Espontânea, no backlog de ideias, problemas e oportunidades, ou induzida por campanhas, desafios, hackathons e residência. A IA ajuda no preenchimento.',
    },
    {
      img: IMAGENS.analise,
      icon: Upload,
      t: 'Triagem e qualificação',
      d: 'O Analista de Inovação avalia aderência à Tese, relevância, grau de inovação, viabilidade e TRL, e consulta especialistas quando precisa.',
    },
    {
      img: IMAGENS.comite,
      icon: ClipboardCheck,
      t: 'Governança, quando necessária',
      d: 'Demandas qualificadas seguem para quem tem alçada priorizar e decidir. O que cabe na alçada da equipe vai direto para a experimentação.',
    },
    {
      img: IMAGENS.acompanhamento,
      icon: BarChart3,
      t: 'Experimentação e validação',
      d: 'PoC e MVP evoluem por marcos e evidências. O demandante, dono do problema, valida as entregas.',
    },
  ];
  return (
    <section ref={ref} id="fluxo" className="scroll-mt-24 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Rotulo n="02" texto="Como funciona" />
        <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl" data-lines>
          <span>Do problema à entrega validada.</span>
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-bb-muted" data-reveal>
          O Kanban reflete os marcos reais da jornada, e o TRL é atualizado a partir das evidências produzidas no caminho.
        </p>
        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {passos.map((p, i) => (
            <li key={p.t} className="card card-hover group overflow-hidden" data-reveal>
              <div className="relative overflow-hidden">
                <img src={p.img} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 font-mono text-xs font-bold text-bb-blue backdrop-blur">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="p-5">
                <h3 className="flex items-center gap-2 font-bold">
                  <p.icon className="h-4 w-4 text-bb-blue" /> {p.t}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-bb-muted">{p.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Perfis() {
  const ref = useReveal<HTMLElement>();
  const perfis = [
    { p: 'DEMANDANTE' as const, img: IMAGENS.perfilDemandante },
    { p: 'ANALISTA' as const, img: IMAGENS.perfilAnalista },
    { p: 'ESPECIALISTA' as const, img: IMAGENS.perfilEspecialista },
  ];
  return (
    <section ref={ref} id="perfis" className="scroll-mt-24 bg-bb-navy py-20 text-white lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="eyebrow mb-3 flex items-center gap-3 text-bb-yellow" data-reveal>
          <span className="font-mono">03</span>
          <span className="h-px w-8 bg-bb-yellow/50" />
          Perfis
        </p>
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl" data-lines>
            <span>Três perfis.</span>
            <span>A governança é uma alçada.</span>
          </h2>
          <p className="text-lg text-white/70" data-reveal>
            Todos consultam o portfólio inteiro. Especialistas e gestores com alçada de governança também priorizam e decidem,
            conforme o papel de cada um na jornada.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {perfis.map(({ p, img }) => (
            <article key={p} className="group overflow-hidden rounded-card border border-white/10 bg-white/5" data-reveal>
              <img src={img} alt="" loading="lazy" className="aspect-[5/4] w-full object-cover opacity-90 grayscale-[30%] transition duration-500 group-hover:opacity-100 group-hover:grayscale-0" />
              <div className="p-5">
                <h3 className="text-lg font-bold">{PERFIL_LABEL[p]}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/70">{PERFIL_DESCRICAO[p]}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Maturidade() {
  const ref = useReveal<HTMLElement>();
  const etapas = ['Backlog', 'Qualificação', 'Governança', 'Experimentação', 'MVP', 'Concluído'];
  return (
    <section ref={ref} id="maturidade" className="scroll-mt-24 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Rotulo n="04" texto="Maturidade" />
        <h2 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl" data-lines>
          <span>Três leituras do mesmo projeto.</span>
        </h2>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <article className="card p-6" data-reveal>
            <p className="eyebrow">Régua TRL</p>
            <h3 className="mt-1 text-lg font-bold">Prontidão tecnológica de 1 a 9</h3>
            {/* Os 9 níveis em três faixas de maturidade (sem pular níveis) */}
            <div className="mt-5 space-y-3">
              {[
                { faixa: 'Pesquisa', niveis: [1, 2, 3], cor: 'bg-sky-100 text-sky-800' },
                { faixa: 'Desenvolvimento', niveis: [4, 5, 6], cor: 'bg-blue-100 text-blue-800' },
                { faixa: 'Operação', niveis: [7, 8, 9], cor: 'bg-bb-blue text-white' },
              ].map((g) => (
                <div key={g.faixa}>
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-bb-muted">{g.faixa}</p>
                  <ul className="space-y-1">
                    {g.niveis.map((n) => (
                      <li key={n} className="flex items-center gap-2.5 text-sm">
                        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${g.cor}`}>{n}</span>
                        <span className="text-slate-600">{TRL_DEFINICOES[n].titulo}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm text-bb-muted">O TRL é um indicador: o Analista o atualiza a partir das evidências e dos resultados.</p>
          </article>

          <article className="card p-6" data-reveal>
            <p className="eyebrow">Kanban de etapas</p>
            <h3 className="mt-1 text-lg font-bold">Marcos reais da jornada</h3>
            <div className="mt-5 space-y-2">
              {etapas.map((e, i) => (
                <div key={e} className="flex items-center gap-3">
                  <span className={`h-2.5 rounded-full bg-bb-blue`} style={{ width: `${25 + i * 13}%`, opacity: 0.3 + i * 0.14 }} />
                  <span className="text-sm font-semibold text-slate-600">{e}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm text-bb-muted">
              Marcos dentro da alçada da equipe são registrados pelo Analista; priorização e decisões ficam com a governança.
            </p>
          </article>

          <article className="card p-6" data-reveal>
            <p className="eyebrow">Radar 4D</p>
            <h3 className="mt-1 text-lg font-bold">Negócio, produto, time e receita</h3>
            <svg viewBox="0 0 200 160" className="mx-auto mt-3 h-40 w-full" aria-label="Exemplo de radar: leitura inicial e atual">
              {[1, 2, 3, 4].map((k) => (
                <polygon key={k} points={`100,${80 - k * 17} ${100 + k * 17},80 100,${80 + k * 17} ${100 - k * 17},80`} fill="none" stroke="#E2E8F0" />
              ))}
              <polygon points="100,46 134,80 100,106 75,80" fill="rgba(148,163,184,.15)" stroke="#94A3B8" strokeDasharray="4 4" />
              <polygon points="100,26 155,80 100,123 58,80" fill="rgba(0,94,239,.15)" stroke="#005EEF" strokeWidth="2" />
              <text x="100" y="8" textAnchor="middle" fontSize="10" fill="#1E293B" fontWeight="700">Negócio</text>
              <text x="190" y="83" textAnchor="end" fontSize="10" fill="#1E293B" fontWeight="700">Produto</text>
              <text x="100" y="158" textAnchor="middle" fontSize="10" fill="#1E293B" fontWeight="700">Time</text>
              <text x="10" y="83" fontSize="10" fill="#1E293B" fontWeight="700">Receita</text>
            </svg>
            <p className="mt-2 text-sm text-bb-muted">Notas de 0 a 4. A leitura inicial nasce com o projeto e é comparada às avaliações seguintes.</p>
          </article>
        </div>

        <div className="mt-5 grid gap-5 rounded-panel bg-white p-6 shadow-card ring-1 ring-bb-line md:grid-cols-3" data-reveal>
          {[
            { icon: Lock, t: 'Financeiro protegido', d: 'O dispêndio estimado aparece para a gestão do portfólio, não para o demandante.' },
            { icon: History, t: 'Histórico imutável', d: 'Cada mudança aprovada registra quem decidiu, quando e qual pedido a originou.' },
            { icon: ClipboardCheck, t: 'Pareceres técnicos', d: 'Especialistas subsidiam a qualificação e as decisões quando é preciso conhecimento específico.' },
          ].map((x) => (
            <div key={x.t} className="flex gap-3">
              <x.icon className="mt-0.5 h-5 w-5 shrink-0 text-bb-blue" />
              <div>
                <p className="font-bold">{x.t}</p>
                <p className="text-sm text-bb-muted">{x.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Duvidas() {
  const ref = useReveal<HTMLElement>();
  const [aberta, setAberta] = useState(0);
  const itens = [
    {
      q: 'Quem pode registrar uma demanda?',
      a: 'O Demandante, a qualquer momento (entrada espontânea) ou respondendo a uma campanha, desafio, hackathon ou residência (entrada induzida). A demanda entra no backlog e segue para a triagem.',
    },
    {
      q: 'A IA aprova alguma coisa?',
      a: 'Não. A IA só ajuda a preencher o cadastro. A triagem e a qualificação são feitas pelo Analista de Inovação, com pareceres de especialistas quando necessário.',
    },
    {
      q: 'Todo avanço precisa passar por um comitê?',
      a: 'Não. O que está dentro da alçada da equipe de inovação segue direto. Priorização, investimento e mudanças de rumo vão para quem tem alçada de governança.',
    },
    {
      q: 'Qual é o papel do demandante depois do cadastro?',
      a: 'Ele é o dono do problema: complementa a demanda quando a triagem pede, acompanha a jornada e valida as entregas e o MVP. O projeto só é concluído com uma entrega validada por ele.',
    },
    {
      q: 'Quem vê os valores financeiros?',
      a: 'A equipe de inovação e os gestores com alçada. Para o Demandante, o dispêndio estimado não é exibido.',
    },
    {
      q: 'Como consigo acesso?',
      a: 'Use o e-mail institucional em “Solicitar acesso”. O pedido é avaliado pela administração do Hub de Inovação, que define o seu perfil.',
    },
  ];
  return (
    <section ref={ref} id="duvidas" className="scroll-mt-24 border-t border-bb-line bg-white py-20 lg:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <Rotulo n="05" texto="Dúvidas" />
          <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl" data-lines>
            <span>Perguntas antes</span>
            <span>de começar.</span>
          </h2>
        </div>
        <div className="divide-y divide-bb-line border-y border-bb-line" data-reveal>
          {itens.map((it, i) => {
            const open = aberta === i;
            return (
              <div key={it.q}>
                <button
                  className="flex w-full items-center justify-between gap-4 py-5 text-left font-bold text-bb-slate transition-colors hover:text-bb-blue"
                  aria-expanded={open}
                  onClick={() => setAberta(open ? -1 : i)}
                >
                  {it.q}
                  <ChevronDown className={`h-5 w-5 shrink-0 text-bb-muted transition-transform duration-300 ${open ? 'rotate-180 text-bb-blue' : ''}`} />
                </button>
                {/* Altura animada com grid-rows (sem JS de medição) */}
                <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <p className="pb-5 pr-8 leading-relaxed text-bb-muted">{it.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Final() {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} className="px-4 py-20 sm:px-6">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-panel bg-bb-blue px-6 py-14 text-white sm:px-12" data-reveal>
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-bb-yellow/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-bb-navy/60 blur-3xl" />
        <div className="relative grid gap-8 md:grid-cols-[1.5fr_1fr] md:items-center">
          <div>
            <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">Tem uma dor que pode virar inovação?</h2>
            <p className="mt-3 max-w-xl text-white/80">
              Entre com seu e-mail institucional e registre a demanda. A IA ajuda no preenchimento, e o portfólio inteiro acompanha a evolução.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link to="/login" className="btn-accent h-12 px-6 text-base">
              Entrar no SIGES-PIN <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/cadastro" className="btn h-12 border border-white/30 px-6 text-base text-white hover:bg-white/10">
              Solicitar acesso
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Rodape() {
  return (
    <footer className="border-t border-bb-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-bb-muted">Sistema Corporativo de Gestão do Portfólio de Inovação · BB Tecnologia e Serviços.</p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-slate-600">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} onClick={(e) => irPara(e, n.href)} className="hover:text-bb-blue">
              {n.label}
            </a>
          ))}
        </div>
      </div>
      <div className="border-t border-bb-line">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-bb-muted sm:px-6">
          Ambiente restrito de governança corporativa · Procedimento PRO663-009 · Fotos: Unsplash
        </p>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="overflow-x-clip">
      <a href="#sistema" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Pular para o conteúdo
      </a>
      <Header />
      <main>
        <Hero />
        <Sistema />
        <Fluxo />
        <Perfis />
        <Maturidade />
        <Duvidas />
        <Final />
      </main>
      <Rodape />
    </div>
  );
}
