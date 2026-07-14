import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, FormControl, InputLabel, Select, MenuItem, Box,
    Typography, CircularProgress, IconButton, Tooltip
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import docTemplateService from 'services/docTemplate_services';

/**
 * Reusable Print Modal — use from any page:
 *
 * <PrintSelectModal
 *   open={showPrint}
 *   onClose={() => setShowPrint(false)}
 *   documentType="pos_receipt"
 *   documentId={sale_id}
 *   payload={normalizedPayload}
 *   locationId={location_id}
 *   companyId={company_id}
 *   onLegacyPrint={(component) => { ... }}  // for react engine fallback
 * />
 */
function PrintSelectModal({
    open, onClose, documentType, documentId, payload,
    locationId, companyId, onLegacyPrint
}) {
    const [paperSize, setPaperSize] = useState(
        documentType === 'pos_receipt' ? 'thermal_80mm' : 'A4_portrait'
    );
    const [outputType, setOutputType] = useState(
        documentType === 'pos_receipt' ? 'thermal' : 'print'
    );
    const [renderResult, setRenderResult] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const iframeRef = useRef(null);

    // Cleanup blob URL on unmount or change
    useEffect(() => {
        return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); };
    }, [pdfUrl]);

    useEffect(() => {
        if (open && payload) handleRender();
    }, [open, paperSize, outputType]);

    const base64ToBlobUrl = (base64) => {
        const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        return URL.createObjectURL(blob);
    };

    const handleRender = async () => {
        setLoading(true);
        setError('');
        setPdfUrl(null);
        try {
            const res = await docTemplateService.renderPreview({
                document_type: documentType,
                paper_size: paperSize,
                output_type: outputType,
                location_id: locationId,
                company_id: companyId,
                payload
            });
            setRenderResult(res.data);

            // If we got a PDF back (from html→pdf or pdfmake engine), create blob URL for preview
            if (res.data.pdfBase64) {
                const url = base64ToBlobUrl(res.data.pdfBase64);
                setPdfUrl(url);
            }
        } catch (err) {
            setError('No template found for this configuration');
            setRenderResult(null);
        }
        setLoading(false);
    };

    const handlePrint = async () => {
        if (!renderResult) return;

        if (renderResult.pdfBase64) {
            // PDF — open in new tab (browser shows native PDF viewer with print)
            const url = base64ToBlobUrl(renderResult.pdfBase64);
            const printWindow = window.open(url, '_blank');
            // Auto-trigger print after PDF loads
            if (printWindow) {
                printWindow.addEventListener('load', () => {
                    setTimeout(() => printWindow.print(), 500);
                });
            }
        } else if (renderResult.render_engine === 'react') {
            if (onLegacyPrint) onLegacyPrint(renderResult.component);
        }

        // Log render event
        try {
            await docTemplateService.logRender({
                document_type: documentType,
                document_id: documentId,
                template_id: renderResult.template_id,
                template_version: renderResult.version,
                output_type: outputType,
                paper_size: paperSize,
                location_id: locationId,
                company_id: companyId
            });
        } catch (e) { /* non-blocking */ }

        onClose();
    };

    const handleDownload = () => {
        if (!renderResult?.pdfBase64) return;
        const url = base64ToBlobUrl(renderResult.pdfBase64);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${documentType}_${documentId || 'document'}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const paperOptions = documentType === 'pos_receipt'
        ? [{ value: 'thermal_80mm', label: 'Thermal 80mm' }, { value: 'thermal_58mm', label: 'Thermal 58mm' }, { value: 'A4_portrait', label: 'A4 Portrait' }]
        : [{ value: 'A4_portrait', label: 'A4 Portrait' }, { value: 'A4_landscape', label: 'A4 Landscape' }, { value: 'A5_portrait', label: 'A5 Portrait' }];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
            PaperProps={{ sx: { height: '85vh' } }}>
            <DialogTitle sx={{ py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="span">Print Document</Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Paper Size</InputLabel>
                        <Select value={paperSize} label="Paper Size"
                            onChange={(e) => setPaperSize(e.target.value)}>
                            {paperOptions.map(p => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 110 }}>
                        <InputLabel>Output</InputLabel>
                        <Select value={outputType} label="Output"
                            onChange={(e) => setOutputType(e.target.value)}>
                            <MenuItem value="print">Print</MenuItem>
                            <MenuItem value="thermal">Thermal</MenuItem>
                            <MenuItem value="pdf">PDF</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                        <CircularProgress size={32} />
                    </Box>
                ) : error ? (
                    <Box sx={{ p: 3 }}><Typography color="error">{error}</Typography></Box>
                ) : pdfUrl ? (
                    <iframe
                        ref={iframeRef}
                        src={pdfUrl}
                        style={{ flex: 1, border: 'none', width: '100%' }}
                        title="PDF Preview"
                    />
                ) : renderResult?.render_engine === 'react' ? (
                    <Box sx={{ p: 2 }}>
                        <Typography color="text.secondary">Legacy component: {renderResult.component}. Click Print to render.</Typography>
                    </Box>
                ) : (
                    <Box sx={{ p: 2 }}>
                        <Typography color="text.secondary">Select options and preview will load automatically.</Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                {renderResult?.pdfBase64 && (
                    <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownload}>
                        Download PDF
                    </Button>
                )}
                <Button variant="contained" startIcon={<PrintIcon />}
                    onClick={handlePrint} disabled={!renderResult || loading}>
                    Print
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default PrintSelectModal;
