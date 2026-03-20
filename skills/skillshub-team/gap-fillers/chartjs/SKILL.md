# Chart.js Skill

Use when building charts and dashboards with Chart.js (v4+).

## Key Patterns

### Installation
```bash
npm install chart.js
```

### Basic Chart
```typescript
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const ctx = document.getElementById('myChart') as HTMLCanvasElement;
new Chart(ctx, {
  type: 'bar', // 'line' | 'pie' | 'doughnut' | 'radar' | 'scatter' | 'bubble'
  data: {
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [{
      label: 'Revenue',
      data: [12, 19, 3],
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgb(54, 162, 235)',
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Monthly Revenue' } },
    scales: { y: { beginAtZero: true } }
  }
});
```

### React Integration (react-chartjs-2)
```tsx
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function Dashboard({ data }) {
  return <Bar data={data} options={{ responsive: true, maintainAspectRatio: false }} />;
}
```

### Real-time Updates
```typescript
function addData(chart: Chart, label: string, newData: number) {
  chart.data.labels!.push(label);
  chart.data.datasets.forEach((dataset) => dataset.data.push(newData));
  chart.update('none'); // skip animation for perf
}
```

### Dashboard Layout Best Practices
- Use `responsive: true` and `maintainAspectRatio: false` for grid layouts
- Register only needed components for smaller bundle: `Chart.register(BarElement, CategoryScale, ...)`
- Use `chart.destroy()` before recreating to prevent memory leaks
- For 10k+ data points, use `decimation` plugin or sample data

### Plugin System
```typescript
const customPlugin = {
  id: 'customBackground',
  beforeDraw: (chart: Chart) => {
    const { ctx, chartArea } = chart;
    ctx.save();
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(chartArea.left, chartArea.top, chartArea.width, chartArea.height);
    ctx.restore();
  }
};
```

## Common Pitfalls
- Canvas not found: ensure DOM is ready before creating chart
- Memory leaks: always call `chart.destroy()` in cleanup/unmount
- Tree-shaking: use named imports from 'chart.js' for smaller bundles
- SSR: Chart.js requires `<canvas>` — use dynamic import or `next/dynamic` with `ssr: false`