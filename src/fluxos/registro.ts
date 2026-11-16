// Rotas e menu dos fluxos instalados. As páginas autenticadas são carregadas sob demanda
// (lazy) dentro de cada rotas.tsx, então a landing continua leve.
import type { RotasFluxo } from './tipos';

const fluxos = Object.values(import.meta.glob<RotasFluxo>('./*/rotas.tsx', { eager: true, import: 'default' }));

export const ROTAS_PUBLICAS = fluxos.flatMap((f) => f.publicas ?? []);
export const ROTAS_APP = fluxos.flatMap((f) => f.app ?? []);
export const MENU_FLUXOS = fluxos.flatMap((f) => f.menu ?? []);

// Rotas da base, que existem em qualquer combinação de fluxos
const DA_BASE = ['/app/fila', '/app/portfolio'];

const caminhos = new Set([...DA_BASE, ...ROTAS_PUBLICAS.map((r) => r.caminho), ...ROTAS_APP.map((r) => (r.caminho ? `/app/${r.caminho}` : '/app'))]);

// Evita links para telas de um fluxo que não está nesta versão
export const temRota = (to: string) => caminhos.has(to.split('?')[0]);
