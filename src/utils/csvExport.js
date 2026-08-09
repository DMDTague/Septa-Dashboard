/**
 * Convert array of objects to CSV string
 * @param {Array<Object>} data 
 * @param {Array<string>} [columns=null] 
 * @returns {string}
 */
export function objectsToCsv(data, columns = null) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return '';
  }
  
  const cols = columns || Object.keys(data[0]);
  
  const header = cols.join(',');
  const rows = data.map(row => {
    return cols.map(col => {
      let val = row[col];
      if (val === null || val === undefined) {
        val = '';
      }
      val = String(val);
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',');
  });
  
  return [header, ...rows].join('\n');
}

/**
 * Trigger browser download of CSV
 * @param {Array<Object>} data 
 * @param {string} filename 
 * @param {Array<string>} [columns=null] 
 */
export function downloadCsv(data, filename, columns = null) {
  const csvStr = objectsToCsv(data, columns);
  if (!csvStr) return;
  
  const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
