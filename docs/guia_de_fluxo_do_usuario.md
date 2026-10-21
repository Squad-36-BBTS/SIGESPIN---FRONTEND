# SIGES-PIN — Fluxo de Usuário para Protótipo do Front-end

* **Público:** Equipe de Front-end e UX/UI
* **Finalidade:** Orientar o protótipo navegável das jornadas principais do portfólio.
* **Base:** Decisões de domínio registradas em `DOCUMENTACAO_FASE1_DOMINIO.md`.

> **Nota:** Este guia descreve o comportamento desejado do produto, não endpoints disponíveis. A Fase 1 implementou domínio e persistência; autenticação, autorização, serviços, API, IA e armazenamento de arquivos ainda serão construídos.

---

## 1. Regras de Produto para o Protótipo

* **Perfis de Acesso:** Há três perfis: **Demandante**, **Analista** e **Especialista**. Não representar Executivo ou Comitê como perfis separados nesta versão.
* **Visibilidade Global:** Todo usuário autenticado pode consultar todos os projetos do portfólio. Ações de escrita variam de acordo com o perfil e a etapa do fluxo.
* **Origem da Demanda:** A demanda pode ser **espontânea** (problema, necessidade ou oportunidade) ou **induzida** (campanha, desafio, hackathon, residência ou ação semelhante).
* **Papel do Demandante:** É o dono do problema. Registra a demanda, participa da jornada e valida entregas/MVPs.
* **Papel do Analista:** Faz triagem e qualificação generalista, coordena a evolução e atualiza TRL com base nos resultados e evidências. Pode consultar um Especialista.
* **Papel do Especialista:** Produz parecer técnico e decide solicitações de Kanban que exigem governança. Parecer técnico e decisão de governança são ações diferentes.
* **Maturidade TRL:** O TRL é um indicador de maturidade de 1 a 9, não uma solicitação de avanço. Pode subir ou descer, desde que a avaliação seja fundamentada e registrada com evidências pertinentes.
* **Kanban e Estágios:** O Kanban representa as etapas reais da jornada. As etapas são configuráveis; as etapas iniciais são *Ideação*, *POC*, *MVP*, *Concluído* e *Descontinuado*.
* **Governança nas Transições:** Cada transição indica se exige governança. Na configuração inicial, as transições previstas exigem governança. Uma decisão aprovada movimenta o projeto; uma rejeitada mantém a etapa atual.
* **Validação de Entrega:** A validação de uma entrega pelo Demandante não aprova automaticamente o projeto nem muda o Kanban.
* **Exibição Financeira:** A política de exibição de dados financeiros ainda não foi definida. O protótipo não deve expor `dispendioEstimado` em telas compartilhadas sem validação do cliente.

---

## 2. Navegação Principal Sugerida

* **Portfólio:** Kanban ou lista com busca e filtros; todos os perfis podem consultar.
* **Nova demanda:** Disponível ao Demandante; formulário com origem espontânea/induzida e dados do problema.
* **Ações de mobilização:** Seleção de campanha/desafio vigente ao registrar uma demanda induzida.
* **Detalhe do projeto:** Resumo, etapa, TRL, origem, responsáveis, histórico, qualificações, pareceres, evidências, entregas e validações.
* **Minha fila:** Tarefas pendentes relevantes ao perfil: triagem para Analista, pareceres e decisões para Especialista, validações para Demandante.
* **Configurar Kanban:** Gestão de etapas e transições, para perfis autorizados conforme decisão final do produto.

> **Instrução de UI:** Destacar visualmente as ações que cabem ao usuário atual sem ocultar os dados de leitura global. Para uma ação indisponível, explicar o motivo em vez de mostrar um botão sem contexto.

---

## 3. Jornadas por Perfil

### 3.1 Demandante — Registrar e Validar

#### A. Entrada da Demanda
1. Acessa **Nova demanda**.
2. Escolhe a origem: **espontânea** ou **induzida**.
3. Preenche título, área demandante, descrição do problema/necessidade/oportunidade e contexto relevante.
4. Se induzida, associa uma **ação de mobilização** disponível.
5. Solicita apoio da IA para organizar/sugerir campos (se o protótipo simular essa integração). As sugestões devem ser apresentadas para revisão e edição; nunca devem parecer decisão automática.
6. Revisa e envia. O projeto entra no portfólio em uma etapa inicial, aguardando triagem do Analista.
7. Continua acessando o detalhe para acompanhar a iniciativa, responder dúvidas e adicionar contexto durante sua evolução.

