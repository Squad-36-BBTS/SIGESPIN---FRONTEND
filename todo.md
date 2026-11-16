# SIGES-PIN — Visão geral do front-end

Este documento explica o site inteiro para quem vai trabalhar em uma parte dele: o que o sistema faz, os fluxos, cada tela, as regras, o design e como o código está organizado.

**Versão das regras: Fase 3.** As regras seguem o guia [docs/GUIA_REGRAS_FASE3.md](docs/GUIA_REGRAS_FASE3.md). O que mudou em relação à versão anterior está em [docs/FASE3_MUDANCAS.md](docs/FASE3_MUDANCAS.md).

---

## 1. O que é o sistema

O **SIGES-PIN** é o sistema de gestão do **portfólio de inovação da BBTS**. Ele acompanha uma ideia desde o registro até a conclusão, o descarte ou o arquivamento:

1. um Demandante cadastra um problema, necessidade ou oportunidade (**demanda**), ou converte uma **recomendação** recebida;
2. um Analista qualifica a demanda e consulta Especialistas quando precisa;
3. Especialistas emitem **pareceres**, em resposta a consultas ou de forma independente;
4. a maturidade é medida em **TRL** (1 a 9), sempre com evidências do projeto;
5. o projeto anda pelos **percursos do Kanban**: livres (movimentação direta) ou governados (pedido de avanço e decisão do Especialista);
6. entregas são validadas pelo Demandante responsável, que também registra **correções**;
7. o Especialista administra o quadro, edita, arquiva e reativa projetos.

Tudo fica registrado com autor, data, justificativa e evidências.

### O que é simulado

O protótipo roda sozinho, sem back-end. Ficam simulados:
- o acesso, com um seletor de usuários fictícios;
- a API, com um banco no navegador que aplica as regras da Fase 3;
- a sugestão de IA na nova demanda.

As evidências são arquivos fictícios já vinculados aos projetos; os formulários as **selecionam**, como pede o guia.

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

### Usuários de teste (guia, seção 4)

A senha está em `src/services/mock/seed.ts`. Na tela de login, os botões de “Login simulado” preenchem e-mail e senha.

| Perfil | Nome | E-mail | Para que serve |
|---|---|---|---|
| Demandante | Mariana Costa | `demandante@bbts.com.br` | Responsável por várias demandas |
| Demandante | Bruno Alves | `bruno.alves@bbts.com.br` | Mostra a diferença entre ser o responsável e só ter o mesmo perfil |
| Analista | Rafael Lima | `analista@bbts.com.br` | Conduz as iniciativas |
| Especialista | Fernanda Rocha | `especialista@bbts.com.br` | Segurança da informação |
| Especialista | João Prado | `joao.prado@bbts.com.br` | Dados e IA; mostra que só o destinatário responde a consulta |

- **Trocar de usuário mantém os registros**, para um perfil continuar o trabalho do outro. Ao sair, a tela volta ao seletor.
- **Restaurar dados:** em **Meu perfil** (ou na entrada simplificada, quando o zip 1 não está junto). A chave do banco no navegador é `@SIGES_PIN:mockdb:v5`.

---

## 3. Perfis e regras

São **três perfis**. Todos consultam o portfólio, os detalhes, as notificações, as propostas de configuração e os históricos.

| Perfil | Jornada típica |
|---|---|
| **Demandante** | Cadastra demanda, acompanha o portfólio, registra correções e valida entregas quando é o responsável pelo projeto. Responde a recomendações destinadas a ele. |
| **Analista** | Qualifica demandas, encaminha consultas, registra TRL, movimenta em percurso livre, solicita governança quando exigida, submete entregas, recomenda demandas e propõe alterações no quadro. |
| **Especialista** | Emite parecer, registra TRL, movimenta projetos, decide pedidos, submete entregas, recomenda demandas, administra o quadro e atualiza ou arquiva projetos. |

### Matriz de permissões

