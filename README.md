# SIGES-PIN — Front-end · branch `fluxo-demandante-acesso`

Front-end do Sistema Corporativo de Gestão do Portfólio de Inovação da BBTS.
React 18 + Vite + TypeScript + Tailwind CSS 3.4.

Esta branch é o **zip 1** da divisão da equipe: a base comum do site mais o fluxo de **acesso** (landing, login e cadastro) e o fluxo do **Demandante**. As telas dos outros perfis chegam pelas branches da equipe (veja [Divisão da equipe](#divisão-da-equipe)).

## Telas desta branch

| Tela | Rota | Pasta |
|---|---|---|
| Landing page | `/` | `src/fluxos/acesso/` |
| Login | `/login` | `src/fluxos/acesso/` |
| Cadastro (pedido de acesso) | `/cadastro` | `src/fluxos/acesso/` |
| Nova demanda (espontânea ou induzida) | `/app/demandas/nova` | `src/fluxos/demandante/` |
| Validar entrega (modal no Detalhe do projeto) | `/app/projetos/:id` | `src/fluxos/demandante/` |

O Demandante também tem a seção dele na **Minha fila** (`src/fluxos/demandante/fila.tsx`) e o botão **Adicionar contexto** no Detalhe do projeto.

**Telas da base**, presentes em todas as branches e cada uma com um responsável:
- **Minha fila** (`/app/fila`) e **Portfólio** (`/app/portfolio`), que são do zip 3;
- **Detalhe do projeto** (`/app/projetos/:id`), que é do zip 4.

## Como rodar

```bash
cp .env.example .env
npm install
npm run dev        # http://localhost:3000
npm run build      # checagem de tipos + build de produção
```

**Modo demonstração.** É o padrão (`VITE_USE_MOCK=true` no `.env`): o app usa um banco em memória que aplica as regras da revisão 3 ([docs/RELATORIO_MUDANCAS.md](docs/RELATORIO_MUDANCAS.md)).

**Usuários de teste.** Ficam em `src/services/mock/seed.ts`, junto com a senha. Para esta branch, entre como **Mariana Costa** (Demandante).

**Outros perfis.** Analista e Especialista também entram, mas a fila deles só aparece quando as branches da equipe forem juntadas.

**Restaurar os dados.** Nesta branch ainda não há a tela Meu perfil, que é do zip 3. Para voltar os dados ao estado inicial, apague no navegador a chave `@SIGES_PIN:mockdb:v4` do localStorage.

**Back-end real.** Para usar o back-end Spring Boot (`http://localhost:8080`, via proxy `/api`), defina `VITE_USE_MOCK=false`.

## Como os fluxos se encaixam

**Contrato.** Cada fluxo fica em `src/fluxos/<pasta>/` e pode ter três arquivos:
- `rotas.tsx`: páginas e itens de menu;
- `fila.tsx`: a seção do perfil na Minha fila;
- `projeto.tsx`: botões e modais no Detalhe do projeto.

**Registro automático.** A base encontra os fluxos sozinha, com `import.meta.glob` em `src/fluxos/registro.ts`, `fila.ts` e `projeto.ts`. Não é preciso editar o menu nem as rotas.

**Fluxo ausente não quebra o app.** Os links e botões de um fluxo que não está na branch simplesmente não aparecem. Por isso esta branch roda sozinha:
- sem o zip 4, a página inicial da área logada é a Minha fila, no lugar do Dashboard;
- sem o zip 3, o Configurar Kanban e o Meu perfil não aparecem no menu.

## Divisão da equipe

| Zip / branch | Login de teste | Pastas | Telas |
|---|---|---|---|
| **1 · `fluxo-demandante-acesso` (esta)** | Mariana Costa | `acesso/`, `demandante/` | Landing, Login, Cadastro, Nova demanda, Validar entrega |
| 2 · `fluxo-analista` | Rafael Lima | `analista/` | Qualificação, Consultar Especialista, Avaliação TRL, Movimentar Kanban, Publicar entrega |
| 3 · `fluxo-especialista-governanca` | Fernanda Rocha | `governanca/` + Portfólio e Minha fila | Decidir transição, Configurar Kanban, Meu perfil, Portfólio, Minha fila |
| 4 · `fluxo-especialista-parecer` | João Prado | `parecer/`, `visao-geral/` + Detalhe do projeto | Emitir parecer, Dashboard, Ações de mobilização, Detalhe do projeto |

**Merge sem conflito.** A base é igual nas quatro branches e cada uma só tem arquivos nas suas pastas de fluxo, então o merge não gera conflito.

**Regra do grupo.** Cada pessoa altera só as suas pastas e as telas compartilhadas que são dela. Mudanças no resto da base precisam ser combinadas com o grupo.

## Estrutura

```
.
├── src/
│   ├── fluxos/          # tipos.ts e registro.ts (contrato) + acesso/ e demandante/
│   ├── components/      # common (ui), layout (menu lateral), fila, projeto (formulário com revisão), radar, trl
│   ├── contexts/        # AuthContext (sessão e perfil)
│   ├── hooks/           # useAuth, useAsync, useDebounce, useReveal
│   ├── pages/           # base: app/ (Minha fila, Portfólio, Detalhe) e public/ (entrada simplificada, 404)
│   ├── services/        # api.ts (axios), index.ts (serviços), mock/ (banco em memória)
│   ├── types/           # entidades e DTOs do domínio
│   └── utils/           # rótulos, TRL, formatadores e permissoes.ts (matriz de ações)
├── docs/                # documentação do projeto
├── sigespin/            # starter do Dashboard Executivo que já estava na main (projeto separado)
└── todo.md              # visão geral do site: fluxos, telas, regras, cores e design
```

A pasta `sigespin/` é outro projeto Vite, independente deste: tem o próprio `package.json` e o próprio `README.md`. Ela veio da `main` e não é alterada por esta branch.

## Documentação

- [todo.md](todo.md): o site inteiro, com fluxos, telas, regras, cores, design e organização do código.
- [docs/guia_de_fluxo_do_usuario.md](docs/guia_de_fluxo_do_usuario.md): o guia de fluxo do usuário que a divisão segue.
- [docs/RELATORIO_MUDANCAS.md](docs/RELATORIO_MUDANCAS.md): revisão 3, a versão vigente.
- [docs/PROPOSTA_FRONTEND.md](docs/PROPOSTA_FRONTEND.md): a proposta inicial.
- [docs/SIGES-PIN_Master Spec Front-end.md](<docs/SIGES-PIN_Master Spec Front-end.md>): a especificação do front-end.
- [docs/DOCUMENTACAO_FASE1_DOMINIO(front-end).md](<docs/DOCUMENTACAO_FASE1_DOMINIO(front-end).md>): a camada de domínio.
- Também vieram da `main`: [docs/arquitetura-frontend.md](docs/arquitetura-frontend.md), [docs/design-system.md](docs/design-system.md), [docs/historico-de-alteracoes.md](docs/historico-de-alteracoes.md) e [docs/relatorios-progresso.md](docs/relatorios-progresso.md).
