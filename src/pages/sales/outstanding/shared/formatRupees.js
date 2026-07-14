/**
 * Compact rupee formatter for chip-sized labels.
 *  - < 1 lakh:  ₹12,345.67
 *  - 1L–<1Cr:   ₹12.34L
 *  - >= 1Cr:    ₹1.23Cr
 *
 * Returns a string WITHOUT the leading ₹ (the chip wraps it itself).
 */
export function formatRupeesCompact(input) {
  const n = Number(input);
  if (!isFinite(n) || n === 0) return '0.00';
  const abs = Math.abs(n);
  if (abs >= 1e7) return (n / 1e7).toFixed(2) + 'Cr';
  if (abs >= 1e5) return (n / 1e5).toFixed(2) + 'L';
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
