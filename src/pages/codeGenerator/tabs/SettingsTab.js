import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Alert, Avatar, Box, Button, Checkbox, CircularProgress, Divider, FormControl,
  FormControlLabel, Grid, IconButton, InputLabel, MenuItem, Select, Snackbar,
  Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import codeGeneratorService from '../services/codeGeneratorService';
import { CODE_TYPES, CODE_FORMATS } from '../shared/codeTypes';
import useCodePermissions from '../shared/usePermissions';
import { listStockLocationAction } from 'redux/actions/stock_Location_actions';
import { getsessionStorage } from 'pages/common/login/cookies';

const MODE_OPTIONS = [
  { key: 'auto',   label: 'Auto-increment (e.g. PRD000001)' },
  { key: 'manual', label: 'Manual (user types each value)' },
  { key: 'random', label: 'Random (e.g. abc123def456)' },
];

const RESET_OPTIONS = [
  { key: 'never',   label: 'Never reset (continuous)' },
  { key: 'yearly',  label: 'Reset on Jan 1 (PRD-2026-00001 → PRD-2027-00001)' },
  { key: 'monthly', label: 'Reset on the 1st of each month (PRD-202604-001)' },
];

export default function SettingsTab() {
  const { canEdit } = useCodePermissions();
  const dispatch = useDispatch();
  const stocklocation = useSelector((s) => s?.stockLocationReducer?.stocklocation || []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [snack, setSnack] = useState({ open: false, severity: 'success', msg: '' });
  const fileInputRef = useRef(null);

  // Load settings + templates + locations.
  const fetchAll = async () => {
    setLoading(true); setError(null);
    try {
      const [s, t] = await Promise.all([
        codeGeneratorService.getSettings(),
        codeGeneratorService.listTemplates({}),
      ]);
      setSettings(s?.data?.data || {});
      setTemplates(t?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load settings');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => {
    if (!stocklocation || stocklocation.length === 0) {
      // BE auth helper requires the URL employee_id to match the JWT user
      // (see tzk-com-services/src/helpers/auth.js — "User does not match").
      // headerLocationId='null' bypasses the location guard for this list call.
      const empId = getsessionStorage()?.employee_id;
      if (empId) {
        try { dispatch(listStockLocationAction(empId, 'null')); }
        catch (_e) { /* swallow — non-blocking */ }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (patch) => setSettings((s) => ({ ...s, ...patch }));
  const setPrefix = (typeKey, value) => setSettings((s) => ({
    ...s, default_prefixes: { ...s.default_prefixes, [typeKey]: value },
  }));
  const setDefaultTemplate = (typeKey, templateId) => setSettings((s) => ({
    ...s, default_template_per_type: {
      ...s.default_template_per_type,
      [typeKey]: templateId || null,
    },
  }));
  const setDefaultFormat = (typeKey, fmt) => setSettings((s) => ({
    ...s, default_format_per_type: {
      ...(s.default_format_per_type || {}),
      [typeKey]: fmt || null,
    },
  }));

  const onLogoUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set({ company_logo_url: ev.target?.result || '' });
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await codeGeneratorService.updateSettings(settings);
      setSettings(res?.data?.data || settings);
      setSnack({ open: true, severity: 'success', msg: 'Settings saved' });
    } catch (err) {
      setSnack({ open: true, severity: 'error', msg: err?.response?.data?.error || err?.message || 'Save failed' });
    } finally { setSaving(false); }
  };

  if (loading || !settings) {
    return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
  }
  if (error) {
    return <Box sx={{ p: 2 }}><Alert severity="error">{error}</Alert></Box>;
  }

  const templatesForType = (typeKey) => templates.filter(
    (t) => !t.code_type || t.code_type === typeKey,
  );

  const readOnly = !canEdit;

  return (
    <Box sx={{ p: 2 }}>
      {readOnly ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          You have view-only access to settings. Ask an Administrator to grant edit rights.
        </Alert>
      ) : null}

      <Grid container spacing={3}>

        {/* ─────────────────────────────────── Generation rules */}
        <Grid size={12}>
          <Typography variant="subtitle2">Generation rules</Typography>
          <Divider sx={{ mt: 0.5, mb: 1.5 }} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small" disabled={readOnly}>
                <InputLabel>Default mode</InputLabel>
                <Select label="Default mode" value={settings.default_mode || 'auto'}
                  onChange={(e) => set({ default_mode: e.target.value })}>
                  {MODE_OPTIONS.map((m) => <MenuItem key={m.key} value={m.key}>{m.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField fullWidth size="small" type="number" label="Auto-mode pad length"
                value={settings.default_pad_length}
                onChange={(e) => set({ default_pad_length: parseInt(e.target.value, 10) || 6 })}
                inputProps={{ min: 3, max: 12 }} disabled={readOnly} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField fullWidth size="small" type="number" label="Random-mode length"
                value={settings.default_random_length}
                onChange={(e) => set({ default_random_length: parseInt(e.target.value, 10) || 12 })}
                inputProps={{ min: 6, max: 32 }} disabled={readOnly} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField fullWidth size="small" type="number" label="Max quantity per bulk batch"
                value={settings.max_quantity_per_batch}
                onChange={(e) => set({ max_quantity_per_batch: parseInt(e.target.value, 10) || 5000 })}
                inputProps={{ min: 1, max: 5000 }} disabled={readOnly}
                helperText="Server cap is 5000" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth size="small" disabled={readOnly}>
                <InputLabel>Sequence reset policy</InputLabel>
                <Select label="Sequence reset policy" value={settings.sequence_reset_policy || 'never'}
                  onChange={(e) => set({ sequence_reset_policy: e.target.value })}>
                  {RESET_OPTIONS.map((r) => <MenuItem key={r.key} value={r.key}>{r.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl fullWidth size="small" disabled={readOnly}>
                <InputLabel>Default location</InputLabel>
                <Select label="Default location" value={settings.default_location_id || ''}
                  onChange={(e) => set({ default_location_id: e.target.value || null })}>
                  <MenuItem value=""><em>None (ask each time)</em></MenuItem>
                  {(stocklocation || []).map((l) => (
                    <MenuItem key={l.location_id || l.id} value={l.location_id || l.id}>
                      {l.location_name || l.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ height: '100%' }}>
                <FormControlLabel
                  control={<Checkbox checked={!!settings.allow_reuse_inactive}
                    onChange={(e) => set({ allow_reuse_inactive: e.target.checked })}
                    disabled={readOnly} />}
                  label={<Typography variant="body2">Reuse inactive codes</Typography>}
                />
                <FormControlLabel
                  control={<Checkbox checked={!!settings.auto_print_on_generate}
                    onChange={(e) => set({ auto_print_on_generate: e.target.checked })}
                    disabled={readOnly} />}
                  label={<Typography variant="body2">Auto-print after generate</Typography>}
                />
              </Stack>
            </Grid>
          </Grid>
        </Grid>

        {/* ─────────────────────────────────── Per-type defaults */}
        <Grid size={12}>
          <Typography variant="subtitle2">Per-type defaults — prefix, symbol format, template</Typography>
          <Divider sx={{ mt: 0.5, mb: 1.5 }} />
          <Grid container spacing={1.5}>
            {CODE_TYPES.map((t) => {
              const opts = templatesForType(t.key);
              return (
                <Grid size={12} key={t.key}>
                  <Grid container spacing={1.5} alignItems="center">
                    <Grid size={{ xs: 12, sm: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.label}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <TextField fullWidth size="small" label="Prefix"
                        value={settings.default_prefixes?.[t.key] ?? ''}
                        onChange={(e) => setPrefix(t.key, e.target.value)}
                        disabled={readOnly} placeholder={t.defaultPrefix} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <FormControl fullWidth size="small" disabled={readOnly}>
                        <InputLabel>Symbol</InputLabel>
                        <Select label="Symbol"
                          value={settings.default_format_per_type?.[t.key] || ''}
                          onChange={(e) => setDefaultFormat(t.key, e.target.value || null)}>
                          <MenuItem value=""><em>Ask each time</em></MenuItem>
                          {CODE_FORMATS.map((f) => <MenuItem key={f.key} value={f.key}>{f.label}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FormControl fullWidth size="small" disabled={readOnly}>
                        <InputLabel>Default template</InputLabel>
                        <Select label="Default template"
                          value={settings.default_template_per_type?.[t.key] || ''}
                          onChange={(e) => setDefaultTemplate(t.key, e.target.value || null)}>
                          <MenuItem value=""><em>None</em></MenuItem>
                          {opts.map((o) => (
                            <MenuItem key={o.template_id} value={o.template_id}>
                              {o.name} {o.is_default ? '★' : ''}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        {/* ─────────────────────────────────── Printer defaults */}
        <Grid size={12}>
          <Typography variant="subtitle2">Printer defaults</Typography>
          <Divider sx={{ mt: 0.5, mb: 1.5 }} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small" disabled={readOnly}>
                <InputLabel>Printer type</InputLabel>
                <Select label="Printer type" value={settings.default_printer_type || 'thermal'}
                  onChange={(e) => set({ default_printer_type: e.target.value })}>
                  <MenuItem value="thermal">Thermal</MenuItem>
                  <MenuItem value="a4">A4 sheet</MenuItem>
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="png">PNG</MenuItem>
                  <MenuItem value="svg">SVG</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small" disabled={readOnly}>
                <InputLabel>DPI</InputLabel>
                <Select label="DPI" value={settings.default_dpi || 203}
                  onChange={(e) => set({ default_dpi: parseInt(e.target.value, 10) })}>
                  <MenuItem value={203}>203 (standard thermal)</MenuItem>
                  <MenuItem value={300}>300 (hi-res)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField fullWidth size="small" type="number" label="Print log retention (days)"
                value={settings.print_log_retention_days || 365}
                onChange={(e) => set({ print_log_retention_days: parseInt(e.target.value, 10) || 365 })}
                inputProps={{ min: 30, max: 3650 }} disabled={readOnly}
                helperText="BE cleanup job uses this" />
            </Grid>
          </Grid>
        </Grid>

        {/* ─────────────────────────────────── Branding */}
        <Grid size={12}>
          <Typography variant="subtitle2">Branding</Typography>
          <Divider sx={{ mt: 0.5, mb: 1.5 }} />
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={settings.company_logo_url || undefined}
              variant="rounded"
              sx={{ width: 96, height: 64, bgcolor: '#eceff1', color: 'text.disabled', fontSize: 11 }}
            >
              {settings.company_logo_url ? '' : 'No logo'}
            </Avatar>
            <Stack spacing={0.5} sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Used by templates that have the Logo element enabled. Stored inline as a data URL — keep under ~200 KB.
              </Typography>
              <Stack direction="row" spacing={1}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  hidden
                  onChange={(e) => { onLogoUpload(e.target.files?.[0]); e.target.value = ''; }}
                />
                <Button size="small" variant="outlined" startIcon={<UploadFileIcon />}
                  onClick={() => fileInputRef.current?.click()} disabled={readOnly}>
                  Upload logo
                </Button>
                {settings.company_logo_url ? (
                  <Tooltip title="Remove logo">
                    <span><IconButton size="small" disabled={readOnly}
                      onClick={() => set({ company_logo_url: '' })}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton></span>
                  </Tooltip>
                ) : null}
                <TextField size="small" placeholder="…or paste logo URL"
                  value={settings.company_logo_url?.startsWith('data:') ? '' : (settings.company_logo_url || '')}
                  onChange={(e) => set({ company_logo_url: e.target.value })}
                  disabled={readOnly} sx={{ minWidth: 280 }} />
              </Stack>
            </Stack>
          </Stack>
        </Grid>

        <Grid size={12} sx={{ mt: 1, display: 'flex', gap: 1 }}>
          <Button variant="contained" onClick={save} disabled={readOnly || saving}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}>
            {saving ? 'Saving…' : 'Save settings'}
          </Button>
          <Button variant="outlined" onClick={fetchAll} startIcon={<RestartAltIcon />} disabled={saving}>
            Reload
          </Button>
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