A matriz fica em `src/utils/permissoes.ts`. É a fonte única, usada pela tela (que mostra ou bloqueia a ação com o motivo) e pelo banco simulado (que confere de novo ao executar). A tela **Meu perfil** mostra a matriz completa.

| Ação | Demandante | Analista | Especialista | Condição adicional |
|---|---|---|---|---|
| Cadastrar demanda | Sim | — | — | Começa em Ideação |
| Qualificar e consultar Especialista | — | Sim | — | Projeto ativo; destinatário Especialista ativo |
| Emitir parecer | — | — | Sim | Em resposta, só o destinatário |
| Registrar TRL | — | Sim | Sim | Evidências do projeto |
| Mover diretamente | — | Percurso livre | Livre ou governado | Sem pedido pendente |
| Solicitar avanço governado | — | Sim | — | Um pedido pendente por projeto |
| Decidir avanço | — | — | Sim | Pedido pendente |
| Cancelar avanço | — | Pedido próprio | Sim | Pedido pendente |
| Configurar quadro diretamente | — | — | Sim | Uso e versão |
| Propor coluna ou percurso | — | Sim | — | Justificativa |
| Decidir proposta | — | — | Sim | Pedido pendente |
| Cancelar proposta | — | Pedido próprio | Sim | Pedido pendente |
| Submeter entrega | — | Sim | Sim | Projeto ativo |
| Validar entrega e registrar correção | Responsável | — | — | Projeto ativo |
| Recomendar demanda | — | Sim | Sim | Destinatário Demandante ativo |
| Converter ou recusar recomendação | Destinatário | — | — | Recomendação pendente |
| Editar, arquivar e reativar projeto | — | — | Sim | Versão vigente e justificativa |

### Regras que valem em todo o site

- **Projeto arquivado** continua consultável; as ações que exigem projeto ativo ficam bloqueadas até a reativação. Arquivar exige que não haja pedido de avanço pendente.
- **Evidências** devem existir, pertencer ao mesmo projeto e aparecer uma única vez. TRL e pedido de avanço exigem ao menos uma; no parecer a lista pode ficar vazia; na correção há uma evidência opcional.
- **TRL é indicador.** Pode subir, cair ou se manter; o histórico guarda o nível anterior e o registrado.
- **Kanban:** a origem do percurso precisa ser a etapa atual; etapa terminal não admite saída. Em percurso governado, o cartão fica na origem enquanto o pedido estiver pendente. Aprovar revalida o percurso e move; rejeitar e cancelar mantêm a etapa.
- **Notificações:** toda movimentação feita por um Especialista (direta ou por aprovação) gera uma notificação global.
- **Versão:** colunas, percursos e projetos têm versão. Salvar com versão antiga dá conflito; na edição do projeto, o rascunho fica preservado e a tela mostra a versão mais recente.
- **Etapa e tarefa são coisas diferentes.** “Aguardando triagem”, “Aguardando parecer”, “Aguardando governança” e “Aguardando validação” são **pendências**, mostradas como selos tracejados.
- **Sem autocadastro.** A tela de cadastro envia um **pedido de acesso** simulado.

### Comportamento de todos os formulários

1. **Preencher → Revisar → Confirmar.** Antes de enviar, aparece um resumo do que vai ser registrado.
2. Erros de validação aparecem no campo; depois do sucesso, a mensagem diz **o que mudou e quem é o próximo responsável**.
3. Toda ação indisponível mostra o **motivo**, em vez de sumir sem explicação.
4. Listas vazias mostram um estado vazio explicando o que vai aparecer ali.

---

## 4. Os 4 zips e as telas

O projeto tem **uma base comum** e **quatro zips**, um para cada integrante. Cada parte é uma ou mais pastas em `src/fluxos/`; as três telas compartilhadas têm um responsável.

