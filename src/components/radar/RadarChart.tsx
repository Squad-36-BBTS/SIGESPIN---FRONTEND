import { Chart as ChartJS, Filler, Legend, LineElement, PointElement, RadialLinearScale, Tooltip } from 'chart.js';
import { Radar } from 'react-chartjs-2';

import type { ScoresRadar } from '@/types/domain';
import { RADAR_EIXOS } from '@/utils/constants';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const valores = (s: ScoresRadar) => [s.negocio, s.produto, s.time, s.receita];

// Radar 4D (negócio, produto, time, receita) com escala de 0 a 4.
// Compara a leitura inicial com a atual quando as duas existem.
export function RadarChart({ inicial, atual, altura = 280 }: { inicial?: ScoresRadar | null; atual?: ScoresRadar | null; altura?: number }) {
  const datasets = [];
  if (inicial)
    datasets.push({
      label: 'Leitura inicial',
      data: valores(inicial),
      borderColor: '#94A3B8',
      backgroundColor: 'rgba(148, 163, 184, 0.12)',
      borderDash: [4, 4],
      pointBackgroundColor: '#94A3B8',
      borderWidth: 1.5,
      pointRadius: 3,
    });
  if (atual)
    datasets.push({
      label: 'Leitura atual',
      data: valores(atual),
      borderColor: '#005EEF',
      backgroundColor: 'rgba(0, 94, 239, 0.15)',
      pointBackgroundColor: '#FCFC30',
      pointBorderColor: '#005EEF',
      borderWidth: 2,
      pointRadius: 4,
    });

  return (
    <div style={{ height: altura }}>
      <Radar
        data={{ labels: [...RADAR_EIXOS], datasets }}
        options={{
          maintainAspectRatio: false,
          animation: { duration: 500 },
          scales: {
            r: {
              min: 0,
              max: 4,
              ticks: { stepSize: 1, backdropColor: 'transparent', color: '#94A3B8', font: { size: 10 } },
              grid: { color: '#E2E8F0' },
              angleLines: { color: '#E2E8F0' },
              pointLabels: { color: '#1E293B', font: { size: 12, weight: 'bold' } },
            },
          },
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true, color: '#475569', font: { size: 11 } } },
            tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${Number(c.raw).toFixed(2).replace('.', ',')}` } },
          },
        }}
      />
    </div>
  );
}
