/**
 * ABHIVANTA - Comprehensive Demo Dataset
 * All plant metrics, historical generation profiles, alerts, maintenance schedules,
 * and reports are simulated for high-fidelity evaluation and enterprise proof-of-concept demonstrations.
 */

const AbhivantaDemoData = (() => {
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

  // 6 Dedicated Utility-Scale BESS (Battery Energy Storage System) Assets
  const bessFleet = [
    {
      id: 'BESS-RAJ-01',
      name: 'Bhadla 60 MW / 240 MWh LFP BESS Bank',
      plantId: 'PLANT-SOL-02',
      plantName: 'Bhadla Solar Complex Phase II',
      chemistry: 'LFP (Lithium Iron Phosphate)',
      ratedPowerMW: 60,
      ratedCapacityMWh: 240,
      durationHours: 4,
      status: 'Discharging',
      socPercent: 78.4,
      sohPercent: 98.6,
      currentPowerMW: 42.5, // positive = discharge, negative = charge
      cellTempC: 28.4,
      coolingSystem: 'Active Liquid Cooled R134a',
      cycleCount: 642,
      roundTripEfficiency: 89.2, // %
      busVoltageKV: 33.0,
      rackCount: 32,
      racksOnline: 32,
      dailyChargeMWh: 188.4,
      dailyDischargeMWh: 168.1,
      todayArbitrageRevenueINR: 425000,
      dispatchMode: 'Arbitrage Peak Discharge',
      cFactor: '0.25C',
      hvacPowerKW: 145,
      fireSuppression: 'Aerosol Novec 1230 Normal'
    },
    {
      id: 'BESS-KAR-02',
      name: 'Pavagada 40 MW / 160 MWh Hybrid BESS',
      plantId: 'PLANT-SOL-01',
      plantName: 'Pavagada Solar Park Unit 4',
      chemistry: 'LFP (Lithium Iron Phosphate)',
      ratedPowerMW: 40,
      ratedCapacityMWh: 160,
      durationHours: 4,
      status: 'Standby / Float',
      socPercent: 94.2,
      sohPercent: 99.1,
      currentPowerMW: 0.0,
      cellTempC: 25.8,
      coolingSystem: 'Active Liquid Cooled',
      cycleCount: 488,
      roundTripEfficiency: 90.1,
      busVoltageKV: 33.0,
      rackCount: 20,
      racksOnline: 20,
      dailyChargeMWh: 142.0,
      dailyDischargeMWh: 128.0,
      todayArbitrageRevenueINR: 310000,
      dispatchMode: 'Frequency Response (FCR Standby)',
      cFactor: '0.25C',
      hvacPowerKW: 98,
      fireSuppression: 'Aerosol Novec 1230 Normal'
    },
    {
      id: 'BESS-JAI-03',
      name: 'Jaisalmer 50 MW / 200 MWh Wind-Solar Firming BESS',
      plantId: 'PLANT-HYB-05',
      plantName: 'Jaisalmer Hybrid Eco-Energy',
      chemistry: 'LFP Grid-Scale Containerized',
      ratedPowerMW: 50,
      ratedCapacityMWh: 200,
      durationHours: 4,
      status: 'Discharging',
      socPercent: 62.1,
      sohPercent: 97.9,
      currentPowerMW: 35.0,
      cellTempC: 29.1,
      coolingSystem: 'Dual Loop Liquid Chilled',
      cycleCount: 814,
      roundTripEfficiency: 88.7,
      busVoltageKV: 33.0,
      rackCount: 26,
      racksOnline: 26,
      dailyChargeMWh: 165.5,
      dailyDischargeMWh: 146.8,
      todayArbitrageRevenueINR: 382000,
      dispatchMode: 'Wind Ramp Smoothing & Arbitrage',
      cFactor: '0.25C',
      hvacPowerKW: 120,
      fireSuppression: 'Aerosol Novec 1230 Normal'
    },
    {
      id: 'BESS-KUT-04',
      name: 'Kutch Coastal 30 MW / 60 MWh High-C BESS',
      plantId: 'PLANT-WND-06',
      plantName: 'Kutch Coastal Wind Project',
      chemistry: 'LFP Fast-Dispatch',
      ratedPowerMW: 30,
      ratedCapacityMWh: 60,
      durationHours: 2,
      status: 'Charging',
      socPercent: 44.5,
      sohPercent: 99.4,
      currentPowerMW: -24.0,
      cellTempC: 27.2,
      coolingSystem: 'Active HVAC Liquid Cooling',
      cycleCount: 390,
      roundTripEfficiency: 91.0,
      busVoltageKV: 33.0,
      rackCount: 16,
      racksOnline: 16,
      dailyChargeMWh: 54.2,
      dailyDischargeMWh: 49.3,
      todayArbitrageRevenueINR: 195000,
      dispatchMode: 'Sub-second Synthetic Inertia',
      cFactor: '0.5C',
      hvacPowerKW: 85,
      fireSuppression: 'Aerosol Novec 1230 Normal'
    },
    {
      id: 'BESS-ANA-05',
      name: 'Ananthapur 35 MW / 140 MWh Co-located Storage',
      plantId: 'PLANT-HYB-08',
      plantName: 'Ananthapur Hybrid Power Station',
      chemistry: 'LFP Container Bank',
      ratedPowerMW: 35,
      ratedCapacityMWh: 140,
      durationHours: 4,
      status: 'Discharging',
      socPercent: 71.0,
      sohPercent: 98.2,
      currentPowerMW: 28.5,
      cellTempC: 28.0,
      coolingSystem: 'Active Liquid Cooled',
      cycleCount: 520,
      roundTripEfficiency: 89.5,
      busVoltageKV: 33.0,
      rackCount: 18,
      racksOnline: 18,
      dailyChargeMWh: 110.0,
      dailyDischargeMWh: 98.5,
      todayArbitrageRevenueINR: 260000,
      dispatchMode: 'Peak Shaving Evening Discharging',
      cFactor: '0.25C',
      hvacPowerKW: 92,
      fireSuppression: 'Aerosol Novec 1230 Normal'
    },
    {
      id: 'BESS-SAK-06',
      name: 'Sakri 25 MW / 100 MWh Grid Support BESS',
      plantId: 'PLANT-SOL-04',
      plantName: 'Sakri Solar Energy Park',
      chemistry: 'LFP Container System',
      ratedPowerMW: 25,
      ratedCapacityMWh: 100,
      durationHours: 4,
      status: 'Standby / Float',
      socPercent: 88.0,
      sohPercent: 96.8,
      currentPowerMW: 0.0,
      cellTempC: 26.5,
      coolingSystem: 'Active Liquid Cooled',
      cycleCount: 670,
      roundTripEfficiency: 88.2,
      busVoltageKV: 33.0,
      rackCount: 14,
      racksOnline: 13,
      dailyChargeMWh: 82.0,
      dailyDischargeMWh: 72.3,
      todayArbitrageRevenueINR: 185000,
      dispatchMode: 'Grid Voltage Stability & Derating Cushion',
      cFactor: '0.25C',
      hvacPowerKW: 75,
      fireSuppression: 'Aerosol Novec 1230 Normal'
    }
  ];

  // Generate 24-hour Diurnal BESS Charge/Discharge Profile (Indian Market Day-Ahead)
  function generateBessDiurnalCurve(bess) {
    const hours = [];
    const pMax = bess.ratedPowerMW;
    // Typical India TOD Tariff: Solar surplus mid-day (charge negative MW), Evening peak 18:30-22:30 (discharge positive MW)
    for (let h = 0; h < 24; h++) {
      const timeLabel = `${String(h).padStart(2, '0')}:00`;
      let powerMW = 0;
      let soc = 50;
      let tariffINR = 3.2;

      if (h >= 0 && h < 6) {
        // Night float
        powerMW = 0;
        soc = 35 + h * 0.5;
        tariffINR = 3.0;
      } else if (h >= 6 && h < 10) {
        // Morning mild dispatch / baseline
        powerMW = +(pMax * 0.15).toFixed(1);
        soc = 38 - (h - 6) * 2;
        tariffINR = 4.2;
      } else if (h >= 10 && h < 16) {
        // Solar soak / Heavy mid-day charging (negative MW)
        powerMW = -+(pMax * 0.75 * Math.sin(((h - 10) / 6) * Math.PI)).toFixed(1);
        soc = 32 + (h - 10) * 11;
        tariffINR = 2.4; // Cheap solar surplus
      } else if (h >= 16 && h < 18) {
        // Pre-peak transition standby
        powerMW = 0;
        soc = 96;
        tariffINR = 4.5;
      } else if (h >= 18 && h < 23) {
        // Evening Grid Peak Discharging (positive MW)
        powerMW = +(pMax * 0.85).toFixed(1);
        soc = 96 - (h - 18) * 16;
        tariffINR = 8.5; // High merchant peak tariff
      } else {
        // Night baseline
        powerMW = +(pMax * 0.1).toFixed(1);
        soc = 34;
        tariffINR = 3.1;
      }

      hours.push({
        hour: h,
        time: timeLabel,
        powerMW: powerMW,
        socPercent: Math.min(100, Math.max(10, Math.round(soc))),
        tariffINR: tariffINR
      });
    }
    return hours;
  }

  // Default User & App Settings
  const defaultSettings = {
    organizationName: 'Abhivanta Clean Energy Corp',
    userDisplayName: 'Aditya Sharma',
    userRole: 'Plant Operations Lead',
    reportBranding: 'Abhivanta Intelligence Reports',
    defaultCurrency: 'INR',
    energyUnit: 'MWh',
    emissionsFactor: 0.82, // Tonnes CO2 / MWh
    lowGenThresholdPercent: 65,
    autoSimulation: true,
    simulationIntervalSec: 4
  };

  return {
    plants,
    bessFleet,
    generateHourlyCurve,
    generateBessDiurnalCurve,
    generate30DaysHistory,
    monthlyHistory,
    initialAlerts,
    initialMaintenance,
    initialReports,
    defaultSettings
  };
})();
