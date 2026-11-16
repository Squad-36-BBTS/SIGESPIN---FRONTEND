# SIGES-PIN — Front-end

Front-end do Sistema Corporativo de Gestão do Portfólio de Inovação da BBTS.
React 18 + Vite + TypeScript + Tailwind CSS 3.4. Regras da **Fase 3** ([docs/GUIA_REGRAS_FASE3.md](docs/GUIA_REGRAS_FASE3.md)).

O projeto é um **protótipo navegável**: o acesso, os dados e a IA são simulados no navegador, e as regras de negócio seguem o guia da Fase 3. A visão geral completa do site (fluxos, telas, regras, cores e código) está em [todo.md](todo.md).

## Como rodar

```bash
cp .env.example .env
npm install
npm run dev        # http://localhost:3000
npm run build      # checagem de tipos + build de produção
```

**Modo demonstração.** É o padrão (`VITE_USE_MOCK=true` no `.env`): o app usa um banco no navegador que aplica as regras da Fase 3. Cada navegador tem os próprios dados; para voltar ao estado inicial, use **Restaurar dados** em Meu perfil ou na tela de entrada.

**Back-end real.** Para usar o back-end Spring Boot (`http://localhost:8080`, via proxy `/api`), defina `VITE_USE_MOCK=false`. As rotas da API ainda são propostas e ficam em `src/services/index.ts`.

## Usuários de teste

Entre pela tela de login, usando os botões de “Login simulado”. A senha fica em `src/services/mock/seed.ts`.

| Perfil | Nome | Para que serve |
|---|---|---|
| Demandante | Mariana Costa | Responsável por várias demandas |
| Demandante | Bruno Alves | Mostra a diferença entre ser o responsável e só ter o mesmo perfil |
| Analista | Rafael Lima | Conduz as iniciativas |
| Especialista | Fernanda Rocha | Segurança da informação |
| Especialista | João Prado | Dados e IA; só o destinatário responde a uma consulta |

Trocar de usuário mantém os registros, para um perfil continuar o trabalho do outro.

## O que o site tem

| Parte | Pastas em `src/fluxos/` | Telas e ações |
|---|---|---|
| Acesso | `acesso/` | Landing, login e cadastro (pedido de acesso) |
| Demandante | `demandante/`, `recomendacoes/` | Nova demanda, converter recomendação, validar entrega, registrar correção, recomendações |
| Analista | `analista/`, `propostas/` | Qualificação, consulta a Especialista, registrar TRL, movimentar (direto ou pedido de avanço), submeter entrega, propostas de configuração |
| Governança | `governanca/` | Decidir e cancelar pedidos de avanço, configuração do quadro, Meu perfil (matriz de permissões) |
| Parecer e gestão | `parecer/`, `gestao/` | Emitir parecer, editar projeto, arquivar e reativar |
| Visão geral | `visao-geral/` | Dashboard, ações de mobilização, notificações |

As telas compartilhadas ficam em `src/pages/app/`: **Portfólio**, **Minha fila** e **Detalhe do projeto** (10 abas).

Cada fluxo é uma pasta que a base encontra sozinha (`rotas.tsx`, `fila.tsx` e `projeto.tsx`), sem registro manual. Os detalhes estão em [todo.md](todo.md), na seção “Organização do código”.

## Equipe

| Integrante | Pastas | Telas compartilhadas sob sua responsabilidade |
|---|---|---|
| Kaua | `acesso/`, `demandante/`, `recomendacoes/` | — |
| Lucas | `analista/`, `propostas/` | — |
| Abraão | `governanca/` | `PortfolioPage.tsx`, `MinhaFilaPage.tsx` |
| Angelo | `parecer/`, `gestao/`, `visao-geral/` | `ProjetoDetalhesPage.tsx` |

Cada pessoa altera só as suas pastas e as telas compartilhadas que são dela. Mudanças na base (`src/types`, `src/services`, `src/utils`, `src/components`) precisam ser combinadas com o grupo.

## Publicação

O site é uma aplicação de página única e pode ser publicado na Vercel: framework Vite, build `npm run build`, saída `dist`, pasta raiz `./`. O arquivo `vercel.json` faz as rotas (como `/app/portfolio`) funcionarem ao recarregar a página. Não são necessárias variáveis de ambiente no modo demonstração.

## Documentação

- [todo.md](todo.md): o site inteiro, com fluxos, telas, regras, cores, design e organização do código.
- [docs/GUIA_REGRAS_FASE3.md](docs/GUIA_REGRAS_FASE3.md): o guia de regras de negócio da Fase 3.
- [docs/FASE3_MUDANCAS.md](docs/FASE3_MUDANCAS.md): o que mudou na Fase 3, por integrante.
- [docs/RELATORIO_MUDANCAS.md](docs/RELATORIO_MUDANCAS.md) e [docs/PROPOSTA_FRONTEND.md](docs/PROPOSTA_FRONTEND.md): documentos das versões anteriores.
- A pasta `sigespin/` é um projeto Vite separado, do Dashboard Executivo inicial; ele não faz parte deste front-end.
