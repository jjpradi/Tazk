import React, { useEffect, useMemo, useState } from 'react';
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Card,
  Chip, CircularProgress, Divider, FormControl, Grid, IconButton, InputAdornment,
  InputLabel, MenuItem, Select, Slider, Snackbar, Stack, TextField, ToggleButton,
  ToggleButtonGroup, Tooltip, Typography,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';

import { CODE_TYPES, CODE_FORMATS } from '../shared/codeTypes';
import { buildQrPayloadString, defaultPayload } from '../shared/qrPayloadBuilders';
import { getSchemaFor, defaultMetadata, metadataToLabelSample } from '../shared/codeTypeSchemas';
import { mergeWithDefaults } from '../shared/templateLayout';
import LivePreview from '../components/LivePreview';
import LabelPreview from '../components/LabelPreview';
import SheetPreview from '../components/SheetPreview';
import QrPayloadInput from '../components/QrPayloadInput';
import PrintDialog from '../components/PrintDialog';
import codeGeneratorService from '../services/codeGeneratorService';
import useCodePermissions from '../shared/usePermissions';

// Compute the string that will actually be encoded into the symbol.
function computePreviewValue(values) {
  if (values.code_format === 'qrcode' && values.qr_payload) {
    const s = buildQrPayloadString(values.qr_payload);
    if (s) return s;
  }
  if (values.mode === 'manual') return values.code_value || '';
  if (values.mode === 'random') return (values.prefix || '') + (values.random_seed || '');
  const padded = String(1).padStart(values.pad_length || 6, '0');
  return `${values.prefix || ''}${padded}`;
}

const initialValues = () => ({
  mode: 'auto',
  code_type: 'product',
  code_format: 'qrcode',
  prefix: 'PRD',
  pad_length: 6,
  random_length: 12,
  code_value: '',
  random_seed: '',
  display_name: '',
  description: '',
  location_id: '',
  qr_payload: defaultPayload('text'),
  allow_reuse_inactive: false,
  metadata: defaultMetadata('product'),
  print_template_id: '',
  print_quantity: 1,
});

