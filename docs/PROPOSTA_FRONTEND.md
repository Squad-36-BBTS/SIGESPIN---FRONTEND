# SIGES-PIN — Proposta de Front-end

> ⚠️ **Substituída em parte pela [revisão 2](./RELATORIO_MUDANCAS.md) (16/10/2026):** 3 perfis com alçada de governança, duas origens de demanda, triagem/qualificação, TRL por evidências e Kanban por marcos. As seções de fluxo e perfis abaixo descrevem a versão anterior.

**Data:** 14/10/2026 · **Base:** Guia de Entidades e Fluxos v1.0, Master Spec Front-end, Fase 1 (domínio) e protótipo Stitch.

> Quando houver conflito, vale o **Guia de Entidades e Fluxos (14/10/2026)**, por ser o documento mais recente.
> Principal diferença: ninguém altera TRL ou etapa diretamente. Tudo passa por uma **Solicitação de Avanço**
> criada pelo Analista e decidida pelo Comitê. O drag-and-drop do Kanban que efetivava mudanças **foi removido**.

## 1. Mapa do site

```
Público
├── /               Landing page institucional
├── /login          Login (e-mail institucional + senha)
└── /cadastro       Solicitação de acesso (nome, e-mail, área, perfil desejado)

Área autenticada (layout com menu lateral DIREITO recolhível)
├── /app                         Dashboard (KPIs, arena, etapa, pendências)
├── /app/portfolio               Portfólio — alterna Lista ⇄ Kanban, busca + filtros
├── /app/projetos/novo           Cadastro de demanda com IA (Demandante)
├── /app/projetos/:id            Detalhes: Visão geral · TRL · Radar · Solicitações · Evidências · Governança · Histórico
├── /app/solicitacoes            Minhas solicitações (Analista)
├── /app/comite                  Fila do Comitê (Comitê)
└── /app/perfil                  Meus dados e sessão
```

## 2. Telas: o que já existia no protótipo e o que falta

| Tela | Protótipo Stitch | Situação nesta proposta |
|---|---|---|
| Landing page | Não existe | **Nova** |
| Login | Não existe | **Nova** |
| Cadastro / solicitar acesso | Não existe | **Nova** (o back-end ainda não prevê autocadastro; a tela envia um pedido de acesso) |
| Dashboard executivo | Existe | Refeita: KPIs reais do domínio e financeiro só para Comitê/Executivo |
| Intake com IA | Existe | Refeito em 3 passos: dados → sugestões da IA → revisão/confirmação |
| Detalhes & TRL | Existe | Ampliado com abas (Radar inicial × atual, Solicitações, Evidências, Histórico) |
| Funil Kanban | Existe | Refeito **sem avanço por arrastar**; o cartão abre o projeto |
| Portfólio em lista | Não existe | **Nova** (busca com debounce, filtros por arena e etapa, paginação) |
| Nova solicitação de avanço | Não existe | **Nova** (modal: tipo TRL/Etapa, valor pretendido, justificativa, evidências) |
| Fila do Comitê | Não existe | **Nova** (aprovar/rejeitar com justificativa obrigatória) |
| Minhas solicitações | Não existe | **Nova** (acompanhar e cancelar pedidos pendentes) |
| Pivotar / Descontinuar | Modal de pivotamento | Mantido e separado da rejeição; descontinuação adicionada |
| Ecossistema de startups / Relatório | Existe | **Removido**: fora do escopo do domínio atual |
| 404 | Não existe | **Nova** |

## 3. Navegação

O menu horizontal do protótipo foi substituído por um **trilho fino de ícones (64px) na lateral direita**.
Ao clicar no botão do topo, ele se expande para 260px com rótulos, por cima do conteúdo e sem empurrar a página.
No celular fica totalmente escondido e abre como gaveta. Os itens exibidos dependem do perfil.

## 4. Identidade visual (do zip Stitch)

- Azul BB `#005EEF` (hover `#0047B8`), marinho `#002875`, amarelo institucional `#FCFC30` (texto escuro sobre amarelo).
- Fundo `#F4F7FC`, cartões brancos com borda `#E2E8F0` e raio de 16px, Calibri com fallback para Carlito e Segoe UI.

## 5. Animações (leves)

Só CSS, sem bibliotecas: *fade-up* ao entrar na tela (IntersectionObserver), transição de 200 a 300ms entre páginas,
expansão do menu, *hover* com sombra suave. A preferência `prefers-reduced-motion` desativa todas.

## 6. Regras de domínio refletidas na interface

- Todos os perfis veem todo o portfólio; `dispendioEstimado` aparece somente para COMITE e EXECUTIVO.
  Quando o valor está ausente, aparece "—", nunca zero.
- A análise da IA **não salva** o projeto: existe um passo de confirmação separado.
- O envio de uma solicitação não altera o projeto; a aprovação do Comitê altera e recarrega os dados.
- Pode existir no máximo uma solicitação pendente de cada tipo por projeto. O TRL pretendido deve ser maior que o atual.
- A etapa avança apenas para a seguinte; Concluído e Descontinuado são estados finais.
- Analista e demandante ausentes aparecem como "Não atribuído" e "Não informado".

## 7. Integração

A camada `src/services` já segue as rotas previstas no guia. Enquanto o back-end não existe, `VITE_USE_MOCK=true`
usa um banco em memória (`services/mock`) com usuários de demonstração, um para cada perfil.
Para integrar, basta definir `VITE_USE_MOCK=false` e ajustar os DTOs quando o contrato for fechado.
