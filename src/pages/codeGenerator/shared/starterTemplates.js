// Ready-to-use templates for Indian electronics retail.
// Installed via the "Install starter templates" button in the Templates tab;
// each becomes a row in code_templates via the existing POST /templates endpoint.
//
// All templates apply to code_type='product' (the typical use for store labels).
// Element positions in mm (matches the Phase 4b positioned-layout schema).
// Margins are 0 — print-output expectation is bezel-less thermal stock.

const T = (name, format, w, h, layout, codeType = 'product', extras = {}) => ({
  name,
  code_type: codeType,
  paper_size:
      w === 50 && h === 25     ? 'thermal-50x25'
    : w === 75 && h === 25     ? 'thermal-75x25'
    : w === 100 && h === 50    ? 'thermal-100x50'
    : w === 38.1 && h === 21.2 ? 'A4-5x13'
    : w === 48.5 && h === 25.4 ? 'A4-4x10'
    : w === 50 && h === 30 && extras.cols_per_sheet === 4 ? 'A4-4x8'
    : w === 70 && h === 29.7   ? 'A4-3x10'
    : 'custom',
  width_mm: w,
  height_mm: h,
  margin_top_mm: 0,
  margin_bottom_mm: 0,
  margin_left_mm: 0,
  margin_right_mm: 0,
  gap_x_mm: 0,
  gap_y_mm: 0,
  rows_per_sheet: 1,
  cols_per_sheet: 1,
  orientation: w >= h ? 'landscape' : 'portrait',
  is_default: false,
  // Format isn't a column on code_templates (templates work with both QR + barcode
  // at print time), but we set the symbol size assuming the chosen format.
  _format: format,
  layout_json: layout,
  // Caller can override sheet/grid + gap properties (multi-column thermal etc.)
  ...extras,
});

// Helpers — symbol element block. `format` is per-element ('qrcode' | 'barcode'
// | null). Null = follow the print-time format toggle. For combo labels we set
// format explicitly so both symbols can co-exist on one label.
const SYM = (format, x, y, w, h) => ({ show: true, x, y, w, h, format, align: 'center' });
const QR_SYMBOL  = (x, y, size)  => SYM('qrcode',  x, y, size, size);
const BAR_SYMBOL = (x, y, w, h)  => SYM('barcode', x, y, w, h);

const TEXT = (x, y, w, h, font, weight, align, label) => ({
  show: true, x, y, w, h, font_size: font, weight, align, label: label || '',
});

const HIDDEN = (x, y) => ({ show: false, x, y, w: 4, h: 2 });

// =============================================================================
// QR templates — symbol on the left, text stack on the right.
// =============================================================================

// 50 × 25 mm — standard product label (mobile accessories, small electronics)
const QR_50x25 = T(
  'Electronics — QR 50×25 mm (standard)', 'qrcode', 50, 25,
  {
    code:   QR_SYMBOL(1, 1, 22),
    name:   TEXT(24, 1,  25, 5,  8,  700, 'left',  ''),
    mrp:    TEXT(24, 7,  25, 4,  6,  400, 'left',  'MRP'),
    price:  TEXT(24, 11, 25, 7,  11, 700, 'left',  '₹'),
    value:  TEXT(1,  23, 48, 2,  6,  400, 'center', ''),
    code_secondary: HIDDEN(0, 0),
    batch:  HIDDEN(0, 0),
    expiry: HIDDEN(0, 0),
    logo:   HIDDEN(0, 0),
  },
);

// 75 × 25 mm — wider product label (room for longer product names)
const QR_75x25 = T(
  'Electronics — QR 75×25 mm (wide)', 'qrcode', 75, 25,
  {
    code:   QR_SYMBOL(1, 1, 22),
    name:   TEXT(24, 1,  50, 5,  9,  700, 'left',  ''),
    mrp:    TEXT(24, 7,  25, 4,  7,  400, 'left',  'MRP'),
    price:  TEXT(50, 7,  24, 8,  12, 700, 'right', '₹'),
    value:  TEXT(24, 17, 50, 4,  7,  400, 'left',  ''),
    code_secondary: HIDDEN(0, 0),
    batch:  HIDDEN(0, 0),
    expiry: HIDDEN(0, 0),
    logo:   HIDDEN(0, 0),
  },
);