| Zip | Integrante | Login de teste | Pastas | Telas e ações |
|---|---|---|---|---|
| 1 | Kaua | Mariana Costa | `acesso/`, `demandante/`, `recomendacoes/` | Landing, Login (5 usuários), Cadastro, Nova demanda, Validar entrega, Registrar correção, Recomendações |
| 2 | Lucas | Rafael Lima | `analista/`, `propostas/` | Qualificação, Consulta, TRL, Movimentar (direto ou pedido), Submeter entrega, Propostas de configuração |
| 3 | Abraão | Fernanda Rocha | `governanca/` + Portfólio e Minha fila | Decidir avanço, Cancelar pedido, Configuração do quadro, Meu perfil (matriz), **Portfólio**, **Minha fila** |
| 4 | Angelo | João Prado | `parecer/`, `gestao/`, `visao-geral/` + Detalhe do projeto | Emitir parecer, Editar projeto, Arquivar e reativar, Notificações, Dashboard, Ações de mobilização, **Detalhe do projeto** |

### Base comum (vai em todos os zips)

| Tela | Rota | Responsável | O que tem |
|---|---|---|---|
| **Minha fila** | `/app/fila` | Zip 3 | As tarefas do perfil; as seções vêm de cada fluxo (`fila.tsx`). |
| **Portfólio** | `/app/portfolio` | Zip 3 | Lista ou Kanban; busca por texto e filtros de etapa, origem, ação, arena, pendência e **arquivamento**; colunas de arena, etapa, origem, TRL e responsáveis; paginação. |
| **Detalhe do projeto** | `/app/projetos/:id` | Zip 4 | Resumo, etapa, TRL, responsáveis, versão; barra **“Suas ações”**; avisos de arquivado, legado sem Demandante e pedido pendente; 10 abas: Visão geral, Qualificação, Consultas e pareceres, TRL, Movimentações e governança, Entregas e validações, Correções, Evidências, Participação, Histórico de gestão. |
| Entrada simplificada | `/login` | — | Usada só quando o zip 1 não está junto. |

A base também inclui tipos, serviços, banco simulado, matriz de permissões, componentes, menu, formulário com revisão, seletor de evidências (`components/projeto/evidencias.tsx`), radar 4D e régua TRL.

### Zip 1 · Kaua · Demandante, acesso e recomendações

| Tela ou ação | Onde | O que tem |
|---|---|---|
| **Landing, Login e Cadastro** | `/`, `/login`, `/cadastro` | Login simulado com os 5 usuários do guia. Cadastro é pedido de acesso simulado. |
| **Nova demanda** | `/app/demandas/nova` | Título (até 255), descrição da dor, área, origem, ação de mobilização (só na induzida), TRL inicial declarado e hipótese opcional. Começa em Ideação, arena “A definir”. |
| **Converter recomendação** | `/app/demandas/nova?recomendacao=id` | Mesmo formulário, como demanda espontânea, com título e descrição da recomendação. |
| **Validar entrega** | Detalhe e Minha fila | Resultado e observações obrigatórios; cada manifestação é um novo registro. Só o Demandante responsável. |
| **Registrar correção** | Detalhe | Descrição, referência opcional (até 500) e evidência opcional do projeto. |
| **Recomendações** | `/app/recomendacoes` | Lista com filtro de status e visibilidade por perfil; recomendar (Analista e Especialista); converter ou recusar com justificativa (destinatário). |

### Zip 2 · Lucas · Analista e propostas de configuração

| Tela ou ação | O que tem |
|---|---|
| **Qualificação** | Sete textos obrigatórios; não altera etapa nem TRL; histórico preservado. |
| **Consultar Especialista** | Especialista ativo obrigatório e questão; pode ser antes da qualificação. |
| **Registrar TRL** | Nível 1 a 9, justificativa e ao menos uma evidência do projeto. Também para o Especialista. |
| **Movimentar** | Ao escolher o destino, oferece movimentação direta (percurso livre, ou Especialista em qualquer percurso) ou pedido de avanço (Analista em percurso governado, com evidências). |
| **Submeter entrega** | Só a descrição. Também para o Especialista. |
| **Propostas de configuração** | `/app/propostas`: filtro por status e tipo; propor coluna ou percurso; aprovar, rejeitar e cancelar conforme o perfil. |

