# SIGES-PIN — Front-end

Front-end do Sistema Corporativo de Gestão do Portfólio de Inovação da BBTS.
React 18 + Vite + TypeScript + Tailwind CSS 3.4.

## Como rodar

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # checagem de tipos + build de produção
```

Por padrão o app roda em **modo demonstração** (`VITE_USE_MOCK=true` no `.env`), com um banco em memória que
aplica as regras da revisão 3 (docs/RELATORIO_MUDANCAS.md). Na tela de login há atalhos para os três perfis
(senha dos usuários de teste em `src/services/mock/seed.ts`). Em "Meu perfil" é possível restaurar os dados.

Para usar o back-end Spring Boot (`http://localhost:8080`, via proxy `/api`), defina `VITE_USE_MOCK=false`.

## Visão geral

O [todo.md](todo.md) explica o site inteiro: fluxos, telas, regras, cores, design e organização do código.

## Fluxos

O código está dividido em uma **base comum** e **quatro zips de fluxo**, um por perfil do login simulado.
Cada fluxo fica em `src/fluxos/<pasta>/`. A base encontra os fluxos sozinha; sem um deles, o app continua rodando sem aquelas telas.

| Zip | Pastas | Telas e ações |
|---|---|---|
| Base comum (em todos) | `src/pages`, `src/components`, `src/services`… | Minha fila, Portfólio e Detalhe do projeto (com dono: zips 3 e 4), menu, dados simulados |
| 1 · Demandante + acesso | `acesso/`, `demandante/` | Landing, login, cadastro (pedido de acesso), nova demanda, validação de entregas |
| 2 · Analista | `analista/` | Qualificação, consulta a Especialista, avaliação TRL, movimentação, entregas |
| 3 · Especialista · Segurança da informação | `governanca/` + Portfólio e Minha fila | Decisão de governança, configurar Kanban, meu perfil, portfólio, minha fila |
| 4 · Especialista · Dados e IA | `parecer/`, `visao-geral/` + Detalhe do projeto | Parecer técnico, dashboard, ações de mobilização, detalhe do projeto |

## Estrutura

```
src/
├── fluxos/          # tipos.ts e registro.ts (contrato) + uma pasta por fluxo
├── components/      # common (ui), layout (menu lateral direito), fila, projeto (formulário com revisão), radar, trl
├── contexts/        # AuthContext (sessão e perfil)
├── hooks/           # useAuth, useAsync, useDebounce, useReveal
├── pages/           # base: app/ (Minha fila, Portfólio, Detalhe) e public/ (entrada simplificada, 404)
├── services/        # api.ts (axios), index.ts (serviços), mock/ (banco em memória)
├── types/           # entidades e DTOs do domínio
└── utils/           # rótulos, TRL, formatadores e permissoes.ts (matriz de ações)
```

Documentação: [docs/RELATORIO_MUDANCAS.md](docs/RELATORIO_MUDANCAS.md) (revisão 3, vigente) e [docs/PROPOSTA_FRONTEND.md](docs/PROPOSTA_FRONTEND.md) (proposta inicial).