// 100 × 50 mm — large boxed items (TVs, appliances)
const QR_100x50 = T(
  'Electronics — QR 100×50 mm (large box)', 'qrcode', 100, 50,
  {
    code:   QR_SYMBOL(2, 2, 32),
    name:   TEXT(36, 2,  62, 8,  13, 700, 'left',  ''),
    mrp:    TEXT(36, 12, 30, 5,  9,  400, 'left',  'MRP'),
    price:  TEXT(68, 12, 30, 10, 17, 700, 'right', '₹'),
    value:  TEXT(2,  36, 96, 5,  10, 400, 'center', ''),
    code_secondary: HIDDEN(0, 0),
    batch:  HIDDEN(0, 0),
    expiry: TEXT(36, 24, 62, 5, 8, 400, 'left', 'Warranty:'),
    logo:   HIDDEN(0, 0),
  },
);

// =============================================================================
// Barcode templates — barcode strip on top, text below.
// =============================================================================

// 50 × 25 mm — shelf tag with barcode
const BAR_50x25 = T(
  'Electronics — Barcode 50×25 mm (shelf tag)', 'barcode', 50, 25,
  {
    code:   BAR_SYMBOL(1, 1, 48, 9),
    name:   TEXT(1, 11, 48, 4,  8,  700, 'center', ''),
    mrp:    TEXT(1, 16, 24, 3,  6,  400, 'left',   'MRP'),
    price:  TEXT(25, 16, 24, 5, 10, 700, 'right',  '₹'),
    value:  TEXT(1, 22, 48, 3,  6,  400, 'center', ''),
    code_secondary: HIDDEN(0, 0),
    batch:  HIDDEN(0, 0),
    expiry: HIDDEN(0, 0),
    logo:   HIDDEN(0, 0),
  },
);

// 75 × 25 mm — wider barcode shelf tag
const BAR_75x25 = T(
  'Electronics — Barcode 75×25 mm (wide shelf tag)', 'barcode', 75, 25,
  {
    code:   BAR_SYMBOL(1, 1, 73, 10),
    name:   TEXT(1, 12, 73, 4,  9,  700, 'center', ''),
    mrp:    TEXT(1, 17, 36, 4,  7,  400, 'left',   'MRP'),
    price:  TEXT(38, 17, 36, 5, 11, 700, 'right',  '₹'),
    value:  TEXT(1, 22, 73, 3,  7,  400, 'center', ''),
    code_secondary: HIDDEN(0, 0),
    batch:  HIDDEN(0, 0),
    expiry: HIDDEN(0, 0),
    logo:   HIDDEN(0, 0),
  },
);

// 100 × 50 mm — large item barcode label
const BAR_100x50 = T(
  'Electronics — Barcode 100×50 mm (large item)', 'barcode', 100, 50,
  {
    code:   BAR_SYMBOL(2, 2, 96, 16),
    name:   TEXT(2,  20, 96, 7,  13, 700, 'center', ''),
    mrp:    TEXT(2,  29, 48, 6,  10, 400, 'left',   'MRP'),
    price:  TEXT(50, 29, 48, 10, 17, 700, 'right',  '₹'),
    value:  TEXT(2,  42, 96, 5,  10, 400, 'center', ''),
    code_secondary: HIDDEN(0, 0),
    batch:  HIDDEN(0, 0),
    expiry: HIDDEN(0, 0),
    logo:   HIDDEN(0, 0),
  },
);

// =============================================================================
// Asset templates — Tag / Owner / Dept / Warranty.
// =============================================================================

// 100 × 50 mm — large asset sticker (laptops, equipment)
const ASSET_QR_100x50 = T(
  'Asset — QR 100×50 mm (full)', 'qrcode', 100, 50,
  {
    code:   QR_SYMBOL(2, 2, 32),
    name:   TEXT(36, 2,  62, 7,  12, 700, 'left',  ''),
    mrp:    TEXT(36, 11, 62, 5,  10, 700, 'left',  'Tag:'),
    price:  TEXT(36, 18, 62, 5,  9,  400, 'left',  'Owner:'),
    batch:  TEXT(36, 25, 62, 5,  9,  400, 'left',  'Dept:'),
    expiry: TEXT(36, 32, 62, 5,  9,  400, 'left',  'Warranty:'),
    value:  TEXT(2,  36, 32, 4,  7,  400, 'center', ''),
    code_secondary: HIDDEN(0, 0),
    logo:   HIDDEN(0, 0),
  },
  'asset',
);

