/**
 * Renders a visual preview of each block type in the builder canvas.
 * Shows placeholder names as styled text (not resolved values).
 */
import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

const placeholderStyle = {
    display: 'inline',
    backgroundColor: '#e3f2fd',
    borderRadius: '3px',
    padding: '0 3px',
    fontSize: 'inherit',
    color: '#1565c0',
    fontFamily: 'monospace',
    whiteSpace: 'nowrap',
};

function PH({ children }) {
    return <span style={placeholderStyle}>{children}</span>;
}

function renderPlaceholderText(text) {
    if (!text) return null;
    const parts = text.split(/(\{\{[^}]+\}\})/g);
    return parts.map((part, i) => {
        if (part.startsWith('{{') && part.endsWith('}}')) {
            return <PH key={i}>{part}</PH>;
        }
        return <span key={i}>{part}</span>;
    });
}

function HeaderPreview({ block }) {
    const c = block.content || {};
    const logoEl = c.showLogo ? (
        <Box sx={{ width: 50, height: 40, bgcolor: '#f0f0f0', border: '1px dashed #bbb', borderRadius: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#999', flexShrink: 0 }}>
            LOGO
        </Box>
    ) : null;

    const textEl = (
        <Box sx={{ textAlign: c.showLogo && c.logoPosition === 'left' ? 'left' : (block.styles?.textAlign || 'center'), flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '14px' }}>
                {renderPlaceholderText(c.titleText)}
            </Typography>
            {(c.subtitleLines || []).map((line, i) => (
                <Typography key={i} variant="caption" component="div" sx={{ color: 'text.secondary', fontSize: '10px' }}>
                    {renderPlaceholderText(line)}
                </Typography>
            ))}
        </Box>
    );

    if (c.showLogo && c.logoPosition === 'left') {
        return <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>{logoEl}{textEl}</Box>;
    }
    return (
        <Box sx={{ textAlign: block.styles?.textAlign || 'center' }}>
            {logoEl}
            {textEl}
        </Box>
    );
}

function DocumentInfoPreview({ block }) {
    const c = block.content || {};
    return (
        <Box>
            {(c.fields || []).map((f, i) => (
                <Typography key={i} variant="body2" sx={{ fontSize: '11px' }}>
                    <strong>{f.label}:</strong> {renderPlaceholderText(f.value)}
                </Typography>
            ))}
        </Box>
    );
}

function CustomerInfoPreview({ block }) {
    const c = block.content || {};
    return (
        <Box sx={{ border: '1px dashed #ccc', borderRadius: 1, p: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#888', fontStyle: 'italic' }}>Customer Info</Typography>
            {(c.fields || []).map((f, i) => (
                <Typography key={i} variant="body2" sx={{ fontSize: '11px' }}>
                    <strong>{f.label}:</strong> {renderPlaceholderText(f.value)}
                </Typography>
            ))}
        </Box>
    );
}

function ItemsTablePreview({ block }) {
    const c = block.content || {};
    const cols = c.columns || [];
    return (
        <Box sx={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                <thead>
                    <tr>
                        {cols.map((col, i) => (
                            <th key={i} style={{
                                textAlign: col.align || 'left', borderBottom: '2px solid #333',
                                padding: '2px 4px', fontSize: '9px', fontWeight: 600,
                                width: col.width !== 'auto' ? col.width : undefined,
                            }}>{col.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {cols.map((col, i) => (
                            <td key={i} style={{
                                textAlign: col.align || 'left', padding: '2px 4px',
                                borderBottom: '1px solid #eee',
                            }}>
                                <span style={placeholderStyle}>{col.key}</span>
                            </td>
                        ))}
                    </tr>
                    <tr>
                        <td colSpan={cols.length} style={{ padding: '2px 4px', color: '#999', fontStyle: 'italic', fontSize: '9px' }}>
                            {`... {{#each ${c.loopKey || 'items'}}} rows ...`}
                        </td>
                    </tr>
                </tbody>
            </table>
        </Box>
    );
}

function TaxSummaryPreview({ block }) {
    const c = block.content || {};
    const headers = ['HSN', 'Taxable'];
    if (c.showCGST !== false) headers.push('CGST%', 'CGST');
    if (c.showSGST !== false) headers.push('SGST%', 'SGST');
    if (c.showIGST !== false) headers.push('IGST%', 'IGST');
    headers.push('Tax');
    return (
        <Box sx={{ overflow: 'auto' }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>Tax Summary (HSN-wise)</Typography>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px', marginTop: 2 }}>
                <thead>
                    <tr>{headers.map((h, i) => <th key={i} style={{ borderBottom: '1px solid #333', padding: '1px 3px', fontWeight: 600, textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                    <tr><td colSpan={headers.length} style={{ padding: '2px', color: '#999', fontStyle: 'italic', fontSize: '8px' }}>{'... {{#each tax_summary}} rows ...'}</td></tr>
                </tbody>
            </table>
        </Box>
    );
}

function TotalsPreview({ block }) {
    const c = block.content || {};
    return (
        <Box>
            {(c.rows || []).map((r, i) => (
                <Box key={i} sx={{
                    display: 'flex', justifyContent: 'space-between',
                    fontWeight: r.bold ? 700 : 400, fontSize: r.bold ? '12px' : '11px',
                    borderTop: r.bold ? '1px solid #333' : 'none', pt: r.bold ? 0.5 : 0,
                }}>
                    <span>{r.label}</span>
                    {renderPlaceholderText(r.value)}
                </Box>
            ))}
        </Box>
    );
}

function PaymentsPreview({ block }) {
    const c = block.content || {};
    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#888', fontStyle: 'italic' }}>
                <span>{'{{payment type}}'}</span><span>{'{{amount}}'}</span>
            </Box>
            {(c.rows || []).map((r, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span>{r.label}</span>{renderPlaceholderText(r.value)}
                </Box>
            ))}
        </Box>
    );
}

function SignaturePreview({ block }) {
    const c = block.content || {};
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Box sx={{ textAlign: 'center', width: '40%' }}>
                <Box sx={{ borderBottom: '1px solid #333', height: 20, mb: 0.5 }} />
                <Typography variant="caption">{c.leftLabel || 'Customer Signature'}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', width: '40%' }}>
                <Box sx={{ borderBottom: '1px solid #333', height: 20, mb: 0.5 }} />
                <Typography variant="caption">{renderPlaceholderText(c.rightLabel || 'Authorized Signatory')}</Typography>
            </Box>
        </Box>
    );
}

function TermsPreview({ block }) {
    const c = block.content || {};
    return (
        <Box>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>Terms & Conditions</Typography>
            <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
                {renderPlaceholderText(c.text)}
            </Typography>
        </Box>
    );
}

function BankDetailsPreview({ block }) {
    const c = block.content || {};
    return (
        <Box>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>Bank Details</Typography>
            {c.fields && c.fields.length > 0 ? (
                c.fields.map((f, i) => (
                    <Typography key={i} variant="body2" sx={{ fontSize: '10px' }}>
                        <strong>{f.label}:</strong> {renderPlaceholderText(f.value)}
                    </Typography>
                ))
            ) : (
                <Typography variant="caption" component="div" sx={{ color: '#888' }}>
                    {renderPlaceholderText(c.text) || 'Bank account details'}
                </Typography>
            )}
        </Box>
    );
}

function FooterPreview({ block }) {
    const c = block.content || {};
    return (
        <Box sx={{ textAlign: block.styles?.textAlign || 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {renderPlaceholderText(c.text)}
            </Typography>
        </Box>
    );
}

function CustomTextPreview({ block }) {
    const c = block.content || {};
    return (
        <Box sx={{ fontSize: '11px' }}>
            {renderPlaceholderText(c.html || 'Custom text block')}
        </Box>
    );
}

function DividerPreview() {
    return <Box sx={{ borderTop: '1px dashed #999', my: 0.5 }} />;
}

function SpacerPreview({ block }) {
    return <Box sx={{ height: block.styles?.height || '16px', bgcolor: '#f9f9f9', borderRadius: 0.5 }} />;
}

function ShippingInfoPreview({ block }) {
    const c = block.content || {};
    return (
        <Box sx={{ border: '1px dashed #ccc', borderRadius: 1, p: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#888', fontStyle: 'italic' }}>Ship To</Typography>
            {(c.fields || []).map((f, i) => (
                <Typography key={i} variant="body2" sx={{ fontSize: '11px', fontWeight: f.bold ? 700 : 400 }}>
                    <strong>{f.label}:</strong> {renderPlaceholderText(f.value)}
                </Typography>
            ))}
        </Box>
    );
}

function EInvoicePreview({ block }) {
    const c = block.content || {};
    return (
        <Box sx={{ bgcolor: '#fff8e1', p: 0.5, borderRadius: 1, border: '1px solid #ffe082' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#f57f17' }}>E-Invoice</Typography>
            {(c.fields || []).map((f, i) => (
                <Typography key={i} variant="body2" sx={{ fontSize: '10px' }}>
                    <strong>{f.label}:</strong> {renderPlaceholderText(f.value)}
                </Typography>
            ))}
        </Box>
    );
}

function AmountInWordsPreview({ block }) {
    const c = block.content || {};
    return (
        <Box sx={{ fontStyle: 'italic', fontSize: '11px' }}>
            <strong>{c.prefix || 'Amount in Words: '}</strong>
            {renderPlaceholderText(c.text || '{{totals.amount_in_words}}')}
        </Box>
    );
}

function DeclarationPreview({ block }) {
    const c = block.content || {};
    return (
        <Box>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>{c.title || 'Declaration'}</Typography>
            <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
                {renderPlaceholderText(c.text)}
            </Typography>
        </Box>
    );
}

function QrCodePreview({ block }) {
    const c = block.content || {};
    return (
        <Box sx={{ textAlign: c.alignment || 'right' }}>
            <Box sx={{
                width: 60, height: 60, bgcolor: '#f5f5f5', border: '1px dashed #bbb', borderRadius: 1,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '8px', color: '#999',
            }}>
                QR CODE
            </Box>
            <Typography variant="caption" component="div" sx={{ color: '#999', fontSize: '8px' }}>
                {c.size || '120px'}
            </Typography>
        </Box>
    );
}

function RowPreview({ block }) {
    const c = block.content || {};
    const children = c.children || [];
    const colCount = c.columns || children.length || 2;
    return (
        <Box sx={{ display: 'flex', gap: 1, border: '1px dashed #90caf9', borderRadius: 1, p: 0.5, minHeight: 40 }}>
            {children.length > 0 ? children.map((child, i) => (
                <Box key={i} sx={{ flex: 1, bgcolor: '#fafafa', borderRadius: 0.5, p: 0.5, border: '1px solid #e0e0e0' }}>
                    <BlockRenderer block={child} />
                </Box>
            )) : (
                Array.from({ length: colCount }).map((_, i) => (
                    <Box key={i} sx={{ flex: 1, bgcolor: '#fafafa', borderRadius: 0.5, p: 0.5, textAlign: 'center', border: '1px dashed #e0e0e0' }}>
                        <Typography variant="caption" sx={{ color: '#bbb' }}>Column {i + 1}</Typography>
                    </Box>
                ))
            )}
        </Box>
    );
}

const renderers = {
    header: HeaderPreview,
    company_info: HeaderPreview,
    document_info: DocumentInfoPreview,
    customer_info: CustomerInfoPreview,
    shipping_info: ShippingInfoPreview,
    e_invoice: EInvoicePreview,
    items_table: ItemsTablePreview,
    tax_summary: TaxSummaryPreview,
    totals: TotalsPreview,
    amount_in_words: AmountInWordsPreview,
    payments: PaymentsPreview,
    signature: SignaturePreview,
    declaration: DeclarationPreview,
    terms: TermsPreview,
    bank_details: BankDetailsPreview,
    qr_code: QrCodePreview,
    footer: FooterPreview,
    custom_text: CustomTextPreview,
    divider: DividerPreview,
    spacer: SpacerPreview,
    row: RowPreview,
};

export default function BlockRenderer({ block }) {
    const Comp = renderers[block.type];
    if (!Comp) {
        return <Typography variant="caption" color="error">Unknown block: {block.type}</Typography>;
    }
    return <Comp block={block} />;
}
