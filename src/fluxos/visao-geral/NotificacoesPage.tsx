import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Erro, PageHeader, Selo, Skeleton, Vazio } from '@/components/common/ui';
import { useAsync, useAuth } from '@/hooks';
import { notificacaoService } from '@/services';
import { formatarDataHora, tempoRelativo } from '@/utils/formatters';
import { contarNaoLidas, marcarNotificacoesVistas } from '@/utils/notificacoes';

// Notificações globais (guia, seção 3): as movimentações realizadas pelo Especialista ficam visíveis
// para todos os perfis autenticados, com a mensagem e o projeto correspondente.
export default function NotificacoesPage() {
  const { usuario } = useAuth();
  const { dados, erro, recarregar } = useAsync(() => notificacaoService.listar(), []);
  const [novas, setNovas] = useState<number | null>(null);

  // Ao abrir a lista, guarda quantas eram novas e marca todas como vistas
  useEffect(() => {
    if (!dados || !usuario || novas !== null) return;
    setNovas(contarNaoLidas(dados, usuario.id));
    marcarNotificacoesVistas(usuario.id);
  }, [dados, usuario, novas]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Áreas adicionais" titulo="Notificações" descricao="Movimentações realizadas por Especialistas no Kanban, visíveis para todos os perfis." />
      {erro && <Erro texto={erro} onTentar={recarregar} />}
      {!dados ? (
        <Skeleton className="h-64" />
      ) : dados.length === 0 ? (
        <Vazio titulo="Nenhuma notificação" texto="Quando um Especialista mover um projeto, a notificação aparece aqui." />
      ) : (
        <ol className="card divide-y divide-bb-line">
          {dados.map((n, i) => (
            <li key={n.id} className="flex gap-3 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-bb-blue-light text-bb-blue">
                <Bell className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1 text-sm">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{n.mensagem}</span>
                  {novas !== null && i < novas && <Selo classe="border-bb-yellow bg-bb-yellow/30 text-bb-slate">Nova</Selo>}
                </p>
                <Link to={`/app/projetos/${n.projetoId}?aba=kanban`} className="text-bb-blue hover:underline">
                  {n.projetoTitulo}
                </Link>
                <p className="mt-0.5 text-xs text-bb-muted" title={formatarDataHora(n.criadaEm)}>
                  {n.autor.nome} · {tempoRelativo(n.criadaEm)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
