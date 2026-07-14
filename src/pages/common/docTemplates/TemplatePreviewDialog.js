import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent,
    Box, Typography, CircularProgress, IconButton, Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import docTemplateService from 'services/docTemplate_services';

const SAMPLE_PAYLOADS = {
    pos_receipt: {
        document: { type: 'pos_receipt', number: 'POS/2025/0001', date: '15/01/2025', sale_time: '02:30 PM', note: '' },
        customer: { name: 'John Smith', company_name: '', phone: '9876543210', email: 'john@example.com', gstin: '33AABCS1234F1ZP', address: '42, MG Road', area: 'Anna Nagar', city: 'Chennai', state: 'Tamil Nadu', zip: '600001' },
        items: [
            { name: 'Wireless Mouse', hsn_code: '84716060', quantity: '2.000', unit_price: '599.00', discount: '0.00', tax_rate: 18, tax_amount: '107.82', cgst: '53.91', sgst: '53.91', igst: null, total: '1305.82' },
            { name: 'USB-C Hub Adapter', hsn_code: '84733010', quantity: '1.000', unit_price: '1299.00', discount: '50.00', tax_rate: 18, tax_amount: '224.82', cgst: '112.41', sgst: '112.41', igst: null, total: '1473.82', serial_numbers: 'SN001, SN002' },
            { name: 'Laptop Stand', hsn_code: '94032090', quantity: '1.000', unit_price: '899.00', discount: '0.00', tax_rate: 18, tax_amount: '161.82', cgst: '80.91', sgst: '80.91', igst: null, total: '1060.82' },
        ],
        totals: { subtotal: '3347.00', tax: '494.46', grand_total: '3841.00', rounded_off: '0.46' },
        payments: { splits: [{ type: 'Cash (INR)', amount: '2000.00' }, { type: 'Card', amount: '1841.00' }], total_received: '3841.00', change_amount: '0.00', paid_amount: '3841.00' },
        location: { name: 'Main Store', address: '123, Business Park', city: 'Chennai', state: 'Tamil Nadu', phone: '044-28170000', email: 'store@example.com', company_name: 'Acme Retail Pvt Ltd' },
        company: { name: 'Acme Retail Pvt Ltd', address: '123, Business Park', state: 'Tamil Nadu', pincode: '600001', gstin: '33AABCA5678G1ZQ', email: 'store@example.com', phone: '044-28170000', logo: '' },
        employee: { sold_by: 'Demo Employee' }
    },
    sales_invoice: {
        document: { type: 'sales_invoice', number: 'INV/2025/0042', date: '15/01/2025', sale_time: '11:00 AM', note: 'Net 30 payment terms' },
        customer: { name: 'Priya Sharma', company_name: 'TechCorp Solutions', phone: '9876543210', email: 'priya@techcorp.in', gstin: '33AABCT1234F1ZP', address: '88, Industrial Estate', area: 'Guindy', city: 'Chennai', state: 'Tamil Nadu', zip: '600032' },
        items: [
            { name: 'Desktop Computer', hsn_code: '84715000', quantity: '3.000', unit_price: '42500.00', discount: '2500.00', tax_rate: 18, tax_amount: '21510.00', cgst: '10755.00', sgst: '10755.00', igst: null, total: '146510.00' },
            { name: '24" LED Monitor', hsn_code: '85285200', quantity: '3.000', unit_price: '12800.00', discount: '0.00', tax_rate: 18, tax_amount: '6912.00', cgst: '3456.00', sgst: '3456.00', igst: null, total: '45312.00' },
            { name: 'Mechanical Keyboard', hsn_code: '84716060', quantity: '5.000', unit_price: '3200.00', discount: '0.00', tax_rate: 18, tax_amount: '2880.00', cgst: '1440.00', sgst: '1440.00', igst: null, total: '18880.00' },
        ],
        totals: { subtotal: '183200.00', tax: '31302.00', grand_total: '210702.00', rounded_off: '' },
        payments: { splits: [{ type: 'Bank Transfer', amount: '210702.00' }], total_received: '210702.00', change_amount: '0.00', paid_amount: '210702.00' },
        location: { name: 'Head Office', address: '456, Tech Park', city: 'Chennai', state: 'Tamil Nadu', phone: '044-28171111', email: 'sales@example.com', company_name: 'Acme Retail Pvt Ltd' },
        company: { name: 'Acme Retail Pvt Ltd', address: '456, Tech Park', state: 'Tamil Nadu', pincode: '600001', gstin: '33AABCA5678G1ZQ', email: 'sales@example.com', phone: '044-28171111', logo: '' },
        employee: { sold_by: 'Demo Employee' }
    }
};

function TemplatePreviewDialog({ open, template, onClose }) {
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open && template) fetchPreview();
        return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); };
    }, [open, template?.template_id]);

    const fetchPreview = async () => {
        setLoading(true);
        setError('');
        setPdfUrl(null);
        try {
            const docType = template.document_type || 'pos_receipt';
            const samplePayload = SAMPLE_PAYLOADS[docType] || SAMPLE_PAYLOADS.pos_receipt;

            const res = await docTemplateService.renderPreview({
                template_id: template.template_id,
                document_type: docType,
                paper_size: template.paper_size || 'A4_portrait',
                output_type: 'print',
                payload: samplePayload
            });

            const { pdfBase64, html } = res.data;
            if (pdfBase64) {
                const byteArray = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                setPdfUrl(URL.createObjectURL(blob));
            } else if (html) {
                const blob = new Blob([html], { type: 'text/html' });
                setPdfUrl(URL.createObjectURL(blob));
            } else {
                setError('No preview returned from server');
            }
        } catch (err) {
            console.error('Template preview failed:', err);
            setError(err?.response?.data?.message || 'Failed to generate preview.');
        }
        setLoading(false);
    };

    const handleClose = () => {
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
            PaperProps={{ sx: { height: '90vh', display: 'flex', flexDirection: 'column' } }}>
            <DialogTitle sx={{
                py: 1, px: 2,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid #e0e0e0'
            }}>
                <Typography variant="subtitle1" fontWeight={600}>
                    Preview: {template?.template_name || 'Template'}
                </Typography>
                <IconButton size="small" onClick={handleClose}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#525659' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, flexDirection: 'column', gap: 1 }}>
                        <CircularProgress size={32} sx={{ color: '#fff' }} />
                        <Typography color="#ccc" variant="body2">Generating preview...</Typography>
                    </Box>
                ) : error ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, flexDirection: 'column', gap: 1 }}>
                        <Typography color="error" variant="body2">{error}</Typography>
                        <Button size="small" variant="outlined" onClick={fetchPreview} sx={{ color: '#fff', borderColor: '#fff' }}>
                            Retry
                        </Button>
                    </Box>
                ) : pdfUrl ? (
                    <iframe
                        src={pdfUrl}
                        style={{ flex: 1, border: 'none', width: '100%' }}
                        title="Template Preview"
                    />
                ) : null}
            </DialogContent>
        </Dialog>
    );
}

export default TemplatePreviewDialog;
