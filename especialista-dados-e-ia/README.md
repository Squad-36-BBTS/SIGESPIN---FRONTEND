# SIGES-PIN — Front-end · branch `especialista-dados-e-ia`

Front-end do Sistema Corporativo de Gestão do Portfólio de Inovação da BBTS.
React 18 + Vite + TypeScript + Tailwind CSS 3.4. Regras da **Fase 3** ([docs/GUIA_REGRAS_FASE3.md](docs/GUIA_REGRAS_FASE3.md)).

Esta branch é o **zip 4** da divisão da equipe (Angelo): a base comum do site mais **parecer, gestão do projeto, notificações e detalhe**. As telas dos outros integrantes chegam pelas branches deles (veja [Divisão da equipe](#divisão-da-equipe)).

## O que esta branch tem

| Arquivo | O que mudou |
|---|---|
| `src/fluxos/parecer/ParecerModal.tsx` | Parecer independente ou em resposta à consulta dirigida a quem emite; fundamentação e conclusão obrigatórias; evidências do projeto opcionais. |
| `src/fluxos/parecer/projeto.tsx` | Botão Emitir parecer (ou Responder consulta, quando há consulta para você). |
| `src/fluxos/parecer/fila.tsx` | Consultas dirigidas a você. |
| `src/fluxos/gestao/` | Novo: editar projeto (dados, arena, Lei do Bem, dispêndio, Demandante e Analista responsáveis) com versão e justificativa, preservando o rascunho em conflito; arquivar e reativar com versão e justificativa. |
| `src/fluxos/visao-geral/NotificacoesPage.tsx` | Novo: notificações globais das movimentações feitas por Especialistas, com contador de não lidas no menu. |
| `src/fluxos/visao-geral/rotas.tsx` | Item Notificações no menu. |
| `src/fluxos/visao-geral/DashboardPage.tsx` | Indicadores do portfólio ativo e contagem de arquivados. |
| `src/fluxos/visao-geral/AcoesMobilizacaoPage.tsx` | Sem o botão “Nova ação”, que não está na matriz. |
| `src/pages/app/ProjetoDetalhesPage.tsx` | Compartilhada: 10 abas do guia (qualificação, consultas e pareceres, TRL, movimentações e governança, entregas e validações, correções, histórico de gestão…), avisos de arquivado, legado e pedido pendente. |

Telas compartilhadas sob responsabilidade desta branch: `src/pages/app/ProjetoDetalhesPage.tsx`.

## Como rodar

```bash
cp .env.example .env
npm install
npm run dev        # http://localhost:3000
npm run build      # checagem de tipos + build de produção
```

**Modo demonstração.** É o padrão (`VITE_USE_MOCK=true` no `.env`): o app usa um banco no navegador que aplica as regras da Fase 3. A chave é `@SIGES_PIN:mockdb:v5`.

**Usuários de teste.** Ficam em `src/services/mock/seed.ts`, junto com a senha: Mariana Costa e Bruno Alves (Demandantes), Rafael Lima (Analista), Fernanda Rocha e João Prado (Especialistas). Para esta branch, entre como **João Prado (Especialista · Dados e IA)**.

**Restaurar os dados.** Em **Meu perfil** ou na tela de entrada “Entrar como”, use **Restaurar dados**.

**Back-end real.** Para usar o back-end Spring Boot (`http://localhost:8080`, via proxy `/api`), defina `VITE_USE_MOCK=false`.

## Como os fluxos se encaixam

Cada fluxo fica em `src/fluxos/<pasta>/` e pode ter `rotas.tsx` (páginas e menu), `fila.tsx` (seção da Minha fila) e `projeto.tsx` (botões e formulários do Detalhe do projeto). A base encontra os fluxos sozinha, então esta branch roda sozinha:
- sem o zip 1, o `/login` vira a entrada simplificada “Entrar como”;
- sem o zip 3, o Configurar Kanban e o Meu perfil não aparecem no menu.

## Divisão da equipe

| Zip / branch | Integrante | Login de teste | Pastas |
|---|---|---|---|
| 1 · `fluxo-demandante-acesso` | Kaua | Mariana Costa | `acesso/`, `demandante/`, `recomendacoes/` |
| 2 · `fluxo-analista` | Lucas | Rafael Lima | `analista/`, `propostas/` |
| 3 · `especialista-seguranca` | Abraão | Fernanda Rocha | `governanca/` |
| **4 · `especialista-dados-e-ia` (esta)** | Angelo | João Prado | `parecer/`, `gestao/`, `visao-geral/` |

**Regra do grupo.** Cada pessoa altera só as suas pastas e as telas compartilhadas que são dela. A base é igual nas quatro branches; mudanças nela precisam ser combinadas com o grupo.

## Documentação

- [todo.md](todo.md): o site inteiro, com fluxos, telas, regras, cores e organização do código.
- [docs/GUIA_REGRAS_FASE3.md](docs/GUIA_REGRAS_FASE3.md): o guia de regras de negócio da Fase 3.
- [docs/FASE3_MUDANCAS.md](docs/FASE3_MUDANCAS.md): o que mudou, por integrante.
- A pasta `sigespin/` é outro projeto Vite que veio da `main` e não é alterado por esta branch.
