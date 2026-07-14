import React from 'react';
import {
  Box, Checkbox, FormControl, FormControlLabel, Grid, InputLabel,
  MenuItem, Select, TextField,
} from '@mui/material';
import { QR_PAYLOAD_KINDS } from '../shared/codeTypes';
import { defaultPayload } from '../shared/qrPayloadBuilders';

/**
 * Renders the structured input for a QR payload, switching the field set
 * based on the selected kind (text/url/vcard/wifi/upi/json).
 *
 * Props:
 *   payload:  { kind, value }
 *   onChange: (newPayload) => void
 */
export default function QrPayloadInput({ payload, onChange }) {
  const kind = (payload && payload.kind) || 'text';
  const v = (payload && payload.value) || {};

  const setKind = (k) => onChange(defaultPayload(k));
  const setVal = (patch) => onChange({ kind, value: { ...v, ...patch } });

  const renderFields = () => {
    switch (kind) {
      case 'text':
        return (
          <TextField
            fullWidth size="small" label="Text" placeholder="Any text"
            value={v.text || ''} onChange={(e) => setVal({ text: e.target.value })}
            multiline minRows={2}
          />
        );
      case 'url':
        return (
          <TextField
            fullWidth size="small" label="URL" placeholder="https://example.com"
            type="url" value={v.url || ''} onChange={(e) => setVal({ url: e.target.value })}
          />
        );
      case 'vcard':
        return (
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="Full name" value={v.name || ''} onChange={(e) => setVal({ name: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="Phone" value={v.phone || ''} onChange={(e) => setVal({ phone: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="Email" type="email" value={v.email || ''} onChange={(e) => setVal({ email: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="Organization" value={v.org || ''} onChange={(e) => setVal({ org: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="Title" value={v.title || ''} onChange={(e) => setVal({ title: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="URL" value={v.url || ''} onChange={(e) => setVal({ url: e.target.value })} /></Grid>
          </Grid>
        );
      case 'wifi':
        return (
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="SSID" value={v.ssid || ''} onChange={(e) => setVal({ ssid: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="Password" type="password" value={v.password || ''} onChange={(e) => setVal({ password: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Encryption</InputLabel>
                <Select label="Encryption" value={v.encryption || 'WPA'} onChange={(e) => setVal({ encryption: e.target.value })}>
                  <MenuItem value="WPA">WPA / WPA2</MenuItem>
                  <MenuItem value="WEP">WEP</MenuItem>
                  <MenuItem value="nopass">None</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={<Checkbox size="small" checked={!!v.hidden} onChange={(e) => setVal({ hidden: e.target.checked })} />}
                label="Hidden network"
              />
            </Grid>
          </Grid>
        );
      case 'upi':
        return (
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="UPI ID (vpa)" placeholder="user@bank" value={v.vpa || ''} onChange={(e) => setVal({ vpa: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="Payee name" value={v.name || ''} onChange={(e) => setVal({ name: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="Amount (₹)" type="number" inputProps={{ min: 0 }} value={v.amount || ''} onChange={(e) => setVal({ amount: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth size="small" label="Note" value={v.note || ''} onChange={(e) => setVal({ note: e.target.value })} /></Grid>
          </Grid>
        );
      case 'json':
        return (
          <TextField
            fullWidth size="small" label="JSON" placeholder='{"key":"value"}'
            value={v.json || ''} onChange={(e) => setVal({ json: e.target.value })}
            multiline minRows={4} sx={{ '& textarea': { fontFamily: 'monospace', fontSize: 12 } }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
        <InputLabel>QR content type</InputLabel>
        <Select label="QR content type" value={kind} onChange={(e) => setKind(e.target.value)}>
          {QR_PAYLOAD_KINDS.map((k) => <MenuItem key={k.key} value={k.key}>{k.label}</MenuItem>)}
        </Select>
      </FormControl>
      {renderFields()}
    </Box>
  );
}
