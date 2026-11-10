# SIGES-PIN — Visão geral do front-end

Este documento explica o site inteiro para quem vai trabalhar em uma parte dele: o que o sistema faz, os fluxos, cada tela, as regras, o design e como o código está organizado.

---

## 1. O que é o sistema

O **SIGES-PIN** é o sistema de gestão do **portfólio de inovação da BBTS**. Ele acompanha uma ideia desde o registro até a conclusão ou o descarte:

1. alguém registra um problema, necessidade ou oportunidade (**demanda**);
2. um Analista faz a triagem e a qualificação;
3. Especialistas dão pareceres técnicos quando precisa;
4. a maturidade é medida em **TRL** (1 a 9);
5. o projeto anda pelas etapas do **Kanban** (Ideação → POC → MVP → Concluído, ou Descontinuado);
6. entregas e MVPs são validados pelo dono do problema.

Tudo fica registrado com autor, data e evidências.

A base é o guia **“SIGES-PIN — Fluxo de usuário para protótipo do Front-end”** e a documentação de domínio em `docs/`.

### O que é simulado

O protótipo roda sozinho, sem back-end. Ficam simulados:
- login;
- API, com um banco em memória que aplica todas as regras;
- sugestão de IA;
- envio de arquivos.

Cada item simulado aparece marcado na tela, por exemplo “Modo demonstração” e “Simulado”.

---

## 2. Tecnologia

| Item | Uso |
|---|---|
| **TypeScript** (modo estrito) | Linguagem de todo o front-end (`.ts` e `.tsx`) |
| **React 18** | Componentes e telas |
| **Vite 5** | Servidor de desenvolvimento e build |
| **Tailwind CSS 3.4** | Estilo, com as cores da BBTS em `tailwind.config.js` |
| React Router 6 | Rotas |
| Axios | Chamadas à API (Spring Boot, via proxy `/api` → `localhost:8080`) |
| Chart.js + react-chartjs-2 | Gráficos do dashboard e radar 4D |
| lucide-react | Ícones |
| sonner | Avisos (toasts) |

### Como rodar

```bash
npm install
npm run dev
```

- Endereço: <http://localhost:3000>.
- Antes de rodar, copie `.env.example` para `.env`. Os valores padrão são `VITE_USE_MOCK=true` e `VITE_API_BASE_URL=/api`.
- `npm run build` checa os tipos e gera a versão de produção.

### Usuários de teste

A senha está em `src/services/mock/seed.ts`.

| Perfil | E-mail | Observação |
|---|---|---|
| Demandante | `demandante@bbts.com.br` | Mariana Costa, dona de várias demandas |
| Analista | `analista@bbts.com.br` | Rafael Lima, conduz várias iniciativas |
| Especialista | `especialista@bbts.com.br` | Fernanda Rocha, Segurança da informação |
| Especialista | `joao.prado@bbts.com.br` | João Prado, Dados e IA |

- Na tela de login, os botões de “Login simulado” preenchem e-mail e senha.
- **Restaurar dados:** em **Meu perfil** (ou na entrada simplificada, quando o zip 1 não está junto), essa opção volta o banco simulado ao estado inicial.
- **Falha de envio:** para simular uma falha, anexe um arquivo com `#falha` no nome.

---

## 3. Perfis e regras

São **três perfis**. Não existem perfis de Executivo ou Comitê nesta versão: o Especialista acumula a decisão de governança.

| Perfil | Papel |
|---|---|
| **Demandante** | Dono do problema. Registra a demanda, acompanha, adiciona contexto e **valida** entregas e MVPs. |
| **Analista** | Faz triagem e qualificação, consulta Especialistas, avalia o TRL, movimenta o Kanban e publica entregas. A primeira qualificação define o Analista que **conduz** a iniciativa. |
| **Especialista** | Emite **parecer técnico** e **decide** transições que exigem governança. Parecer e decisão são ações diferentes. |

Todos os perfis **consultam o portfólio inteiro**. O que muda é o que cada um pode fazer.

### Matriz de ações

A matriz fica em `src/utils/permissoes.ts`. É a fonte única, usada pela tela e pelo banco simulado.