#### B. Validar uma Entrega
1. Recebe indicação de que há uma entrega/MVP disponível para validação.
2. Abre a entrega e consulta sua descrição e evidências.
3. Registra um resultado: **validada**, **validada com ressalvas** ou **não validada**; preenche observações.
4. Consulta a validação no histórico da entrega. A validação não altera automaticamente o TRL nem a etapa do Kanban.

---

### 3.2 Analista — Qualificar e Conduzir a Iniciativa

#### A. Triagem e Qualificação
1. Abre **Minha fila** ou filtra o portfólio por demandas que aguardam triagem.
2. Consulta o contexto submetido pelo Demandante, a origem e a ação de mobilização, se houver.
3. Registra uma qualificação com aderência à tese, relevância, grau de inovação, viabilidade/factibilidade, maturidade (TRL) e fundamentação/conclusão.
4. Se faltar conhecimento especializado, encaminha uma consulta com pergunta dirigida e destinatário Especialista.
5. Acompanha a resposta/parecer técnico e usa-a como subsídio para a análise. O parecer não equivale à aprovação de governança.
6. Registra nova qualificação quando a análise evoluir, mantendo o histórico anterior.

#### B. Atualizar Maturidade TRL
1. No detalhe do projeto, escolhe **Registrar avaliação TRL**.
2. Informa nível avaliado (1–9), justificativa e evidências que fundamentam o resultado.
3. Se o valor for menor que o atual, exibe claramente que se trata de uma redução e solicita fundamentação.
4. Confirma e consulta o novo valor e a avaliação anterior no histórico.

#### C. Movimentar o Kanban
1. Seleciona uma transição permitida pela configuração do Kanban.
2. Se **não exigir** governança: informa a justificativa e confirma a movimentação.
3. Se **exigir** governança: cria uma solicitação com justificativa e evidências; o projeto continua na etapa atual enquanto aguarda decisão.
4. Acompanha o estado pendente, aprovado ou rejeitado. A aprovação movimenta o projeto; a rejeição preserva a etapa e deve apresentar a justificativa do Especialista.

#### D. Publicar uma Entrega
1. Registra uma entrega ou MVP no projeto, com descrição e arquivos/evidências pertinentes.
2. Encaminha para validação do Demandante.
3. Acompanha as validações e observações sem presumir mudança automática no Kanban.

---

### 3.3 Especialista — Emitir Parecer e Decidir Governança

#### A. Emitir Parecer Técnico
1. Abre a consulta recebida, com pergunta, contexto do projeto e documentos disponibilizados.
2. Registra fundamentação e conclusão, associando evidências técnicas quando aplicável.
3. Envia o parecer e mantém acesso à resposta no histórico do projeto.

#### B. Decidir Transição com Governança
1. Abre a fila de solicitações pendentes.
2. Consulta etapa atual, transição solicitada, justificativa e evidências.
3. Aprova ou rejeita, registrando justificativa da decisão.
4. Na aprovação, o projeto passa à etapa de destino e o histórico registra a movimentação. Na rejeição, permanece na etapa atual.

---

## 4. Telas e Conteúdo para Prototipagem

| Tela | Conteúdo e Estados Importantes |
| :--- | :--- |
| **Login** | Email, senha, carregamento, credenciais inválidas e acesso. Autenticação é futura; não desenhar fluxo de cadastro aberto sem definição. |
| **Portfólio** | Kanban/lista, busca textual, filtros por etapa/origem/arena, contagens, estado vazio e carregamento. Leitura global para os três perfis. |
| **Nova demanda** | Origem, ação de mobilização condicional, campos do problema, sugestão de IA opcional, revisão e confirmação. |
| **Detalhe do projeto** | Resumo, origem, etapa, TRL atual, Demandante, Analista, qualificações, pareceres, solicitações, movimentações, evidências, entregas e validações. |
| **Qualificação** | Critérios textuais, conclusão, histórico de avaliações e opção de consultar Especialista. |
| **Consulta / Parecer** | Pergunta, contexto, anexos, fundamentação, conclusão e histórico. |
| **Avaliação TRL** | Nível atual e proposto, justificativa, anexos, alerta para redução e histórico cronológico. |
| **Solicitação Kanban** | Etapa atual/destino, indicação de governança, justificativa, anexos, estado e decisão. |
| **Entrega e validação** | Descrição da entrega, evidências, resultado escolhido pelo Demandante, observações e validações anteriores. |
| **Configuração Kanban** | Criar/editar/inativar etapa, ordenar colunas e definir transições permitidas e exigência de governança. Não permitir remover etapa em uso. |
| **Dashboard** | Indicadores agregados do portfólio, filtros por período/etapa/origem e acesso ao projeto de origem. Conteúdo final de métricas ainda precisa de validação do cliente. |