// 50 × 25 mm — compact asset tag (small items, peripherals)
const ASSET_QR_50x25 = T(
  'Asset — QR 50×25 mm (compact)', 'qrcode', 50, 25,
  {
    code:   QR_SYMBOL(1, 1, 22),
    name:   TEXT(24, 1,  25, 5,  8, 700, 'left',  ''),
    mrp:    TEXT(24, 7,  25, 4,  7, 700, 'left',  'Tag:'),
    price:  TEXT(24, 12, 25, 4,  7, 400, 'left',  'Owner:'),
    value:  TEXT(1,  23, 48, 2,  6, 400, 'center', ''),
    code_secondary: HIDDEN(0, 0),
    batch:  HIDDEN(0, 0),
    expiry: HIDDEN(0, 0),
    logo:   HIDDEN(0, 0),
  },
  'asset',
);

// =============================================================================
// Employee templates — ID / Designation / Dept badge.
// =============================================================================

// 75 × 25 mm — employee badge / lanyard
const EMPLOYEE_QR_75x25 = T(
  'Employee — QR 75×25 mm (badge)', 'qrcode', 75, 25,
  {
    code:   QR_SYMBOL(1, 1, 22),
    name:   TEXT(24, 1,  50, 6,  11, 700, 'left',  ''),
    mrp:    TEXT(24, 8,  50, 4,  8,  700, 'left',  'ID:'),
    price:  TEXT(24, 13, 50, 4,  8,  400, 'left',  ''),
    batch:  TEXT(24, 18, 50, 4,  7,  400, 'left',  'Dept:'),
    code_secondary: HIDDEN(0, 0),
    value:  HIDDEN(0, 0),
    expiry: HIDDEN(0, 0),
    logo:   HIDDEN(0, 0),
  },
  'employee',
);

// =============================================================================
// Stage 7b.3 — one starter each for the remaining 6 types.
// =============================================================================

const CUSTOMER_QR_75x25 = T(
  'Customer — QR 75×25 mm (loyalty card)', 'qrcode', 75, 25,
  {
    code:   QR_SYMBOL(1, 1, 22),
    name:   TEXT(24, 1,  50, 6,  11, 700, 'left',  ''),
    mrp:    TEXT(24, 8,  50, 4,  8,  400, 'left',  'Phone:'),
    price:  TEXT(24, 13, 50, 4,  7,  400, 'left',  'Email:'),
    batch:  TEXT(24, 18, 50, 4,  7,  400, 'left',  'City:'),
    code_secondary: HIDDEN(0, 0),
    value:  HIDDEN(0, 0),
    expiry: HIDDEN(0, 0),
    logo:   HIDDEN(0, 0),
  },
  'customer',
);

const VENDOR_QR_75x25 = T(
  'Vendor — QR 75×25 mm (profile)', 'qrcode', 75, 25,
  {
    code:   QR_SYMBOL(1, 1, 22),
    name:   TEXT(24, 1,  50, 6,  11, 700, 'left',  ''),
    mrp:    TEXT(24, 8,  50, 4,  8,  400, 'left',  'GSTIN:'),
    price:  TEXT(24, 13, 50, 4,  7,  400, 'left',  'Contact:'),
    batch:  TEXT(24, 18, 50, 4,  7,  400, 'left',  'City:'),
    code_secondary: HIDDEN(0, 0),
    value:  HIDDEN(0, 0),
    expiry: HIDDEN(0, 0),
    logo:   HIDDEN(0, 0),
  },
  'vendor',
);

