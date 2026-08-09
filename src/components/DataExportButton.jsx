import React from 'react';
import { Download } from 'lucide-react';
import { downloadCsv } from '../utils/csvExport.js';

const DataExportButton = ({ data, filename, columns, label = 'Export CSV' }) => {
  const handleExport = () => {
    downloadCsv(data, filename, columns);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#005DAA]"
      aria-label={label}
    >
      <Download size={16} />
      <span>{label}</span>
    </button>
  );
};

export default DataExportButton;
