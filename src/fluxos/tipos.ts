// Contrato entre a base do app e os fluxos da documentação.
// Cada pasta em src/fluxos/<fluxo>/ é encontrada automaticamente pelos arquivos abaixo:
//   rotas.tsx   → páginas e itens do menu lateral
//   fila.tsx    → seções da "Minha fila" de um perfil
//   projeto.tsx → ações da barra "Suas ações" do detalhe do projeto e os formulários delas
// Sem a pasta de um fluxo, o app continua funcionando; só as telas daquele fluxo não aparecem.
import type { LucideIcon } from 'lucide-react';
import type { ComponentType, LazyExoticComponent, ReactNode } from 'react';

import type { MinhaFila, PerfilUsuario, ProjetoDetalhe, SolicitacaoTransicao, Usuario } from '@/types/domain';
import type { Permissao } from '@/utils/permissoes';

// ---------- rotas.tsx ----------

export interface RotaFluxo {
  // Pública: caminho absoluto ('/', '/login'). Autenticada: relativo a /app ('' = página inicial)
  caminho: string;
  Pagina: ComponentType | LazyExoticComponent<ComponentType>;
}

export interface ItemMenu {
  to: string;
  label: string;
  icon: LucideIcon;
  // Posição no menu: 10 Minha fila · 20 Portfólio · 30 Dashboard · 40 Nova demanda · 45 Recomendações ·
  // 50 Ações de mobilização · 55 Notificações · 60 Configurar Kanban · 65 Propostas de configuração · 90 Meu perfil
  ordem: number;
  end?: boolean;
  contador?: 'fila' | 'notificacoes';
  // Também aparece como botão na barra superior
  destaque?: boolean;
  mostrar?: (u: Usuario) => boolean;
}

export interface RotasFluxo {
  publicas?: RotaFluxo[];
  app?: RotaFluxo[];
  menu?: ItemMenu[];
}

// ---------- fila.tsx ----------

export interface FilaFluxo {
  perfil: PerfilUsuario;
  // Posição entre as seções do mesmo perfil (menor primeiro)
  ordem?: number;
  descricao: string;
  Acoes?: ComponentType;
  Secoes: ComponentType<{ fila: MinhaFila; usuario: Usuario; recarregar: () => void }>;
}

// ---------- projeto.tsx ----------

export interface CtxProjeto {
  p: ProjetoDetalhe;
  usuario: Usuario;
  pendente: SolicitacaoTransicao | null;
  irAba: (aba: string) => void;
}

export interface BotaoProjeto {
  perm: Permissao;
  rotulo: string;
  icon: ReactNode;
  primaria?: boolean;
  // Dado entregue ao formulário (consulta, entrega, solicitação…)
  alvo?: unknown;
  // Ação sem formulário (ex.: ir para outra aba)
  aoClicar?: () => void;
}

export interface ModalProjetoProps {
  projeto: ProjetoDetalhe;
  aberto: boolean;
  alvo: unknown;
  onFechar: () => void;
  onFeito: () => void;
}

export interface AcaoProjeto {
  // Ids usados pelas abas do detalhe: 'emitirParecer', 'decidirAvanco', 'cancelarAvanco', 'validarEntrega'
  id: string;
  ordem: number;
  // null = a ação não aparece para este usuário
  botao?: (c: CtxProjeto) => BotaoProjeto | null;
  Modal?: ComponentType<ModalProjetoProps>;
}
