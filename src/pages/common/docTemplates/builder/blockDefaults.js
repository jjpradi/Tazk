/**
 * Default block configurations per document type + paper size.
 * Each block gets a unique ID generated at creation time.
 */
import { PAPER_DEFAULTS, PAPER_WIDTHS } from './builderConstants';

let _counter = 0;
export const generateBlockId = (type) => `blk_${type}_${Date.now()}_${++_counter}`;

const makeBlock = (type, overrides = {}) => ({
    id: generateBlockId(type),
    type,
    enabled: true,
    styles: {},
    content: {},
    ...overrides,
});

// ── POS Receipt blocks ──
const posReceiptBlocks = (paperSize) => {
    const isThermal = paperSize.startsWith('thermal');
    return [
        makeBlock('header', {
            sectionTag: 'logo',
            styles: { textAlign: 'center', marginBottom: '4px' },
            content: {
                showLogo: false,
                titleText: '{{location.company_name}}',
                subtitleLines: [
                    '{{location.address}}',
                    '{{location.city}}, {{location.state}}',
                    'Ph: {{location.phone}} | {{location.email}}',
                ],
            },
        }),
        makeBlock('divider'),
        makeBlock('document_info', {
            styles: { fontSize: isThermal ? '11px' : '12px' },
            content: {
                fields: [
                    { label: 'Invoice', value: '{{document.number}}' },
                    { label: 'Date', value: '{{document.date}} {{document.sale_time}}' },
                    { label: 'Sold By', value: '{{employee.sold_by}}' },
                ],
            },
        }),
        makeBlock('divider'),
        makeBlock('customer_info', {
            content: {
                conditionalWrap: 'customer.name',
                fields: [
                    { label: 'Customer', value: '{{customer.name}}' },
                    { label: 'Ph', value: '{{customer.phone}}', conditional: 'customer.phone' },
                    { label: 'GSTIN', value: '{{customer.gstin}}', conditional: 'customer.gstin', sectionTag: 'gst' },
                ],
            },
        }),
        makeBlock('divider'),
        makeBlock('items_table', {
            styles: { fontSize: isThermal ? '10px' : '11px' },
            content: {
                loopKey: 'items',
                columns: [
                    { key: '@index', label: '#', width: '24px', align: 'center' },
                    { key: 'this.name', label: 'Item', width: 'auto', align: 'left' },
                    { key: 'this.quantity', label: 'Qty', width: '40px', align: 'right' },
                    { key: 'this.unit_price', label: 'Price', width: '55px', align: 'right' },
                    { key: 'this.total', label: 'Amt', width: '55px', align: 'right' },
                ],
                showSerialNumbers: true,
            },
        }),
        makeBlock('divider'),
        makeBlock('totals', {
            content: {
                rows: [
                    { label: 'Subtotal', value: '{{totals.subtotal}}' },
                    { label: 'Tax', value: '{{totals.tax}}' },
                    { label: 'Grand Total', value: '{{totals.grand_total}}', bold: true },
                ],
            },
        }),
        makeBlock('divider'),
        makeBlock('payments', {
            content: {
                loopKey: 'payments.splits',
                rows: [
                    { label: 'Received', value: '{{payments.total_received}}' },
                    { label: 'Change', value: '{{payments.change_amount}}', conditional: 'payments.change_amount' },
                ],
            },
        }),
        makeBlock('footer', {
            sectionTag: 'terms',
            styles: { textAlign: 'center', fontSize: isThermal ? '10px' : '11px', marginTop: '4px' },
            content: { text: '{{settings.footer_note}}' },
        }),
    ];
};

