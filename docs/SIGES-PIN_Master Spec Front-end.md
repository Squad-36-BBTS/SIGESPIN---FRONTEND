# **SIGES-PIN: Master Spec Front-end (Versão Consolidada)**

**Contexto de Engenharia para Assistentes de Código (IDE / AI Coding Assistant)**

Este documento consolida todas as regras de interface, padrões arquiteturais, contratos de tipos TypeScript, telas e fluxos definidos para o desenvolvimento do **Front-end** do sistema SIGES-PIN (Sistema Corporativo de Gestão do Portfólio de Inovação da BBTS).

Utilize este documento como base primária (fonte da verdade) para gerar componentes, hooks, páginas, layouts, formulários e integrações em React + Vite + TypeScript + Tailwind CSS.

## **1. Visão Geral e Stack Tecnológica**

* **Domínio:** Interface corporativa de gestão de inovação (normativo PRO663-009). Abrange Intake assistido por IA, Quadro Kanban de Stage-Gates, Régua TRL (1 a 9), Radar de Maturidade 4D e Dashboard Executivo.
* **Core:** React 18+ com Vite e TypeScript 5+ (modo estrito).
* **Estilização:** Tailwind CSS 3.4+ com padrão visual corporativo extraído do protótipo homologado.
* **Roteamento:** `react-router-dom` v6+.
* **Cliente HTTP:** `axios` com interceptors centralizados (JWT e tratamento de erros).
* **Gráficos & Métricas:** `chart.js` e `react-chartjs-2` (Radar 4D e barras executivas).
* **Drag and Drop:** `@dnd-kit/core` e `@dnd-kit/sortable` (Quadro Kanban).
* **Ícones & Notificações:** `lucide-react` e `sonner` (toasts).

## **2. Estrutura de Pastas e Componentização**

A aplicação adota separação estrita de responsabilidades:

```
src/
├── assets/          # Logotipos, ícones e arquivos estáticos
├── components/      # Componentes reutilizáveis (Button, Modal, Badge, Card, Stepper, Dropzone)
│   ├── layout/      # Sidebar, Header, Breadcrumbs
│   ├── kanban/      # KanbanBoard, KanbanColumn, KanbanCard
│   ├── trl/         # TrlStepper, TrlChecklist
│   └── radar/       # RadarChart (4 eixos: Negócio, Produto, Time, Receita)
├── contexts/        # Gerenciamento de estado global (AuthContext)
├── hooks/           # Custom hooks (useAuth, useProjetos, useIntakeIa, useDebounce)
├── pages/           # Telas roteadas (Login, Dashboard, PortfolioKanban, PortfolioLista, ProjetoDetalhes, Intake)
├── services/        # Cliente HTTP (api.ts, authService, projetoService, iaService, metricasService)
├── types/           # Interfaces e enums TypeScript (espelhados no back-end)
└── utils/           # Formatadores de moeda (BRL), data UTC e validações
```

## **3. Contratos de Tipos e Modelos TypeScript**

Os modelos sincronizam perfeitamente com os DTOs e entidades do Spring Boot.

### **3.1. Enumeradores Oficiais**

* **PerfilUsuario:** `DEMANDANTE`, `ANALISTA`, `COMITE`, `EXECUTIVO`
* **ArenaTipo:** `EFICIENCIA_OPERACIONAL`, `NEGOCIOS_DIGITAIS`, `SEGURANCA_INTEGRADA`, `A_DEFINIR`
* **StatusFunil:** `IDEACAO`, `POC`, `MVP`, `CONCLUIDO`, `DESCONTINUADO`
* **DecisaoTipo:** `APROVADO`, `PIVOTADO`, `REPROVADO`
* **TipoLeituraRadar:** `INICIAL`, `ATUAL`

### **3.2. Interfaces Principais**