const LOCATION_QR_50x25 = T(
  'Location — QR 50×25 mm (branch sticker)', 'qrcode', 50, 25,
  {
    code:   QR_SYMBOL(1, 1, 22),
    name:   TEXT(24, 1,  25, 5,  9, 700, 'left',  ''),
    mrp:    TEXT(24, 7,  25, 4,  6, 400, 'left',  ''),
    price:  TEXT(24, 12, 25, 4,  7, 400, 'left',  ''),
    batch:  TEXT(24, 17, 25, 4,  7, 400, 'left',  'PIN:'),
    code_secondary: HIDDEN(0, 0),
    value:  HIDDEN(0, 0),
    expiry: HIDDEN(0, 0),
    logo:   HIDDEN(0, 0),
  },
  'location',
);

const INVOICE_QR_75x25 = T(
  'Invoice — QR 75×25 mm (attached label)', 'qrcode', 75, 25,
  {
    code:   QR_SYMBOL(1, 1, 22),
    name:   TEXT(24, 1,  50, 5,  10, 700, 'left',  'Inv:'),
    mrp:    TEXT(24, 7,  50, 4,  7,  400, 'left',  'Date:'),
    price:  TEXT(24, 12, 50, 4,  7,  400, 'left',  'To:'),
    batch:  TEXT(24, 17, 25, 4,  9,  700, 'left',  ''),
    expiry: TEXT(50, 17, 24, 4,  6,  400, 'right', 'Due:'),
    code_secondary: HIDDEN(0, 0),
    value:  HIDDEN(0, 0),
    logo:   HIDDEN(0, 0),
  },
  'invoice',
);

const DOCUMENT_QR_50x25 = T(
  'Document — QR 50×25 mm (cover)', 'qrcode', 50, 25,
  {
    code:   QR_SYMBOL(1, 1, 22),
    name:   TEXT(24, 1,  25, 5,  9, 700, 'left',  ''),
    mrp:    TEXT(24, 7,  25, 4,  7, 400, 'left',  'Type:'),
    price:  TEXT(24, 12, 25, 4,  7, 400, 'left',  'Date:'),
    expiry: TEXT(24, 17, 25, 4,  6, 400, 'left',  'v'),
    code_secondary: HIDDEN(0, 0),
    value:  HIDDEN(0, 0),
    batch:  HIDDEN(0, 0),
    logo:   HIDDEN(0, 0),
  },
  'document',
);

const CUSTOM_QR_50x25 = T(
  'Custom — QR 50×25 mm (generic)', 'qrcode', 50, 25,
  {
    code:   QR_SYMBOL(1, 1, 22),
    name:   TEXT(24, 1,  25, 5,  9, 700, 'left',  ''),
    mrp:    TEXT(24, 7,  25, 4,  7, 400, 'left',  ''),
    price:  TEXT(24, 12, 25, 4,  7, 400, 'left',  ''),
    batch:  TEXT(24, 17, 25, 4,  7, 400, 'left',  ''),
    code_secondary: HIDDEN(0, 0),
    value:  HIDDEN(0, 0),
    expiry: HIDDEN(0, 0),
    logo:   HIDDEN(0, 0),
  },
  'custom',
);

// =============================================================================
// Stage 7b.4 — 3-row adhesive thermal-transfer rolls (Indian retail combo).
// Each label carries BOTH a QR (for app/inventory scan) and a Code-128 barcode
// (for legacy POS scanners). Standard sizes correlate to commonly-stocked TTR
// rolls: 32×25, 38×25, 40×25, 50×30 (3 columns per row).
// =============================================================================

// 32 × 25 mm — small electronics / earphones / chargers — 3-up TTR roll
const COMBO_3UP_32x25 = T(
  'Retail Combo — Thermal 3-up 32×25 mm (QR + Barcode)', 'qrcode', 32, 25,
  {
    code:           SYM('qrcode',  1, 1,  10, 10),    // small QR top-left
    code_secondary: SYM('barcode', 1, 18, 30, 6),     // barcode strip bottom
    name:           TEXT(12, 1,  19, 4,  6, 700, 'left',  ''),       // product name
    price:          TEXT(12, 5,  19, 6,  10, 700, 'left',  '₹'),     // offer price
    mrp:            TEXT(12, 11, 19, 3,  5, 400, 'left',  'MRP'),    // tiny MRP
    value:          TEXT(1,  15, 30, 3,  6, 400, 'center', ''),      // SKU above bar
    batch:          HIDDEN(0, 0),
    expiry:         HIDDEN(0, 0),
    logo:           HIDDEN(0, 0),
  },
  'product',
  { cols_per_sheet: 3, gap_x_mm: 2, rows_per_sheet: 1 },
);