---

## 5. Estados Visuais e Feedback

* **Estados de Tarefa vs. Etapas:** Diferenciar claramente *rascunho*, *aguardando triagem*, *aguardando parecer*, *aguardando governança*, *aprovado*, *rejeitado*, *em experimentação*, *aguardando validação*, *concluído* e *descontinuado*. Alguns são estados de tarefa e não etapas Kanban; não misturá-los.
* **Rastreabilidade:** Mostrar autoria e data em qualificações, pareceres, avaliações TRL, decisões, movimentações e validações.
* **Confirmação:** Antes de enviar ou decidir, apresentar resumo dos dados e confirmação. Após sucesso, indicar o que mudou e o próximo responsável.
* **Concorrência:** Para erro de concorrência (dados desatualizados), avisar que o projeto foi alterado por outra pessoa e permitir recarregar antes de tentar novamente.
* **Evidências:** Exibir nome, tipo, autor/data e estado de envio; prever falha de upload, tipos/tamanhos inválidos e repetição segura.
* **Ações Irreversíveis:** Ações de governança ou irreversíveis devem pedir confirmação e motivo; não apagar registros históricos pelo protótipo.
* **Acessibilidade:** Garantir responsividade, navegação por teclado, rótulos acessíveis, contraste e estados de foco/erro.

---

## 6. Papéis × Ações (Resumo de Permissões)

| Ação | Demandante | Analista | Especialista |
| :--- | :---: | :---: | :---: |
| **Consultar projetos do portfólio** | Sim | Sim | Sim |
| **Registrar demanda** | Sim | *A definir* | *A definir* |
| **Qualificar demanda** | Não | Sim | Não |
| **Consultar Especialista** | Não | Sim | — |
| **Emitir parecer técnico** | Não | Não | Sim |
| **Registrar avaliação de TRL** | Não | Sim | *A definir* |
| **Movimentar transição sem governança** | Não | Sim | *A definir* |
| **Solicitar transição com governança** | Não | Sim | Não |
| **Decidir transição que exige governança** | Não | Não | Sim |
| **Submeter entrega/MVP** | Não | Sim | *A definir* |
| **Validar entrega/MVP** | Sim | Não | Não |
| **Configurar etapas/transições** | *A definir* | *A definir* | *A definir* |

> **Nota:** Pontos marcados como *A definir* devem ser validados com o cliente antes de virar regra visual ou permissão. O protótipo pode representar a ação como indisponível ou incluir uma alternativa marcada para discussão, sem assumir a decisão.

---

## 7. Decisões a Validar Antes de Fechar o Protótipo

1. Analista pode registrar demanda além do Demandante? E Especialista pode fazê-lo?
2. Quem cria/configura etapas e transições do Kanban: Analista, Especialista ou ambos?
3. Analista pode registrar avaliação de TRL sozinho ou uma avaliação deve receber parecer/revisão de Especialista?
4. Quais anexos são obrigatórios por tipo de registro? A integridade atual exige fechar o conjunto documental de avaliação/parecer, mas o mínimo de arquivos deve ser definido como regra de negócio.
5. Quais indicadores entram no Dashboard e qual acesso cada perfil tem a dados financeiros?
6. Uma demanda pode ser salva como rascunho, devolvida para complementação ou rejeitada na triagem? Quais estados e notificações devem aparecer?
7. Quais limites de arquivo, formatos aceitos e textos de consentimento são necessários?

---

## 8. Escopo do Protótipo

Priorizar o caminho principal de cada perfil:
* **Demandante:** registra e valida;
* **Analista:** qualifica, consulta, avalia TRL e encaminha transição;
* **Especialista:** emite parecer e decide transição governada.

Incluir portfólio global e detalhe do projeto como telas compartilhadas. Dados, arquivos, login e respostas da IA podem ser simulados, desde que os elementos simulados fiquem identificados e não sejam apresentados como integração pronta.

---

## 📋 Checklist de Épicos do Protótipo Front-end

