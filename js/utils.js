/**
 * SOLVANTA - Core Utility Functions
 * Formatting, date helpers, energy calculations, and security sanitization.
 */

const SolvantaUtils = (() => {
  // Safe HTML Escaping (prevents XSS vulnerabilities)
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Format currency (INR) with Indian numbering format (e.g. ₹1,24,500)
  function formatINR(amount, includeSymbol = true) {
    if (isNaN(amount) || amount === null) return includeSymbol ? '₹0' : '0';
    const num = Math.round(Number(amount));
    const formatted = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(num);
    return includeSymbol ? `₹${formatted}` : formatted;
  }

  // Format Numbers with separators
  function formatNumber(val, decimals = 1) {
    if (isNaN(val) || val === null) return '0';
    return Number(val).toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  // Format Energy Generation with unit
  function formatEnergy(mwh, unit = 'MWh', decimals = 1) {
    if (isNaN(mwh) || mwh === null) return `0 ${unit}`;
    return `${formatNumber(mwh, decimals)} ${unit}`;
  }

  // Format Percentage
  function formatPercent(val, decimals = 1) {
    if (isNaN(val) || val === null) return '0%';
    return `${Number(val).toFixed(decimals)}%`;
  }

  // Date Formatting
  function formatDate(dateInput, formatStr = 'DD MMM YYYY') {
    if (!dateInput) return '—';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    if (formatStr === 'YYYY-MM-DD') {
      const m = String(d.getMonth() + 1).padStart(2, '0');
      return `${year}-${m}-${day}`;
    }
    return `${day} ${month} ${year}`;
  }

  function formatDateTime(dateInput) {
    if (!dateInput) return '—';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const dateStr = formatDate(d);
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${dateStr}, ${hours}:${minutes} ${ampm}`;
  }

  function getRelativeTime(timestamp) {
    if (!timestamp) return '—';
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    return formatDate(past);
  }

  function getTodayISO() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  function generateUUID(prefix = 'REC') {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${Date.now().toString().slice(-4)}${rand}`;
  }

  // Renewable Energy Domain Calculations
  // CUF % = Generation (MWh) / (Capacity (MW) * Period Hours) * 100
  function calculateCUF(genMWh, capacityMW, hours = 24) {
    if (!capacityMW || capacityMW <= 0 || !hours || hours <= 0) return 0;
    const cuf = (genMWh / (capacityMW * hours)) * 100;
    return Math.min(Math.max(cuf, 0), 100);
  }

  // Performance Ratio PR % = Actual Gen / Reference Gen * 100
  function calculatePR(actualGen, referenceGen) {
    if (!referenceGen || referenceGen <= 0) return 0;
    const pr = (actualGen / referenceGen) * 100;
    return Math.min(Math.max(pr, 0), 100);
  }

  // Revenue in INR = Gen MWh * 1000 kWh/MWh * Tariff INR/kWh
  function calculateRevenue(genMWh, tariffINR = 3.45) {
    if (!genMWh || genMWh < 0) return 0;
    return genMWh * 1000 * tariffINR;
  }

  // CO2 Emissions Avoided in Tonnes = Gen MWh * Emission factor (default ~0.82 tCO2/MWh in India)
  function calculateCO2Avoided(genMWh, factor = 0.82) {
    if (!genMWh || genMWh < 0) return 0;
    return genMWh * factor;
  }

  return {
    escapeHtml,
    formatINR,
    formatNumber,
    formatEnergy,
    formatPercent,
    formatDate,
    formatDateTime,
    getRelativeTime,
    getTodayISO,
    generateUUID,
    calculateCUF,
    calculatePR,
    calculateRevenue,
    calculateCO2Avoided
  };
})();
