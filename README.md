# SIGES-PIN — Front-end · branch `especialista-seguranca`

Front-end do Sistema Corporativo de Gestão do Portfólio de Inovação da BBTS.
React 18 + Vite + TypeScript + Tailwind CSS 3.4. Regras da **Fase 3** ([docs/GUIA_REGRAS_FASE3.md](docs/GUIA_REGRAS_FASE3.md)).

Esta branch é o **zip 3** da divisão da equipe (Abraão): a base comum do site mais **governança, quadro, portfólio e minha fila**. As telas dos outros integrantes chegam pelas branches deles (veja [Divisão da equipe](#divisão-da-equipe)).

## O que esta branch tem

| Arquivo | O que mudou |
|---|---|
| `src/fluxos/governanca/DecisaoModal.tsx` | Decisão APROVAR ou REJEITAR com justificativa; aprovar revalida o percurso, move o cartão e gera notificação. |
| `src/fluxos/governanca/CancelamentoModal.tsx` | Novo: cancelar pedido de avanço com justificativa (Analista no próprio pedido, Especialista em qualquer um); o cartão fica onde está. |
| `src/fluxos/governanca/projeto.tsx` | Botões Decidir avanço e Cancelar pedido. |
| `src/fluxos/governanca/fila.tsx` | Pedidos aguardando decisão e propostas de configuração pendentes. |
| `src/fluxos/governanca/KanbanConfigPage.tsx` | Reescrita: o Especialista cria colunas (código, nome, ordem, tipo terminal) e percursos, e edita nome, ordem, ativa e governança com a versão vigente. Bloqueia desativar a coluna inicial, coluna ocupada ou referenciada e percurso com pedido pendente. Os demais perfis consultam. |
| `src/fluxos/governanca/PerfilPage.tsx` | Matriz de permissões da Fase 3 com a condição adicional de cada ação. |
| `src/pages/app/PortfolioPage.tsx` | Compartilhada: filtro de arquivamento (ativos, arquivados, todos), colunas de arena e responsáveis e selo de arquivado. |
| `src/pages/app/MinhaFilaPage.tsx` | Compartilhada: sem mudança de código; recebe as seções novas de cada fluxo. |

Telas compartilhadas sob responsabilidade desta branch: `src/pages/app/PortfolioPage.tsx`, `src/pages/app/MinhaFilaPage.tsx`.

## Como rodar

```bash
cp .env.example .env
npm install
npm run dev        # http://localhost:3000
npm run build      # checagem de tipos + build de produção
```

**Modo demonstração.** É o padrão (`VITE_USE_MOCK=true` no `.env`): o app usa um banco no navegador que aplica as regras da Fase 3. A chave é `@SIGES_PIN:mockdb:v5`.

**Usuários de teste.** Ficam em `src/services/mock/seed.ts`, junto com a senha: Mariana Costa e Bruno Alves (Demandantes), Rafael Lima (Analista), Fernanda Rocha e João Prado (Especialistas). Para esta branch, entre como **Fernanda Rocha (Especialista · Segurança da informação)**.

**Restaurar os dados.** Em **Meu perfil** ou na tela de entrada “Entrar como”, use **Restaurar dados**.

**Back-end real.** Para usar o back-end Spring Boot (`http://localhost:8080`, via proxy `/api`), defina `VITE_USE_MOCK=false`.

## Como os fluxos se encaixam

Cada fluxo fica em `src/fluxos/<pasta>/` e pode ter `rotas.tsx` (páginas e menu), `fila.tsx` (seção da Minha fila) e `projeto.tsx` (botões e formulários do Detalhe do projeto). A base encontra os fluxos sozinha, então esta branch roda sozinha:
- sem o zip 1, o `/login` vira a entrada simplificada “Entrar como”;
- sem o zip 4, a página inicial da área logada é a Minha fila.

## Divisão da equipe

| Zip / branch | Integrante | Login de teste | Pastas |
|---|---|---|---|
| 1 · `fluxo-demandante-acesso` | Kaua | Mariana Costa | `acesso/`, `demandante/`, `recomendacoes/` |
| 2 · `fluxo-analista` | Lucas | Rafael Lima | `analista/`, `propostas/` |
| **3 · `especialista-seguranca` (esta)** | Abraão | Fernanda Rocha | `governanca/` |
| 4 · `especialista-dados-e-ia` | Angelo | João Prado | `parecer/`, `gestao/`, `visao-geral/` |

**Regra do grupo.** Cada pessoa altera só as suas pastas e as telas compartilhadas que são dela. A base é igual nas quatro branches; mudanças nela precisam ser combinadas com o grupo.

## Documentação

- [todo.md](todo.md): o site inteiro, com fluxos, telas, regras, cores e organização do código.
- [docs/GUIA_REGRAS_FASE3.md](docs/GUIA_REGRAS_FASE3.md): o guia de regras de negócio da Fase 3.
- [docs/FASE3_MUDANCAS.md](docs/FASE3_MUDANCAS.md): o que mudou, por integrante.
- A pasta `sigespin/` é outro projeto Vite que veio da `main` e não é alterado por esta branch.