| Ação | Demandante | Analista | Especialista |
|---|:-:|:-:|:-:|
| Consultar portfólio | Sim | Sim | Sim |
| Registrar demanda | Sim | *A definir* | *A definir* |
| Qualificar demanda | Não | Sim | Não |
| Consultar Especialista | Não | Sim | — |
| Emitir parecer técnico | Não | Não | Sim |
| Avaliação de TRL | Não | Sim | *A definir* |
| Mover sem governança | Não | Sim | *A definir* |
| Solicitar transição com governança | Não | Sim | Não |
| Decidir transição com governança | Não | Não | Sim |
| Publicar entrega/MVP | Não | Sim | *A definir* |
| Validar entrega/MVP | Sim (dono) | Não | Não |
| Configurar etapas e transições | *A definir* | *A definir* | *A definir* |

**“A definir”** ainda depende de decisão do cliente. Na tela, a ação aparece **desabilitada**, com o selo **“Em discussão”** e o motivo.

### Regras que valem em todo o site

- **TRL é indicador**, não pedido de avanço. Pode subir ou descer, sempre com justificativa e evidência. Uma **redução** exige justificativa de pelo menos 40 caracteres e fica destacada.
- **Kanban configurável.** As etapas iniciais são Ideação, POC, MVP, Concluído e Descontinuado. Cada transição diz se **exige governança**:
  - **sem governança:** o Analista move direto, com justificativa;
  - **com governança:** o Analista cria uma **solicitação** e o projeto **continua na etapa atual** até o Especialista aprovar (o projeto avança) ou rejeitar (fica onde está);
  - só pode haver uma solicitação pendente por projeto.
- **Validação não muda nada sozinha.** Validar uma entrega (validada, com ressalvas ou não validada) não altera o TRL nem a etapa.
- **Etapa e tarefa são coisas diferentes.** “Aguardando triagem”, “Aguardando parecer”, “Aguardando governança” e “Aguardando validação” são **pendências**, mostradas como selos tracejados, e não colunas do Kanban.
- **Projeto em etapa final** (Concluído ou Descontinuado) não aceita ações do ciclo.
- **Dados financeiros** (`dispendioEstimado`) não aparecem em nenhuma tela até o cliente definir a política.
- **Sem autocadastro.** A tela de cadastro envia um **pedido de acesso**; a administração do Hub analisa e define o perfil. Como o guia ainda não definiu essa etapa, a tela é marcada “Em discussão” e o envio é simulado.

### Comportamento de todos os formulários

1. **Preencher → Revisar → Confirmar.** Antes de enviar, aparece um resumo do que vai ser registrado.
2. Depois do sucesso, a mensagem diz **o que mudou e quem é o próximo responsável**.
3. Se outra pessoa alterou o projeto ao mesmo tempo (erro 409), aparece o aviso com o botão **Recarregar**.
4. Anexos são validados em tipo e tamanho (10 MB; PDF, Office, imagens, JSON, CSV, TXT, ZIP) e mostram o estado do envio (pronto, enviando, falhou). Uma falha não registra nada e permite reenviar.
5. Toda ação indisponível mostra o **motivo**, em vez de sumir ou ficar sem explicação.

---

## 4. Os 4 fluxos e as telas

O projeto tem **uma base comum** e **quatro zips de fluxo**, um para cada perfil do login simulado: Demandante, Analista, Especialista · Segurança da informação e Especialista · Dados e IA. O Especialista tem duas jornadas no guia (3.3 A, parecer técnico, e 3.3 B, decisão de governança), e cada uma ficou com um dos dois Especialistas do login. Cada parte é uma pasta em `src/fluxos/`.

```
Landing ─┬─ Login ──→ Dashboard ─┬─ Minha fila ─────────┐
         └─ Cadastro             ├─ Portfólio ──────────┼──→ Detalhe do projeto
            (pedido de acesso)   ├─ Nova demanda        │     (ações de cada perfil)
                                 ├─ Ações de mobilização│
                                 ├─ Configurar Kanban   │
                                 └─ Meu perfil          │
```

