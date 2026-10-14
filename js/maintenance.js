/**
 * ABHIVANTA - Maintenance Controller
 * Work order scheduling, technician assignments, status toggling, and budget tracking.
 */

document.addEventListener('DOMContentLoaded', () => {
  let searchQuery = '';
  let statusFilter = 'ALL';
  let typeFilter = 'ALL';

  const tbody = document.getElementById('maintenance-tbody');
  const countDisplay = document.getElementById('mnt-count-display');

  // Check URL params for pre-filling
  const urlParams = new URLSearchParams(window.location.search);
  const paramPlantId = urlParams.get('plantId');
  const paramAlertId = urlParams.get('alertId');

  function initMaintenance() {
    renderMaintenance();
    setupEventListeners();

    if (paramPlantId) {
      setTimeout(() => openCreateModal(paramPlantId, paramAlertId), 200);
    }
  }

  function getProcessedMaintenance() {
    let list = AbhivantaStorage.getMaintenance();

    if (searchQuery) {
      list = list.filter(m =>
        m.id.toLowerCase().includes(searchQuery) ||
        m.plantName.toLowerCase().includes(searchQuery) ||
        m.description.toLowerCase().includes(searchQuery) ||
        (m.technician && m.technician.toLowerCase().includes(searchQuery))
      );
    }

    if (statusFilter !== 'ALL') {
      list = list.filter(m => m.status === statusFilter);
    }

    if (typeFilter !== 'ALL') {
      list = list.filter(m => m.type === typeFilter);
    }

    return list;
  }

  function renderMaintenance() {
    updateSummaryKPIs();

    const list = getProcessedMaintenance();
    if (countDisplay) {
      countDisplay.textContent = `Showing ${list.length} of ${AbhivantaStorage.getMaintenance().length} Records`;
    }

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10">
            <div class="empty-state">
              <div class="empty-state-icon"><i data-lucide="calendar-x"></i></div>
              <div class="empty-state-title">No maintenance work orders found</div>
              <div class="empty-state-desc">Try clearing filters or schedule a new maintenance task.</div>
            </div>
          </td>
        </tr>
      `;
      AbhivantaUI.initIcons();
      return;
    }

    tbody.innerHTML = list.map(m => {
      let prioBadge = '<span class="badge badge-info">Low</span>';
      if (m.priority === 'High') prioBadge = '<span class="badge badge-danger">High</span>';
      else if (m.priority === 'Medium') prioBadge = '<span class="badge badge-warning">Medium</span>';

      return `
        <tr>
          <td style="font-family:var(--font-mono); font-weight:700; color:#0f172a;">${AbhivantaUtils.escapeHtml(m.id)}</td>
          <td>
            <div style="font-weight:600; color:#0f172a;">${AbhivantaUtils.escapeHtml(m.plantName)}</div>
            <div style="font-size:11px; color:#64748b;">${AbhivantaUtils.escapeHtml(m.plantId)}</div>
          </td>
          <td><span class="badge badge-neutral">${AbhivantaUtils.escapeHtml(m.type)}</span></td>
          <td style="max-width:240px;">
            <div class="truncate" title="${AbhivantaUtils.escapeHtml(m.description)}">
              ${AbhivantaUtils.escapeHtml(m.description)}
            </div>
          </td>
          <td style="font-size:11px; color:#64748b;">
            ${AbhivantaUtils.formatDate(m.scheduledDate)}
          </td>
          <td style="font-weight:500;">${AbhivantaUtils.escapeHtml(m.technician || 'Field Crew')}</td>
          <td>${prioBadge}</td>
          <td style="font-family:var(--font-mono); font-weight:600;">${AbhivantaUtils.formatINR(m.costINR)}</td>
          <td>${AbhivantaUI.getStatusBadge(m.status)}</td>
          <td style="text-align:right; white-space:nowrap;">
            ${m.status !== 'Completed' ? `
              <button class="btn btn-emerald btn-sm" onclick="markComplete('${m.id}')" title="Mark Task as Done">
                <i data-lucide="check"></i> Done
              </button>
            ` : ''}
            <button class="btn-icon" onclick="openEditModal('${m.id}')" title="Edit Record">
              <i data-lucide="edit-3"></i>
            </button>
            <button class="btn-icon" style="color:#ef4444;" onclick="deleteRecord('${m.id}')" title="Delete Record">
              <i data-lucide="trash-2"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    AbhivantaUI.initIcons();
  }

  function updateSummaryKPIs() {
    const records = AbhivantaStorage.getMaintenance();
    const active = records.filter(r => r.status === 'Scheduled' || r.status === 'In Progress').length;
    const inProgress = records.filter(r => r.status === 'In Progress').length;
    const completed = records.filter(r => r.status === 'Completed').length;
    const totalCost = records.reduce((s, r) => s + (r.costINR || 0), 0);

    const elActive = document.getElementById('mnt-active-count');
    const elProg = document.getElementById('mnt-progress-count');
    const elComp = document.getElementById('mnt-completed-count');
    const elCost = document.getElementById('mnt-total-cost');

    if (elActive) elActive.textContent = active;
    if (elProg) elProg.textContent = inProgress;
    if (elComp) elComp.textContent = completed;
    if (elCost) {
      const lakhs = (totalCost / 100000).toFixed(2);
      elCost.textContent = `₹${lakhs} L`;
    }
  }

  // Create Work Order Modal
  function openCreateModal(prefillPlantId = null, prefillAlertId = null) {
    const plants = AbhivantaStorage.getPlants();
    const plantOpts = plants.map(p => `
      <option value="${p.id}" ${p.id === prefillPlantId ? 'selected' : ''}>
        ${p.id} &bull; ${p.name}
      </option>
    `).join('');

    let descPrefill = '';
    let prioPrefill = 'Medium';
    let typePrefill = 'Preventive';

    if (prefillAlertId) {
      typePrefill = 'Corrective';
      prioPrefill = 'High';
      descPrefill = `Corrective overhaul triggered by telemetry alert ${prefillAlertId}`;
    }

    const bodyHtml = `
      <form id="new-mnt-form" style="display:flex; flex-direction:column; gap:12px;">
        <div class="form-group" style="margin:0;">
          <label class="form-label">Plant Asset <span class="required">*</span></label>
          <select id="mnt-plant-sel" class="form-select">${plantOpts}</select>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group" style="margin:0;">
            <label class="form-label">Maintenance Type</label>
            <select id="mnt-type-sel" class="form-select">
              <option value="Preventive" ${typePrefill === 'Preventive' ? 'selected' : ''}>Preventive Service</option>
              <option value="Corrective" ${typePrefill === 'Corrective' ? 'selected' : ''}>Corrective Repair</option>
              <option value="Inspection" ${typePrefill === 'Inspection' ? 'selected' : ''}>Diagnostic Audit</option>
            </select>
          </div>
          <div class="form-group" style="margin:0;">
            <label class="form-label">Priority</label>
            <select id="mnt-prio-sel" class="form-select">
              <option value="High" ${prioPrefill === 'High' ? 'selected' : ''}>High</option>
              <option value="Medium" ${prioPrefill === 'Medium' ? 'selected' : ''}>Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin:0;">
          <label class="form-label">Work Order Description <span class="required">*</span></label>
          <input type="text" id="mnt-desc" class="form-control" value="${AbhivantaUtils.escapeHtml(descPrefill)}" placeholder="e.g. Inverter capacitor replacement..." required>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group" style="margin:0;">
            <label class="form-label">Scheduled Date</label>
            <input type="date" id="mnt-date" class="form-control" value="${AbhivantaUtils.getTodayISO()}">
          </div>
          <div class="form-group" style="margin:0;">
            <label class="form-label">Assigned Technician</label>
            <input type="text" id="mnt-tech" class="form-control" placeholder="e.g. Rajesh Sharma" value="Kishore Varma">
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group" style="margin:0;">
            <label class="form-label">Estimated Cost (₹ INR)</label>
            <input type="number" id="mnt-cost" class="form-control" min="0" step="1000" value="75000">
          </div>
          <div class="form-group" style="margin:0;">
            <label class="form-label">Initial Status</label>
            <select id="mnt-status-sel" class="form-select">
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </form>
    `;

    AbhivantaUI.modal({
      title: 'Schedule Asset Maintenance Work Order',
      bodyHtml,
      size: 'lg',
      footerButtons: [
        { text: 'Cancel', className: 'btn btn-secondary', onClick: (close) => close() },
        {
          text: 'Schedule Work Order',
          className: 'btn btn-primary',
          onClick: (close) => {
            const plantId = document.getElementById('mnt-plant-sel').value;
            const plant = AbhivantaStorage.getPlant(plantId);
            const type = document.getElementById('mnt-type-sel').value;
            const prio = document.getElementById('mnt-prio-sel').value;
            const desc = document.getElementById('mnt-desc').value.trim();
            const date = document.getElementById('mnt-date').value || AbhivantaUtils.getTodayISO();
            const tech = document.getElementById('mnt-tech').value.trim() || 'Internal Crew';
            const cost = parseFloat(document.getElementById('mnt-cost').value) || 0;
            const stat = document.getElementById('mnt-status-sel').value;

            if (!desc) {
              AbhivantaUI.toast('Please provide a work order description.', 'warning');
              return false;
            }

            AbhivantaStorage.addMaintenance({
              plantId,
              plantName: plant ? plant.name : 'Plant Asset',
              type,
              priority: prio,
              description: desc,
              scheduledDate: date,
              technician: tech,
              costINR: cost,
              status: stat
            });

            AbhivantaUI.toast('Maintenance work order scheduled successfully.', 'success');
            renderMaintenance();
            close();
          }
        }
      ]
    });
  }

  // Edit Work Order Modal
  window.openEditModal = function(id) {
    const record = AbhivantaStorage.getMaintenance().find(r => r.id === id);
    if (!record) return;

    const bodyHtml = `
      <form id="edit-mnt-form" style="display:flex; flex-direction:column; gap:12px;">
        <div class="form-group" style="margin:0;">
          <label class="form-label">Description</label>
          <input type="text" id="edit-desc" class="form-control" value="${AbhivantaUtils.escapeHtml(record.description)}" required>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group" style="margin:0;">
            <label class="form-label">Status</label>
            <select id="edit-status" class="form-select">
              <option value="Scheduled" ${record.status === 'Scheduled' ? 'selected' : ''}>Scheduled</option>
              <option value="In Progress" ${record.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Completed" ${record.status === 'Completed' ? 'selected' : ''}>Completed</option>
            </select>
          </div>
          <div class="form-group" style="margin:0;">
            <label class="form-label">Priority</label>
            <select id="edit-prio" class="form-select">
              <option value="High" ${record.priority === 'High' ? 'selected' : ''}>High</option>
              <option value="Medium" ${record.priority === 'Medium' ? 'selected' : ''}>Medium</option>
              <option value="Low" ${record.priority === 'Low' ? 'selected' : ''}>Low</option>
            </select>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group" style="margin:0;">
            <label class="form-label">Technician</label>
            <input type="text" id="edit-tech" class="form-control" value="${AbhivantaUtils.escapeHtml(record.technician || '')}">
          </div>
          <div class="form-group" style="margin:0;">
            <label class="form-label">Cost (INR)</label>
            <input type="number" id="edit-cost" class="form-control" value="${record.costINR}">
          </div>
        </div>
      </form>
    `;

    AbhivantaUI.modal({
      title: `Update Work Order — ${record.id}`,
      bodyHtml,
      footerButtons: [
        { text: 'Cancel', className: 'btn btn-secondary', onClick: (close) => close() },
        {
          text: 'Save Updates',
          className: 'btn btn-primary',
          onClick: (close) => {
            const desc = document.getElementById('edit-desc').value.trim();
            const stat = document.getElementById('edit-status').value;
            const prio = document.getElementById('edit-prio').value;
            const tech = document.getElementById('edit-tech').value.trim();
            const cost = parseFloat(document.getElementById('edit-cost').value) || 0;

            AbhivantaStorage.updateMaintenance(id, {
              description: desc,
              status: stat,
              priority: prio,
              technician: tech,
              costINR: cost
            });

            AbhivantaUI.toast(`Work order ${id} updated.`, 'success');
            renderMaintenance();
            close();
          }
        }
      ]
    });
  };

  // Mark task as done
  window.markComplete = function(id) {
    AbhivantaStorage.updateMaintenance(id, { status: 'Completed' });
    AbhivantaUI.toast(`Work order ${id} marked as completed and signed off.`, 'success');
    renderMaintenance();
  };

  // Delete Record
  window.deleteRecord = function(id) {
    AbhivantaUI.confirm(
      'Delete Maintenance Record',
      `Are you sure you want to delete work order ${id}?`,
      () => {
        AbhivantaStorage.deleteMaintenance(id);
        AbhivantaUI.toast(`Work order ${id} removed.`, 'info');
        renderMaintenance();
      },
      'Delete Record',
      true
    );
  };

  function setupEventListeners() {
    const createBtn = document.getElementById('create-mnt-btn');
    if (createBtn) {
      createBtn.addEventListener('click', () => openCreateModal());
    }

    const searchInput = document.getElementById('mnt-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderMaintenance();
      });
    }

    const statusSel = document.getElementById('mnt-status-filter');
    if (statusSel) {
      statusSel.addEventListener('change', (e) => {
        statusFilter = e.target.value;
        renderMaintenance();
      });
    }

    const typeSel = document.getElementById('mnt-type-filter');
    if (typeSel) {
      typeSel.addEventListener('change', (e) => {
        typeFilter = e.target.value;
        renderMaintenance();
      });
    }
  }

  initMaintenance();
});
