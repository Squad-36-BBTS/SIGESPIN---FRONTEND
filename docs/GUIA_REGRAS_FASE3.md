# SIGESPIN — Guia de regras de negócio para o protótipo

Guia para a equipe de front-end montar um protótipo navegável com usuários, projetos e evidências fictícios. As permissões e os comportamentos seguem as regras da Fase 3. O seletor de perfis e os dados da demonstração são recursos do protótipo.

## 1. Navegação e jornada do usuário

1. **Acesso** → escolha um usuário fictício e entre com o perfil correspondente.
2. **Portfólio** → procure uma demanda por texto, arena ou etapa e abra seus detalhes. Inclua também o filtro por arquivamento.
3. **Detalhes do projeto** → reúna resumo, etapa atual, TRL e responsáveis. Organize o restante em abas de qualificação, consultas e pareceres, TRL, movimentações e governança, entregas e validações, correções e histórico de gestão.
4. **Kanban** → exiba as colunas e percursos configurados na demonstração. Ao escolher um destino, ofereça movimentação direta ou solicitação, conforme perfil, percurso e pedidos pendentes.
5. **Áreas adicionais** → recomendações e notificações para usuários autenticados, propostas de configuração e administração do quadro para os perfis correspondentes.
6. **Sair** → volte à seleção de usuário.

O registro começa em **Ideação**. Qualificação, consulta, parecer, avaliação de TRL, movimentação e entrega têm regras próprias. Uma consulta, por exemplo, pode ser encaminhada antes da qualificação. As colunas do Kanban acompanham a configuração do quadro.

| Perfil | Jornada típica |
|---|---|
| Demandante | Cadastra demanda, acompanha o portfólio, registra correções e valida entregas quando é o responsável pelo projeto. Responde a recomendações destinadas a ele. |
| Analista | Qualifica demandas, encaminha consultas, registra TRL, movimenta em percurso livre, solicita governança quando exigida, submete entregas, recomenda demandas e propõe alterações no quadro. |
| Especialista | Emite parecer, registra TRL, movimenta projetos, decide solicitações, submete entregas, recomenda demandas, administra o quadro e atualiza ou arquiva projetos. |

## 2. Matriz de permissões

| Ação | Demandante | Analista | Especialista | Condição adicional |
|---|---|---|---|---|
| Consultar portfólio e detalhes | Sim | Sim | Sim | Usuário ativo com acesso à demonstração |
| Cadastrar demanda | Sim | — | — | Projeto começa em Ideação |
| Qualificar e consultar Especialista | — | Sim | — | Projeto ativo e destinatário válido na consulta |
| Emitir parecer | — | — | Sim | Se vinculado à consulta, exige o destinatário correto |
| Registrar TRL | — | Sim | Sim | Evidências do projeto |
| Mover diretamente | — | Percurso livre | Percurso livre ou governado | Percurso válido e projeto sem solicitação pendente |
| Solicitar avanço governado | — | Sim | — | Um pedido pendente por projeto |
| Decidir avanço | — | — | Sim | Pedido pendente |
| Cancelar avanço | — | Pedido próprio | Sim | Pedido pendente |
| Configurar quadro diretamente | — | — | Sim | Restrições de uso e versão |
| Propor coluna ou percurso | — | Sim | — | Proposta válida e justificativa |
| Decidir proposta de configuração | — | — | Sim | Pedido pendente |
| Cancelar proposta de configuração | — | Pedido próprio | Sim | Pedido pendente |
| Submeter entrega | — | Sim | Sim | Projeto ativo |
| Validar entrega e registrar correção | Responsável pelo projeto | — | — | Projeto ativo |
| Recomendar demanda | — | Sim | Sim | Destinatário ativo com perfil Demandante |
| Converter ou recusar recomendação | Somente destinatário | — | — | Recomendação pendente |
| Editar, arquivar e reativar projeto | — | — | Sim | Versão vigente e justificativa |
| Consultar notificações, propostas de configuração e históricos de entrega, correção e gestão | Sim | Sim | Sim | Usuário ativo com acesso à demonstração |

