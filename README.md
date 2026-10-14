# ABHIVANTA — Renewable Energy Plant Monitoring & Automated Reporting Platform

Clean energy intelligent SaaS platform.

**Live website:** [https://abhishek455-ux.github.io/Solvanta/](https://abhishek455-ux.github.io/Solvanta/)

**Brand:** **ABHIVANTA ENERGY INTELLIGENCE**
**Tagline:** *"Smarter Data. Cleaner Energy. A Brighter Future."*  
**Academic Submission:** B.Tech Computer Science & Engineering — Final Year Capstone Project  
**Technology Stack:** Pure HTML5, Modern Responsive CSS3, Vanilla JavaScript (ES6+), Chart.js, jsPDF, SheetJS, LocalStorage  

---

## 1. Project Abstract
**ABHIVANTA** is a centralized, client-side renewable energy intelligence and plant operations platform designed for utility-scale **Solar PV, Wind, and Battery Energy Storage Systems (BESS)**. The system empowers renewable plant operators, asset managers, and grid dispatchers to monitor real-time generation telemetry, analyze performance indices according to IEC 61724 standards (Capacity Utilization Factor - CUF, Performance Ratio - PR), triage equipment anomalies, schedule preventive maintenance work orders, and automatically generate executive-ready PDF and Excel audit reports with zero backend server dependencies.

---

## 2. Problem Statement
Utility-scale renewable energy portfolios face operational inefficiencies:
1. **Data Fragmentation:** Distributed plants (solar farms, wind corridors) operate on disparate proprietary SCADA and inverter monitoring portals.
2. **Delayed Manual Reporting:** Operations teams spend hours compiling generation logs, technical derating metrics, and commercial revenue estimates into spreadsheets manually.
3. **Inefficient Fault Escalation:** Tripped inverters, tracker angle misalignments, and thermal hotspot losses often go unflagged until weekly billing reconciliations.
4. **Complexity in Evaluation:** Traditional enterprise systems require hefty database servers, licensed SCADA gateways, and cloud infrastructure, making them difficult to audit and evaluate in academic viva demonstrations.

---

## 3. Proposed System & Key Objectives
ABHIVANTA provides an elegant, 100% portable, browser-executable platform that:
- Emulates industrial SCADA telemetry (irradiance $W/m^2$, cell temperatures, inverter string arrays, grid frequency, power factor).
- Dynamically computes industry-standard technical metrics (CUF %, PR %, commercial revenue in ₹ INR, and grid $CO_2$ abatement).
- Provides an **Automated Report Generation Center** capable of generating, live-previewing, and downloading formatted client-side PDF documents and Excel files with structured tables and observations.
- Offers operational fault triage (acknowledging and resolving alerts) linked directly to maintenance work orders.
- Operates reliably offline or on local development servers using versioned `localStorage` with JSON backup/restore capabilities.

---

## 4. System Architecture

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT BROWSER                                   |
+-----------------------------------------------------------------------------------+
|  [Presentation Layer]                                                             |
|  - index.html (Corporate Landing)     - about.html (Company Profile & ESG Scale)   |
|  - founder.html (Founder Abhishek Singh Desk) - services.html (6 Engineering Pillars)|
|  - dashboard.html (Operations KPIs)   - plants.html (Plant Inventory CRUD)         |
|  - monitoring.html (Live SCADA Room)  - analytics.html (CUF/PR Modeling)           |
|  - reports.html (Automated PDF Hub)   - alerts.html (Fault Triage)                 |
|  - maintenance.html (Work Orders)     - settings.html (Config & Backups)           |
|  - login.html (Operator Auth)                                                      |
+---------------------------------------------------------+-------------------------+
                                                          |
+---------------------------------------------------------v-------------------------+
|  [Application Logic & Analytical Engine Layer] (Modular Vanilla JavaScript)       |
|  - utils.js (IEC Formulas, Indian Currency Formatters, Sanitization)              |
|  - demo-data.js (9 Realistic Fictional Indian Solar/Wind Assets & Curves)         |
|  - storage.js (Versioned LocalStorage, Schema Integrity, Import/Export)           |
|  - components.js (Modals, Toasts, Badges, Lucide Icon Hooks)                      |
|  - navigation.js (Active Routing, Mobile Drawers, Global Search)                  |
|  - charts.js (Chart.js Wrapper: Diurnal Curves, Mix Doughnuts, Bar Variances)     |
|  - pdf-export.js (jsPDF + jsPDF-AutoTable Formatter & Downloader)                 |
|  - excel-export.js (SheetJS XLSX & Pure CSV Exporter)                             |
+---------------------------------------------------------+-------------------------+
                                                          |
+---------------------------------------------------------v-------------------------+
|  [Client-Side Data Storage & External CDNs]                                       |
|  - Browser LocalStorage (`SOLVANTA_DATA_V1.0`)                                    |
|  - Chart.js CDN, jsPDF CDN, AutoTable CDN, SheetJS CDN, Lucide Icons CDN          |
+-----------------------------------------------------------------------------------+
```

---

## 5. Technology Stack & Rationale

| Layer | Technology | Rationale |
|---|---|---|
| **Structure** | HTML5 Semantic Markup | Clean, accessible DOM tree with zero virtual-DOM overhead. |
| **Styling** | Modern CSS3 (Grid & Flexbox) | CSS Custom Properties design system, dark forest green theme, zero CSS frameworks. |
| **Logic** | Vanilla JavaScript (ES6+) | Native browser execution, modular IIFE patterns, zero build step required. |
| **Visuals** | Chart.js via CDN | High-performance HTML5 Canvas rendering with dynamic curve updates. |
| **PDF Generation** | jsPDF + jsPDF-AutoTable | Client-side vector PDF creation with embedded tables and styling. |
| **Spreadsheets** | SheetJS (XLSX) + CSV engine | Native `.xlsx` and UTF-8 encoded `.csv` export with Excel compatibility. |
| **Persistence** | LocalStorage API | Fast, persistent demo storage across browser reloads without database setup. |

---

## 6. Mathematical Formulas & Renewable Energy Standards

### 1. Capacity Utilization Factor (CUF)
The ratio of actual energy generated over a period to the energy output if operated continuously at rated capacity:
$$\text{CUF (\%)} = \frac{\text{Energy Generated (MWh)}}{\text{Installed Capacity (MW)} \times \text{Operating Hours}} \times 100$$
*Benchmark:* Typically 19% - 24% for single-axis tracking solar PV in India; 25% - 32% for modern wind turbines.

### 2. Performance Ratio (PR)
Defines overall system quality and losses according to IEC 61724 standards:
$$\text{PR (\%)} = \frac{\text{Actual Energy Generated}}{\text{Reference Baseline Energy Generation}} \times 100$$
*Benchmark:* Healthy utility plants operate between 80% and 84%.

### 3. Commercial Revenue Estimation
Calculates contract yield based on Power Purchase Agreements (PPA):
$$\text{Estimated Revenue (₹)} = \text{Energy Generated (MWh)} \times 1,000\,\text{kWh/MWh} \times \text{Contract Tariff (₹/kWh)}$$

### 4. Environmental Decarbonization ($CO_2$ Avoided)
Estimates avoided carbon emissions using the Indian Central Electricity Authority (CEA) grid factor:
$$\text{CO}_2\text{ Avoided (Tonnes)} = \text{Energy Generated (MWh)} \times 0.82\,\text{Tonnes/MWh}$$

---

## 7. Simulated Asset Fleet Portfolio
ABHIVANTA comes pre-populated with 9 realistic fictional plants across major renewable regions in India:

| Plant ID | Plant Asset Name | Technology | State / District | Capacity | Base PR | Status |
|---|---|---|---|---|---|---|
| `PLANT-SOL-01` | Pavagada Solar Park Unit 4 | Solar | Karnataka (Tumakuru) | 150 MW | 82.6% | Operational |
| `PLANT-SOL-02` | Bhadla Solar Complex Phase II | Solar | Rajasthan (Jodhpur) | 220 MW | 84.1% | Operational |
| `PLANT-WND-03` | Muppandal Wind Farm Alpha | Wind | Tamil Nadu (Kanyakumari) | 85 MW | 78.4% | Operational |
| `PLANT-SOL-04` | Sakri Solar Energy Park | Solar | Maharashtra (Dhule) | 125 MW | 68.9% | Degraded |
| `PLANT-HYB-05` | Jaisalmer Hybrid Eco-Energy | Hybrid | Rajasthan (Pokhran) | 180 MW | 83.2% | Operational |
| `PLANT-WND-06` | Kutch Coastal Wind Project | Wind | Gujarat (Mandvi) | 110 MW | 80.5% | Operational |
| `PLANT-SOL-07` | Charanka Solar Field Beta | Solar | Gujarat (Patan) | 95 MW | 62.1% | Maintenance |
| `PLANT-HYB-08` | Ananthapur Hybrid Power Station | Hybrid | Andhra Pradesh (NP Kunta) | 140 MW | 83.8% | Operational |
| `PLANT-SOL-09` | Osmanabad Solar Facility | Solar | Maharashtra (Osmanabad) | 75 MW | 81.7% | Operational |

---

## 8. Detailed Module Overview

### 1. Public Landing Page (`index.html`)
- Solar hero banner with tagline: *"Monitor Every Watt. Optimize Every Plant."*
- Telemetry showcase preview with live operational indicators.
- Platform capabilities grid: SCADA monitoring, CUF analytics, automated reports, fault triage.
- 3-step operational workflow and project credentials.

### 2. Operator Login Portal (`login.html`)
- Demonstration quick-bypass button for instant viva evaluation.
- Form validation with show/hide password toggle.
- Clear disclosure notice highlighting client-side prototype scope.

### 3. Fleet Dashboard Overview (`dashboard.html`)
- 8 Dynamic KPI cards derived from underlying records: Total Plants, Capacity MW, Today's MWh, Month's MWh, PR %, Availability %, Est. Revenue ₹, and $CO_2$ Avoided.
- 30-Day and Hourly Diurnal generation line charts.
- Technology mix and operational status doughnut charts.
- Plant-wise generation ranking table and recent alerts stream.
- One-click "Export Dashboard PDF" summary button.

### 4. Plant Management Module (`plants.html`)
- Complete CRUD operations: Add new plant, edit specs, view comprehensive plant profiles, delete with confirmation dialog.
- Search and multi-attribute filters (Technology, Status, State).
- Column sorting on capacity, generation, PR %, and availability.
- Export entire plant roster to Excel/CSV.

### 5. Live SCADA Monitoring Control Room (`monitoring.html`)
- Live simulated telemetry: Active Power (MW/kW), Plane of Array Irradiance ($W/m^2$), Module & Ambient Temps (°C), Inverter status, Grid Frequency (Hz), Bus Voltage (kV), Power Factor.
- Diurnal hourly generation curve for selected plant.
- Inverter block matrix displaying individual online vs tripped status.
- Simulation controls: Pause, Resume, and **"Inject Anomaly"** button to simulate inverter trips for viva demos.

### 6. Energy Analytics Workspace (`analytics.html`)
- Daily (30-day) and Monthly (12-month) granularity options.
- Dynamic generation vs contracted target variance bar chart.
- Dual-line efficiency chart comparing Performance Ratio (PR %) and Capacity Factor (CUF %).
- Full data breakdown table with one-click Excel and CSV exports.

### 7. Automated Report Generation Center (`reports.html`)
- **6 Report Template Presets:** Daily Generation Report, Monthly Performance Report, Annual Energy Audit, Plant Health & Inverter Audit, Multi-Plant Portfolio Summary, and Custom Parametric Report.
- Interactive live document preview sheet styled like an A4 document.
- Client-side PDF generation using jsPDF & AutoTable with headers, KPIs, structured tables, observation notes, and sign-off blocks.
- Report history log saved in localStorage with re-download and deletion capabilities.

### 8. Alerts & Fault Center (`alerts.html`)
- Critical, High, Medium, and Resolved severity counters.
- Multi-status filter and text search.
- Operator workflows: "Acknowledge" and "Mark as Resolved".
- "Simulate New Alert" button to trigger synthetic events during evaluation.

### 9. Maintenance Module (`maintenance.html`)
- Schedule and track preventive cleanings, inverter capacitor repairs, and drone inspections.
- Cost tracking in ₹ INR and technician assignment.
- Mark completed with automatic timestamping.

### 10. Settings & Backup Manager (`settings.html`)
- System branding, default currency, and emissions factor configuration.
- **JSON Backup Export:** Download full application state as `.json`.
- **JSON Backup Import:** Restore state with schema validation.
- **Factory Demo Reset:** Revert to pristine fictional dataset with confirmation dialog.

---

## 9. Installation & Execution Guide

ABHIVANTA requires no build step, no Node.js installation, and no database configuration.

### Option A: VS Code Live Server (Recommended)
1. Open Visual Studio Code.
2. Select **File > Open Folder...** and choose the `Solvanta website` directory.
3. Install the **Live Server** extension (by Ritwick Dey) if not already installed.
4. Right-click `index.html` and click **"Open with Live Server"**.
5. The application will launch at `http://127.0.0.1:5500/index.html`.

### Option B: Python Local Server
Run in PowerShell inside the project directory:
```powershell
python -m http.server 8080
```
Open `http://localhost:8080` in any modern web browser.

### Option C: Direct Browser Launch
Double-click `index.html` to open directly in Chrome, Edge, Firefox, or Safari.

---

## 10. Viva Examination Defense & FAQs

### Q1: Why is this implemented as a frontend-only application?
> **Answer:** Abhivanta is developed as a high-fidelity architectural prototype. By isolating the frontend with modular ES6 JavaScript and localStorage, the project guarantees 100% offline portability and zero-latency execution during college demonstrations. In an industrial deployment, the data layer would connect to an MQTT/Modbus SCADA broker and backend REST API.

### Q2: How does the PDF generation work without a backend server?
> **Answer:** PDF generation is handled entirely on the client side using the **jsPDF** and **jsPDF-AutoTable** libraries. The JavaScript engine creates an in-memory PDF binary document, calculates coordinates and typography for headers and tables, attaches operational observations, and triggers a browser blob download.

### Q3: What is the difference between CUF and PR?
> **Answer:** 
> - **CUF (Capacity Utilization Factor)** measures total energy generated against the plant's theoretical maximum 24-hour nameplate capacity.
> - **PR (Performance Ratio)** evaluates the efficiency of the plant under available solar irradiation, accounting for environmental and electrical losses (heat derating, cable losses, dust soiling).

### Q4: How are simulated alerts linked to other modules?
> **Answer:** When an anomaly is injected in Live Monitoring, it generates an alert record in `localStorage`. The operator can acknowledge it in the Alerts Center, click "Schedule Corrective Maintenance" to create a work order, and verify the incident in the generated Plant Health PDF report.

---

## 11. Testing & Acceptance Checklist

- [x] Landing page (`index.html`) loads with responsive layout and working navigation.
- [x] Login page (`login.html`) provides instant demo bypass and credential validation.
- [x] Dashboard (`dashboard.html`) computes all 8 KPIs dynamically from underlying data.
- [x] Charts render smoothly and update on filter change (Technology & State).
- [x] Plant Management (`plants.html`) allows Add, Edit, Delete, Search, and Sort.
- [x] Live Monitoring (`monitoring.html`) displays real-time telemetry fluctuations and allows anomaly injection.
- [x] Analytics (`analytics.html`) renders actual vs target variance and exports to Excel/CSV.
- [x] Report Center (`reports.html`) generates genuine, styled PDF documents with jsPDF.
- [x] Report history is saved in localStorage and can be downloaded or cleared.
- [x] Alerts can be acknowledged and resolved with live counter badge updates.
- [x] Maintenance tasks can be scheduled, edited, and marked complete.
- [x] Settings allows JSON backup export, import, and factory reset.
- [x] Fully responsive across desktop, tablet, and mobile displays.

---

## 12. Conclusion
ABHIVANTA successfully demonstrates a modern, enterprise-grade renewable energy management platform. It combines domain-accurate energy modeling, SCADA simulation, and automated reporting in a lightweight, self-contained architecture suitable for college project evaluation and practical demonstration.
