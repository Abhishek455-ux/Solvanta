/**
 * ABHIVANTA - Live SCADA Monitoring Controller
 * Real-time telemetry emulation, inverter string matrix, diurnal charts,
 * and automated telemetry stress-test event injection.
 */

document.addEventListener('DOMContentLoaded', () => {
  let selectedPlantId = 'PLANT-SOL-01';
  let isSimulating = true;
  let simIntervalId = null;
  const simIntervalMs = 4000;

  // Check URL params
  const urlParams = new URLSearchParams(window.location.search);
  const paramPlantId = urlParams.get('plantId');
  if (paramPlantId && AbhivantaStorage.getPlant(paramPlantId)) {
    selectedPlantId = paramPlantId;
  }

  function initMonitoring() {
    populatePlantSelect();
    renderPlantTelemetry();
    startSimulation();
    setupControls();
  }

  function populatePlantSelect() {
    const select = document.getElementById('monitoring-plant-select');
    if (!select) return;

    const plants = AbhivantaStorage.getPlants();
    select.innerHTML = plants.map(p => `
      <option value="${p.id}" ${p.id === selectedPlantId ? 'selected' : ''}>
        ${p.id} &bull; ${AbhivantaUtils.escapeHtml(p.name)} (${p.capacityMW} MW ${p.type})
      </option>
    `).join('');

    select.addEventListener('change', (e) => {
      selectedPlantId = e.target.value;
      renderPlantTelemetry();
    });
  }

  function renderPlantTelemetry() {
    const plant = AbhivantaStorage.getPlant(selectedPlantId);
    if (!plant) return;

    // Title
    const chartTitle = document.getElementById('chart-plant-name');
    if (chartTitle) {
      chartTitle.textContent = `${plant.name} — Diurnal Generation & Irradiance`;
    }

    // Power
    const elPower = document.getElementById('tel-power');
    const elPowerSub = document.getElementById('tel-power-percent');
    if (elPower) {
      const mw = (plant.currentPowerKW / 1000).toFixed(1);
      elPower.textContent = `${mw} MW`;
      if (elPowerSub) {
        const pct = ((plant.currentPowerKW / (plant.capacityMW * 1000)) * 100).toFixed(1);
        elPowerSub.textContent = `${pct}% of ${plant.capacityMW} MW Rated`;
      }
    }

    // Today Gen
    const elTodayGen = document.getElementById('tel-today-gen');
    const elRevenue = document.getElementById('tel-revenue');
    if (elTodayGen) {
      elTodayGen.textContent = `${AbhivantaUtils.formatNumber(plant.todayGenMWh, 1)} MWh`;
      if (elRevenue) {
        const rev = plant.todayGenMWh * 1000 * (plant.tariffINR || 3.3);
        elRevenue.textContent = `${AbhivantaUtils.formatINR(rev)} revenue today`;
      }
    }

    // Irradiance / Wind Speed
    const elEnvTitle = document.getElementById('tel-env-title');
    const elIrr = document.getElementById('tel-irradiance');
    const elEnvSub = document.getElementById('tel-env-sub');
    if (elIrr) {
      if (plant.type === 'Wind') {
        if (elEnvTitle) elEnvTitle.textContent = 'Hub Wind Velocity';
        elIrr.textContent = '8.4 m/s';
        if (elEnvSub) elEnvSub.textContent = 'Anemometer WTG-01 &bull; 90m';
      } else {
        if (elEnvTitle) elEnvTitle.textContent = 'Plane of Array (POA)';
        elIrr.textContent = `${plant.irradiance || 850} W/m²`;
        if (elEnvSub) elEnvSub.textContent = 'Class A Secondary Pyranometer';
      }
    }

    // Temps
    const elModTemp = document.getElementById('tel-module-temp');
    const elAmbTemp = document.getElementById('tel-ambient-temp');
    if (elModTemp) elModTemp.textContent = `${plant.moduleTemp || 48.0} °C`;
    if (elAmbTemp) elAmbTemp.textContent = `Ambient: ${plant.ambientTemp || 32.0} °C`;

    // Inverters
    const elInverters = document.getElementById('tel-inverters');
    if (elInverters) {
      const active = plant.invertersActive !== undefined ? plant.invertersActive : plant.invertersCount;
      elInverters.textContent = `${active} / ${plant.invertersCount}`;
      elInverters.style.color = active === plant.invertersCount ? 'var(--color-success)' : 'var(--color-warning)';
    }

    // PR
    const elPR = document.getElementById('tel-pr');
    if (elPR) elPR.textContent = `${plant.performanceRatio}%`;

    // Grid Frequency & Voltage
    const elFreq = document.getElementById('tel-frequency');
    const elVolt = document.getElementById('tel-voltage');
    if (elFreq) elFreq.textContent = `${plant.gridFrequency || 50.01} Hz`;
    if (elVolt) elVolt.textContent = `Bus Voltage: ${plant.gridVoltage || 33.1} kV`;

    // Power factor
    const elPF = document.getElementById('tel-pf');
    if (elPF) elPF.textContent = `${plant.powerFactor || 0.99}`;

    // Last packet timestamp
    const elPacket = document.getElementById('telemetry-last-packet');
    if (elPacket) elPacket.textContent = new Date().toLocaleTimeString();

    // Chart Render
    renderMonitoringChart(plant);

    // BESS Console Render
    renderBessConsole(plant);

    // BMS 32-Rack Deep Telemetry Matrix Render
    renderBmsMatrix(plant);

    // SLDC Grid Dispatch & Substation SLD Schematic Render
    renderSldcGridControl(plant);

    // Inverter Matrix
    renderInverterMatrix(plant);
  }

  function renderBmsMatrix(plant) {
    const grid = document.getElementById('bms-rack-grid');
    if (!grid) return;

    const bessFleet = AbhivantaStorage.getBessFleet ? AbhivantaStorage.getBessFleet() : (AbhivantaDemoData.bessFleet || []);
    const bess = bessFleet.find(b => b.plantId === plant.id) || bessFleet[0];
    const totalRacks = bess ? bess.rackCount : 32;

    let html = '';
    for (let r = 1; r <= totalRacks; r++) {
      const rackId = `RCK-${String(r).padStart(2, '0')}`;
      // Cell voltage around 3.280 - 3.295 V (LFP nominal plateau)
      const baseV = 3.280 + ((r * 13) % 17) * 0.001;
      const deltaMv = 9 + ((r * 7) % 8); // 9 to 16 mV
      const rackTemp = +(27.5 + ((r * 3) % 5) * 0.4).toFixed(1);
      const isBalancing = r % 5 === 0;
      const statusColor = isBalancing ? '#06b6d4' : '#10b981';
      const statusLabel = isBalancing ? 'Balancing' : 'Nominal';

      html += `
        <div class="bms-rack-item" style="background:#ffffff; border:1px solid var(--border-light); border-radius:8px; padding:8px 10px; cursor:pointer; transition:transform 0.2s, box-shadow 0.2s; border-left:3px solid ${statusColor};" onclick="AbhivantaUI.toast('Rack ${rackId}: Cell voltage ${baseV.toFixed(3)}V (\\u0394V: ${deltaMv}mV), Temp: ${rackTemp}\\u00b0C, Liquid chilling loop 100% nominal.', 'info', 'BMS Rack Diagnostics')">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="font-size:11px; font-family:var(--font-mono); color:#0f172a;">${rackId}</strong>
            <span style="width:6px; height:6px; border-radius:50%; background:${statusColor};"></span>
          </div>
          <div style="font-size:11px; font-weight:700; color:#0f172a; margin-top:2px; font-family:var(--font-mono);">${baseV.toFixed(3)} V</div>
          <div style="display:flex; justify-content:space-between; font-size:9px; color:var(--text-muted); margin-top:2px;">
            <span>&Delta;V: ${deltaMv}mV</span>
            <span>${rackTemp}&deg;C</span>
          </div>
          <div style="font-size:9px; color:${statusColor}; font-weight:600; margin-top:2px;">${statusLabel}</div>
        </div>
      `;
    }
    grid.innerHTML = html;
  }

  function renderSldcGridControl(plant) {
    const elSched = document.getElementById('sld-schedule-mw');
    const elAct = document.getElementById('sld-actual-mw');
    const elDev = document.getElementById('sld-deviation-text');
    const elSolarP = document.getElementById('sld-solar-p');
    const elBessP = document.getElementById('sld-bess-p');

    if (!plant) return;

    const actualMW = +(plant.currentPowerKW / 1000).toFixed(1);
    // Schedule is typically ~1.5% below or above actual
    const schedMW = +(actualMW * 0.985).toFixed(1);
    const diffMW = +(actualMW - schedMW).toFixed(1);
    const diffPct = +((diffMW / schedMW) * 100).toFixed(2);

    if (elSched) elSched.textContent = `${schedMW} MW`;
    if (elAct) elAct.textContent = `${actualMW} MW`;
    if (elDev) {
      elDev.textContent = `Deviation: ${diffMW >= 0 ? '+' : ''}${diffMW} MW (${diffMW >= 0 ? '+' : ''}${diffPct}%)`;
      elDev.style.color = Math.abs(diffPct) <= 10.0 ? '#059669' : '#ef4444';
    }
    if (elSolarP) elSolarP.textContent = `${actualMW} MW`;
    if (elBessP) {
      const bessFleet = AbhivantaStorage.getBessFleet ? AbhivantaStorage.getBessFleet() : (AbhivantaDemoData.bessFleet || []);
      const bess = bessFleet.find(b => b.plantId === plant.id) || bessFleet[0];
      if (bess) elBessP.textContent = `${bess.currentPowerMW >= 0 ? '+' : ''}${bess.currentPowerMW} MW`;
    }
  }

  function renderMonitoringChart(plant) {
    const hourlyData = AbhivantaDemoData.generateHourlyCurve(plant);
    AbhivantaCharts.renderGenerationTrendChart('liveMonitoringChart', hourlyData, true);
  }

  function renderBessConsole(plant) {
    const bessFleet = AbhivantaStorage.getBessFleet ? AbhivantaStorage.getBessFleet() : (AbhivantaDemoData.bessFleet || []);
    // Find co-located BESS or pick primary
    const bess = bessFleet.find(b => b.plantId === plant.id) || bessFleet[0];
    if (!bess) return;

    const elTitle = document.getElementById('bess-console-title');
    const elSub = document.getElementById('bess-console-subtitle');
    const elStatusBadge = document.getElementById('bess-status-badge');
    const elModeBadge = document.getElementById('bess-mode-badge');
    const elSoc = document.getElementById('bess-soc-val');
    const elSocBar = document.getElementById('bess-soc-bar');
    const elCapAvail = document.getElementById('bess-capacity-avail');
    const elPower = document.getElementById('bess-power-val');
    const elPowerSub = document.getElementById('bess-power-sub');
    const elRte = document.getElementById('bess-rte-val');
    const elSoh = document.getElementById('bess-soh-val');
    const elCycles = document.getElementById('bess-cycles-val');
    const elArbitrage = document.getElementById('bess-arbitrage-val');
    const elRacks = document.getElementById('bess-racks-val');
    const elTemp = document.getElementById('bess-temp-val');
    const elHvac = document.getElementById('bess-hvac-val');
    const elBus = document.getElementById('bess-bus-val');

    if (elTitle) elTitle.textContent = `${bess.name} — SCADA Dispatch Console`;
    if (elSub) elSub.textContent = `${bess.chemistry} &bull; Rated ${bess.ratedPowerMW} MW / ${bess.ratedCapacityMWh} MWh (${bess.durationHours}h) &bull; Bus: ${bess.busVoltageKV} kV`;

    if (elStatusBadge) {
      const isDischarge = bess.status === 'Discharging';
      elStatusBadge.className = isDischarge ? 'badge badge-success' : 'badge badge-info';
      elStatusBadge.innerHTML = `<span class="badge-dot"></span> ${bess.status}`;
    }
    if (elModeBadge) {
      elModeBadge.innerHTML = `<i data-lucide="zap"></i> ${bess.dispatchMode}`;
    }

    if (elSoc) elSoc.textContent = `${bess.socPercent}%`;
    if (elSocBar) elSocBar.style.width = `${bess.socPercent}%`;
    if (elCapAvail) {
      const avail = ((bess.socPercent / 100) * bess.ratedCapacityMWh).toFixed(1);
      elCapAvail.textContent = `${avail} MWh usable of ${bess.ratedCapacityMWh} MWh`;
    }

    if (elPower) {
      const isPositive = bess.currentPowerMW >= 0;
      elPower.textContent = `${isPositive ? '+' : ''}${bess.currentPowerMW} MW`;
      elPower.style.color = isPositive ? 'var(--primary-600)' : '#0284c7';
      if (elPowerSub) {
        elPowerSub.textContent = isPositive ? 'Peak Discharging (Export to Grid)' : 'Solar Soak Charging (Absorbing Surplus)';
        elPowerSub.style.color = isPositive ? '#059669' : '#0284c7';
      }
    }

    if (elRte) elRte.textContent = `${bess.roundTripEfficiency}%`;
    if (elSoh) elSoh.textContent = `State of Health (SoH): ${bess.sohPercent}%`;
    if (elCycles) elCycles.textContent = `${bess.cycleCount} Cumulative Cycles`;
    if (elArbitrage) elArbitrage.textContent = AbhivantaUtils.formatINR(bess.todayArbitrageRevenueINR);

    if (elRacks) elRacks.textContent = `${bess.racksOnline} / ${bess.rackCount} Online (100%)`;
    if (elTemp) elTemp.textContent = `${bess.cellTempC} °C (${bess.coolingSystem})`;
    if (elHvac) elHvac.textContent = `${bess.hvacPowerKW} kW (0.24% of Gross)`;
    if (elBus) elBus.textContent = `1,250 V DC &bull; ${bess.busVoltageKV} kV POI`;

    // Render BESS 24h diurnal curve
    if (window.AbhivantaCharts && AbhivantaCharts.renderBessDispatchChart) {
      const bessCurve = AbhivantaDemoData.generateBessDiurnalCurve(bess);
      AbhivantaCharts.renderBessDispatchChart('bessDispatchChart', bessCurve);
    }
  }

  function renderInverterMatrix(plant) {
    const container = document.getElementById('inverter-grid');
    if (!container) return;

    const total = plant.invertersCount || 24;
    const active = plant.invertersActive !== undefined ? plant.invertersActive : total;

    let html = '';
    for (let i = 1; i <= total; i++) {
      const isOnline = i <= active;
      const blockId = `INV-${String(i).padStart(2, '0')}`;
      const statusColor = isOnline ? '#10b981' : '#ef4444';
      const statusText = isOnline ? 'Online' : 'Tripped';

      html += `
        <div style="background:#ffffff; border:1px solid var(--border-light); border-radius:8px; padding:10px; display:flex; flex-direction:column; gap:4px; border-left:3px solid ${statusColor};">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11px; font-weight:700; color:#0f172a; font-family:var(--font-mono);">${blockId}</span>
            <span style="width:7px; height:7px; border-radius:50%; background:${statusColor};"></span>
          </div>
          <div style="font-size:11px; color:#64748b;">${statusText}</div>
          <div style="font-size:10px; color:#94a3b8; font-family:var(--font-mono);">
            ${isOnline ? `${(plant.capacityMW * 1000 / total * 0.85).toFixed(0)} kW` : '0 kW'}
          </div>
        </div>
      `;
    }
    container.innerHTML = html;
  }

  // Simulation Engine (Periodic fluctuations)
  function startSimulation() {
    if (simIntervalId) clearInterval(simIntervalId);

    simIntervalId = setInterval(() => {
      if (!isSimulating) return;

      const plant = AbhivantaStorage.getPlant(selectedPlantId);
      if (!plant) return;

      // Random jitter
      const powerDelta = (Math.random() - 0.48) * 800; // kW
      plant.currentPowerKW = Math.max(1000, Math.round(plant.currentPowerKW + powerDelta));

      if (plant.type === 'Solar') {
        const irrDelta = Math.round((Math.random() - 0.5) * 12);
        plant.irradiance = Math.min(1050, Math.max(650, (plant.irradiance || 850) + irrDelta));
        const tempDelta = +((Math.random() - 0.5) * 0.2).toFixed(1);
        plant.moduleTemp = +((plant.moduleTemp || 48) + tempDelta).toFixed(1);
      }

      plant.gridFrequency = +(50.0 + (Math.random() - 0.5) * 0.04).toFixed(2);
      plant.gridVoltage = +(33.0 + (Math.random() - 0.5) * 0.2).toFixed(1);

      // Save subtle update
      AbhivantaStorage.updatePlant(plant.id, plant);

      // Quick DOM update
      const elPower = document.getElementById('tel-power');
      if (elPower) elPower.textContent = `${(plant.currentPowerKW / 1000).toFixed(1)} MW`;

      const elIrr = document.getElementById('tel-irradiance');
      if (elIrr && plant.type === 'Solar') elIrr.textContent = `${plant.irradiance} W/m²`;

      const elModTemp = document.getElementById('tel-module-temp');
      if (elModTemp) elModTemp.textContent = `${plant.moduleTemp} °C`;

      const elFreq = document.getElementById('tel-frequency');
      if (elFreq) elFreq.textContent = `${plant.gridFrequency} Hz`;

      const elPacket = document.getElementById('telemetry-last-packet');
      if (elPacket) elPacket.textContent = new Date().toLocaleTimeString();

      // BESS Telemetry slight jitter update
      const elBessPower = document.getElementById('bess-power-val');
      const elBessSoc = document.getElementById('bess-soc-val');
      if (elBessPower && elBessSoc) {
        const pJitter = +((Math.random() - 0.45) * 0.4).toFixed(1);
        const curText = elBessPower.textContent.replace('+', '').replace(' MW', '');
        const curP = parseFloat(curText) || 42.5;
        const newP = +(curP + pJitter).toFixed(1);
        elBessPower.textContent = `${newP >= 0 ? '+' : ''}${newP} MW`;
      }
    }, simIntervalMs);
  }

  function setupControls() {
    const toggleBtn = document.getElementById('sim-toggle-btn');
    const simIcon = document.getElementById('sim-icon');
    const simText = document.getElementById('sim-status-text');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        isSimulating = !isSimulating;
        if (isSimulating) {
          simText.textContent = 'Active (4s)';
          simIcon.setAttribute('data-lucide', 'pause');
          toggleBtn.className = 'btn btn-emerald btn-sm';
          AbhivantaUI.toast('SCADA telemetry polling resumed.', 'info');
        } else {
          simText.textContent = 'Paused';
          simIcon.setAttribute('data-lucide', 'play');
          toggleBtn.className = 'btn btn-secondary btn-sm';
          AbhivantaUI.toast('SCADA telemetry polling paused.', 'warning');
        }
        AbhivantaUI.initIcons();
      });
    }

    // Inject Synthetic Event for Diagnostic Simulation
    const injectBtn = document.getElementById('inject-event-btn');
    if (injectBtn) {
      injectBtn.addEventListener('click', () => {
        const plant = AbhivantaStorage.getPlant(selectedPlantId);
        if (!plant) return;

        // Simulate inverter trip & high temp
        const activeBefore = plant.invertersActive !== undefined ? plant.invertersActive : plant.invertersCount;
        const newActive = Math.max(1, activeBefore - 2);
        const powerDropKW = Math.round(plant.currentPowerKW * 0.85);

        plant.invertersActive = newActive;
        plant.currentPowerKW = powerDropKW;
        plant.moduleTemp = +(plant.moduleTemp + 4.5).toFixed(1);

        AbhivantaStorage.updatePlant(plant.id, plant);

        // Record real alert
        const alert = AbhivantaStorage.addAlert({
          plantId: plant.id,
          plantName: plant.name,
          category: 'Inverter Trip Anomaly',
          severity: 'High',
          message: `Inverter block INV-08 and INV-09 tripped on DC reverse bias during active simulation.`,
          remediation: 'Dispatch field inspection crew to check combiner box diodes.'
        });

        AbhivantaUI.toast(
          `Simulated fault event injected! 2 Inverters tripped on ${plant.name}. New alert created (${alert.id}).`,
          'danger',
          'Telemetry Anomaly Triggered',
          6000
        );

        renderPlantTelemetry();
      });
    }

    // Interactive Breaker Control: Solar CB-01
    const cbSolarBtn = document.getElementById('toggle-cb-solar-btn');
    const cbSolarSvg = document.getElementById('sld-cb-solar');
    const cbSolarDesc = document.getElementById('cb-solar-desc');
    let isSolarClosed = true;

    if (cbSolarBtn) {
      cbSolarBtn.addEventListener('click', () => {
        isSolarClosed = !isSolarClosed;
        if (isSolarClosed) {
          cbSolarBtn.textContent = 'Trip / Open';
          cbSolarBtn.className = 'btn btn-sm btn-emerald';
          if (cbSolarSvg) cbSolarSvg.setAttribute('fill', '#10b981');
          if (cbSolarDesc) cbSolarDesc.textContent = 'Status: Closed (33 kV Connected)';
          AbhivantaUI.toast('Feeder Breaker CB-01 CLOSED. Solar array synchronized with 33 kV pooling bus.', 'success');
        } else {
          cbSolarBtn.textContent = 'Close / Sync';
          cbSolarBtn.className = 'btn btn-sm btn-secondary';
          if (cbSolarSvg) cbSolarSvg.setAttribute('fill', '#ef4444');
          if (cbSolarDesc) cbSolarDesc.textContent = 'Status: OPEN (Feeder Tripped)';
          AbhivantaUI.toast('WARNING: Feeder Breaker CB-01 TRIPPED. Solar array isolated from grid.', 'danger');
        }
      });
    }

    // Interactive Breaker Control: BESS CB-02
    const cbBessBtn = document.getElementById('toggle-cb-bess-btn');
    const cbBessSvg = document.getElementById('sld-cb-bess');
    const cbBessDesc = document.getElementById('cb-bess-desc');
    let isBessClosed = true;

    if (cbBessBtn) {
      cbBessBtn.addEventListener('click', () => {
        isBessClosed = !isBessClosed;
        if (isBessClosed) {
          cbBessBtn.textContent = 'Trip / Open';
          cbBessBtn.className = 'btn btn-sm btn-emerald';
          if (cbBessSvg) cbBessSvg.setAttribute('fill', '#10b981');
          if (cbBessDesc) cbBessDesc.textContent = 'Status: Closed (Grid Injected)';
          AbhivantaUI.toast('Feeder Breaker CB-02 CLOSED. BESS Container Bay synchronized for arbitrage dispatch.', 'success');
        } else {
          cbBessBtn.textContent = 'Close / Sync';
          cbBessBtn.className = 'btn btn-sm btn-secondary';
          if (cbBessSvg) cbBessSvg.setAttribute('fill', '#ef4444');
          if (cbBessDesc) cbBessDesc.textContent = 'Status: OPEN (BESS Standby)';
          AbhivantaUI.toast('Feeder Breaker CB-02 OPENED. Battery container bay placed on float isolation.', 'warning');
        }
      });
    }

    // Active Curtailment Setpoint Slider
    const curtailmentSlider = document.getElementById('curtailment-slider');
    const curtailmentVal = document.getElementById('curtailment-val');

    if (curtailmentSlider && curtailmentVal) {
      curtailmentSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        curtailmentVal.textContent = val === '100' ? '100% (No Curtailment)' : `${val}% Derated (SLDC Demand Response)`;
        const plant = AbhivantaStorage.getPlant(selectedPlantId);
        if (plant) {
          plant.currentPowerKW = Math.round(plant.capacityMW * 800 * (val / 100));
          AbhivantaStorage.updatePlant(plant.id, plant);
          renderPlantTelemetry();
        }
      });
    }

    // High Wind Dust Storm Emergency Tracker Stow Trigger
    const stowBtn = document.getElementById('tracker-stow-btn');
    if (stowBtn) {
      stowBtn.addEventListener('click', () => {
        AbhivantaUI.confirm(
          'Emergency Tracker Stow Command',
          'Deploy high-wind aerodynamic stow command? All single-axis tracker tables will pivot to 0° horizontal to protect modules from mechanical wind gusts.',
          () => {
            AbhivantaUI.toast('EMERGENCY STOW ENGAGED! All 48 tracking blocks locked at 0° horizontal safety flat.', 'warning', 'Aero Wind Protection Active', 8000);
          },
          'Engage 0° Stow',
          false
        );
      });
    }
  }

  // Cleanup interval on page leave
  window.addEventListener('beforeunload', () => {
    if (simIntervalId) clearInterval(simIntervalId);
  });

  initMonitoring();
});
