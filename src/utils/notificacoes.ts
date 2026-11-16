// Notificações não lidas: cada usuário guarda no navegador quando abriu a lista pela última vez
import type { Notificacao } from '@/types/domain';

const chave = (usuarioId: number) => `@SIGES_PIN:notificacoes-vistas:${usuarioId}`;

export function marcarNotificacoesVistas(usuarioId: number) {
  try {
    localStorage.setItem(chave(usuarioId), new Date().toISOString());
  } catch {
    // ignora
  }
}

export function contarNaoLidas(lista: Notificacao[], usuarioId: number): number {
  let vistas = '';
  try {
    vistas = localStorage.getItem(chave(usuarioId)) ?? '';
  } catch {
    // ignora
  }
  return lista.filter((n) => n.criadaEm > vistas).length;
}
