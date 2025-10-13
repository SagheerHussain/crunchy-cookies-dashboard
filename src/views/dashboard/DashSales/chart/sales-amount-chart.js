export function SalesAmountChartData() {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const values = [130, 251, 235, 251, 235, 251, 235, 251, 235, 251, 235, 251]; // month-wise
  
    return {
      height: 250,
      type: 'bar',
      series: [
        {
          name: 'Orders',
          data: values
        }
      ],
      options: {
        chart: {
          background: 'transparent',
          toolbar: { show: false }
        },
  
        // theme color(s)
        colors: ['#7267EF'],
  
        // pretty bars
        plotOptions: {
          bar: {
            columnWidth: '58%',
            borderRadius: 8,
            borderRadiusApplication: 'end',
            dataLabels: {
              position: 'top'
            }
          }
        },
  
        // gradient fill to match your UI
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'light',
            type: 'vertical',
            gradientToColors: ['#A78BFA'], // lighter purple
            stops: [0, 100],
            opacityFrom: 0.95,
            opacityTo: 0.85
          }
        },
  
        // subtle stroke for bar edge
        stroke: {
          show: true,
          width: 1,
          colors: ['#ffffff']
        },
  
        // legible labels on bars
        dataLabels: {
          enabled: true,
          formatter: (val) => `${val}`, // only the number
          offsetY: -6,
          style: {
            fontSize: '12px',
            fontWeight: '700',
            colors: ['#ffffff']
          },
          background: {
            enabled: true,
            foreColor: '#ffffff',
            padding: 4,
            borderRadius: 6,
            opacity: 0.9,
            borderWidth: 0,
            dropShadow: {
              enabled: true,
              top: 1,
              left: 0,
              blur: 2,
              opacity: 0.2
            }
          }
        },
  
        grid: {
          borderColor: 'rgba(0,0,0,0.06)',
          strokeDashArray: 3
        },
  
        xaxis: {
          categories: months,
          axisBorder: { show: false },
          axisTicks: { show: false },
          labels: {
            style: { colors: '#555', fontSize: '13px' }
          }
        },
  
        yaxis: {
          labels: {
            style: { colors: '#555', fontSize: '13px' }
          },
          title: { text: 'Orders' }
        },
  
        tooltip: {
          shared: false,
          y: {
            formatter: (val, opts) => {
              const cats = (opts?.w?.config?.xaxis?.categories) || months;
              const i = typeof opts?.dataPointIndex === 'number' ? opts.dataPointIndex : -1;
              const month = cats[i] ?? '';
              return `${val} Orders${month ? ` in ${month}` : ''}`;
            }
          }
        },
  
        states: {
          hover: { filter: { type: 'lighten', value: 0.05 } },
          active:{ filter: { type: 'darken',  value: 0.05 } }
        },
  
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
      }
    };
  }
  