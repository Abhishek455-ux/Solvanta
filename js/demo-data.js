/**
 * SOLVANTA - Comprehensive Demo Dataset
 * All plant metrics, historical generation profiles, alerts, maintenance schedules,
 * and reports are simulated for high-fidelity evaluation and enterprise proof-of-concept demonstrations.
 */

const SolvantaDemoData = (() => {
  // 9 Realistic Fictional Indian Renewable Plants
  const plants = [
    {
      id: 'PLANT-SOL-01',
      name: 'Pavagada Solar Park Unit 4',
      type: 'Solar',
      state: 'Karnataka',
      location: 'Tumakuru District',
      capacityMW: 150,
      commissionDate: '2021-03-15',
      status: 'Operational',
      todayGenMWh: 785.4,
      monthGenMWh: 22450.8,
      yearGenMWh: 268400.0,
      availability: 99.4,
      performanceRatio: 82.6,
      tariffINR: 3.25,
      lastMaintenance: '2026-09-12',
      nextMaintenance: '2026-11-15',
      invertersCount: 48,
      invertersActive: 48,
      currentPowerKW: 114200,
      irradiance: 895, // W/m2
      ambientTemp: 32.4, // °C
      moduleTemp: 47.8, // °C
      gridFrequency: 50.02, // Hz
      gridVoltage: 33.2, // kV
      powerFactor: 0.99
    },
    {
      id: 'PLANT-SOL-02',
      name: 'Bhadla Solar Complex Phase II',
      type: 'Solar',
      state: 'Rajasthan',
      location: 'Phalodi / Jodhpur',
      capacityMW: 220,
      commissionDate: '2020-08-10',
      status: 'Operational',
      todayGenMWh: 1195.2,
      monthGenMWh: 34180.5,
      yearGenMWh: 408500.0,
      availability: 98.9,
      performanceRatio: 84.1,
      tariffINR: 2.85,
      lastMaintenance: '2026-08-28',
      nextMaintenance: '2026-11-20',
      invertersCount: 72,
      invertersActive: 71,
      currentPowerKW: 172600,
      irradiance: 940,
      ambientTemp: 38.2,
      moduleTemp: 54.1,
      gridFrequency: 49.98,
      gridVoltage: 33.1,
      powerFactor: 0.98
    },
    {
      id: 'PLANT-WND-03',
      name: 'Muppandal Wind Farm Alpha',
      type: 'Wind',
      state: 'Tamil Nadu',
      location: 'Kanyakumari Pass',
      capacityMW: 85,
      commissionDate: '2019-11-20',
      status: 'Operational',
      todayGenMWh: 462.1,
      monthGenMWh: 13240.2,
      yearGenMWh: 154800.0,
      availability: 97.6,
      performanceRatio: 78.4,
      tariffINR: 3.40,
      lastMaintenance: '2026-07-15',
      nextMaintenance: '2026-10-25',
      invertersCount: 34,
      invertersActive: 33,
      currentPowerKW: 58400,
      irradiance: 0,
      ambientTemp: 28.5,
      moduleTemp: 29.1,
      gridFrequency: 50.05,
      gridVoltage: 33.0,
      powerFactor: 0.97
    },
    {
      id: 'PLANT-SOL-04',
      name: 'Sakri Solar Energy Park',
      type: 'Solar',
      state: 'Maharashtra',
      location: 'Dhule District',
      capacityMW: 125,
      commissionDate: '2022-01-14',
      status: 'Degraded',
      todayGenMWh: 512.6,
      monthGenMWh: 16820.0,
      yearGenMWh: 198400.0,
      availability: 91.2,
      performanceRatio: 68.9,
      tariffINR: 3.65,
      lastMaintenance: '2026-09-01',
      nextMaintenance: '2026-10-18',
      invertersCount: 40,
      invertersActive: 32,
      currentPowerKW: 68900,
      irradiance: 840,
      ambientTemp: 34.0,
      moduleTemp: 52.3,
      gridFrequency: 50.01,
      gridVoltage: 32.9,
      powerFactor: 0.96
    },
    {
      id: 'PLANT-HYB-05',
      name: 'Jaisalmer Hybrid Eco-Energy',
      type: 'Hybrid',
      state: 'Rajasthan',
      location: 'Pokhran Corridor',
      capacityMW: 180,
      commissionDate: '2022-09-30',
      status: 'Operational',
      todayGenMWh: 1045.0,
      monthGenMWh: 30120.4,
      yearGenMWh: 358200.0,
      availability: 98.7,
      performanceRatio: 83.2,
      tariffINR: 3.10,
      lastMaintenance: '2026-08-10',
      nextMaintenance: '2026-12-05',
      invertersCount: 56,
      invertersActive: 56,
      currentPowerKW: 141200,
      irradiance: 910,
      ambientTemp: 36.8,
      moduleTemp: 51.4,
      gridFrequency: 50.00,
      gridVoltage: 33.2,
      powerFactor: 0.99
    },
    {
      id: 'PLANT-WND-06',
      name: 'Kutch Coastal Wind Project',
      type: 'Wind',
      state: 'Gujarat',
      location: 'Mandvi Coast',
      capacityMW: 110,
      commissionDate: '2021-06-18',
      status: 'Operational',
      todayGenMWh: 618.3,
      monthGenMWh: 18560.1,
      yearGenMWh: 219400.0,
      availability: 98.2,
      performanceRatio: 80.5,
      tariffINR: 3.15,
      lastMaintenance: '2026-09-20',
      nextMaintenance: '2026-11-30',
      invertersCount: 44,
      invertersActive: 44,
      currentPowerKW: 74200,
      irradiance: 0,
      ambientTemp: 31.2,
      moduleTemp: 31.8,
      gridFrequency: 49.99,
      gridVoltage: 33.0,
      powerFactor: 0.98
    },
    {
      id: 'PLANT-SOL-07',
      name: 'Charanka Solar Field Beta',
      type: 'Solar',
      state: 'Gujarat',
      location: 'Patan District',
      capacityMW: 95,
      commissionDate: '2020-02-28',
      status: 'Maintenance',
      todayGenMWh: 180.4,
      monthGenMWh: 11200.0,
      yearGenMWh: 142000.0,
      availability: 74.5,
      performanceRatio: 62.1,
      tariffINR: 3.35,
      lastMaintenance: '2026-10-08',
      nextMaintenance: '2026-10-12',
      invertersCount: 30,
      invertersActive: 12,
      currentPowerKW: 24500,
      irradiance: 820,
      ambientTemp: 33.5,
      moduleTemp: 49.0,
      gridFrequency: 50.04,
      gridVoltage: 32.8,
      powerFactor: 0.95
    },
    {
      id: 'PLANT-HYB-08',
      name: 'Ananthapur Hybrid Power Station',
      type: 'Hybrid',
      state: 'Andhra Pradesh',
      location: 'NP Kunta Belt',
      capacityMW: 140,
      commissionDate: '2023-04-12',
      status: 'Operational',
      todayGenMWh: 792.0,
      monthGenMWh: 23150.0,
      yearGenMWh: 271500.0,
      availability: 99.1,
      performanceRatio: 83.8,
      tariffINR: 3.20,
      lastMaintenance: '2026-09-05',
      nextMaintenance: '2026-12-10',
      invertersCount: 46,
      invertersActive: 46,
      currentPowerKW: 108400,
      irradiance: 875,
      ambientTemp: 31.8,
      moduleTemp: 46.5,
      gridFrequency: 50.01,
      gridVoltage: 33.1,
      powerFactor: 0.99
    },
    {
      id: 'PLANT-SOL-09',
      name: 'Osmanabad Solar Facility',
      type: 'Solar',
      state: 'Maharashtra',
      location: 'Osmanabad District',
      capacityMW: 75,
      commissionDate: '2023-11-05',
      status: 'Operational',
      todayGenMWh: 402.5,
      monthGenMWh: 11840.6,
      yearGenMWh: 139200.0,
      availability: 98.4,
      performanceRatio: 81.7,
      tariffINR: 3.50,
      lastMaintenance: '2026-08-22',
      nextMaintenance: '2026-11-18',
      invertersCount: 24,
      invertersActive: 24,
      currentPowerKW: 56100,
      irradiance: 860,
      ambientTemp: 32.0,
      moduleTemp: 48.2,
      gridFrequency: 50.02,
      gridVoltage: 33.0,
      powerFactor: 0.98
    }
  ];

  // Hourly curve generation for a plant (00:00 to 23:00)
  function generateHourlyCurve(plant) {
    const hours = [];
    const capacityKW = plant.capacityMW * 1000;
    const isSolar = plant.type === 'Solar';
    const isWind = plant.type === 'Wind';

    for (let h = 0; h < 24; h++) {
      const timeLabel = `${String(h).padStart(2, '0')}:00`;
      let genKW = 0;
      let irr = 0;

      if (isSolar) {
        // Solar bell curve: active between 6 AM and 18 PM
        if (h >= 6 && h <= 18) {
          const peakHour = 12.5;
          const dist = Math.abs(h - peakHour);
          const factor = Math.max(0, Math.cos((dist / 6.5) * (Math.PI / 2)));
          irr = Math.round(factor * 950);
          genKW = Math.round(capacityKW * 0.82 * Math.pow(factor, 1.2));
        }
      } else if (isWind) {
        // Wind has 24h stochastic curve, often stronger at night & late afternoon
        const windFactor = 0.35 + 0.3 * Math.sin((h / 24) * 2 * Math.PI) + 0.15 * Math.sin(h * 1.5);
        genKW = Math.round(capacityKW * Math.max(0.1, Math.min(0.9, windFactor)));
        irr = (h >= 6 && h <= 18) ? Math.round(500 * Math.sin(((h - 6) / 12) * Math.PI)) : 0;
      } else {
        // Hybrid: Solar component + Wind baseline
        let solarPart = 0;
        if (h >= 6 && h <= 18) {
          const factor = Math.max(0, Math.cos((Math.abs(h - 12.5) / 6.5) * (Math.PI / 2)));
          solarPart = (capacityKW * 0.5) * 0.82 * Math.pow(factor, 1.2);
          irr = Math.round(factor * 920);
        }
        const windPart = (capacityKW * 0.5) * (0.35 + 0.2 * Math.cos((h / 24) * 2 * Math.PI));
        genKW = Math.round(solarPart + windPart);
      }

      hours.push({
        hour: h,
        time: timeLabel,
        generationKW: genKW,
        generationMWh: +(genKW / 1000).toFixed(2),
        irradiance: irr
      });
    }
    return hours;
  }

  // 30 Days generation history for charts
  function generate30DaysHistory() {
    const list = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Daily totals across fleet with seasonal variation
      const baseSolar = 3200 + Math.sin(i / 5) * 450 + (i % 7 === 3 ? -600 : 150);
      const baseWind = 1150 + Math.cos(i / 4) * 320;
      const totalGenMWh = +(baseSolar + baseWind).toFixed(1);
      const targetMWh = 4250;

      list.push({
        date: dateStr,
        label: dayName,
        totalMWh: totalGenMWh,
        solarMWh: +baseSolar.toFixed(1),
        windMWh: +baseWind.toFixed(1),
        targetMWh: targetMWh,
        cuf: +((totalGenMWh / (1180 * 24)) * 100).toFixed(1),
        avgPR: +(79.5 + Math.sin(i) * 3.5).toFixed(1)
      });
    }
    return list;
  }

  // 12 Months historical generation
  const monthlyHistory = [
    { month: 'Oct 2025', actualMWh: 142300, targetMWh: 139000, pr: 82.1, revenueINR: 46250000 },
    { month: 'Nov 2025', actualMWh: 138900, targetMWh: 136000, pr: 81.8, revenueINR: 45140000 },
    { month: 'Dec 2025', actualMWh: 131200, targetMWh: 132000, pr: 80.5, revenueINR: 42640000 },
    { month: 'Jan 2026', actualMWh: 135400, targetMWh: 134000, pr: 81.0, revenueINR: 44005000 },
    { month: 'Feb 2026', actualMWh: 144800, targetMWh: 141000, pr: 83.4, revenueINR: 47060000 },
    { month: 'Mar 2026', actualMWh: 161200, targetMWh: 156000, pr: 84.6, revenueINR: 52390000 },
    { month: 'Apr 2026', actualMWh: 168900, targetMWh: 164000, pr: 83.8, revenueINR: 54890000 },
    { month: 'May 2026', actualMWh: 174500, targetMWh: 172000, pr: 82.9, revenueINR: 56710000 },
    { month: 'Jun 2026', actualMWh: 152100, targetMWh: 158000, pr: 79.2, revenueINR: 49430000 },
    { month: 'Jul 2026', actualMWh: 141800, targetMWh: 148000, pr: 78.5, revenueINR: 46080000 },
    { month: 'Aug 2026', actualMWh: 146300, targetMWh: 151000, pr: 79.1, revenueINR: 47540000 },
    { month: 'Sep 2026', actualMWh: 158700, targetMWh: 155000, pr: 82.4, revenueINR: 51570000 }
  ];

  // Realistic Alerts
  const initialAlerts = [
    {
      id: 'ALT-1092',
      plantId: 'PLANT-SOL-04',
      plantName: 'Sakri Solar Energy Park',
      category: 'Inverter Fault',
      severity: 'Critical',
      message: 'Inverter block INV-04 tripped due to IGBT DC over-voltage spike.',
      timestamp: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
      status: 'Open',
      remediation: 'Inspect DC bus disconnect and surge arrester in Unit 4.'
    },
    {
      id: 'ALT-1088',
      plantId: 'PLANT-SOL-07',
      plantName: 'Charanka Solar Field Beta',
      category: 'Grid Anomaly',
      severity: 'High',
      message: 'Grid substational frequency dipped below 49.85 Hz; 18 inverters curtailed.',
      timestamp: new Date(Date.now() - 145 * 60 * 1000).toISOString(),
      status: 'Acknowledged',
      remediation: 'Monitor SLDC grid curtailment dispatch notification.'
    },
    {
      id: 'ALT-1082',
      plantId: 'PLANT-SOL-02',
      plantName: 'Bhadla Solar Complex Phase II',
      category: 'Temperature Warning',
      severity: 'Medium',
      message: 'PV module temperature exceeded 54.0°C; heat thermal derating active (-4.2%).',
      timestamp: new Date(Date.now() - 320 * 60 * 1000).toISOString(),
      status: 'Acknowledged',
      remediation: 'Track ambient heat index; verify inverter cabin airflow fans.'
    },
    {
      id: 'ALT-1076',
      plantId: 'PLANT-WND-03',
      plantName: 'Muppandal Wind Farm Alpha',
      category: 'Mechanical Warning',
      severity: 'Medium',
      message: 'Turbine WTG-07 yaw drive vibration index elevated above 2.4 mm/s RMS.',
      timestamp: new Date(Date.now() - 720 * 60 * 1000).toISOString(),
      status: 'Open',
      remediation: 'Schedule acoustic probe vibration diagnostic check.'
    },
    {
      id: 'ALT-1065',
      plantId: 'PLANT-SOL-01',
      plantName: 'Pavagada Solar Park Unit 4',
      category: 'Low Irradiance Anomaly',
      severity: 'Low',
      message: 'String box SMB-12 current generation discrepancy (-14% vs peer strings).',
      timestamp: new Date(Date.now() - 1440 * 60 * 1000).toISOString(),
      status: 'Resolved',
      remediation: 'Completed thermal drone inspection; cleaned soiling deposit on string 12.'
    }
  ];

  // Realistic Maintenance Records
  const initialMaintenance = [
    {
      id: 'MNT-2041',
      plantId: 'PLANT-SOL-07',
      plantName: 'Charanka Solar Field Beta',
      type: 'Corrective',
      description: 'Central Inverter INV-02 capacitor bank replacement & harmonic test',
      scheduledDate: '2026-10-10',
      completedDate: null,
      technician: 'Kishore Varma',
      priority: 'High',
      status: 'In Progress',
      costINR: 125000
    },
    {
      id: 'MNT-2038',
      plantId: 'PLANT-SOL-04',
      plantName: 'Sakri Solar Energy Park',
      type: 'Preventive',
      description: 'Scheduled semi-annual dry robotic panel cleaning on blocks A through D',
      scheduledDate: '2026-10-18',
      completedDate: null,
      technician: 'Ramesh Patil',
      priority: 'Medium',
      status: 'Scheduled',
      costINR: 85000
    },
    {
      id: 'MNT-2032',
      plantId: 'PLANT-WND-03',
      plantName: 'Muppandal Wind Farm Alpha',
      type: 'Inspection',
      description: 'Drone aerodynamic blade ultrasonic crack detection on WTG-01 to 08',
      scheduledDate: '2026-10-25',
      completedDate: null,
      technician: 'Senthil Nathan',
      priority: 'Medium',
      status: 'Scheduled',
      costINR: 140000
    },
    {
      id: 'MNT-2025',
      plantId: 'PLANT-SOL-01',
      plantName: 'Pavagada Solar Park Unit 4',
      type: 'Preventive',
      description: 'Transformer 33kV bushing insulation resistance test & oil filtration',
      scheduledDate: '2026-09-12',
      completedDate: '2026-09-12',
      technician: 'Anand Kumar',
      priority: 'Low',
      status: 'Completed',
      costINR: 65000
    },
    {
      id: 'MNT-2019',
      plantId: 'PLANT-HYB-05',
      plantName: 'Jaisalmer Hybrid Eco-Energy',
      type: 'Preventive',
      description: 'SCADA telemetry fiber optic splice box maintenance & calibration',
      scheduledDate: '2026-08-10',
      completedDate: '2026-08-10',
      technician: 'Vikram Shekhawat',
      priority: 'Low',
      status: 'Completed',
      costINR: 42000
    }
  ];

  // Initial Report History
  const initialReports = [
    {
      id: 'RPT-2026-0901',
      title: 'Monthly Performance Review - All Plants',
      reportType: 'Monthly Performance',
      plantId: 'ALL',
      plantName: 'All Portfolio Plants (9 Plants)',
      period: 'September 2026',
      generatedDate: '2026-10-01T10:30:00Z',
      fileFormat: 'PDF',
      metricsIncluded: ['Generation', 'CUF', 'PR', 'Revenue', 'CO2']
    },
    {
      id: 'RPT-2026-0915',
      title: 'Plant Health & Availability Audit',
      reportType: 'Plant Health',
      plantId: 'PLANT-SOL-04',
      plantName: 'Sakri Solar Energy Park',
      period: 'Q3 2026',
      generatedDate: '2026-09-15T14:45:00Z',
      fileFormat: 'PDF',
      metricsIncluded: ['Inverter Status', 'Trips', 'Losses', 'Recommendations']
    },
    {
      id: 'RPT-2026-1005',
      title: 'Daily Generation Log - Bhadla Solar Phase II',
      reportType: 'Daily Generation',
      plantId: 'PLANT-SOL-02',
      plantName: 'Bhadla Solar Complex Phase II',
      period: '2026-10-05',
      generatedDate: '2026-10-06T08:15:00Z',
      fileFormat: 'PDF',
      metricsIncluded: ['Hourly Curve', 'Peak Irradiance', 'Revenue']
    }
  ];

  // Default User & App Settings
  const defaultSettings = {
    organizationName: 'Solvanta Clean Energy Corp',
    userDisplayName: 'Aditya Sharma',
    userRole: 'Plant Operations Lead',
    reportBranding: 'Solvanta Intelligence Reports',
    defaultCurrency: 'INR',
    energyUnit: 'MWh',
    emissionsFactor: 0.82, // Tonnes CO2 / MWh
    lowGenThresholdPercent: 65,
    autoSimulation: true,
    simulationIntervalSec: 4
  };

  return {
    plants,
    generateHourlyCurve,
    generate30DaysHistory,
    monthlyHistory,
    initialAlerts,
    initialMaintenance,
    initialReports,
    defaultSettings
  };
})();
