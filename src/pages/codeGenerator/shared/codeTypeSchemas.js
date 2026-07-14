// Per-type metadata schema. The Generate form renders one input per field;
// values are collected into a metadata_json blob on the API request and
// surfaced at print-time via LabelPreview.
//
// Each field:
//   key:        DB key inside metadata_json
//   label:      UI label
//   type:       'string' | 'number' | 'date' | 'textarea'
//   prefix:     optional UI hint (e.g. '₹' rendered as input adornment)
//   required:   if true, generate disables until provided
//   labelMap:   maps THIS metadata field onto a template element key (e.g. 'mrp')
//               so existing element-based templates pick up the value automatically.
//
// Stage 7b.1: Product schema only. Other types fall back to display_name only
// (current behavior — no regression).

export const CODE_TYPE_SCHEMAS = {
  product: {
    fields: [
      { key: 'mrp',         label: 'MRP',          type: 'number', prefix: '₹', labelMap: 'mrp' },
      { key: 'offer_price', label: 'Offer Price',  type: 'number', prefix: '₹', labelMap: 'price' },
      { key: 'brand',       label: 'Brand',        type: 'string' },
      { key: 'batch',       label: 'Batch / Serial', type: 'string', labelMap: 'batch' },
      { key: 'expiry',      label: 'Expiry',       type: 'string', labelMap: 'expiry' },
    ],
  },
  asset: {
    fields: [
      { key: 'asset_tag',      label: 'Asset Tag',     type: 'string',                     labelMap: 'mrp' },
      { key: 'owner',          label: 'Owner / Assignee', type: 'string',                  labelMap: 'price' },
      { key: 'department',     label: 'Department',    type: 'string',                     labelMap: 'batch' },
      { key: 'warranty_until', label: 'Warranty until', type: 'string',                    labelMap: 'expiry' },
      { key: 'category',       label: 'Category',      type: 'string' },
    ],
  },
  employee: {
    fields: [
      { key: 'emp_id',         label: 'Employee ID',   type: 'string',                     labelMap: 'mrp' },
      { key: 'designation',    label: 'Designation',   type: 'string',                     labelMap: 'price' },
      { key: 'department',     label: 'Department',    type: 'string',                     labelMap: 'batch' },
      { key: 'joining_date',   label: 'Joining date',  type: 'string',                     labelMap: 'expiry' },
      { key: 'phone',          label: 'Contact phone', type: 'string' },
    ],
  },
  customer: {
    fields: [
      { key: 'phone',          label: 'Phone',         type: 'string',                     labelMap: 'mrp' },
      { key: 'email',          label: 'Email',         type: 'string',                     labelMap: 'price' },
      { key: 'city',           label: 'City',          type: 'string',                     labelMap: 'batch' },
      { key: 'gstin',          label: 'GSTIN',         type: 'string',                     labelMap: 'expiry' },
      { key: 'loyalty_tier',   label: 'Loyalty tier',  type: 'string' },
    ],
  },
  vendor: {
    fields: [
      { key: 'gstin',          label: 'GSTIN',         type: 'string',                     labelMap: 'mrp' },
      { key: 'contact',        label: 'Contact',       type: 'string',                     labelMap: 'price' },
      { key: 'city',           label: 'City',          type: 'string',                     labelMap: 'batch' },
      { key: 'payment_terms',  label: 'Payment terms', type: 'string',                     labelMap: 'expiry' },
      { key: 'category',       label: 'Category',      type: 'string' },
    ],
  },
  location: {
    fields: [
      { key: 'address',        label: 'Address',       type: 'textarea',                   labelMap: 'mrp' },
      { key: 'city',           label: 'City',          type: 'string',                     labelMap: 'price' },
      { key: 'pincode',        label: 'PIN code',      type: 'string',                     labelMap: 'batch' },
      { key: 'manager',        label: 'Branch manager', type: 'string',                    labelMap: 'expiry' },
      { key: 'branch_type',    label: 'Branch type',   type: 'string' },
    ],
  },
  invoice: {
    fields: [
      { key: 'invoice_date',   label: 'Invoice date',  type: 'string',                     labelMap: 'mrp' },
      { key: 'customer_name',  label: 'Customer',      type: 'string',                     labelMap: 'price' },
      { key: 'amount',         label: 'Amount',        type: 'number', prefix: '₹',        labelMap: 'batch' },
      { key: 'due_date',       label: 'Due date',      type: 'string',                     labelMap: 'expiry' },
      { key: 'gst_amount',     label: 'GST amount',    type: 'number', prefix: '₹' },
    ],
  },
  document: {
    fields: [
      { key: 'doc_type',       label: 'Document type', type: 'string',                     labelMap: 'mrp' },
      { key: 'doc_date',       label: 'Date',          type: 'string',                     labelMap: 'price' },
      { key: 'author',         label: 'Author',        type: 'string',                     labelMap: 'batch' },
      { key: 'version',        label: 'Version',       type: 'string',                     labelMap: 'expiry' },
      { key: 'classification', label: 'Classification', type: 'string' },
    ],
  },
  custom: {
    fields: [
      { key: 'field_1',        label: 'Custom field 1', type: 'string',                    labelMap: 'mrp' },
      { key: 'field_2',        label: 'Custom field 2', type: 'string',                    labelMap: 'price' },
      { key: 'field_3',        label: 'Custom field 3', type: 'string',                    labelMap: 'batch' },
      { key: 'field_4',        label: 'Custom field 4', type: 'string',                    labelMap: 'expiry' },
      { key: 'notes',          label: 'Notes',          type: 'textarea' },
    ],
  },
};

export function getSchemaFor(codeType) {
  return CODE_TYPE_SCHEMAS[codeType] || null;
}

// Build the empty default object for a schema so the form has all keys present.
export function defaultMetadata(codeType) {
  const schema = getSchemaFor(codeType);
  if (!schema) return {};
  const out = {};
  schema.fields.forEach((f) => { out[f.key] = ''; });
  return out;
}

// Map metadata to label-element keys so templates light up automatically.
// Returns { mrp: '999', price: '849', batch: 'B-1', expiry: '12/27', ... }.
// Anything without a labelMap is dropped from the label sample but stays in
// metadata for record-keeping.
export function metadataToLabelSample(codeType, metadata) {
  const schema = getSchemaFor(codeType);
  if (!schema || !metadata) return {};
  const out = {};
  schema.fields.forEach((f) => {
    if (!f.labelMap) return;
    if (metadata[f.key] != null && metadata[f.key] !== '') {
      // For numeric fields with prefix (₹), prepend it for visual labels.
      out[f.labelMap] = f.prefix
        ? `${f.prefix}${metadata[f.key]}`
        : String(metadata[f.key]);
    }
  });
  return out;
}