| Zip | Login de teste | Pastas | Telas | Quantas |
|---|---|---|---|---|
| 1 · Demandante + acesso | Mariana Costa | `acesso/`, `demandante/` | Landing, Login, Cadastro, Nova demanda, Validar entrega | 5 |
| 2 · Analista | Rafael Lima | `analista/` | Qualificação, Consultar Especialista, Avaliação TRL, Movimentar Kanban, Publicar entrega | 5 |
| 3 · Especialista · Segurança da informação | Fernanda Rocha | `governanca/` + Portfólio e Minha fila | Decidir transição, Configurar Kanban, Meu perfil, **Portfólio**, **Minha fila** | 5 |
| 4 · Especialista · Dados e IA | João Prado | `parecer/`, `visao-geral/` + Detalhe do projeto | Emitir parecer, Dashboard, Ações de mobilização, **Detalhe do projeto** | 4 |

**Por que a divisão é justa:**
- **Perfis respeitados:** cada perfil fica com as ações dele no próprio zip.
- **Telas compartilhadas com dono:** como o Especialista tem poucas ações no guia, as telas compartilhadas também ganharam responsável. Elas continuam em todos os zips, porque sem elas nenhum zip roda, mas só o responsável altera:
  - **Portfólio** e **Minha fila** ficam com o zip 3, que já cuida do Kanban e da governança;
  - **Detalhe do projeto** fica com o zip 4. É a maior tela do sistema (8 abas, cerca de 760 linhas) e por isso vale por mais de uma.
- **Seções da Minha fila:** cada zip mantém a seção do seu perfil (`fila.tsx`). Essas seções não entram na contagem acima.

### Base comum (vai em todos os zips)

São as telas compartilhadas pelos três perfis, mais tudo o que faz o site funcionar. As três telas abaixo têm responsável: a **Minha fila** e o **Portfólio** são do zip 3; o **Detalhe do projeto** é do zip 4.

| Tela | Rota | O que tem |
|---|---|---|
| **Minha fila** | `/app/fila` | As tarefas pendentes do perfil. As seções vêm de cada fluxo (`fila.tsx`). |
| **Portfólio** | `/app/portfolio` | Lista ou Kanban, com colunas da configuração, busca, filtros (etapa, origem, ação de mobilização, arena, pendência), contagens e paginação. |
| **Detalhe do projeto** | `/app/projetos/:id` | Cabeçalho com etapa, TRL, origem e responsáveis; selos de pendência; barra **“Suas ações”** (vinda dos fluxos); 8 abas, descritas abaixo. |
| Entrada simplificada | `/login` | Usada **só** quando o zip 1 (landing e login) não está junto: escolhe um usuário de teste para entrar. |
| Não encontrado | `*` | Página 404. |

As 8 abas do Detalhe do projeto:
- **Visão geral:** problema, contexto, hipótese, origem, Lei do Bem.
- **Participação:** conversa entre demandante, analista e especialistas.
- **Qualificação e pareceres:** qualificações em ordem cronológica, consultas e respostas.
- **Maturidade (TRL):** régua TRL de 1 a 9, radar 4D (inicial × atual) e histórico de avaliações.
- **Kanban:** transições disponíveis, solicitações e decisões, movimentações.
- **Entregas:** entregas, MVPs e as validações.
- **Evidências:** tabela com arquivo, tipo, registro de origem, autor/data e estado de envio.
- **Histórico:** linha do tempo de tudo, só para consulta.

A base também inclui:
- configurações;
- tipos;
- serviços da API e banco simulado;
- matriz de permissões;
- componentes visuais;
- menu lateral;
- formulário com revisão (`components/projeto/formulario.tsx`);
- radar 4D e régua TRL;
- documentação.

### Zip 1 · Demandante + landing, login e cadastro

Pastas: `src/fluxos/acesso/` e `src/fluxos/demandante/`. Login de teste: **Mariana Costa**.

Esta parte cobre a entrada no sistema e a jornada do guia 3.1: o Demandante registra a demanda, acompanha e valida entregas.

