// Pre-defined label sizes. `key` is what gets stored in code_templates.paper_size.
// Width/height are in mm. rows/cols default for sheet-based formats.

export const LABEL_PRESETS = [
  { key: 'thermal-50x25',  label: 'Thermal 50 × 25 mm',   group: 'Thermal',     width: 50,  height: 25,  rows: 1, cols: 1, gap_x: 0, gap_y: 0 },
  { key: 'thermal-75x25',  label: 'Thermal 75 × 25 mm',   group: 'Thermal',     width: 75,  height: 25,  rows: 1, cols: 1, gap_x: 0, gap_y: 0 },
  { key: 'thermal-100x50', label: 'Thermal 100 × 50 mm',  group: 'Thermal',     width: 100, height: 50,  rows: 1, cols: 1, gap_x: 0, gap_y: 0 },
  { key: 'qr-25x25',       label: 'QR sticker 25 × 25 mm', group: 'QR sticker',  width: 25,  height: 25,  rows: 1, cols: 1, gap_x: 0, gap_y: 0 },
  { key: 'qr-50x50',       label: 'QR sticker 50 × 50 mm', group: 'QR sticker',  width: 50,  height: 50,  rows: 1, cols: 1, gap_x: 0, gap_y: 0 },
  { key: 'A4-3x8',         label: 'A4 — 24 labels (3 × 8)',  group: 'A4 sheet',   width: 63,   height: 35,   rows: 8,  cols: 3, gap_x: 3,   gap_y: 0 },
  { key: 'A4-2x7',         label: 'A4 — 14 labels (2 × 7)',  group: 'A4 sheet',   width: 99,   height: 38,   rows: 7,  cols: 2, gap_x: 3,   gap_y: 0 },
  { key: 'A4-5x13',        label: 'A4 — 65 labels (5 × 13)', group: 'A4 sheet',   width: 38.1, height: 21.2, rows: 13, cols: 5, gap_x: 2.5, gap_y: 0 },
  { key: 'A4-4x10',        label: 'A4 — 40 labels (4 × 10)', group: 'A4 sheet',   width: 48.5, height: 25.4, rows: 10, cols: 4, gap_x: 0,   gap_y: 0 },
  { key: 'A4-4x8',         label: 'A4 — 32 labels (4 × 8)',  group: 'A4 sheet',   width: 50,   height: 30,   rows: 8,  cols: 4, gap_x: 2,   gap_y: 2 },
  { key: 'A4-3x10',        label: 'A4 — 30 labels (3 × 10)', group: 'A4 sheet',   width: 70,   height: 29.7, rows: 10, cols: 3, gap_x: 0,   gap_y: 0 },
  { key: 'custom',         label: 'Custom dimensions',     group: 'Custom',     width: 50,  height: 25,  rows: 1, cols: 1, gap_x: 0, gap_y: 0 },
];

export function findPreset(key) {
  return LABEL_PRESETS.find((p) => p.key === key) || LABEL_PRESETS[0];
}
