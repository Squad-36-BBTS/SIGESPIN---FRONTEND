# SIGES-PIN — Relatório de mudanças (revisão 2)

**Data:** 16/10/2026 · **Origem:** retorno da área de inovação sobre a proposta de front-end de 14/10/2026
**Situação:** implementado no front-end com dados de demonstração (`VITE_USE_MOCK=true`). O back-end precisa adequar o domínio (seção 7).

> Este relatório substitui as regras de fluxo da [proposta anterior](./PROPOSTA_FRONTEND.md) e do Guia de Entidades e Fluxos v1.0.
> Em resumo, o sistema deixa de funcionar como “pedido e aprovação de cada avanço” e passa a **gerir a jornada da
> inovação**: entrada, triagem, governança quando necessária, experimentação e validação pelo dono do problema.

---

## 1. Resumo das decisões

| # | Retorno recebido | O que mudou no sistema |
|---|---|---|
| 1 | Prever duas origens de demanda | A demanda passa a ser **espontânea** (backlog de ideias, problemas e oportunidades) ou **induzida** por campanha, desafio, hackathon ou residência. Foi criada a entidade **Campanha**, com uma tela própria. |
| 2 | O demandante é o dono do problema e participa da jornada | O demandante **complementa** a demanda quando a triagem devolve e **valida as entregas e o MVP**. Um projeto só é concluído com uma entrega do MVP validada por ele. |
| 3 | O analista faz a triagem generalista e consulta especialistas | Foi criada a **qualificação**: aderência à Tese, relevância, grau de inovação e viabilidade (notas de 1 a 5), TRL avaliado, parecer e encaminhamento. O analista também pode abrir **consultas a especialistas**, que respondem com um parecer técnico. |
| 4 | Retirar a lógica de “solicitar aumento de TRL” | O **TRL passa a ser um indicador**, atualizado pelo Analista com justificativa e evidências obrigatórias. Não há pedido nem aprovação. A entidade *Solicitação de Avanço* foi removida. |
| 4b | O Kanban deve refletir os marcos reais | As colunas agora são **Backlog → Qualificação → Governança → Experimentação (PoC) → MVP/Piloto → Concluído**, e os estados finais são **Arquivado** e **Descontinuado**. |
| 5 | Nem todo avanço passa por um comitê | A governança é acionada **quando necessário**: na qualificação (priorização) ou por encaminhamento do analista (investimento, mudança de rumo). Marcos dentro da alçada da equipe são registrados pelo próprio Analista. |
| 6 | Só 3 perfis; Analista e Executivo podem ser um só | Os perfis passam a ser **Demandante, Analista de Inovação e Especialista**. O Executivo foi absorvido pelo Analista (visão de gestão). O “Comitê” deixou de ser perfil e virou uma **alçada de governança**: uma flag do usuário, ou seja, *um especialista turbinado*. |

---

## 2. Perfis e alçada

| Perfil | Papel | Principais ações |
|---|---|---|
| **Demandante** | Dono do problema | Registra demandas espontâneas ou de campanhas, complementa quando a triagem pede, acompanha a jornada e valida entregas e MVP. |
| **Analista de Inovação** | Triagem e gestão do ciclo de vida | Abre campanhas, faz a triagem e a qualificação, consulta especialistas, atualiza o TRL e o radar com evidências, registra entregas e marcos, encaminha à governança e arquiva. Vê os indicadores e o financeiro. |
| **Especialista** | Conhecimento técnico | Responde às consultas com um parecer (favorável, favorável com ressalvas ou desfavorável), podendo sugerir um TRL. |
| **+ Alçada de governança** | Flag `alcadaGovernanca` | Prioriza e decide as pautas (aprovar, pivotar, descontinuar) e pode pivotar ou descontinuar a qualquer momento. Pode ser dada a um Especialista (o antigo “Comitê”) ou a um Analista gestor (o antigo “Executivo”). |

