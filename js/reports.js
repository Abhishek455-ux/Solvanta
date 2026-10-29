/**
 * ABHIVANTA - Report Center Controller
 * Powers 6 automated report templates, live A4 document preview sheet,
 * client-side PDF export (jsPDF), Excel export (SheetJS), and report history archive.
 */

document.addEventListener('DOMContentLoaded', () => {
  const templateSelect = document.getElementById('report-template-select');
  const plantSelect = document.getElementById('report-plant-select');
  const periodInput = document.getElementById('report-period-input');
  const titleInput = document.getElementById('report-title-input');
  const authorInput = document.getElementById('report-author-input');

  // Check URL params for pre-selected plant
  const urlParams = new URLSearchParams(window.location.search);
  const paramPlantId = urlParams.get('plantId');

  function initReportCenter() {
    populatePlantSelect();
    if (paramPlantId && AbhivantaStorage.getPlant(paramPlantId)) {
      if (plantSelect) plantSelect.value = paramPlantId;
    }
    updatePreviewSheet();
    renderReportHistory();
    setupEventListeners();
  }

  function populatePlantSelect() {
    if (!plantSelect) return;
    const plants = AbhivantaStorage.getPlants();
    plants.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.id} &bull; ${p.name} (${p.capacityMW} MW ${p.type})`;
      plantSelect.appendChild(opt);
    });
  }

  // Generate Report Configuration & Data payload
  function buildReportPayload() {
    const template = templateSelect ? templateSelect.value : 'monthly';
    const plantId = plantSelect ? plantSelect.value : 'ALL';
    const period = periodInput ? periodInput.value : 'October 2026';
    const title = titleInput ? titleInput.value : 'RENEWABLE PERFORMANCE REPORT';
    const author = authorInput ? authorInput.value : 'Aditya Sharma';

    const store = AbhivantaStorage.getStore();
    const allPlants = AbhivantaStorage.getPlants();
    const targetPlant = plantId === 'ALL' ? null : AbhivantaStorage.getPlant(plantId);

    const scopeName = targetPlant ? targetPlant.name : `Entire Fleet Portfolio (${allPlants.length} Plants)`;
    const totalCap = targetPlant ? targetPlant.capacityMW : allPlants.reduce((s, p) => s + p.capacityMW, 0);

    let kpis = [];
    let tableHeaders = [];
    let tableRows = [];
    let observations = [];

    // Template specific generation logic
    if (template === 'trading') {
      kpis = [
        { label: 'Merchant Power Traded', value: '3,840.0 MWh' },
        { label: 'Average RTM Realized', value: '₹6.42 / kWh' },
        { label: 'Merchant Gross Yield', value: '₹2.46 Crores' },
        { label: 'DSM Frequency Compliance', value: '100% CERC Band' },
        { label: 'DSM Penalties Avoided', value: '₹14.85 Lakhs' },
        { label: 'Arbitrage Margin vs PPA', value: '+₹3.62 / kWh (+129%)' }
      ];

      tableHeaders = ['Time Block (15-Min)', 'Market Segment', 'Dispatched (MW)', 'Clearing Price (₹/kWh)', 'QCA Schedule', 'DSM Status', 'Net Revenue (₹)'];
      tableRows = [
        ['Block 74 (18:15-18:30)', 'IEX RTM Spot', '15.0 MW', '₹6.42', '112.5 MW', 'Compliant (+1.5%)', '₹24,075'],
        ['Block 73 (18:00-18:15)', 'IEX RTM Spot', '15.0 MW', '₹6.38', '112.5 MW', 'Compliant (+1.4%)', '₹23,925'],
        ['Block 72 (17:45-18:00)', 'IEX G-DAM (Green)', '12.0 MW', '₹5.85', '110.0 MW', 'Compliant (+0.8%)', '₹17,550'],
        ['Block 71 (17:30-17:45)', 'IEX G-DAM (Green)', '12.0 MW', '₹5.70', '110.0 MW', 'Compliant (+0.6%)', '₹17,100'],
        ['Block 70 (17:15-17:30)', 'IEX DAM Clearing', '10.0 MW', '₹5.18', '108.0 MW', 'Compliant (+0.2%)', '₹12,950'],
        ['Block 69 (17:00-17:15)', 'IEX DAM Clearing', '10.0 MW', '₹5.12', '108.0 MW', 'Compliant (+0.1%)', '₹12,800']
      ];
    } else if (template === 'esg') {
      kpis = [
        { label: 'Clean Energy Generated', value: '2,584.3 MWh' },
        { label: 'Displaced Grid CO2 Today', value: '1,842.6 Tonnes' },
        { label: 'Monthly CO2 Abatement', value: '48,250 Tonnes' },
        { label: 'Thermal Coal Avoided', value: '735.8 kTonnes' },
        { label: 'DISCOM Banked Units', value: '485,200 kWh' },
        { label: 'Audit Standard', value: 'CEA Baseline v19 / BRSR' }
      ];

      tableHeaders = ['Operating Asset / Plant', 'Technology', 'Clean MWh Generated', 'Grid Emission Factor', 'CO2 Offset (Tonnes)', 'Offtaker / Beneficiary', 'Audit Hash'];
      tableRows = [
        ['Thar Ultra-Mega Solar (RAJ-01)', 'Bifacial Solar PV + Trackers', '895.4 MWh', '0.713 tCO2/MWh', '638.4 MT', 'C&I Open Access Steel Plant', 'SHA256: 7f8a91b...'],
        ['Bhadla Phase IV (RAJ-02)', 'Single-Axis Tracking Solar', '640.2 MWh', '0.713 tCO2/MWh', '456.5 MT', 'Automotive Manufacturing Hub', 'SHA256: 3c94d2e...'],
        ['Khavda Hybrid Renewable (GUJ-01)', 'Solar PV + Wind 4.2MW', '720.5 MWh', '0.713 tCO2/MWh', '513.7 MT', 'Data Center Campus (MUM)', 'SHA256: 9b201cf...'],
        ['Solapur Agro-PV EcoPark (MAH-01)', 'Agro-Photovoltaic Arrays', '328.2 MWh', '0.713 tCO2/MWh', '234.0 MT', 'Chemical Processing Facility', 'SHA256: 4e815aa...']
      ];
    } else if (template === 'bess') {
      const bessFleet = AbhivantaStorage.getBessFleet ? AbhivantaStorage.getBessFleet() : (AbhivantaDemoData.bessFleet || []);
      const matchedBess = targetPlant
        ? (bessFleet.find(b => b.plantId === targetPlant.id) || bessFleet[0])
        : null;

      const totalPowerMW = matchedBess ? matchedBess.ratedPowerMW : bessFleet.reduce((s, b) => s + b.ratedPowerMW, 0);
      const totalCapMWh = matchedBess ? matchedBess.ratedCapacityMWh : bessFleet.reduce((s, b) => s + b.ratedCapacityMWh, 0);
      const avgRte = matchedBess ? matchedBess.roundTripEfficiency : (bessFleet.reduce((s, b) => s + b.roundTripEfficiency, 0) / bessFleet.length).toFixed(1);
      const avgSoH = matchedBess ? matchedBess.sohPercent : (bessFleet.reduce((s, b) => s + b.sohPercent, 0) / bessFleet.length).toFixed(1);
      const totalRevINR = matchedBess ? matchedBess.todayArbitrageRevenueINR : bessFleet.reduce((s, b) => s + b.todayArbitrageRevenueINR, 0);
      const totalDischargeMWh = matchedBess ? matchedBess.dailyDischargeMWh : bessFleet.reduce((s, b) => s + b.dailyDischargeMWh, 0);

      kpis = [
        { label: 'BESS Rated Power', value: `${totalPowerMW} MW` },
        { label: 'Storage Capacity', value: `${totalCapMWh} MWh (4h LFP)` },
        { label: 'Round-Trip Efficiency', value: `${avgRte}%` },
        { label: 'State of Health (SoH)', value: `${avgSoH}%` },
        { label: 'Discharge Energy Today', value: `${AbhivantaUtils.formatNumber(totalDischargeMWh, 1)} MWh` },
        { label: 'Today Arbitrage Gain', value: AbhivantaUtils.formatINR(totalRevINR) }
      ];

      tableHeaders = ['BESS Asset ID & Name', 'Chemistry', 'Power / Cap', 'SoC %', 'RTE %', 'Dispatch Mode', 'Daily Arbitrage'];
      const rowsSource = matchedBess ? [matchedBess] : bessFleet;
      tableRows = rowsSource.map(b => [
        `${b.id} - ${b.name}`,
        b.chemistry,
        `${b.ratedPowerMW} MW / ${b.ratedCapacityMWh} MWh`,
        `${b.socPercent}%`,
        `${b.roundTripEfficiency}%`,
        b.dispatchMode,
        AbhivantaUtils.formatINR(b.todayArbitrageRevenueINR)
      ]);

      observations = [
        `Fleetwide 240 MW / 900 MWh utility storage achieved ${avgRte}% Round-Trip Efficiency (RTE) under active liquid chilling.`,
        `Mid-day solar soak absorbed ${(totalDischargeMWh * 1.12).toFixed(1)} MWh surplus generation during off-peak tariff periods.`,
        `Evening peak discharge between 18:30-22:30 IST captured top merchant tariffs, generating ${AbhivantaUtils.formatINR(totalRevINR)} incremental daily margin.`,
        `All rack BMS thermal metrics compliant (< 30°C cell temp); automated aerosol fire suppression status: Normal.`
      ];
    } else if (template === 'daily') {
      const genToday = targetPlant ? targetPlant.todayGenMWh : allPlants.reduce((s, p) => s + p.todayGenMWh, 0);
      const cuf = AbhivantaUtils.calculateCUF(genToday, totalCap, 24);
      const pr = targetPlant ? targetPlant.performanceRatio : 81.8;
      const rev = genToday * 1000 * (targetPlant ? targetPlant.tariffINR : 3.3);
      const co2 = genToday * 0.82;

      kpis = [
        { label: "Today's Generation", value: `${AbhivantaUtils.formatNumber(genToday, 1)} MWh` },
        { label: 'Plant Capacity', value: `${totalCap} MW` },
        { label: 'Daily CUF Factor', value: `${cuf.toFixed(1)}%` },
        { label: 'Performance Ratio', value: `${pr}%` },
        { label: 'Tariff Revenue', value: AbhivantaUtils.formatINR(rev) },
        { label: 'CO2 Offset Today', value: `${AbhivantaUtils.formatNumber(co2, 0)} T` }
      ];

      tableHeaders = ['Time Slot', 'Irradiance (W/m²)', 'Active Power (MW)', 'Hourly Gen (MWh)', 'Grid Freq (Hz)'];
      const hourlyData = AbhivantaDemoData.generateHourlyCurve(targetPlant || allPlants[0]);
      tableRows = hourlyData.filter((_, idx) => idx >= 6 && idx <= 18).map(h => [
        h.time,
        `${h.irradiance} W/m²`,
        `${(h.generationKW / 1000).toFixed(1)} MW`,
        `${h.generationMWh} MWh`,
        '50.02 Hz'
      ]);

      observations = [
        `Diurnal peak generation occurred at 12:30 with irradiance reaching 940 W/m².`,
        `Grid frequency remained compliant within CEA operating band (49.95 - 50.05 Hz).`,
        `No string inverter derating was observed during peak solar generation window.`
      ];
    } else if (template === 'health') {
      const openAlerts = AbhivantaStorage.getAlerts().filter(a => plantId === 'ALL' || a.plantId === plantId);
      const mntRecords = AbhivantaStorage.getMaintenance().filter(m => plantId === 'ALL' || m.plantId === plantId);

      kpis = [
        { label: 'Asset Scope', value: targetPlant ? targetPlant.type : 'Fleet' },
        { label: 'Active Inverter Ratio', value: targetPlant ? `${targetPlant.invertersActive}/${targetPlant.invertersCount}` : '98.5%' },
        { label: 'Open Alerts', value: `${openAlerts.filter(a => a.status === 'Open').length} Active` },
        { label: 'Scheduled Maintenance', value: `${mntRecords.length} Tasks` },
        { label: 'Plant Availability', value: `${targetPlant ? targetPlant.availability : 98.2}%` },
        { label: 'Mean Time Between Trips', value: '420 Hours' }
      ];

      tableHeaders = ['Record ID', 'Plant Asset', 'Category / Type', 'Severity / Priority', 'Status', 'Remediation Note'];
      tableRows = openAlerts.slice(0, 6).map(a => [
        a.id,
        a.plantName,
        a.category,
        a.severity,
        a.status,
        a.remediation
      ]);

      observations = [
        `Inverter availability meets uptime service level agreement at 98.2%.`,
        `Central Inverter INV-04 requires capacitor inspection due to recent IGBT voltage trips.`,
        `Drone thermography recommended for upcoming bi-annual preventive audit.`
      ];
    } else if (template === 'annual') {
      const yearGen = targetPlant ? targetPlant.yearGenMWh : allPlants.reduce((s, p) => s + p.yearGenMWh, 0);
      const rev = yearGen * 1000 * (targetPlant ? targetPlant.tariffINR : 3.3);
      const co2 = yearGen * 0.82;

      kpis = [
        { label: 'Annual Generation', value: `${(yearGen / 1000).toFixed(1)}k MWh` },
        { label: 'Contracted P50 Target', value: `${((yearGen * 0.98) / 1000).toFixed(1)}k MWh` },
        { label: 'Annual CUF %', value: '23.4%' },
        { label: 'Mean PR Ratio', value: '81.9%' },
        { label: 'Annual Revenue', value: `₹${(rev / 10000000).toFixed(2)} Cr` },
        { label: 'Annual CO2 Abatement', value: `${(co2 / 1000).toFixed(1)}k Tonnes` }
      ];

      tableHeaders = ['Billing Month', 'Actual Gen (MWh)', 'P50 Target (MWh)', 'CUF %', 'PR %', 'Revenue (INR)'];
      const months = store.monthlyHistory || AbhivantaDemoData.monthlyHistory;
      tableRows = months.map(m => [
        m.month,
        `${AbhivantaUtils.formatNumber(m.actualMWh, 0)}`,
        `${AbhivantaUtils.formatNumber(m.targetMWh, 0)}`,
        '23.2%',
        `${m.pr}%`,
        AbhivantaUtils.formatINR(m.revenueINR)
      ]);

      observations = [
        `Cumulative annual generation exceeded P50 contracted baseline by +2.1%.`,
        `Monsoon months (July - August) exhibited expected solar dip compensated by wind peaks.`,
        `Plant equipment degradation rate is estimated at 0.45% per annum, well below the 0.70% warranty threshold.`
      ];
    } else {
      // Default: Monthly Performance & Multi-Plant Portfolio
      const monthGen = targetPlant ? targetPlant.monthGenMWh : allPlants.reduce((s, p) => s + p.monthGenMWh, 0);
      const pr = targetPlant ? targetPlant.performanceRatio : 81.8;
      const rev = monthGen * 1000 * (targetPlant ? targetPlant.tariffINR : 3.3);
      const co2 = monthGen * 0.82;

      kpis = [
        { label: 'Monthly Generation', value: `${(monthGen / 1000).toFixed(1)}k MWh` },
        { label: 'Installed Capacity', value: `${totalCap} MW` },
        { label: 'Performance Ratio (PR)', value: `${pr}%` },
        { label: 'Operational Availability', value: `${targetPlant ? targetPlant.availability : 98.2}%` },
        { label: 'Estimated Revenue', value: `₹${(rev / 10000000).toFixed(2)} Cr` },
        { label: 'CO2 Offset Tonnes', value: `${AbhivantaUtils.formatNumber(co2, 0)} T` }
      ];

      tableHeaders = ['Plant ID & Name', 'Technology', 'Capacity', 'Month Output', 'CUF %', 'PR %', 'Status'];
      tableRows = (targetPlant ? [targetPlant] : allPlants).map(p => [
        `${p.id} - ${p.name}`,
        p.type,
        `${p.capacityMW} MW`,
        `${AbhivantaUtils.formatNumber(p.monthGenMWh, 0)} MWh`,
        `${AbhivantaUtils.calculateCUF(p.todayGenMWh, p.capacityMW).toFixed(1)}%`,
        `${p.performanceRatio}%`,
        p.status
      ]);

      observations = [
        `Portfolio performance remained steady above 80% Performance Ratio throughout October.`,
        `Bhadla Solar Complex Phase II achieved highest monthly generation at 34,180 MWh.`,
        `Sakri Solar Energy Park inverter trip is under remediation; full restitution expected within 48h.`,
        `Total clean energy exported avoids estimated ${(co2 / 1000).toFixed(2)} thousand tonnes of greenhouse emissions.`
      ];
    }

    return {
      template,
      plantId,
      plantName: scopeName,
      capacityMW: totalCap,
      period,
      title,
      preparedBy: author,
      kpis,
      tableHeaders,
      tableRows,
      observations
    };
  }

  // Update Live Document Preview Sheet DOM
  function updatePreviewSheet() {
    const p = buildReportPayload();

    const elTitle = document.getElementById('prev-doc-title');
    const elDate = document.getElementById('prev-doc-date');
    const elScope = document.getElementById('prev-plant-scope');
    const elCap = document.getElementById('prev-capacity');
    const elPeriod = document.getElementById('prev-period');
    const elAuthor = document.getElementById('prev-author');
    const elSigAuthor = document.getElementById('prev-sig-author');

    if (elTitle) elTitle.textContent = p.title;
    if (elDate) elDate.textContent = `Generated: ${AbhivantaUtils.formatDate(new Date())}`;
    if (elScope) elScope.textContent = p.plantName;
    if (elCap) elCap.textContent = `${p.capacityMW} MW`;
    if (elPeriod) elPeriod.textContent = p.period;
    if (elAuthor) elAuthor.textContent = p.preparedBy;
    if (elSigAuthor) elSigAuthor.textContent = p.preparedBy;

    // Render 6 KPI Cards in preview
    const kpiGrid = document.getElementById('prev-kpis-grid');
    if (kpiGrid) {
      kpiGrid.innerHTML = p.kpis.map(k => `
        <div style="background:#f1f5f9; border:1px solid #e2e8f0; border-radius:4px; padding:6px 8px;">
          <div style="font-size:9px; color:#64748b; text-transform:uppercase;">${AbhivantaUtils.escapeHtml(k.label)}</div>
          <div style="font-size:12px; font-weight:800; color:#0f172a; margin-top:2px;">${AbhivantaUtils.escapeHtml(k.value)}</div>
        </div>
      `).join('');
    }

    // Render Table
    const thead = document.getElementById('prev-table-thead');
    const tbody = document.getElementById('prev-table-tbody');
    if (thead && tbody) {
      thead.innerHTML = p.tableHeaders.map(h => `<th style="padding:5px 6px;">${AbhivantaUtils.escapeHtml(h)}</th>`).join('');
      tbody.innerHTML = p.tableRows.slice(0, 7).map((row, idx) => `
        <tr style="background:${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom:1px solid #e2e8f0;">
          ${row.map(cell => `<td style="padding:4px 6px; color:#334155;">${AbhivantaUtils.escapeHtml(cell)}</td>`).join('')}
        </tr>
      `).join('');
    }

    // Render Observations
    const obsList = document.getElementById('prev-observations-list');
    if (obsList) {
      obsList.innerHTML = p.observations.map(o => `<li>${AbhivantaUtils.escapeHtml(o)}</li>`).join('');
    }
  }

  // Render Report History Log
  function renderReportHistory() {
    const tbody = document.getElementById('report-history-tbody');
    if (!tbody) return;

    const reports = AbhivantaStorage.getReports();
    if (reports.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="empty-state">
            <div class="empty-state-title">No generated reports in archive</div>
            <div class="empty-state-desc">Generate your first PDF report using the controls above.</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = reports.map(r => `
      <tr>
        <td style="font-family:var(--font-mono); font-size:11px; font-weight:700; color:#0f172a;">${AbhivantaUtils.escapeHtml(r.id)}</td>
        <td style="font-weight:600;">${AbhivantaUtils.escapeHtml(r.title)}</td>
        <td><span class="badge badge-neutral">${AbhivantaUtils.escapeHtml(r.reportType)}</span></td>
        <td>${AbhivantaUtils.escapeHtml(r.plantName)}</td>
        <td>${AbhivantaUtils.escapeHtml(r.period)}</td>
        <td style="font-size:11px; color:#64748b;">${AbhivantaUtils.formatDateTime(r.generatedDate)}</td>
        <td><span class="badge badge-success" style="font-size:10px;">${r.fileFormat}</span></td>
        <td style="text-align:right; white-space:nowrap;">
          <button class="btn btn-secondary btn-sm" onclick="downloadArchivedReport('${r.id}')" title="Re-download PDF">
            <i data-lucide="download"></i> PDF
          </button>
          <button class="btn-icon" style="color:#ef4444;" onclick="deleteArchivedReport('${r.id}')" title="Delete Archive Entry">
            <i data-lucide="trash-2"></i>
          </button>
        </td>
      </tr>
    `).join('');

    AbhivantaUI.initIcons();
  }

  // Re-download archived report
  window.downloadArchivedReport = function(reportId) {
    const report = AbhivantaStorage.getReports().find(r => r.id === reportId);
    if (!report) return;

    AbhivantaUI.toast(`Compiling and downloading PDF for ${report.title}...`, 'info');
    // Set parameters and generate
    if (titleInput) titleInput.value = report.title;
    if (periodInput) periodInput.value = report.period;
    if (plantSelect) plantSelect.value = report.plantId || 'ALL';

    const p = buildReportPayload();
    AbhivantaPDF.generateReportPDF({
      ...p,
      reportId: report.id
    });
  };

  // Delete archive entry
  window.deleteArchivedReport = function(reportId) {
    AbhivantaUI.confirm(
      'Remove Report Entry',
      'Are you sure you want to delete this report from the historical archive?',
      () => {
        AbhivantaStorage.deleteReport(reportId);
        AbhivantaUI.toast('Report removed from archive.', 'info');
        renderReportHistory();
      },
      'Delete Entry',
      true
    );
  };

  function setupEventListeners() {
    // Template Preset Change
    if (templateSelect) {
      templateSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'trading') {
          titleInput.value = 'RENEWABLE POWER TRADING & DSM SETTLEMENT DOSSIER';
          periodInput.value = 'October 2026 (Daily 96-Block Settlement)';
        } else if (val === 'esg') {
          titleInput.value = 'ENTERPRISE SCOPE 2 NET-ZERO CARBON AUDIT CERTIFICATE';
          periodInput.value = 'October 2026 (Monthly BRSR Audit)';
        } else if (val === 'bess') {
          titleInput.value = 'BESS BATTERY STORAGE & ARBITRAGE DISPATCH AUDIT';
          periodInput.value = 'October 2026 (Daily Dispatch)';
        } else if (val === 'daily') {
          titleInput.value = 'DAILY DIURNAL GENERATION & PEAK LOG';
          periodInput.value = AbhivantaUtils.getTodayISO();
        } else if (val === 'monthly') {
          titleInput.value = 'MONTHLY RENEWABLE PERFORMANCE AUDIT';
          periodInput.value = 'October 2026';
        } else if (val === 'annual') {
          titleInput.value = 'ANNUAL ENERGY YIELD & DECARBONIZATION AUDIT';
          periodInput.value = 'FY 2025-2026';
        } else if (val === 'health') {
          titleInput.value = 'PLANT HEALTH, INVERTER AVAILABILITY & FAULT AUDIT';
          periodInput.value = 'Q3 2026';
        } else if (val === 'portfolio') {
          titleInput.value = 'MULTI-PLANT PORTFOLIO EXECUTIVE SUMMARY';
          periodInput.value = 'October 2026';
          if (plantSelect) plantSelect.value = 'ALL';
        }
        updatePreviewSheet();
      });
    }

    if (plantSelect) {
      plantSelect.addEventListener('change', updatePreviewSheet);
    }
    if (periodInput) {
      periodInput.addEventListener('input', updatePreviewSheet);
    }
    if (titleInput) {
      titleInput.addEventListener('input', updatePreviewSheet);
    }
    if (authorInput) {
      authorInput.addEventListener('input', updatePreviewSheet);
    }

    // Refresh preview button
    const refreshBtn = document.getElementById('refresh-preview-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        updatePreviewSheet();
        AbhivantaUI.toast('Preview document re-calculated.', 'info');
      });
    }

    // Download PDF Button
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    if (downloadPdfBtn) {
      downloadPdfBtn.addEventListener('click', () => {
        const payload = buildReportPayload();
        const success = AbhivantaPDF.generateReportPDF(payload);
        if (success) {
          // Record in localStorage report history
          AbhivantaStorage.saveReport({
            title: payload.title,
            reportType: templateSelect.options[templateSelect.selectedIndex].text.split('(')[0].trim(),
            plantId: payload.plantId,
            plantName: payload.plantName,
            period: payload.period,
            fileFormat: 'PDF'
          });
          renderReportHistory();
        }
      });
    }

    // Download Excel Button
    const downloadExcelBtn = document.getElementById('download-excel-btn');
    if (downloadExcelBtn) {
      downloadExcelBtn.addEventListener('click', () => {
        const payload = buildReportPayload();
        AbhivantaExport.exportToExcel(
          'Plant Report',
          payload.tableHeaders,
          payload.tableRows,
          `Abhivanta_${payload.template}_Report.xlsx`
        );
      });
    }

    // Clear history
    const clearBtn = document.getElementById('clear-history-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        AbhivantaUI.confirm(
          'Clear Report Archive',
          'Are you sure you want to clear all report metadata history?',
          () => {
            const store = AbhivantaStorage.getStore();
            store.reports = [];
            AbhivantaStorage.saveStore(store);
            AbhivantaUI.toast('Report archive cleared.', 'info');
            renderReportHistory();
          },
          'Clear Archive',
          true
        );
      });
    }
  }

  initReportCenter();
});
