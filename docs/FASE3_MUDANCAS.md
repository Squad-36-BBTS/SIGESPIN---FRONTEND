# Fase 3 — registro de mudanças

O site foi atualizado para o [guia de regras de negócio da Fase 3](GUIA_REGRAS_FASE3.md). Este documento lista o que mudou, separado pela parte de cada integrante. A visão geral do site está em [todo.md](../todo.md).

## Resumo

- **Matriz de permissões do guia**, sem ações “a definir”, conferida pela tela e pelo banco simulado.
- **Acesso simulado** com 2 Demandantes, 1 Analista e 2 Especialistas; trocar de usuário mantém os registros.
- **Evidências selecionadas** do próprio projeto (TRL, pedido de avanço, parecer, correção), sempre do mesmo projeto e sem repetição.
- **Kanban com percursos livres e governados**: movimentação direta, pedido de avanço, decisão, cancelamento e notificação global.
- **Configuração do quadro** com código, ordem, tipo terminal e versão, e **propostas** do Analista decididas pelo Especialista.
- **Entregas com várias validações**, **correções** e **recomendações**.
- **Gestão do projeto**: edição com versão (o rascunho é preservado em conflito), arquivamento, reativação, histórico de gestão e projeto legado sem Demandante.

## Participação de cada integrante

| Zip · integrante | Itens novos ou refeitos | Quais |
|---|---|---|
| 1 · Kaua | 7 | Login com 5 usuários, Nova demanda, Converter recomendação, Validar entrega, Registrar correção, Recomendações, Recomendar e recusar |
| 2 · Lucas | 8 | Qualificação, Consulta, Registrar TRL, Movimentar (direto ou pedido), Submeter entrega, Propostas de configuração, Propor alteração, Decidir ou cancelar proposta |
| 3 · Abraão | 6 | Decidir avanço, Cancelar pedido, Configuração do quadro, Matriz de permissões, Portfólio com arquivamento, Minha fila |
| 4 · Angelo | 7 | Emitir parecer, Editar projeto, Arquivar e reativar, Histórico de gestão, Notificações, Dashboard, Detalhe do projeto (10 abas) |

## Base comum (igual em todos os zips)

| Arquivo | O que mudou |
|---|---|
| `src/types/domain.ts` | Modelo da Fase 3: consulta dirigida, parecer próprio, pedidos com status CANCELADA e dados de encerramento, entrega com várias validações, correção, histórico de gestão, recomendação, notificação, proposta de configuração, versão e arquivamento do projeto. DTOs com os nomes de campo do guia. |
| `src/utils/permissoes.ts` | Matriz de permissões do guia, com a condição de cada perfil (percurso livre, pedido próprio, responsável, destinatário) e a coluna “Condição adicional”. Projeto arquivado bloqueia as ações que exigem projeto ativo. Não existe mais “a definir”. |
| `src/utils/constants.ts` | Rótulos e cores dos novos status (pedidos, propostas, recomendações, gestão, tipo terminal) e os sete campos da qualificação. |
| `src/utils/formatters.ts` | Valores em reais com centavos (dispêndio estimado). |
| `src/utils/notificacoes.ts` | Novo: conta notificações não lidas por usuário. |
| `src/services/index.ts` | Serviços novos e revistos: usuários por perfil, quadro com versão, propostas, movimentação direta e pedido de avanço, cancelamento, parecer, correção, recomendações, notificações, edição e arquivamento do projeto. |
| `src/services/mock/mockServer.ts` | Banco simulado com todas as regras do guia, conferidas de novo em cada operação. Chave nova no navegador: @SIGES_PIN:mockdb:v5. |
| `src/services/mock/seed.ts` | Dados da seção 4 do guia: 2 Demandantes, 1 Analista, 2 Especialistas, evidências por projeto, projeto arquivado, projeto legado sem Demandante, recomendação e pedidos pendentes, percurso livre POC → Ideação e proposta de coluna pendente. |
| `src/components/projeto/evidencias.tsx` | Novo: seleção de evidências do projeto (várias ou uma) e lista compacta. |
| `src/components/projeto/formulario.tsx` | Opção aoConflitar: em conflito de versão, o formulário continua aberto com o rascunho. |
| `src/components/common/ui.tsx` | Botão de ação sem o selo “Em discussão”. |
| `src/components/layout/AppLayout.tsx` | Contador de notificações no menu e fila contando recomendações e propostas. |
| `src/fluxos/tipos.ts` | Contador “notificacoes” e ids das ações usadas nas abas do detalhe. |
| `src/pages/public/EntrarSimuladoPage.tsx` | Entrada simplificada com os 5 usuários do guia. |
| `todo.md` | Visão geral reescrita para a Fase 3. |
| `docs/GUIA_REGRAS_FASE3.md` | Novo: o guia de regras de negócio do protótipo. |
| `docs/FASE3_MUDANCAS.md` | Novo: este registro de mudanças, com a parte de cada integrante. |

