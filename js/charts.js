/**
 * SOLVANTA - Chart.js Engine & Visualizations
 * Provides clean energy theme color palettes, smooth curves,
 * tooltip formatting, and instance cleanup.
 */

const SolvantaCharts = (() => {
  // Store active chart instances by canvas ID to prevent memory leaks & glitches
  const chartInstances = {};

  // Color tokens for charts
  const colors = {
    emerald: '#10b981',
    emeraldLight: 'rgba(16, 185, 129, 0.15)',
    emeraldGlow: 'rgba(16, 185, 129, 0.4)',
    accentLime: '#22c55e',
    accentCyan: '#06b6d4',
    cyanLight: 'rgba(6, 182, 212, 0.15)',
    solarAmber: '#f59e0b',
    amberLight: 'rgba(245, 158, 11, 0.15)',
    purple: '#8b5cf6',
    slateMuted: '#94a3b8',
    slateBorder: '#e2e8f0',
    targetLine: '#64748b'
  };

  function destroyChart(canvasId) {
    if (chartInstances[canvasId]) {
      chartInstances[canvasId].destroy();
      delete chartInstances[canvasId];
    }
  }

  // 1. Generation Trend Chart (Hourly or 30-Day Daily)
  function renderGenerationTrendChart(canvasId, historyData, isHourly = false) {
    destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas || !window.Chart) return null;

    const ctx = canvas.getContext('2d');
    const labels = historyData.map(d => isHourly ? d.time : d.label);
    const actualData = historyData.map(d => isHourly ? d.generationMWh : d.totalMWh);
    const solarData = historyData.map(d => isHourly ? (d.generationKW ? (d.generationKW / 1000) : 0) : d.solarMWh);
    const windData = historyData.map(d => isHourly ? 0 : d.windMWh);

    const datasets = [
      {
        label: isHourly ? 'Generation (MWh)' : 'Total Generation (MWh)',
        data: actualData,
        borderColor: colors.emerald,
        backgroundColor: colors.emeraldLight,
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: isHourly ? 2 : 3,
        pointHoverRadius: 6,
        pointBackgroundColor: colors.emerald
      }
    ];

    if (!isHourly && historyData[0] && historyData[0].targetMWh) {
      datasets.push({
        label: 'Target Baseline (MWh)',
        data: historyData.map(d => d.targetMWh),
        borderColor: colors.slateMuted,
        borderDash: [5, 5],
        borderWidth: 1.5,
        fill: false,
        pointRadius: 0
      });
    }

    const chart = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { family: 'Plus Jakarta Sans', size: 12 }, boxWidth: 12 }
          },
          tooltip: {
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${SolvantaUtils.formatNumber(ctx.raw, 1)} MWh`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 }, maxRotation: 45 }
          },
          y: {
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            ticks: {
              font: { size: 11 },
              callback: (v) => `${v} MWh`
            }
          }
        }
      }
    });

    chartInstances[canvasId] = chart;
    return chart;
  }

  // 2. Monthly Generation Comparison Chart (Actual vs Target)
  function renderMonthlyComparisonChart(canvasId, monthlyData) {
    destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas || !window.Chart) return null;

    const ctx = canvas.getContext('2d');
    const labels = monthlyData.map(d => d.month);
    const actual = monthlyData.map(d => d.actualMWh);
    const target = monthlyData.map(d => d.targetMWh);

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Actual Energy (MWh)',
            data: actual,
            backgroundColor: colors.emerald,
            borderRadius: 6
          },
          {
            label: 'Target Energy (MWh)',
            data: target,
            backgroundColor: '#cbd5e1',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, font: { size: 12 } } },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${SolvantaUtils.formatNumber(ctx.raw, 0)} MWh`
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            ticks: { callback: (v) => `${(v / 1000).toFixed(0)}k MWh` }
          }
        }
      }
    });

    chartInstances[canvasId] = chart;
    return chart;
  }

  // 3. Plant-Wise Generation Comparison Bar Chart
  function renderPlantComparisonChart(canvasId, plants) {
    destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas || !window.Chart) return null;

    const sorted = [...plants].sort((a, b) => b.todayGenMWh - a.todayGenMWh);
    const labels = sorted.map(p => p.name.length > 18 ? p.name.substring(0, 16) + '...' : p.name);
    const values = sorted.map(p => p.todayGenMWh);
    const bgColors = sorted.map(p => {
      if (p.type === 'Solar') return colors.solarAmber;
      if (p.type === 'Wind') return colors.accentCyan;
      return colors.purple;
    });

    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: "Today's Energy (MWh)",
          data: values,
          backgroundColor: bgColors,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y', // horizontal bar chart
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` Generation: ${SolvantaUtils.formatNumber(ctx.raw, 1)} MWh`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            ticks: { callback: (v) => `${v} MWh` }
          },
          y: { grid: { display: false } }
        }
      }
    });

    chartInstances[canvasId] = chart;
    return chart;
  }

  // 4. Technology Mix Doughnut Chart (Solar vs Wind vs Hybrid)
  function renderTechnologyMixChart(canvasId, plants) {
    destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas || !window.Chart) return null;

    const totals = { Solar: 0, Wind: 0, Hybrid: 0 };
    plants.forEach(p => {
      if (totals[p.type] !== undefined) totals[p.type] += p.capacityMW;
    });

    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Solar', 'Wind', 'Hybrid'],
        datasets: [{
          data: [totals.Solar, totals.Wind, totals.Hybrid],
          backgroundColor: [colors.solarAmber, colors.accentCyan, colors.purple],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, padding: 14 } },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.raw} MW (${((ctx.raw / (totals.Solar + totals.Wind + totals.Hybrid)) * 100).toFixed(1)}%)`
            }
          }
        }
      }
    });

    chartInstances[canvasId] = chart;
    return chart;
  }

  // 5. Plant Operational Status Doughnut Chart
  function renderStatusDistributionChart(canvasId, plants) {
    destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas || !window.Chart) return null;

    const statuses = { Operational: 0, Degraded: 0, Maintenance: 0, Offline: 0 };
    plants.forEach(p => {
      if (statuses[p.status] !== undefined) statuses[p.status]++;
    });

    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Operational', 'Degraded', 'Maintenance', 'Offline'],
        datasets: [{
          data: [statuses.Operational, statuses.Degraded, statuses.Maintenance, statuses.Offline],
          backgroundColor: ['#10b981', '#f59e0b', '#0284c7', '#ef4444'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, padding: 14 } },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.raw} Plants`
            }
          }
        }
      }
    });

    chartInstances[canvasId] = chart;
    return chart;
  }

  // 6. BESS Real-Time Dispatch & SoC Profile Dual Chart
  function renderBessDispatchChart(canvasId, diurnalData) {
    destroyChart(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas || !window.Chart) return null;

    const ctx = canvas.getContext('2d');
    const labels = diurnalData.map(d => d.time);
    const powerData = diurnalData.map(d => d.powerMW);
    const socData = diurnalData.map(d => d.socPercent);

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            type: 'bar',
            label: 'Net Power Dispatch (MW)',
            data: powerData,
            backgroundColor: powerData.map(v => v >= 0 ? 'rgba(16, 185, 129, 0.75)' : 'rgba(2, 132, 199, 0.75)'),
            borderColor: powerData.map(v => v >= 0 ? '#10b981' : '#0284c7'),
            borderWidth: 1.5,
            yAxisID: 'yPower',
            order: 2
          },
          {
            type: 'line',
            label: 'State of Charge (SoC %)',
            data: socData,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: false,
            tension: 0.35,
            borderWidth: 2.5,
            pointRadius: 2,
            pointHoverRadius: 5,
            yAxisID: 'ySoc',
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { family: 'Plus Jakarta Sans', size: 12 }, boxWidth: 12 }
          },
          tooltip: {
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => {
                if (ctx.dataset.yAxisID === 'yPower') {
                  const val = ctx.raw;
                  return val >= 0
                    ? ` Discharging: +${val} MW (Peak Export)`
                    : ` Charging: ${val} MW (Solar Soak)`;
                }
                return ` State of Charge: ${ctx.raw}%`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 10 }, maxRotation: 45 }
          },
          yPower: {
            type: 'linear',
            position: 'left',
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            title: { display: true, text: 'MW (Discharge + / Charge -)', font: { size: 10, weight: 600 } },
            ticks: { callback: (v) => `${v} MW` }
          },
          ySoc: {
            type: 'linear',
            position: 'right',
            min: 0,
            max: 100,
            grid: { display: false },
            title: { display: true, text: 'SoC %', font: { size: 10, weight: 600 } },
            ticks: { callback: (v) => `${v}%` }
          }
        }
      }
    });

    chartInstances[canvasId] = chart;
    return chart;
  }

  return {
    destroyChart,
    renderGenerationTrendChart,
    renderMonthlyComparisonChart,
    renderPlantComparisonChart,
    renderTechnologyMixChart,
    renderStatusDistributionChart,
    renderBessDispatchChart
  };
})();