// ── Sales Invoice blocks ──
const salesInvoiceBlocks = () => [
    makeBlock('header', {
        sectionTag: 'logo',
        styles: { textAlign: 'center', marginBottom: '8px', borderBottom: '2px solid #333', paddingBottom: '8px' },
        content: {
            showLogo: true,
            logoPosition: 'left',
            titleText: '{{company.name}}',
            subtitleLines: [
                '{{company.address}}',
                '{{company.state}} - {{company.pincode}}',
                'Ph: {{company.phone}} | Email: {{company.email}}',
                'GSTIN: {{company.gstin}}',
            ],
        },
    }),
    makeBlock('document_info', {
        styles: { marginBottom: '8px', display: 'flex', justifyContent: 'space-between' },
        content: {
            layout: 'two-column',
            fields: [
                { label: 'Invoice No', value: '{{document.number}}' },
                { label: 'Date', value: '{{document.date}}' },
            ],
        },
    }),
    makeBlock('customer_info', {
        styles: { marginBottom: '8px', border: '1px solid #ddd', padding: '8px', borderRadius: '4px' },
        content: {
            layout: 'two-column',
            fields: [
                { label: 'Bill To', value: '{{customer.name}}', bold: true },
                { label: 'Company', value: '{{customer.company_name}}', conditional: 'customer.company_name' },
                { label: 'Address', value: '{{customer.address}}, {{customer.city}}, {{customer.state}} - {{customer.zip}}' },
                { label: 'Phone', value: '{{customer.phone}}' },
                { label: 'Email', value: '{{customer.email}}', conditional: 'customer.email' },
                { label: 'GSTIN', value: '{{customer.gstin}}', conditional: 'customer.gstin', sectionTag: 'gst' },
            ],
        },
    }),
    makeBlock('items_table', {
        content: {
            loopKey: 'items',
            columns: [
                { key: '@index', label: 'Sl.', width: '30px', align: 'center' },
                { key: 'this.name', label: 'Item', width: 'auto', align: 'left' },
                { key: 'this.hsn_code', label: 'HSN', width: '70px', align: 'center' },
                { key: 'this.quantity', label: 'Qty', width: '50px', align: 'right' },
                { key: 'this.unit_code', label: 'Unit', width: '40px', align: 'center' },
                { key: 'this.unit_price', label: 'Rate', width: '70px', align: 'right' },
                { key: 'this.discount', label: 'Disc', width: '60px', align: 'right' },
                { key: 'this.tax_amount', label: 'Tax', width: '60px', align: 'right' },
                { key: 'this.total', label: 'Amount', width: '80px', align: 'right' },
            ],
            showSerialNumbers: true,
        },
    }),
    makeBlock('tax_summary', {
        sectionTag: 'gst',
        content: {
            showSGST: true,
            showCGST: true,
            showIGST: true,
        },
    }),
    makeBlock('totals', {
        styles: { borderTop: '1px solid #333', paddingTop: '4px', marginTop: '4px' },
        content: {
            rows: [
                { label: 'Subtotal', value: '{{totals.subtotal}}' },
                { label: 'Tax', value: '{{totals.tax}}' },
                { label: 'Rounded Off', value: '{{totals.rounded_off}}', conditional: 'totals.rounded_off' },
                { label: 'Grand Total', value: '{{totals.grand_total}}', bold: true, fontSize: '14px' },
            ],
        },
    }),
    makeBlock('payments', {
        content: {
            loopKey: 'payments.splits',
            rows: [
                { label: 'Paid', value: '{{payments.paid_amount}}' },
                { label: 'Received', value: '{{payments.total_received}}' },
                { label: 'Change', value: '{{payments.change_amount}}', conditional: 'payments.change_amount' },
            ],
        },
    }),
    makeBlock('amount_in_words', {
        styles: { marginTop: '4px' },
        content: { text: '{{totals.amount_in_words}}', prefix: 'Amount in Words: ' },
    }),
    makeBlock('shipping_info', {
        styles: { marginBottom: '8px', border: '1px solid #ddd', padding: '8px', borderRadius: '4px' },
        content: {
            conditionalWrap: 'ship_to.name',
            fields: [
                { label: 'Ship To', value: '{{ship_to.name}}', bold: true },
                { label: 'Address', value: '{{ship_to.address}}, {{ship_to.city}}, {{ship_to.state}} - {{ship_to.zip}}' },
                { label: 'Phone', value: '{{ship_to.phone}}', conditional: 'ship_to.phone' },
                { label: 'GSTIN', value: '{{ship_to.gstin}}', conditional: 'ship_to.gstin' },
            ],
        },
    }),
    makeBlock('e_invoice', {
        content: {
            fields: [
                { label: 'IRN', value: '{{document.irn}}' },
                { label: 'Ack No', value: '{{document.ack_no}}' },
                { label: 'Ack Date', value: '{{document.ack_date}}' },
            ],
        },
    }),
    makeBlock('bank_details', {
        sectionTag: 'bank',
        content: {
            fields: [
                { label: 'Bank Name', value: '{{company.bank_name}}' },
                { label: 'Account No', value: '{{company.account_no}}' },
                { label: 'IFSC Code', value: '{{company.ifsc_code}}' },
                { label: 'Branch', value: '{{company.branch_name}}' },
            ],
        },
    }),
    makeBlock('qr_code', {
        content: { placeholder: '{{document.qr_data}}', size: '120px', alignment: 'right' },
    }),
    makeBlock('declaration', {
        styles: { fontSize: '10px', marginTop: '8px' },
        content: { text: '{{settings.declaration_text}}', title: 'Declaration' },
    }),
    makeBlock('terms', {
        sectionTag: 'terms',
        styles: { marginTop: '12px', fontSize: '10px' },
        content: { text: '{{settings.terms_text}}' },
    }),
    makeBlock('signature', {
        sectionTag: 'signature',
        styles: { marginTop: '40px', display: 'flex', justifyContent: 'space-between' },
        content: {
            leftLabel: 'Customer Signature',
            rightLabel: 'Authorized Signatory',
        },
    }),
    makeBlock('footer', {
        styles: { textAlign: 'center', fontSize: '10px', borderTop: '1px solid #ddd', marginTop: '8px', paddingTop: '4px' },
        content: { text: '{{settings.footer_note}}' },
    }),
];

