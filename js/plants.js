/**
 * ABHIVANTA - Plant Management Controller
 * CRUD operations, search, filters, sorting, detailed plant profiles,
 * and roster spreadsheet export.
 */

document.addEventListener('DOMContentLoaded', () => {
  let sortField = 'capacityMW';
  let sortDirection = 'desc'; // 'asc' or 'desc'
  let searchQuery = '';
  let techFilter = 'ALL';
  let statusFilter = 'ALL';
  let stateFilter = 'ALL';

  const tbody = document.getElementById('plants-tbody');
  const countDisplay = document.getElementById('plant-count-display');

  // Check URL params for pre-set search (e.g. from global search)
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search');
  if (searchParam) {
    searchQuery = searchParam.toLowerCase();
    const searchInput = document.getElementById('plant-search');
    if (searchInput) searchInput.value = searchParam;
  }

  function getProcessedPlants() {
    let plants = AbhivantaStorage.getPlants();

    // 1. Text Search
    if (searchQuery) {
      plants = plants.filter(p => 
        p.name.toLowerCase().includes(searchQuery) ||
        p.id.toLowerCase().includes(searchQuery) ||
        p.location.toLowerCase().includes(searchQuery) ||
        p.state.toLowerCase().includes(searchQuery)
      );
    }

    // 2. Filters
    if (techFilter !== 'ALL') {
      plants = plants.filter(p => p.type === techFilter);
    }
    if (statusFilter !== 'ALL') {
      plants = plants.filter(p => p.status === statusFilter);
    }
    if (stateFilter !== 'ALL') {
      plants = plants.filter(p => p.state === stateFilter);
    }

    // 3. Sorting
    plants.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });

    return plants;
  }

  function renderTable() {
    const plants = getProcessedPlants();
    if (countDisplay) {
      countDisplay.textContent = `Showing ${plants.length} of ${AbhivantaStorage.getPlants().length} Plants`;
    }

    if (plants.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9">
            <div class="empty-state">
              <div class="empty-state-icon"><i data-lucide="search-x"></i></div>
              <div class="empty-state-title">No matching plants found</div>
              <div class="empty-state-desc">Try clearing your search terms or filters to display all fleet records.</div>
              <button class="btn btn-secondary btn-sm" id="reset-filter-btn">Reset All Filters</button>
            </div>
          </td>
        </tr>
      `;
      const resetBtn = document.getElementById('reset-filter-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          searchQuery = '';
          techFilter = 'ALL';
          statusFilter = 'ALL';
          stateFilter = 'ALL';
          document.getElementById('plant-search').value = '';
          document.getElementById('plant-tech-filter').value = 'ALL';
          document.getElementById('plant-status-filter').value = 'ALL';
          document.getElementById('plant-state-filter').value = 'ALL';
          renderTable();
        });
      }
      AbhivantaUI.initIcons();
      return;
    }

    tbody.innerHTML = plants.map(p => `
      <tr>
        <td>
          <div style="font-weight:700; color:#0f172a; cursor:pointer;" onclick="viewPlantDetails('${p.id}')">
            ${AbhivantaUtils.escapeHtml(p.name)}
          </div>
          <div style="font-family:var(--font-mono); font-size:11px; color:#64748b;">
            ${AbhivantaUtils.escapeHtml(p.id)}
          </div>
        </td>
        <td>${AbhivantaUI.getTypeBadge(p.type)}</td>
        <td>
          <div>${AbhivantaUtils.escapeHtml(p.state)}</div>
          <div style="font-size:11px; color:#94a3b8;">${AbhivantaUtils.escapeHtml(p.location)}</div>
        </td>
        <td style="font-family:var(--font-mono); font-weight:700;">
          ${AbhivantaUtils.formatNumber(p.capacityMW, 0)} MW
        </td>
        <td style="font-family:var(--font-mono);">
          ${AbhivantaUtils.formatNumber(p.todayGenMWh, 1)}
        </td>
        <td>
          <span style="font-weight:700; color:${p.performanceRatio >= 80 ? '#10b981' : (p.performanceRatio >= 70 ? '#f59e0b' : '#ef4444')};">
            ${p.performanceRatio}%
          </span>
        </td>
        <td>
          <span style="font-weight:600;">${p.availability}%</span>
        </td>
        <td>${AbhivantaUI.getStatusBadge(p.status)}</td>
        <td style="text-align:right; white-space:nowrap;">
          <button class="btn-icon" title="View Plant Profile" onclick="viewPlantDetails('${p.id}')">
            <i data-lucide="eye"></i>
          </button>
          <button class="btn-icon" title="Edit Plant" onclick="openEditPlantModal('${p.id}')">
            <i data-lucide="edit-3"></i>
          </button>
          <button class="btn-icon" title="Delete Plant" style="color:#ef4444;" onclick="handleDeletePlant('${p.id}')">
            <i data-lucide="trash-2"></i>
          </button>
        </td>
      </tr>
    `).join('');

    AbhivantaUI.initIcons();
  }

  // View Plant Details Profile Modal
  window.viewPlantDetails = function(plantId) {
    const plant = AbhivantaStorage.getPlant(plantId);
    if (!plant) {
      AbhivantaUI.toast('Plant not found.', 'danger');
      return;
    }

    const cuf = AbhivantaUtils.calculateCUF(plant.todayGenMWh, plant.capacityMW);
    const revenue = AbhivantaUtils.calculateRevenue(plant.todayGenMWh, plant.tariffINR);
    const co2 = AbhivantaUtils.calculateCO2Avoided(plant.todayGenMWh);

    const bodyHtml = `
      <div style="display:flex; flex-direction:column; gap:20px;">
        <!-- Top Profile Banner -->
        <div style="background:var(--slate-50); border:1px solid var(--border-light); border-radius:12px; padding:16px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 style="margin:0; font-size:18px;">${AbhivantaUtils.escapeHtml(plant.name)}</h3>
            <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">
              ${plant.id} &bull; ${AbhivantaUtils.escapeHtml(plant.location)}, ${AbhivantaUtils.escapeHtml(plant.state)}
            </div>
          </div>
          <div>
            ${AbhivantaUI.getStatusBadge(plant.status)}
          </div>
        </div>

        <!-- Plant Site Facility Visual -->
        <div style="height:140px; border-radius:10px; overflow:hidden; position:relative; border:1px solid var(--border-light);">
          <img src="${plant.type === 'Hybrid' ? 'assets/images/bess_storage.jpg' : 'assets/images/solar_wind_bess.jpg'}" alt="Plant Site Aerial" style="width:100%; height:100%; object-fit:cover;">
          <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(7,32,22,0.8) 0%, transparent 60%); display:flex; align-items:flex-end; padding:10px 14px;">
            <span style="font-size:11px; color:#a7f3d0; font-weight:700; background:rgba(0,0,0,0.55); backdrop-filter:blur(4px); padding:2px 8px; border-radius:4px;">
              <i data-lucide="camera" style="width:12px;height:12px;display:inline;"></i> ${plant.type} Utility Site &bull; Digital Twin Connected
            </span>
          </div>
        </div>

        <!-- Metric Grid -->
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px;">
          <div style="background:#ffffff; border:1px solid var(--border-light); border-radius:8px; padding:12px;">
            <div style="font-size:11px; color:#64748b; text-transform:uppercase;">Installed Capacity</div>
            <div style="font-size:18px; font-weight:800; color:#0f172a; margin-top:2px;">${plant.capacityMW} MW</div>
          </div>
          <div style="background:#ffffff; border:1px solid var(--border-light); border-radius:8px; padding:12px;">
            <div style="font-size:11px; color:#64748b; text-transform:uppercase;">Today's Output</div>
            <div style="font-size:18px; font-weight:800; color:#10b981; margin-top:2px;">${AbhivantaUtils.formatNumber(plant.todayGenMWh, 1)} MWh</div>
          </div>
          <div style="background:#ffffff; border:1px solid var(--border-light); border-radius:8px; padding:12px;">
            <div style="font-size:11px; color:#64748b; text-transform:uppercase;">Performance Ratio</div>
            <div style="font-size:18px; font-weight:800; color:#0284c7; margin-top:2px;">${plant.performanceRatio}%</div>
          </div>
          <div style="background:#ffffff; border:1px solid var(--border-light); border-radius:8px; padding:12px;">
            <div style="font-size:11px; color:#64748b; text-transform:uppercase;">Calculated CUF</div>
            <div style="font-size:16px; font-weight:700; color:#334155; margin-top:2px;">${cuf.toFixed(1)}%</div>
          </div>
          <div style="background:#ffffff; border:1px solid var(--border-light); border-radius:8px; padding:12px;">
            <div style="font-size:11px; color:#64748b; text-transform:uppercase;">Est. Revenue (Today)</div>
            <div style="font-size:16px; font-weight:700; color:#334155; margin-top:2px;">${AbhivantaUtils.formatINR(revenue)}</div>
          </div>
          <div style="background:#ffffff; border:1px solid var(--border-light); border-radius:8px; padding:12px;">
            <div style="font-size:11px; color:#64748b; text-transform:uppercase;">CO2 Avoided Today</div>
            <div style="font-size:16px; font-weight:700; color:#334155; margin-top:2px;">${AbhivantaUtils.formatNumber(co2, 0)} Tonnes</div>
          </div>
        </div>

        <!-- Plant Technical Specs -->
        <div>
          <h4 style="font-size:14px; margin-bottom:8px; color:#0f172a;">Equipment &amp; Telemetry Attributes</h4>
          <table style="width:100%; font-size:12px; border-collapse:collapse;">
            <tr style="border-bottom:1px solid var(--border-light);">
              <td style="padding:6px 0; color:#64748b;">Technology Type:</td>
              <td style="padding:6px 0; font-weight:600; text-align:right;">${plant.type}</td>
            </tr>
            <tr style="border-bottom:1px solid var(--border-light);">
              <td style="padding:6px 0; color:#64748b;">Commissioning Date:</td>
              <td style="padding:6px 0; font-weight:600; text-align:right;">${AbhivantaUtils.formatDate(plant.commissionDate)}</td>
            </tr>
            <tr style="border-bottom:1px solid var(--border-light);">
              <td style="padding:6px 0; color:#64748b;">Central Inverters / Units:</td>
              <td style="padding:6px 0; font-weight:600; text-align:right;">${plant.invertersActive || plant.invertersCount} of ${plant.invertersCount} Online</td>
            </tr>
            <tr style="border-bottom:1px solid var(--border-light);">
              <td style="padding:6px 0; color:#64748b;">Contracted PPA Tariff:</td>
              <td style="padding:6px 0; font-weight:600; text-align:right;">₹${plant.tariffINR} / kWh</td>
            </tr>
            <tr style="border-bottom:1px solid var(--border-light);">
              <td style="padding:6px 0; color:#64748b;">Next Maintenance Window:</td>
              <td style="padding:6px 0; font-weight:600; text-align:right;">${AbhivantaUtils.formatDate(plant.nextMaintenance)}</td>
            </tr>
          </table>
        </div>
      </div>
    `;

    AbhivantaUI.modal({
      title: 'Plant Profile & Telemetry Specification',
      bodyHtml,
      size: 'lg',
      footerButtons: [
        {
          text: 'Open in Live SCADA Room',
          className: 'btn btn-emerald',
          onClick: (close) => {
            close();
            window.location.href = `monitoring.html?plantId=${encodeURIComponent(plant.id)}`;
          }
        },
        {
          text: 'Generate Plant Report',
          className: 'btn btn-primary',
          onClick: (close) => {
            close();
            window.location.href = `reports.html?plantId=${encodeURIComponent(plant.id)}`;
          }
        },
        {
          text: 'Close',
          className: 'btn btn-secondary',
          onClick: (close) => close()
        }
      ]
    });
  };

  // Add Plant Modal
  const addBtn = document.getElementById('add-plant-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const nextId = `PLANT-SOL-${String(AbhivantaStorage.getPlants().length + 1).padStart(2, '0')}`;
      const bodyHtml = `
        <form id="new-plant-form" style="display:flex; flex-direction:column; gap:12px;">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group" style="margin:0;">
              <label class="form-label">Plant ID <span class="required">*</span></label>
              <input type="text" id="add-plant-id" class="form-control" value="${nextId}" required>
            </div>
            <div class="form-group" style="margin:0;">
              <label class="form-label">Technology <span class="required">*</span></label>
              <select id="add-plant-type" class="form-select">
                <option value="Solar">Solar</option>
                <option value="Wind">Wind</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div class="form-group" style="margin:0;">
            <label class="form-label">Plant Name <span class="required">*</span></label>
            <input type="text" id="add-plant-name" class="form-control" placeholder="e.g. Dholera Solar Zone Phase 1" required>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group" style="margin:0;">
              <label class="form-label">State <span class="required">*</span></label>
              <select id="add-plant-state" class="form-select">
                <option value="Maharashtra">Maharashtra</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
              </select>
            </div>
            <div class="form-group" style="margin:0;">
              <label class="form-label">District / Location</label>
              <input type="text" id="add-plant-loc" class="form-control" placeholder="e.g. Ahmedabad District">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group" style="margin:0;">
              <label class="form-label">Installed Capacity (MW) <span class="required">*</span></label>
              <input type="number" id="add-plant-cap" class="form-control" min="1" step="0.5" value="100" required>
            </div>
            <div class="form-group" style="margin:0;">
              <label class="form-label">PPA Tariff (₹ / kWh)</label>
              <input type="number" id="add-plant-tariff" class="form-control" min="1" step="0.05" value="3.25">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group" style="margin:0;">
              <label class="form-label">Operating Status</label>
              <select id="add-plant-status" class="form-select">
                <option value="Operational">Operational</option>
                <option value="Degraded">Degraded</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Offline">Offline</option>
              </select>
            </div>
            <div class="form-group" style="margin:0;">
              <label class="form-label">Commission Date</label>
              <input type="date" id="add-plant-date" class="form-control" value="${AbhivantaUtils.getTodayISO()}">
            </div>
          </div>
        </form>
      `;

      AbhivantaUI.modal({
        title: 'Register New Renewable Plant Asset',
        bodyHtml,
        size: 'lg',
        footerButtons: [
          { text: 'Cancel', className: 'btn btn-secondary', onClick: (close) => close() },
          {
            text: 'Save Plant Asset',
            className: 'btn btn-primary',
            onClick: (close) => {
              const id = document.getElementById('add-plant-id').value.trim();
              const name = document.getElementById('add-plant-name').value.trim();
              const type = document.getElementById('add-plant-type').value;
              const state = document.getElementById('add-plant-state').value;
              const loc = document.getElementById('add-plant-loc').value.trim() || `${state} Region`;
              const cap = parseFloat(document.getElementById('add-plant-cap').value);
              const tariff = parseFloat(document.getElementById('add-plant-tariff').value) || 3.3;
              const status = document.getElementById('add-plant-status').value;
              const date = document.getElementById('add-plant-date').value || AbhivantaUtils.getTodayISO();

              if (!id || !name || isNaN(cap) || cap <= 0) {
                AbhivantaUI.toast('Please fill all mandatory fields with valid values.', 'warning');
                return false;
              }

              try {
                AbhivantaStorage.addPlant({
                  id,
                  name,
                  type,
                  state,
                  location: loc,
                  capacityMW: cap,
                  tariffINR: tariff,
                  status,
                  commissionDate: date,
                  todayGenMWh: +(cap * 5.2).toFixed(1),
                  monthGenMWh: +(cap * 155).toFixed(1),
                  yearGenMWh: +(cap * 1800).toFixed(1),
                  availability: 98.5,
                  performanceRatio: 81.5,
                  nextMaintenance: '2026-12-01'
                });
                AbhivantaUI.toast(`Plant "${name}" registered successfully.`, 'success');
                renderTable();
                close();
              } catch (err) {
                AbhivantaUI.toast(err.message, 'danger');
                return false;
              }
            }
          }
        ]
      });
    });
  }

  // Edit Plant Modal
  window.openEditPlantModal = function(plantId) {
    const plant = AbhivantaStorage.getPlant(plantId);
    if (!plant) return;

    const bodyHtml = `
      <form id="edit-plant-form" style="display:flex; flex-direction:column; gap:12px;">
        <div class="form-group" style="margin:0;">
          <label class="form-label">Plant Name</label>
          <input type="text" id="edit-plant-name" class="form-control" value="${AbhivantaUtils.escapeHtml(plant.name)}" required>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group" style="margin:0;">
            <label class="form-label">Capacity (MW)</label>
            <input type="number" id="edit-plant-cap" class="form-control" value="${plant.capacityMW}" required>
          </div>
          <div class="form-group" style="margin:0;">
            <label class="form-label">Status</label>
            <select id="edit-plant-status" class="form-select">
              <option value="Operational" ${plant.status === 'Operational' ? 'selected' : ''}>Operational</option>
              <option value="Degraded" ${plant.status === 'Degraded' ? 'selected' : ''}>Degraded</option>
              <option value="Maintenance" ${plant.status === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
              <option value="Offline" ${plant.status === 'Offline' ? 'selected' : ''}>Offline</option>
            </select>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group" style="margin:0;">
            <label class="form-label">Performance Ratio (%)</label>
            <input type="number" id="edit-plant-pr" class="form-control" step="0.1" value="${plant.performanceRatio}">
          </div>
          <div class="form-group" style="margin:0;">
            <label class="form-label">Plant Availability (%)</label>
            <input type="number" id="edit-plant-avail" class="form-control" step="0.1" value="${plant.availability}">
          </div>
        </div>

        <div class="form-group" style="margin:0;">
          <label class="form-label">Tariff (₹ / kWh)</label>
          <input type="number" id="edit-plant-tariff" class="form-control" step="0.05" value="${plant.tariffINR}">
        </div>
      </form>
    `;

    AbhivantaUI.modal({
      title: `Update Plant — ${plant.name}`,
      bodyHtml,
      footerButtons: [
        { text: 'Cancel', className: 'btn btn-secondary', onClick: (close) => close() },
        {
          text: 'Save Changes',
          className: 'btn btn-primary',
          onClick: (close) => {
            const name = document.getElementById('edit-plant-name').value.trim();
            const cap = parseFloat(document.getElementById('edit-plant-cap').value);
            const status = document.getElementById('edit-plant-status').value;
            const pr = parseFloat(document.getElementById('edit-plant-pr').value);
            const avail = parseFloat(document.getElementById('edit-plant-avail').value);
            const tariff = parseFloat(document.getElementById('edit-plant-tariff').value);

            if (!name || isNaN(cap)) {
              AbhivantaUI.toast('Please provide valid plant attributes.', 'warning');
              return false;
            }

            AbhivantaStorage.updatePlant(plantId, {
              name,
              capacityMW: cap,
              status,
              performanceRatio: pr,
              availability: avail,
              tariffINR: tariff
            });

            AbhivantaUI.toast(`Updated plant "${name}" successfully.`, 'success');
            renderTable();
            close();
          }
        }
      ]
    });
  };

  // Delete Plant with Custom Confirmation
  window.handleDeletePlant = function(plantId) {
    const plant = AbhivantaStorage.getPlant(plantId);
    if (!plant) return;

    AbhivantaUI.confirm(
      'Decommission Plant Asset',
      `Are you sure you want to delete "${plant.name}" (${plant.id})? This will remove all associated telemetry bindings.`,
      () => {
        AbhivantaStorage.deletePlant(plantId);
        AbhivantaUI.toast(`Plant "${plant.name}" decommissioned.`, 'success');
        renderTable();
      },
      'Decommission Plant',
      true
    );
  };

  // Search input event
  const searchInput = document.getElementById('plant-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      renderTable();
    });
  }

  // Filter selects
  const techSelect = document.getElementById('plant-tech-filter');
  if (techSelect) {
    techSelect.addEventListener('change', (e) => {
      techFilter = e.target.value;
      renderTable();
    });
  }

  const statusSelect = document.getElementById('plant-status-filter');
  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      statusFilter = e.target.value;
      renderTable();
    });
  }

  const stateSelect = document.getElementById('plant-state-filter');
  if (stateSelect) {
    stateSelect.addEventListener('change', (e) => {
      stateFilter = e.target.value;
      renderTable();
    });
  }

  // Column header sorting
  document.querySelectorAll('#plants-table th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const field = th.dataset.sort;
      if (sortField === field) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortField = field;
        sortDirection = 'desc';
      }
      renderTable();
    });
  });

  // Export to Excel / CSV
  const exportBtn = document.getElementById('export-plants-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      AbhivantaExport.exportHtmlTable('plants-table', 'Abhivanta_Plant_Inventory');
    });
  }

  renderTable();
});
