import { Radar } from 'react-chartjs-2'
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js'
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

export default function MaturityRadar() {
  return <div className="mx-auto h-[300px] w-full max-w-[440px]"><Radar data={{ labels: ['Negócio', 'Produto', 'Time', 'Receita'], datasets: [{ label: 'Maturidade atual', data: [78, 68, 82, 58], backgroundColor: 'rgba(37, 99, 235, .18)', borderColor: '#2563eb', pointBackgroundColor: '#2563eb', pointBorderColor: '#fff', pointRadius: 4, borderWidth: 2 }, { label: 'Referência', data: [65, 75, 70, 72], backgroundColor: 'rgba(16, 185, 129, .06)', borderColor: '#10b981', pointBackgroundColor: '#10b981', pointRadius: 3, borderDash: [4, 4], borderWidth: 1.5 }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, color: '#64748b', font: { size: 10 } } } }, scales: { r: { min: 0, max: 100, ticks: { display: false, stepSize: 20 }, grid: { color: '#e2e8f0' }, angleLines: { color: '#e2e8f0' }, pointLabels: { color: '#64748b', font: { size: 11 } } } } }} /></div>
}
