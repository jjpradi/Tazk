/**
 * Currency formatting and report display utilities.
 * INR with Indian-style commas (12,34,567.00), Cr/Dr labelling.
 */

const INR = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format amount with INR commas and currency symbol, preserving sign. */
export const fmtINR = (val) => {
  const n = Number(val) || 0;
  const sign = n < 0 ? '-' : '';
  return sign + '\u20B9' + INR.format(Math.abs(n));
};

/** Format with Cr/Dr suffix based on sign (debit-natural convention). */
export const fmtCrDr = (val) => {
  const n = Number(val) || 0;
  if (n === 0) return '\u20B90.00';
  const suffix = n >= 0 ? ' Dr' : ' Cr';
  return '\u20B9' + INR.format(Math.abs(n)) + suffix;
};

/** Format date string (yyyy-mm-dd) to dd/mm/yyyy for display. */
export const fmtDate = (d) => {
  if (!d) return '-';
  const s = String(d).slice(0, 10);
  const [y, m, day] = s.split('-');
  return `${day}/${m}/${y}`;
};

/** Get current Indian FY dates (Apr 1 - Mar 31). */
export const getCurrentFY = () => {
  const today = new Date();
  const month = today.getMonth(); // 0-indexed
  const year = month >= 3 ? today.getFullYear() : today.getFullYear() - 1;
  return {
    fromDate: `${year}-04-01`,
    toDate: `${year + 1}-03-31`,
    label: `FY ${year}-${year + 1}`,
  };
};

/** Build FY presets for the dropdown (last 5 years). */
export const getFYPresets = () => {
  const today = new Date();
  const currentStartYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
  const presets = [];
  for (let i = 0; i < 5; i++) {
    const y = currentStartYear - i;
    presets.push({
      label: `FY ${y}-${y + 1}`,
      fromDate: `${y}-04-01`,
      toDate: `${y + 1}-03-31`,
    });
  }
  return presets;
};

/** Format percentage with 1 decimal, e.g. "12.3%". */
export const fmtPct = (val) => {
  const n = Number(val);
  if (n == null || isNaN(n)) return '-';
  return `${n.toFixed(1)}%`;
};

/** Amount cell sx for monospace + right-align. */
export const amountCellSx = {
  fontFamily: '"Roboto Mono", monospace',
  textAlign: 'right',
  fontSize: '0.8125rem',
  whiteSpace: 'nowrap',
};

/** Format date as "dd MMM yyyy" (e.g. "01 Apr 2024"). */
export const fmtDateLong = (d) => {
  if (!d) return '-';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

/**
 * Report-wide theme tokens — aligned with the application's MUI theme
 * (Poppins font, primary #0A8FDC, success #11C15B, error #D32F2F).
 */
export const reportTheme = {
  headerBg: '#f5f5f5',          // matches MUI TableCell head override
  borderColor: '#E0E0E0',      // grey.300 from app theme
  hoverBg: '#EDF4FA',          // matches MUI TableRow hover override
  tileBg: '#FFFFFF',
  sectionBg: '#F5F6FA',        // grey.100 from app theme
  parentRowBg: '#FAFAFA',      // grey.50 from app theme
  negativeColor: '#D32F2F',    // error.main
  positiveColor: '#11C15B',    // success.main from app theme
  accentColor: '#0A8FDC',      // primary.main from app theme
};

/**
 * Export visible rows as CSV and trigger browser download.
 *
 * @param {Array}  rows     - Array of objects
 * @param {Array}  columns  - [{ key, label, render? }]
 * @param {string} filename - e.g. "trial-balance.csv"
 */
export const exportCSV = (rows, columns, filename = 'report.csv') => {
  if (!rows.length) return;

  const header = columns.map((c) => `"${c.label}"`).join(',');
  const body = rows.map((row) =>
    columns.map((col) => {
      let val = row[col.key];
      if (val == null) val = '';
      // Numeric: strip formatting, keep raw
      if (typeof val === 'number') return val;
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',')
  ).join('\n');

  const csv = header + '\n' + body;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};


