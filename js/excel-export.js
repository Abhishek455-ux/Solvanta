/**
 * SOLVANTA - Spreadsheet & CSV Export Module
 * Uses SheetJS (XLSX) CDN when available, with a built-in pure JavaScript CSV generator fallback.
 */

const SolvantaExport = (() => {
  /**
   * Export structured data to CSV file
   * @param {Array<string>} headers - Column titles
   * @param {Array<Array<any>>} rows - 2D matrix of values
   * @param {string} filename - Target file name
   */
  function exportToCSV(headers, rows, filename = 'Solvanta_Data_Export.csv') {
    try {
      const escapeCell = (val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      let csvContent = '\uFEFF'; // UTF-8 BOM for Excel compatibility
      csvContent += headers.map(escapeCell).join(',') + '\r\n';

      rows.forEach(row => {
        csvContent += row.map(escapeCell).join(',') + '\r\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      SolvantaUI.toast(`Exported ${rows.length} records to ${filename}`, 'success');
      return true;
    } catch (e) {
      console.error('CSV export failed:', e);
      SolvantaUI.toast(`Export error: ${e.message}`, 'danger');
      return false;
    }
  }

  /**
   * Export data to XLSX using SheetJS, fallback to CSV if library is unavailable
   */
  function exportToExcel(sheetName, headers, rows, filename = 'Solvanta_Report.xlsx') {
    if (window.XLSX && typeof window.XLSX.utils !== 'undefined') {
      try {
        const aoa = [headers, ...rows];
        const ws = window.XLSX.utils.aoa_to_sheet(aoa);
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, sheetName || 'Energy Report');
        window.XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
        SolvantaUI.toast(`Excel file downloaded: ${filename}`, 'success');
        return true;
      } catch (err) {
        console.warn('XLSX failed, falling back to CSV:', err);
      }
    }
    // Fallback
    return exportToCSV(headers, rows, filename.replace('.xlsx', '.csv'));
  }

  /**
   * Helper to export an existing HTML Table element
   */
  function exportHtmlTable(tableId, filename = 'Solvanta_Table_Data') {
    const table = document.getElementById(tableId);
    if (!table) {
      SolvantaUI.toast('Table not found to export', 'warning');
      return;
    }

    const headers = [];
    table.querySelectorAll('thead th').forEach(th => {
      // Ignore action columns
      if (!th.classList.contains('no-export')) {
        headers.push(th.innerText.trim());
      }
    });

    const rows = [];
    table.querySelectorAll('tbody tr').forEach(tr => {
      // Ignore empty states
      if (tr.querySelector('.empty-state')) return;
      const row = [];
      tr.querySelectorAll('td').forEach((td, idx) => {
        // Match only exportable columns
        if (headers[idx] !== undefined) {
          row.push(td.innerText.trim());
        }
      });
      if (row.length > 0) rows.push(row);
    });

    if (rows.length === 0) {
      SolvantaUI.toast('No table records found to export.', 'warning');
      return;
    }

    exportToExcel('Table Data', headers, rows, `${filename}.xlsx`);
  }

  return {
    exportToCSV,
    exportToExcel,
    exportHtmlTable
  };
})();
