# SIGES-PIN — Front-end · branch `fluxo-demandante-acesso`

Front-end do Sistema Corporativo de Gestão do Portfólio de Inovação da BBTS.
React 18 + Vite + TypeScript + Tailwind CSS 3.4. Regras da **Fase 3** ([docs/GUIA_REGRAS_FASE3.md](docs/GUIA_REGRAS_FASE3.md)).

Esta branch é o **zip 1** da divisão da equipe (Kaua): a base comum do site mais **demandante, acesso e recomendações**. As telas dos outros integrantes chegam pelas branches deles (veja [Divisão da equipe](#divisão-da-equipe)).

## O que esta branch tem

| Arquivo | O que mudou |
|---|---|
| `src/fluxos/acesso/LoginPage.tsx` | Login simulado com os 5 usuários do guia (dois Demandantes, um Analista, dois Especialistas). |
| `src/fluxos/demandante/NovaDemandaPage.tsx` | Reescrita: título (até 255), descrição da dor, área, origem, ação de mobilização só na induzida (a espontânea limpa o campo), TRL inicial declarado e hipótese opcional. Começa em Ideação com arena “A definir”. Também converte uma recomendação em demanda espontânea. |
| `src/fluxos/demandante/ValidacaoModal.tsx` | Cada manifestação é um novo registro; mostra a última validação e preserva as anteriores. |
| `src/fluxos/demandante/CorrecaoModal.tsx` | Novo: correção com descrição, referência opcional (até 500) e uma evidência opcional do projeto. |
| `src/fluxos/demandante/projeto.tsx` | Botões Validar entrega, Registrar correção e Adicionar contexto, só para o Demandante responsável. |
| `src/fluxos/demandante/fila.tsx` | Seção nova “Recomendações para você” e selo de arquivado nas demandas. |
| `src/fluxos/recomendacoes/` | Novo: página de recomendações (filtro de status e visibilidade por perfil), recomendar (Analista e Especialista), converter e recusar com justificativa (destinatário). |

## Como rodar

```bash
cp .env.example .env
npm install
npm run dev        # http://localhost:3000
npm run build      # checagem de tipos + build de produção
```

**Modo demonstração.** É o padrão (`VITE_USE_MOCK=true` no `.env`): o app usa um banco no navegador que aplica as regras da Fase 3. A chave é `@SIGES_PIN:mockdb:v5`.

**Usuários de teste.** Ficam em `src/services/mock/seed.ts`, junto com a senha: Mariana Costa e Bruno Alves (Demandantes), Rafael Lima (Analista), Fernanda Rocha e João Prado (Especialistas). Para esta branch, entre como **Mariana Costa (Demandante)**.

**Restaurar os dados.** Em **Meu perfil** ou na tela de entrada “Entrar como”, use **Restaurar dados**.

**Back-end real.** Para usar o back-end Spring Boot (`http://localhost:8080`, via proxy `/api`), defina `VITE_USE_MOCK=false`.

## Como os fluxos se encaixam

Cada fluxo fica em `src/fluxos/<pasta>/` e pode ter `rotas.tsx` (páginas e menu), `fila.tsx` (seção da Minha fila) e `projeto.tsx` (botões e formulários do Detalhe do projeto). A base encontra os fluxos sozinha, então esta branch roda sozinha:
- sem os outros zips, o menu mostra só Minha fila, Portfólio, Nova demanda e Recomendações;
- sem o zip 4, a página inicial da área logada é a Minha fila.

## Divisão da equipe

| Zip / branch | Integrante | Login de teste | Pastas |
|---|---|---|---|
| **1 · `fluxo-demandante-acesso` (esta)** | Kaua | Mariana Costa | `acesso/`, `demandante/`, `recomendacoes/` |
| 2 · `fluxo-analista` | Lucas | Rafael Lima | `analista/`, `propostas/` |
| 3 · `especialista-seguranca` | Abraão | Fernanda Rocha | `governanca/` |
| 4 · `especialista-dados-e-ia` | Angelo | João Prado | `parecer/`, `gestao/`, `visao-geral/` |

**Regra do grupo.** Cada pessoa altera só as suas pastas e as telas compartilhadas que são dela. A base é igual nas quatro branches; mudanças nela precisam ser combinadas com o grupo.

## Documentação

- [todo.md](todo.md): o site inteiro, com fluxos, telas, regras, cores e organização do código.
- [docs/GUIA_REGRAS_FASE3.md](docs/GUIA_REGRAS_FASE3.md): o guia de regras de negócio da Fase 3.
- [docs/FASE3_MUDANCAS.md](docs/FASE3_MUDANCAS.md): o que mudou, por integrante.
- A pasta `sigespin/` é outro projeto Vite que veio da `main` e não é alterado por esta branch.