```typescript
export interface Usuario { id: number; nome: string; email: string; perfil: PerfilUsuario; ativo: boolean; }

export interface ScoresRadar { negocio: number; produto: number; time: number; receita: number; } // 0.00 a 4.00

export interface Projeto {
  id: number;
  titulo: string;
  descricaoDor: string;
  areaDemandanteId: number;
  responsavelPoId: number;
  responsavelPo?: Usuario;
  arena: ArenaTipo;
  statusFunil: StatusFunil;
  trlAtual: number; // 1 a 9
  hipoteseSolucao: string;
  potencialLeiDoBem: boolean;
  dispendioEstimado: number | null; // null se perfil for DEMANDANTE ou ANALISTA
  criadoEm: string;
  atualizadoEm: string;
  deliberacoes?: DeliberacaoHistorico[];
  avaliacoesRadar?: AvaliacaoRadar[];
}

export interface DeliberacaoHistorico { id: number; projetoId: number; responsavelId: number; decisao: DecisaoTipo; justificativa: string; dataDecisao: string; }
export interface AvaliacaoRadar { id: number; projetoId: number; tipoLeitura: TipoLeituraRadar; scoreNegocio: number; scoreProduto: number; scoreTime: number; scoreReceita: number; dataAvaliacao: string; }
export interface HistoricoTransicao { id: number; projetoId: number; usuarioId: number; tipoMudanca: 'STATUS_FUNIL' | 'TRL'; valorAnterior: string; valorNovo: string; dataMudanca: string; }
export interface Evidencia { id: number; projetoId: number; nomeArquivo: string; caminhoStorage: string; tipoArquivo: string; dataUpload: string; }
```

## **4. Módulos e Telas Principais (Fluxos de Usuário)**

1. **Autenticação (`/login`):** Login com e-mail institucional e senha. Bloqueio automático de formulário caso receba HTTP 429 (5 tentativas falhas).
2. **Dashboard Executivo (`/dashboard`):** 4 Cards de KPI (Total Iniciativas, TRL Médio, ROI Estimado, Investimento Acumulado). Gráfico de distribuição por Arena e lista de decisões pendentes.
3. **Intake Inteligente (`/intake` ou `/projetos/novo`):**
   * *Guardrail:* Bloqueia submissão se a descrição tiver menos de 15 caracteres.
   * *Ação IA:* Botão "Estruturar com IA" (`POST /api/ia/analisar-demanda`) com feedback visual (spinner).
   * *Human-in-the-Loop:* Exibe sugestões da IA (Arena, Hipótese, TRL, Potencial Lei do Bem e Radar 4D) como campos totalmente editáveis antes de salvar.
   * *Graceful Degradation:* Em caso de timeout/HTTP 503 (`IA_INDISPONIVEL`), emite Toast suave e libera preenchimento manual imediato.
4. **Portfólio Funil Kanban (`/projetos`):** Colunas estáticas (`IDEACAO`, `POC`, `MVP`, `CONCLUIDO`). Drag-and-drop restrito a perfis autorizados (`COMITE`) e a etapas adjacentes. Bloqueio de salto direto para concluído sem deliberação.
5. **Portfólio Lista Tabular:** Alternância rápida com busca reativa (debounce 300ms) e filtros por Arena, Status e TRL.
6. **Detalhes do Projeto (`/projetos/:id`):** Abas de Visão Geral, Régua TRL, Radar 4D, Governança/Deliberações, Evidências (upload S3 até 10MB) e Histórico de Transições.
7. **Régua TRL (1 a 9):** Stepper visual horizontal com checklist de critérios de entrada/saída. **Regra de ouro: O TRL nunca pode regredir**.
8. **Governança & Deliberação:** Modal exclusivo para o Comitê com opções `APROVADO`, `PIVOTADO` e `REPROVADO`. Se pivotado, exige obrigatoriamente preenchimento da nova hipótese.

## **5. Regras de Interface, RBAC e Tratamento de Exceções**

* **Matriz de Perfis (RBAC):**
  * `DEMANDANTE` & `ANALISTA`: Criam demandas no Intake, visualizam portfólio. Analistas atualizam TRL.
  * `COMITE`: Opera transições no Kanban, atualiza TRL e executa deliberações de Stage-Gate.
  * `EXECUTIVO`: Visualização analítica completa e dashboards.
* **Regra de Visibilidade Financeira:** O campo `dispendioEstimado` e os totais acumulados de investimento devem vir como `null` do back-end para `DEMANDANTE` e `ANALISTA`, e o front-end **nunca** deve renderizar esses componentes para esses dois perfis.
* **Tratamento de Erros da API:** O Axios intercepta o formato padronizado `{ status, codigo, mensagem, detalhes, timestamp }`:
  * `VALIDACAO_FALHOU` (422): Destaca campos inválidos diretamente no formulário.
  * `TRL_NAO_PODE_REGREDIR` (422): Emite alerta modal e restaura visualmente o nível anterior.
  * `TRANSICAO_INVALIDA` (422): Cancela o drag-and-drop e emite aviso de restrição de governança.
  * `IA_INDISPONIVEL` (503): Dispara transição fluida para formulário manual sem bloqueio.
  * `CREDENCIAIS_INVALIDAS` (401): Notifica erro de acesso e redireciona para login.