| Tela ou ação | Onde | O que tem |
|---|---|---|
| **Landing page** | `/` | Apresentação do sistema com fotos reais. Seções: topo, “O sistema”, “Como funciona” (jornada em 4 passos), Perfis, Maturidade (TRL em 3 faixas: Pesquisa, Desenvolvimento e Operação, com os 9 níveis), Dúvidas frequentes e chamada final. Botões “Acessar o sistema” e “Solicitar acesso”. |
| **Login** | `/login` | E-mail e senha, mostrar/ocultar senha, erros, bloqueio após 5 tentativas (60 s), aviso de sessão expirada, atalhos de login simulado e link “Solicitar acesso”. |
| **Cadastro** | `/cadastro` | **Pedido de acesso:** nome, e-mail institucional (@bbts.com.br), área, perfil desejado e justificativa. Não cria conta: a administração analisa e define o perfil. Marcado como **“Em discussão”** e **“Simulado”**, porque o guia ainda não definiu essa etapa. E-mail já cadastrado gera aviso. |
| **Nova demanda** | `/app/demandas/nova` | Origem **espontânea** (problema, necessidade, oportunidade) ou **induzida** (associada a uma ação de mobilização). Título, área, descrição e contexto. **Sugestão da IA** (simulada) que só preenche campos para revisão. Revisão e confirmação. Para outros perfis, explica que está “a definir”. A demanda entra em **Ideação**, aguardando triagem. |
| **Validar entrega** | Detalhe do projeto e Minha fila | Mostra descrição e evidências; resultado validada, com ressalvas ou não validada; observações. Não muda Kanban nem TRL. |
| **Adicionar contexto** | Detalhe do projeto | Leva à aba Participação. |
| **Minha fila do Demandante** | `/app/fila` | “Entregas aguardando a sua validação” e “Minhas demandas”. |

### Zip 2 · Analista: qualificar e conduzir

Pasta: `src/fluxos/analista/`. Login de teste: **Rafael Lima**.

> Guia 3.2. O Analista faz a triagem, qualifica, consulta, avalia o TRL, move o Kanban e publica entregas.

| Tela ou ação | O que tem |
|---|---|
| **Qualificação** | Aderência à tese, relevância, grau de inovação, viabilidade (texto), TRL avaliado, fundamentação e conclusão. Novas qualificações preservam as anteriores e não movem o Kanban. |
| **Consultar Especialista** | Área técnica e, opcionalmente, um especialista; pergunta dirigida. Sem pessoa escolhida, qualquer especialista da área responde. |
| **Avaliação de TRL** | Seletor de 1 a 9 com o atual marcado, alerta de redução, justificativa, leitura opcional do radar 4D e evidência obrigatória. |
| **Movimentar no Kanban** | Transições permitidas a partir da etapa atual, indicando “com governança” ou “sem governança”. Com governança, vira solicitação, exige evidência e o projeto fica na etapa. |
| **Publicar entrega/MVP** | Título, descrição, “é MVP”, arquivos. Segue para o Demandante validar. |
| **Minha fila do Analista** | Aguardando triagem, solicitações pendentes, decisões recebidas, pareceres recebidos e validações recebidas. |

Todas as ações aparecem na barra **“Suas ações”** do Detalhe do projeto. O Especialista vê as ações “a definir” para ele (TRL, mover, entrega) desabilitadas, com o selo “Em discussão”.

### Zip 3 · Especialista · Segurança da informação: governança e Kanban

Pasta: `src/fluxos/governanca/`, mais a responsabilidade pelas telas compartilhadas Portfólio (`src/pages/app/PortfolioPage.tsx`) e Minha fila (`src/pages/app/MinhaFilaPage.tsx`). Login de teste: **Fernanda Rocha**. Guia 3.3 B: o Especialista decide as transições que exigem governança.

| Tela ou ação | Onde | O que tem |
|---|---|---|
| **Decidir transição** | Detalhe (aba Kanban e “Suas ações”), Minha fila | Etapa atual → destino, justificativa e evidências do pedido; aprovar ou rejeitar, com justificativa obrigatória. Aprovar move; rejeitar mantém. Decidir duas vezes gera conflito 409. |
| **Configurar Kanban** | `/app/kanban/configuracao` | Etapas (criar, editar, inativar, ordenar, remover) e transições (ativar, exigir governança). Não remove nem inativa etapa em uso. Como a permissão está “a definir”, abre em **modo consulta**, com **“Simular edição”** marcada para discussão. |
| **Minha fila: governança** | `/app/fila` | “Transições aguardando governança”, com Aprovar e Rejeitar direto na lista. |
| **Meu perfil** | `/app/perfil` | Dados do usuário, matriz completa de papéis × ações e “Restaurar dados”. |
| **Portfólio** (compartilhada) | `/app/portfolio` | Lista ou Kanban, com colunas da configuração, busca, filtros (etapa, origem, ação de mobilização, arena, pendência), contagens e paginação. |
| **Minha fila** (compartilhada) | `/app/fila` | As tarefas pendentes do perfil. As seções vêm de cada fluxo (`fila.tsx`). |