**Financeiro (`dispendioEstimado`):** visível para o Analista e para quem tem alçada; oculto para o Demandante. O valor é informado na qualificação.

### Matriz de ações

| Ação | Demandante | Analista | Especialista | Com alçada |
|---|:-:|:-:|:-:|:-:|
| Consultar todo o portfólio, o Kanban e o dashboard | ✔ | ✔ | ✔ | ✔ |
| Registrar demanda (espontânea ou induzida) | ✔ | | | |
| Complementar demanda devolvida / validar entregas | ✔ (dono) | | | |
| Abrir e encerrar campanhas | | ✔ | | |
| Triagem, qualificação e arquivamento | | ✔ | | |
| Consultar especialista | | ✔ | | |
| Emitir parecer técnico | | | ✔ (destinatário) | |
| Atualizar TRL e radar (com evidências) | | ✔ | | |
| Registrar entrega e marco (Experimentação → MVP → Concluído) | | ✔ | | |
| Encaminhar à governança | | ✔ | | |
| Decidir pauta / pivotar / descontinuar | | | | ✔ |
| Ver dispêndio estimado | | ✔ | | ✔ |

---

## 3. Jornada (Kanban)

```text
                 ┌── Devolver ao demandante ──► BACKLOG (aguardando complemento)
                 │
BACKLOG ─► QUALIFICAÇÃO ─┬─ Encaminhar à governança ─► GOVERNANÇA ─ aprova ─► EXPERIMENTAÇÃO
 (triagem)               ├─ Iniciar experimentação (alçada da equipe) ─────────► EXPERIMENTAÇÃO
                         └─ Arquivar ─► ARQUIVADO

EXPERIMENTAÇÃO ─ marco do Analista (ou pauta aprovada) ─► MVP ─ entrega validada + marco ─► CONCLUÍDO

A qualquer momento, quem tem alçada: PIVOTAR (nova hipótese) ou DESCONTINUAR ─► DESCONTINUADO
```

| Etapa | Quem move | Regra |
|---|---|---|
| Backlog → Qualificação | Analista (“assumir triagem”) | Fica bloqueado enquanto a demanda aguarda complemento. |
| Qualificação → Governança, Experimentação, Backlog ou Arquivado | Analista, ao registrar a qualificação | O encaminhamento à governança cria uma **pauta** automaticamente. |
| Governança → Experimentação | Quem tem alçada (aprova a pauta) | Pivotar nesta etapa devolve a demanda para requalificação. |
| Experimentação → MVP | Analista (marco) ou pauta aprovada | Bloqueado enquanto houver pauta pendente. |
| MVP → Concluído | Analista (marco) | **Exige ao menos uma entrega do MVP validada pelo demandante.** |
| Qualquer etapa ativa → Descontinuado | Quem tem alçada | Estado final; encerra as pautas pendentes. |

---

## 4. Entidades — o que mudou

