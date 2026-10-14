/**
 * ABHIVANTA - Dashboard Overview Controller
 * Connects underlying plant dataset to KPI cards, interactive Chart.js charts,
 * alert streams, and instant PDF report export.
 */

document.addEventListener('DOMContentLoaded', () => {
  let activeTechFilter = 'ALL';
  let activeStateFilter = 'ALL';
  let trendViewMode = '30days'; // '30days' or 'hourly'

  function initDashboard() {
    renderKPIs();
    renderCharts();
    renderRankingTable();
    renderAlertsStream();
    setupEventListeners();
  }

  function getFilteredPlants() {
    let plants = AbhivantaStorage.getPlants();
    if (activeTechFilter !== 'ALL') {
      plants = plants.filter(p => p.type === activeTechFilter);
    }
    if (activeStateFilter !== 'ALL') {
      plants = plants.filter(p => p.state === activeStateFilter);
    }
    return plants;
  }

  // Calculate and update 8 KPI Cards
  function renderKPIs() {
    const plants = getFilteredPlants();
    const settings = AbhivantaStorage.getSettings();

    const totalPlants = plants.length;
    const operationalCount = plants.filter(p => p.status === 'Operational').length;
    const totalCapacityMW = plants.reduce((acc, p) => acc + (p.capacityMW || 0), 0);
    const todayGenMWh = plants.reduce((acc, p) => acc + (p.todayGenMWh || 0), 0);
    const monthGenMWh = plants.reduce((acc, p) => acc + (p.monthGenMWh || 0), 0);

    // Weighted Performance Ratio
    let weightedPR = 0;
    if (totalCapacityMW > 0) {
      weightedPR = plants.reduce((acc, p) => acc + (p.performanceRatio * p.capacityMW), 0) / totalCapacityMW;
    }

    // Weighted Availability
    let weightedAvail = 0;
    if (totalCapacityMW > 0) {
      weightedAvail = plants.reduce((acc, p) => acc + (p.availability * p.capacityMW), 0) / totalCapacityMW;
    }

    // Revenue in INR
    const totalRevenueINR = plants.reduce((acc, p) => {
      const tariff = p.tariffINR || 3.30;
      return acc + (p.todayGenMWh * 1000 * tariff);
    }, 0);

    // CO2 Avoided in Tonnes
    const factor = settings.emissionsFactor || 0.82;
    const co2Tonnes = todayGenMWh * factor;

    // Update DOM
    const elTotalPlants = document.getElementById('kpi-total-plants');
    const elOpPlants = document.getElementById('kpi-operational-plants');
    const elTotalCapacity = document.getElementById('kpi-total-capacity');
    const elTodayGen = document.getElementById('kpi-today-gen');
    const elMonthGen = document.getElementById('kpi-month-gen');
    const elAvgPR = document.getElementById('kpi-avg-pr');
    const elAvail = document.getElementById('kpi-availability');
    const elRevenue = document.getElementById('kpi-revenue');
    const elCO2 = document.getElementById('kpi-co2');

    if (elTotalPlants) elTotalPlants.textContent = totalPlants;
    if (elOpPlants) elOpPlants.textContent = `${operationalCount} Operational`;
    if (elTotalCapacity) elTotalCapacity.textContent = `${AbhivantaUtils.formatNumber(totalCapacityMW, 0)} MW`;
    if (elTodayGen) elTodayGen.textContent = `${AbhivantaUtils.formatNumber(todayGenMWh, 1)} MWh`;
    if (elMonthGen) elMonthGen.textContent = `${(monthGenMWh / 1000).toFixed(1)}k MWh`;
    if (elAvgPR) elAvgPR.textContent = AbhivantaUtils.formatPercent(weightedPR, 1);
    if (elAvail) elAvail.textContent = AbhivantaUtils.formatPercent(weightedAvail, 1);
    if (elRevenue) {
      const cr = totalRevenueINR / 10000000;
      elRevenue.textContent = `₹${cr.toFixed(2)} Cr`;
    }
    if (elCO2) elCO2.textContent = `${AbhivantaUtils.formatNumber(co2Tonnes, 0)} T`;
  }

  // Render Charts
  function renderCharts() {
    const plants = getFilteredPlants();
    const store = AbhivantaStorage.getStore();

    // 1. Generation Trend
    if (trendViewMode === '30days') {
      const history30 = store.history30Days || AbhivantaDemoData.generate30DaysHistory();
      AbhivantaCharts.renderGenerationTrendChart('generationTrendChart', history30, false);
      const titleEl = document.getElementById('trend-chart-title');
      if (titleEl) titleEl.textContent = '30-Day Fleet Generation Profile';
    } else {
      // Aggregate hourly curve across selected plants
      const hourlyAgg = [];
      for (let h = 0; h < 24; h++) {
        const timeLabel = `${String(h).padStart(2, '0')}:00`;
        let totalHGenKW = 0;
        plants.forEach(p => {
          const pCurve = AbhivantaDemoData.generateHourlyCurve(p);
          if (pCurve[h]) totalHGenKW += pCurve[h].generationKW;
        });
        hourlyAgg.push({
          time: timeLabel,
          generationKW: totalHGenKW,
          generationMWh: +(totalHGenKW / 1000).toFixed(2)
        });
      }
      AbhivantaCharts.renderGenerationTrendChart('generationTrendChart', hourlyAgg, true);
      const titleEl = document.getElementById('trend-chart-title');
      if (titleEl) titleEl.textContent = "Today's Diurnal Generation Curve (Hourly)";
    }

    // 2. Technology Mix Doughnut
    AbhivantaCharts.renderTechnologyMixChart('technologyMixChart', plants);

    // 3. Plant-Wise Generation Bar
    AbhivantaCharts.renderPlantComparisonChart('plantComparisonChart', plants);

    // 4. Monthly Actual vs Target Bar
    const monthlyData = store.monthlyHistory || AbhivantaDemoData.monthlyHistory;
    AbhivantaCharts.renderMonthlyComparisonChart('monthlyComparisonChart', monthlyData);
  }

  // Plant Ranking Table (Top performers & Underperformers)
  function renderRankingTable() {
    const tbody = document.getElementById('plant-ranking-tbody');
    if (!tbody) return;

    const plants = getFilteredPlants();
    const sorted = [...plants].sort((a, b) => b.performanceRatio - a.performanceRatio);

    if (sorted.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No matching plants found for selected filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = sorted.slice(0, 5).map(p => `
      <tr>
        <td>
          <div style="font-weight:600; color:#0f172a;">${AbhivantaUtils.escapeHtml(p.name)}</div>
          <div style="font-size:11px; color:#64748b;">${AbhivantaUtils.escapeHtml(p.id)} &bull; ${AbhivantaUtils.escapeHtml(p.state)}</div>
        </td>
        <td>${AbhivantaUI.getTypeBadge(p.type)}</td>
        <td style="font-family:var(--font-mono); font-weight:600;">${p.capacityMW} MW</td>
        <td>
          <span style="font-weight:700; color:${p.performanceRatio >= 80 ? '#10b981' : '#f59e0b'};">
            ${p.performanceRatio}%
          </span>
        </td>
        <td>${AbhivantaUI.getStatusBadge(p.status)}</td>
      </tr>
    `).join('');
  }

  // Alerts stream on dashboard
  function renderAlertsStream() {
    const container = document.getElementById('dashboard-alerts-list');
    if (!container) return;

    const alerts = AbhivantaStorage.getAlerts().slice(0, 4);
    if (alerts.length === 0) {
      container.innerHTML = `<div class="empty-state-desc" style="padding:16px;">All systems normal. No active operational alerts.</div>`;
      return;
    }

    container.innerHTML = alerts.map(a => {
      let iconClass = 'alert-low';
      if (a.severity === 'Critical') iconClass = 'alert-critical';
      else if (a.severity === 'High') iconClass = 'alert-high';
      else if (a.severity === 'Medium') iconClass = 'alert-medium';

      return `
        <div class="activity-item">
          <div class="activity-icon ${iconClass}">
            <i data-lucide="alert-circle" style="width:16px;height:16px;"></i>
          </div>
          <div class="activity-details">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="activity-title">${AbhivantaUtils.escapeHtml(a.category)}</span>
              <span class="badge ${a.status === 'Open' ? 'badge-danger' : 'badge-warning'}" style="font-size:10px; padding:1px 6px;">
                ${a.status}
              </span>
            </div>
            <div class="activity-desc">${AbhivantaUtils.escapeHtml(a.message)}</div>
            <div class="activity-time">${AbhivantaUtils.escapeHtml(a.plantName)} &bull; ${AbhivantaUtils.getRelativeTime(a.timestamp)}</div>
          </div>
        </div>
      `;
    }).join('');

    AbhivantaUI.initIcons();
  }

  // Event Listeners
  function setupEventListeners() {
    const techSelect = document.getElementById('filter-tech-select');
    if (techSelect) {
      techSelect.addEventListener('change', (e) => {
        activeTechFilter = e.target.value;
        renderKPIs();
        renderCharts();
        renderRankingTable();
      });
    }

    const stateSelect = document.getElementById('filter-state-select');
    if (stateSelect) {
      stateSelect.addEventListener('change', (e) => {
        activeStateFilter = e.target.value;
        renderKPIs();
        renderCharts();
        renderRankingTable();
      });
    }

    // Trend view toggle
    const btn30 = document.getElementById('btn-view-30days');
    const btnHourly = document.getElementById('btn-view-hourly');
    if (btn30 && btnHourly) {
      btn30.addEventListener('click', () => {
        trendViewMode = '30days';
        btn30.classList.add('active');
        btnHourly.classList.remove('active');
        renderCharts();
      });
      btnHourly.addEventListener('click', () => {
        trendViewMode = 'hourly';
        btnHourly.classList.add('active');
        btn30.classList.remove('active');
        renderCharts();
      });
    }

    // Refresh metrics button
    const refreshBtn = document.getElementById('refresh-dashboard-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        AbhivantaUI.toast('Synchronizing telemetry stream from virtual RTUs...', 'info', 'Telemetry Sync', 2000);
        setTimeout(() => {
          renderKPIs();
          renderCharts();
          renderRankingTable();
          renderAlertsStream();
          AbhivantaUI.toast('Dashboard metrics updated with latest virtual readings.', 'success');
        }, 500);
      });
    }

    // Export Dashboard PDF Button
    const exportPdfBtn = document.getElementById('export-dashboard-pdf-btn');
    if (exportPdfBtn) {
      exportPdfBtn.addEventListener('click', () => {
        const plants = getFilteredPlants();
        const totalCap = plants.reduce((acc, p) => acc + p.capacityMW, 0);
        const todayGen = plants.reduce((acc, p) => acc + p.todayGenMWh, 0);
        const avgPR = plants.reduce((acc, p) => acc + (p.performanceRatio * p.capacityMW), 0) / (totalCap || 1);
        const avgAvail = plants.reduce((acc, p) => acc + (p.availability * p.capacityMW), 0) / (totalCap || 1);
        const rev = plants.reduce((acc, p) => acc + (p.todayGenMWh * 1000 * (p.tariffINR || 3.3)), 0);
        const co2 = todayGen * 0.82;

        const tableRows = plants.map(p => [
          p.name,
          p.type,
          `${p.capacityMW} MW`,
          `${AbhivantaUtils.formatNumber(p.todayGenMWh, 1)} MWh`,
          `${AbhivantaUtils.calculateCUF(p.todayGenMWh, p.capacityMW).toFixed(1)}%`,
          `${p.performanceRatio}%`,
          p.status
        ]);

        AbhivantaPDF.generateReportPDF({
          title: 'EXECUTIVE FLEET DASHBOARD SUMMARY',
          reportType: 'Portfolio Overview',
          plantName: `Fleet Scope (${plants.length} Plants)`,
          period: AbhivantaUtils.formatDate(new Date()),
          capacityMW: totalCap,
          preparedBy: 'Aditya Sharma (Operations Lead)',
          kpis: [
            { label: 'Fleet Generation Today', value: `${AbhivantaUtils.formatNumber(todayGen, 1)} MWh` },
            { label: 'Fleet Capacity', value: `${totalCap} MW` },
            { label: 'Weighted Performance Ratio', value: `${avgPR.toFixed(1)}%` },
            { label: 'Fleet Availability', value: `${avgAvail.toFixed(1)}%` },
            { label: 'Est. Revenue Today', value: `₹${(rev / 10000000).toFixed(2)} Cr` },
            { label: 'CO2 Avoidance Today', value: `${AbhivantaUtils.formatNumber(co2, 0)} Tonnes` }
          ],
          tableHeaders: ['Plant Name', 'Type', 'Capacity', 'Gen (MWh)', 'CUF %', 'PR %', 'Status'],
          tableRows: tableRows,
          observations: [
            `Evaluated ${plants.length} renewable generation facilities across active regional zones.`,
            `Fleet weighted PR of ${avgPR.toFixed(1)}% satisfies standard commercial tariff performance guarantees.`,
            'All SCADA parameters within nominal thresholds. Recommended automated periodic dispatch.'
          ]
        });
      });
    }
  }

  initDashboard();
});
