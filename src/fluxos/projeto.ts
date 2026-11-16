// Ações do detalhe do projeto de cada fluxo instalado (importado só pela página de detalhe)
import type { AcaoProjeto } from './tipos';

export const ACOES_PROJETO = Object.values(import.meta.glob<AcaoProjeto[]>('./*/projeto.tsx', { eager: true, import: 'default' }))
  .flat()
  .sort((a, b) => a.ordem - b.ordem);

export const temAcao = (id: string) => ACOES_PROJETO.some((a) => a.id === id && a.Modal);
