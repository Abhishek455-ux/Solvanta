/**
 * SOLVANTA - Persistent Storage Layer
 * Manages localStorage with versioning, safe error handling, schema migration,
 * JSON export/import backups, and reset capability.
 */

const SolvantaStorage = (() => {
  const STORAGE_KEY = 'SOLVANTA_DATA_V1.0';

  // Initialize store if not present
  function initStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return resetToDefault();
      }
      const parsed = JSON.parse(raw);
      // Basic sanity check
      if (!parsed.plants || !Array.isArray(parsed.plants) || parsed.plants.length === 0) {
        return resetToDefault();
      }
      return parsed;
    } catch (e) {
      console.warn('SolvantaStorage: LocalStorage parse failure, resetting to defaults.', e);
      return resetToDefault();
    }
  }

  // Get current store state
  function getStore() {
    return initStore();
  }

  // Save state
  function saveStore(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('SolvantaStorage: Failed to persist data to localStorage.', e);
      return false;
    }
  }

  // Reset to initial demo dataset
  function resetToDefault() {
    const defaultData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      plants: JSON.parse(JSON.stringify(SolvantaDemoData.plants)),
      alerts: JSON.parse(JSON.stringify(SolvantaDemoData.initialAlerts)),
      maintenance: JSON.parse(JSON.stringify(SolvantaDemoData.initialMaintenance)),
      reports: JSON.parse(JSON.stringify(SolvantaDemoData.initialReports)),
      settings: JSON.parse(JSON.stringify(SolvantaDemoData.defaultSettings)),
      history30Days: SolvantaDemoData.generate30DaysHistory(),
      monthlyHistory: JSON.parse(JSON.stringify(SolvantaDemoData.monthlyHistory))
    };
    saveStore(defaultData);
    return defaultData;
  }

  // ==================== PLANTS CRUD ====================
  function getPlants() {
    const store = getStore();
    return store.plants || [];
  }

  function getPlant(id) {
    const plants = getPlants();
    return plants.find(p => p.id === id) || null;
  }

  function addPlant(plant) {
    const store = getStore();
    // Validate uniqueness
    if (store.plants.some(p => p.id.toUpperCase() === plant.id.toUpperCase())) {
      throw new Error(`Plant with ID '${plant.id}' already exists.`);
    }

    // Default attributes
    const newPlant = {
      ...plant,
      todayGenMWh: Number(plant.todayGenMWh) || 0,
      monthGenMWh: Number(plant.monthGenMWh) || 0,
      yearGenMWh: Number(plant.yearGenMWh) || 0,
      availability: Number(plant.availability) || 98.0,
      performanceRatio: Number(plant.performanceRatio) || 80.0,
      tariffINR: Number(plant.tariffINR) || 3.30,
      invertersCount: Number(plant.invertersCount) || Math.round(plant.capacityMW / 3),
      invertersActive: Number(plant.invertersActive) || Math.round(plant.capacityMW / 3),
      currentPowerKW: Math.round(plant.capacityMW * 800),
      irradiance: plant.type === 'Solar' ? 850 : 0,
      ambientTemp: 32,
      moduleTemp: plant.type === 'Solar' ? 48 : 32,
      gridFrequency: 50.0,
      gridVoltage: 33.0,
      powerFactor: 0.98
    };

    store.plants.unshift(newPlant);
    saveStore(store);
    return newPlant;
  }

  function updatePlant(id, updatedFields) {
    const store = getStore();
    const index = store.plants.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Plant with ID '${id}' not found.`);
    }
    store.plants[index] = { ...store.plants[index], ...updatedFields };
    saveStore(store);
    return store.plants[index];
  }

  function deletePlant(id) {
    const store = getStore();
    const initialLen = store.plants.length;
    store.plants = store.plants.filter(p => p.id !== id);
    if (store.plants.length === initialLen) {
      throw new Error(`Plant with ID '${id}' not found.`);
    }
    saveStore(store);
    return true;
  }

  // ==================== ALERTS CRUD ====================
  function getAlerts() {
    const store = getStore();
    return store.alerts || [];
  }

  function addAlert(alert) {
    const store = getStore();
    const newAlert = {
      id: alert.id || SolvantaUtils.generateUUID('ALT'),
      plantId: alert.plantId,
      plantName: alert.plantName || 'General Plant Warning',
      category: alert.category || 'System Alert',
      severity: alert.severity || 'Medium',
      message: alert.message,
      timestamp: alert.timestamp || new Date().toISOString(),
      status: 'Open',
      remediation: alert.remediation || 'Inspect SCADA telemetry status.'
    };
    store.alerts.unshift(newAlert);
    saveStore(store);
    return newAlert;
  }

  function acknowledgeAlert(id) {
    const store = getStore();
    const alert = store.alerts.find(a => a.id === id);
    if (alert) {
      alert.status = 'Acknowledged';
      saveStore(store);
      return alert;
    }
    return null;
  }

  function resolveAlert(id) {
    const store = getStore();
    const alert = store.alerts.find(a => a.id === id);
    if (alert) {
      alert.status = 'Resolved';
      saveStore(store);
      return alert;
    }
    return null;
  }

  // ==================== MAINTENANCE CRUD ====================
  function getMaintenance() {
    const store = getStore();
    return store.maintenance || [];
  }

  function addMaintenance(record) {
    const store = getStore();
    const newRecord = {
      id: record.id || SolvantaUtils.generateUUID('MNT'),
      plantId: record.plantId,
      plantName: record.plantName,
      type: record.type || 'Preventive',
      description: record.description,
      scheduledDate: record.scheduledDate,
      completedDate: record.status === 'Completed' ? (record.completedDate || SolvantaUtils.getTodayISO()) : null,
      technician: record.technician || 'Plant Staff',
      priority: record.priority || 'Medium',
      status: record.status || 'Scheduled',
      costINR: Number(record.costINR) || 0
    };
    store.maintenance.unshift(newRecord);
    saveStore(store);
    return newRecord;
  }

  function updateMaintenance(id, fields) {
    const store = getStore();
    const index = store.maintenance.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Maintenance record not found');
    store.maintenance[index] = { ...store.maintenance[index], ...fields };
    if (fields.status === 'Completed' && !store.maintenance[index].completedDate) {
      store.maintenance[index].completedDate = SolvantaUtils.getTodayISO();
    }
    saveStore(store);
    return store.maintenance[index];
  }

  function deleteMaintenance(id) {
    const store = getStore();
    store.maintenance = store.maintenance.filter(m => m.id !== id);
    saveStore(store);
    return true;
  }

  // ==================== REPORTS CRUD ====================
  function getReports() {
    const store = getStore();
    return store.reports || [];
  }

  function saveReport(reportMeta) {
    const store = getStore();
    const newReport = {
      id: reportMeta.id || SolvantaUtils.generateUUID('RPT'),
      title: reportMeta.title || 'Plant Performance Report',
      reportType: reportMeta.reportType || 'Custom Report',
      plantId: reportMeta.plantId || 'ALL',
      plantName: reportMeta.plantName || 'Fleet Portfolio',
      period: reportMeta.period || SolvantaUtils.formatDate(new Date()),
      generatedDate: new Date().toISOString(),
      fileFormat: reportMeta.fileFormat || 'PDF',
      metricsIncluded: reportMeta.metricsIncluded || ['Generation', 'CUF', 'PR']
    };
    store.reports.unshift(newReport);
    saveStore(store);
    return newReport;
  }

  function deleteReport(id) {
    const store = getStore();
    store.reports = store.reports.filter(r => r.id !== id);
    saveStore(store);
    return true;
  }

  // ==================== SETTINGS CRUD ====================
  function getSettings() {
    const store = getStore();
    return store.settings || SolvantaDemoData.defaultSettings;
  }

  function updateSettings(newSettings) {
    const store = getStore();
    store.settings = { ...store.settings, ...newSettings };
    saveStore(store);
    return store.settings;
  }

  // ==================== BACKUP & RESTORE ====================
  function exportJSON() {
    const store = getStore();
    return JSON.stringify(store, null, 2);
  }

  function importJSON(jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.plants || !Array.isArray(parsed.plants)) {
        throw new Error('Invalid JSON format: Missing "plants" array.');
      }
      // Save and return
      saveStore(parsed);
      return { success: true, message: `Successfully restored ${parsed.plants.length} plants and data records.` };
    } catch (e) {
      return { success: false, message: e.message || 'JSON parse error.' };
    }
  }

  return {
    initStore,
    getStore,
    resetToDefault,
    getPlants,
    getPlant,
    addPlant,
    updatePlant,
    deletePlant,
    getAlerts,
    addAlert,
    acknowledgeAlert,
    resolveAlert,
    getMaintenance,
    addMaintenance,
    updateMaintenance,
    deleteMaintenance,
    getReports,
    saveReport,
    deleteReport,
    getSettings,
    updateSettings,
    exportJSON,
    importJSON
  };
})();
