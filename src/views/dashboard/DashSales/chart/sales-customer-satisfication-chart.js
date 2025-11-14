export function SalesCustomerSatisfactionChartData(data = []) {
  const colors = ['#0fb4bb', '#33c6c8', '#6fdad6', '#a8ece7']; // teal shades

  return {
    height: 260,
    options: {
      chart: { background: 'transparent' },
      labels: ['Extremely Satisfied', 'Satisfied', 'Poor', 'Very Poor'],

      // 🔹 Legend with colored values + percentages
      legend: {
        show: true,
        offsetY: 50,
        labels: { useSeriesColors: true }, // text color = series color
        markers: { width: 10, height: 10, radius: 12 },
        formatter: function (seriesName, opts) {
          const i = opts.seriesIndex;
          const val = opts.w.globals.series[i]; // raw value
          const total = opts.w.globals.seriesTotals.reduce((a, b) => a + b, 0);
          const pct = total ? ((val / total) * 100).toFixed(1) : 0;

          // colored, bold value + %; ApexCharts allows HTML here
          return `${seriesName} — <b>${val}</b> <span style="opacity:.75">(${pct}%)</span>`;
        }
      },

      dataLabels: { enabled: true, dropShadow: { enabled: false } },

      // 🔹 Use custom colors (disable monochrome)
      colors,
      theme: { mode: 'light', monochrome: { enabled: false } },

      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: { height: 320 },
            legend: { position: 'bottom', offsetY: 0 }
          }
        }
      ]
    },

    // your values
    series: data
  };
}
