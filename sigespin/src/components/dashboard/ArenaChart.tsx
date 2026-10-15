import { Bar } from 'react-chartjs-2'
import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip, Legend } from 'chart.js'
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function ArenaChart() {
  return <div className="h-[260px] w-full"><Bar data={{ labels: ['Eficiência operacional', 'Negócios digitais', 'Segurança integrada', 'A definir'], datasets: [{ label: 'Projetos', data: [18, 14, 10, 6], backgroundColor: ['#1764dc', '#2857b8', '#173f83', '#5b91e8'], borderRadius: 5, maxBarThickness: 44 }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: true } }, scales: { x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } }, y: { beginAtZero: true, ticks: { stepSize: 5, color: '#64748b', font: { size: 10 } }, grid: { color: '#e8edf5' } } } }} /></div>
}