O portfólio é consultável pelos três perfis. A listagem de recomendações segue uma regra diferente: o Especialista tem visão de gestão, enquanto os demais usuários veem recomendações das quais participam. Mostre ou bloqueie ações conforme o perfil, o vínculo com o projeto e o estado do registro. Confira as mesmas condições ao executar a ação simulada.

## 3. Regras por tela e formulário

### Acesso simulado

- Ofereça um seletor de usuários fictícios para entrar como Demandante, Analista ou Especialista. Mostre o usuário ativo e seu perfil durante a navegação. Ao sair, volte ao seletor.
- Disponibilize dois Demandantes para demonstrar a diferença entre ser responsável pelo projeto e apenas ter o mesmo perfil. Use um segundo Especialista para simular consultas que só o destinatário pode responder.
- Ao trocar de usuário, mantenha os registros da demonstração para que um perfil possa dar continuidade ao trabalho do outro. Reavalie as ações disponíveis de acordo com o novo usuário.

### Nova demanda e portfólio

- Formulário: `titulo` obrigatório de até 255 caracteres, `descricaoDor` obrigatória, `areaDemandanteId` positivo, `origem` obrigatória, `trlInicialDeclarado` inteiro de 1 a 9 e `hipoteseSolucao` opcional.
- Para `ESPONTANEA`, esconda ou limpe `acaoMobilizacaoId`. Para `INDUZIDA`, exija o ID positivo de uma ação existente.
- O cadastro vincula o Demandante que está usando o protótipo, usa a etapa ativa `IDEACAO` e inicia a arena em `A_DEFINIR`. O TRL declarado alimenta o valor inicial do projeto. A avaliação formal tem formulário próprio.
- Na listagem, mostre título, arena, etapa, origem, TRL e responsáveis. Suporte busca por texto, filtros e paginação. Inclua o filtro por arquivamento.
- No detalhe, mostre `arquivado`, motivo e data quando disponíveis. O projeto arquivado permanece consultável e as operações que exigem projeto ativo ficam indisponíveis. A reativação é uma ação do Especialista.
- Valores de arena: `EFICIENCIA_OPERACIONAL`, `NEGOCIOS_DIGITAIS`, `SEGURANCA_INTEGRADA` e `A_DEFINIR`.

### Qualificação, consulta e parecer

| Formulário | Campos | Regra de uso |
|---|---|---|
| Qualificação | `aderenciaTese`, `relevancia`, `grauInovacao`, `viabilidade`, `maturidadeTecnologica`, `fundamentacao`, `conclusao`. Todos são textos obrigatórios. | Analista registra uma nova avaliação com autoria e data. O histórico é preservado. Qualificação não altera a etapa nem o TRL. |
| Consulta | `especialistaId` positivo e `questao` obrigatória. | Analista escolhe um Especialista ativo. A consulta preserva solicitante, destinatário, questão e data. Pode ser aberta antes da qualificação. |
| Parecer | `consultaId` positivo opcional, `fundamentacao` e `conclusao` obrigatórias, `evidenciaIds` obrigatório como lista, aceitando lista vazia. | Especialista pode emitir parecer independente ou responder uma consulta do projeto dirigida a ele. O parecer e seu conjunto de evidências são preservados após o registro. |

No detalhe, exiba os registros em histórico com ação de adicionar.

### Avaliação de TRL e evidências

- Use `nivel` inteiro entre 1 e 9, `justificativa` obrigatória e `evidenciaIds` com ao menos uma evidência. Analista e Especialista podem registrar.
- O nível pode subir, cair ou se manter. Mostre o TRL atual e o histórico com nível anterior, nível registrado, autoria, justificativa e evidências. Atualize o detalhe depois do sucesso.
- A avaliação formal e suas evidências são registradas junto da atualização do TRL.
- Evidências devem existir, pertencer ao mesmo projeto e aparecer uma única vez no registro. Em governança e TRL, a seleção é obrigatória. No parecer, a lista pode ficar vazia. Na correção, há um único ID opcional.
- Use evidências fictícias já vinculadas ao projeto, como um relatório ou uma apresentação, para testar a seleção.

### Kanban e governança da movimentação