export default function GenerateTab() {
  const { canCreate } = useCodePermissions();
  const [values, setValues] = useState(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [dupCheck, setDupCheck] = useState({ checking: false, duplicate: false, msg: '' });
  const [snack, setSnack] = useState({ open: false, severity: 'success', msg: '' });
  const [lastGenerated, setLastGenerated] = useState(null);
  const [printOpen, setPrintOpen] = useState(false);
  const [printAfterGenerate, setPrintAfterGenerate] = useState(false);
  const [allTemplates, setAllTemplates] = useState([]);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(2);

  const [companySettings, setCompanySettings] = useState(null);

  // Load ALL templates + company settings once on mount.
  useEffect(() => {
    let cancelled = false;
    codeGeneratorService
      .listTemplates({})
      .then((res) => {
        if (cancelled) return;
        setAllTemplates(res?.data?.data || []);
      })
      .catch(() => { if (!cancelled) setAllTemplates([]); });
    codeGeneratorService.getSettings().then((res) => {
      if (cancelled) return;
      const s = res?.data?.data || {};
      setCompanySettings(s);
      // Apply settings as initial defaults — only override fields user hasn't touched.
      setValues((v) => {
        const ct = v.code_type;
        const next = { ...v };
        if (s.default_mode)            next.mode = s.default_mode;
        if (s.default_pad_length)      next.pad_length = s.default_pad_length;
        if (s.default_random_length)   next.random_length = s.default_random_length;
        if (s.default_location_id)     next.location_id = s.default_location_id;
        const fmt = s.default_format_per_type?.[ct];
        if (fmt) next.code_format = fmt;
        const tplId = s.default_template_per_type?.[ct];
        if (tplId) next.print_template_id = tplId;
        const pfx = s.default_prefixes?.[ct];
        if (pfx) next.prefix = pfx;
        return next;
      });
      if (s.auto_print_on_generate) setPrintAfterGenerate(true);
    }).catch(() => { /* settings optional */ });
    return () => { cancelled = true; };
  }, []);

  // When code_type changes from the override (advanced section), reset metadata + linked record.
  // Skip the reset on first mount.
  const codeType = values.code_type;
  useEffect(() => {
    const t = CODE_TYPES.find((x) => x.key === codeType);
    const s = companySettings || {};
    setValues((v) => {
      const next = {
        ...v,
        prefix: s.default_prefixes?.[codeType] || (t ? t.defaultPrefix : v.prefix),
        metadata: defaultMetadata(codeType),
      };
      const fmt = s.default_format_per_type?.[codeType];
      if (fmt) next.code_format = fmt;
      const tplId = s.default_template_per_type?.[codeType];
      if (tplId) next.print_template_id = tplId;
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeType]);

  // When user picks a template, lock code_type to template's code_type (if set).
  const onTemplateChange = (templateId) => {
    const t = allTemplates.find((x) => x.template_id === templateId);
    setValues((v) => {
      const next = { ...v, print_template_id: templateId || '' };
      if (t && t.code_type && t.code_type !== v.code_type) {
        next.code_type = t.code_type;
        const ct = CODE_TYPES.find((x) => x.key === t.code_type);
        if (ct) next.prefix = ct.defaultPrefix;
        next.metadata = defaultMetadata(t.code_type);
      }
      return next;
    });
  };

  // The currently selected template object + its merged layout.
  const selectedTemplate = useMemo(
    () => allTemplates.find((t) => t.template_id === values.print_template_id) || null,
    [allTemplates, values.print_template_id],
  );
  const templateLayout = useMemo(
    () => (selectedTemplate ? mergeWithDefaults(selectedTemplate.layout_json) : null),
    [selectedTemplate],
  );

  // Auto-fit zoom whenever the user picks a different template — A4 sheets
  // need a much lower zoom than single thermal labels to fit the preview pane.
  useEffect(() => {
    if (!selectedTemplate) return;
    const isA4 = selectedTemplate.paper_size?.startsWith?.('A4');
    const cols = parseInt(selectedTemplate.cols_per_sheet, 10) || 1;
    if (isA4) setPreviewZoom(0.7);
    else if (cols > 1) setPreviewZoom(1.6);
    else setPreviewZoom(2.2);
  }, [selectedTemplate?.template_id]);

  const schema = getSchemaFor(values.code_type);

  // Field visibility — drives which inputs the user actually sees.
  // No template → show everything (current behavior). Template → show only
  // fields the template actually renders.
  const visibility = useMemo(() => {
    if (!templateLayout) {
      return {
        showDisplayName: true,
        schemaFieldKeys: schema ? schema.fields.map((f) => f.key) : [],
      };
    }
    const elementShown = (k) => templateLayout[k] && templateLayout[k].show !== false;
    const schemaFieldKeys = schema
      ? schema.fields.filter((f) => {
          // Fields with no labelMap are record-only — hide unless user opens advanced.
          if (!f.labelMap) return false;
          return elementShown(f.labelMap);
        }).map((f) => f.key)
      : [];
    return {
      showDisplayName: elementShown('name'),
      schemaFieldKeys,
    };
  }, [templateLayout, schema]);

  const previewValue = useMemo(() => computePreviewValue(values), [values]);

  // Build the sample object the LabelPreview needs (matches what print-time
  // sampleFromCode builds in PrintDialog, so this preview = print output).
  const previewSample = useMemo(() => {
    const fromMeta = metadataToLabelSample(values.code_type, values.metadata || {});
    return {
      code_value: previewValue || `${values.prefix || ''}${'1'.padStart(values.pad_length || 6, '0')}`,
      display_name: values.display_name,
      mrp:    fromMeta.mrp,
      price:  fromMeta.price,
      batch:  fromMeta.batch,
      expiry: fromMeta.expiry,
      logo_url: companySettings?.company_logo_url || null,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewValue, values.display_name, values.metadata, values.code_type, values.prefix, values.pad_length, companySettings?.company_logo_url]);

  // Debounced duplicate check for manual mode.
  useEffect(() => {
    if (values.mode !== 'manual' || !values.code_value || !String(values.code_value).trim()) {
      setDupCheck({ checking: false, duplicate: false, msg: '' });
      return undefined;
    }
    setDupCheck((d) => ({ ...d, checking: true }));
    const t = setTimeout(async () => {
      try {
        const res = await codeGeneratorService.checkDuplicate({
          code_value: values.code_value,
          allow_reuse_inactive: values.allow_reuse_inactive,
        });
        const dup = !!(res && res.data && res.data.duplicate);
        setDupCheck({
          checking: false,
          duplicate: dup,
          msg: dup
            ? `Code already exists${res.data.existing ? ` (status: ${res.data.existing.status})` : ''}`
            : 'Available',
        });
      } catch (err) {
        setDupCheck({ checking: false, duplicate: false, msg: 'Check failed' });
      }
    }, 350);
    return () => clearTimeout(t);
  }, [values.mode, values.code_value, values.allow_reuse_inactive]);

  const set = (patch) => setValues((v) => ({ ...v, ...patch }));
  const setMeta = (patch) => setValues((v) => ({ ...v, metadata: { ...v.metadata, ...patch } }));

  const reset = () => setValues(initialValues());

  const submit = async (alsoPrint = false) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const metadataClean = {};
      Object.keys(values.metadata || {}).forEach((k) => {
        const v = values.metadata[k];
        if (v != null && v !== '') metadataClean[k] = v;
      });

      const payload = {
        mode: values.mode,
        code_type: values.code_type,
        code_format: values.code_format,
        prefix: values.prefix,
        pad_length: parseInt(values.pad_length, 10) || 6,
        random_length: parseInt(values.random_length, 10) || 12,
        display_name: values.display_name || null,
        description: values.description || null,
        location_id: values.location_id ? parseInt(values.location_id, 10) : null,
        qr_payload: values.code_format === 'qrcode' ? values.qr_payload : null,
        metadata: Object.keys(metadataClean).length > 0 ? metadataClean : null,
        allow_reuse_inactive: values.allow_reuse_inactive,
      };
      if (values.mode === 'manual') payload.code_value = values.code_value;

      const res = await codeGeneratorService.generate(payload);
      const data = res?.data?.data;
      const fresh = {
        ...data,
        display_name: values.display_name || null,
        qr_payload: values.code_format === 'qrcode' ? values.qr_payload : null,
        metadata_json: Object.keys(metadataClean).length > 0 ? metadataClean : null,
      };
      setLastGenerated(fresh);
      setSnack({
        open: true,
        severity: 'success',
        msg: `Code generated: ${data?.code_value}${alsoPrint ? ' — opening print…' : ''}`,
      });
      if (alsoPrint) {
        setPrintAfterGenerate(true);
        setPrintOpen(true);
      }
      // Reset only the value fields; keep type/format/prefix/template for batch entry feel.
      setValues((v) => ({
        ...v,
        code_value: '',
        random_seed: data?.code_value || '',
        display_name: '',
        description: '',
        metadata: defaultMetadata(v.code_type),
      }));
      setDupCheck({ checking: false, duplicate: false, msg: '' });
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Generation failed';
      setSnack({ open: true, severity: err?.response?.status === 409 ? 'warning' : 'error', msg });
    } finally {
      setSubmitting(false);
    }
  };

  const copyValue = () => {
    if (!previewValue) return;
    navigator.clipboard?.writeText(previewValue);
    setSnack({ open: true, severity: 'info', msg: 'Copied to clipboard' });
  };

  const canSubmit = (() => {
    if (!canCreate) return false;
    if (submitting) return false;
    if (!values.code_type) return false;
    if (values.mode === 'manual') {
      if (!values.code_value || !values.code_value.trim()) return false;
      if (dupCheck.duplicate) return false;
    }
    return true;
  })();

  // Render: schema field input.
  const renderSchemaField = (f) => (
    <Grid size={{ xs: 12, sm: 6 }} key={f.key}>
      <TextField
        fullWidth size="small"
        label={f.label}
        type={f.type === 'number' ? 'number' : 'text'}
        value={values.metadata[f.key] ?? ''}
        onChange={(e) => setMeta({ [f.key]: e.target.value })}
        multiline={f.type === 'textarea'}
        minRows={f.type === 'textarea' ? 2 : undefined}
        InputProps={f.prefix ? {
          startAdornment: <InputAdornment position="start">{f.prefix}</InputAdornment>,
        } : undefined}
      />
    </Grid>
  );

  // The schema fields visible in the main form (driven by template).
  const visibleFields = schema
    ? schema.fields.filter((f) => visibility.schemaFieldKeys.includes(f.key))
    : [];
  // The schema fields NOT shown in main form (only in advanced).
  const hiddenSchemaFields = schema
    ? schema.fields.filter((f) => !visibility.schemaFieldKeys.includes(f.key))
    : [];

  // Inline full-page swap when the print view is open (no popup overlay).
  if (printOpen && lastGenerated) {
    return (
      <PrintDialog
        code={lastGenerated}
        onClose={() => { setPrintOpen(false); setPrintAfterGenerate(false); }}
        initialTemplateId={printAfterGenerate ? values.print_template_id : null}
        initialQuantity={printAfterGenerate ? values.print_quantity : null}
        initialMode={printAfterGenerate && values.print_quantity > 1 ? 'roll' : null}
      />
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {!canCreate ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          You have view-only access to the Codes module. Ask an Administrator to grant Generate rights.
        </Alert>
      ) : null}

      <Grid container spacing={2}>
        {/* ────────────────────────────────────────────────────────── */}
        {/* Left column — three-step form                              */}
        {/* ────────────────────────────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 7, lg: 7 }}>

          {/* STEP 1 — Template */}
          <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <Chip size="small" color="primary" label="1" sx={{ height: 22, fontWeight: 700 }} />
              <Typography variant="subtitle2">Choose a template</Typography>
            </Stack>
            <FormControl fullWidth size="small">
              <InputLabel>Print template</InputLabel>
              <Select
                label="Print template"
                value={values.print_template_id || ''}
                onChange={(e) => onTemplateChange(e.target.value || '')}
              >
                <MenuItem value=""><em>None — generate without printing</em></MenuItem>
                {allTemplates.map((t) => (
                  <MenuItem key={t.template_id} value={t.template_id}>
                    {t.name} {t.is_default ? '★' : ''} ({t.code_type || 'any'} · {t.width_mm}×{t.height_mm} mm)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedTemplate ? (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Locked code type: <strong>{selectedTemplate.code_type || 'any'}</strong>.
                The form below shows only the fields this template uses.
              </Typography>
            ) : (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Pick a template to see only the relevant fields below, or leave empty to generate
                a code without printing.
              </Typography>
            )}
          </Card>

          {/* STEP 2 — Label values */}
          <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <Chip size="small" color="primary" label="2" sx={{ height: 22, fontWeight: 700 }} />
              <Typography variant="subtitle2">Fill label values</Typography>
            </Stack>

            <Grid container spacing={2}>
              {visibility.showDisplayName ? (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth size="small" label="Display name"
                    value={values.display_name} onChange={(e) => set({ display_name: e.target.value })} />
                </Grid>
              ) : null}

              {visibleFields.map(renderSchemaField)}

              {/* If template defines no value-bearing fields, hint the user. */}
              {selectedTemplate && visibleFields.length === 0 && !visibility.showDisplayName ? (
                <Grid size={12}>
                  <Alert severity="info" sx={{ py: 0.5 }}>
                    This template uses only the symbol; no extra label values are needed.
                  </Alert>
                </Grid>
              ) : null}
            </Grid>
          </Card>

          {/* STEP 3 — Print */}
          <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <Chip size="small" color="primary" label="3" sx={{ height: 22, fontWeight: 700 }} />
              <Typography variant="subtitle2">Generate &amp; Print</Typography>
            </Stack>

            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth size="small" type="number" label="Labels to print"
                  inputProps={{ min: 1, max: 1000 }}
                  value={values.print_quantity}
                  onChange={(e) => set({ print_quantity: parseInt(e.target.value, 10) || 1 })}
                  disabled={!values.print_template_id}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="medium"
                  onClick={() => submit(true)}
                  disabled={!canSubmit || !values.print_template_id}
                  startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <PrintOutlinedIcon />}
                >
                  Generate &amp; Print
                </Button>
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={() => submit(false)}
                  disabled={!canSubmit}
                >
                  Generate only
                </Button>
                <Button variant="text" size="medium" onClick={reset} startIcon={<RestartAltIcon />}>Reset</Button>
                {lastGenerated ? (
                  <Button
                    variant="text"
                    size="medium"
                    startIcon={<PrintOutlinedIcon />}
                    onClick={() => { setPrintAfterGenerate(true); setPrintOpen(true); }}
                  >
                    Reprint last ({lastGenerated.code_value})
                  </Button>
                ) : null}
              </Grid>
            </Grid>
            {!values.print_template_id ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Pick a template in Step 1 to enable printing. Without a template you can still
                <strong> generate</strong> a code (it'll show in the Code Registry).
              </Typography>
            ) : null}
          </Card>

          {/* ADVANCED — collapsed by default */}
          <Accordion variant="outlined" expanded={advancedOpen} onChange={(_e, x) => setAdvancedOpen(x)} sx={{ '&::before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2" color="text.secondary">Advanced settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small" disabled={!!selectedTemplate}>
                    <InputLabel>Code type</InputLabel>
                    <Select label="Code type" value={values.code_type} onChange={(e) => set({ code_type: e.target.value })}>
                      {CODE_TYPES.map((t) => <MenuItem key={t.key} value={t.key}>{t.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Code format</InputLabel>
                    <Select label="Code format" value={values.code_format} onChange={(e) => set({ code_format: e.target.value })}>
                      {CODE_FORMATS.map((f) => <MenuItem key={f.key} value={f.key}>{f.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={12}>
                  <ToggleButtonGroup exclusive size="small" color="primary"
                    value={values.mode} onChange={(_e, val) => { if (val) set({ mode: val }); }}
                    sx={{ '& .MuiToggleButton-root': { textTransform: 'none', px: 2 } }}
                  >
                    <ToggleButton value="auto">Auto-sequence</ToggleButton>
                    <ToggleButton value="manual">Manual entry</ToggleButton>
                    <ToggleButton value="random">Random secure</ToggleButton>
                  </ToggleButtonGroup>
                </Grid>

                {values.mode === 'auto' && (
                  <>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth size="small" label="Prefix" value={values.prefix}
                        onChange={(e) => set({ prefix: e.target.value })}
                        helperText={`Next: ${values.prefix}${'1'.padStart(values.pad_length || 6, '0')}`} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth size="small" type="number" label="Pad length" inputProps={{ min: 3, max: 12 }}
                        value={values.pad_length} onChange={(e) => set({ pad_length: e.target.value })} />
                    </Grid>
                  </>
                )}
                {values.mode === 'manual' && (
                  <Grid size={12}>
                    <TextField fullWidth size="small" label="Code value" required
                      value={values.code_value} onChange={(e) => set({ code_value: e.target.value })}
                      error={dupCheck.duplicate}
                      helperText={dupCheck.checking ? 'Checking…' : (dupCheck.duplicate ? dupCheck.msg : (values.code_value ? dupCheck.msg : ''))}
                      InputProps={{ endAdornment: dupCheck.checking ? <InputAdornment position="end"><CircularProgress size={16} /></InputAdornment> : undefined }}
                    />
                  </Grid>
                )}
                {values.mode === 'random' && (
                  <>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth size="small" label="Prefix (optional)" value={values.prefix}
                        onChange={(e) => set({ prefix: e.target.value })} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth size="small" type="number" label="Random length" inputProps={{ min: 6, max: 32 }}
                        value={values.random_length} onChange={(e) => set({ random_length: e.target.value })} />
                    </Grid>
                  </>
                )}

                <Grid size={12}>
                  <TextField fullWidth size="small" label="Description" multiline minRows={2}
                    value={values.description} onChange={(e) => set({ description: e.target.value })} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth size="small" type="number" label="Location ID (optional)"
                    value={values.location_id} onChange={(e) => set({ location_id: e.target.value })} />
                </Grid>

                {/* Schema fields hidden by template (record-only or unused). */}
                {hiddenSchemaFields.length > 0 ? (
                  <>
                    <Grid size={12}>
                      <Divider sx={{ my: 0.5 }}>
                        Other {CODE_TYPES.find((t) => t.key === values.code_type)?.label} details
                      </Divider>
                      <Typography variant="caption" color="text.secondary">
                        These won't appear on the chosen template's label, but will be saved with the code for future reference.
                      </Typography>
                    </Grid>
                    {hiddenSchemaFields.map(renderSchemaField)}
                  </>
                ) : null}

                {values.code_format === 'qrcode' && (
                  <>
                    <Grid size={12}><Divider sx={{ my: 0.5 }}>QR payload</Divider></Grid>
                    <Grid size={12}>
                      <QrPayloadInput payload={values.qr_payload} onChange={(p) => set({ qr_payload: p })} />
                    </Grid>
                  </>
                )}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* ────────────────────────────────────────────────────────── */}
        {/* Right column — sticky preview                              */}
        {/* ────────────────────────────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 5, lg: 5 }}>
          <Box sx={{ position: 'sticky', top: 8 }}>
            <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle2">Preview</Typography>
              {selectedTemplate ? (
                <Chip size="small" sx={{ height: 20, ml: 1 }}
                  label={`${selectedTemplate.width_mm} × ${selectedTemplate.height_mm} mm`} />
              ) : null}
            </Stack>

            {selectedTemplate ? (
              // Realistic print preview — renders the exact sheet/ribbon/label
              // that will print, with A4 page outline for A4 templates and
              // multi-column ribbon for thermal n-up.
              <Box sx={{
                p: 1.5, bgcolor: '#eceff1', border: '1px solid #cfd8dc', borderRadius: 1,
                display: 'flex', justifyContent: 'center', overflow: 'auto',
                maxHeight: '70vh',
              }}>
                <SheetPreview
                  template={selectedTemplate}
                  format={values.code_format}
                  sample={previewSample}
                  zoom={previewZoom}
                  fitToWidth
                  maxZoom={Math.max(2.5, previewZoom)}
                />
              </Box>
            ) : (
              // No template — generic symbol preview.
              <LivePreview
                value={previewValue}
                format={values.code_format}
                displayName={values.display_name}
              />
            )}

            {selectedTemplate ? (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ minWidth: 38 }}>Zoom</Typography>
                <Slider size="small" value={previewZoom * 100}
                  onChange={(_e, v) => setPreviewZoom((Array.isArray(v) ? v[0] : v) / 100)}
                  min={50} max={400} step={10} sx={{ flex: 1 }} />
                <Typography variant="caption">{Math.round(previewZoom * 100)}%</Typography>
              </Stack>
            ) : null}

            {previewValue ? (
              <Tooltip title="Copy code">
                <IconButton size="small" onClick={copyValue} sx={{ mt: 0.5 }}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null}

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              {selectedTemplate
                ? 'Preview matches the actual print output. Real values you type appear here as you go.'
                : 'Pick a template in Step 1 to see the exact print preview.'}
            </Typography>
          </Box>
        </Grid>
      </Grid>

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