// 38 × 25 mm — standard combo for most accessories, 3-up TTR roll
const COMBO_3UP_38x25 = T(
  'Retail Combo — Thermal 3-up 38×25 mm (QR + Barcode)', 'qrcode', 38, 25,
  {
    code:           SYM('qrcode',  1, 1,  11, 11),
    code_secondary: SYM('barcode', 1, 18, 36, 6),
    name:           TEXT(13, 1,  24, 4,  7,  700, 'left',  ''),
    price:          TEXT(13, 5,  24, 6,  11, 700, 'left',  '₹'),
    mrp:            TEXT(13, 11, 24, 3,  5,  400, 'left',  'MRP'),
    value:          TEXT(1,  14, 36, 3,  6,  400, 'center', ''),
    batch:          HIDDEN(0, 0),
    expiry:         HIDDEN(0, 0),
    logo:           HIDDEN(0, 0),
  },
  'product',
  { cols_per_sheet: 3, gap_x_mm: 2, rows_per_sheet: 1 },
);

// 40 × 25 mm — slightly wider variant; barcode reads better at this width
const COMBO_3UP_40x25 = T(
  'Retail Combo — Thermal 3-up 40×25 mm (QR + Barcode)', 'qrcode', 40, 25,
  {
    code:           SYM('qrcode',  1, 1,  11, 11),
    code_secondary: SYM('barcode', 1, 18, 38, 6),
    name:           TEXT(13, 1,  26, 4,  7,  700, 'left',  ''),
    price:          TEXT(13, 5,  26, 6,  11, 700, 'left',  '₹'),
    mrp:            TEXT(13, 11, 26, 3,  5,  400, 'left',  'MRP'),
    value:          TEXT(1,  14, 38, 3,  6,  400, 'center', ''),
    batch:          HIDDEN(0, 0),
    expiry:         HIDDEN(0, 0),
    logo:           HIDDEN(0, 0),
  },
  'product',
  { cols_per_sheet: 3, gap_x_mm: 2, rows_per_sheet: 1 },
);

// 50 × 30 mm — flagship retail label, 3-up TTR roll (matches QUANTRON sample)
const COMBO_3UP_50x30 = T(
  'Retail Combo — Thermal 3-up 50×30 mm (QR + Barcode, flagship)', 'qrcode', 50, 30,
  {
    code:           SYM('qrcode',  1, 1,  14, 14),
    code_secondary: SYM('barcode', 1, 22, 48, 7),
    name:           TEXT(16, 1,  33, 5,  8,  700, 'left',  ''),
    mrp:            TEXT(16, 6,  33, 4,  6,  400, 'left',  'MRP'),
    price:          TEXT(16, 11, 33, 7,  13, 700, 'left',  '₹'),
    value:          TEXT(1,  17, 48, 4,  7,  400, 'center', ''),
    batch:          HIDDEN(0, 0),
    expiry:         HIDDEN(0, 0),
    logo:           HIDDEN(0, 0),
  },
  'product',
  { cols_per_sheet: 3, gap_x_mm: 2, rows_per_sheet: 1 },
);

// 75 × 30 mm — single-up combo for wider standalone product labels
const COMBO_1UP_75x30 = T(
  'Retail Combo — Thermal 75×30 mm (QR + Barcode, single)', 'qrcode', 75, 30,
  {
    code:           SYM('qrcode',  1, 1,  16, 16),
    code_secondary: SYM('barcode', 19, 18, 55, 8),
    name:           TEXT(19, 1,  55, 5,  10, 700, 'left',  ''),
    price:          TEXT(19, 6,  35, 6,  13, 700, 'left',  '₹'),
    mrp:            TEXT(54, 6,  20, 5,  8,  400, 'right', 'MRP'),
    value:          TEXT(19, 13, 55, 4,  7,  400, 'left',  ''),
    batch:          HIDDEN(0, 0),
    expiry:         HIDDEN(0, 0),
    logo:           HIDDEN(0, 0),
  },
  'product',
  { cols_per_sheet: 1, gap_x_mm: 0, rows_per_sheet: 1 },
);

