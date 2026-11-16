import { useEffect, useState } from 'react';

import { Campo } from '@/components/common/ui';
import { FormularioConfirmado, Opcoes } from '@/components/projeto/formulario';
import { propostaService } from '@/services';
import type { EtapaKanban, TipoProposta, TipoTerminal } from '@/types/domain';
import { TIPO_PROPOSTA_LABEL, TIPO_TERMINAL_LABEL } from '@/utils/constants';

// ---------------- Propor coluna ou percurso (Analista) ----------------
// A proposta usa o mesmo formato da criação direta e só é aplicada se um Especialista aprovar.

const CODIGO = /^[A-Z][A-Z0-9_]*$/;

export function ProporModal({ aberto, etapas, onFechar, onFeito }: { aberto: boolean; etapas: EtapaKanban[]; onFechar: () => void; onFeito: () => void }) {
  const [tipo, setTipo] = useState<TipoProposta>('COLUNA');
  const [coluna, setColuna] = useState({ codigo: '', nome: '', ordem: 0, terminal: '' as TipoTerminal | '', descricao: '' });
  const [percurso, setPercurso] = useState({ origemId: 0, destinoId: 0, exigeGovernanca: true });
  const [justificativa, setJustificativa] = useState('');
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!aberto) return;
    setTipo('COLUNA');
    setColuna({ codigo: '', nome: '', ordem: Math.max(0, ...etapas.map((e) => e.ordem)) + 10, terminal: '', descricao: '' });
    setPercurso({ origemId: 0, destinoId: 0, exigeGovernanca: true });
    setJustificativa('');
    setErros({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  const nome = (id: number) => etapas.find((e) => e.id === id)?.nome ?? '—';
  const ativas = etapas.filter((e) => e.ativa);

  return (
    <FormularioConfirmado
      aberto={aberto}
      onFechar={onFechar}
      onAtualizar={onFeito}
      titulo="Propor alteração no quadro"
      descricao="Uma nova coluna ou um novo percurso. A proposta fica pendente até a decisão de um Especialista."
      largura="max-w-2xl"
      validar={() => {
        const e: Record<string, string> = {};
        if (tipo === 'COLUNA') {
          if (!CODIGO.test(coluna.codigo) || coluna.codigo.length > 255) e.codigo = 'Comece com letra maiúscula e use só letras maiúsculas, dígitos ou sublinhado.';
          else if (etapas.some((x) => x.codigo === coluna.codigo)) e.codigo = 'Já existe uma coluna com este código.';
          if (!coluna.nome.trim() || coluna.nome.trim().length > 255) e.nome = 'Informe o nome (até 255 caracteres).';
          if (!Number.isInteger(coluna.ordem) || coluna.ordem < 0) e.ordem = 'Use um inteiro maior ou igual a zero.';
        } else {
          if (!percurso.origemId) e.origemId = 'Escolha a origem.';
          if (!percurso.destinoId) e.destinoId = 'Escolha o destino.';
          if (percurso.origemId && percurso.origemId === percurso.destinoId) e.destinoId = 'Origem e destino devem ser diferentes.';
        }
        if (!justificativa.trim()) e.justificativa = 'A justificativa é obrigatória.';
        setErros(e);
        return !Object.keys(e).length;
      }}
      resumo={() =>
        tipo === 'COLUNA'
          ? [
              ['Tipo', 'Nova coluna'],
              ['Código', coluna.codigo],
              ['Nome', coluna.nome],
              ['Ordem', String(coluna.ordem)],
              ['Terminal', coluna.terminal ? TIPO_TERMINAL_LABEL[coluna.terminal] : 'Não'],
              ['Justificativa', justificativa],
            ]
          : [
              ['Tipo', 'Novo percurso'],
              ['Percurso', `${nome(percurso.origemId)} → ${nome(percurso.destinoId)}`],
              ['Governança', percurso.exigeGovernanca ? 'Governado (exige pedido de avanço)' : 'Livre'],
              ['Justificativa', justificativa],
            ]
      }
      enviar={async () => {
        if (tipo === 'COLUNA')
          await propostaService.propor({ tipo, justificativa, proposta: { codigo: coluna.codigo, nome: coluna.nome, ordem: coluna.ordem, terminal: coluna.terminal || null, descricao: coluna.descricao } });
        else await propostaService.propor({ tipo, justificativa, proposta: percurso });
        return 'Proposta enviada. Próximo responsável: Especialista (decisão).';
      }}
      rotuloConfirmar="Enviar proposta"
    >
      {() => (
        <>
          <Opcoes
            valor={tipo}
            onChange={setTipo}
            opcoes={[
              { v: 'COLUNA', t: TIPO_PROPOSTA_LABEL.COLUNA, d: 'Nova coluna do Kanban.' },
              { v: 'TRANSICAO', t: TIPO_PROPOSTA_LABEL.TRANSICAO, d: 'Novo caminho entre duas colunas.' },
            ]}
          />
          {tipo === 'COLUNA' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Código" erro={erros.codigo} dica="Ex.: PILOTO. Não muda depois de criado." htmlFor="p-cod">
                <input id="p-cod" className="input font-mono uppercase" value={coluna.codigo} onChange={(e) => setColuna({ ...coluna, codigo: e.target.value.toUpperCase().replace(/\s/g, '_') })} />
              </Campo>
              <Campo label="Nome" erro={erros.nome} htmlFor="p-nome">
                <input id="p-nome" className="input" value={coluna.nome} onChange={(e) => setColuna({ ...coluna, nome: e.target.value })} />
              </Campo>
              <Campo label="Ordem" erro={erros.ordem} dica={`Colunas atuais: ${etapas.map((x) => `${x.nome} (${x.ordem})`).join(', ')}`} htmlFor="p-ordem">
                <input id="p-ordem" type="number" min={0} step={1} className="input" value={coluna.ordem} onChange={(e) => setColuna({ ...coluna, ordem: Number(e.target.value) })} />
              </Campo>
              <Campo label="Terminal (opcional)" dica="Colunas terminais não admitem saída." htmlFor="p-term">
                <select id="p-term" className="input" value={coluna.terminal} onChange={(e) => setColuna({ ...coluna, terminal: e.target.value as TipoTerminal | '' })}>
                  <option value="">Não é terminal</option>
                  <option value="CONCLUSAO">{TIPO_TERMINAL_LABEL.CONCLUSAO}</option>
                  <option value="DESCONTINUACAO">{TIPO_TERMINAL_LABEL.DESCONTINUACAO}</option>
                </select>
              </Campo>
              <div className="sm:col-span-2">
                <Campo label="Descrição (opcional)" htmlFor="p-desc">
                  <input id="p-desc" className="input" value={coluna.descricao} onChange={(e) => setColuna({ ...coluna, descricao: e.target.value })} />
                </Campo>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Origem" erro={erros.origemId} dica="Coluna ativa e não terminal." htmlFor="p-orig">
                <select id="p-orig" className="input" value={percurso.origemId} onChange={(e) => setPercurso({ ...percurso, origemId: Number(e.target.value) })}>
                  <option value={0}>Selecione…</option>
                  {ativas.filter((x) => !x.terminal).map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.nome}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Destino" erro={erros.destinoId} htmlFor="p-dest">
                <select id="p-dest" className="input" value={percurso.destinoId} onChange={(e) => setPercurso({ ...percurso, destinoId: Number(e.target.value) })}>
                  <option value={0}>Selecione…</option>
                  {ativas.filter((x) => x.id !== percurso.origemId).map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.nome}
                    </option>
                  ))}
                </select>
              </Campo>
              <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
                <input type="checkbox" className="h-4 w-4 accent-amber-600" checked={percurso.exigeGovernanca} onChange={(e) => setPercurso({ ...percurso, exigeGovernanca: e.target.checked })} />
                Percurso governado (exige pedido de avanço e decisão do Especialista)
              </label>
            </div>
          )}
          <Campo label="Justificativa" erro={erros.justificativa} htmlFor="p-just">
            <textarea id="p-just" rows={3} className="input" value={justificativa} onChange={(e) => setJustificativa(e.target.value)} />
          </Campo>
        </>
      )}
    </FormularioConfirmado>
  );
}
