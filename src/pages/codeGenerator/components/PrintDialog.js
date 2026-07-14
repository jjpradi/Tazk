import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert, Box, Button, Chip, CircularProgress, FormControl, IconButton,
  InputLabel, MenuItem, Select, Slider, Snackbar, Stack, TextField,
  ToggleButton, ToggleButtonGroup, Tooltip, Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import ReactToPrint from 'react-to-print';
import { jsPDF } from 'jspdf';

import codeGeneratorService from '../services/codeGeneratorService';
import PrintableLabels from './PrintableLabels';
import { buildQrPayloadString } from '../shared/qrPayloadBuilders';
import { metadataToLabelSample } from '../shared/codeTypeSchemas';

// Build the {sample} fields a label expects from a registry row.
// Reads structured per-type metadata (Stage 7b.1) and maps it onto the
// template's element keys (mrp, price, batch, expiry) via the schema's
// labelMap. Falls back to direct row fields for legacy / non-schema types.
function sampleFromCode(row) {
  if (!row) return {};
  const codeValue = (() => {
    if (row.code_format === 'qrcode' && row.qr_payload) {
      try {
        const p = typeof row.qr_payload === 'string' ? JSON.parse(row.qr_payload) : row.qr_payload;
        const s = buildQrPayloadString(p);
        if (s) return s;
      } catch (_e) { /* fall through */ }
    }
    return row.code_value || '';
  })();
  // Normalize metadata (mysql2 returns JSON columns parsed; some paths string-encode).
  let metadata = row.metadata_json;
  if (typeof metadata === 'string') {
    try { metadata = JSON.parse(metadata); } catch (_e) { metadata = null; }
  }
  const fromMeta = metadataToLabelSample(row.code_type, metadata);
  return {
    code_value: codeValue,
    display_name: row.display_name,
    // Schema-mapped values win; fall back to direct row fields if present (legacy).
    mrp:    fromMeta.mrp    ?? row.mrp,
    price:  fromMeta.price  ?? row.offer_price ?? row.price,
    batch:  fromMeta.batch  ?? row.batch,
    expiry: fromMeta.expiry ?? row.expiry,
  };
}

// Pick the best initial template:
//   1. user-selected default for this code_type (from settings.default_template_per_type)
//   2. template's own is_default=1 for this code_type
//   3. any template applicable to this code_type
//   4. first template
function pickInitialTemplate(templates, codeType, settingsDefaultId) {
  if (!templates || templates.length === 0) return null;
  if (settingsDefaultId) {
    const s = templates.find((t) => t.template_id === settingsDefaultId);
    if (s) return s;
  }
  const def = templates.find((t) => t.is_default && (!t.code_type || t.code_type === codeType));
  if (def) return def;
  const match = templates.find((t) => !t.code_type || t.code_type === codeType);
  if (match) return match;
  return templates[0];
}