| Entidade | Situação | Campos principais |
|---|---|---|
| `Usuario` | Alterada | `perfil` ∈ {DEMANDANTE, ANALISTA, ESPECIALISTA}; **novos** `alcadaGovernanca: boolean` e `areaTecnica` (especialista). |
| `Projeto` | Alterada | **Novos** `origem` (ESPONTANEA/INDUZIDA), `campanha`, `natureza` (PROBLEMA/NECESSIDADE/OPORTUNIDADE) e `aguardandoComplemento`. `statusFunil` passa a ser **`etapa`** (enum `EtapaJornada`). `responsavelPo` saiu da interface. |
| `Campanha` | **Nova** | `titulo`, `tipo` (CAMPANHA/DESAFIO/HACKATHON/RESIDENCIA), `tema`, `descricao`, `inicio`, `fim`, `status` (ABERTA/ENCERRADA), `criadaPor`. |
| `Qualificacao` | **Nova** | `aderenciaTese`, `relevancia`, `grauInovacao`, `viabilidade` (1–5), `trlAvaliado`, `parecer`, `recomendacao`, `analista`. |
| `ConsultaEspecialista` | **Nova** | `solicitante`, `especialista` (opcional: a consulta pode ir para a área técnica, e quem responder assume), `areaTecnica`, `pergunta`, `status`, `parecer`, `recomendacao`, `trlSugerido`. |
| `RegistroMaturidade` | **Nova** | `trlAnterior`, `trlNovo`, `justificativa`, `evidencias` (obrigatórias), `radarId` (leitura ATUAL opcional). |
| `Entrega` | **Nova** | `etapa`, `titulo`, `descricao`, `status` (AGUARDANDO_VALIDACAO/VALIDADA/AJUSTES_SOLICITADOS), `validadaPor`, `comentarioValidacao`. |
| `PautaGovernanca` | **Nova** | `motivo`, `etapaAtual`, `etapaProposta` (opcional), `status` (PENDENTE/DECIDIDA), `encaminhadaPor`, `decisaoId`. |
| `Decisao` (antiga `DeliberacaoHistorico`) | Alterada | Mesmo enum `APROVADO/PIVOTADO/REPROVADO`; **novos** `pautaId` e `novaHipotese`. |
| `Evidencia` | Alterada | `solicitacaoAvanco` dá lugar a `vinculo` {MATURIDADE, ENTREGA, GERAL} + id; **novo** `enviadaPor`. |
| `Interacao` | **Nova** | `autor`, `perfil`, `texto`, `criadaEm`. É a conversa do projeto entre o demandante dono do problema, os analistas e os especialistas. |
| `HistoricoTransicoes` | Alterada | `tipoMudanca` ∈ {ETAPA, TRL, HIPOTESE}; **novo** `motivo`. |
| `AvaliacaoRadar` | Mantida | Leitura INICIAL no cadastro; leituras ATUAL nas atualizações de maturidade. |
| `SolicitacaoAvanco` | **Removida** | Substituída por RegistroMaturidade, marcos do Analista e PautaGovernanca. |

### Correspondência entre enums antigos e novos

| Antes (`StatusFunil`) | Depois (`EtapaJornada`) |
|---|---|
| IDEACAO | BACKLOG, QUALIFICACAO ou GOVERNANCA (conforme a situação) |
| POC | EXPERIMENTACAO |
| MVP | MVP |
| CONCLUIDO | CONCLUIDO |
| DESCONTINUADO | DESCONTINUADO (decisão de governança) ou ARQUIVADO (não seguiu na triagem) |

| Antes (`PerfilUsuario`) | Depois |
|---|---|
| DEMANDANTE | DEMANDANTE |
| ANALISTA | ANALISTA |
| EXECUTIVO | ANALISTA (com `alcadaGovernanca` quando for gestor com poder de decisão) |
| COMITE | ESPECIALISTA com `alcadaGovernanca = true` |

---

## 5. Telas

| Tela | Rota | Situação |
|---|---|---|
| Landing, Login, Solicitar acesso | `/`, `/login`, `/cadastro` | Textos e perfis atualizados (3 perfis). |
| Dashboard | `/app` | Novos indicadores: origem (espontânea × induzida), etapas da jornada, “minha fila” por perfil, pauta de governança. |
| Portfólio (lista ⇄ Kanban) | `/app/portfolio` | Kanban com os 6 marcos; filtros de origem e campanha; selos “na pauta”, “complemento” e “validação”. |
| **Campanhas** | `/app/campanhas` | **Nova.** Lista as campanhas; o Analista abre e encerra; o Demandante participa. |
| Nova demanda | `/app/demandas/nova` | Passo 1 inclui origem, campanha e natureza. A demanda entra no backlog. |
| **Minhas demandas** | `/app/minhas-demandas` | **Nova** (Demandante). Entregas para validar e demandas a complementar. |
| **Triagem** | `/app/triagem` | **Nova** (Analista). Backlog, em qualificação comigo, devolvidas e em andamento. |
| **Pareceres** | `/app/pareceres` | **Nova** (Especialista). Consultas pendentes e respondidas. |
| **Governança** | `/app/governanca` | **Nova** (alçada). Pauta de priorização e decisão. Substitui a “Fila do Comitê”. |
| Detalhes do projeto | `/app/projetos/:id` | Abas: Visão geral · Qualificação e pareceres · Maturidade · Entregas · Governança · Evidências · Histórico. As ações aparecem conforme o perfil e a etapa. |
| Meu perfil | `/app/perfil` | Mostra a nova matriz de ações e a alçada. |
| ~~Fila do Comitê~~, ~~Minhas solicitações~~ | — | **Removidas.** As rotas antigas redirecionam para Governança e Triagem. |

