# Arquitetura do Frontend — SIGES-PIN

## 1. Objetivo

Este documento descreve a arquitetura do frontend do SIGES-PIN — Sistema Corporativo de Gestão do Portfólio de Inovação da BBTS.

Seu objetivo é documentar a organização da aplicação, as responsabilidades dos componentes, o fluxo de navegação, os padrões de desenvolvimento e os critérios utilizados para manter o código organizado, reutilizável e sustentável.

Este documento deve ser atualizado sempre que ocorrer uma mudança relevante na estrutura do frontend.

## 2. Visão geral

O SIGES-PIN possui uma interface web voltada à gestão e ao acompanhamento do portfólio de inovação.

O frontend tem como objetivos apresentar informações de forma clara, permitir a navegação entre as funcionalidades do sistema e oferecer uma interface consistente com a referência visual definida no Stitch.

A implementação utiliza as seguintes tecnologias como base do projeto:

- **React:** construção da interface por meio de componentes.
- **Vite:** ferramenta de desenvolvimento e build da aplicação.
- **TypeScript:** tipagem estática para melhorar a organização e a segurança do código.
- **Tailwind CSS:** estilização da interface por meio de classes utilitárias.

As versões das dependências e a configuração efetivamente utilizada devem ser confirmadas nos arquivos `package.json`, `vite.config.ts`, `tsconfig.json` e nos arquivos de configuração do Tailwind presentes no repositório.

## 3. Princípios arquiteturais

A implementação do frontend deve seguir estes princípios:

### 3.1. Separação de responsabilidades

Cada componente deve ter uma responsabilidade bem definida. Elementos de layout, páginas, componentes visuais e regras de apresentação devem ser separados sempre que isso melhorar a clareza e a manutenção do código.

### 3.2. Reutilização

Elementos utilizados em diferentes partes da aplicação devem ser candidatos à criação de componentes reutilizáveis, evitando duplicação desnecessária.

### 3.3. Consistência visual

As páginas devem manter os padrões de cores, tipografia, espaçamento, bordas, botões, cartões e navegação definidos para o SIGES-PIN.

A referência visual do Stitch deve orientar a implementação, respeitando as funcionalidades e as limitações reais do projeto.

### 3.4. Responsividade

A interface deve se adaptar a diferentes tamanhos de tela, evitando conteúdo cortado, sobreposição de elementos e perda de funcionalidades.

### 3.5. Manutenibilidade

O código deve ser organizado para permitir correções e melhorias sem exigir alterações desnecessárias em partes não relacionadas do sistema.

### 3.6. Integridade do projeto

Antes de alterar ou excluir arquivos, deve-se verificar sua finalidade e suas dependências. Mudanças estruturais devem ser realizadas em etapas, com validação após cada alteração relevante.

## 4. Organização do frontend

A estrutura real deve ser confirmada diretamente no repositório. A organização abaixo descreve a separação lógica recomendada para o projeto e não deve ser interpretada como uma declaração de que todos os diretórios ou componentes já existem.

```text
sigespin/
├── docs/
│   ├── README.md
│   ├── relatorio-progresso.md
│   ├── arquitetura-frontend.md
│   ├── design-system.md
│   ├── diario-de-erros.md
│   └── historico-de-alteracoes.md
├── src/
│   ├── components/
│   │   ├── layout/
│   │   └── dashboard/
│   ├── pages/
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
├── vite.config.ts
└── tsconfig.json
```

**Observação:** essa árvore é uma referência organizacional baseada nas informações disponíveis. Os diretórios e arquivos devem ser comparados com a estrutura real antes de serem considerados confirmados.

## 5. Camadas e responsabilidades

### 5.1. Inicialização da aplicação

O arquivo `main.tsx`, caso presente nessa estrutura, é responsável pelo ponto de entrada do frontend, pela montagem da aplicação React e pela configuração dos elementos globais necessários.

### 5.2. Componente principal

