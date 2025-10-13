import { useMemo, useState } from 'react';
import Chart from 'react-apexcharts';

// ---- theme'd bar options (same purple look) ----
const buildBarOptions = (categories) => ({
  chart: { background: 'transparent', toolbar: { show: false } },
  colors: ['#0fb4bb'],
  plotOptions: {
    bar: { columnWidth: '58%', borderRadius: 8, borderRadiusApplication: 'end', dataLabels: { position: 'top' } }
  },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'light',
      type: 'vertical',
      gradientToColors: ['#0da0a5'],
      stops: [0, 100],
      opacityFrom: 0.95,
      opacityTo: 0.85
    }
  },
  stroke: { show: true, width: 1, colors: ['#ffffff'] },
  dataLabels: {
    enabled: true,
    formatter: (val) => `${val}`,
    offsetY: -6,
    style: { fontSize: '12px', fontWeight: '700', colors: ['#fff'] },
    background: {
      enabled: true,
      foreColor: '#fff',
      padding: 4,
      borderRadius: 6,
      opacity: 0.9,
      borderWidth: 0,
      dropShadow: { enabled: true, top: 1, left: 0, blur: 2, opacity: 0.2 }
    }
  },
  grid: { borderColor: 'rgba(0,0,0,0.06)', strokeDashArray: 3 },
  xaxis: {
    categories,
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#555', fontSize: '13px' } }
  },
  yaxis: { labels: { style: { colors: '#555', fontSize: '13px' } }, title: { text: 'Sales' } },
  tooltip: {
    shared: false,
    y: {
      formatter: (val, opts) => {
        const cats = opts?.w?.config?.xaxis?.categories || [];
        const i = typeof opts?.dataPointIndex === 'number' ? opts.dataPointIndex : -1;
        const label = cats[i] ?? '';
        return `$${val} Sales${label ? ` in ${label}` : ''}`;
      }
    }
  },
  states: { hover: { filter: { type: 'lighten', value: 0.05 } }, active: { filter: { type: 'darken', value: 0.05 } } },
  theme: { mode: 'light' },
  responsive: [
    {
      breakpoint: 768,
      options: {
        plotOptions: { bar: { columnWidth: '66%' } },
        dataLabels: { style: { fontSize: '11px' } },
        xaxis: { labels: { style: { fontSize: '12px' } } },
        yaxis: { labels: { style: { fontSize: '12px' } } }
      }
    }
  ]
});

// ---- helpers ----
const monthShort = (i) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i];

function groupByMonth(records, yearFilter = null) {
  // records: [{date: '2025-01-12', value: 23}, ...]
  const map = new Map(); // key: 0..11
  records.forEach((r) => {
    const d = new Date(r.date);
    if (Number.isFinite(yearFilter) && d.getFullYear() !== yearFilter) return;
    const m = d.getMonth();
    map.set(m, (map.get(m) || 0) + (r.value || 0));
  });
  const cats = Array.from({ length: 12 }, (_, i) => monthShort(i));
  const vals = cats.map((_, i) => map.get(i) || 0);
  return { categories: cats, values: vals };
}

function groupByDayCurrentMonth(records) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const arr = Array(daysInMonth).fill(0);

  records.forEach((r) => {
    const d = new Date(r.date);
    if (d.getFullYear() === y && d.getMonth() === m) {
      const day = d.getDate(); // 1..N
      arr[day - 1] += r.value || 0;
    }
  });

  const cats = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
  return { categories: cats, values: arr };
}

/**
 * SalesAmountPanel
 * @param {{data: Array<{date: string | number | Date, value: number}>}} props
 */
export default function SalesAmountPanel({ data = [] }) {
  const [filter, setFilter] = useState('currentYear'); // currentMonth | currentYear | overall
  const now = new Date();

  const { categories, values, titleNote } = useMemo(() => {
    if (filter === 'currentMonth') {
      const g = groupByDayCurrentMonth(data);
      return { ...g, titleNote: `Current Month (${monthShort(now.getMonth())})` };
    }
    if (filter === 'currentYear') {
      const g = groupByMonth(data, now.getFullYear());
      return { ...g, titleNote: `Current Year (${now.getFullYear()})` };
    }
    // overall (all-time months aggregated)
    const g = groupByMonth(data, null);
    return { ...g, titleNote: 'Overall (All Years, Monthly Totals)' };
  }, [data, filter]);

  const options = useMemo(() => buildBarOptions(categories), [categories]);
  const series = useMemo(() => [{ name: 'Sales', data: values }], [values]);

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="">
          <button
            style={{ borderRadius: '10px' }}
            className={`me-2 btn btn-sm ${filter === 'currentMonth' ? 'btn-teal' : 'btn-outline-teal'}`}
            onClick={() => setFilter('currentMonth')}
          >
            Current Month
          </button>

          <button
            style={{ borderRadius: '10px' }}
            className={`me-2 btn btn-sm ${filter === 'currentYear' ? 'btn-teal' : 'btn-outline-teal'}`}
            onClick={() => setFilter('currentYear')}
          >
            Current Year
          </button>

          <button
            style={{ borderRadius: '10px' }}
            className={`me-2 btn btn-sm ${filter === 'overall' ? 'btn-teal' : 'btn-outline-teal'}`}
            onClick={() => setFilter('overall')}
          >
            Overall
          </button>
        </div>
        <small className="text-muted">{titleNote}</small>
      </div>
      <Chart type="bar" height={250} series={series} options={options} />
    </>
  );
}