### Zip 4 · Especialista · Dados e IA: parecer, indicadores e detalhe do projeto

Pastas: `src/fluxos/parecer/` e `src/fluxos/visao-geral/`, mais a responsabilidade pela tela compartilhada Detalhe do projeto (`src/pages/app/ProjetoDetalhesPage.tsx`). Login de teste: **João Prado**. Guia 3.3 A: o Especialista emite parecer técnico. Inclui também o dashboard e as ações de mobilização, usados pelos três perfis.

| Tela ou ação | Onde | O que tem |
|---|---|---|
| **Emitir parecer** | Detalhe (aba Qualificação e “Suas ações”), Minha fila | Pergunta do Analista, fundamentação, conclusão e evidências técnicas. O parecer subsidia a análise; não aprova transições. |
| **Minha fila: pareceres** | `/app/fila` | “Consultas aguardando parecer”, para você ou para a sua área. |
| **Dashboard** | `/app` | Saudação, filtros por período, etapa e origem, indicadores (cada número leva aos projetos de origem no portfólio), pendências do portfólio, projetos por etapa e por arena, radar médio e projetos atualizados recentemente. Indicadores marcados como “a validar com o cliente”. Sem este zip, a página inicial da área logada é a Minha fila. |
| **Ações de mobilização** | `/app/mobilizacao` | Campanhas, desafios, hackathons e residências vigentes, com período, total de demandas, “Ver demandas” e “Registrar demanda”. O botão “Nova ação” está desabilitado (“a definir”). |
| **Detalhe do projeto** (compartilhada) | `/app/projetos/:id` | Cabeçalho com etapa, TRL, origem e responsáveis; selos de pendência; barra **“Suas ações”** (vinda dos fluxos); 8 abas, descritas abaixo. |

---

## 5. Caminho completo para testar

1. **Demandante** registra uma demanda induzida → entra em Ideação, “Aguardando triagem”.
2. **Analista** qualifica → passa a conduzir a iniciativa.
3. **Analista** consulta “Dados e IA” → **João Prado** (Especialista) emite o parecer com anexo.
4. **Analista** registra uma avaliação de TRL com evidência (2 → 3).
5. **Analista** solicita Ideação → POC → projeto **continua** em Ideação, “Aguardando governança”.
6. **Especialista** rejeita → fica em Ideação. Nova solicitação, **Especialista** aprova → vai para **POC**.
7. **Analista** publica um MVP → **Demandante** valida com ressalvas → etapa e TRL **não mudam**.

O roteiro completo, com 21 passos, está em `docs/RELATORIO_MUDANCAS.md`.

---

## 6. Design

### Cores (identidade BBTS)

As cores estão definidas em `tailwind.config.js` com o prefixo `bb-`, por exemplo `bg-bb-blue` e `text-bb-muted`.

| Nome | Cor | Uso |
|---|---|---|
| `bb-blue` | `#005EEF` | Cor principal: botões, links, aba ativa, item ativo do menu |
| `bb-blue-dark` / `bb-blue-active` | `#0047B8` / `#003A99` | Hover e clique do botão principal |
| `bb-blue-light` | `#EBF2FF` | Fundos de destaque e hover suave |
| `bb-yellow` | `#FCFC30` | Destaque (botão de chamada, contadores, selo do Demandante) |
| `bb-navy` | `#002875` | Seções escuras da landing e fim do degradê do dashboard |
| `bb-bg` | `#F4F7FC` | Fundo das páginas |
| `bb-slate` | `#1E293B` | Texto principal |
| `bb-muted` | `#64748B` | Texto secundário |
| `bb-line` / `bb-line-2` | `#E2E8F0` / `#CBD5E1` | Bordas e divisórias |

