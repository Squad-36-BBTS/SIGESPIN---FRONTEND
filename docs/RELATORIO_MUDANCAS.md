# SIGES-PIN — Relatório de mudanças (revisão 3)

**Data:** 23/10/2026 · **Base:** guia “SIGES-PIN — Fluxo de usuário para protótipo do Front-end”, derivado de `DOCUMENTACAO_FASE1_DOMINIO.md`
**Situação:** implementado no front-end com dados simulados (`VITE_USE_MOCK=true`). Autenticação, API, IA e armazenamento de arquivos continuam simulados e identificados como tal na interface.

> A revisão 3 substitui as regras da revisão 2 (alçada de governança, pautas e etapas fixas) e da [proposta inicial](./PROPOSTA_FRONTEND.md).
> Itens marcados como **“a definir”** no guia aparecem na interface como **ações desabilitadas com o selo “Em discussão”**, sem virar regra.

---

## 1. O que mudou em relação à revisão 2

| # | Guia | Revisão 2 | Revisão 3 |
|---|---|---|---|
| 1 | Kanban configurável, começando com Ideação, POC, MVP, Concluído e Descontinuado | 8 etapas fixas (Backlog, Qualificação, Governança…) | Etapas e transições vêm da configuração. Seed inicial com as 5 etapas do guia. |
| 2 | Estados de tarefa não são etapas | Triagem e governança viravam colunas | **Pendências** (aguardando triagem, parecer, governança, validação) aparecem como selos tracejados, separados da etapa. |
| 3 | Cada transição indica se exige governança | Pautas, marcos e alçada | Sem governança, o Analista move com justificativa. Com governança, o Analista cria uma **solicitação de transição** e o Especialista aprova (move) ou rejeita (mantém). |
| 4 | Especialista decide governança; sem Executivo nem Comitê | Flag `alcadaGovernanca` | Flag removida. Todo Especialista decide transições governadas. Parecer e decisão são ações separadas. |
| 5 | Tela Configurar Kanban | Não existia | Criar, editar, inativar, ordenar e remover etapas, além de definir transições e governança. Não remove nem inativa etapa em uso. A permissão está **a definir**: a tela abre em modo consulta, com “Simular edição” marcada para discussão. |
| 6 | Qualificação com critérios em texto e histórico | Notas de 1 a 5 com encaminhamento | Critérios em texto, TRL avaliado e fundamentação/conclusão. Novas qualificações preservam as anteriores e não movem o Kanban. |
| 7 | Parecer com fundamentação, conclusão e evidências | Recomendação e TRL sugerido | Fundamentação, conclusão e anexos técnicos. |
| 8 | Validação: validada, com ressalvas ou não validada, sem efeito no Kanban | 2 opções; concluir exigia validação | 3 opções. A validação não altera TRL nem etapa. A trava de conclusão foi removida. |
| 9 | TRL sobe ou desce com fundamentação e evidências | Redução permitida com aviso | Redução exige justificativa mais longa (40+ caracteres), é destacada no formulário e no histórico. Evidência é obrigatória. |
| 10 | Não expor `dispendioEstimado` | Visível para Analista e alçada | Removido de todas as telas e do retorno do mock. |
| 11 | Sem cadastro aberto | Tela “Solicitar acesso” | Tela removida. `/cadastro` redireciona para o login. |
| 12 | “Minha fila” por perfil | 4 telas (Triagem, Pareceres, Governança, Minhas demandas) | Uma tela **Minha fila**: triagem e retornos (Analista), pareceres e decisões (Especialista), validações e demandas (Demandante). |
| 13 | Ação indisponível explica o motivo | Botões ocultos | Componente `BotaoAcao`: mostra o botão desabilitado com o motivo. Ações “a definir” levam o selo “Em discussão”. |
| 14 | Resumo e confirmação antes de enviar ou decidir; depois, o que mudou e quem é o próximo responsável | Só no cadastro | Todos os formulários seguem **Preencher → Revisar → Confirmar**. A mensagem de sucesso diz o que mudou e quem é o próximo responsável. |
| 15 | Concorrência: avisar e permitir recarregar | Recarregava sozinho | Um conflito (409) mostra um aviso com o botão **Recarregar**. |
| 16 | Evidências com tipo, autor/data, estado de envio, falha e repetição | Lista simples | Validação de formato e tamanho e estado por arquivo (pronto, enviando, falhou). Falha de upload não registra nada e permite reenviar. Tabela de evidências com tipo, registro, autor/data e envio. |
| 17 | Dashboard com filtros por período, etapa e origem | Sem filtros | Filtros com acesso aos projetos de origem. Os indicadores aparecem marcados como “a validar com o cliente”. |
| 18 | Demandante adiciona contexto durante a evolução | Aba Participação | Mantida, com o atalho “Adicionar contexto”. Cadastro ganhou o campo “Contexto relevante”. |

---

## 2. Perfis e matriz de ações (guia, seção 6)

Fonte única: `src/utils/permissoes.ts`, usada pela interface e pelo mock.