*Acompanhamento de progresso de desenvolvimento para a equipe do Front-end.*

### Épico 1: Autenticação, Perfis e Shell da Aplicação
- [ ] **E1.1** Implementar tela de Login (com estados simulados: sucesso, erro, carregamento)
- [ ] **E1.2** Criar seletor/simulador de perfil atual (Demandante, Analista, Especialista)
- [ ] **E1.3** Implementar layout base (Header, Sidebar de navegação e breadcrumbs)
- [ ] **E1.4** Estruturar componente de navegação condicional conforme permissões do perfil

### Épico 2: Visão do Portfólio (Kanban e Lista)
- [ ] **E2.1** Desenvolver visualização em **Kanban** com colunas dinâmicas
- [ ] **E2.2** Desenvolver visualização em **Lista/Tabela** com ordenação
- [ ] **E2.3** Implementar busca textual e filtros (por etapa, origem, arena, TRL)
- [ ] **E2.4** Exibir badges de contagem e estados visuais do card (ex: "Aguardando Governança")
- [ ] **E2.5** Implementar estados vazios (*empty state*) e *skeletons* de carregamento

### Épico 3: Minha Fila (Central de Tarefas Pendentes)
- [ ] **E3.1** Implementar visão de pendências adaptativa por perfil
- [ ] **E3.2** Fila do **Analista:** Demandas aguardando triagem e respostas de pareceres
- [ ] **E3.3** Fila do **Especialista:** Consultas técnicas pendentes e transições com governança
- [ ] **E3.4** Fila do **Demandante:** Entregas/MVPs aguardando validação

### Épico 4: Jornada do Demandante (Cadastro e Validação)
- [ ] **E4.1** Construir formulário de **Nova Demanda** (Origem: Espontânea vs. Induzida)
- [ ] **E4.2** Integrar seletor de Ações de Mobilização para demandas induzidas
- [ ] **E4.3** Simular assistente/sugestões de IA nos campos de descrição com opção de aceitar/editar
- [ ] **E4.4** Implementar fluxo de revisão, confirmação e submissão da demanda
- [ ] **E4.5** Construir interface de **Validação de Entrega** (Validada, Validada com ressalvas, Não validada + observações)

### Épico 5: Jornada do Analista (Qualificação, TRL e Gestão)
- [ ] **E5.1** Construir modal/tela de **Qualificação de Demanda** (critérios textuais, tese, viabilidade)
- [ ] **E5.2** Criar fluxo de **Encaminhamento de Consulta** para Especialista
- [ ] **E5.3** Criar formulário de **Avaliação de TRL (1-9)** com alerta visual em caso de redução
- [ ] **E5.4** Implementar ação de **Movimentação no Kanban** (com/sem necessidade de governança)
- [ ] **E5.5** Construir modal de **Publicação de Entrega/MVP** com anexos de evidências

### Épico 6: Jornada do Especialista (Pareceres e Governança)
- [ ] **E6.1** Construir interface para **Emissão de Parecer Técnico** (contexto, fundamentação, anexos)
- [ ] **E6.2** Construir interface de **Decisão de Governança** (Aprovar / Rejeitar transição + justificativa)

### Épico 7: Detalhe do Projeto (Visão Hub/360°)
- [ ] **E7.1** Criar cabeçalho com resumo, TRL atual, responsável e indicador de etapa
- [ ] **E7.2** Implementar linha do tempo / histórico cronológico de interações e movimentações
- [ ] **E7.3** Abas/Seções do Detalhe:
  - [ ] Qualificações e Histórico de TRL
  - [ ] Consultas e Pareceres Técnicos
  - [ ] Entregas, MVPs e Validações do Demandante
  - [ ] Arquivos e Evidências anexadas

### Épico 8: Configurações de Governança e Administrador
- [ ] **E8.1** Criar tela de **Configuração do Kanban** (criar, editar e reordenar etapas)
- [ ] **E8.2** Mapeamento de transições e flags de "Exige Governança"
- [ ] **E8.3** Validação para bloquear exclusão de etapas com projetos ativos

### Épico 9: Dashboard e Indicadores Aggregados
- [ ] **E9.1** Desenvolver cards de métricas agregadas (total de projetos, distribuição por TRL/Etapa)
- [ ] **E9.2** Aplicar filtros por período, etapa e origem
- [ ] **E9.3** Garantir conformidade com regras de visibilidade financeira