O arquivo `App.tsx` atua como ponto de composição principal da interface. Sua responsabilidade depende da implementação atual: pode renderizar uma página diretamente ou organizar as rotas e os elementos globais da aplicação.

Alterações nesse arquivo devem considerar o fluxo de navegação e os componentes que dependem dele.

### 5.3. Páginas

O diretório `src/pages/` deve concentrar as páginas que representam áreas funcionais do sistema.

O Dashboard é a página de referência para a evolução inicial da interface. Sua implementação deve ser mantida como base e aprimorada gradualmente para se aproximar do design definido no Stitch, evitando uma reconstrução completa sem justificativa técnica.

Outras páginas devem ser documentadas conforme sua existência e seu estado real de implementação.

### 5.4. Componentes de layout

O diretório `src/components/layout/`, já mencionado no contexto do desenvolvimento, é destinado aos elementos estruturais compartilhados da interface.

Exemplos de responsabilidades:

- Cabeçalho institucional e principal;
- Navegação lateral;
- Estrutura geral do conteúdo;
- Área de identificação do usuário;
- Elementos compartilhados entre páginas.

A existência e o comportamento de cada componente devem ser verificados no código antes de serem registrados como concluídos.

### 5.5. Componentes do Dashboard

O diretório `src/components/dashboard/`, também mencionado no contexto do projeto, destina-se a componentes específicos do Dashboard.

Exemplos de componentes que podem fazer parte dessa área:

- Indicadores resumidos;
- Cartões de métricas;
- Gráficos;
- Visualizações do funil de inovação;
- Distribuição de projetos por arena estratégica.

Esses exemplos representam responsabilidades esperadas. Os nomes e as funções dos componentes existentes devem ser documentados após a inspeção dos arquivos.

### 5.6. Estilização

O Tailwind CSS é utilizado como tecnologia de estilização prevista para o frontend.

As classes devem seguir padrões consistentes de cores, espaçamento, tipografia, responsividade e estados visuais. Quando um padrão for utilizado repetidamente, deve-se avaliar a possibilidade de centralizá-lo em componentes ou configurações compartilhadas.

## 6. Navegação e rotas

A navegação deve permitir que o usuário acesse as áreas funcionais do SIGES-PIN de forma previsível.

As rotas abaixo foram discutidas durante o planejamento, mas precisam ser verificadas na implementação atual antes de serem consideradas rotas ativas:

| Rota prevista | Finalidade |
|---|---|
| `/dashboard` | Apresentação dos indicadores e da visão geral do portfólio |
| `/demandas/nova` | Início do cadastro de uma nova iniciativa ou demanda |
| `/kanban` | Visualização do quadro de acompanhamento por etapas |
| `/projetos` | Consulta de projetos |
| `/solicitacoes` | Consulta de solicitações |
| `/configuracoes` | Acesso às configurações do sistema |

A implementação deve ser inspecionada para confirmar se utiliza React Router ou outro mecanismo de navegação.

Se houver React Router, as rotas devem ser declaradas de forma centralizada ou organizada de acordo com a estrutura existente, evitando navegação manual inconsistente.

Os links da navegação devem corresponder a destinos reais. Funcionalidades ainda não implementadas devem ser identificadas como pendentes, sem simular que já estão operacionais.

## 7. Dashboard como base da interface

O Dashboard constitui a base visual inicial do SIGES-PIN.

A referência visual apresenta:

- Faixa institucional superior com identificação da BBTS;
- Cabeçalho com o nome SIGES-PIN e navegação principal;
- Identificação do perfil do usuário;
- Barra lateral de navegação;
- Área de conteúdo com fundo claro;
- Botão para iniciar o cadastro de uma iniciativa;
- Cartões de indicadores;
- Gráfico de distribuição estratégica de projetos por arena;
- Visualização do funil de inovação.

Os números apresentados na referência visual devem ser tratados como valores ilustrativos até que sua origem e sua integração com dados reais sejam confirmadas.

