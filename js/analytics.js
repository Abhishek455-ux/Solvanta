/**
 * ABHIVANTA - Analytics Controller
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
    const plants = AbhivantaStorage.getPlants();
    plants.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.id} — ${p.name} (${p.capacityMW} MW ${p.type})`;
      plantSelect.appendChild(opt);
    });
  }

  function getAnalyticsDataset() {
    const store = AbhivantaStorage.getStore();
    const plants = AbhivantaStorage.getPlants();
    const totalFleetCap = plants.reduce((sum, p) => sum + p.capacityMW, 0) || 1;

    let targetPlant = null;
    let capRatio = 1.0;
    let tariff = 3.30;

    if (selectedPlantId !== 'ALL') {
      targetPlant = AbhivantaStorage.getPlant(selectedPlantId);
      if (targetPlant) {
        capRatio = targetPlant.capacityMW / totalFleetCap;
        tariff = targetPlant.tariffINR || 3.30;
      }
    }

    if (selectedTimeframe === 'monthly') {
      const rawMonthly = store.monthlyHistory || AbhivantaDemoData.monthlyHistory;
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
      const raw30 = store.history30Days || AbhivantaDemoData.generate30DaysHistory();
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
    AbhivantaCharts.destroyChart('analyticsGenChart');
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
              label: (ctx) => ` ${ctx.dataset.label}: ${AbhivantaUtils.formatNumber(ctx.raw, 1)} MWh`
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
    AbhivantaCharts.destroyChart('analyticsEfficiencyChart');
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
        <td style="font-weight:600; color:#0f172a;">${AbhivantaUtils.escapeHtml(d.period)}</td>
        <td style="font-family:var(--font-mono); font-weight:600;">${AbhivantaUtils.formatNumber(d.actualMWh, 1)}</td>
        <td style="font-family:var(--font-mono); color:#64748b;">${AbhivantaUtils.formatNumber(d.targetMWh, 1)}</td>
        <td>
          <span style="font-weight:700; color:${d.variancePercent >= 0 ? '#10b981' : '#ef4444'};">
            ${d.variancePercent >= 0 ? '+' : ''}${d.variancePercent}%
          </span>
        </td>
        <td style="font-family:var(--font-mono);">${d.cufPercent}%</td>
        <td style="font-family:var(--font-mono); font-weight:700; color:${d.prPercent >= 80 ? '#10b981' : '#f59e0b'};">
          ${d.prPercent}%
        </td>
        <td style="font-family:var(--font-mono);">${AbhivantaUtils.formatINR(d.revenueINR)}</td>
        <td style="font-family:var(--font-mono);">${AbhivantaUtils.formatNumber(d.co2Tonnes, 0)}</td>
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
        AbhivantaExport.exportToExcel('Energy Analytics', headers, rows, 'Abhivanta_Energy_Analytics');
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
        AbhivantaExport.exportToCSV(headers, rows, 'Abhivanta_Analytics_Data.csv');
      });
    }
  }

  
  // ==========================================
  // PREDICTIVE AI ASSET HEALTH & APM MODULES
  // ==========================================

  function initInverterHealthGrid() {
    const grid = document.getElementById('inverter-health-grid');
    if (!grid) return;

    const inverters = [
      { id: 'INV-01', temp: 58.2, status: 'Nominal', color: '#10b981' },
      { id: 'INV-02', temp: 61.5, status: 'Nominal', color: '#10b981' },
      { id: 'INV-03', temp: 59.8, status: 'Nominal', color: '#10b981' },
      { id: 'INV-04', temp: 92.4, status: 'Thermal Stress', color: '#f59e0b', alert: true },
      { id: 'INV-05', temp: 63.0, status: 'Nominal', color: '#10b981' },
      { id: 'INV-06', temp: 60.4, status: 'Nominal', color: '#10b981' },
      { id: 'INV-07', temp: 57.9, status: 'Nominal', color: '#10b981' },
      { id: 'INV-08', temp: 62.1, status: 'Nominal', color: '#10b981' },
    ];

    grid.innerHTML = inverters.map(inv => `
      <div style="background:${inv.alert ? '#fffbeb' : '#f8fafc'}; border:1px solid ${inv.alert ? '#fde68a' : 'var(--border-light)'}; border-radius:6px; padding:8px; text-align:center;">
        <div style="font-size:11px; font-weight:700; color:#0f172a;">${inv.id}</div>
        <div style="font-size:14px; font-weight:800; color:${inv.color}; font-family:var(--font-mono); margin:2px 0;">${inv.temp}&deg;C</div>
        <div style="font-size:9px; color:${inv.color}; font-weight:600;">${inv.status}</div>
      </div>
    `).join('');

    const fixBtn = document.getElementById('btn-fix-inv4');
    if (fixBtn) {
      fixBtn.addEventListener('click', () => {
        fixBtn.innerHTML = '<i data-lucide="check"></i> Work Order #WO-8941 Dispatched';
        fixBtn.classList.remove('btn-warning');
        fixBtn.classList.add('btn-emerald');
        alert('Dispatched Automated Work Order #WO-8941 to O&M Field Lead: "Clear heatsink intake & inspect IGBT fan unit on INV-04"');
        if (window.lucide) lucide.createIcons();
      });
    }
  }

  let ivChartInstance = null;
  function initIVCurveChart() {
    const canvas = document.getElementById('ivCurveChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const select = document.getElementById('iv-string-select');
    const diagStatus = document.getElementById('iv-diag-status');
    const diagMeta = document.getElementById('iv-diag-meta');

    // Generate I-V Curves
    function generateIVData(type) {
      const voltages = [];
      const currents = [];

      for (let v = 0; v <= 840; v += 35) {
        voltages.push(v);
        let i = 13.8;
        if (type === 'nominal') {
          // Healthy curve: flat until near Voc
          if (v < 700) {
            i = 13.8 - (v * 0.001);
          } else {
            i = Math.max(0, 13.8 * (1 - Math.exp((v - 840) / 32)));
          }
        } else if (type === 'pid') {
          // PID degradation: heavy slope & lower knee
          i = Math.max(0, (13.8 - (v * 0.005)) * (1 - Math.exp((v - 790) / 45)));
        } else if (type === 'diode') {
          // Bypassed diode: double knee step
          if (v < 540) {
            i = 13.8 - (v * 0.001);
          } else if (v < 580) {
            i = 8.5; // step drop
          } else {
            i = Math.max(0, 8.5 * (1 - Math.exp((v - 810) / 35)));
          }
        } else if (type === 'soiled') {
          // Dust soiling: uniformly lowered current
          if (v < 700) {
            i = 10.4 - (v * 0.001);
          } else {
            i = Math.max(0, 10.4 * (1 - Math.exp((v - 835) / 32)));
          }
        }
        currents.push(+i.toFixed(2));
      }
      return { voltages, currents };
    }

    const initial = generateIVData('nominal');

    ivChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: initial.voltages,
        datasets: [{
          label: 'Current (A)',
          data: initial.currents,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.25,
          borderWidth: 2.5,
          pointRadius: 2,
          pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: function(items) { return 'Voltage: ' + items[0].label + ' V'; },
              label: function(item) { return 'Current: ' + item.parsed.y + ' A'; }
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Voltage (V)', font: { size: 10, family: 'monospace' } },
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            ticks: { font: { size: 9, family: 'monospace' } }
          },
          y: {
            title: { display: true, text: 'Current (A)', font: { size: 10, family: 'monospace' } },
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            ticks: { font: { size: 9, family: 'monospace' } },
            suggestedMin: 0,
            suggestedMax: 16
          }
        }
      }
    });

    if (select) {
      select.addEventListener('change', (e) => {
        const val = e.target.value;
        const res = generateIVData(val);
        ivChartInstance.data.labels = res.voltages;
        ivChartInstance.data.datasets[0].data = res.currents;

        if (val === 'nominal') {
          ivChartInstance.data.datasets[0].borderColor = '#10b981';
          ivChartInstance.data.datasets[0].backgroundColor = 'rgba(16, 185, 129, 0.1)';
          if (diagStatus) { diagStatus.textContent = 'Nominal Curve (FF: 81.2%)'; diagStatus.style.color = '#059669'; }
          if (diagMeta) diagMeta.textContent = 'Voc: 840V • Isc: 13.8A • Pmax: 9.4 kW';
        } else if (val === 'pid') {
          ivChartInstance.data.datasets[0].borderColor = '#ef4444';
          ivChartInstance.data.datasets[0].backgroundColor = 'rgba(239, 68, 68, 0.1)';
          if (diagStatus) { diagStatus.textContent = 'Potential Induced Degradation (PID Alert)'; diagStatus.style.color = '#dc2626'; }
          if (diagMeta) diagMeta.textContent = 'Voc: 790V (-6.0%) • Shunt Resistor Leakage • Loss: -18.4%';
        } else if (val === 'diode') {
          ivChartInstance.data.datasets[0].borderColor = '#f59e0b';
          ivChartInstance.data.datasets[0].backgroundColor = 'rgba(245, 158, 11, 0.1)';
          if (diagStatus) { diagStatus.textContent = 'Bypass Diode Step Conductance Drop'; diagStatus.style.color = '#d97706'; }
          if (diagMeta) diagMeta.textContent = 'Sub-string bypassed • Mismatch Loss: -38.4%';
        } else if (val === 'soiled') {
          ivChartInstance.data.datasets[0].borderColor = '#d97706';
          ivChartInstance.data.datasets[0].backgroundColor = 'rgba(217, 119, 6, 0.1)';
          if (diagStatus) { diagStatus.textContent = 'Uniform Dust Soiling Attenuation'; diagStatus.style.color = '#b45309'; }
          if (diagMeta) diagMeta.textContent = 'Isc: 10.4A (-24.6%) • Recommended: Wash Cycle';
        }
        ivChartInstance.update();
      });
    }
  }

  function initSoilingScheduler() {
    const dispatchBtn = document.getElementById('btn-dispatch-robots');
    if (!dispatchBtn) return;

    dispatchBtn.addEventListener('click', () => {
      dispatchBtn.innerHTML = '<i data-lucide="check-circle-2"></i> Robotic Fleet Dispatched to Block C';
      dispatchBtn.classList.remove('btn-emerald');
      dispatchBtn.classList.add('btn-primary');
      alert('Success: Dispatched 4 Ecoppia T4 waterless robotic cleaning crawlers to Block C (Khavda). Estimated recovery: +3.8 MW generation yield.');
      if (window.lucide) lucide.createIcons();
    });
  }

  initInverterHealthGrid();
  initIVCurveChart();
  initSoilingScheduler();
  initAnalytics();
});
