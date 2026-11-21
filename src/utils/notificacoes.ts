// Notificações não lidas: cada usuário guarda no navegador quando abriu a lista pela última vez
import type { Notificacao } from '@/types/domain';

const chave = (usuarioId: number) => `@SIGES_PIN:notificacoes-vistas:${usuarioId}`;

export const EVENTO_NOTIFICACOES_VISTAS = 'siges:notificacoes-vistas';

export function marcarNotificacoesVistas(usuarioId: number) {
  try {
    localStorage.setItem(chave(usuarioId), new Date().toISOString());
  } catch {
    // ignora
  }
  // Avisa o menu para zerar o contador sem esperar a próxima troca de página
  window.dispatchEvent(new Event(EVENTO_NOTIFICACOES_VISTAS));
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
