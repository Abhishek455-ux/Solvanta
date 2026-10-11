/**
 * SOLVANTA - Alerts & Fault Controller
 * Fault triage, severity status counters, modal diagnostics, and demo simulation.
 */

document.addEventListener('DOMContentLoaded', () => {
  let searchQuery = '';
  let severityFilter = 'ALL';
  let statusFilter = 'ALL';

  const tbody = document.getElementById('alerts-tbody');
  const countDisplay = document.getElementById('alert-count-display');

  function initAlerts() {
    renderAlerts();
    setupEventListeners();
  }

  function getProcessedAlerts() {
    let alerts = SolvantaStorage.getAlerts();

    if (searchQuery) {
      alerts = alerts.filter(a =>
        a.id.toLowerCase().includes(searchQuery) ||
        a.plantName.toLowerCase().includes(searchQuery) ||
        a.category.toLowerCase().includes(searchQuery) ||
        a.message.toLowerCase().includes(searchQuery)
      );
    }

    if (severityFilter !== 'ALL') {
      alerts = alerts.filter(a => a.severity === severityFilter);
    }
    if (statusFilter !== 'ALL') {
      alerts = alerts.filter(a => a.status === statusFilter);
    }

    return alerts;
  }

  function renderAlerts() {
    updateSummaryCounters();

    const alerts = getProcessedAlerts();
    if (countDisplay) {
      countDisplay.textContent = `Showing ${alerts.length} of ${SolvantaStorage.getAlerts().length} Alerts`;
    }

    if (alerts.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8">
            <div class="empty-state">
              <div class="empty-state-icon"><i data-lucide="shield-check"></i></div>
              <div class="empty-state-title">No matching alerts found</div>
              <div class="empty-state-desc">All filtered equipment is operating within normal operating bands.</div>
            </div>
          </td>
        </tr>
      `;
      SolvantaUI.initIcons();
      return;
    }

    tbody.innerHTML = alerts.map(a => {
      let sevBadge = '<span class="badge badge-info">Low</span>';
      if (a.severity === 'Critical') sevBadge = '<span class="badge badge-danger">Critical</span>';
      else if (a.severity === 'High') sevBadge = '<span class="badge badge-warning" style="background:#ffedd5; color:#c2410c;">High</span>';
      else if (a.severity === 'Medium') sevBadge = '<span class="badge badge-warning">Medium</span>';

      return `
        <tr>
          <td style="font-family:var(--font-mono); font-weight:700; color:#0f172a;">${SolvantaUtils.escapeHtml(a.id)}</td>
          <td>
            <div style="font-weight:600; color:#0f172a;">${SolvantaUtils.escapeHtml(a.plantName)}</div>
            <div style="font-size:11px; color:#64748b;">${SolvantaUtils.escapeHtml(a.plantId)}</div>
          </td>
          <td>${SolvantaUtils.escapeHtml(a.category)}</td>
          <td>${sevBadge}</td>
          <td style="max-width:280px;">
            <div class="truncate" title="${SolvantaUtils.escapeHtml(a.message)}">
              ${SolvantaUtils.escapeHtml(a.message)}
            </div>
          </td>
          <td style="font-size:11px; color:#64748b; white-space:nowrap;">
            ${SolvantaUtils.getRelativeTime(a.timestamp)}
          </td>
          <td>${SolvantaUI.getStatusBadge(a.status)}</td>
          <td style="text-align:right; white-space:nowrap;">
            <button class="btn btn-secondary btn-sm" onclick="viewAlertDetails('${a.id}')" title="Diagnostic View">
              <i data-lucide="info"></i> Details
            </button>
            ${a.status === 'Open' ? `
              <button class="btn btn-outline btn-sm" onclick="handleAcknowledge('${a.id}')" title="Acknowledge Fault">
                <i data-lucide="check"></i> Ack
              </button>
            ` : ''}
            ${a.status !== 'Resolved' ? `
              <button class="btn btn-emerald btn-sm" onclick="handleResolve('${a.id}')" title="Mark as Cleared / Resolved">
                <i data-lucide="check-circle-2"></i> Resolve
              </button>
            ` : ''}
          </td>
        </tr>
      `;
    }).join('');

    SolvantaUI.initIcons();
  }

  function updateSummaryCounters() {
    const alerts = SolvantaStorage.getAlerts();
    const critical = alerts.filter(a => a.severity === 'Critical' && a.status !== 'Resolved').length;
    const high = alerts.filter(a => a.severity === 'High' && a.status !== 'Resolved').length;
    const medium = alerts.filter(a => a.severity === 'Medium' && a.status !== 'Resolved').length;
    const resolved = alerts.filter(a => a.status === 'Resolved').length;

    const elCrit = document.getElementById('count-critical');
    const elCritText = document.getElementById('count-critical-text');
    const elHigh = document.getElementById('count-high');
    const elHighText = document.getElementById('count-high-text');
    const elMed = document.getElementById('count-medium');
    const elMedText = document.getElementById('count-medium-text');
    const elRes = document.getElementById('count-resolved');
    const elResText = document.getElementById('count-resolved-text');

    if (elCrit) elCrit.textContent = critical;
    if (elCritText) elCritText.textContent = `${critical} Active`;
    if (elHigh) elHigh.textContent = high;
    if (elHighText) elHighText.textContent = `${high} Active`;
    if (elMed) elMed.textContent = medium;
    if (elMedText) elMedText.textContent = `${medium} Active`;
    if (elRes) elRes.textContent = resolved;
    if (elResText) elResText.textContent = `${resolved} Cleared`;

    // Sync sidebar badge
    const badge = document.getElementById('sidebar-alert-badge');
    const openCount = alerts.filter(a => a.status === 'Open').length;
    if (badge) {
      if (openCount > 0) {
        badge.textContent = openCount;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  // View Alert Details Modal
  window.viewAlertDetails = function(alertId) {
    const alerts = SolvantaStorage.getAlerts();
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    const bodyHtml = `
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div style="background:#f8fafc; border:1px solid var(--border-light); border-radius:8px; padding:12px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:12px; font-weight:700; color:#0f172a; font-family:var(--font-mono);">${alert.id}</div>
            <div style="font-size:14px; font-weight:700; color:var(--primary-700); margin-top:2px;">${SolvantaUtils.escapeHtml(alert.plantName)}</div>
          </div>
          <div>${SolvantaUI.getStatusBadge(alert.status)}</div>
        </div>

        <div>
          <div style="font-size:11px; color:#64748b; text-transform:uppercase; font-weight:600;">Alert Classification &amp; Severity</div>
          <div style="font-size:14px; font-weight:700; color:#0f172a; margin-top:2px;">
            ${SolvantaUtils.escapeHtml(alert.category)} &bull; ${alert.severity} Severity
          </div>
        </div>

        <div>
          <div style="font-size:11px; color:#64748b; text-transform:uppercase; font-weight:600;">Telemetry Diagnostics Message</div>
          <div style="background:#f1f5f9; padding:10px 12px; border-radius:6px; font-size:13px; color:#1e293b; margin-top:4px; font-family:var(--font-mono);">
            ${SolvantaUtils.escapeHtml(alert.message)}
          </div>
        </div>

        <div>
          <div style="font-size:11px; color:#64748b; text-transform:uppercase; font-weight:600;">Standard Operating Procedure (SOP) Remediation</div>
          <div style="font-size:13px; color:#334155; margin-top:4px; line-height:1.5;">
            ${SolvantaUtils.escapeHtml(alert.remediation || 'Inspect physical DC disconnects and SCADA logging node.')}
          </div>
        </div>

        <div style="font-size:11px; color:#64748b; border-top:1px solid var(--border-light); padding-top:8px;">
          Timestamp: ${SolvantaUtils.formatDateTime(alert.timestamp)}
        </div>
      </div>
    `;

    SolvantaUI.modal({
      title: 'Telemetry Fault Diagnostic Inspection',
      bodyHtml,
      footerButtons: [
        {
          text: 'Schedule Corrective Maintenance',
          className: 'btn btn-primary',
          onClick: (close) => {
            close();
            window.location.href = `maintenance.html?plantId=${encodeURIComponent(alert.plantId)}&alertId=${encodeURIComponent(alert.id)}`;
          }
        },
        { text: 'Close', className: 'btn btn-secondary', onClick: (close) => close() }
      ]
    });
  };

  // Acknowledge Alert
  window.handleAcknowledge = function(alertId) {
    SolvantaStorage.acknowledgeAlert(alertId);
    SolvantaUI.toast(`Alert ${alertId} acknowledged by operator.`, 'info');
    renderAlerts();
  };

  // Resolve Alert
  window.handleResolve = function(alertId) {
    SolvantaStorage.resolveAlert(alertId);
    SolvantaUI.toast(`Alert ${alertId} marked as resolved. Normal telemetry restored.`, 'success');
    renderAlerts();
  };

  function setupEventListeners() {
    const searchInput = document.getElementById('alert-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderAlerts();
      });
    }

    const sevSelect = document.getElementById('alert-severity-filter');
    if (sevSelect) {
      sevSelect.addEventListener('change', (e) => {
        severityFilter = e.target.value;
        renderAlerts();
      });
    }

    const statSelect = document.getElementById('alert-status-filter');
    if (statSelect) {
      statSelect.addEventListener('change', (e) => {
        statusFilter = e.target.value;
        renderAlerts();
      });
    }

    // Simulate New Alert Button
    const simBtn = document.getElementById('simulate-alert-btn');
    if (simBtn) {
      simBtn.addEventListener('click', () => {
        const plants = SolvantaStorage.getPlants();
        const randPlant = plants[Math.floor(Math.random() * plants.length)];

        const faultPool = [
          { cat: 'Inverter Grid Trip', sev: 'Critical', msg: 'DC bus ground fault detected on Central Inverter INV-03.', rem: 'Check DC isolation resistance and cable insulation.' },
          { cat: 'Thermal Overheating', sev: 'High', msg: 'PV module backsheet thermistor exceeded 56.2°C.', rem: 'Verify junction box and combiner fan air velocity.' },
          { cat: 'Tracker Anomaly', sev: 'Medium', msg: 'Single-axis tracker array 14 azimuth deviation angle error.', rem: 'Recalibrate astronomical sun tracking algorithm drive.' }
        ];
        const selectedFault = faultPool[Math.floor(Math.random() * faultPool.length)];

        const newAlert = SolvantaStorage.addAlert({
          plantId: randPlant.id,
          plantName: randPlant.name,
          category: selectedFault.cat,
          severity: selectedFault.sev,
          message: selectedFault.msg,
          remediation: selectedFault.rem
        });

        SolvantaUI.toast(`New simulated alert [${newAlert.id}] generated on ${randPlant.name}!`, 'warning', 'Synthetic Fault Triggered');
        renderAlerts();
      });
    }
  }

  initAlerts();
});