### Zip 3 · Abraão · Governança, quadro, Portfólio e Minha fila

| Tela ou ação | O que tem |
|---|---|
| **Decidir avanço** | Aprovar (revalida e move, com notificação) ou rejeitar, com justificativa. |
| **Cancelar pedido** | Analista (pedido próprio) ou Especialista, com justificativa; o cartão fica onde está. |
| **Configuração do quadro** | `/app/kanban/configuracao`: criar coluna (código, nome, ordem, terminal), editar (nome, ordem, ativa, versão), criar e editar percursos; consulta para os demais perfis. |
| **Meu perfil** | Matriz completa com a condição adicional de cada ação e “Restaurar dados”. |
| **Portfólio** e **Minha fila** | Telas compartilhadas sob responsabilidade deste zip. |

### Zip 4 · Angelo · Parecer, gestão, notificações e Detalhe

| Tela ou ação | O que tem |
|---|---|
| **Emitir parecer** | Independente ou em resposta à consulta dirigida a quem emite; evidências opcionais. |
| **Editar projeto** | Dados, arena, Lei do Bem, dispêndio, Demandante e Analista responsáveis, com versão e justificativa; conflito preserva o rascunho. |
| **Arquivar e reativar** | Com versão e justificativa; histórico de gestão com valores anteriores e atuais. |
| **Notificações** | `/app/notificacoes`, com contador de não lidas no menu. |
| **Dashboard** e **Ações de mobilização** | Indicadores do portfólio ativo, contagem de arquivados e ações de mobilização. |
| **Detalhe do projeto** | Tela compartilhada sob responsabilidade deste zip. |

---

## 5. Cenários para testar (guia, seção 4)

