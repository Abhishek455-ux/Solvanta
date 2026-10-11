/**
 * SOLVANTA - Settings & Data Management Controller
 * System preferences, JSON export & import backups, and factory demo data reset.
 */

document.addEventListener('DOMContentLoaded', () => {
  function initSettings() {
    loadSettings();
    setupEventListeners();
  }

  function loadSettings() {
    const s = SolvantaStorage.getSettings();
    const org = document.getElementById('setting-org-name');
    const user = document.getElementById('setting-user-name');
    const role = document.getElementById('setting-user-role');
    const brand = document.getElementById('setting-report-brand');
    const curr = document.getElementById('setting-currency');
    const unit = document.getElementById('setting-unit');
    const em = document.getElementById('setting-emissions');
    const th = document.getElementById('setting-threshold');

    if (org && s.organizationName) org.value = s.organizationName;
    if (user && s.userDisplayName) user.value = s.userDisplayName;
    if (role && s.userRole) role.value = s.userRole;
    if (brand && s.reportBranding) brand.value = s.reportBranding;
    if (curr && s.defaultCurrency) curr.value = s.defaultCurrency;
    if (unit && s.energyUnit) unit.value = s.energyUnit;
    if (em && s.emissionsFactor) em.value = s.emissionsFactor;
    if (th && s.lowGenThresholdPercent) th.value = s.lowGenThresholdPercent;
  }

  window.handleSaveSettings = function(e) {
    e.preventDefault();
    const updated = {
      organizationName: document.getElementById('setting-org-name').value.trim(),
      userDisplayName: document.getElementById('setting-user-name').value.trim(),
      userRole: document.getElementById('setting-user-role').value.trim(),
      reportBranding: document.getElementById('setting-report-brand').value.trim(),
      defaultCurrency: document.getElementById('setting-currency').value,
      energyUnit: document.getElementById('setting-unit').value,
      emissionsFactor: parseFloat(document.getElementById('setting-emissions').value) || 0.82,
      lowGenThresholdPercent: parseFloat(document.getElementById('setting-threshold').value) || 65
    };

    SolvantaStorage.updateSettings(updated);
    SolvantaUI.toast('Application preferences saved successfully.', 'success');

    // Update displayed user in sidebar
    const sideName = document.querySelector('.sidebar-user .user-name');
    const sideRole = document.querySelector('.sidebar-user .user-role');
    if (sideName) sideName.textContent = updated.userDisplayName;
    if (sideRole) sideRole.textContent = updated.userRole;
  };

  function setupEventListeners() {
    // Export JSON Backup
    const exportBtn = document.getElementById('export-json-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const jsonStr = SolvantaStorage.exportJSON();
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Solvanta_Fleet_Backup_${Date.now().toString().slice(-6)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        SolvantaUI.toast('JSON application backup downloaded successfully.', 'success');
      });
    }

    // Factory Reset
    const resetBtn = document.getElementById('factory-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        SolvantaUI.confirm(
          'Factory Demo Dataset Reset',
          'Are you sure you want to restore the pristine fictional demo fleet? Any custom added plants or modified records will be reset to default.',
          () => {
            SolvantaStorage.resetToDefault();
            SolvantaUI.toast('Demo dataset reset to initial state. Reloading...', 'info');
            setTimeout(() => {
              window.location.reload();
            }, 800);
          },
          'Confirm Factory Reset',
          true
        );
      });
    }
  }

  // Handle JSON Import
  window.handleImportJSON = function(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
      const content = evt.target.result;
      const res = SolvantaStorage.importJSON(content);
      if (res.success) {
        SolvantaUI.toast(res.message, 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        SolvantaUI.toast(`Import Failed: ${res.message}`, 'danger');
      }
    };
    reader.onerror = function() {
      SolvantaUI.toast('Failed to read uploaded file.', 'danger');
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  initSettings();
});