## Parte de cada integrante

### Zip 1 · Kaua · Demandante, acesso e recomendações

Branch `fluxo-demandante-acesso` · login de teste: Mariana Costa (Demandante) · pastas: `src/fluxos/acesso/`, `src/fluxos/demandante/`, `src/fluxos/recomendacoes/`.

| Arquivo | O que mudou |
|---|---|
| `src/fluxos/acesso/LoginPage.tsx` | Login simulado com os 5 usuários do guia (dois Demandantes, um Analista, dois Especialistas). |
| `src/fluxos/demandante/NovaDemandaPage.tsx` | Reescrita: título (até 255), descrição da dor, área, origem, ação de mobilização só na induzida (a espontânea limpa o campo), TRL inicial declarado e hipótese opcional. Começa em Ideação com arena “A definir”. Também converte uma recomendação em demanda espontânea. |
| `src/fluxos/demandante/ValidacaoModal.tsx` | Cada manifestação é um novo registro; mostra a última validação e preserva as anteriores. |
| `src/fluxos/demandante/CorrecaoModal.tsx` | Novo: correção com descrição, referência opcional (até 500) e uma evidência opcional do projeto. |
| `src/fluxos/demandante/projeto.tsx` | Botões Validar entrega, Registrar correção e Adicionar contexto, só para o Demandante responsável. |
| `src/fluxos/demandante/fila.tsx` | Seção nova “Recomendações para você” e selo de arquivado nas demandas. |
| `src/fluxos/recomendacoes/` | Novo: página de recomendações (filtro de status e visibilidade por perfil), recomendar (Analista e Especialista), converter e recusar com justificativa (destinatário). |

**Como testar**

1. Mariana cadastra uma demanda espontânea e outra induzida: as duas começam em Ideação, com arena “A definir” e o TRL declarado no detalhe.
2. Mariana valida a entrega de “Plataforma IoT de eficiência energética” e depois registra uma nova validação: as duas aparecem na aba Entregas e validações.
3. Bruno abre o mesmo projeto: vê tudo, mas o botão de validar fica bloqueado com o motivo.
4. Mariana registra uma correção com referência e evidência do projeto.
5. Bruno converte “Digitalizar o protocolo de malotes” em demanda espontânea; numa segunda recomendação, a recusa exige justificativa.

### Zip 2 · Lucas · Analista e propostas de configuração

Branch `fluxo-analista` · login de teste: Rafael Lima (Analista) · pastas: `src/fluxos/analista/`, `src/fluxos/propostas/`.

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

**Como testar**

1. Rafael consulta João Prado em um projeto ainda sem qualificação.
2. Rafael avalia “Detecção de anomalias em rede corporativa” de TRL 5 para 3, selecionando a evidência do projeto: o histórico mostra os dois níveis.
3. Rafael pede o avanço de “Assistente de atendimento com IA generativa” (POC → MVP): o cartão fica em POC e o botão de movimentar fica bloqueado com o motivo.
4. Rafael move um projeto em POC de volta para Ideação pelo percurso livre.
5. Rafael propõe uma coluna nova; entrando como Fernanda, a proposta é aprovada e a coluna aparece no Kanban.

### Zip 3 · Abraão · Governança, quadro, Portfólio e Minha fila

Branch `especialista-seguranca` · login de teste: Fernanda Rocha (Especialista · Segurança da informação) · pastas: `src/fluxos/governanca/`. Telas compartilhadas sob sua responsabilidade: `src/pages/app/PortfolioPage.tsx`, `src/pages/app/MinhaFilaPage.tsx`.