| Cenário | Como testar |
|---|---|
| Cadastro por origem | Mariana cadastra uma demanda espontânea (sem ação) e uma induzida (com ação). Ambas começam em Ideação, com o TRL declarado no detalhe. |
| Consulta e parecer | Rafael consulta João antes de qualificar. João responde; Fernanda emite um parecer independente e não consegue responder a consulta do João. |
| Avaliação de TRL | Rafael avalia “Detecção de anomalias em rede” de 5 para 3 com a evidência do projeto; o histórico mostra os dois níveis. |
| Governança | Rafael pede o avanço de “Assistente de atendimento” (POC → MVP); o cartão fica em POC. Fernanda aprova; o cartão muda e aparece a notificação. Rejeitar ou cancelar mantém a etapa. |
| Quadro | Fernanda aprova a proposta da coluna “Piloto”; a coluna aparece no Kanban. |
| Entrega e validação | Mariana valida a entrega de “Plataforma IoT”; Bruno vê o projeto, mas não pode validar. Uma nova validação preserva a primeira. |
| Recomendação | Bruno converte “Digitalizar o protocolo de malotes” em uma demanda espontânea; a recusa exige justificativa. |
| Arquivamento | Fernanda arquiva um projeto sem pedido pendente; os dados continuam consultáveis e as ações ficam bloqueadas até reativar. |
| Legado | “Gestão inteligente de numerário” não tem Demandante; Fernanda atribui um pela edição do projeto. |

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
- **Etapas do Kanban:** cada coluna tem uma cor própria, configurável. A paleta fica em `CORES_ETAPA` (`utils/constants.ts`).
- **Estados:** verde para aprovado, validado e convertido; âmbar para pendente, ressalvas e redução de TRL; rosa para rejeitado, recusado e não validado; cinza para cancelado e arquivado; turquesa (teal) para o Especialista e os pareceres.

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
  - o menu mostra só os itens dos fluxos instalados, em ordem fixa: Minha fila, Portfólio, Dashboard, Nova demanda, Recomendações, Ações de mobilização, Notificações, Configurar Kanban, Propostas de configuração, Meu perfil.
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
│   ├── demandante/         # ZIP 1: nova demanda, validação, correção
│   ├── recomendacoes/      # ZIP 1: recomendações
│   ├── analista/           # ZIP 2: qualificação, consulta, TRL, movimentação, entrega
│   ├── propostas/          # ZIP 2: propostas de configuração do quadro
│   ├── governanca/         # ZIP 3: decisão e cancelamento de avanço, configuração do quadro, meu perfil
│   ├── parecer/            # ZIP 4: parecer técnico
│   ├── gestao/             # ZIP 4: editar, arquivar e reativar projeto
│   └── visao-geral/        # ZIP 4: dashboard, ações de mobilização, notificações
├── pages/app/              # BASE: Minha fila e Portfólio (dono: zip 3), Detalhe do projeto (dono: zip 4)
├── pages/public/           # BASE: entrada simplificada e 404
├── components/
│   ├── common/ui.tsx       # Logo, badges, BotaoAcao, Modal, Campo, Skeleton…
│   ├── layout/AppLayout.tsx# barra superior + menu lateral direito
│   ├── fila/SecaoFila.tsx  # bloco de seção da Minha fila
│   ├── projeto/formulario.tsx # Preencher → Revisar → Confirmar (todos os formulários)
│   ├── projeto/evidencias.tsx # seleção e lista de evidências do projeto
│   ├── radar/ · trl/       # radar 4D e régua TRL
├── contexts/AuthContext.tsx# sessão e perfil do usuário
├── hooks/                  # useAuth, useAsync, useDebounce, useReveal
├── services/               # api.ts (axios), index.ts (serviços), mock/ (banco simulado)
├── types/                  # entidades e DTOs com os nomes de campo do guia
└── utils/                  # rótulos, TRL, formatadores, permissoes.ts (matriz), notificacoes.ts
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
- sem o zip 4, a página inicial da área logada é a Minha fila.

Por isso **cada zip roda sozinho**, e os quatro juntos formam o site completo.

### API

As rotas da API ainda são **propostas** e ficam em `src/services/index.ts`; os DTOs usam os nomes de campo do guia. Para usar o back-end real, troque para `VITE_USE_MOCK=false`.

---

## 8. Pontos em aberto

1. As rotas definitivas da API da Fase 3 precisam ser confirmadas com o back-end.
2. Como as evidências entram no projeto (upload) não está no guia; o protótipo usa evidências fictícias já vinculadas.
3. Quem cadastra ações de mobilização e como funciona o pedido de acesso (cadastro) ainda não foram definidos.
4. Quais indicadores entram no dashboard.

---

## 9. Trabalho em equipe

| Zip | Integrante | Branch | Pastas próprias | Telas compartilhadas sob sua responsabilidade |
|---|---|---|---|---|
| 1 | Kaua | `fluxo-demandante-acesso` | `acesso/`, `demandante/`, `recomendacoes/` | — |
| 2 | Lucas | `fluxo-analista` | `analista/`, `propostas/` | — |
| 3 | Abraão | `especialista-seguranca` | `governanca/` | `PortfolioPage.tsx`, `MinhaFilaPage.tsx` |
| 4 | Angelo | `especialista-dados-e-ia` | `parecer/`, `gestao/`, `visao-geral/` | `ProjetoDetalhesPage.tsx` |

- **Cada pessoa mexe só nas suas pastas e nas telas compartilhadas que são dela.** O resto da base vem igual em todos os zips; mudanças nele devem ser combinadas com o grupo.
- **Por que os merges não conflitam:** a base é idêntica em todas as branches e cada fluxo tem arquivos só dele. O único conflito esperado é o `README.md`, que é específico de cada branch.
