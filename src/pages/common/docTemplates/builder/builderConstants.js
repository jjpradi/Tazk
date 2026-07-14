/**
 * Block type registry, font options, color presets for the Visual Template Builder
 */

export const BLOCK_TYPES = {
    row: { label: 'Row / Columns', icon: 'ViewColumn', sectionTag: null, description: 'Place blocks side by side (2-3 columns)' },
    header: { label: 'Header', icon: 'Title', sectionTag: 'logo', description: 'Company name, logo, address' },
    company_info: { label: 'Company Info', icon: 'Business', sectionTag: 'logo', description: 'Full company details' },
    customer_info: { label: 'Customer Info', icon: 'Person', sectionTag: null, description: 'Customer name, address, contact' },
    shipping_info: { label: 'Ship To', icon: 'LocalShipping', sectionTag: null, description: 'Shipping address details' },
    document_info: { label: 'Document Info', icon: 'Description', sectionTag: null, description: 'Invoice/receipt number, date' },
    e_invoice: { label: 'E-Invoice', icon: 'VerifiedUser', sectionTag: null, description: 'IRN, Ack No, Ack Date' },
    items_table: { label: 'Items Table', icon: 'TableChart', sectionTag: null, description: 'Line items with columns' },
    tax_summary: { label: 'Tax Summary', icon: 'Receipt', sectionTag: 'gst', description: 'HSN-wise tax breakdown table' },
    totals: { label: 'Totals', icon: 'Calculate', sectionTag: null, description: 'Subtotal, tax, grand total' },
    amount_in_words: { label: 'Amount in Words', icon: 'Abc', sectionTag: null, description: 'Grand total in words' },
    payments: { label: 'Payments', icon: 'Payment', sectionTag: null, description: 'Payment splits and change' },
    signature: { label: 'Signature', icon: 'Draw', sectionTag: 'signature', description: 'Signature line' },
    declaration: { label: 'Declaration', icon: 'Policy', sectionTag: null, description: 'Declaration / disclaimer text' },
    terms: { label: 'Terms & Conditions', icon: 'Gavel', sectionTag: 'terms', description: 'Terms text' },
    bank_details: { label: 'Bank Details', icon: 'AccountBalance', sectionTag: 'bank', description: 'Bank account info' },
    qr_code: { label: 'QR Code', icon: 'QrCode2', sectionTag: null, description: 'QR code for e-invoice / UPI' },
    footer: { label: 'Footer', icon: 'CallToAction', sectionTag: null, description: 'Footer note' },
    custom_text: { label: 'Custom Text', icon: 'TextFields', sectionTag: null, description: 'Free-form text block' },
    divider: { label: 'Divider', icon: 'HorizontalRule', sectionTag: null, description: 'Horizontal line' },
    spacer: { label: 'Spacer', icon: 'SpaceBar', sectionTag: null, description: 'Vertical space' },
};

export const FONT_FAMILIES = [
    { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
    { value: "'Courier New', Courier, monospace", label: 'Courier New' },
    { value: "'Times New Roman', Times, serif", label: 'Times New Roman' },
    { value: "'Segoe UI', Tahoma, sans-serif", label: 'Segoe UI' },
    { value: 'Verdana, Geneva, sans-serif', label: 'Verdana' },
    { value: "'Trebuchet MS', sans-serif", label: 'Trebuchet MS' },
    { value: 'Georgia, serif', label: 'Georgia' },
];

export const FONT_SIZES = ['8px', '9px', '10px', '11px', '12px', '13px', '14px', '16px', '18px', '20px', '24px'];

export const COLOR_PRESETS = [
    '#000000', '#333333', '#555555', '#888888', '#aaaaaa',
    '#1976d2', '#388e3c', '#d32f2f', '#f57c00', '#7b1fa2',
    '#ffffff', '#f5f5f5', '#e0e0e0', '#fff3e0', '#e3f2fd',
];

export const PAPER_WIDTHS = {
    thermal_80mm: '72mm',
    thermal_58mm: '48mm',
    A4_portrait: '210mm',
    A4_landscape: '297mm',
    A5_portrait: '148mm',
    A5_landscape: '210mm',
};

export const PAPER_DEFAULTS = {
    thermal_80mm: { fontFamily: "'Courier New', Courier, monospace", fontSize: '11px', lineHeight: '1.3' },
    thermal_58mm: { fontFamily: "'Courier New', Courier, monospace", fontSize: '9px', lineHeight: '1.2' },
    A4_portrait: { fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '12px', lineHeight: '1.4' },
    A4_landscape: { fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '12px', lineHeight: '1.4' },
    A5_portrait: { fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '11px', lineHeight: '1.3' },
    A5_landscape: { fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '11px', lineHeight: '1.3' },
};

export const ALIGNMENT_OPTIONS = ['left', 'center', 'right'];

// Placeholder sections for grouping in the palette
export const PLACEHOLDER_SECTIONS = {
    document: 'Document',
    customer: 'Customer',
    items: 'Line Items',
    totals: 'Totals',
    payments: 'Payments',
    location: 'Location',
    company: 'Company',
    employee: 'Employee',
    shipping: 'Shipping',
    contact_person: 'Contact Person',
};