Cores de apoio:
- **Etapas do Kanban:** cada etapa tem uma cor própria, configurável. A paleta fica em `CORES_ETAPA` (`utils/constants.ts`): âmbar, azul-céu, índigo, verde, rosa…
- **Estados:** verde para aprovado e validado; âmbar para governança, ressalvas e redução de TRL; rosa para rejeitado e não validado; turquesa (teal) para o Especialista e os pareceres.

### Tipografia e forma

- **Fonte:** Calibri, a fonte institucional. Carlito, Candara e Segoe UI ficam de reserva.
- **Cantos:** `rounded-card` (16 px) nos cartões e `rounded-panel` (24 px) nos painéis grandes.
- **Sombras leves:** `shadow-card`, `shadow-hover` e `shadow-float` (menu e modais).
- **Classes prontas** em `src/index.css`:
  - botões `btn-primary`, `btn-secondary`, `btn-accent` (amarelo), `btn-ghost`, `btn-danger` e `btn-sm`;
  - `card`, `card-hover`, `input`, `badge`;
  - `eyebrow`: o rótulo pequeno em caixa alta acima dos títulos.

### Layout

- **Área logada:**
  - a **barra superior** é enxuta, com logo, “Modo demonstração”, botão de destaque (Nova demanda), atalho da fila com contador e avatar;
  - o **menu fica na lateral DIREITA, escondido por padrão**. Abre como gaveta de 260 px por cima do conteúdo, no computador e no celular, e fecha com Esc, clique fora ou troca de página;
  - quem preferir pode **fixar um trilho de ícones** de 64 px no computador. A escolha fica salva no navegador;
  - o menu mostra só os itens dos fluxos instalados, em ordem fixa: Minha fila, Portfólio, Dashboard, Nova demanda, Ações de mobilização, Configurar Kanban, Meu perfil.
- **Área pública:** landing com fotos reais (Unsplash, de uso livre) e login em duas colunas, com foto e formulário.
- **Responsivo** do celular ao desktop, com navegação por teclado, rótulos acessíveis e foco visível.

### Animações (leves, só CSS)

As animações seguem a referência do Vise-landing, mas mais discretas, para não pesar o site.

| Efeito | Onde |
|---|---|
| `data-reveal` | Blocos aparecem subindo levemente ao entrar na tela (landing) |
| `data-lines` | Título do topo da landing entra linha por linha |
| `data-rule` | Linhas finas que se desenham ao rolar |
| `page-in` | Cada página e aba entra com um leve deslize |
| `pop-in` / `fade-in` | Modais e fundo escurecido |
| `boiar` | Flutuação suave dos cartões da landing |
| `skeleton` | Brilho dos blocos de carregamento |

- O gatilho do scroll é o hook `useReveal`, que usa IntersectionObserver.
- Quem usa **“reduzir movimento”** no sistema operacional vê tudo sem animação.
- Modais são renderizados com portal no `body`, porque a animação da página quebraria o `position: fixed`.
- **Desempenho:** a landing é leve. A área logada e o Chart.js só são baixados depois do login.

---

## 7. Organização do código

```
src/
├── App.tsx                 # rotas da base + rotas dos fluxos instalados
├── main.tsx · index.css    # entrada do app, estilos, animações
├── fluxos/
│   ├── tipos.ts            # contrato entre a base e os fluxos
│   ├── registro.ts         # junta rotas e menu de todos os fluxos (temRota)
│   ├── fila.ts · projeto.ts# juntam as seções da fila e as ações do detalhe
│   ├── acesso/             # ZIP 1: landing, login, cadastro
│   ├── demandante/         # ZIP 1: nova demanda, validação de entregas
│   ├── analista/           # ZIP 2: qualificação, consulta, TRL, movimentação, entrega
│   ├── governanca/         # ZIP 3: decisão de governança, configurar Kanban, meu perfil
│   ├── parecer/            # ZIP 4: parecer técnico
│   └── visao-geral/        # ZIP 4: dashboard, ações de mobilização
├── pages/app/              # BASE: Minha fila e Portfólio (dono: zip 3), Detalhe do projeto (dono: zip 4)
├── pages/public/           # BASE: entrada simplificada e 404
├── components/
│   ├── common/ui.tsx       # Logo, badges, BotaoAcao, Modal, Anexos, Campo, Skeleton…
│   ├── layout/AppLayout.tsx# barra superior + menu lateral direito
│   ├── fila/SecaoFila.tsx  # bloco de seção da Minha fila
│   ├── projeto/formulario.tsx # Preencher → Revisar → Confirmar (todos os formulários)
│   ├── radar/ · trl/       # radar 4D e régua TRL
├── contexts/AuthContext.tsx# sessão e perfil do usuário
├── hooks/                  # useAuth, useAsync, useDebounce, useReveal
├── services/               # api.ts (axios), index.ts (serviços), mock/ (banco simulado)
├── types/                  # entidades e DTOs
└── utils/                  # rótulos, TRL, formatadores, permissoes.ts (matriz)
```

