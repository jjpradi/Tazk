import React, { useEffect, useState } from 'react';
import {
  Box, Button, Chip, CircularProgress, Divider, Grid, IconButton, Table,
  TableBody, TableCell, TableHead, TableRow, Tooltip, Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import moment from 'moment';

import LivePreview from './LivePreview';
import PrintDialog from './PrintDialog';
import codeGeneratorService from '../services/codeGeneratorService';
import { buildQrPayloadString } from '../shared/qrPayloadBuilders';

function fmt(d) {
  return d ? moment(d).format('DD-MM-YYYY HH:mm') : '—';
}

function previewValueForRow(row) {
  if (!row) return '';
  if (row.code_format === 'qrcode' && row.qr_payload) {
    try {
      const payload = typeof row.qr_payload === 'string' ? JSON.parse(row.qr_payload) : row.qr_payload;
      const s = buildQrPayloadString(payload);
      if (s) return s;
    } catch (_e) { /* fall through */ }
  }
  return row.code_value || '';
}

export default function CodeDetailDialog({ codeId, onClose, onChanged }) {
  const open = true;
  const [loading, setLoading] = useState(false);
  const [row, setRow] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [busyAction, setBusyAction] = useState(null);
  const [printOpen, setPrintOpen] = useState(false);

  useEffect(() => {
    if (!open || !codeId) return;
    let cancelled = false;
    setLoading(true);
    setLogsLoading(true);
    Promise.all([
      codeGeneratorService.getCodeById(codeId),
      codeGeneratorService.getPrintLogs(codeId, { page: 0, size: 20 }),
    ])
      .then(([detail, logsRes]) => {
        if (cancelled) return;
        setRow(detail?.data?.data || null);
        setLogs(logsRes?.data?.data?.rows || []);
      })
      .catch(() => {
        if (cancelled) return;
        setRow(null); setLogs([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false); setLogsLoading(false);
      });
    return () => { cancelled = true; };
  }, [open, codeId]);

  const refreshLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await codeGeneratorService.getPrintLogs(codeId, { page: 0, size: 20 });
      setLogs(res?.data?.data?.rows || []);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!row) return;
    const next = row.status === 'active' ? 'inactive' : 'active';
    setBusyAction('status');
    try {
      await codeGeneratorService.updateStatus(codeId, next);
      setRow({ ...row, status: next });
      onChanged && onChanged();
    } finally { setBusyAction(null); }
  };

  const handleDelete = async () => {
    if (!row) return;
    if (!window.confirm('Soft-delete this code? It will no longer appear in the registry.')) return;
    setBusyAction('delete');
    try {
      await codeGeneratorService.softDelete(codeId);
      onChanged && onChanged();
      onClose && onClose();
    } finally { setBusyAction(null); }
  };

  const handlePrint = () => setPrintOpen(true);

  const handlePrinted = async () => {
    // After print, refresh detail + logs.
    try {
      const res = await codeGeneratorService.getCodeById(codeId);
      setRow(res?.data?.data || row);
      await refreshLogs();
      onChanged && onChanged();
    } catch (_e) { /* swallow */ }
  };

  const handleCopy = () => {
    if (!row) return;
    navigator.clipboard?.writeText(row.code_value);
  };

  return (
    <Box sx={{
      height: 'calc(100vh - 70px)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      bgcolor: 'background.default',
    }}>
      {/* Sticky header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        px: 2, py: 1.25,
        borderBottom: '1px solid', borderColor: 'divider',
        bgcolor: 'background.paper',
        flexShrink: 0,
      }}>
        <Typography variant="h6" sx={{ fontSize: '1.05rem' }}>Code details</Typography>
        {row?.code_value ? (
          <Chip size="small" sx={{ height: 20, ml: 1, fontFamily: 'monospace' }} label={row.code_value} />
        ) : null}
        <Box sx={{ flex: 1 }} />
        <Button color="error" size="small" disabled={!row || !!busyAction} onClick={handleDelete}>Delete</Button>
        <Button size="small" disabled={!row || !!busyAction} onClick={handleToggleStatus} variant="outlined">
          {row && row.status === 'active' ? 'Deactivate' : 'Activate'}
        </Button>
        <Button size="small" disabled={!row || !!busyAction} onClick={handlePrint}
          variant="contained" startIcon={<PrintOutlinedIcon />}>Print</Button>
        <Tooltip title="Close">
          <IconButton size="small" onClick={onClose} sx={{ ml: 0.5 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Scrollable content */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 2 }}>
        {loading || !row ? (
          <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
        ) : (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 5 }}>
              <LivePreview
                value={previewValueForRow(row)}
                format={row.code_format}
                displayName={row.display_name}
              />
              <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="caption" sx={{ flex: 1, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {row.code_value}
                </Typography>
                <IconButton size="small" onClick={handleCopy}><ContentCopyIcon fontSize="small" /></IconButton>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 7 }}>
              <Grid container spacing={1.5}>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Type</Typography><Typography variant="body2">{row.code_type}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Format</Typography><Typography variant="body2">{row.code_format}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Status</Typography><Box><Chip size="small" label={row.status} color={row.status === 'active' ? 'success' : 'default'} sx={{ height: 20 }} /></Box></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Location</Typography><Typography variant="body2">{row.location_id || '—'}</Typography></Grid>
                <Grid size={12}><Typography variant="caption" color="text.secondary">Display name</Typography><Typography variant="body2">{row.display_name || '—'}</Typography></Grid>
                {row.description ? (
                  <Grid size={12}><Typography variant="caption" color="text.secondary">Description</Typography><Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{row.description}</Typography></Grid>
                ) : null}
                {row.reference_table || row.reference_id ? (
                  <Grid size={12}>
                    <Typography variant="caption" color="text.secondary">Linked record</Typography>
                    <Typography variant="body2">{row.reference_table || '—'} / {row.reference_id || '—'}</Typography>
                  </Grid>
                ) : null}
                <Grid size={6}><Typography variant="caption" color="text.secondary">Print count</Typography><Typography variant="body2">{row.print_count}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Last printed</Typography><Typography variant="body2">{fmt(row.last_printed_at)}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Created</Typography><Typography variant="body2">{fmt(row.createdAt)}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Updated</Typography><Typography variant="body2">{fmt(row.updatedAt)}</Typography></Grid>
              </Grid>
            </Grid>

            <Grid size={12}>
              <Divider sx={{ my: 1 }}>Print history</Divider>
              {logsLoading ? (
                <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}><CircularProgress size={20} /></Box>
              ) : logs.length === 0 ? (
                <Typography variant="caption" color="text.disabled">No prints recorded yet.</Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>When</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell>Printer</TableCell>
                      <TableCell align="right">DPI</TableCell>
                      <TableCell align="right">By</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.map((l) => (
                      <TableRow key={l.log_id}>
                        <TableCell>{fmt(l.printed_at)}</TableCell>
                        <TableCell align="right">{l.quantity}</TableCell>
                        <TableCell>{l.printer_type || '—'}</TableCell>
                        <TableCell align="right">{l.printer_dpi || '—'}</TableCell>
                        <TableCell align="right">{l.printed_by}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Grid>
          </Grid>
        )}
      </Box>

      {printOpen ? (
        <Box sx={{
          position: 'fixed', inset: 0, top: 70, zIndex: 1200,
          bgcolor: 'background.default',
        }}>
          <PrintDialog
            code={row}
            onClose={() => setPrintOpen(false)}
            onPrinted={handlePrinted}
          />
        </Box>
      ) : null}
    </Box>
  );
}
