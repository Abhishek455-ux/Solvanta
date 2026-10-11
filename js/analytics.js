/**
 * SOLVANTA - Analytics Controller
 * Implements CUF, PR, actual vs target variance analysis, multi-axis Chart.js visualizations,
 * data table rendering, and spreadsheet exports.
 */

document.addEventListener('DOMContentLoaded', () => {
  let selectedPlantId = 'ALL';
  let selectedTimeframe = 'monthly'; // 'daily' or 'monthly'
  let currentTableData = [];

  const plantSelect = document.getElementById('analytics-plant-select');
  const timeframeSelect = document.getElementById('analytics-timeframe-select');

  function initAnalytics() {
    populatePlantSelect();
    renderAnalytics();
    setupEventListeners();
  }

  function populatePlantSelect() {
    if (!plantSelect) return;
    const plants = SolvantaStorage.getPlants();
    plants.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.id} — ${p.name} (${p.capacityMW} MW ${p.type})`;
      plantSelect.appendChild(opt);
    });
  }

  function getAnalyticsDataset() {
    const store = SolvantaStorage.getStore();
    const plants = SolvantaStorage.getPlants();
    const totalFleetCap = plants.reduce((sum, p) => sum + p.capacityMW, 0) || 1;

    let targetPlant = null;
    let capRatio = 1.0;
    let tariff = 3.30;

    if (selectedPlantId !== 'ALL') {
      targetPlant = SolvantaStorage.getPlant(selectedPlantId);
      if (targetPlant) {
        capRatio = targetPlant.capacityMW / totalFleetCap;
        tariff = targetPlant.tariffINR || 3.30;
      }
    }

    if (selectedTimeframe === 'monthly') {
      const rawMonthly = store.monthlyHistory || SolvantaDemoData.monthlyHistory;
      return rawMonthly.map(item => {
        const actual = +(item.actualMWh * capRatio).toFixed(1);
        const target = +(item.targetMWh * capRatio).toFixed(1);
        const hoursInMonth = 730; // avg hours
        const plantCap = targetPlant ? targetPlant.capacityMW : totalFleetCap;
        const cuf = +((actual / (plantCap * hoursInMonth)) * 100).toFixed(1);
        const rev = actual * 1000 * tariff;
        const co2 = +(actual * 0.82).toFixed(1);

        return {
          period: item.month,
          actualMWh: actual,
          targetMWh: target,
          variancePercent: +(((actual - target) / target) * 100).toFixed(1),
          prPercent: item.pr,
          cufPercent: cuf,
          revenueINR: rev,
          co2Tonnes: co2
        };
      });
    } else {
      // Daily 30 days
      const raw30 = store.history30Days || SolvantaDemoData.generate30DaysHistory();
      return raw30.map(item => {
        const actual = +(item.totalMWh * capRatio).toFixed(1);
        const target = +(item.targetMWh * capRatio).toFixed(1);
        const plantCap = targetPlant ? targetPlant.capacityMW : totalFleetCap;
        const cuf = +((actual / (plantCap * 24)) * 100).toFixed(1);
        const rev = actual * 1000 * tariff;
        const co2 = +(actual * 0.82).toFixed(1);

        return {
          period: item.label,
          actualMWh: actual,
          targetMWh: target,
          variancePercent: +(((actual - target) / target) * 100).toFixed(1),
          prPercent: item.avgPR,
          cufPercent: cuf,
          revenueINR: rev,
          co2Tonnes: co2
        };
      });
    }
  }

  function renderAnalytics() {
    const data = getAnalyticsDataset();
    currentTableData = data;

    // 1. KPI Aggregates
    const totalGen = data.reduce((sum, d) => sum + d.actualMWh, 0);
    const avgCUF = data.reduce((sum, d) => sum + d.cufPercent, 0) / data.length;
    const avgPR = data.reduce((sum, d) => sum + d.prPercent, 0) / data.length;
    const totalRev = data.reduce((sum, d) => sum + d.revenueINR, 0);

    const elGen = document.getElementById('ana-cumulative-gen');
    const elCUF = document.getElementById('ana-avg-cuf');
    const elPR = document.getElementById('ana-avg-pr');
    const elRev = document.getElementById('ana-revenue');

    if (elGen) elGen.textContent = `${(totalGen / 1000).toFixed(1)}k MWh`;
    if (elCUF) elCUF.textContent = `${avgCUF.toFixed(1)}%`;
    if (elPR) elPR.textContent = `${avgPR.toFixed(1)}%`;
    if (elRev) {
      const cr = totalRev / 10000000;
      elRev.textContent = `₹${cr.toFixed(2)} Cr`;
    }

    // 2. Render Charts
    renderBarComparisonChart(data);
    renderEfficiencyLineChart(data);

    // 3. Render Data Table
    renderDataTable(data);
  }

  function renderBarComparisonChart(data) {
    SolvantaCharts.destroyChart('analyticsGenChart');
    const canvas = document.getElementById('analyticsGenChart');
    if (!canvas || !window.Chart) return;

    const ctx = canvas.getContext('2d');
    const labels = data.map(d => d.period);
    const actual = data.map(d => d.actualMWh);
    const target = data.map(d => d.targetMWh);

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Actual Energy (MWh)',
            data: actual,
            backgroundColor: '#10b981',
            borderRadius: 5
          },
          {
            label: 'Target Baseline (MWh)',
            data: target,
            backgroundColor: '#94a3b8',
            borderRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12 } },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${SolvantaUtils.formatNumber(ctx.raw, 1)} MWh`
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
  }

  function renderEfficiencyLineChart(data) {
    SolvantaCharts.destroyChart('analyticsEfficiencyChart');
    const canvas = document.getElementById('analyticsEfficiencyChart');
    if (!canvas || !window.Chart) return;

    const ctx = canvas.getContext('2d');
    const labels = data.map(d => d.period);
    const prData = data.map(d => d.prPercent);
    const cufData = data.map(d => d.cufPercent);

    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Performance Ratio PR (%)',
            data: prData,
            borderColor: '#6d28d9',
            backgroundColor: 'rgba(109, 40, 217, 0.1)',
            fill: false,
            tension: 0.3,
            borderWidth: 2.5,
            pointRadius: 3
          },
          {
            label: 'Capacity Utilization CUF (%)',
            data: cufData,
            borderColor: '#0284c7',
            backgroundColor: 'rgba(2, 132, 199, 0.1)',
            fill: false,
            tension: 0.3,
            borderWidth: 2.5,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12 } },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}%`
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            ticks: { callback: (v) => `${v}%` }
          }
        }
      }
    });
  }

  function renderDataTable(data) {
    const thead = document.getElementById('analytics-table-header');
    const tbody = document.getElementById('analytics-table-tbody');
    if (!thead || !tbody) return;

    thead.innerHTML = `
      <th>Period</th>
      <th>Actual (MWh)</th>
      <th>Target (MWh)</th>
      <th>Variance (%)</th>
      <th>CUF (%)</th>
      <th>PR (%)</th>
      <th>Revenue (INR)</th>
      <th>CO₂ Avoided (T)</th>
    `;

    tbody.innerHTML = data.map(d => `
      <tr>
        <td style="font-weight:600; color:#0f172a;">${SolvantaUtils.escapeHtml(d.period)}</td>
        <td style="font-family:var(--font-mono); font-weight:600;">${SolvantaUtils.formatNumber(d.actualMWh, 1)}</td>
        <td style="font-family:var(--font-mono); color:#64748b;">${SolvantaUtils.formatNumber(d.targetMWh, 1)}</td>
        <td>
          <span style="font-weight:700; color:${d.variancePercent >= 0 ? '#10b981' : '#ef4444'};">
            ${d.variancePercent >= 0 ? '+' : ''}${d.variancePercent}%
          </span>
        </td>
        <td style="font-family:var(--font-mono);">${d.cufPercent}%</td>
        <td style="font-family:var(--font-mono); font-weight:700; color:${d.prPercent >= 80 ? '#10b981' : '#f59e0b'};">
          ${d.prPercent}%
        </td>
        <td style="font-family:var(--font-mono);">${SolvantaUtils.formatINR(d.revenueINR)}</td>
        <td style="font-family:var(--font-mono);">${SolvantaUtils.formatNumber(d.co2Tonnes, 0)}</td>
      </tr>
    `).join('');
  }

  function setupEventListeners() {
    if (plantSelect) {
      plantSelect.addEventListener('change', (e) => {
        selectedPlantId = e.target.value;
        renderAnalytics();
      });
    }

    if (timeframeSelect) {
      timeframeSelect.addEventListener('change', (e) => {
        selectedTimeframe = e.target.value;
        renderAnalytics();
      });
    }

    // Export buttons
    const exportExcelBtn = document.getElementById('export-analytics-btn');
    if (exportExcelBtn) {
      exportExcelBtn.addEventListener('click', () => {
        const headers = ['Period', 'Actual (MWh)', 'Target (MWh)', 'Variance (%)', 'CUF (%)', 'PR (%)', 'Revenue (INR)', 'CO2 Avoided (T)'];
        const rows = currentTableData.map(d => [
          d.period,
          d.actualMWh,
          d.targetMWh,
          `${d.variancePercent}%`,
          `${d.cufPercent}%`,
          `${d.prPercent}%`,
          Math.round(d.revenueINR),
          d.co2Tonnes
        ]);
        SolvantaExport.exportToExcel('Energy Analytics', headers, rows, 'Solvanta_Energy_Analytics');
      });
    }

    const exportCsvBtn = document.getElementById('export-table-btn');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        const headers = ['Period', 'Actual (MWh)', 'Target (MWh)', 'Variance (%)', 'CUF (%)', 'PR (%)', 'Revenue (INR)', 'CO2 Avoided (T)'];
        const rows = currentTableData.map(d => [
          d.period,
          d.actualMWh,
          d.targetMWh,
          `${d.variancePercent}%`,
          `${d.cufPercent}%`,
          `${d.prPercent}%`,
          Math.round(d.revenueINR),
          d.co2Tonnes
        ]);
        SolvantaExport.exportToCSV(headers, rows, 'Solvanta_Analytics_Data.csv');
      });
    }
  }

  initAnalytics();
});