// 100 × 50 mm — large boxed item combo, 2-up TTR roll
const COMBO_2UP_100x50 = T(
  'Retail Combo — Thermal 2-up 100×50 mm (QR + Barcode, large)', 'qrcode', 100, 50,
  {
    code:           SYM('qrcode',  2, 2,  26, 26),
    code_secondary: SYM('barcode', 30, 36, 68, 12),
    name:           TEXT(32, 2,  64, 6,  13, 700, 'left',  ''),
    mrp:            TEXT(32, 9,  64, 5,  9,  400, 'left',  'MRP'),
    price:          TEXT(32, 15, 64, 9,  19, 700, 'left',  '₹'),
    value:          TEXT(2,  32, 26, 4,  7,  400, 'center', ''),
    batch:          HIDDEN(0, 0),
    expiry:         HIDDEN(0, 0),
    logo:           HIDDEN(0, 0),
  },
  'product',
  { cols_per_sheet: 2, gap_x_mm: 3, rows_per_sheet: 1 },
);

// =============================================================================
// Stage 7b.5 — A4 self-adhesive sticker sheets (Indian stationery standards).
// Common counts: 65, 40, 32, 30 stickers per A4 page.
//   65-up  Avery L7651-equivalent  38.1 × 21.2 mm  (5 × 13)  small address
//   40-up  Avery L7654-equivalent  48.5 × 25.4 mm  (4 × 10)  product label
//   32-up  Indian retail            50.0 × 30.0 mm  (4 ×  8)  combo QR+BAR
//   30-up  Indian retail            70.0 × 29.7 mm  (3 × 10)  combo QR+BAR
// 65-up is too small for a QR + barcode combo, so it's barcode-only.
// =============================================================================

// 65-up A4 — 38.1 × 21.2 mm — barcode strip + name + price (no QR room)
const A4_65UP = T(
  'A4 sticker — 65-up 38.1×21.2 mm (small address / barcode only)', 'barcode', 38.1, 21.2,
  {
    code:           BAR_SYMBOL(1, 1, 36, 7),
    name:           TEXT(1, 9,  36, 4,  6, 700, 'center', ''),
    value:          TEXT(1, 13, 36, 3,  5, 400, 'center', ''),
    price:          TEXT(1, 17, 36, 4,  7, 700, 'center', '₹'),
    code_secondary: HIDDEN(0, 0),
    mrp:            HIDDEN(0, 0),
    batch:          HIDDEN(0, 0),
    expiry:         HIDDEN(0, 0),
    logo:           HIDDEN(0, 0),
  },
  'product',
  { cols_per_sheet: 5, rows_per_sheet: 13, gap_x_mm: 2.5, gap_y_mm: 0,
    margin_top_mm: 10.7, margin_bottom_mm: 10.7, margin_left_mm: 4.7, margin_right_mm: 4.7 },
);

// 40-up A4 — 48.5 × 25.4 mm — QR + name + price (no barcode strip room)
const A4_40UP = T(
  'A4 sticker — 40-up 48.5×25.4 mm (product label, QR + price)', 'qrcode', 48.5, 25.4,
  {
    code:           QR_SYMBOL(1, 1, 22),
    name:           TEXT(24, 1,  24, 5,  7,  700, 'left',  ''),
    mrp:            TEXT(24, 7,  24, 4,  6,  400, 'left',  'MRP'),
    price:          TEXT(24, 12, 24, 6,  10, 700, 'left',  '₹'),
    value:          TEXT(1,  23, 47, 2,  6,  400, 'center', ''),
    code_secondary: HIDDEN(0, 0),
    batch:          HIDDEN(0, 0),
    expiry:         HIDDEN(0, 0),
    logo:           HIDDEN(0, 0),
  },
  'product',
  { cols_per_sheet: 4, rows_per_sheet: 10, gap_x_mm: 0, gap_y_mm: 0,
    margin_top_mm: 21.5, margin_bottom_mm: 21.5, margin_left_mm: 8, margin_right_mm: 8 },
);