- Colunas iniciais: Ideação, POC, MVP, Concluído e Descontinuado. Concluído e Descontinuado são terminais. Os percursos iniciais são Ideação → POC, POC → MVP, MVP → Concluído e saídas de Ideação, POC ou MVP para Descontinuado. Todos os percursos iniciais são marcados como governados. Use a configuração atual do quadro em execução.
- A origem do percurso precisa coincidir com a etapa atual do projeto. Origem, destino e percurso devem estar ativos. Etapa terminal não admite saída.
- **Movimentação direta** recebe `transicaoId` positivo e `justificativa` obrigatória. O Analista só movimenta em percurso livre. O Especialista também pode mover diretamente em percurso governado. Pedido de governança pendente impede a movimentação direta.
- **Solicitação de avanço** recebe `transicaoId`, `justificativa` e `evidenciaIds` não vazio. É aberta pelo Analista apenas para percurso governado. O cartão permanece na origem enquanto o pedido estiver `PENDENTE`. Só pode haver um pedido pendente por projeto.
- **Decisão** recebe `decisao` (`APROVAR` ou `REJEITAR`) e `justificativa`. Só o Especialista decide. Ao aprovar, o serviço revalida o percurso e muda a etapa. Rejeitar encerra o pedido sem mover o projeto.
- **Cancelamento** exige justificativa. Pode ser executado pelo Analista que abriu o pedido ou pelo Especialista. O cartão permanece onde está. Mostre o histórico do pedido com origem, destino, autor, justificativa e dados de encerramento.
- Estados do pedido: `PENDENTE`, `APROVADA`, `REJEITADA`, `CANCELADA`. Se a configuração divergir na aprovação, recarregue o pedido e permita o encerramento pelas ações válidas. Mova o cartão após a aprovação ou após uma movimentação direta válida.
- Movimentações realizadas pelo Especialista geram notificação global consultável pelos perfis autenticados. Mostre a mensagem e o projeto correspondente na área de notificações.

### Configuração do quadro

- **Criar coluna:** Especialista informa `codigo` único que começa com letra maiúscula e usa letras maiúsculas, dígitos ou sublinhado (até 255), `nome` obrigatório até 255, `ordem` inteira ≥ 0 e `terminal` opcional (`CONCLUSAO` ou `DESCONTINUACAO`).
- **Editar coluna:** `nome`, `ordem`, `ativa` e `versao` vigente. Código e tipo terminal ficam fora da edição. A coluna inicial, uma coluna ocupada ou referenciada por percurso ativo não pode ser desativada.
- **Criar percurso:** `origemId` e `destinoId` positivos, com colunas ativas, diferentes e origem não terminal. O par origem/destino é único. Exija `exigeGovernanca`.
- **Editar percurso:** `exigeGovernanca`, `ativa` e `versao`. Os IDs de origem e destino ficam fixos. Alterações ficam bloqueadas enquanto houver pedido de movimentação pendente para o percurso. Reativar exige etapas válidas.
- **Propor configuração:** o Analista envia a `proposta` no formato de criação de coluna ou percurso, junto da `justificativa`. O Especialista aprova ou rejeita. A aprovação aplica a configuração após revalidá-la. Rejeição e cancelamento preservam a proposta sem aplicar a alteração. O Analista cancela somente o próprio pedido. O Especialista também pode cancelar.
- Inclua o filtro por status na listagem de propostas. Utilize os quatro estados de governança e diferencie `COLUNA` de `TRANSICAO`.

### Entregas, validações e correções

| Operação | Campos | Regras |
|---|---|---|
| Submeter entrega | `descricao` obrigatória. | Analista ou Especialista. Registra projeto, autor e data. |
| Validar entrega | `resultado` e `observacoes` obrigatórios. | Demandante responsável. A entrega precisa pertencer ao projeto. Resultados: `VALIDADA`, `VALIDADA_COM_RESSALVAS`, `NAO_VALIDADA`. Cada manifestação gera novo registro. |
| Registrar correção | `descricao` obrigatória, `referencia` opcional de até 500 caracteres, `evidenciaId` opcional e positivo. | Demandante responsável. O registro preserva autor e data e pode referenciar uma evidência do próprio projeto. |

A tela de entregas deve vincular cada validação à entrega correspondente, preservando as manifestações anteriores. Entregas, validações e correções continuam consultáveis em projetos arquivados.

### Recomendações

