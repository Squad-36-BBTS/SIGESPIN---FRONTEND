// Seções da "Minha fila" de cada fluxo instalado (importado só pela página Minha fila)
import type { FilaFluxo } from './tipos';

export const FILAS = Object.values(import.meta.glob<FilaFluxo[]>('./*/fila.tsx', { eager: true, import: 'default' }))
  .flat()
  .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