---

## 6. Rotas de API propostas

As rotas abaixo estão em `src/services/index.ts`. **São propostas** e precisam ser confirmadas com o back-end.

| Operação | Rota |
|---|---|
| Listar / criar / encerrar campanhas | `GET /api/campanhas`, `POST /api/campanhas`, `POST /api/campanhas/{id}/encerramento` |
| Criar demanda (com `origem`, `campanhaId`, `natureza`) | `POST /api/projetos` |
| Complementar demanda | `POST /api/projetos/{id}/complemento` |
| Assumir triagem | `POST /api/projetos/{id}/triagem` |
| Registrar qualificação | `POST /api/projetos/{id}/qualificacoes` |
| Arquivar | `POST /api/projetos/{id}/arquivamento` |
| Conversa do projeto | `POST /api/projetos/{id}/interacoes` |
| Consultar especialista ou área técnica / responder | `POST /api/projetos/{id}/consultas`, `GET /api/consultas/minhas`, `POST /api/consultas/{id}/parecer` |
| Atualizar maturidade (multipart com evidências) | `POST /api/projetos/{id}/maturidade` |
| Registrar entrega / validar | `POST /api/projetos/{id}/entregas`, `POST /api/entregas/{id}/validacao` |
| Registrar marco | `POST /api/projetos/{id}/marcos` |
| Encaminhar à governança | `POST /api/projetos/{id}/pautas` |
| Pauta e decisões | `GET /api/governanca/pautas`, `POST /api/governanca/pautas/{id}/decisao`, `GET /api/governanca/decisoes` |
| Pivotar / descontinuar sem pauta | `POST /api/projetos/{id}/deliberacao` |
| Especialistas | `GET /api/usuarios?perfil=ESPECIALISTA` |

Deixam de existir: `POST/GET /api/projetos/{id}/solicitacoes-avanco` e `POST /api/solicitacoes-avanco/{id}/decisao`.

---

## 7. Impacto no back-end

1. **Migration** (V3):
   - alterar o enum de perfil e adicionar `alcada_governanca` e `area_tecnica` em `usuario`;
   - trocar `status_funil` por `etapa`, migrando os dados conforme a tabela da seção 4;
   - adicionar `origem`, `campanha_id`, `natureza` e `aguardando_complemento` em `projeto`;
   - criar as tabelas `campanha`, `qualificacao`, `consulta_especialista`, `registro_maturidade`, `entrega` e `pauta_governanca`;
   - adaptar `evidencia` (vínculo) e `historico_transicoes` (motivo);
   - remover `solicitacao_avanco`.
2. **Regras no serviço**, as mesmas já simuladas em `src/services/mock/mockServer.ts`:
   - campanha aberta obrigatória para demanda induzida;
   - qualificação apenas em QUALIFICACAO;
   - evidência obrigatória ao atualizar a maturidade;
   - conclusão só com entrega do MVP validada;
   - bloqueio de marcos com pauta pendente;
   - decisões só com `alcadaGovernanca`;
   - conflito (409) quando a etapa mudou desde o encaminhamento da pauta.
3. **Autorização:** o financeiro volta como `null` para o Demandante.

---

## 8. Pontos a confirmar com a área de inovação

