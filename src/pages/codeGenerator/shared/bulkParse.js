// Pure helpers for bulk-upload parsing + validation.
// Used by BulkGenerateTab; kept separate so the logic is unit-testable.

import * as XLSX from 'xlsx';
import { CODE_TYPES, CODE_FORMATS } from './codeTypes';
import { CODE_TYPE_SCHEMAS } from './codeTypeSchemas';

const TYPE_KEYS    = new Set(CODE_TYPES.map((t) => t.key));
const FORMAT_KEYS  = new Set(CODE_FORMATS.map((f) => f.key));
const MODE_KEYS    = new Set(['auto', 'manual', 'random']);

// Headers we expect in the upload. Case-insensitive.
//
// Layout:
//   - Core columns (mode, code_type, ...) — always meaningful.
//   - Metadata columns — union of schema keys most users will fill across
//     types. Each row consumes the keys defined for its code_type's schema;
//     unrelated cells are silently ignored.
//   - metadata_json — escape hatch for anything not covered above.
export const CORE_COLUMNS = [
  'mode',          // auto | manual | random
  'code_type',     // product, asset, employee, ...
  'code_format',   // qrcode | barcode
  'prefix',        // optional
  'pad_length',    // auto only — defaults to 6
  'random_length', // random only — defaults to 12
  'code_value',    // manual only — required when mode = manual
  'display_name',
  'description',
  'location_id',
];

// All distinct schema field keys across types — these become CSV columns.
// Order: stable, common-fields-first.
export const METADATA_COLUMNS = (() => {
  const set = new Set();
  Object.values(CODE_TYPE_SCHEMAS).forEach((schema) => {
    schema.fields.forEach((f) => set.add(f.key));
  });
  return Array.from(set);
})();

export const COLUMNS = [...CORE_COLUMNS, ...METADATA_COLUMNS, 'metadata_json'];

// Sample CSV used by "Download template" button.
// Each row demonstrates a different code_type and which metadata columns to fill.
export function buildSampleCsv() {
  const header = COLUMNS.join(',');
  const idx = (col) => COLUMNS.indexOf(col);
  const escape = (v) => {
    if (v == null) return '';
    const s = String(v);
    return /["\n,]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  // Build a row by passing a sparse object keyed by column name.
  const row = (vals) => {
    const cells = COLUMNS.map(() => '');
    Object.entries(vals).forEach(([k, v]) => {
      const i = idx(k);
      if (i >= 0) cells[i] = v;
    });
    return cells.map(escape).join(',');
  };
  const samples = [
    row({ mode: 'auto', code_type: 'product', code_format: 'qrcode', prefix: 'PRD', pad_length: 6,
          display_name: 'Samsung A54 5G', mrp: 54999, offer_price: 49999, brand: 'Samsung' }),
    row({ mode: 'auto', code_type: 'product', code_format: 'barcode', prefix: 'PRD',
          display_name: 'JBL Tune Earbuds', mrp: 4999, offer_price: 3999, brand: 'JBL' }),
    row({ mode: 'manual', code_type: 'asset', code_format: 'qrcode',
          code_value: 'AST-LAP-001', display_name: 'Dell Latitude 7420',
          asset_tag: 'AST-LAP-001', owner: 'Venkat', department: 'IT', warranty_until: '12/2027' }),
    row({ mode: 'random', code_type: 'employee', code_format: 'qrcode', prefix: 'EMP', random_length: 8,
          display_name: 'John Doe', emp_id: 'EMP-1042', designation: 'Sales Lead', department: 'Sales' }),
    row({ mode: 'auto', code_type: 'customer', code_format: 'qrcode', prefix: 'CUS',
          display_name: 'Acme Corp', phone: '+91-9876543210', email: 'sales@acme.in', city: 'Chennai' }),
    row({ mode: 'auto', code_type: 'vendor', code_format: 'qrcode', prefix: 'VND',
          display_name: 'Globex Vendor', gstin: '33AABCG1234A1Z5', contact: 'Mr. Sharma', city: 'Mumbai' }),
  ];
  return [header, ...samples].join('\n');
}

// Parse a File (CSV or XLSX) into an array of plain objects keyed by header.
// Returns Promise<Array<{[col]: string}>>
export function parseFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        if (!ws) return resolve([]);
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false });
        // Normalize header keys to lowercase + trim.
        const out = rows.map((r) => {
          const o = {};
          Object.keys(r).forEach((k) => {
            o[String(k).trim().toLowerCase()] = typeof r[k] === 'string' ? r[k].trim() : r[k];
          });
          return o;
        });
        resolve(out);
      } catch (err) { reject(err); }
    };
    reader.readAsArrayBuffer(file);
  });
}

