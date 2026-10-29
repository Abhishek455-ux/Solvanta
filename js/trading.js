/**
 * ABHIVANTA Energy Intelligence - Power Trading & DSM Market Cockpit Controller
 * Handles 96-timeblock IEX market price modeling, Deviation Settlement Mechanism (DSM),
 * C&I Open Access banking, and Scope 2 ESG Carbon Certificate generation.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();

  initIEXPriceChart();
  initDSMTelemetry();
  initSpotTradeSimulator();
  initBankingLedger();
  initESGCertificate();
});

let iexChartInstance = null;

/**
 * 1. 24-Hour 96 Time-Block IEX Electricity Clearing Price Curve
 */
function initIEXPriceChart() {
  const canvas = document.getElementById('iexPriceChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Generate 24 hourly time-blocks (representing 96 15-min intervals grouped by hour for readability)
  const labels = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  // Day-Ahead Market (DAM) Prices (INR / kWh)
  const damPrices = [
    3.80, 3.40, 3.10, 2.90, 3.20, 4.10,
    4.90, 5.20, 4.60, 3.80, 2.90, 2.60,
    2.50, 2.70, 3.10, 4.10, 4.80, 5.80,
    6.40, 6.80, 6.50, 5.80, 4.90, 4.20
  ];

  // Real-Time Market (RTM) Spot Prices (higher volatility, peak spreads)
  const rtmPrices = [
    3.95, 3.50, 3.05, 2.85, 3.35, 4.30,
    5.15, 5.45, 4.80, 3.90, 2.80, 2.50,
    2.40, 2.65, 3.25, 4.40, 5.20, 6.42,
    7.10, 7.45, 6.90, 6.10, 5.15, 4.35
  ];

  // Long-Term PPA Baseline (Fixed INR 2.80 / kWh)
  const ppaBaseline = new Array(24).fill(2.80);

  iexChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'IEX RTM Spot (₹/kWh)',
          data: rtmPrices,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: '#10b981'
        },
        {
          label: 'IEX DAM Clearing (₹/kWh)',
          data: damPrices,
          borderColor: '#0284c7',
          backgroundColor: 'transparent',
          borderDash: [5, 4],
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 2.5,
          pointHoverRadius: 5,
          pointBackgroundColor: '#0284c7'
        },
        {
          label: 'Fixed PPA Baseline (₹2.80)',
          data: ppaBaseline,
          borderColor: '#94a3b8',
          borderDash: [3, 3],
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#38bdf8',
          bodyColor: '#ffffff',
          borderColor: 'rgba(16, 185, 129, 0.4)',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': ₹' + context.parsed.y.toFixed(2);
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(226, 232, 240, 0.6)' },
          ticks: { font: { size: 10, family: 'monospace' }, color: '#64748b' }
        },
        y: {
          grid: { color: 'rgba(226, 232, 240, 0.6)' },
          ticks: {
            font: { size: 10, family: 'monospace' },
            color: '#64748b',
            callback: function(val) { return '₹' + val; }
          },
          suggestedMin: 2.0,
          suggestedMax: 8.0
        }
      }
    }
  });

  // Filter dropdown handler
  const marketSelect = document.getElementById('market-curve-select');
  if (marketSelect) {
    marketSelect.addEventListener('change', (e) => {
      const mode = e.target.value;
      if (mode === 'ALL') {
        iexChartInstance.data.datasets[0].hidden = false;
        iexChartInstance.data.datasets[1].hidden = false;
        iexChartInstance.data.datasets[2].hidden = false;
      } else if (mode === 'RTM') {
        iexChartInstance.data.datasets[0].hidden = false;
        iexChartInstance.data.datasets[1].hidden = true;
        iexChartInstance.data.datasets[2].hidden = false;
      } else if (mode === 'DAM') {
        iexChartInstance.data.datasets[0].hidden = true;
        iexChartInstance.data.datasets[1].hidden = false;
        iexChartInstance.data.datasets[2].hidden = false;
      }
      iexChartInstance.update();
    });
  }
}

/**
 * 2. Deviation Settlement Mechanism (DSM) & 15-Minute Countdown Timer
 */
