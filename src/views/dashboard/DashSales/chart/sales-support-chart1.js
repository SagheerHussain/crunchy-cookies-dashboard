export function SalesSupportChartData1() {
  return {
    height: 250,
    type: 'bar',
    options: {
      chart: {
        background: 'transparent'
      },
      colors: ['#0fb4bb'],
      plotOptions: {
        bar: {
          columnWidth: '60%',
          borderRadius: 6
        }
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '14px',
          fontWeight: 'bold',
          colors: ['#fff'],
          padding: 2
        }
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        labels: {
          style: {
            colors: '#555',
            fontSize: '13px'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: '#555',
            fontSize: '13px'
          }
        },
        title: {
          text: 'Orders'
        }
      },
      tooltip: {
        y: {
          formatter: (val, opts) => {
            const cats = (opts && opts.w && opts.w.config && opts.w.config.xaxis && opts.w.config.xaxis.categories) || [];
            const i = (opts && typeof opts.dataPointIndex === 'number') ? opts.dataPointIndex : -1;
            const month = cats[i] ?? '';
            return `${val} Orders${month ? ` in ${month}` : ''}`;
          }
        }
      },
      theme: {
        mode: 'light'
      }
    },
    series: [
      {
        name: 'Orders',
        data: [130, 251, 235, 251, 235, 251, 235, 251, 235, 251, 235, 251]  // 👈 month-wise values
      }
    ]
  };
}
