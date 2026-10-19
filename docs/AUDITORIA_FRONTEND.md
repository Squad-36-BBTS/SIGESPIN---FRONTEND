# Auditoria e organização do frontend

**Atualização:** 19/10/2026. Este documento registra a organização e as verificações realizadas nesta rodada; não substitui a especificação de domínio da revisão 2.

## Estado encontrado

- A aplicação React 18, Vite e TypeScript estava em uma pasta aninhada `SIGESPIN---FRONTEND-kau` dentro do workspace. O conteúdo necessário do frontend foi copiado para `sigespin/`, que agora é a raiz organizada para abrir e versionar. A pasta de origem foi mantida intacta porque o ambiente bloqueou sua renomeação; ela é uma cópia redundante fora da raiz indicada. `node_modules/` e `dist/` não foram copiados.
- A cópia foi instalada a partir do lockfile com `npm ci`. O `package-lock.json` foi mantido; não foram adicionadas dependências ao projeto.
- O `.gitignore` da raiz organizada cobre `node_modules/`, `dist/`, `.env`, arquivos `*.local` e `*.tsbuildinfo`, além de `.claude/`. O `.env.example` contém nomes e valores padrão não secretos.
- O README passou a instruir `npm ci`, `npm run typecheck` e `npm run build`; também esclarece que as rotas descritas para o backend ainda precisam de confirmação e aponta para esta auditoria.
- Esta auditoria foi criada para reunir diagnóstico, prioridades, ações realizadas, validação, limitações e próximos passos. A documentação de domínio existente foi preservada sem alterar as decisões funcionais da revisão 2.
- O projeto usa React Router, Tailwind, Lucide, Axios e serviços mockados. As telas e rotas da revisão 2 estão presentes: dashboard, portfólio, campanhas, intake, triagem, pareceres, governança, demandas do usuário e perfil.
- A revisão 2 em `RELATORIO_MUDANCAS.md` é a especificação vigente. `PROPOSTA_FRONTEND.md` contém trechos da versão anterior e já declara que foi substituída em parte.
- O modo padrão é demonstração (`VITE_USE_MOCK=true`). O backend e os contratos das rotas propostas não estão presentes neste workspace; portanto, integração real não foi confirmada.
- Não há suíte de testes configurada no `package.json`.

## Priorização

| Prioridade | Achado | Situação |
|---|---|---|
| Crítico | A raiz solicitada `sigespin/` não existia; havia uma pasta duplicada com outro nome. | Conteúdo copiado para a raiz `sigespin/`; origem preservada devido a bloqueio de movimentação. |
| Alto | Git não pôde informar status, branch, raiz ou remoto. Não há `.git` visível no workspace nem na pasta original. O ambiente injeta `safe.directory=C:\Users\Abraão Freitas`, e o Git falha tentando mudar para esse caminho. | Não inicializado nem alterado; requer abrir o diretório correto em um clone/repositório Git para preparar publicação. |
| Médio | README usava `npm install` e descrevia integração de forma mais conclusiva que os contratos disponíveis. | Atualizado para `npm ci`, typecheck, variáveis e ressalva de contrato proposto. |
| Médio | Não há testes automatizados configurados. | Registrado; não foram inventados testes nem adicionada infraestrutura de teste. |
| Baixo | Há referências a imagens remotas do Unsplash. | Documentado como dependência existente; nenhuma substituição visual foi feita. |

## Alterações feitas nesta rodada

- Criada a raiz de trabalho `sigespin/` com `src/`, `public/`, `docs/`, manifests e configurações originais do frontend.
- Preservados `package.json`, `package-lock.json`, configuração do Vite, TypeScript, Tailwind, PostCSS, assets, páginas, serviços, tipos e documentação existente.
- Não movi nem apaguei a pasta fonte, não inicializei Git e não alterei fluxos de negócio ou endpoints. A cópia evita risco de perda enquanto a origem permanecer bloqueada pelo ambiente.
- Atualizado `README.md` com comandos reprodutíveis, ressalva sobre contratos da API e link para a auditoria.
- Criado este relatório com as prioridades, o resultado das validações, limitações e instruções para execução e revisão Git.

## Organização em `sigespin/`

```text
sigespin/
├── public/
├── src/
│   ├── components/  ├── contexts/  ├── hooks/  ├── pages/
│   ├── services/    ├── types/     └── utils/
├── docs/
├── package.json
├── package-lock.json
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── .gitignore
└── README.md
```

`node_modules/` e `dist/` não fazem parte do versionamento; o `.gitignore` os exclui junto de `.env` e arquivos locais. `.env.example` contém somente valores ilustrativos não secretos.

## Validação executada

- `npm ci`: concluído, 165 pacotes instalados a partir do lockfile.
- `npm run typecheck`: concluído sem erros.
- `npm run build`: concluído fora do sandbox; Vite transformou 1.670 módulos e gerou `dist/`. Dentro do sandbox, o esbuild recebeu acesso negado ao diretório pai ao carregar o config, então a execução foi repetida com acesso aprovado e passou.
- A primeira tentativa de build dentro do sandbox falhou por restrição de acesso a `../../..` ao carregar o config Vite; o mesmo build, repetido com acesso aprovado fora do sandbox, concluiu com sucesso. Não foi necessário alterar a configuração de build.
- Testes: não existe script de testes configurado.
- Revisão de navegação: as rotas declaradas em `App.tsx` correspondem às telas listadas no README; os caminhos legados redirecionam para as telas atuais. O fluxo mockado implementa restrições de papel, evidências para maturidade, validação do demandante para conclusão e alçada de governança.
- Referência Stitch: não foi acessada nesta execução; fidelidade visual não foi atestada.

## Git e próximos passos

Não foi possível verificar branch, diff ou remotos porque esta pasta não contém metadados `.git` acessíveis e o ambiente falha ao resolver o caminho configurado como diretório seguro. Nenhum commit, push, reset ou inicialização Git foi realizado. Antes de publicar, abra `sigespin/` dentro do clone correto, confira `git status`, branch e remoto e revise os arquivos copiados.

Para executar: abra a pasta `sigespin` no VS Code, rode `npm ci`, depois `npm run dev`. Para validar: `npm run typecheck` e `npm run build`. Configure `VITE_USE_MOCK=false` somente quando os DTOs, rotas e autorização tiverem sido confirmados com o backend.

Pendências que dependem de validação externa: contratos e autorização do backend, inspeção comparativa da referência Stitch e configuração da raiz Git/remoto apropriados.