| Ação | Demandante | Analista | Especialista |
|---|:-:|:-:|:-:|
| Consultar projetos do portfólio | Sim | Sim | Sim |
| Registrar demanda | Sim | *A definir* | *A definir* |
| Qualificar demanda | Não | Sim | Não |
| Consultar Especialista | Não | Sim | — |
| Emitir parecer técnico | Não | Não | Sim |
| Registrar avaliação de TRL | Não | Sim | *A definir* |
| Movimentar transição sem governança | Não | Sim | *A definir* |
| Solicitar transição com governança | Não | Sim | Não |
| Decidir transição que exige governança | Não | Não | Sim |
| Submeter entrega/MVP | Não | Sim | *A definir* |
| Validar entrega/MVP | Sim (dono) | Não | Não |
| Configurar etapas/transições | *A definir* | *A definir* | *A definir* |

Regras de contexto aplicadas além da matriz:
- As ações do Analista sobre o projeto ficam com o **analista que conduz a iniciativa**. A primeira qualificação define quem conduz.
- Projetos em etapa final não aceitam ações do ciclo.
- Só pode haver uma solicitação de transição pendente por projeto.
- Validar entregas e participar da conversa: apenas o demandante dono da demanda (e a equipe, no caso da conversa).

---

## 3. Entidades (front-end)

| Entidade | Campos principais |
|---|---|
| `Usuario` | `perfil` ∈ {DEMANDANTE, ANALISTA, ESPECIALISTA}, `areaTecnica` (Especialista). Sem alçada. |
| `EtapaKanban` | `nome`, `descricao`, `ordem`, `cor`, `ativa`, `terminal`. |
| `TransicaoKanban` | `origemId`, `destinoId`, `exigeGovernanca`, `ativa`. |
| `Projeto` | `etapa` (resumo da etapa configurada), `origem`, `campanha`, `natureza`, `contexto`, `trlAtual`, `pendencias[]` (estados de tarefa calculados). Sem `dispendioEstimado`. |
| `Qualificacao` | `aderenciaTese`, `relevancia`, `grauInovacao`, `viabilidade` (texto), `trlAvaliado`, `conclusao`, autoria e data. |
| `ConsultaEspecialista` | `pergunta`, `areaTecnica`, `especialista` (opcional), `fundamentacao`, `conclusao`, `evidencias`. |
| `AvaliacaoTrl` | `trlAnterior`, `trlNovo`, `justificativa`, `evidencias`, `radarId`. |
| `SolicitacaoTransicao` | `transicaoId`, `origem`, `destino`, `justificativa`, `evidencias`, `status` (PENDENTE/APROVADA/REJEITADA), `decisor`, `justificativaDecisao`. |
| `Entrega` | `titulo`, `descricao`, `ehMvp`, `evidencias`, `validacao` {resultado, observações, autor, data}. |
| `Evidencia` | `nomeArquivo`, `tipoArquivo`, `tamanhoBytes`, `enviadaPor`, `dataUpload`, `estadoEnvio`, `vinculo` {TRL, PARECER, SOLICITACAO, ENTREGA, GERAL}. |
| `Interacao` | Conversa do projeto. |
| `HistoricoTransicao` | Movimentações de etapa e mudanças de TRL, com `solicitacaoId` quando vierem de uma decisão. |

Removidas na revisão 3: `PautaGovernanca`, `Decisao` (pivotar/descontinuar direto) e a flag `alcadaGovernanca`. Descontinuar passa a ser uma transição para a etapa Descontinuado.

---

## 4. Telas

| Tela | Rota | Destaques |
|---|---|---|
| Landing | `/` | Textos atualizados. Sem cadastro aberto. |
| Login | `/login` | Login simulado com atalhos: Demandante, Analista e dois Especialistas. |
| Minha fila | `/app/fila` | Tarefas do perfil, com ação direta (qualificar, emitir parecer, aprovar/rejeitar, validar). |
| Portfólio | `/app/portfolio` | Lista ⇄ Kanban. Colunas vêm da configuração. Filtros de etapa, origem, ação de mobilização, arena e pendência, com contagem. |
| Dashboard | `/app` | Filtros por período, etapa e origem; pendências por estado de tarefa; links para os projetos. |
| Nova demanda | `/app/demandas/nova` | Origem, ação de mobilização condicional, natureza, contexto, sugestão da IA (simulada) e revisão. Para outros perfis, explica que está “a definir”. |
| Ações de mobilização | `/app/mobilizacao` | Campanhas vigentes. Cadastro de nova ação desabilitado (“a definir”). |
| Detalhe do projeto | `/app/projetos/:id` | Barra “Suas ações” por perfil com motivos. Abas: Visão geral, Participação, Qualificação e pareceres, Maturidade (TRL), Kanban, Entregas, Evidências, Histórico. |
| Configurar Kanban | `/app/kanban/configuracao` | Modo consulta e “Simular edição” (permissão a definir). |
| Meu perfil | `/app/perfil` | Matriz completa de papéis × ações. |

Rotas antigas (`/app/triagem`, `/app/pareceres`, `/app/governanca`, `/app/minhas-demandas`, `/app/campanhas`, `/cadastro`) redirecionam para as novas.

---

## 5. Rotas de API propostas