O desenvolvimento do Dashboard deve priorizar:

1. Correspondência visual com a referência;
2. Organização dos componentes;
3. Responsividade;
4. Consistência dos elementos de interface;
5. Separação entre dados ilustrativos e dados provenientes de serviços;
6. Validação do funcionamento dos controles e da navegação.

## 8. Fluxo de dados

O fluxo de dados efetivamente implementado deve ser identificado por meio da leitura do código.

Como orientação arquitetural, a interface deve distinguir:

- Dados apresentados nos componentes;
- Estado local de interação;
- Dados recebidos de serviços ou APIs;
- Estados de carregamento;
- Estados de erro;
- Ausência de dados.

Enquanto uma integração com backend não estiver confirmada, não se deve afirmar que os indicadores ou gráficos recebem dados reais do sistema.

Quando uma integração for implementada, sua origem, o formato dos dados, o tratamento de erros e os componentes afetados deverão ser registrados nesta documentação.

## 9. Responsividade e acessibilidade

A interface deve ser testada em diferentes larguras de tela, incluindo computadores, tablets e dispositivos móveis.

Os principais critérios são:

- Navegação utilizável em telas menores;
- Cartões e gráficos adaptáveis;
- Ausência de rolagem horizontal indevida;
- Contraste adequado entre texto e fundo;
- Botões e campos com identificação compreensível;
- Elementos interativos acessíveis por teclado quando aplicável;
- Uso de elementos semânticos apropriados.

A adoção de classes responsivas do Tailwind deve seguir os padrões encontrados no projeto e o comportamento esperado de cada componente.

## 10. Testes e validação

Após mudanças relevantes no frontend, devem ser executadas as verificações disponíveis no projeto.

A validação deve considerar:

1. Inicialização da aplicação;
2. Ausência de erros de compilação;
3. Ausência de erros relevantes no console;
4. Navegação entre as rotas implementadas;
5. Funcionamento dos controles interativos;
6. Responsividade;
7. Correspondência visual com a referência;
8. Integridade das funcionalidades existentes.

Os comandos efetivos devem ser confirmados no `package.json`. Não registrar um teste como aprovado sem que ele tenha sido executado.

## 11. Registro das alterações arquiteturais

Toda alteração relevante na arquitetura deve ser registrada no arquivo `historico-de-alteracoes.md`.

O registro deve incluir:

- Data da alteração;
- Identificador do commit, quando disponível;
- Arquivos criados, modificados ou removidos;
- Componentes, funções ou rotas afetados;
- Motivo da mudança;
- Impacto sobre outras partes da aplicação;
- Testes executados e resultados;
- Pendências identificadas.

Alterações que introduzam ou modifiquem padrões de arquitetura também devem atualizar este documento.

## 12. Pendências de verificação

Os itens abaixo devem ser confirmados por inspeção do repositório:

- [ ] Estrutura real dos diretórios e arquivos;
- [ ] Versões das tecnologias e dependências;
- [ ] Responsabilidades reais de `App.tsx` e `main.tsx`;
- [ ] Componentes efetivamente existentes em `layout/` e `dashboard/`;
- [ ] Mecanismo de roteamento e rotas implementadas;
- [ ] Existência de serviços ou integrações com backend;
- [ ] Origem dos dados exibidos nos indicadores e gráficos;
- [ ] Scripts de execução, build e testes;
- [ ] Estado de responsividade e acessibilidade;
- [ ] Diferenças entre a implementação atual e a referência do Stitch.

## 13. Regra de manutenção

Este documento deve representar a arquitetura real do frontend, e não apenas a arquitetura desejada.

Sempre que uma funcionalidade for planejada, iniciada, implementada ou validada, seu estado deve ser registrado de forma explícita. Informações não confirmadas devem permanecer identificadas como pendências até que sejam verificadas.

O objetivo é manter uma documentação confiável, útil para a equipe e capaz de explicar a evolução técnica do SIGES-PIN ao longo dos commits.