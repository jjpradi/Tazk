import React, { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Checkbox, Chip, CircularProgress, Divider,
  FormControl, FormControlLabel, Grid, IconButton, InputLabel, MenuItem,
  Paper, Select, Slider, Stack, TextField, ToggleButton, ToggleButtonGroup,
  Tooltip, Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

import { CODE_TYPES, CODE_FORMATS } from '../shared/codeTypes';
import { LABEL_PRESETS, findPreset } from '../shared/labelPresets';
import { ELEMENT_KEYS, ELEMENT_LABELS, defaultLayout, mergeWithDefaults } from '../shared/templateLayout';
import LabelPreview from './LabelPreview';
import LabelDesignerCanvas from './LabelDesignerCanvas';

const initial = () => {
  const p = findPreset('thermal-50x25');
  return {
    name: '',
    code_type: '',
    paper_size: p.key,
    width_mm: p.width,
    height_mm: p.height,
    margin_top_mm: 1,
    margin_bottom_mm: 1,
    margin_left_mm: 1,
    margin_right_mm: 1,
    gap_x_mm: p.gap_x,
    gap_y_mm: p.gap_y,
    rows_per_sheet: p.rows,
    cols_per_sheet: p.cols,
    orientation: 'portrait',
    layout_json: defaultLayout(),
    is_default: false,
    previewFormat: 'qrcode',
    canvasZoom: 3,   // canvas magnification (1mm * zoom * 3.78 px)
  };
};

const PREVIEW_SAMPLE = {
  code_value: 'PRD000123',
  display_name: 'Sample Product Name',
  mrp: '₹999',
  price: '₹849',
  batch: 'BATCH-A',
  expiry: 'Exp 12/2027',
};

export default function TemplateEditor({ template, onClose, onSaved }) {
  const open = true; // inline mode — parent decides when to render
  const [values, setValues] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [selectedElement, setSelectedElement] = useState('code');
  const isEdit = !!(template && template.template_id);

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      setValues({
        name: template.name || '',
        code_type: template.code_type || '',
        paper_size: template.paper_size || 'thermal-50x25',
        width_mm: Number(template.width_mm) || 50,
        height_mm: Number(template.height_mm) || 25,
        margin_top_mm: Number(template.margin_top_mm) || 0,
        margin_bottom_mm: Number(template.margin_bottom_mm) || 0,
        margin_left_mm: Number(template.margin_left_mm) || 0,
        margin_right_mm: Number(template.margin_right_mm) || 0,
        gap_x_mm: Number(template.gap_x_mm) || 0,
        gap_y_mm: Number(template.gap_y_mm) || 0,
        rows_per_sheet: parseInt(template.rows_per_sheet, 10) || 1,
        cols_per_sheet: parseInt(template.cols_per_sheet, 10) || 1,
        orientation: template.orientation || 'portrait',
        layout_json: mergeWithDefaults(template.layout_json),
        is_default: !!template.is_default,
        previewFormat: 'qrcode',
        canvasZoom: 3,
      });
    } else {
      setValues(initial());
    }
    setSelectedElement('code');
  }, [open, template, isEdit]);

  const set = (patch) => setValues((v) => ({ ...v, ...patch }));
  const setLayout = (key, patch) => setValues((v) => ({
    ...v, layout_json: { ...v.layout_json, [key]: { ...v.layout_json[key], ...patch } },
  }));
  const setLayoutWhole = (next) => setValues((v) => ({ ...v, layout_json: next }));

  const onPreset = (key) => {
    const p = findPreset(key);
    set({
      paper_size: key,
      width_mm: p.width,
      height_mm: p.height,
      gap_x_mm: p.gap_x,
      gap_y_mm: p.gap_y,
      rows_per_sheet: p.rows,
      cols_per_sheet: p.cols,
    });
  };

  const submit = async () => {
    if (!values.name || !values.name.trim()) return;
    setSubmitting(true);
    try {
      const payload = { ...values, code_type: values.code_type || null, layout_json: values.layout_json };
      delete payload.previewFormat; delete payload.canvasZoom;
      await onSaved(payload, isEdit ? template.template_id : null);
      onClose && onClose();
    } catch (_e) { /* parent toasts */ } finally { setSubmitting(false); }
  };

  const selectedCfg = values.layout_json[selectedElement] || {};
  const selectedMeta = ELEMENT_LABELS[selectedElement] || { label: selectedElement };
  const isSymbol = selectedMeta.isSymbol === true;
  const isLogo = selectedElement === 'logo';

  // Element-properties panel (right of canvas).
  const elementPanel = (
    <Stack spacing={1.25}>
      <Typography variant="subtitle2">{selectedMeta.label} properties</Typography>
      <Box>
        <Tooltip title={selectedCfg.show ? 'Hide on label' : 'Show on label'}>
          <span>
            <IconButton
              size="small"
              disabled={selectedMeta.alwaysShown}
              onClick={() => setLayout(selectedElement, { show: !selectedCfg.show })}
            >
              {selectedCfg.show ? <VisibilityOutlinedIcon fontSize="small" color="primary" /> : <VisibilityOffOutlinedIcon fontSize="small" />}
            </IconButton>
          </span>
        </Tooltip>
        <Typography variant="caption" sx={{ ml: 0.5 }}>
          {selectedCfg.show ? 'Visible' : 'Hidden'}{selectedMeta.alwaysShown ? ' (always)' : ''}
        </Typography>
      </Box>

      <Stack direction="row" spacing={1}>
        <TextField size="small" type="number" label="X (mm)" sx={{ width: 90 }}
          value={selectedCfg.x ?? 0}
          onChange={(e) => setLayout(selectedElement, { x: Number(e.target.value) || 0 })} />
        <TextField size="small" type="number" label="Y (mm)" sx={{ width: 90 }}
          value={selectedCfg.y ?? 0}
          onChange={(e) => setLayout(selectedElement, { y: Number(e.target.value) || 0 })} />
      </Stack>
      <Stack direction="row" spacing={1}>
        <TextField size="small" type="number" label="W (mm)" sx={{ width: 90 }}
          value={selectedCfg.w ?? 4}
          onChange={(e) => setLayout(selectedElement, { w: Number(e.target.value) || 1 })} />
        <TextField size="small" type="number" label="H (mm)" sx={{ width: 90 }}
          value={selectedCfg.h ?? 4}
          onChange={(e) => setLayout(selectedElement, { h: Number(e.target.value) || 1 })} />
      </Stack>

      {isSymbol && (
        <FormControl size="small">
          <InputLabel>Symbol format</InputLabel>
          <Select label="Symbol format" value={selectedCfg.format || ''}
            onChange={(e) => setLayout(selectedElement, { format: e.target.value || null })}>
            <MenuItem value="">Use print-time format</MenuItem>
            <MenuItem value="qrcode">QR code</MenuItem>
            <MenuItem value="barcode">Barcode</MenuItem>
          </Select>
        </FormControl>
      )}

      {!isSymbol && !isLogo && (
        <>
          <Stack direction="row" spacing={1}>
            <TextField size="small" type="number" label="Font (pt)" sx={{ width: 100 }}
              value={selectedCfg.font_size || 8}
              onChange={(e) => setLayout(selectedElement, { font_size: Number(e.target.value) || 8 })} />
            <FormControl size="small" sx={{ width: 110 }}>
              <InputLabel>Weight</InputLabel>
              <Select label="Weight" value={selectedCfg.weight || 400}
                onChange={(e) => setLayout(selectedElement, { weight: e.target.value })}>
                <MenuItem value={400}>Normal</MenuItem>
                <MenuItem value={500}>Medium</MenuItem>
                <MenuItem value={700}>Bold</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <FormControl size="small">
            <InputLabel>Align</InputLabel>
            <Select label="Align" value={selectedCfg.align || 'center'}
              onChange={(e) => setLayout(selectedElement, { align: e.target.value })}>
              <MenuItem value="left">Left</MenuItem>
              <MenuItem value="center">Center</MenuItem>
              <MenuItem value="right">Right</MenuItem>
            </Select>
          </FormControl>
          <TextField size="small" label="Prefix label" placeholder="e.g. MRP, ₹, Exp"
            value={selectedCfg.label || ''}
            onChange={(e) => setLayout(selectedElement, { label: e.target.value })} />
        </>
      )}
    </Stack>
  );

  // Element list (left of canvas) — quick selector + show/hide toggles.
  const elementList = (
    <Stack spacing={0.25}>
      {ELEMENT_KEYS.map((k) => {
        const cfg = values.layout_json[k];
        const meta = ELEMENT_LABELS[k] || { label: k };
        const isActive = selectedElement === k;
        return (
          <Paper
            key={k} variant="outlined"
            onClick={() => setSelectedElement(k)}
            sx={{
              p: 0.75, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5,
              borderColor: isActive ? 'primary.main' : 'divider',
              bgcolor: isActive ? 'rgba(25,118,210,0.06)' : 'transparent',
            }}
          >
            <IconButton
              size="small" disabled={meta.alwaysShown}
              onClick={(e) => { e.stopPropagation(); setLayout(k, { show: !cfg.show }); }}
            >
              {cfg.show ? <VisibilityOutlinedIcon fontSize="small" color="primary" /> : <VisibilityOffOutlinedIcon fontSize="small" />}
            </IconButton>
            <Typography variant="body2" sx={{ flex: 1, fontWeight: isActive ? 600 : 400 }}>
              {meta.label}
            </Typography>
          </Paper>
        );
      })}
    </Stack>
  );

  return (
    <Box sx={{
      height: 'calc(100vh - 70px)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      bgcolor: 'background.default',
    }}>
      {/* Sticky header — title + actions on the right + close X */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        px: 2, py: 1.25,
        borderBottom: '1px solid', borderColor: 'divider',
        bgcolor: 'background.paper',
        flexShrink: 0,
      }}>
        <Typography variant="h6" sx={{ fontSize: '1.05rem' }}>
          {isEdit ? 'Edit template' : 'New template'}
        </Typography>
        {values.name ? (
          <Chip size="small" sx={{ height: 20, ml: 1 }} label={values.name} />
        ) : null}
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} disabled={submitting} size="small">Cancel</Button>
        <Button onClick={submit} variant="contained" size="small"
          disabled={submitting || !values.name.trim()}
          startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <SaveOutlinedIcon />}>
          {submitting ? 'Saving…' : (isEdit ? 'Save changes' : 'Create template')}
        </Button>
        <Tooltip title="Close">
          <IconButton size="small" onClick={onClose} sx={{ ml: 0.5 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Scrollable content */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 2 }}>
        {/* Top row — basics */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField fullWidth size="small" required label="Template name"
              value={values.name} onChange={(e) => set({ name: e.target.value })} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Applies to</InputLabel>
              <Select label="Applies to" value={values.code_type}
                onChange={(e) => set({ code_type: e.target.value })}>
                <MenuItem value="">Any type</MenuItem>
                {CODE_TYPES.map((t) => <MenuItem key={t.key} value={t.key}>{t.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Paper preset</InputLabel>
              <Select label="Paper preset" value={values.paper_size} onChange={(e) => onPreset(e.target.value)}>
                {LABEL_PRESETS.map((p) => <MenuItem key={p.key} value={p.key}>{p.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }}>
            <TextField fullWidth size="small" type="number" label="Width (mm)"
              value={values.width_mm} onChange={(e) => set({ width_mm: Number(e.target.value) })} />
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }}>
            <TextField fullWidth size="small" type="number" label="Height (mm)"
              value={values.height_mm} onChange={(e) => set({ height_mm: Number(e.target.value) })} />
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Orientation</InputLabel>
              <Select label="Orientation" value={values.orientation}
                onChange={(e) => set({ orientation: e.target.value })}>
                <MenuItem value="portrait">Portrait</MenuItem>
                <MenuItem value="landscape">Landscape</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }}>
            <TextField fullWidth size="small" type="number" label="Rows / sheet"
              value={values.rows_per_sheet} onChange={(e) => set({ rows_per_sheet: Number(e.target.value) || 1 })} />
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }}>
            <TextField fullWidth size="small" type="number" label="Cols / sheet"
              value={values.cols_per_sheet} onChange={(e) => set({ cols_per_sheet: Number(e.target.value) || 1 })} />
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }}>
            <ToggleButtonGroup exclusive size="small" color="primary" value={values.previewFormat}
              onChange={(_e, v) => { if (v) set({ previewFormat: v }); }}
              sx={{ '& .MuiToggleButton-root': { textTransform: 'none' }, height: 40 }}>
              {CODE_FORMATS.map((f) => <ToggleButton key={f.key} value={f.key}>{f.label}</ToggleButton>)}
            </ToggleButtonGroup>
          </Grid>
        </Grid>

        {/* Designer canvas + element controls */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Box sx={{ width: 240, flexShrink: 0 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Elements</Typography>
            {elementList}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 0.5, alignItems: 'center' }}>
              <Typography variant="subtitle2">Designer</Typography>
              <Chip size="small" sx={{ height: 20 }} label={`${values.width_mm} × ${values.height_mm} mm`} />
              <Box sx={{ flex: 1 }} />
              <Typography variant="caption">Zoom</Typography>
              <Slider size="small" sx={{ width: 110 }}
                value={values.canvasZoom * 100}
                onChange={(_e, v) => set({ canvasZoom: (Array.isArray(v) ? v[0] : v) / 100 })}
                min={100} max={600} step={50} />
              <Typography variant="caption">{Math.round(values.canvasZoom * 100)}%</Typography>
            </Stack>
            <Box sx={{ p: 2, bgcolor: '#fafafa', border: '1px solid #eceff1', borderRadius: 1, overflow: 'auto' }}>
              <LabelDesignerCanvas
                layout={values.layout_json}
                widthMm={values.width_mm}
                heightMm={values.height_mm}
                format={values.previewFormat}
                sample={PREVIEW_SAMPLE}
                selectedKey={selectedElement}
                onSelect={setSelectedElement}
                onLayoutChange={setLayoutWhole}
                zoom={values.canvasZoom}
              />
            </Box>
            <Alert severity="info" sx={{ mt: 1, py: 0.25 }}>
              Drag elements to move. Drag the bottom-right corner to resize. Click to select.
            </Alert>
          </Box>

          <Box sx={{ width: 260, flexShrink: 0 }}>
            {elementPanel}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }}>Margins &amp; gaps (mm)</Divider>
        <Grid container spacing={1.5}>
          {['margin_top_mm','margin_bottom_mm','margin_left_mm','margin_right_mm'].map((k) => (
            <Grid size={{ xs: 6, sm: 2 }} key={k}>
              <TextField fullWidth size="small" type="number"
                label={k.replace('margin_','').replace('_mm','').replace(/^./, (c) => c.toUpperCase())}
                value={values[k]} onChange={(e) => set({ [k]: Number(e.target.value) })} />
            </Grid>
          ))}
          <Grid size={{ xs: 6, sm: 2 }}>
            <TextField fullWidth size="small" type="number" label="Gap X"
              value={values.gap_x_mm} onChange={(e) => set({ gap_x_mm: Number(e.target.value) })} />
          </Grid>
          <Grid size={{ xs: 6, sm: 2 }}>
            <TextField fullWidth size="small" type="number" label="Gap Y"
              value={values.gap_y_mm} onChange={(e) => set({ gap_y_mm: Number(e.target.value) })} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControlLabel
              control={<Checkbox size="small" checked={values.is_default}
                onChange={(e) => set({ is_default: e.target.checked })} />}
              label={<Typography variant="body2">Set as default for {values.code_type ? `“${values.code_type}”` : 'all types'}</Typography>}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }}>Final preview at print scale</Divider>
        <Box sx={{ display: 'flex', justifyContent: 'center', pb: 2 }}>
          <LabelPreview template={values} format={values.previewFormat} sample={PREVIEW_SAMPLE} zoom={1.4} />
        </Box>
      </Box>
    </Box>
  );
}
