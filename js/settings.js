/**
 * ABHIVANTA - Settings & Data Management Controller
 * System preferences, JSON export & import backups, and factory demo data reset.
 */

document.addEventListener('DOMContentLoaded', () => {
  function initSettings() {
    loadSettings();
    setupEventListeners();
  }

  function loadSettings() {
    const s = AbhivantaStorage.getSettings();
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

    AbhivantaStorage.updateSettings(updated);
    AbhivantaUI.toast('Application preferences saved successfully.', 'success');

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
        const jsonStr = AbhivantaStorage.exportJSON();
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Abhivanta_Fleet_Backup_${Date.now().toString().slice(-6)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        AbhivantaUI.toast('JSON application backup downloaded successfully.', 'success');
      });
    }

    // Factory Reset
    const resetBtn = document.getElementById('factory-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        AbhivantaUI.confirm(
          'Factory Demo Dataset Reset',
          'Are you sure you want to restore the pristine fictional demo fleet? Any custom added plants or modified records will be reset to default.',
          () => {
            AbhivantaStorage.resetToDefault();
            AbhivantaUI.toast('Demo dataset reset to initial state. Reloading...', 'info');
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
      const res = AbhivantaStorage.importJSON(content);
      if (res.success) {
        AbhivantaUI.toast(res.message, 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        AbhivantaUI.toast(`Import Failed: ${res.message}`, 'danger');
      }
    };
    reader.onerror = function() {
      AbhivantaUI.toast('Failed to read uploaded file.', 'danger');
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };


  // ==========================================
  // SCADA CSV TELEMETRY & DATA INGESTION ENGINE
  // ==========================================
  function initCSVIngestionHub() {
    const categorySelect = document.getElementById('csv-category-select');
    const modeSelect = document.getElementById('csv-mode-select');
    const downloadTemplateBtn = document.getElementById('btn-download-csv-template');
    const dropzone = document.getElementById('csv-dropzone');
    const fileInput = document.getElementById('csv-file-input');
    const fileBadge = document.getElementById('csv-file-badge');
    const fileNameSpan = document.getElementById('csv-file-name');
    const fileSizeSpan = document.getElementById('csv-file-size');
    const previewContainer = document.getElementById('csv-preview-container');
    const previewThead = document.getElementById('csv-preview-thead');
    const previewTbody = document.getElementById('csv-preview-tbody');
    const rowsCountBadge = document.getElementById('csv-rows-count');
    const commitBtn = document.getElementById('btn-commit-csv-data');
    const clearBtn = document.getElementById('btn-clear-csv');
    const successBanner = document.getElementById('csv-success-banner');
    const successTitle = document.getElementById('csv-success-title');
    const successDesc = document.getElementById('csv-success-desc');

    if (!dropzone || !fileInput) return;

    let parsedHeaders = [];
    let parsedRows = [];
    let currentFile = null;

    // Sample CSV Templates
    const templates = {
      'daily-gen': {
        filename: 'Abhivanta_Daily_Generation_Telemetry_Template.csv',
        content: `Date,Plant_ID,Generation_MWh,Irradiance_W_m2,PR_Percent,Module_Temp_C,Ambient_Temp_C
2026-10-25,RAJ-01,895.4,912,83.4,48.2,33.5
2026-10-26,RAJ-01,910.2,925,83.9,49.1,34.0
2026-10-27,RAJ-02,642.8,885,82.7,46.5,32.8
2026-10-28,GUJ-01,725.0,890,82.2,47.0,33.2
2026-10-29,MAH-01,330.6,860,81.5,45.8,31.9
2026-10-30,KAR-01,512.4,875,82.0,46.2,32.1`
      },
      'ci-banking': {
        filename: 'Abhivanta_CI_OpenAccess_Banking_Template.csv',
        content: `TimeBlock,Export_kWh,Wheeling_Loss_kWh,Net_Banked_kWh,Captive_Drawal_kWh,Savings_INR
Block 74 (18:15-18:30),28550,1199,27351,22400,196200
Block 73 (18:00-18:15),29120,1223,27897,22800,198400
Block 72 (17:45-18:00),31400,1318,30082,23100,214500
Block 71 (17:30-17:45),33200,1394,31806,23500,228000
Block 70 (17:15-17:30),35800,1503,34297,24000,245800`
      },
      'inverter-health': {
        filename: 'Abhivanta_Inverter_Health_Audit_Template.csv',
        content: `Inverter_ID,Plant_ID,IGBT_Temp_C,Status,Efficiency_Percent,Fault_Code
INV-01,RAJ-01,58.2,Nominal,98.8,NORMAL
INV-02,RAJ-01,61.5,Nominal,98.6,NORMAL
INV-03,RAJ-01,59.8,Nominal,98.7,NORMAL
INV-04,RAJ-01,92.4,Thermal Stress,96.2,ALM_IGBT_OVERHEAT
INV-05,RAJ-01,63.0,Nominal,98.5,NORMAL
INV-06,RAJ-01,60.4,Nominal,98.7,NORMAL`
      },
      'trading-bids': {
        filename: 'Abhivanta_IEX_Trading_Bids_Template.csv',
        content: `TimeBlock,Market_Type,Bid_MW,Clearing_Price_INR,Declared_MW,Actual_MW
Block 74 (18:15-18:30),RTM,15.0,6.42,112.5,114.2
Block 73 (18:00-18:15),RTM,15.0,6.38,112.5,114.1
Block 72 (17:45-18:00),GDAM,12.0,5.85,110.0,110.9
Block 71 (17:30-17:45),GDAM,12.0,5.70,110.0,110.7
Block 70 (17:15-17:30),DAM,10.0,5.18,108.0,108.2`
      }
    };

    // 1. Download Template Handler
    if (downloadTemplateBtn) {
      downloadTemplateBtn.addEventListener('click', () => {
        const cat = categorySelect.value;
        const tmpl = templates[cat] || templates['daily-gen'];
        const blob = new Blob([tmpl.content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = tmpl.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        AbhivantaUI.toast(`Downloaded template: ${tmpl.filename}`, 'info');
      });
    }

    // 2. Dropzone Click & Drag Events
    dropzone.addEventListener('click', () => fileInput.click());

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.style.borderColor = '#10b981';
        dropzone.style.background = '#dcfce7';
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.style.borderColor = 'rgba(16,185,129,0.4)';
        dropzone.style.background = '#f0fdf4';
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        processCSVFile(files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        processCSVFile(e.target.files[0]);
      }
    });

    // 3. Process & Parse CSV File
    function processCSVFile(file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        AbhivantaUI.toast('Please select a valid .csv file.', 'warning');
        return;
      }

      currentFile = file;
      fileNameSpan.textContent = file.name;
      fileSizeSpan.textContent = (file.size / 1024).toFixed(1) + ' KB';
      fileBadge.style.display = 'inline-flex';
      clearBtn.style.display = 'inline-flex';
      if (successBanner) successBanner.style.display = 'none';

      const reader = new FileReader();
      reader.onload = function(evt) {
        const text = evt.target.result;
        parseCSVText(text);
      };
      reader.onerror = function() {
        AbhivantaUI.toast('Error reading CSV file.', 'danger');
      };
      reader.readAsText(file);
    }

    // Resilient RFC 4180 CSV parser
    function parseCSVText(text) {
      const lines = text.split(/\r\n|\n|\r/).filter(l => l.trim().length > 0);
      if (lines.length < 2) {
        AbhivantaUI.toast('CSV file appears empty or missing data rows.', 'warning');
        return;
      }

      parsedHeaders = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
      parsedRows = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        // Split with respect to potential comma inside quotes
        const values = [];
        let cur = '';
        let inQuotes = false;
        for (let c = 0; c < line.length; c++) {
          const char = line[c];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(cur.trim().replace(/^["']|["']$/g, ''));
            cur = '';
          } else {
            cur += char;
          }
        }
        values.push(cur.trim().replace(/^["']|["']$/g, ''));

        if (values.length === parsedHeaders.length) {
          const rowObj = {};
          parsedHeaders.forEach((hdr, idx) => {
            rowObj[hdr] = values[idx];
          });
          parsedRows.push(rowObj);
        }
      }

      if (parsedRows.length === 0) {
        AbhivantaUI.toast('Could not parse any valid rows. Please check headers.', 'danger');
        return;
      }

      renderPreviewTable();
    }

    // 4. Render Preview Table
    function renderPreviewTable() {
      previewThead.innerHTML = `<tr>${parsedHeaders.map(h => `<th>${h}</th>`).join('')}</tr>`;
      
      const topRows = parsedRows.slice(0, 5);
      previewTbody.innerHTML = topRows.map(r => `
        <tr>
          ${parsedHeaders.map(h => `<td style="font-family:var(--font-mono);">${r[h] || ''}</td>`).join('')}
        </tr>
      `).join('');

      rowsCountBadge.textContent = `${parsedRows.length} Records Detected`;
      previewContainer.style.display = 'block';

      commitBtn.disabled = false;
      commitBtn.style.opacity = '1';
      commitBtn.style.cursor = 'pointer';

      if (window.lucide) lucide.createIcons();
    }

    // 5. Clear Handler
    clearBtn.addEventListener('click', () => {
      currentFile = null;
      parsedHeaders = [];
      parsedRows = [];
      fileInput.value = '';
      fileBadge.style.display = 'none';
      previewContainer.style.display = 'none';
      clearBtn.style.display = 'none';
      commitBtn.disabled = true;
      commitBtn.style.opacity = '0.6';
      commitBtn.style.cursor = 'not-allowed';
      if (successBanner) successBanner.style.display = 'none';
    });

    // 6. Commit / Ingest Data to SCADA
    commitBtn.addEventListener('click', () => {
      if (parsedRows.length === 0) return;

      const category = categorySelect.value;
      const mode = modeSelect.value;

      commitBtn.disabled = true;
      commitBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Ingesting Telemetry...';

      setTimeout(() => {
        const result = AbhivantaStorage.importCSVData(category, parsedRows, mode);
        
        commitBtn.innerHTML = '<i data-lucide="check"></i> Telemetry Ingested!';
        commitBtn.classList.remove('btn-emerald');
        commitBtn.classList.add('btn-primary');

        if (successBanner) {
          successTitle.textContent = `Ingestion Successful: ${parsedRows.length} Records Ingested!`;
          successDesc.textContent = `All records have been parsed and committed into the active SCADA storage under ${categorySelect.options[categorySelect.selectedIndex].text}.`;
          successBanner.style.display = 'flex';
          successBanner.scrollIntoView({ behavior: 'smooth' });
        }

        AbhivantaUI.toast(`Successfully ingested ${parsedRows.length} CSV records!`, 'success');
        if (window.lucide) lucide.createIcons();
      }, 500);
    });
  }

  initCSVIngestionHub();
  initSettings();
});