### Como um fluxo se encaixa

Cada pasta de fluxo pode ter três arquivos. A base os encontra **sozinha**: não é preciso registrar nada em outro lugar.

| Arquivo | Para que serve |
|---|---|
| `rotas.tsx` | Páginas do fluxo e itens do menu lateral |
| `fila.tsx` | Seções da Minha fila do perfil |
| `projeto.tsx` | Botões da barra “Suas ações” no Detalhe do projeto e os formulários que eles abrem |

O que acontece quando um fluxo não está instalado:
- as telas dele não aparecem no menu;
- os links para elas somem (`temRota`);
- os botões das abas do detalhe ficam ocultos (`temAcao`);
- sem o zip 1, `/login` vira a entrada simplificada;
- sem o zip 4, a página inicial da área logada é a Minha fila, e o Dashboard e as Ações de mobilização não aparecem no menu;
- sem o zip 3, o Configurar Kanban e o Meu perfil não aparecem no menu.

Por isso **cada zip roda sozinho**, e os quatro juntos formam o site completo.

### API

As rotas da API ainda são **propostas**. Estão em `src/services/index.ts` e em `docs/RELATORIO_MUDANCAS.md`, seção 5. Para usar o back-end real, troque para `VITE_USE_MOCK=false`.

---

## 8. Pontos em aberto (decisão do cliente)

1. Analista e Especialista podem registrar demanda?
2. Quem configura etapas e transições do Kanban?
3. A avaliação de TRL do Analista precisa de revisão de um Especialista? O Especialista pode avaliar?
4. Quais anexos são obrigatórios em cada registro?
5. Quais indicadores entram no dashboard? Quem vê dados financeiros?
6. Haverá rascunho, devolução para complementação ou rejeição na triagem?
7. Quais limites de arquivo, formatos e textos de consentimento valem?
8. Como funciona o pedido de acesso (cadastro)? Quem aprova, quais dados pedir e se o perfil desejado pode ser escolhido. Hoje a tela existe, marcada “Em discussão”, e o envio é simulado.

---

## 9. Trabalho em equipe

| Zip | Responsável | Pastas próprias | Telas compartilhadas sob sua responsabilidade |
|---|---|---|---|
| `1-kaua-demandante-landing-login-cadastro` | Kaua | `src/fluxos/acesso/`, `src/fluxos/demandante/` | — |
| `2-analista` | | `src/fluxos/analista/` | — |
| `3-especialista-seguranca-da-informacao` | | `src/fluxos/governanca/` | `src/pages/app/PortfolioPage.tsx`, `src/pages/app/MinhaFilaPage.tsx` |
| `4-especialista-dados-e-ia` | | `src/fluxos/parecer/`, `src/fluxos/visao-geral/` | `src/pages/app/ProjetoDetalhesPage.tsx` |

- **Cada pessoa mexe só nas suas pastas e nas telas compartilhadas que são dela.** O resto da base vem igual em todos os zips; mudanças nele devem ser combinadas com o grupo, para não gerar conflito.
- **Cada tela compartilhada tem um único responsável.** Ela está em todos os zips, para cada um rodar sozinho, mas só o responsável altera. O nome do responsável está na primeira linha do arquivo.
- **Por que os merges não conflitam:** como a base é idêntica em todas as branches, o git a junta sem conflito, e cada fluxo tem arquivos só dele.
- O passo a passo de branch, commit e merge está em `COMO_SUBIR.md`, na pasta dos zips.
