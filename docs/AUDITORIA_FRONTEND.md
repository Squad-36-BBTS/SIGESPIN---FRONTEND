# Auditoria e organização do frontend

**Atualização:** 21/10/2026. Este documento registra a organização e as verificações realizadas nesta rodada; não substitui a especificação de domínio da revisão 2.

## PWA (21/10/2026)

- Adicionado `manifest.webmanifest` com metadados de instalação e ícones PNG 192×192, 512×512 e maskable.
- Adicionado `public/sw.js`: pré-cache do app shell, cache de recursos estáticos acessados e fallback offline para navegações SPA. Requisições `/api/` e métodos diferentes de GET não entram no cache.
- O service worker é registrado somente em builds de produção. O botão de instalação aparece quando o navegador emite `beforeinstallprompt`.
- O PWA precisa de HTTPS (exceto localhost) para instalação e service worker. O offline mantém a interface e os recursos estáticos já baixados; operações que dependem do backend não funcionam sem rede.

## Estado encontrado

- A aplicação React 18, Vite e TypeScript está em `sigespin/`, a raiz da aplicação. O repositório Git fica na pasta que contém `sigespin/` e `docs/`; portanto, `sigespin/` é a raiz do frontend, mas não a raiz Git. A cópia da origem continua preservada conforme registrado na auditoria inicial; nenhuma pasta foi movida ou excluída nesta revisão.
- A cópia foi instalada a partir do lockfile com `npm ci`. O `package-lock.json` foi mantido; não foram adicionadas dependências ao projeto.
- O `.gitignore` da raiz organizada cobre `node_modules/`, `dist/`, `.env`, arquivos `*.local` e `*.tsbuildinfo`, além de `.claude/`. O `.env.example` contém nomes e valores padrão não secretos.
- O README passou a instruir `npm ci`, `npm run typecheck` e `npm run build`; também esclarece que as rotas descritas para o backend ainda precisam de confirmação e aponta para esta auditoria.
- Esta auditoria foi criada para reunir diagnóstico, prioridades, ações realizadas, validação, limitações e próximos passos. A documentação de domínio existente foi preservada sem alterar as decisões funcionais da revisão 2.
- O projeto usa React Router, Tailwind, Lucide, Axios e serviços mockados. As telas e rotas da revisão 2 estão presentes: dashboard, portfólio, campanhas, intake, triagem, pareceres, governança, demandas do usuário e perfil.
- A revisão 2 em `RELATORIO_MUDANCAS.md` é a especificação vigente. `PROPOSTA_FRONTEND.md` contém trechos da versão anterior e já declara que foi substituída em parte.
- O modo padrão é demonstração (`VITE_USE_MOCK=true`). O backend e os contratos das rotas propostas não estão presentes neste workspace; portanto, integração real não foi confirmada.
- Os scripts disponíveis são `dev`, `build`, `preview` e `typecheck`; não há scripts de lint ou testes no `package.json`.

## Priorização

| Prioridade | Achado | Situação |
|---|---|---|
| Crítico | A raiz solicitada `sigespin/` não existia; havia uma pasta duplicada com outro nome. | Conteúdo copiado para a raiz `sigespin/`; origem preservada devido a bloqueio de movimentação. |
| Alto | A auditoria inicial não conseguiu consultar Git. | Rechecado em 20/10/2026: repositório na raiz do workspace, branch `abra10`, árvore limpa e remoto `origin` configurado para `Squad-36-BBTS/SIGESPIN---FRONTEND`. |
| Médio | README usava `npm install` e descrevia integração de forma mais conclusiva que os contratos disponíveis. | Atualizado para `npm ci`, typecheck, variáveis e ressalva de contrato proposto. |
| Médio | Não há testes automatizados configurados. | Registrado; não foram inventados testes nem adicionada infraestrutura de teste. |
| Baixo | Há referências a imagens remotas do Unsplash. | Documentado como dependência existente; nenhuma substituição visual foi feita. |

## Alterações feitas nesta rodada

- Criada a raiz de trabalho `sigespin/` com `src/`, `public/`, `docs/`, manifests e configurações originais do frontend.
- Preservados `package.json`, `package-lock.json`, configuração do Vite, TypeScript, Tailwind, PostCSS, assets, páginas, serviços, tipos e documentação existente.
- Não movi nem apaguei a pasta fonte, não inicializei Git e não alterei fluxos de negócio ou endpoints. A cópia evita risco de perda enquanto a origem permanecer bloqueada pelo ambiente.
- Atualizado `README.md` com comandos reprodutíveis, ressalva sobre contratos da API e link para a auditoria.
- Criado este relatório com as prioridades, o resultado das validações, limitações e instruções para execução e revisão Git.
- Nesta revisão, corrigido este relatório para refletir o repositório Git atualmente acessível e os scripts realmente disponíveis. Nenhum código funcional foi alterado.
- Implementado suporte PWA: manifesto, ícones, cache offline, registro de service worker e ação de instalação; README atualizado.

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
- `npm run typecheck`: concluído sem erros nesta revisão.
- `npm run build`: primeira tentativa no sandbox falhou ao acessar `../../..` durante o carregamento do Vite config; repetido fora do sandbox com autorização e concluído com sucesso. Vite transformou 1.670 módulos e gerou `dist/`.
- Após a implementação PWA, `npm run typecheck` passou e `npm run build` passou (1.671 módulos transformados; saída inclui manifesto, ícones e service worker).
- Lint e testes: não há scripts configurados; não executados.
- Revisão de navegação: as rotas declaradas em `App.tsx` correspondem às telas listadas no README; os caminhos legados redirecionam para as telas atuais. O fluxo mockado implementa restrições de papel, evidências para maturidade, validação do demandante para conclusão e alçada de governança.
- Referência Stitch: não foi acessada nesta execução; fidelidade visual não foi atestada.

## Git e próximos passos

O repositório Git está na raiz do workspace (`C:/Users/Abraão Freitas/Downloads/SIGESPIN---FRONTEND-kau`), na branch `abra10`, com árvore limpa na verificação de 20/10/2026. O remoto `origin` aponta para `https://github.com/Squad-36-BBTS/SIGESPIN---FRONTEND.git`. Não foram feitos commits, pushes nem alterações Git. A aplicação fica em `sigespin/`; revise `git status` e o diff antes de publicar.

Para executar: abra a pasta `sigespin` no VS Code, rode `npm ci`, depois `npm run dev`. Para validar: `npm run typecheck` e `npm run build`. Configure `VITE_USE_MOCK=false` somente quando os DTOs, rotas e autorização tiverem sido confirmados com o backend.

Pendências que dependem de validação externa: contratos e autorização do backend e inspeção comparativa da referência Stitch. A responsividade e o comportamento visual foram revisados pelo código, mas não verificados em navegador ou em resoluções específicas nesta revisão. O sistema não contém testes automatizados nem scripts de lint.
