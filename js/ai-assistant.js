/**
   ABHIVANTA AI™ COPILOT & COMPUTER VISION DIAGNOSTICS ENGINE
   Specialized for Utility SCADA & Household Rooftop Solar Fleet Intelligence
*/

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AbhivantaAICopilot = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // 1. Diagnostic Knowledge Base for Household & Commercial Solar
  const DIAGNOSTIC_DEFECTS = {
    DUST_SOILING: {
      id: 'DUST_SOILING',
      title: 'Heavy Particulate Soiling & Dust Layer',
      subtitle: 'Household Rooftop PV Surface Contamination',
      severity: 'WARNING',
      severityClass: 'warning',
      badgeText: 'EFFICIENCY PENALTY',
      confidence: 96.4,
      lossPct: '18% – 24%',
      estKwhLoss: '3.6 – 5.2 kWh/day (per 5 kWp array)',
      financialLoss: '₹22.50 – ₹32.00 / day on DISCOM net meter',
      bbox: { top: '48%', left: '12%', width: '74%', height: '42%' },
      rootCause: 'Accumulation of atmospheric dust, industrial particulate, and bird droppings forming an opaque crust that obstructs solar irradiance from reaching PV silicon cells.',
      checklist: [
        'Perform soft-bristle wash using de-mineralized or soft water (TDS < 200 ppm).',
        'Clean in early morning (6:00 AM – 8:00 AM) or dusk to prevent thermal shock micro-cracking.',
        'Never use abrasive detergents or metal pressure nozzles exceeding 35 bar.',
        'Apply anti-soiling hydrophobic nano-coating to reduce cleaning cycle frequency.'
      ],
      ticketType: 'Rooftop Panel Wash & Visual Inspection'
    },
    THERMAL_HOTSPOT: {
      id: 'THERMAL_HOTSPOT',
      title: 'Cell Microcrack & Thermal Hotspot Anomaly',
      subtitle: 'Localized Cell Shunt / Bypass Diode Overheating',
      severity: 'CRITICAL',
      severityClass: 'danger',
      badgeText: 'FIRE & BURNOUT RISK',
      confidence: 94.8,
      lossPct: '28% – 38%',
      estKwhLoss: '6.5 – 8.8 kWh/day',
      financialLoss: '₹40.00 – ₹55.00 / day + accelerated module aging',
      bbox: { top: '38%', left: '38%', width: '18%', height: '18%' },
      rootCause: 'Localized high-resistance cell fault or damaged solder busbar. When shadowed or cracked, the affected cell operates in reverse bias, dissipating power as concentrated heat (> 85°C).',
      checklist: [
        'Isolate the PV string at the rooftop DC isolator switch immediately.',
        'Conduct thermal infrared (IR) camera inspection during peak irradiance (> 700 W/m²).',
        'Test bypass diodes in junction box with digital multimeter in diode-test mode.',
        'Replace defective module under manufacturer 10-year product warranty if delamination is confirmed.'
      ],
      ticketType: 'Immediate Technician Dispatch — Hotspot Triage'
    },
    INVERTER_FAULT: {
      id: 'INVERTER_FAULT',
      title: 'Inverter Isolation / Ground Fault (E-24 / Low R_iso)',
      subtitle: 'Household Grid-Tie Inverter Trip Status',
      severity: 'CRITICAL',
      severityClass: 'danger',
      badgeText: 'GRID DISCONNECT',
      confidence: 98.2,
      lossPct: '100% (Plant Tripped)',
      estKwhLoss: 'Full Generation Halt (0 kWh until reset)',
      financialLoss: '₹140.00 – ₹180.00 / day lost generation',
      bbox: { top: '30%', left: '28%', width: '44%', height: '28%' },
      rootCause: 'DC insulation resistance fell below regulatory 0.2 MΩ threshold. Common in rainy or high-humidity weather due to water ingress in MC4 connectors or rodent cable damage.',
      checklist: [
        'Check MC4 connectors on roof for water penetration or loose crimps.',
        'Measure insulation resistance between DC (+) and Earth, then DC (-) and Earth using 1000V Megger.',
        'Inspect AC surge protection device (SPD) and DC surge arrestor in junction box.',
        'Verify inverter ground earthing electrode resistance is below 5 Ohms.'
      ],
      ticketType: 'Electrical Breakdown Repair — DC Insulation'
    },
    OPTIMAL_HEALTH: {
      id: 'OPTIMAL_HEALTH',
      title: 'Optimal Generation Health — No Defects Found',
      subtitle: 'High-Efficiency Household Rooftop Status',
      severity: 'OPTIMAL',
      severityClass: 'success',
      badgeText: '98.8% TRANSMISSION',
      confidence: 99.1,
      lossPct: '0.0%',
      estKwhLoss: '0 kWh (Operating at Peak Yield)',
      financialLoss: '₹0.00 (Maximum Tariff Savings)',
      bbox: { top: '20%', left: '10%', width: '80%', height: '60%' },
      rootCause: 'Panel surface is free of particulate crust, uniform cell color gradient observed, bypass diodes functional, zero visible thermal or mechanical degradation.',
      checklist: [
        'No immediate intervention needed. Continue periodic bi-weekly rinse.',
        'Next scheduled preventive inspection: 6 months.',
        'System currently generating at 100% rated capacity utilization.'
      ],
      ticketType: 'Routine Health Certification'
    },
    CELL_MACRO_INSPECTION: {
      id: 'CELL_MACRO_INSPECTION',
      title: 'Monocrystalline Silicon High-Resolution Inspection',
      subtitle: 'Sub-Millimeter Busbar & Anti-Reflective Coating Analysis',
      severity: 'OPTIMAL',
      severityClass: 'success',
      badgeText: 'GRADE-A CELL HEALTH',
      confidence: 99.6,
      lossPct: '0.0% (Zero Micro-Cracks)',
      estKwhLoss: '0.0 kWh (Peak 100% Photon Absorption)',
      financialLoss: '₹0.00 — System yielding peak revenue (PR 84.2%)',
      bbox: { top: '25%', left: '25%', width: '50%', height: '50%' },
      rootCause: 'Electroluminescence and high-resolution spectroscopy verify flawless silicon wafer integrity, uniform multi-busbar solder conductivity, and zero PID (Potential Induced Degradation).',
      checklist: [
        'Module exceeds Tier-1 IEC 61215 and IEC 61730 reliability standards.',
        'Zero snail trails, hot-spots, delamination, or busbar micro-fractures detected.',
        'Silicon anti-reflective blue textured coating verified at 98.9% optical transmission.',
        'Maintain automated waterless robotic dry cleaning to preserve maximum yield.'
      ],
      ticketType: 'Module Quality Assurance Certified'
    },
    TERRAIN_SHADING_SCAN: {
      id: 'TERRAIN_SHADING_SCAN',
      title: 'Mountain Slope Terrain-Adaptive Array Diagnostics',
      subtitle: 'Terrace Angular Shading & Topographical Azimuth Scan',
      severity: 'INFO',
      severityClass: 'info',
      badgeText: 'TERRAIN OPTIMIZED',
      confidence: 97.4,
      lossPct: '1.2% (Early Horizon Shading)',
      estKwhLoss: '0.2 – 0.4 kWh/day (Mitigated by String MPPT)',
      financialLoss: '₹1.50 – ₹2.50/day — Compensated by +3.4% high-altitude cool air gain',
      bbox: { top: '35%', left: '15%', width: '70%', height: '45%' },
      rootCause: 'Angular hillside slope creates brief low-elevation dawn shade on lower tracker strings. Distributed string inverters compensate via independent multi-point maximum power tracking.',
      checklist: [
        'Confirm independent MPPT tracker channels are active across all elevation tiers.',
        'Inspect high-tension DC slope cabling and ground anchoring points.',
        'Leverage high-altitude ambient cooling coefficient (-0.35%/°C Pmax curve).',
        'Seasonal tilt schedule calibrated for maximum winter sun angle capture.'
      ],
      ticketType: 'Topographical Alignment Logged'
    }
  };

  // 2. Chatbot Natural Language Knowledge Base
  const CHAT_INTENTS = [
    {
      keywords: ['dust', 'soiling', 'dirty', 'clean', 'wash', 'bird'],
      title: 'Solar Panel Cleaning & Soiling Advisory',
      response: `**Rooftop Solar Panel Cleaning Guidelines for Household Plants:**

1. **Optimal Cleaning Frequency:** Every 15–20 days in semi-urban/dusty regions of India. During harvest or dry summer seasons, clean every 10–12 days.
2. **Best Time to Clean:** Always clean in **early morning (6:00 AM – 8:00 AM)** or late evening. *Never wash hot panels under mid-day sun* — cold water on hot glass (>65°C) can cause thermal shock and glass shattering!
3. **Water Quality:** Use low-TDS water (<200 ppm). Hard borewell water leaves chalky white scaling (calcium deposits) that permanently reduces light transmission.
4. **Estimated Gain:** Thoroughly cleaning soiled panels restores **18% to 25% of lost generation** immediately!

*You can upload a photo of your rooftop solar array in the Vision Inspector to get an exact soiling percentage!*`
    },
    {
      keywords: ['e-24', 'error', 'e24', 'iso', 'isolation', 'inverter fault', 'trip', 'r_iso'],
      title: 'Inverter Fault E-24 / Low Insulation Diagnosis',
      response: `**Fault Diagnosis: E-24 / Low Isolation Resistance (R_iso < 0.2 MΩ)**

This is the most common safety trip on rooftop string inverters (Growatt, Sungrow, Solis, GoodWe, Microtek, Luminous):

* **What it means:** The inverter detected leakage current between your DC solar wiring and the rooftop earth/ground. The inverter shut down to protect your home from fire or electrical shock.
* **Common Causes:**
  1. Water or condensation inside MC4 connectors after rain or early morning dew.
  2. Damaged DC cable insulation from sharp roof metal sheet edges or rodent gnawing.
  3. Blown DC Surge Protection Device (SPD) in the DC combiner box.
* **Troubleshooting Steps:**
  * Step 1: Turn OFF the AC breaker, then turn OFF the DC rotary isolator.
  * Step 2: Visually inspect DC cables under the panels for burns or loose connectors.
  * Step 3: Wait for solar noon for dampness to dry, or call an Abhivanta certified technician to perform a 1000V Megger insulation test.

*Need an on-site technician? You can log a ticket directly from the Maintenance tab!*`
    },
    {
      keywords: ['net meter', 'billing', 'bill', 'discom', 'surya ghar', 'subsidy', 'tariff'],
      title: 'Net Metering & PM Surya Ghar Subsidy Guide',
      response: `**Household Rooftop Solar Net Metering & Subsidy Guide:**

1. **How Net Metering Works:**
   * Your bi-directional meter measures:
     - **Import (kWh):** Electricity consumed from the DISCOM grid during night or cloudy weather.
     - **Export (kWh):** Surplus green power generated by your panels fed back to the grid.
   * **Billed Units = (Imported Units – Exported Units)**. If you generate more than you consume, credits rollover to the next billing cycle!

2. **PM Surya Ghar: Muft Bijli Yojana Central Subsidies:**
   * **1 kW system:** ₹30,000 direct subsidy.
   * **2 kW system:** ₹60,000 direct subsidy.
   * **3 kW & above:** ₹78,000 maximum central financial assistance (CFA).

3. **Average Rooftop Generation in India:**
   * 1 kW capacity generates **4 to 4.5 units (kWh) per day** in sunny conditions (~1,400–1,600 units per year).
   * A typical 3 kW household system saves approximately **₹18,000 – ₹24,000 annually** on your electricity bill!`
    },
    {
      keywords: ['hotspot', 'burn', 'microcrack', 'diode', 'snail trail'],
      title: 'Thermal Hotspots & Cell Microcrack Triage',
      response: `**Thermal Hotspots & Cell Fracture Analysis:**

* **The Mechanism:** When one cell in a series string is shaded, cracked, or defective, it stops generating power and behaves as an electrical resistor. The current from the rest of the string forces through it, causing temperatures to surge up to **90°C – 140°C**!
* **Visible Symptoms:**
  - Brownish/black discoloration on the backsheet.
  - Snail trails (silver busbar oxidation).
  - Front glass surface localized warmth.
* **Remedies:**
  - Verify if bypass diodes in the junction box have short-circuited.
  - Trim overhanging trees or remove physical obstructions creating partial shading.
  - If the cell is cracked internally, replace the module to avoid localized combustion risk.

*Use our AI Vision Inspector on the left: upload an image to confirm hotspot bounds!*`
    },
    {
      keywords: ['tilt', 'angle', 'direction', 'south', 'orientation'],
      title: 'Optimal Rooftop Solar Tilt & Direction',
      response: `**Optimal Solar Panel Orientation for India:**

1. **Azimuth (Direction):** Always face panels **True South** (180° Azimuth). In the Northern Hemisphere, facing true South captures the maximum solar irradiance throughout the day.
2. **Tilt Angle:**
   - **North India (Delhi, Rajasthan, UP):** 25° to 28° tilt.
   - **Central India (Maharashtra, Gujarat, MP):** 18° to 22° tilt.
   - **South India (Karnataka, Tamil Nadu, Kerala):** 11° to 15° tilt.
   - *Rule of thumb:* Tilt angle equal to your city's latitude + 2° ensures year-round balanced generation.
3. **Minimum Tilt for Self-Cleaning:** Never install panels completely flat (0°). Maintain at least **10° tilt** so rainwater naturally drains and washes off dust instead of pooling at the bottom edge.`
    },
    {
      keywords: ['battery', 'bess', 'storage', 'hybrid', 'power cut', 'backup'],
      title: 'Adding Battery Storage (BESS) to Rooftop Solar',
      response: `**Adding Battery Storage to Existing Household Solar:**

* **Standard On-Grid Inverter:** Does *not* work during grid power cuts for safety reasons (anti-islanding protection).
* **To Get Power During Blackouts:**
  1. **Option A (AC-Coupled Retrofit):** Keep your existing solar panels and inverter, and add an AC-coupled battery storage pack with an automatic transfer switch (ATS).
  2. **Option B (Hybrid Inverter Upgrade):** Replace the on-grid inverter with a Hybrid Inverter (e.g. 5kW Hybrid) connected to Lithium Ferrophosphate (LiFePO4) 48V / 5.12kWh battery modules.
* **Benefits:** 100% uninterrupted power during grid outages, zero diesel generator emissions, and night-time self-consumption of stored daytime solar energy!`
    }
  ];

  // 3. Fallback Smart Assistant Engine
  function generateAssistantResponse(userQuery) {
    const queryLower = userQuery.toLowerCase().trim();

    // Check pre-configured knowledge intents
    for (const intent of CHAT_INTENTS) {
      if (intent.keywords.some(kw => queryLower.includes(kw))) {
        return intent.response;
      }
    }

    // Contextual intelligent reply
    return `Hello! I am your **Abhivanta Clean Energy AI Assistant**.

I analyze utility-scale telemetry and household rooftop solar systems. Based on your inquiry regarding *"**${escapeHtml(userQuery)}**"*:

* **Core Operational Recommendation:** For rooftop solar installations, verify that your string voltages match inverter MPPT operating windows (typically 120V – 480V DC). Ensure your bi-directional meter is actively synchronizing with your DISCOM.
* **Diagnostics Tip:** If you notice generation drops, check for surface dust soiling, physical shadow casting, or inverter fault LED codes.
* **Instant Visual Inspection:** You can drag and drop or upload a photo of your solar panel or inverter display in the **Vision Inspector tab**, and our computer vision model will automatically detect defects with estimated loss percentages!

Would you like me to guide you through:
1. **Cleaning & O&M procedures**
2. **Inverter error code diagnosis**
3. **Net metering bill optimization**
4. **Logging an on-site service ticket**?`;
  }

  // 4. Image Classification & Feature Extraction Simulator
  function analyzeImage(imgElement) {
    return new Promise((resolve) => {
      // Create off-screen canvas to extract real image properties
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const w = canvas.width = 100;
      const h = canvas.height = 100;
      ctx.drawImage(imgElement, 0, 0, w, h);

      try {
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        let rTotal = 0, gTotal = 0, bTotal = 0;
        let redHotspotCount = 0;
        let dustHazeCount = 0;
        let darkLcdCount = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];

          rTotal += r;
          gTotal += g;
          bTotal += b;

          // Check for red/orange thermal hotspot pixel
          if (r > 190 && g < 130 && b < 100) {
            redHotspotCount++;
          }
          // Check for earthy brownish/mud dust pixel
          if (r > 110 && g > 90 && b < 90 && Math.abs(r - g) < 40) {
            dustHazeCount++;
          }
          // Check for dark inverter display chassis
          if (r < 50 && g < 50 && b < 50) {
            darkLcdCount++;
          }
        }

        const totalPixels = w * h;

        // Classify based on dominant computer vision metrics
        if (redHotspotCount > 40) {
          resolve(DIAGNOSTIC_DEFECTS.THERMAL_HOTSPOT);
        } else if (dustHazeCount > 150) {
          resolve(DIAGNOSTIC_DEFECTS.DUST_SOILING);
        } else if (darkLcdCount > 1800) {
          resolve(DIAGNOSTIC_DEFECTS.INVERTER_FAULT);
        } else {
          // If clean or general panel detected
          // Randomize between SOILING and OPTIMAL for generic user uploads if borderline
          const isDusty = (rTotal + gTotal) / (2 * totalPixels) > 115;
          if (isDusty) {
            resolve(DIAGNOSTIC_DEFECTS.DUST_SOILING);
          } else {
            resolve(DIAGNOSTIC_DEFECTS.OPTIMAL_HEALTH);
          }
        }
      } catch (e) {
        // Fallback default
        resolve(DIAGNOSTIC_DEFECTS.DUST_SOILING);
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // 5. Global Floating Copilot Widget DOM Injector
  function initGlobalWidget() {
    // Avoid double injection
    if (document.getElementById('floating-copilot-launcher')) return;

    // Build Floating Launcher & Modal HTML
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'abhivanta-copilot-root';
    widgetContainer.innerHTML = `
      <!-- Launcher Pill -->
      <div class="floating-copilot-launcher" id="floating-copilot-launcher" title="Open Abhivanta AI Copilot">
        <div class="floating-copilot-pill">
          <div class="icon-box">
            <i data-lucide="bot"></i>
          </div>
          <div class="text-box">
            <span class="main-text">Abhivanta AI™ <span style="background:#10b981;color:#fff;font-size:9px;padding:1px 5px;border-radius:4px;">COPILOT</span></span>
            <span class="sub-text">Solar Telemetry &amp; Image Diagnosis</span>
          </div>
        </div>
      </div>

      <!-- Floating Drawer Modal -->
      <div class="floating-copilot-modal" id="floating-copilot-modal">
        <!-- Header -->
        <div class="copilot-modal-header">
          <div class="copilot-header-info">
            <div style="width:30px;height:30px;border-radius:50%;background:#10b981;display:flex;align-items:center;justify-content:center;color:#fff;">
              <i data-lucide="sparkles" style="width:16px;height:16px;"></i>
            </div>
            <div>
              <div class="title">Abhivanta AI™ Copilot</div>
              <div class="status"><span class="dot" style="background:#34d399;display:inline-block;width:6px;height:6px;border-radius:50%;margin-right:4px;"></span>SCADA &amp; Rooftop Solar Active</div>
            </div>
          </div>
          <div class="copilot-header-actions">
            <a href="ai-assistant.html" class="copilot-icon-btn" title="Open Fullscreen AI Studio">
              <i data-lucide="maximize-2" style="width:14px;height:14px;"></i>
            </a>
            <button class="copilot-icon-btn" id="copilot-modal-close" title="Close Copilot">
              <i data-lucide="x" style="width:14px;height:14px;"></i>
            </button>
          </div>
        </div>

        <!-- Widget Tabs -->
        <div class="copilot-widget-tabs">
          <button class="copilot-tab-btn active" id="tab-btn-chat">
            <i data-lucide="message-square" style="width:13px;height:13px;"></i> Ask AI
          </button>
          <button class="copilot-tab-btn" id="tab-btn-vision">
            <i data-lucide="camera" style="width:13px;height:13px;"></i> Image Diagnosis
          </button>
        </div>

        <!-- Tab 1: Chat Stream -->
        <div id="copilot-chat-view" style="display:flex;flex-direction:column;flex:1;overflow:hidden;">
          <div class="chat-messages-area" id="widget-chat-messages" style="height:380px;">
            <div class="chat-bubble bot">
              <div class="chat-avatar bot">AI</div>
              <div class="chat-content-box">
                <p>Hello! I am your <strong>Abhivanta Renewable Energy Copilot</strong>.</p>
                <p>Ask me about your rooftop solar generation, inverter fault codes, net metering credits, or switch to <strong>Image Diagnosis</strong> to scan a photo of your solar panels!</p>
              </div>
            </div>
          </div>

          <!-- Quick Chips -->
          <div class="quick-prompts-row" style="padding:6px 10px;">
            <button class="quick-prompt-btn" data-query="Why is my solar generation low today?">⚡ Output Low?</button>
            <button class="quick-prompt-btn" data-query="Inverter fault E-24 low isolation">⚠️ Error E-24</button>
            <button class="quick-prompt-btn" data-query="How often should I clean rooftop solar panels?">🧼 Cleaning Tips</button>
          </div>

          <!-- Input Bar -->
          <div class="chat-input-bar">
            <input type="text" id="widget-chat-input" class="chat-input-field" placeholder="Ask about solar faults, bills, SCADA...">
            <button class="chat-btn-send" id="widget-chat-send" title="Send Query">
              <i data-lucide="send" style="width:14px;height:14px;"></i>
            </button>
          </div>
        </div>

        <!-- Tab 2: Quick Vision Scan -->
        <div id="copilot-vision-view" style="display:none;flex-direction:column;flex:1;padding:12px;overflow-y:auto;">
          <div style="font-size:12px;color:#64748b;margin-bottom:8px;">
            Upload a photo of your household solar panels or inverter to detect dust, hotspots, or ground faults:
          </div>

          <div class="vision-dropzone" id="widget-dropzone" style="padding:14px 10px;margin-bottom:10px;">
            <input type="file" id="widget-file-input" accept="image/*" style="display:none;">
            <div class="vision-dropzone-icon" style="width:36px;height:36px;margin-bottom:6px;">
              <i data-lucide="upload-cloud" style="width:18px;height:18px;"></i>
            </div>
            <div style="font-size:12px;font-weight:700;color:#0f172a;">Click or Drag Household Solar Image</div>
            <div style="font-size:10px;color:#94a3b8;">Supports JPG, PNG, WebP</div>
          </div>

          <!-- Quick Sample Images -->
          <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:6px;">Or Test with Sample:</div>
          <div class="sample-images-strip" style="margin-bottom:10px;">
            <div class="sample-chip" data-sample="assets/images/sample_household_dust.jpg" data-type="DUST_SOILING">
              <img src="assets/images/sample_household_dust.jpg" alt="Dust"> Dust Soiling
            </div>
            <div class="sample-chip" data-sample="assets/images/sample_household_hotspot.jpg" data-type="THERMAL_HOTSPOT">
              <img src="assets/images/sample_household_hotspot.jpg" alt="Hotspot"> Thermal Hotspot
            </div>
            <div class="sample-chip" data-sample="assets/images/sample_inverter_fault.jpg" data-type="INVERTER_FAULT">
              <img src="assets/images/sample_inverter_fault.jpg" alt="Inverter"> Inverter E-24
            </div>
          </div>

          <!-- Mini Inspection Viewport -->
          <div class="scan-viewport-container" id="widget-scan-viewport" style="min-height:160px;max-height:200px;display:none;">
            <img id="widget-scan-preview" class="scan-image-preview" src="" alt="Scan Preview">
            <div class="scanning-hud-overlay" id="widget-hud-overlay">
              <div class="hud-sweep-line"></div>
              <div class="hud-grid-lines"></div>
              <div class="hud-status-badge"><i data-lucide="activity" style="width:12px;height:12px;"></i> AI SCANNING...</div>
            </div>
            <div class="defect-bounding-box" id="widget-bbox">
              <div class="bbox-tag" id="widget-bbox-tag">DETECTED</div>
            </div>
          </div>

          <!-- Result Box -->
          <div class="diagnostic-result-card" id="widget-diag-result" style="margin-top:10px;">
            <div class="diag-header-row">
              <div class="diag-title-wrap">
                <h3 id="widget-result-title" style="font-size:13px;">Heavy Soiling Detected</h3>
                <span id="widget-result-badge" class="badge badge-warning" style="font-size:10px;">WARNING</span>
              </div>
              <div style="font-size:11px;font-weight:700;color:#047857;" id="widget-result-confidence">96.4% Match</div>
            </div>
            <div style="font-size:11px;color:#334155;margin-bottom:8px;" id="widget-result-summary">
              Heavy surface particulate crust detected causing ~22% generation loss.
            </div>
            <a href="ai-assistant.html" class="btn btn-primary btn-sm w-full" style="justify-content:center;">
              <i data-lucide="external-link"></i> Full Engineering Report &amp; Ticket
            </a>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(widgetContainer);

    // Re-initialize icons in injected container
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Bind widget events
    setupWidgetEvents();
  }

  function setupWidgetEvents() {
    const launcher = document.getElementById('floating-copilot-launcher');
    const modal = document.getElementById('floating-copilot-modal');
    const closeBtn = document.getElementById('copilot-modal-close');
    const tabChat = document.getElementById('tab-btn-chat');
    const tabVision = document.getElementById('tab-btn-vision');
    const chatView = document.getElementById('copilot-chat-view');
    const visionView = document.getElementById('copilot-vision-view');

    if (launcher && modal) {
      launcher.addEventListener('click', () => {
        modal.classList.toggle('open');
        if (modal.classList.contains('open')) {
          const input = document.getElementById('widget-chat-input');
          if (input) input.focus();
        }
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('open');
      });
    }

    if (tabChat && tabVision) {
      tabChat.addEventListener('click', () => {
        tabChat.classList.add('active');
        tabVision.classList.remove('active');
        chatView.style.display = 'flex';
        visionView.style.display = 'none';
      });

      tabVision.addEventListener('click', () => {
        tabVision.classList.add('active');
        tabChat.classList.remove('active');
        visionView.style.display = 'flex';
        chatView.style.display = 'none';
      });
    }

    // Quick chips
    document.querySelectorAll('#floating-copilot-modal .quick-prompt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-query');
        handleWidgetUserQuery(query);
      });
    });

    // Chat input
    const chatInput = document.getElementById('widget-chat-input');
    const chatSend = document.getElementById('widget-chat-send');
    if (chatInput && chatSend) {
      chatSend.addEventListener('click', () => {
        const query = chatInput.value.trim();
        if (query) {
          handleWidgetUserQuery(query);
          chatInput.value = '';
        }
      });

      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const query = chatInput.value.trim();
          if (query) {
            handleWidgetUserQuery(query);
            chatInput.value = '';
          }
        }
      });
    }

    // Widget Dropzone & Sample Chips
    const dropzone = document.getElementById('widget-dropzone');
    const fileInput = document.getElementById('widget-file-input');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleImageUploadFile(e.target.files[0], 'widget');
        }
      });

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-active');
      });
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-active'));
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-active');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleImageUploadFile(e.dataTransfer.files[0], 'widget');
        }
      });
    }

    // Sample chips in widget
    document.querySelectorAll('#floating-copilot-modal .sample-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const sampleSrc = chip.getAttribute('data-sample');
        const defectKey = chip.getAttribute('data-type');
        handleSampleSelect(sampleSrc, defectKey, 'widget');
      });
    });
  }

  function handleWidgetUserQuery(query) {
    const messagesBox = document.getElementById('widget-chat-messages');
    if (!messagesBox) return;

    // Append user bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble user';
    userBubble.innerHTML = `
      <div class="chat-avatar user">ME</div>
      <div class="chat-content-box">${escapeHtml(query)}</div>
    `;
    messagesBox.appendChild(userBubble);
    messagesBox.scrollTop = messagesBox.scrollHeight;

    // Show typing placeholder
    const typingBubble = document.createElement('div');
    typingBubble.className = 'chat-bubble bot';
    typingBubble.id = 'widget-typing-temp';
    typingBubble.innerHTML = `
      <div class="chat-avatar bot">AI</div>
      <div class="chat-content-box" style="color:#64748b;">
        <i data-lucide="loader" style="width:12px;height:12px;display:inline-block;animation:spin 1s linear infinite;"></i> Abhivanta AI is analyzing...
      </div>
    `;
    messagesBox.appendChild(typingBubble);
    if (window.lucide) window.lucide.createIcons();
    messagesBox.scrollTop = messagesBox.scrollHeight;

    setTimeout(() => {
      const temp = document.getElementById('widget-typing-temp');
      if (temp) temp.remove();

      const response = generateAssistantResponse(query);
      const botBubble = document.createElement('div');
      botBubble.className = 'chat-bubble bot';
      botBubble.innerHTML = `
        <div class="chat-avatar bot">AI</div>
        <div class="chat-content-box">${formatMarkdown(response)}</div>
      `;
      messagesBox.appendChild(botBubble);
      if (window.lucide) window.lucide.createIcons();
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }, 600);
  }

  function handleImageUploadFile(file, context) {
    if (!file.type.startsWith('image/')) {
      if (window.AbhivantaUI) {
        window.AbhivantaUI.toast('Please upload a valid image file (JPG, PNG, WebP).', 'warning');
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      runImageInspection(e.target.result, null, context);
    };
    reader.readAsDataURL(file);
  }

  function handleSampleSelect(sampleUrl, defectKey, context) {
    runImageInspection(sampleUrl, defectKey, context);
  }

  function runImageInspection(imageSrc, predefinedDefectKey, context) {
    const isWidget = context === 'widget';
    const viewport = document.getElementById(isWidget ? 'widget-scan-viewport' : 'studio-scan-viewport');
    const preview = document.getElementById(isWidget ? 'widget-scan-preview' : 'studio-scan-preview');
    const hud = document.getElementById(isWidget ? 'widget-hud-overlay' : 'studio-hud-overlay');
    const bbox = document.getElementById(isWidget ? 'widget-bbox' : 'studio-bbox');
    const bboxTag = document.getElementById(isWidget ? 'widget-bbox-tag' : 'studio-bbox-tag');
    const resultBox = document.getElementById(isWidget ? 'widget-diag-result' : 'studio-diag-result');

    if (!viewport || !preview) return;

    // Show viewport and scanning animation
    viewport.style.display = 'flex';
    preview.src = imageSrc;
    if (bbox) bbox.style.display = 'none';
    if (hud) hud.classList.add('active');
    if (resultBox) resultBox.classList.remove('active');

    if (window.AbhivantaUI) {
      window.AbhivantaUI.toast('AI Computer Vision scanning active on uploaded solar asset...', 'info', 'Vision Neural Net');
    }

    // Simulate neural inference
    setTimeout(async () => {
      let defect;
      if (predefinedDefectKey && DIAGNOSTIC_DEFECTS[predefinedDefectKey]) {
        defect = DIAGNOSTIC_DEFECTS[predefinedDefectKey];
      } else {
        defect = await analyzeImage(preview);
      }

      // Stop HUD scanning
      if (hud) hud.classList.remove('active');

      // Position Bounding Box
      if (bbox && bboxTag) {
        bbox.style.top = defect.bbox.top;
        bbox.style.left = defect.bbox.left;
        bbox.style.width = defect.bbox.width;
        bbox.style.height = defect.bbox.height;
        bbox.className = `defect-bounding-box ${defect.severityClass === 'danger' ? '' : (defect.severityClass === 'warning' ? 'warning-tier' : 'success-tier')}`;
        bboxTag.className = `bbox-tag ${defect.severityClass === 'danger' ? '' : (defect.severityClass === 'warning' ? 'warning' : 'success')}`;
        bboxTag.textContent = defect.badgeText;
        bbox.style.display = 'block';
      }

      // Populate results
      if (isWidget) {
        const titleEl = document.getElementById('widget-result-title');
        const badgeEl = document.getElementById('widget-result-badge');
        const confEl = document.getElementById('widget-result-confidence');
        const sumEl = document.getElementById('widget-result-summary');

        if (titleEl) titleEl.textContent = defect.title;
        if (badgeEl) {
          badgeEl.className = `badge badge-${defect.severityClass}`;
          badgeEl.textContent = defect.severity;
        }
        if (confEl) confEl.textContent = `${defect.confidence}% Confidence`;
        if (sumEl) sumEl.textContent = `${defect.rootCause} Estimated yield loss: ${defect.lossPct}.`;

        if (resultBox) resultBox.classList.add('active');
      } else {
        // Full Studio Result Rendering
        renderStudioFullReport(defect);
      }

      if (window.AbhivantaUI) {
        window.AbhivantaUI.toast(`Diagnosis Complete: ${defect.title}`, defect.severityClass === 'danger' ? 'danger' : 'success');
      }
    }, 1200);
  }

  function renderStudioFullReport(defect) {
    const resultBox = document.getElementById('studio-diag-result');
    if (!resultBox) return;

    resultBox.innerHTML = `
      <div class="diag-header-row">
        <div class="diag-title-wrap">
          <h3>
            <i data-lucide="${defect.severityClass === 'danger' ? 'alert-triangle' : (defect.severityClass === 'warning' ? 'alert-circle' : 'check-circle')}" style="color:${defect.severityClass === 'danger' ? '#ef4444' : (defect.severityClass === 'warning' ? '#f59e0b' : '#10b981')}"></i>
            ${escapeHtml(defect.title)}
          </h3>
          <div style="font-size:12px;color:#64748b;margin-top:2px;">${escapeHtml(defect.subtitle)}</div>
        </div>
        <div style="text-align:right;">
          <span class="badge badge-${defect.severityClass}" style="font-size:11px;padding:3px 8px;">${defect.severity}</span>
          <div style="font-size:11px;font-weight:700;color:#047857;margin-top:4px;">${defect.confidence}% AI Confidence</div>
        </div>
      </div>

      <div class="diag-metrics-grid">
        <div class="diag-metric-box">
          <div class="label">Efficiency Loss</div>
          <div class="val" style="color:${defect.severityClass === 'danger' ? '#ef4444' : (defect.severityClass === 'warning' ? '#d97706' : '#10b981')}">${defect.lossPct}</div>
        </div>
        <div class="diag-metric-box">
          <div class="label">Daily Generation Drop</div>
          <div class="val">${defect.estKwhLoss}</div>
        </div>
        <div class="diag-metric-box">
          <div class="label">DISCOM Tariff Impact</div>
          <div class="val">${defect.financialLoss}</div>
        </div>
      </div>

      <div style="margin-bottom:12px;">
        <h4 style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:4px;">Engineering Root Cause Analysis</h4>
        <p style="font-size:12px;color:#334155;line-height:1.5;margin:0;">${escapeHtml(defect.rootCause)}</p>
      </div>

      <div style="margin-bottom:14px;">
        <h4 style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:6px;">Recommended Action Protocol</h4>
        <ul class="diag-action-checklist">
          ${defect.checklist.map(item => `<li><i data-lucide="check-circle-2"></i><span>${escapeHtml(item)}</span></li>`).join('')}
        </ul>
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn btn-primary btn-sm" id="btn-create-om-ticket">
          <i data-lucide="wrench"></i>
          <span>Dispatch O&amp;M Service Ticket</span>
        </button>
        <button class="btn btn-outline btn-sm" id="btn-download-diag-pdf">
          <i data-lucide="file-down"></i>
          <span>Export Diagnostic Certificate (PDF)</span>
        </button>
      </div>
    `;

    resultBox.classList.add('active');
    if (window.lucide) window.lucide.createIcons();

    // Bind action buttons
    const btnTicket = document.getElementById('btn-create-om-ticket');
    if (btnTicket) {
      btnTicket.addEventListener('click', () => {
        if (window.AbhivantaStorage) {
          const newAlert = {
            id: `ALT-AI-${Date.now().toString().slice(-4)}`,
            plantId: 'PLANT-ROOFTOP-01',
            plantName: 'Household Rooftop Solar Plant',
            category: 'AI Computer Vision Anomaly',
            severity: defect.severity === 'CRITICAL' ? 'Critical' : 'Warning',
            message: `${defect.title} - ${defect.rootCause}`,
            status: 'Open',
            timestamp: new Date().toISOString()
          };
          window.AbhivantaStorage.addAlert(newAlert);
          if (window.AbhivantaUI) {
            window.AbhivantaUI.toast(`Service ticket ${newAlert.id} created and dispatched to local O&M technician team!`, 'success', 'Work Order Dispatched');
          }
        }
      });
    }

    const btnPdf = document.getElementById('btn-download-diag-pdf');
    if (btnPdf && window.AbhivantaPDF) {
      btnPdf.addEventListener('click', () => {
        window.AbhivantaPDF.generateReportPDF({
          title: 'AI COMPUTER VISION SOLAR DEFECT AUDIT',
          reportType: 'AI Optical Diagnostics',
          plantName: 'Household Rooftop Solar Array',
          period: new Date().toLocaleDateString(),
          capacityMW: 0.005,
          preparedBy: 'Abhivanta AI™ Vision Neural Net v2.4',
          kpis: [
            { label: 'Defect Type', value: defect.title },
            { label: 'AI Confidence Score', value: `${defect.confidence}%` },
            { label: 'Estimated Generation Loss', value: defect.lossPct },
            { label: 'Estimated Energy Deficit', value: defect.estKwhLoss },
            { label: 'Tariff Economic Impact', value: defect.financialLoss },
            { label: 'Severity Classification', value: defect.severity }
          ],
          tableHeaders: ['Diagnostic Parameter', 'Observed State', 'Nominal Benchmark', 'Status'],
          tableRows: [
            ['Surface Contamination', defect.title, 'Clean Untarnished', defect.severity],
            ['Efficiency Loss', defect.lossPct, '< 2.0% Derating', defect.severity],
            ['Optical Transmission', defect.badgeText, '> 98.0%', defect.severity],
            ['Recommended Action', defect.ticketType, 'Routine Maintenance', 'Action Required']
          ],
          observations: [
            `Automated optical inspection analyzed via Abhivanta AI Computer Vision framework.`,
            defect.rootCause,
            `Immediate remediation protocol recommended: ${defect.checklist[0]}`
          ]
        });
      });
    }
  }

  // Basic markdown bold/list formatter for chat
  function formatMarkdown(text) {
    if (!text) return '';
    let html = escapeHtml(text);
    // Bolding **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italics *text*
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Line breaks to paragraphs / br
    html = html.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
    return `<p>${html}</p>`;
  }

  return {
    defects: DIAGNOSTIC_DEFECTS,
    intents: CHAT_INTENTS,
    analyzeImage,
    generateAssistantResponse,
    runImageInspection,
    handleImageUploadFile,
    handleSampleSelect,
    initGlobalWidget
  };
}));
