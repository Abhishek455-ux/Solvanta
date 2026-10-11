/**
 * SOLVANTA - Automated PDF Report Generator
 * Powered by jsPDF & jsPDF-AutoTable via CDN.
 * Generates enterprise-grade, styled PDF reports with brand headers,
 * KPI matrices, data tables, observations, and regulatory audit compliance.
 */

const SolvantaPDF = (() => {
  function checkLibraries() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      SolvantaUI.toast('jsPDF library is not loaded. Please verify internet connection for CDN.', 'danger');
      return false;
    }
    return true;
  }

  /**
   * Main PDF Generator Function
   * @param {Object} config - Report parameters
   */
  function generateReportPDF(config) {
    if (!checkLibraries()) return false;

    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      let currentY = margin;

      const primaryDark = [7, 32, 22];    // #072016
      const emerald = [16, 185, 129];     // #10b981
      const slateDark = [15, 23, 42];     // #0f172a
      const slateMuted = [100, 116, 139]; // #64748b
      const bgSubtle = [248, 250, 252];

      // --- HEADER BLOCK ---
      doc.setFillColor(...primaryDark);
      doc.rect(margin, currentY, pageWidth - (margin * 2), 26, 'F');

      // Brand Title
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('SOLVANTA', margin + 6, currentY + 11);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(167, 243, 208); // light mint
      doc.text('ENERGY INTELLIGENCE | Smarter Data. Cleaner Energy.', margin + 6, currentY + 18);

      // Report Title & Meta on right
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(config.title || 'PLANT PERFORMANCE REPORT', pageWidth - margin - 6, currentY + 10, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(203, 213, 225);
      const genTimestamp = SolvantaUtils.formatDateTime(new Date());
      doc.text(`Generated: ${genTimestamp}`, pageWidth - margin - 6, currentY + 16, { align: 'right' });
      doc.text(`Report ID: ${config.reportId || 'RPT-' + Date.now().toString().slice(-6)}`, pageWidth - margin - 6, currentY + 21, { align: 'right' });

      currentY += 32;

      // --- ENTERPRISE TELEMETRY AUDIT BANNER ---
      doc.setFillColor(239, 246, 255); // blue 50
      doc.setDrawColor(147, 197, 253);  // blue 300
      doc.rect(margin, currentY, pageWidth - (margin * 2), 8, 'FD');
      doc.setTextColor(30, 64, 175);   // blue 800
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('SOLVANTA ENTERPRISE PERFORMANCE AUDIT — CONTINUOUS SCADA INTELLIGENCE STREAM', pageWidth / 2, currentY + 5.5, { align: 'center' });

      currentY += 13;

      // --- REPORT OVERVIEW METADATA ---
      doc.setTextColor(...slateDark);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('1. Executive Summary & Parameters', margin, currentY);
      currentY += 4;

      const metaTable = [
        ['Plant Scope:', config.plantName || 'Fleet Portfolio', 'Reporting Period:', config.period || 'Current Cycle'],
        ['Report Type:', config.reportType || 'Performance Audit', 'Prepared By:', config.preparedBy || 'Solvanta Plant Lead'],
        ['Installed Capacity:', `${config.capacityMW || '1,180'} MW`, 'Currency / Unit:', 'INR / MWh']
      ];

      doc.autoTable({
        startY: currentY,
        body: metaTable,
        theme: 'plain',
        margin: { left: margin, right: margin },
        styles: { fontSize: 8.5, cellPadding: 2, textColor: slateDark },
        columnStyles: {
          0: { fontStyle: 'bold', textColor: slateMuted, cellWidth: 35 },
          1: { cellWidth: 55 },
          2: { fontStyle: 'bold', textColor: slateMuted, cellWidth: 35 },
          3: { cellWidth: 55 }
        }
      });

      currentY = doc.lastAutoTable.finalY + 6;

      // --- KEY PERFORMANCE INDICATOR MATRIX (Cards) ---
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...slateDark);
      doc.text('2. Key Performance Indicators (KPIs)', margin, currentY);
      currentY += 4;

      const kpis = config.kpis || [
        { label: 'Energy Generated', value: '7,890.4 MWh' },
        { label: 'Capacity Utilization', value: '23.4%' },
        { label: 'Avg Performance Ratio', value: '81.6%' },
        { label: 'Fleet Availability', value: '98.2%' },
        { label: 'Estimated Revenue', value: '₹2.64 Cr' },
        { label: 'CO2 Avoidance', value: '6,470 Tonnes' }
      ];

      const cardW = (pageWidth - (margin * 2) - 10) / 3;
      const cardH = 15;

      kpis.forEach((kpi, idx) => {
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        const cardX = margin + col * (cardW + 5);
        const cardY = currentY + row * (cardH + 4);

        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(cardX, cardY, cardW, cardH, 2, 2, 'FD');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...slateMuted);
        doc.text(kpi.label.toUpperCase(), cardX + 3, cardY + 5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(...slateDark);
        doc.text(String(kpi.value), cardX + 3, cardY + 11.5);
      });

      currentY += (Math.ceil(kpis.length / 3) * (cardH + 4)) + 6;

      // --- MAIN DATA TABLE ---
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...slateDark);
      doc.text('3. Detailed Performance Breakdown', margin, currentY);
      currentY += 4;

      const headers = config.tableHeaders || ['Item / Plant', 'Type', 'Capacity (MW)', 'Gen (MWh)', 'CUF (%)', 'PR (%)', 'Status'];
      const rows = config.tableRows || [];

      doc.autoTable({
        startY: currentY,
        head: [headers],
        body: rows,
        theme: 'striped',
        margin: { left: margin, right: margin },
        headStyles: {
          fillColor: primaryDark,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8.5,
          halign: 'left'
        },
        styles: {
          fontSize: 8,
          cellPadding: 2.8,
          textColor: slateDark
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        }
      });

      currentY = doc.lastAutoTable.finalY + 8;

      // Check if space remains for observations, else add new page
      if (currentY > pageHeight - 55) {
        doc.addPage();
        currentY = margin + 5;
      }

      // --- OBSERVATIONS & RECOMMENDATIONS ---
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...slateDark);
      doc.text('4. Operational Observations & Recommendations', margin, currentY);
      currentY += 5;

      const observations = config.observations || [
        'Fleet operating availability remained consistent above 98% with healthy grid coupling stability.',
        'Sakri Solar Energy Park observed inverter tripping on block INV-04; corrective thermal inspections underway.',
        'Charanka Solar Field Beta scheduled maintenance on capacitor banks is on track to restore full capacity by weekend.',
        'Recommend scheduling dry robotic panel washing across Rajasthan blocks to mitigate heat-related soiling derating.'
      ];

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...slateDark);

      observations.forEach((obs) => {
        doc.setFillColor(...emerald);
        doc.circle(margin + 2, currentY - 1, 0.8, 'F');
        const splitText = doc.splitTextToSize(obs, pageWidth - (margin * 2) - 8);
        doc.text(splitText, margin + 5, currentY);
        currentY += (splitText.length * 4) + 1.5;
      });

      currentY += 6;

      // Check space for signature block
      if (currentY > pageHeight - 40) {
        doc.addPage();
        currentY = margin + 5;
      }

      // --- SIGNATURE & APPROVAL BLOCK ---
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 8;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...slateDark);
      doc.text('PREPARED BY:', margin, currentY);
      doc.text('VERIFIED BY OPERATIONS LEAD:', margin + 70, currentY);
      doc.text('SOLVANTA AUDIT STAMP:', pageWidth - margin - 40, currentY);

      currentY += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...slateMuted);
      doc.text(config.preparedBy || 'Aditya Sharma (Lead)', margin, currentY);
      doc.text('Solvanta Quality Assurance', margin + 70, currentY);
      doc.text('[ VERIFIED / SYSTEM GENERATED ]', pageWidth - margin - 40, currentY);

      // --- FOOTER WITH PAGE NUMBERS ---
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...slateMuted);
        doc.text('SOLVANTA Renewable Energy Intelligence Platform | Enterprise Asset Management Edition', margin, pageHeight - 6);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
      }

      // Trigger actual download
      const filename = `Solvanta_${(config.reportType || 'Report').replace(/\s+/g, '_')}_${Date.now().toString().slice(-4)}.pdf`;
      doc.save(filename);

      SolvantaUI.toast(`PDF Report "${filename}" generated and downloaded successfully!`, 'success');
      return true;
    } catch (err) {
      console.error('Error generating PDF:', err);
      SolvantaUI.toast(`Failed to generate PDF: ${err.message}`, 'danger');
      return false;
    }
  }

  return {
    generateReportPDF
  };
})();
