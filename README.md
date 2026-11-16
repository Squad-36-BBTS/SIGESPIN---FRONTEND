# SIGES-PIN — Front-end · branch `fluxo-analista`

Front-end do Sistema Corporativo de Gestão do Portfólio de Inovação da BBTS.
React 18 + Vite + TypeScript + Tailwind CSS 3.4. Regras da **Fase 3** ([docs/GUIA_REGRAS_FASE3.md](docs/GUIA_REGRAS_FASE3.md)).

Esta branch é o **zip 2** da divisão da equipe (Lucas): a base comum do site mais **analista e propostas de configuração**. As telas dos outros integrantes chegam pelas branches deles (veja [Divisão da equipe](#divisão-da-equipe)).

## O que esta branch tem

| Arquivo | O que mudou |
|---|---|
| `src/fluxos/analista/QualificacaoModal.tsx` | Sete textos obrigatórios (inclui maturidade tecnológica e fundamentação separada da conclusão). Não altera etapa nem TRL. |
| `src/fluxos/analista/ConsultaModal.tsx` | Escolha obrigatória de um Especialista ativo e a questão. Pode ser aberta antes da qualificação. |
| `src/fluxos/analista/AvaliacaoTrlModal.tsx` | Nível, justificativa e seleção de ao menos uma evidência do projeto. Também disponível para o Especialista. |
| `src/fluxos/analista/MovimentacaoModal.tsx` | Ao escolher o destino, oferece movimentação direta (percurso livre, ou Especialista em qualquer percurso) ou pedido de avanço (Analista em percurso governado, com evidências). |
| `src/fluxos/analista/EntregaModal.tsx` | Submeter entrega só com a descrição. Também disponível para o Especialista. |
| `src/fluxos/analista/projeto.tsx` | Botões conforme a nova matriz. |
| `src/fluxos/analista/fila.tsx` | Pedidos pendentes e encerrados (aprovados, rejeitados e cancelados), pareceres recebidos, validações recebidas e propostas próprias. |
| `src/fluxos/propostas/` | Novo: página de propostas de configuração com filtro por status e tipo; propor coluna ou percurso (Analista); aprovar, rejeitar ou cancelar (Especialista; o Analista cancela a própria). |

## Como rodar

```bash
cp .env.example .env
npm install
npm run dev        # http://localhost:3000
npm run build      # checagem de tipos + build de produção
```

**Modo demonstração.** É o padrão (`VITE_USE_MOCK=true` no `.env`): o app usa um banco no navegador que aplica as regras da Fase 3. A chave é `@SIGES_PIN:mockdb:v5`.

**Usuários de teste.** Ficam em `src/services/mock/seed.ts`, junto com a senha: Mariana Costa e Bruno Alves (Demandantes), Rafael Lima (Analista), Fernanda Rocha e João Prado (Especialistas). Para esta branch, entre como **Rafael Lima (Analista)**.

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
| **2 · `fluxo-analista` (esta)** | Lucas | Rafael Lima | `analista/`, `propostas/` |
| 3 · `especialista-seguranca` | Abraão | Fernanda Rocha | `governanca/` |
| 4 · `especialista-dados-e-ia` | Angelo | João Prado | `parecer/`, `gestao/`, `visao-geral/` |

**Regra do grupo.** Cada pessoa altera só as suas pastas e as telas compartilhadas que são dela. A base é igual nas quatro branches; mudanças nela precisam ser combinadas com o grupo.

## Documentação

- [todo.md](todo.md): o site inteiro, com fluxos, telas, regras, cores e organização do código.
- [docs/GUIA_REGRAS_FASE3.md](docs/GUIA_REGRAS_FASE3.md): o guia de regras de negócio da Fase 3.
- [docs/FASE3_MUDANCAS.md](docs/FASE3_MUDANCAS.md): o que mudou, por integrante.
- A pasta `sigespin/` é outro projeto Vite que veio da `main` e não é alterado por esta branch.