function initDSMTelemetry() {
  const timerElem = document.getElementById('dsm-timer');
  const indicatorPin = document.getElementById('dsm-indicator-pin');
  const dsmDiffVal = document.getElementById('dsm-diff-val');
  const dsmActualVal = document.getElementById('dsm-actual-val');

  let secondsRemaining = 4 * 60 + 18; // 04m 18s

  setInterval(() => {
    secondsRemaining--;
    if (secondsRemaining <= 0) {
      secondsRemaining = 15 * 60; // reset 15-min block
    }
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    if (timerElem) {
      timerElem.textContent = `${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    }

    // Subtle realistic fluctuation in actual injection and deviation
    if (secondsRemaining % 5 === 0 && dsmActualVal && dsmDiffVal && indicatorPin) {
      const baseSchedule = 112.5;
      const jitter = (Math.random() * 0.8 - 0.2); // slight positive bias
      const newActual = (baseSchedule + 1.7 + jitter).toFixed(2);
      const diffMW = (newActual - baseSchedule).toFixed(2);
      const diffPct = ((diffMW / baseSchedule) * 100).toFixed(2);

      dsmActualVal.textContent = `${newActual} MW`;
      dsmDiffVal.textContent = `+${diffMW} MW (+${diffPct}%)`;

      // 50% is 0%, +10% is 80%, -10% is 20%
      const pinPercent = 50 + (parseFloat(diffPct) * 3);
      indicatorPin.style.left = `${Math.min(75, Math.max(25, pinPercent))}%`;
    }
  }, 1000);
}

/**
 * 3. Spot Trade Simulator
 */
function initSpotTradeSimulator() {
  const mwInput = document.getElementById('sim-mw-input');
  const marketSelect = document.getElementById('sim-market-select');
  const yieldDisplay = document.getElementById('sim-est-yield');
  const submitBtn = document.getElementById('btn-submit-spot-trade');
  const modal = document.getElementById('spotTradeModal');

  function updateYield() {
    const mw = parseFloat(mwInput.value) || 15;
    const market = marketSelect.value;
    let rate = 6.42; // RTM default
    if (market === 'GDAM') rate = 5.70;
    if (market === 'DAM') rate = 5.18;

    // 15 MW for 1 hour block = 15,000 kWh * rate (divided by 4 for 15-min block)
    // Here we show per 1-hour equivalent:
    const grossYield = (mw * 1000 * rate * 2); // 2-hour peak dispatch window
    const formatted = '₹' + Math.round(grossYield).toLocaleString('en-IN') + ' / Window';
    if (yieldDisplay) yieldDisplay.textContent = formatted;
  }

  if (mwInput) mwInput.addEventListener('input', updateYield);
  if (marketSelect) marketSelect.addEventListener('change', updateYield);

  if (submitBtn && modal) {
    submitBtn.addEventListener('click', () => {
      const mw = mwInput.value || '15';
      const marketText = marketSelect.options[marketSelect.selectedIndex].text;
      let rate = '₹6.42 / kWh';
      if (marketSelect.value === 'GDAM') rate = '₹5.70 / kWh';
      if (marketSelect.value === 'DAM') rate = '₹5.18 / kWh';

      document.getElementById('modal-mw').textContent = `${mw} MW`;
      document.getElementById('modal-market').textContent = marketText;
      document.getElementById('modal-rate').textContent = rate;
      document.getElementById('modal-margin').textContent = yieldDisplay.textContent;

      modal.style.display = 'flex';
      if (window.lucide) lucide.createIcons();
    });
  }

  const simulateTopBtn = document.getElementById('simulate-bid-btn');
  if (simulateTopBtn && submitBtn) {
    simulateTopBtn.addEventListener('click', () => {
      submitBtn.scrollIntoView({ behavior: 'smooth' });
      submitBtn.click();
    });
  }
}

/**
 * 4. C&I 15-Minute DISCOM Banking Ledger
 */
function initBankingLedger() {
  const tbody = document.getElementById('banking-ledger-tbody');
  if (!tbody) return;

  const sampleBlocks = [
    { block: 'Block 74 (18:15 - 18:30)', exportKWh: '28,550', lossKWh: '1,199', banked: '27,351', drawal: '22,400', savings: '₹1,96,200' },
    { block: 'Block 73 (18:00 - 18:15)', exportKWh: '29,120', lossKWh: '1,223', banked: '27,897', drawal: '22,800', savings: '₹1,98,400' },
    { block: 'Block 72 (17:45 - 18:00)', exportKWh: '31,400', lossKWh: '1,318', banked: '30,082', drawal: '23,100', savings: '₹2,14,500' },
    { block: 'Block 71 (17:30 - 17:45)', exportKWh: '33,200', lossKWh: '1,394', banked: '31,806', drawal: '23,500', savings: '₹2,28,000' },
    { block: 'Block 70 (17:15 - 17:30)', exportKWh: '35,800', lossKWh: '1,503', banked: '34,297', drawal: '24,000', savings: '₹2,45,800' },
    { block: 'Block 69 (17:00 - 17:15)', exportKWh: '38,400', lossKWh: '1,612', banked: '36,788', drawal: '24,200', savings: '₹2,62,400' }
  ];

  tbody.innerHTML = sampleBlocks.map(row => `
    <tr>
      <td style="font-family:var(--font-mono); font-weight:600; color:#0f172a;">${row.block}</td>
      <td style="font-family:var(--font-mono);">${row.exportKWh} kWh</td>
      <td style="font-family:var(--font-mono); color:#dc2626;">-${row.lossKWh} kWh</td>
      <td style="font-family:var(--font-mono); font-weight:700; color:#059669;">${row.banked} kWh</td>
      <td style="font-family:var(--font-mono);">${row.drawal} kWh</td>
      <td style="font-family:var(--font-mono); font-weight:700; color:#0284c7;">${row.savings}</td>
    </tr>
  `).join('');
}

/**
 * 5. Scope 2 ESG Carbon Certificate Download / Printable Preview
 */
function initESGCertificate() {
  const printBtn = document.getElementById('btn-print-esg-cert');
  const openCertBtn = document.getElementById('open-esg-cert-btn');

  function triggerPrint() {
    window.print();
  }

  if (printBtn) printBtn.addEventListener('click', triggerPrint);
  if (openCertBtn) {
    openCertBtn.addEventListener('click', () => {
      const certCard = document.getElementById('printable-esg-cert');
      if (certCard) {
        certCard.scrollIntoView({ behavior: 'smooth' });
        certCard.style.outline = '4px solid #10b981';
        setTimeout(() => { certCard.style.outline = 'none'; }, 2000);
      }
    });
  }
}