| Arquivo | O que mudou |
|---|---|
| `src/fluxos/governanca/DecisaoModal.tsx` | Decisão APROVAR ou REJEITAR com justificativa; aprovar revalida o percurso, move o cartão e gera notificação. |
| `src/fluxos/governanca/CancelamentoModal.tsx` | Novo: cancelar pedido de avanço com justificativa (Analista no próprio pedido, Especialista em qualquer um); o cartão fica onde está. |
| `src/fluxos/governanca/projeto.tsx` | Botões Decidir avanço e Cancelar pedido. |
| `src/fluxos/governanca/fila.tsx` | Pedidos aguardando decisão e propostas de configuração pendentes. |
| `src/fluxos/governanca/KanbanConfigPage.tsx` | Reescrita: o Especialista cria colunas (código, nome, ordem, tipo terminal) e percursos, e edita nome, ordem, ativa e governança com a versão vigente. Bloqueia desativar a coluna inicial, coluna ocupada ou referenciada e percurso com pedido pendente. Os demais perfis consultam. |
| `src/fluxos/governanca/PerfilPage.tsx` | Matriz de permissões da Fase 3 com a condição adicional de cada ação. |
| `src/pages/app/PortfolioPage.tsx` | Compartilhada: filtro de arquivamento (ativos, arquivados, todos), colunas de arena e responsáveis e selo de arquivado. |
| `src/pages/app/MinhaFilaPage.tsx` | Compartilhada: sem mudança de código; recebe as seções novas de cada fluxo. |

**Como testar**

1. Fernanda aprova o pedido de “Visão computacional no autoatendimento” (POC → MVP): o cartão muda e a notificação aparece para todos.
2. Fernanda rejeita o pedido de “Tokenização de garantias do agronegócio”: a etapa é mantida.
3. Na Configuração do quadro, desativar Ideação ou uma coluna ocupada é bloqueado com o motivo; criar uma coluna nova funciona.
4. No Portfólio, o filtro “Arquivados” mostra “Onboarding digital de fornecedores”.
5. Rafael cancela um pedido próprio; Bruno não consegue cancelar.

### Zip 4 · Angelo · Parecer, gestão do projeto, notificações e Detalhe

Branch `especialista-dados-e-ia` · login de teste: João Prado (Especialista · Dados e IA) · pastas: `src/fluxos/parecer/`, `src/fluxos/gestao/`, `src/fluxos/visao-geral/`. Telas compartilhadas sob sua responsabilidade: `src/pages/app/ProjetoDetalhesPage.tsx`.

| Arquivo | O que mudou |
|---|---|
| `src/fluxos/parecer/ParecerModal.tsx` | Parecer independente ou em resposta à consulta dirigida a quem emite; fundamentação e conclusão obrigatórias; evidências do projeto opcionais. |
| `src/fluxos/parecer/projeto.tsx` | Botão Emitir parecer (ou Responder consulta, quando há consulta para você). |
| `src/fluxos/parecer/fila.tsx` | Consultas dirigidas a você. |
| `src/fluxos/gestao/` | Novo: editar projeto (dados, arena, Lei do Bem, dispêndio, Demandante e Analista responsáveis) com versão e justificativa, preservando o rascunho em conflito; arquivar e reativar com versão e justificativa. |
| `src/fluxos/visao-geral/NotificacoesPage.tsx` | Novo: notificações globais das movimentações feitas por Especialistas, com contador de não lidas no menu. |
| `src/fluxos/visao-geral/rotas.tsx` | Item Notificações no menu. |
| `src/fluxos/visao-geral/DashboardPage.tsx` | Indicadores do portfólio ativo e contagem de arquivados. |
| `src/fluxos/visao-geral/AcoesMobilizacaoPage.tsx` | Sem o botão “Nova ação”, que não está na matriz. |
| `src/pages/app/ProjetoDetalhesPage.tsx` | Compartilhada: 10 abas do guia (qualificação, consultas e pareceres, TRL, movimentações e governança, entregas e validações, correções, histórico de gestão…), avisos de arquivado, legado e pedido pendente. |

**Como testar**

1. João responde à consulta de “Automatizar conferência de documentos”; Fernanda não consegue responder a ela, mas emite um parecer independente.
2. Fernanda edita “Gestão inteligente de numerário” (projeto legado) e atribui Bruno como Demandante: o histórico de gestão mostra os valores anteriores e atuais.
3. Fernanda arquiva um projeto sem pedido pendente: o aviso aparece e as ações ficam bloqueadas; depois reativa.
4. Em “Visão computacional no autoatendimento”, arquivar fica bloqueado porque há pedido pendente.
5. Depois de uma aprovação, Notificações mostra a mensagem com o projeto, e o contador do menu some ao abrir a lista.
