# Como cada pessoa sobe o seu fluxo

O site está dividido em **4 zips**, um para cada perfil do login simulado. Cada zip é um projeto **completo e funcionando**: tem a base comum mais as telas do seu fluxo.

| Zip | Pessoa | Login de teste | Telas | Quantas |
|---|---|---|---|---|
| `1-kaua-demandante-landing-login-cadastro.zip` | Kaua | Demandante · Mariana Costa | Landing page, Login, Cadastro (pedido de acesso), Nova demanda, Validar entrega | 5 |
| `2-analista.zip` | | Analista · Rafael Lima | Qualificação, Consultar Especialista, Avaliação TRL, Movimentar Kanban, Publicar entrega | 5 |
| `3-especialista-seguranca-da-informacao.zip` | | Especialista · Fernanda Rocha | Decidir transição, Configurar Kanban, Meu perfil, **Portfólio**, **Minha fila** | 5 |
| `4-especialista-dados-e-ia.zip` | | Especialista · João Prado | Emitir parecer, Dashboard, Ações de mobilização, **Detalhe do projeto** | 4 |

- **Telas compartilhadas (em negrito):** vão em **todos** os zips, porque sem elas nenhum zip roda. Mesmo assim, só o responsável altera.
- **Detalhe do projeto:** é a maior tela do sistema (8 abas) e vale por mais de uma.
- **Minha fila:** cada zip também tem a seção do seu perfil.

**Todos os zips trazem a base:**
- as 3 telas compartilhadas;
- menu lateral;
- dados simulados;
- tipos e serviços;
- documentação, incluindo o `todo.md` com a visão geral do site.

**Quando um zip roda sozinho:**
- sem o zip 1, o `/login` vira uma entrada simplificada, “Entrar como”;
- sem o zip 4, a página inicial depois do login é a Minha fila, no lugar do Dashboard.

`projeto-completo/` é o site com os 4 zips juntos, para referência.

## Passo a passo

1. Atualize a `main` e crie a sua branch:

   ```bash
   git checkout main
   git pull
   git checkout -b <nome-da-branch>
   ```

2. Extraia o seu zip **na raiz do repositório**, a pasta onde ficam o `README.md` e a `docs/`. Os arquivos do zip devem ficar direto ali, sem uma pasta extra com o nome do zip. Aceite substituir o `README.md`.

3. Rode o projeto para conferir:

   ```bash
   npm install
   npm run dev
   ```

   Antes de rodar, copie o `.env.example` para `.env`.

4. Faça o commit e o push:

   ```bash
   git add .
   git commit -m "feat: <fluxo>"
   git push -u origin <nome-da-branch>
   ```

| Zip | Branch sugerida | Mensagem de commit |
|---|---|---|
| 1 | `fluxo-demandante-acesso` | `feat: landing, login, cadastro e fluxo do demandante` |
| 2 | `fluxo-analista` | `feat: fluxo do analista` |
| 3 | `fluxo-especialista-governanca` | `feat: governança, kanban, portfólio e minha fila` |
| 4 | `fluxo-especialista-parecer` | `feat: parecer, dashboard e detalhe do projeto` |

## Merge na main

- **Ordem sugerida:** 1 → 2 → 3 → 4. Qualquer ordem funciona.
- **Por que não dá conflito:**
  - a base é idêntica nos 4 zips, então o git junta sem conflito;
  - cada zip tem os seus arquivos só nas suas pastas em `src/fluxos/`;
  - o site encontra os fluxos sozinho, sem precisar editar menu ou rotas.
- **Depois dos 4 merges,** a `main` fica igual à pasta `projeto-completo/`.

## Regras do grupo

Cada pessoa altera **só o que é dela**:

| Zip | Pastas próprias | Telas compartilhadas sob sua responsabilidade |
|---|---|---|
| 1 | `src/fluxos/acesso/`, `src/fluxos/demandante/` | — |
| 2 | `src/fluxos/analista/` | — |
| 3 | `src/fluxos/governanca/` | `src/pages/app/PortfolioPage.tsx`, `src/pages/app/MinhaFilaPage.tsx` |
| 4 | `src/fluxos/parecer/`, `src/fluxos/visao-geral/` | `src/pages/app/ProjetoDetalhesPage.tsx` |

- A primeira linha de cada tela compartilhada diz quem é o responsável.
- O resto da base (`src/components`, `src/services`, `src/utils`, `src/types`, configurações) deve ser alterado só depois de combinar com o grupo. Se duas branches mudarem o mesmo arquivo de jeitos diferentes, aí sim vai haver conflito.
