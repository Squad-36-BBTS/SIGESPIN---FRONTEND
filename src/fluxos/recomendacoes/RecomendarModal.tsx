import { useEffect, useState } from 'react';

import { Campo } from '@/components/common/ui';
import { FormularioConfirmado } from '@/components/projeto/formulario';
import { recomendacaoService, usuarioService } from '@/services';
import type { Usuario } from '@/types/domain';

const MAX_TITULO = 255;

// ---------------- Recomendar demanda (Analista ou Especialista) ----------------
// O destinatário é um Demandante ativo; a recomendação começa PENDENTE.

export function RecomendarModal({ aberto, onFechar, onFeito }: { aberto: boolean; onFechar: () => void; onFeito: () => void }) {
  const [demandantes, setDemandantes] = useState<Usuario[]>([]);
  const [destinatarioId, setDestinatarioId] = useState(0);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!aberto) return;
    setDestinatarioId(0);
    setTitulo('');
    setDescricao('');
    setErros({});
    usuarioService.listar('DEMANDANTE').then(setDemandantes).catch(() => setDemandantes([]));
  }, [aberto]);

  const destinatario = demandantes.find((d) => d.id === destinatarioId);
  return (
    <FormularioConfirmado
      aberto={aberto}
      onFechar={onFechar}
      onAtualizar={onFeito}
      titulo="Recomendar demanda"
      descricao="Sugira a um Demandante que registre uma demanda. Ele pode converter em demanda espontânea ou recusar com justificativa."
      validar={() => {
        const e: Record<string, string> = {};
        if (!destinatarioId) e.destinatarioId = 'Escolha o Demandante.';
        if (!titulo.trim()) e.titulo = 'Informe o título.';
        else if (titulo.trim().length > MAX_TITULO) e.titulo = `Use até ${MAX_TITULO} caracteres.`;
        if (!descricao.trim()) e.descricao = 'Descreva a recomendação.';
        setErros(e);
        return !Object.keys(e).length;
      }}
      resumo={() => [
        ['Destinatário', destinatario?.nome],
        ['Título', titulo],
        ['Descrição', descricao],
      ]}
      enviar={async () => {
        await recomendacaoService.criar({ destinatarioId, titulo, descricao });
        return `Recomendação enviada. Próximo responsável: ${destinatario?.nome} (Demandante).`;
      }}
      rotuloConfirmar="Enviar recomendação"
    >
      {() => (
        <>
          <Campo label="Destinatário (Demandante ativo)" erro={erros.destinatarioId} htmlFor="r-dest">
            <select id="r-dest" className="input" value={destinatarioId} onChange={(e) => setDestinatarioId(Number(e.target.value))}>
              <option value={0}>Selecione…</option>
              {demandantes.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="Título" erro={erros.titulo} dica={`${titulo.trim().length}/${MAX_TITULO} caracteres`} htmlFor="r-tit">
            <input id="r-tit" className="input" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </Campo>
          <Campo label="Descrição" erro={erros.descricao} htmlFor="r-desc">
            <textarea id="r-desc" rows={4} className="input" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </Campo>
        </>
      )}
    </FormularioConfirmado>
  );
}
