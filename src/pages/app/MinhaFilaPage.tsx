// Tela compartilhada: vai em todos os zips, mas só o responsável altera. Responsável: Zip 3 · Especialista · Segurança da informação.
import { Erro, PageHeader, Skeleton, Vazio } from '@/components/common/ui';
import { FILAS } from '@/fluxos/fila';
import { useAsync, useAuth } from '@/hooks';
import { filaService } from '@/services';
import { PERFIL_LABEL } from '@/utils/constants';

// Tarefas pendentes do usuário atual. Cada fluxo entrega as seções do seu perfil (fluxos/<fluxo>/fila.tsx):
// triagem e retornos (Analista), pareceres e decisões (Especialista), validações e demandas (Demandante)
export default function MinhaFilaPage() {
  const { usuario } = useAuth();
  const { dados: f, erro, recarregar } = useAsync(() => filaService.minha(), []);

  if (!usuario) return null;
  const perfil = usuario.perfil;
  const filas = FILAS.filter((x) => x.perfil === perfil);

  return (
    <div>
      <PageHeader
        eyebrow={PERFIL_LABEL[perfil]}
        titulo="Minha fila"
        descricao={filas.map((x) => x.descricao).join(' ') || 'Tarefas pendentes do seu perfil.'}
        acoes={filas.map((x, i) => x.Acoes && <x.Acoes key={i} />)}
      />
      {erro && <Erro texto={erro} onTentar={recarregar} />}
      {filas.length === 0 ? (
        <Vazio titulo="Fila deste perfil não instalada" texto={`As tarefas do perfil ${PERFIL_LABEL[perfil]} fazem parte de outro fluxo, que não está nesta versão do projeto.`} />
      ) : !f ? (
        <Skeleton className="h-80" />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {filas.map((x, i) => (
            <x.Secoes key={i} fila={f} usuario={usuario} recarregar={recarregar} />
          ))}
        </div>
      )}
    </div>
  );
}