1. Analista ou Especialista escolhe um `destinatarioId` positivo de Demandante ativo e informa `titulo` obrigatório de até 255 caracteres e `descricao` obrigatória. O registro começa em `PENDENTE`.
2. O destinatário abre a recomendação e pode **converter em demanda** ou **recusar**. A conversão abre o formulário da demanda espontânea e usa as validações do cadastro. A recusa exige justificativa.
3. A conversão cria e vincula um único projeto e muda o status para `CONVERTIDA`. A recusa muda para `RECUSADA`. Ambos são estados finais, com data e justificativa de encerramento.
4. Exiba projeto vinculado nas convertidas e resposta registrada nas recusadas. A listagem pode filtrar por status e respeita a visibilidade do perfil.

### Gestão do projeto

- O Especialista envia `dados`, `versao` vigente e `justificativa` obrigatória ao editar. Os dados incluem `titulo` até 255, `descricaoDor`, `areaDemandanteId` positivo, `hipoteseSolucao` opcional, `arena` obrigatória, `potencialLeiDoBem` opcional, `dispendioEstimado` opcional e não negativo (até 10 dígitos inteiros e 2 decimais), `demandanteId` obrigatório e `analistaResponsavelId` opcional.
- Os responsáveis devem estar ativos e ter os respectivos perfis. Projetos legados podem chegar sem Demandante vinculado. Exiba esse estado e permita atribuição pelo Especialista.
- Para arquivar ou reativar, envie `arquivado`, `versao` e `justificativa`. Arquivar exige ausência de governança pendente. Pedir o estado de arquivamento atual é inválido.
- Preserve o histórico de alterações com autor, justificativa, data e valores anteriores e atuais. Tipos: `CADASTRO` (alteração cadastral), `ARQUIVAMENTO` e `REATIVACAO`.
- Se o registro tiver mudado desde a abertura do formulário, preserve o rascunho e permita revisar a versão mais recente antes de salvar.

## 4. Dados e cenários para a demonstração

Prepare dois Demandantes, um Analista e dois Especialistas. Cadastre áreas fictícias, uma ação de mobilização e evidências vinculadas a projetos diferentes. Inclua projetos em Ideação, POC e etapa terminal, um projeto arquivado, uma recomendação pendente e um pedido de governança pendente. Preserve os percursos iniciais governados e inclua um percurso livre configurado para demonstrar a movimentação direta do Analista.

| Cenário | Comportamento esperado |
|---|---|
| Cadastro por origem | A demanda espontânea começa em Ideação sem ação de mobilização. A induzida exige uma ação válida. O TRL inicial aparece no detalhe. |
| Consulta e parecer | O Analista pode consultar antes de qualificar. O Especialista destinatário pode responder à consulta. Outro Especialista pode emitir parecer independente. |
| Avaliação de TRL | Avaliar de 5 para 3 com justificativa e evidência do projeto atualiza o TRL e registra os dois níveis no histórico. Uma evidência de outro projeto é recusada. |
| Governança | O Analista solicita avanço e o cartão permanece na origem. Ao trocar para o Especialista e aprovar, o cartão muda de etapa e o histórico mostra a decisão. Rejeitar ou cancelar mantém a etapa. |
| Quadro | Uma proposta de coluna fica pendente até a decisão. Ao aprová-la, a nova coluna aparece no Kanban. |
| Entrega e validação | O Demandante responsável valida a entrega. Um segundo Demandante consegue consultar o projeto, mas não pode validar a mesma entrega. Uma nova validação do responsável preserva a primeira. |
| Recomendação | O destinatário converte a recomendação em uma única demanda espontânea. A opção de recusar exige justificativa. |
| Arquivamento | O Especialista arquiva um projeto elegível. Os dados continuam consultáveis e as ações que exigem projeto ativo ficam bloqueadas até a reativação. |

Exiba estados de lista vazia, confirmação de ação e erros de validação nos formulários. Para ações que mudam o estado, como aprovar, cancelar ou arquivar, mostre o efeito no cartão, no detalhe e no histórico correspondentes.

**Referência das regras** · [Fase 3 no GitHub](https://github.com/Squad-36-BBTS/SIGESPIN---BACKEND/tree/1ee20f0adce9bb0b748e1d74490cec3f08db195d)