Estas rotas ainda **não existem**; estão em `src/services/index.ts` e serão confirmadas com o back-end.

| Operação | Rota proposta |
|---|---|
| Configuração do Kanban | `GET /api/kanban/configuracao` · `POST/PUT /api/kanban/etapas` · `POST /api/kanban/etapas/{id}/ordem` · `POST /api/kanban/etapas/{id}/ativacao` · `DELETE /api/kanban/etapas/{id}` · `POST /api/kanban/transicoes` · `PATCH /api/kanban/transicoes/{id}` |
| Projetos | `GET/POST /api/projetos` · `GET /api/projetos/{id}` · `POST /api/projetos/{id}/interacoes` |
| Qualificação | `POST /api/projetos/{id}/qualificacoes` |
| Consulta e parecer | `POST /api/projetos/{id}/consultas` · `POST /api/consultas/{id}/parecer` (multipart) |
| Avaliação de TRL | `POST /api/projetos/{id}/avaliacoes-trl` (multipart) |
| Movimentação | `POST /api/projetos/{id}/movimentacoes` (multipart). Retorna `MOVIDO` ou `SOLICITADO`. |
| Decisão de governança | `POST /api/solicitacoes-transicao/{id}/decisao` |
| Entregas | `POST /api/projetos/{id}/entregas` (multipart) · `POST /api/entregas/{id}/validacao` |
| Minha fila e dashboard | `GET /api/minha-fila` · `GET /api/dashboard/metricas?periodoDias=&etapaId=&origem=` |
| Ações de mobilização | `GET /api/acoes-mobilizacao` |

Erros esperados:
- `403`: sem permissão; a mensagem explica o motivo.
- `409`: dados desatualizados; a interface oferece recarregar.
- `422`: validação, tipo ou tamanho de arquivo.
- `502`: falha de upload; nada é registrado.

---

## 6. Decisões a validar com o cliente (guia, seção 7)

1. **Registro de demanda:** o Analista e o Especialista também podem registrar? Hoje aparece desabilitado, como “Em discussão”.
2. **Configuração do Kanban:** quem configura etapas e transições: Analista, Especialista ou ambos? Hoje a tela abre em modo consulta, com simulação de edição.
3. **Avaliação de TRL:** o Analista registra sozinho, ou a avaliação precisa de parecer ou revisão de um Especialista? E o Especialista pode avaliar?
4. **Anexos obrigatórios por tipo de registro.** No protótipo: avaliação de TRL e solicitação governada exigem ao menos um arquivo; parecer, entrega e movimentação sem governança são opcionais.
5. **Indicadores do dashboard e acesso a dados financeiros.** O dispêndio não é exibido.
6. **Rascunho, devolução para complementação ou rejeição na triagem:** existem? Não foram implementados para não assumir a decisão.
7. **Limites de arquivo, formatos e textos de consentimento.** No protótipo: 10 MB e PDF, Office, imagens, JSON, CSV, TXT e ZIP. Ainda não há texto de consentimento.

---

## 7. Como testar

```bash
npm run dev
```

Use os atalhos da tela de login. Em **Meu perfil**, a opção **Restaurar dados** volta ao estado inicial. Para simular falha de upload, anexe um arquivo com `#falha` no nome.

Roteiro verificado em 23/10/2026, com o resultado obtido em cada passo:

| # | Passo | Resultado |
|---|---|---|
| 1 | Demandante registra demanda induzida | Etapa **Ideação**, pendência **Aguardando triagem** |
| 2 | Especialista tenta qualificar | Bloqueado: “cabe ao Analista” |
| 3 | Analista qualifica | Qualificação registrada; o Analista passa a conduzir |
| 4 | Analista consulta “Dados e IA” sem escolher pessoa; Especialista da área responde com anexo | Parecer registrado |
| 5 | Avaliação de TRL sem evidência | Bloqueada |
| 6 | Avaliação de TRL com arquivo `#falha` | Falha de upload; nada registrado |
| 7 | Avaliação de TRL válida | TRL 2 → 3 |
| 8 | Redução de TRL com justificativa curta | Bloqueada |
| 9 | Analista solicita Ideação → POC (governada) | Projeto **continua em Ideação**, pendência **Aguardando governança** |
| 10 | Segunda solicitação com uma pendente | Bloqueada |
| 11 | Analista tenta decidir | Bloqueado |
| 12 | Especialista rejeita | Projeto mantido em Ideação |
| 13 | Nova solicitação; Especialista aprova | Projeto em **POC** |
| 14 | Decidir a mesma solicitação de novo | Conflito 409 com opção de recarregar |
| 15 | Analista publica MVP; Demandante valida com ressalvas | Etapa e TRL **não mudam** |
| 16 | Outro demandante tenta comentar | Bloqueado |
| 17 | Payload do projeto | Sem `dispendioEstimado` |
| 18 | Configuração: inativar ou remover etapa em uso | Bloqueado |
| 19 | Configuração: criar e remover etapa sem uso | Funciona |
| 20 | Configuração: tornar POC → MVP sem governança | O Analista move direto |
| 21 | Analista de outro projeto tenta mover | Bloqueado: “conduzida por…” |