export default function PrintDialog({
  code, onClose, onPrinted,
  initialTemplateId = null,
  initialQuantity = null,
  initialMode = null,
}) {
  const open = true;
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [mode, setMode] = useState('single');
  const [quantity, setQuantity] = useState(1);
  const [zoom, setZoom] = useState(1.4);
  const [snack, setSnack] = useState({ open: false, severity: 'info', msg: '' });
  const [companyLogo, setCompanyLogo] = useState(null);
  const printRef = useRef(null);

  // Load templates + settings together when opening.
  useEffect(() => {
    if (!open || !code) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      codeGeneratorService.listTemplates({ code_type: code.code_type }),
      codeGeneratorService.getSettings(),
    ]).then(([tRes, sRes]) => {
      if (cancelled) return;
      const list = tRes?.data?.data || [];
      setTemplates(list);
      const settings = sRes?.data?.data || {};
      const settingsDefault = settings.default_template_per_type?.[code.code_type] || null;
      setCompanyLogo(settings.company_logo_url || null);
      // Caller-supplied initialTemplateId wins; then user-default; then heuristic.
      let pick = null;
      if (initialTemplateId) {
        pick = list.find((t) => t.template_id === initialTemplateId) || null;
      }
      if (!pick) pick = pickInitialTemplate(list, code.code_type, settingsDefault);
      setSelectedTemplateId(pick ? pick.template_id : '');
      // Default mode: caller wins; else multi-column template → sheet;
      // A4 → sheet; thermal single-up → roll; else single.
      if (initialMode) setMode(initialMode);
      else if (pick && parseInt(pick.cols_per_sheet, 10) > 1) setMode('sheet');
      else if (pick?.paper_size?.startsWith('A4')) setMode('sheet');
      else if (pick?.paper_size?.startsWith('thermal')) setMode('roll');
      else setMode('single');
      if (initialQuantity && initialQuantity > 0) setQuantity(initialQuantity);
    }).catch(() => {
      if (!cancelled) { setTemplates([]); setSelectedTemplateId(''); }
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, code]);

  const template = useMemo(
    () => templates.find((t) => t.template_id === selectedTemplateId),
    [templates, selectedTemplateId],
  );

  const sample = useMemo(() => {
    const s = sampleFromCode(code);
    if (companyLogo) s.logo_url = companyLogo;
    return s;
  }, [code, companyLogo]);

  const totalCount = mode === 'single' ? 1 : Math.max(1, parseInt(quantity, 10) || 1);

  // Page dimensions used for both react-to-print's @page rule and the PDF
  // page size. For multi-column thermal rolls (cols > 1) the page is the
  // FULL ribbon width (cols × labelW + (cols-1) × gapX). For 'sheet' mode on
  // A4 paper we leave it to A4. For 'single' / 'roll' it's just the label.
  const isMultiColTemplate = template && parseInt(template.cols_per_sheet, 10) > 1;
  const pageWidthMm = (() => {
    if (!template) return 50;
    const w = Number(template.width_mm) || 50;
    if (mode !== 'sheet') return w;
    if (template.paper_size?.startsWith('A4')) return 210;
    const cols = parseInt(template.cols_per_sheet, 10) || 1;
    const gap  = Number(template.gap_x_mm) || 0;
    return cols * w + Math.max(0, cols - 1) * gap;
  })();
  const pageHeightMm = (() => {
    if (!template) return 25;
    const h = Number(template.height_mm) || 25;
    if (mode === 'sheet' && template.paper_size?.startsWith('A4')) return 297;
    return h;
  })();

  // Log a print event after the user confirms (browser print dialog OK or PDF saved).
  const logPrintEvent = async (printerType) => {
    if (!code) return;
    try {
      await codeGeneratorService.logPrint(code.code_id, {
        quantity: totalCount,
        template_id: template?.template_id || null,
        printer_type: printerType,
      });
      onPrinted && onPrinted();
    } catch (err) {
      // swallow — the print already happened; logging is best-effort
      console.warn('Print log failed', err);
    }
  };

  const exportPdf = () => {
    if (!template) {
      setSnack({ open: true, severity: 'warning', msg: 'Pick a template first' });
      return;
    }
    try {
      const isSheet = mode === 'sheet';
      const isA4 = isSheet && template.paper_size?.startsWith('A4');
      const orientation = (template.orientation === 'landscape' || (!isSheet && pageWidthMm > pageHeightMm)) ? 'landscape' : 'portrait';
      const pdf = isA4
        ? new jsPDF({ unit: 'mm', format: 'a4', orientation })
        : new jsPDF({ unit: 'mm', format: [pageWidthMm, pageHeightMm], orientation });

      // Render the printable DOM as an SVG-free, text-based PDF.
      // For Phase 6 MVP we use jsPDF.html() which captures the live DOM.
      pdf.html(printRef.current, {
        x: 0,
        y: 0,
        html2canvas: { scale: 0.265 }, // ~ mm/px factor
        callback: (doc) => {
          const fname = `code-${code.code_value || 'label'}.pdf`;
          doc.save(fname);
          setSnack({ open: true, severity: 'success', msg: `PDF exported (${totalCount} label${totalCount === 1 ? '' : 's'})` });
          logPrintEvent('pdf');
        },
      });
    } catch (err) {
      setSnack({ open: true, severity: 'error', msg: err?.message || 'PDF export failed' });
    }
  };

  if (!code) return null;

  return (
    <Box sx={{
      height: 'calc(100vh - 70px)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      bgcolor: 'background.default',
    }}>
      {/* Sticky header — print actions live here so they're always reachable */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        px: 2, py: 1.25,
        borderBottom: '1px solid', borderColor: 'divider',
        bgcolor: 'background.paper',
        flexShrink: 0,
      }}>
        <Typography variant="h6" sx={{ fontSize: '1.05rem' }}>Print labels</Typography>
        <Chip size="small" sx={{ height: 20, ml: 1, fontFamily: 'monospace' }} label={code.code_value} />
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} size="small">Cancel</Button>
        <Button startIcon={<PictureAsPdfOutlinedIcon />} disabled={!template} size="small" onClick={exportPdf}>
          Export PDF
        </Button>
        {template ? (
          <ReactToPrint
            trigger={() => (
              <Button variant="contained" size="small" startIcon={<PrintOutlinedIcon />}>Print</Button>
            )}
            content={() => printRef.current}
            documentTitle={`code-${code.code_value || 'label'}`}
            onAfterPrint={() => logPrintEvent(mode === 'sheet' ? 'a4' : (mode === 'roll' ? 'thermal' : 'manual-log'))}
            pageStyle={`@page { margin: 0; size: ${pageWidthMm}mm ${pageHeightMm}mm; } body { -webkit-print-color-adjust: exact; }`}
          />
        ) : null}
        <Tooltip title="Close">
          <IconButton size="small" onClick={onClose} sx={{ ml: 0.5 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Scrollable content */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 2 }}>
        {loading ? (
          <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
        ) : !template ? (
          <Alert severity="info">
            No print template found for this code type. Create one in the
            <strong> Print Templates</strong> tab and try again.
          </Alert>
        ) : (
          <>
            <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Template</InputLabel>
                <Select label="Template" value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}>
                  {templates.map((t) => (
                    <MenuItem key={t.template_id} value={t.template_id}>
                      {t.name} {t.is_default ? '★' : ''} ({t.width_mm}×{t.height_mm} mm)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <ToggleButtonGroup exclusive size="small" color="primary" value={mode}
                onChange={(_e, v) => { if (v) setMode(v); }}
                sx={{ '& .MuiToggleButton-root': { textTransform: 'none', px: 1.5 } }}
              >
                <ToggleButton value="single">Single</ToggleButton>
                <ToggleButton value="sheet">
                  {isMultiColTemplate ? `Multi-column (${template.cols_per_sheet}-up)` : 'A4 sheet'}
                </ToggleButton>
                <ToggleButton value="roll">Single-column roll</ToggleButton>
              </ToggleButtonGroup>

              {mode !== 'single' ? (
                <TextField size="small" type="number" label="Quantity"
                  value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                  inputProps={{ min: 1, max: 1000 }} sx={{ width: 110 }} />
              ) : null}

              <Box sx={{ flex: 1 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 180 }}>
                <Typography variant="caption">Zoom</Typography>
                <Slider size="small" value={zoom * 100}
                  onChange={(_e, v) => setZoom((Array.isArray(v) ? v[0] : v) / 100)}
                  min={50} max={300} step={10}
                  sx={{ width: 110 }} />
                <Typography variant="caption">{Math.round(zoom * 100)}%</Typography>
              </Box>
            </Stack>

            <Box sx={{
              p: 2, bgcolor: '#fafafa', border: '1px solid #eceff1', borderRadius: 1,
              maxHeight: '60vh', overflow: 'auto',
            }}>
              <PrintableLabels
                ref={printRef}
                template={template}
                format={code.code_format}
                sample={sample}
                quantity={totalCount}
                mode={mode}
                zoom={zoom}
              />
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Total {totalCount} label{totalCount === 1 ? '' : 's'} — preview shown at {Math.round(zoom * 100)}%.
              Browser print page size: <strong>{pageWidthMm} × {pageHeightMm} mm</strong>
              {mode === 'sheet' && isMultiColTemplate ? ` (${template.cols_per_sheet}-up: ${template.width_mm} mm × ${template.cols_per_sheet} cols + ${template.gap_x_mm || 0} mm gaps)` : ''}.
              Set your browser's "Margins" to <strong>None</strong> for thermal output.
            </Typography>
          </>
        )}
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
