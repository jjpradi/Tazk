// Layout JSON schema. Phase 4b: each element can carry x/y/w/h (in mm)
// for free positioning. Templates created in 4a (no positions) still render
// via the stacked fallback in LabelPreview.
//
// Stage 7b.4 — added `code_secondary` so a single label can carry BOTH a QR
// and a barcode (common requirement for Indian retail 3-up thermal rolls).
// Each symbol element has a `format` field ('qrcode' | 'barcode') so the
// renderer ignores the print-time format toggle for these slots.

export const ELEMENT_KEYS = ['code', 'code_secondary', 'name', 'value', 'mrp', 'price', 'batch', 'expiry', 'logo'];

export const ELEMENT_LABELS = {
  code:           { label: 'Primary symbol (QR / barcode)', alwaysShown: true,  fixedHeight: true,  isSymbol: true },
  code_secondary: { label: 'Secondary symbol',              alwaysShown: false, fixedHeight: true,  isSymbol: true },
  name:           { label: 'Display name',                  alwaysShown: false, fixedHeight: false },
  value:          { label: 'Code value text',               alwaysShown: false, fixedHeight: false },
  mrp:            { label: 'MRP',                           alwaysShown: false, fixedHeight: false },
  price:          { label: 'Selling / Offer price',         alwaysShown: false, fixedHeight: false },
  batch:          { label: 'Batch / Serial no',             alwaysShown: false, fixedHeight: false },
  expiry:         { label: 'Expiry date',                   alwaysShown: false, fixedHeight: false },
  logo:           { label: 'Company logo',                  alwaysShown: false, fixedHeight: false },
};

// Default layout used when creating a new template (50×25 mm thermal-shape preset).
// Includes x/y/w/h so the visual designer has a reasonable starting layout.
export function defaultLayout() {
  return {
    code:           { show: true,  x: 16, y: 1,  w: 18, h: 18, format: null,      align: 'center' },
    code_secondary: { show: false, x: 0,  y: 19, w: 50, h: 5,  format: 'barcode', align: 'center' },
    name:           { show: true,  x: 0,  y: 20, w: 50, h: 3,  font_size: 9, weight: 700, align: 'center', label: '' },
    value:          { show: true,  x: 0,  y: 23, w: 50, h: 2,  font_size: 7, weight: 400, align: 'center', label: '' },
    mrp:            { show: false, x: 0,  y: 23, w: 25, h: 2,  font_size: 8, weight: 400, align: 'right',  label: 'MRP' },
    price:          { show: false, x: 25, y: 23, w: 25, h: 2,  font_size: 9, weight: 700, align: 'right',  label: '₹' },
    batch:          { show: false, x: 0,  y: 23, w: 25, h: 2,  font_size: 7, weight: 400, align: 'left',   label: 'Batch' },
    expiry:         { show: false, x: 25, y: 23, w: 25, h: 2,  font_size: 7, weight: 400, align: 'right',  label: 'Exp' },
    logo:           { show: false, x: 0,  y: 0,  w: 14, h: 6,  align: 'center' },
  };
}

// Merge a stored layout with defaults so older templates always render.
export function mergeWithDefaults(layout) {
  const base = defaultLayout();
  if (!layout || typeof layout !== 'object') return base;
  const out = { ...base };
  Object.keys(base).forEach((k) => { out[k] = { ...base[k], ...(layout[k] || {}) }; });
  return out;
}

// Was this layout produced by the visual designer? (Has at least one
// element with explicit x/y coordinates.)
export function isPositionedLayout(layout) {
  if (!layout || typeof layout !== 'object') return false;
  return ELEMENT_KEYS.some((k) => {
    const e = layout[k];
    return e && (e.x != null || e.y != null);
  });
}