// ── Quotation blocks ──
const quotationBlocks = () => [
    makeBlock('header', {
        sectionTag: 'logo',
        styles: { textAlign: 'center', marginBottom: '8px', borderBottom: '2px solid #333', paddingBottom: '8px' },
        content: {
            showLogo: true,
            logoPosition: 'left',
            titleText: '{{company.name}}',
            subtitleLines: [
                '{{company.address}}',
                '{{company.state}} - {{company.pincode}}',
                'Ph: {{company.phone}} | Email: {{company.email}}',
            ],
        },
    }),
    makeBlock('document_info', {
        content: {
            layout: 'two-column',
            fields: [
                { label: 'Quotation No', value: '{{document.number}}' },
                { label: 'Date', value: '{{document.date}}' },
                { label: 'Reference', value: '{{document.reference}}', conditional: 'document.reference' },
                { label: 'Valid Until', value: '{{document.expiry}}', conditional: 'document.expiry' },
            ],
        },
    }),
    makeBlock('customer_info', {
        styles: { marginBottom: '8px' },
        content: {
            layout: 'two-column',
            fields: [
                { label: 'To', value: '{{customer.name}}', bold: true },
                { label: 'Company', value: '{{customer.company_name}}', conditional: 'customer.company_name' },
                { label: 'Address', value: '{{customer.address}}, {{customer.city}}, {{customer.state}} - {{customer.zip}}' },
                { label: 'Phone', value: '{{customer.phone}}' },
                { label: 'GSTIN', value: '{{customer.gstin}}', conditional: 'customer.gstin', sectionTag: 'gst' },
            ],
        },
    }),
    makeBlock('items_table', {
        content: {
            loopKey: 'items',
            columns: [
                { key: '@index', label: 'Sl.', width: '30px', align: 'center' },
                { key: 'this.product', label: 'Product', width: 'auto', align: 'left' },
                { key: 'this.description', label: 'Description', width: '120px', align: 'left' },
                { key: 'this.quantity', label: 'Qty', width: '50px', align: 'right' },
                { key: 'this.price', label: 'Price', width: '70px', align: 'right' },
                { key: 'this.discount', label: 'Disc', width: '60px', align: 'right' },
                { key: 'this.total', label: 'Total', width: '80px', align: 'right' },
            ],
        },
    }),
    makeBlock('totals', {
        styles: { borderTop: '1px solid #333', paddingTop: '4px' },
        content: {
            rows: [
                { label: 'Subtotal', value: '{{totals.subtotal}}' },
                { label: 'Discount', value: '{{totals.discount}}', conditional: 'totals.discount' },
                { label: 'Grand Total', value: '{{totals.grand_total}}', bold: true },
            ],
        },
    }),
    makeBlock('custom_text', {
        content: {
            html: '<p><strong>Payment Terms:</strong> {{document.payment_terms}}</p><p><strong>Delivery Terms:</strong> {{document.delivery_terms}}</p>',
        },
    }),
    makeBlock('terms', {
        sectionTag: 'terms',
        styles: { marginTop: '12px', fontSize: '10px' },
        content: { text: '{{document.terms}}' },
    }),
    makeBlock('signature', {
        sectionTag: 'signature',
        styles: { marginTop: '40px' },
        content: {
            leftLabel: 'Customer Acceptance',
            rightLabel: 'For {{company.name}}',
        },
    }),
    makeBlock('footer', {
        styles: { textAlign: 'center', fontSize: '10px', marginTop: '8px' },
        content: { text: 'Prepared by: {{employee.created_by}}' },
    }),
];

/**
 * Returns default page styles + blocks for a given document type + paper size.
 */
export function getDefaultBuilderJson(documentType, paperSize) {
    const paperDefaults = PAPER_DEFAULTS[paperSize] || PAPER_DEFAULTS.A4_portrait;
    const paperWidth = PAPER_WIDTHS[paperSize] || '210mm';

    let blocks;
    switch (documentType) {
        case 'pos_receipt':
            blocks = posReceiptBlocks(paperSize);
            break;
        case 'sales_invoice':
            blocks = salesInvoiceBlocks();
            break;
        case 'quotation':
            blocks = quotationBlocks();
            break;
        default:
            blocks = salesInvoiceBlocks();
    }

    return {
        version: 1,
        pageStyles: {
            fontFamily: paperDefaults.fontFamily,
            fontSize: paperDefaults.fontSize,
            lineHeight: paperDefaults.lineHeight,
            color: '#333333',
            paperWidth,
        },
        blocks,
    };
}
