import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert, Box, Chip, CircularProgress, FormControl, IconButton, InputLabel,
  MenuItem, Select, Snackbar, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, TextField, Tooltip, Typography,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import ToggleOffOutlinedIcon from '@mui/icons-material/ToggleOffOutlined';
import ToggleOnOutlinedIcon from '@mui/icons-material/ToggleOnOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import moment from 'moment';

import codeGeneratorService from '../services/codeGeneratorService';
import { CODE_TYPES, CODE_FORMATS } from '../shared/codeTypes';
import CodeDetailDialog from '../components/CodeDetailDialog';
import PrintDialog from '../components/PrintDialog';
import useCodePermissions from '../shared/usePermissions';

function fmt(d) { return d ? moment(d).format('DD-MM-YYYY HH:mm') : '—'; }

export default function RegistryTab() {
  const { canEdit, canDelete } = useCodePermissions();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [search, setSearch] = useState('');
  const [codeType, setCodeType] = useState('');
  const [codeFormat, setCodeFormat] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [printRow, setPrintRow] = useState(null);
  const [snack, setSnack] = useState({ open: false, severity: 'success', msg: '' });
  const debounceRef = useRef(null);

  const fetchData = useCallback(async (overrides = {}) => {
    setLoading(true); setError(null);
    try {
      const params = {
        search: overrides.search ?? search,
        code_type: overrides.code_type ?? codeType,
        code_format: overrides.code_format ?? codeFormat,
        status: overrides.status ?? status,
        page: overrides.page ?? page,
        size: overrides.size ?? size,
      };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const res = await codeGeneratorService.listRegistry(params);
      setRows(res?.data?.data?.rows || []);
      setTotal(res?.data?.data?.total || 0);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load codes');
      setRows([]); setTotal(0);
    } finally { setLoading(false); }
  }, [search, codeType, codeFormat, status, page, size]);

  // Initial + on filter/page/size change (search is debounced separately).
  useEffect(() => { fetchData(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [codeType, codeFormat, status, page, size]);

  // Debounced search.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      fetchData({ page: 0 });
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleToggleStatus = async (row) => {
    const next = row.status === 'active' ? 'inactive' : 'active';
    try {
      await codeGeneratorService.updateStatus(row.code_id, next);
      setRows((rs) => rs.map((r) => (r.code_id === row.code_id ? { ...r, status: next } : r)));
      setSnack({ open: true, severity: 'success', msg: `Code ${next}` });
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Status update failed';
      setSnack({ open: true, severity: err?.response?.status === 409 ? 'warning' : 'error', msg });
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Soft-delete ${row.code_value}?`)) return;
    try {
      await codeGeneratorService.softDelete(row.code_id);
      setRows((rs) => rs.filter((r) => r.code_id !== row.code_id));
      setTotal((t) => Math.max(0, t - 1));
      setSnack({ open: true, severity: 'success', msg: 'Code deleted' });
    } catch (err) {
      setSnack({ open: true, severity: 'error', msg: err?.response?.data?.error || err?.message || 'Delete failed' });
    }
  };

  const handleCopy = (row) => {
    navigator.clipboard?.writeText(row.code_value);
    setSnack({ open: true, severity: 'info', msg: 'Copied' });
  };

  const handlePrint = (row) => setPrintRow(row);

  const handlePrintCompleted = () => {
    // refresh the row's print_count + last_printed_at after print
    fetchData();
  };

  const filtersBar = useMemo(() => (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mb: 1 }}>
      <TextField
        size="small"
        placeholder="Search code or name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ minWidth: 240 }}
      />
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>Type</InputLabel>
        <Select label="Type" value={codeType} onChange={(e) => { setPage(0); setCodeType(e.target.value); }}>
          <MenuItem value="">All</MenuItem>
          {CODE_TYPES.map((t) => <MenuItem key={t.key} value={t.key}>{t.label}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 130 }}>
        <InputLabel>Format</InputLabel>
        <Select label="Format" value={codeFormat} onChange={(e) => { setPage(0); setCodeFormat(e.target.value); }}>
          <MenuItem value="">All</MenuItem>
          {CODE_FORMATS.map((f) => <MenuItem key={f.key} value={f.key}>{f.label}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 130 }}>
        <InputLabel>Status</InputLabel>
        <Select label="Status" value={status} onChange={(e) => { setPage(0); setStatus(e.target.value); }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ flex: 1 }} />
      <Typography variant="caption" color="text.secondary">{total} codes</Typography>
    </Box>
  ), [search, codeType, codeFormat, status, total]);

  // Inline full-page swap — Detail and Print views replace the list while open.
  if (printRow) {
    return (
      <PrintDialog
        code={printRow}
        onClose={() => setPrintRow(null)}
        onPrinted={handlePrintCompleted}
      />
    );
  }
  if (detailId) {
    return (
      <CodeDetailDialog
        codeId={detailId}
        onClose={() => setDetailId(null)}
        onChanged={() => fetchData()}
      />
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {filtersBar}
      {error ? <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert> : null}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Format</TableCell>
              <TableCell>Display name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Prints</TableCell>
              <TableCell>Last printed</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right" sx={{ width: 200 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.disabled' }}>No codes match the current filters.</TableCell></TableRow>
            ) : rows.map((r) => (
              <TableRow key={r.code_id} hover sx={{ opacity: r.status === 'active' ? 1 : 0.6 }}>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{r.code_value}</TableCell>
                <TableCell>{r.code_type}</TableCell>
                <TableCell>{r.code_format}</TableCell>
                <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.display_name || ''}>{r.display_name || '—'}</TableCell>
                <TableCell><Chip size="small" label={r.status} color={r.status === 'active' ? 'success' : 'default'} sx={{ height: 20 }} /></TableCell>
                <TableCell align="right">{r.print_count}</TableCell>
                <TableCell>{fmt(r.last_printed_at)}</TableCell>
                <TableCell>{fmt(r.createdAt)}</TableCell>
                <TableCell align="right">
                  <Tooltip title="View"><IconButton size="small" onClick={() => setDetailId(r.code_id)}><VisibilityOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Copy"><IconButton size="small" onClick={() => handleCopy(r)}><ContentCopyIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Print"><IconButton size="small" onClick={() => handlePrint(r)}><PrintOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title={canEdit ? (r.status === 'active' ? 'Deactivate' : 'Activate') : 'Requires edit permission'}>
                    <span><IconButton size="small" onClick={() => handleToggleStatus(r)} disabled={!canEdit}>
                      {r.status === 'active' ? <ToggleOnOutlinedIcon fontSize="small" color={canEdit ? 'success' : 'disabled'} /> : <ToggleOffOutlinedIcon fontSize="small" />}
                    </IconButton></span>
                  </Tooltip>
                  <Tooltip title={canDelete ? 'Soft delete' : 'Requires delete permission'}>
                    <span><IconButton size="small" onClick={() => handleDelete(r)} disabled={!canDelete}><DeleteOutlineIcon fontSize="small" /></IconButton></span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page}
        rowsPerPage={size}
        onPageChange={(_e, p) => setPage(p)}
        onRowsPerPageChange={(e) => { setSize(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[20, 50, 100]}
        sx={{ '& .MuiToolbar-root': { minHeight: 40 } }}
      />

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
