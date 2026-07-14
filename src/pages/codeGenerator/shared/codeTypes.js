// Code-type vocabulary used across the Codes module.
// Each entry: key (DB), label (UI), defaultPrefix (Settings can override).

export const CODE_TYPES = [
  { key: 'product',  label: 'Product',  defaultPrefix: 'PRD' },
  { key: 'asset',    label: 'Asset',    defaultPrefix: 'AST' },
  { key: 'employee', label: 'Employee', defaultPrefix: 'EMP' },
  { key: 'customer', label: 'Customer', defaultPrefix: 'CUS' },
  { key: 'vendor',   label: 'Vendor',   defaultPrefix: 'VND' },
  { key: 'location', label: 'Location', defaultPrefix: 'LOC' },
  { key: 'invoice',  label: 'Invoice',  defaultPrefix: 'INV' },
  { key: 'document', label: 'Document', defaultPrefix: 'DOC' },
  { key: 'custom',   label: 'Custom',   defaultPrefix: '' },
];

export const CODE_FORMATS = [
  { key: 'qrcode',  label: 'QR Code' },
  { key: 'barcode', label: 'Barcode' },
];

// QR payload kinds (used inside Generate tab when format = qrcode).
export const QR_PAYLOAD_KINDS = [
  { key: 'text',  label: 'Plain text' },
  { key: 'url',   label: 'URL' },
  { key: 'vcard', label: 'Contact (vCard)' },
  { key: 'wifi',  label: 'Wi-Fi credentials' },
  { key: 'upi',   label: 'Payment / UPI link' },
  { key: 'json',  label: 'Custom JSON' },
];
