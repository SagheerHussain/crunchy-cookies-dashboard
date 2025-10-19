// src/components/SalesAmountPanelFromApi.jsx
import { useMemo, useState } from 'react';
import Chart from 'react-apexcharts';
import useLiveSalesBreakdown from '../../../../hooks/analytics/useLiveSalesBreakdown';

const buildLineOptions = (categories) => ({
  chart: { background: 'transparent', toolbar: { show: false }, foreColor: '#B8C1CC' },
  theme: { mode: 'dark' },
  colors: ['#0fb4bb'],
  stroke: { curve: 'smooth', width: 3 },
  markers: { size: 3, strokeWidth: 2, hover: { sizeOffset: 2 } },
  fill: { type: 'gradient', gradient: { shade: 'dark', type: 'vertical', opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 100] } },
  grid: { borderColor: 'rgba(255,255,255,0.08)', strokeDashArray: 3 },
  xaxis: { categories, axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { min: 0, forceNiceScale: true, title: { text: 'Sales' } },
  dataLabels: { enabled: false },
  tooltip: {
    shared: false,
    y: { formatter: (val, opts) => {
      const cats = opts?.w?.config?.xaxis?.categories || [];
      const i = typeof opts?.dataPointIndex === 'number' ? opts.dataPointIndex : -1;
      return `$${val} Sales${cats[i] ? ` in ${cats[i]}` : ''}`;
    }}
  },
  noData: { text: 'No data', align: 'center' }
});

export default function SalesAmountPanelFromApi({ tz = 'UTC', status = 'delivered', dateField = 'createdAt', pollMs = 10000 }) {
  const [filter, setFilter] = useState('currentYear'); // currentMonth | currentYear | overall
  const data = useLiveSalesBreakdown({ intervalMs: pollMs, tz, status, dateField });

  console.log("sales breakdown", data)

  const { categories, values, titleNote, headerTotal } = useMemo(() => {
    if (!data) return { categories: [], values: [], titleNote: '', headerTotal: 0 };

    if (filter === 'currentMonth') {
      const cm = data.currentMonth || {};
      return {
        categories: cm.dates || [],
        values: cm.sales || [],
        titleNote: `Current Month (${cm.month}/${cm.year})`,
        headerTotal: cm.total || 0
      };
    }
    if (filter === 'currentYear') {
      const cy = data.currentYear || {};
      return {
        categories: cy.month || [],
        values: cy.sales || [],
        titleNote: `Current Year (${cy.year})`,
        headerTotal: cy.total || 0
      };
    }
    const ov = data.overall || {};
    return {
      categories: ov.year || [],
      values: ov.sales || [],
      titleNote: `Overall (${ov.startYear}–${ov.endYear})`,
      headerTotal: ov.total || 0
    };
  }, [data, filter]);

  const options = useMemo(() => buildLineOptions(categories), [categories]);
  const series = useMemo(() => [{ name: 'Sales', data: values }], [values]);

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div>
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

      {/* Optional: show total above the chart if you want */}
      {/* <h2 className="m-0" style={{ color: '#fff' }}>${headerTotal.toLocaleString()}</h2> */}

      <Chart type="area" height={250} series={series} options={options} />
    </>
  );
}