1. **Critérios da qualificação:** a escala de 1 a 5 e os quatro critérios (Tese, relevância, inovação, viabilidade) atendem? Há pesos ou nota de corte?
2. **TRL pode diminuir?** Hoje é permitido, com aviso, quando as evidências mostram menos maturidade. Antes era proibido.
3. **Alçada:** é uma única flag ou precisa de níveis (por valor de dispêndio, por diretoria)?
4. **Quem abre campanhas:** só o Analista, ou também gestores e áreas parceiras?
5. **Validação do demandante:** basta uma entrega validada no MVP para concluir, ou é necessária uma validação final específica?
6. **Pareceres:** precisam de prazo (SLA) e de notificação por e-mail?
7. **Área demandante:** continua como identificador fixo (DIOPE, DINEG…) ou vira uma entidade cadastrável?

---

## 9. Ajustes da revisão rápida (16/10/2026)

| Tipo | Ajuste |
|---|---|
| Inconsistência | As ações do ciclo (qualificar, arquivar, consultar, atualizar maturidade, registrar entrega e marco, encaminhar) ficam com o **analista responsável** pela demanda. Antes, qualquer analista podia agir em demandas de outro. O analista gestor (com alçada) pode atuar em qualquer projeto. Outros analistas veem o aviso “Conduzida por…”. |
| Inconsistência | O **menu lateral direito fica oculto por padrão** e abre pelo botão do topo, em qualquer tamanho de tela. No desktop, quem preferir pode “Fixar trilho de ícones”. |
| Inconsistência | O card “Régua TRL” da landing pulava níveis (1, 3, 5, 7, 9) e destacava alguns sem critério. Agora mostra os 9 níveis em três faixas: pesquisa, desenvolvimento e operação. |
| Lacuna | **Consulta a área técnica:** o analista escolhe a área e, opcionalmente, uma pessoa. Sem pessoa, qualquer especialista da área pode responder. |
| Lacuna | **Participação do demandante:** nova aba “Participação” no projeto, com a conversa entre o demandante (somente o dono), os analistas e os especialistas. |
| Textos | A meta description, a tela de cadastro, a régua TRL, o cadastro de demanda, as imagens (`perfilEspecialista`) e o README foram alinhados à revisão 2. |

Seguem como estão, com decisão pendente na seção 8:
- critérios e pesos da qualificação;
- possibilidade de o TRL diminuir;
- níveis de alçada;
- quem abre campanhas.

As fotos continuam vindo do Unsplash; antes da produção, devem ser baixadas para `/public` ou trocadas por fotos institucionais.

## 10. Como testar

```bash
npm run dev
```

Na tela de login há atalhos para: **Demandante**, **Analista de Inovação**, **Especialista**, **Especialista · Governança** e **Analista · Gestor**.
Em “Meu perfil”, “Restaurar dados” volta ao estado inicial.

Roteiro verificado em 16/10/2026, com o resultado esperado em cada passo:

| # | Passo | Resultado |
|---|---|---|
| 1 | Demandante cria demanda induzida pelo “Desafio Agências do Futuro” | Entra no backlog |
| 2 | Demandante tenta usar campanha encerrada | Bloqueado |
| 3 | Analista assume a triagem | Vai para Qualificação |
| 4 | Analista consulta especialista; Especialista responde com parecer | Parecer registrado |
| 5 | Especialista **sem alçada** tenta decidir | Bloqueado |
| 6 | Analista qualifica e encaminha à governança | Pauta criada |
| 7 | Especialista com alçada aprova a pauta | Vai para Experimentação |
| 8 | Analista atualiza o TRL sem evidência | Bloqueado |
| 9 | Analista atualiza o TRL com evidência | TRL 3 → 4 |
| 10 | Analista registra marco | Vai para MVP |
| 11 | Analista tenta concluir sem validação | Bloqueado |
| 12 | Analista registra entrega; Demandante valida | Entrega validada |
| 13 | Analista conclui | Concluído; histórico com 7 transições |
| 14 | Demandante abre o projeto | Não vê o dispêndio |
