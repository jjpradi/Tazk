import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, Typography, CircularProgress, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import posSaleService from 'services/posSale_services';
import docTemplateService from 'services/docTemplate_services';

/**
 * Zoho-style PDF Invoice Dialog
 * Shows server-rendered PDF in an iframe with Print/Download actions.
 *
 * <PdfInvoiceDialog
 *   open={true}
 *   onClose={() => {}}
 *   saleId={12345}
 *   invoiceNumber="INV-001"
 *   documentType="pos_receipt"        // or "sales_invoice"
 *   locationId={1}
 *   companyId={392}
 * />
 */
function PdfInvoiceDialog({ open, onClose, saleId, invoiceNumber, documentType = 'pos_receipt', locationId, companyId }) {
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [renderData, setRenderData] = useState(null);

    useEffect(() => {
        if (open && saleId) {
            fetchPdf();
        }
        return () => {
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        };
    }, [open, saleId]);

    const fetchPdf = async () => {
        setLoading(true);
        setError('');
        setPdfUrl(null);
        setRenderData(null);
        try {
            // 1. Fetch normalized payload from sales service
            const payloadRes = documentType === 'pos_receipt'
                ? await posSaleService.getReceiptPayload(saleId)
                : await posSaleService.getSalesInvoicePayload(saleId);

            // 2. Render PDF via template engine (Puppeteer HTML→PDF)
            const renderRes = await docTemplateService.renderPreview({
                document_type: documentType,
                paper_size: 'A4_portrait',
                output_type: 'print',
                location_id: locationId,
                company_id: companyId,
                payload: payloadRes.data
            });

            const { pdfBase64 } = renderRes.data;
            if (pdfBase64) {
                const byteArray = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                setPdfUrl(url);
                setRenderData(renderRes.data);
            } else {
                setError('No PDF returned from server');
            }

            // 3. Log render (non-blocking)
            docTemplateService.logRender({
                document_type: documentType,
                document_id: saleId,
                template_id: renderRes.data.template_id,
                template_version: renderRes.data.version,
                output_type: 'print',
                paper_size: 'A4_portrait',
            }).catch(() => {});

        } catch (err) {
            console.error('PDF render failed:', err);
            setError(err?.response?.data?.message || 'Failed to generate PDF. Please try again.');
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                handlePrint();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, pdfUrl]);

    const handlePrint = () => {
        if (!pdfUrl) return;
        const printWindow = window.open(pdfUrl, '_blank');
        if (printWindow) {
            printWindow.addEventListener('load', () => {
                setTimeout(() => printWindow.print(), 500);
            });
        }
    };

    const handleDownload = () => {
        if (!pdfUrl) return;
        const a = document.createElement('a');
        a.href = pdfUrl;
        a.download = `${invoiceNumber || documentType}_${saleId}.pdf`;
        a.click();
    };

    const handleClose = () => {
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
        setRenderData(null);
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
                    {invoiceNumber || 'Invoice'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                    {/* {pdfUrl && (
                        <>
                            <Button size="small" startIcon={<DownloadIcon />} onClick={handleDownload}>
                                Download
                            </Button>
                            <Button size="small" variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>
                                Print
                            </Button>
                        </>
                    )} */}
                    <IconButton size="small" onClick={handleClose}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 0, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#525659' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, flexDirection: 'column', gap: 1 }}>
                        <CircularProgress size={32} sx={{ color: '#fff' }} />
                        <Typography color="#ccc" variant="body2">Generating PDF...</Typography>
                    </Box>
                ) : error ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, flexDirection: 'column', gap: 1 }}>
                        <Typography color="error" variant="body2">{error}</Typography>
                        <Button size="small" variant="outlined" onClick={fetchPdf} sx={{ color: '#fff', borderColor: '#fff' }}>
                            Retry
                        </Button>
                    </Box>
                ) : pdfUrl ? (
                    <iframe
                        src={pdfUrl}
                        style={{ flex: 1, border: 'none', width: '100%' }}
                        title="Invoice PDF"
                    />
                ) : null}
            </DialogContent>
        </Dialog>
    );
}

export default PdfInvoiceDialog;