// 32-up A4 — 50 × 30 mm — combo (QR top-left + barcode strip bottom)
const A4_32UP = T(
  'A4 sticker — 32-up 50×30 mm (combo QR + Barcode)', 'qrcode', 50, 30,
  {
    code:           SYM('qrcode',  1, 1,  14, 14),
    code_secondary: SYM('barcode', 1, 22, 48, 7),
    name:           TEXT(16, 1,  33, 5,  8,  700, 'left',  ''),
    mrp:            TEXT(16, 6,  33, 4,  6,  400, 'left',  'MRP'),
    price:          TEXT(16, 11, 33, 7,  13, 700, 'left',  '₹'),
    value:          TEXT(1,  17, 48, 4,  7,  400, 'center', ''),
    batch:          HIDDEN(0, 0),
    expiry:         HIDDEN(0, 0),
    logo:           HIDDEN(0, 0),
  },
  'product',
  { cols_per_sheet: 4, rows_per_sheet: 8, gap_x_mm: 2, gap_y_mm: 2,
    margin_top_mm: 20.5, margin_bottom_mm: 20.5, margin_left_mm: 0, margin_right_mm: 0 },
);

// 30-up A4 — 70 × 29.7 mm — combo with wider barcode for better scan reliability
const A4_30UP = T(
  'A4 sticker — 30-up 70×29.7 mm (combo QR + Barcode, wide)', 'qrcode', 70, 29.7,
  {
    code:           SYM('qrcode',  1, 1,  14, 14),
    code_secondary: SYM('barcode', 1, 22, 68, 7),
    name:           TEXT(16, 1,  53, 5,  9,  700, 'left',  ''),
    mrp:            TEXT(16, 6,  20, 4,  7,  400, 'left',  'MRP'),
    price:          TEXT(36, 6,  33, 7,  13, 700, 'left',  '₹'),
    value:          TEXT(1,  17, 68, 4,  7,  400, 'center', ''),
    batch:          HIDDEN(0, 0),
    expiry:         HIDDEN(0, 0),
    logo:           HIDDEN(0, 0),
  },
  'product',
  { cols_per_sheet: 3, rows_per_sheet: 10, gap_x_mm: 0, gap_y_mm: 0,
    margin_top_mm: 0, margin_bottom_mm: 0, margin_left_mm: 0, margin_right_mm: 0 },
);

const STARTER_TEMPLATES = [
  // Product (Phase 4c)
  QR_50x25,
  QR_75x25,
  QR_100x50,
  BAR_50x25,
  BAR_75x25,
  BAR_100x50,
  // Asset + Employee (Stage 7b.2)
  ASSET_QR_100x50,
  ASSET_QR_50x25,
  EMPLOYEE_QR_75x25,
  // Remaining 6 types (Stage 7b.3)
  CUSTOMER_QR_75x25,
  VENDOR_QR_75x25,
  LOCATION_QR_50x25,
  INVOICE_QR_75x25,
  DOCUMENT_QR_50x25,
  CUSTOM_QR_50x25,
  // 3-row adhesive TTR roll combos (Stage 7b.4) — QR + Barcode on every label
  COMBO_3UP_32x25,
  COMBO_3UP_38x25,
  COMBO_3UP_40x25,
  COMBO_3UP_50x30,
  COMBO_1UP_75x30,
  COMBO_2UP_100x50,
  // A4 self-adhesive sticker sheets (Stage 7b.5) — 65/40/32/30 stickers per sheet
  A4_65UP,
  A4_40UP,
  A4_32UP,
  A4_30UP,
];

// Strip the FE-only `_format` field before sending to the API.
export function getStarterTemplatesPayload() {
  return STARTER_TEMPLATES.map(({ _format, ...rest }) => rest);
}

// Convenience for UI — labels for the install dialog.
export const STARTER_TEMPLATE_SUMMARIES = STARTER_TEMPLATES.map((t) => ({
  name: t.name,
  size: `${t.width_mm}×${t.height_mm} mm`,
  format: t._format,
}));
