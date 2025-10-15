export const SalesSupportChartData1 = (data = []) => ({
  height: 250,
  type: 'bar',
  options: {
    chart: { background: 'transparent' },
    colors: ['#0fb4bb'],
    plotOptions: { bar: { columnWidth: '60%', borderRadius: 6 } },
    dataLabels: { enabled: true, style: { fontSize: '14px', fontWeight: 'bold', colors: ['#fff'], padding: 2 } },
    xaxis: { categories: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] },
    yaxis: { title: { text: 'Orders' } },
    theme: { mode: 'light' }
  },
  series: [{ name: 'Orders', data }]
});