// Build per-row metadata from schema-defined fields. Anything in the row
// that isn't a schema key for this code_type is ignored. The metadata_json
// column (escape hatch) is parsed and merged on top.
function buildRowMetadata(row, codeType) {
  const metadata = {};
  const schema = CODE_TYPE_SCHEMAS[codeType];
  if (schema) {
    schema.fields.forEach((f) => {
      const v = row[f.key];
      if (v == null || v === '') return;
      metadata[f.key] = String(v).trim();
    });
  }
  // metadata_json escape hatch — overrides per-key columns when both present.
  if (row.metadata_json && String(row.metadata_json).trim()) {
    try {
      const extra = JSON.parse(String(row.metadata_json).trim());
      if (extra && typeof extra === 'object') Object.assign(metadata, extra);
    } catch (_e) {
      // swallow — caller surfaces this via validateRow
      throw new Error('metadata_json is not valid JSON');
    }
  }
  return metadata;
}

// Validate one parsed row. Returns {ok, error, payload}.
// payload (if ok) is the body to send to /bulk-generate per row.
export function validateRow(raw, batchValueSet) {
  const row = raw || {};
  const mode = String(row.mode || 'auto').toLowerCase();
  const codeType = String(row.code_type || '').toLowerCase();
  const codeFormat = String(row.code_format || 'qrcode').toLowerCase();

  if (!MODE_KEYS.has(mode))     return { ok: false, error: `Invalid mode "${row.mode || ''}"` };
  if (!TYPE_KEYS.has(codeType)) return { ok: false, error: `Invalid code_type "${row.code_type || ''}"` };
  if (!FORMAT_KEYS.has(codeFormat)) return { ok: false, error: `Invalid code_format "${row.code_format || ''}"` };

  let metadata;
  try {
    metadata = buildRowMetadata(row, codeType);
  } catch (err) {
    return { ok: false, error: err.message || 'Invalid metadata_json' };
  }

  const payload = {
    mode,
    code_type: codeType,
    code_format: codeFormat,
    prefix: row.prefix || '',
    display_name: row.display_name || null,
    description: row.description || null,
    location_id: row.location_id ? parseInt(row.location_id, 10) : null,
    metadata: Object.keys(metadata).length > 0 ? metadata : null,
  };

  if (mode === 'manual') {
    const v = String(row.code_value || '').trim();
    if (!v) return { ok: false, error: 'code_value is required for manual mode' };
    payload.code_value = v;
    const norm = v.toLowerCase();
    if (batchValueSet && batchValueSet.has(norm)) {
      return { ok: false, error: 'Duplicate code_value within this file' };
    }
    if (batchValueSet) batchValueSet.add(norm);
  }
  if (mode === 'auto') {
    payload.pad_length = parseInt(row.pad_length, 10) || 6;
  }
  if (mode === 'random') {
    payload.random_length = parseInt(row.random_length, 10) || 12;
  }

  return { ok: true, payload };
}

// Walk parsed rows and return [{rowIndex, raw, status: 'ready'|'error', payload?, error?}].
export function validateAll(rows) {
  const seen = new Set();
  return rows.map((raw, i) => {
    const v = validateRow(raw, seen);
    return v.ok
      ? { rowIndex: i, raw, status: 'ready',  payload: v.payload }
      : { rowIndex: i, raw, status: 'error',  error: v.error };
  });
}

// Build a CSV download for failed rows (server-side errors after submit).
// errors: [{ row_index, code_value, error }], rowsRaw: original parsed rows.
export function buildErrorCsv(errors, rowsRaw) {
  const cols = ['row_index', 'error', ...COLUMNS];
  const escape = (v) => {
    if (v == null) return '';
    const s = String(v);
    return /["\n,]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [cols.join(',')];
  errors.forEach((e) => {
    const raw = rowsRaw[e.row_index] || {};
    const cells = [e.row_index, e.error, ...COLUMNS.map((c) => raw[c] ?? '')];
    lines.push(cells.map(escape).join(','));
  });
  return lines.join('\n');
}

export function downloadString(filename, content, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}
